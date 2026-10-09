"""Bitlings: оқушы кодын орындап, әр қадамды жазып алатын модуль.

Pyodide ішінде жұмыс істейді: run(code, cfg_json) -> JSON жол.
Нәтижедегі "frames" тізімі браузерде анимация ретінде қайта ойнатылады.
"""
import ast
import builtins
import json
import sys

MAX_FRAMES = 3000
FILENAME = "<kod>"
_TR = {}  # орысша сөздік (JS жағы толтырады)


def T(s):
    """Хабарды таңдалған тілге аудару (қазақша — өзгеріссіз)."""
    return _TR.get(s, s)


DIRS = [(0, -1), (1, 0), (0, 1), (-1, 0)]  # жоғары, оңға, төмен, солға


class RobotError(Exception):
    """Робот дұрыс емес әрекет жасағанда көтеріледі."""


class _Stop(BaseException):
    """Қадам саны шектен асқанда бағдарламаны тоқтатады."""


def _clip(value, n=40):
    text = str(value)
    return text if len(text) <= n else text[: n - 1] + "…"


def _line_of(exc):
    tb, line = exc.__traceback__, None
    while tb is not None:
        if tb.tb_frame.f_code.co_filename == FILENAME:
            line = tb.tb_lineno
        tb = tb.tb_next
    return line


def _src_line(code, line):
    """Қате шыққан жолдың мәтіні (бос орындарсыз), клиентке көрсету үшін."""
    if not line:
        return None
    lines = code.splitlines()
    if 1 <= line <= len(lines):
        return lines[line - 1].strip()[:120]
    return None


def _suggest(word, candidates):
    """Қате жазылған атқа ұқсас дұрыс атты табу: 'pritn' -> 'print'."""
    import difflib
    pool = [c for c in candidates if not str(c).startswith("__")]
    m = difflib.get_close_matches(str(word), pool, n=1, cutoff=0.72)
    return m[0] if m else None


def _describe_syntax(e, code=""):
    text = e.msg or ""
    low = text.lower()
    src = _src_line(code, e.lineno) or ""
    tip = None
    if "invalid character" in low or any(ch in src for ch in "\u201c\u201d\u2018\u2019\u00ab\u00bb"):
        msg = T("Кодта әдемі (қисық) тырнақша не басқа бөгде таңба тұр.")
        tip = (T("Кодта тек тік тырнақша қолдан: \" \" не ' '. Телефонда жиі « » “ ” шығып кетеді. "
               "Таңбаны өшіріп, қайта жаз."))
    elif "unexpected indent" in low:
        msg = T("Бұл жолдың алдында артық бос орын тұр.")
        tip = T("Егер алдыңғы жол ':' белгісімен бітпесе, келесі жол шегінбеуі керек. Артық бос орынды өшір.")
    elif "unindent does not match" in low:
        msg = T("Шегіністер бір-біріне сәйкес келмейді.")
        tip = T("Бір блоктағы барлық жолдың алдында бірдей бос орын саны (мысалы, 4) болуы керек. Tab пен бос орынды араластырма.")
    elif isinstance(e, IndentationError) or "expected an indented block" in low or "indent" in low:
        msg = T("Шегініс жетіспейді: for, if, while, def жолынан кейінгі жол ішке кіруі керек.")
        tip = T("Келесі жолдың алдына 4 бос орын қой. Мысалы:\nfor i in range(3):\n    print(i)")
    elif "expected ':'" in low:
        msg = T("Жолдың соңында ':' белгісі жетіспейді.")
        tip = T("if, elif, else, for, while, def жолдарының соңына қос нүкте қой: if x > 3:")
    elif "never closed" in low:
        import re
        m = re.search(r"'(.)' was never closed", text)
        br = m.group(1) if m else "("
        msg = T("'%s' жақшасы ашылды, бірақ жабылмады.") % br
        tip = T("Қарсы жақшаны қой: %s. Ашылған жақша саны мен жабылғаны тең болуы керек.") % {"(": ")", "[": "]", "{": "}"}.get(br, ")")
    elif "unterminated string" in low or "unterminated triple" in low:
        msg = T("Тырнақша жабылмаған.")
        tip = T("Мәтіннің басында да, соңында да бірдей тырнақша тұруы керек: print(\"Сәлем\")")
    elif "unmatched" in low:
        msg = T("Артық жабық жақша тұр.")
        tip = T("Оны өшір, не оған сәйкес ашық жақшаны қой.")
    elif "maybe you meant '=='" in low or ("invalid syntax" in low and src.startswith(("if ", "elif ", "while ")) and "=" in src and "==" not in src and "<=" not in src and ">=" not in src and "!=" not in src):
        msg = T("Шартта салыстыру үшін == жазу керек, = емес.")
        tip = T("= — қорапқа мән беру. Салыстыру үшін екі теңдік: if x == 5:")
    elif "missing parentheses in call to 'print'" in low:
        msg = T("print функциясы жақшамен жазылады.")
        tip = T("Былай жаз: print(\"Сәлем\")")
    elif "perhaps you forgot a comma" in low:
        msg = T("Бір жерде үтір жетіспейді.")
        tip = T("Тізімдегі не жақшадағы элементтердің арасына үтір қой: [1, 2, 3]")
    elif "invalid decimal literal" in low:
        msg = T("Санның жанында әріп тұр.")
        tip = T("Көбейту үшін * қой: 2 * x. Атаулар санмен басталмайды.")
    elif "'return' outside function" in low:
        msg = T("return тек def ішінде жазылады.")
        tip = T("return жолын функцияның ішіне (шегініспен) қой.")
    elif "cannot assign to" in low or "cannot assign" in low:
        msg = T("Теңдіктің сол жағына мән беруге болмайды.")
        tip = T("Сол жақта тек қорап аты тұруы керек: x = 5")
    elif "eof" in low or "unexpected eof" in low:
        msg = T("Код аяқталмай қалды.")
        tip = T("Жабылмаған жақша не аяқталмаған жол бар шығар. Соңғы жолдарды тексер.")
    else:
        msg = T("Жазылуында қате бар. Осы жолды (және алдыңғы жолды) қайта оқып шық.")
        tip = T("Жақша, тырнақша, ':' және үтірлерді тексер. Алдыңғы жолдағы қате келесі жолда көрінуі мүмкін.")
    return {"kind": "syntax", "type": type(e).__name__, "line": e.lineno,
            "msg": msg, "tip": tip, "src": src or None, "detail": text}


def _describe(e, code="", names=()):
    import re
    name, text = type(e).__name__, str(e)
    tip = None
    if isinstance(e, UnboundLocalError):
        who = getattr(e, "name", None) or text
        msg = T("'%s' қорабы функция ішінде әлі мән алмай тұрып қолданылды.") % who
        tip = T("Қорапқа алдымен мән бер, не функцияның параметрі етіп жаз. Сыртқы қорапты өзгерту үшін ішінде global %s деп жаз.") % who
    elif isinstance(e, NameError):
        who = getattr(e, "name", None) or text
        msg = T("'%s' деген ат табылмады.") % who
        sg = _suggest(who, list(names) + dir(builtins))
        tip = (T("Мүмкін, '%s' деп жазғың келген шығар? ") % sg) if sg else ""
        tip += T("Қорапты алдымен жасадың ба? Әріптері, үлкен-кіші әріпі дұрыс па? Мәтін болса, тырнақшаға ал: \"%s\".") % who
    elif isinstance(e, ZeroDivisionError):
        msg = T("0-ге бөлуге болмайды.")
        tip = T("Бөлгіш болып тұрған қорапта 0 тұрған жоқ па? Қадамдап жүріп, қораптың мәнін оң жақтан қара.")
    elif isinstance(e, IndexError):
        if "pop" in text:
            msg = T("Бос тізімнен элемент алуға болмайды.")
            tip = T("Алдымен тізімге элемент қос, не тізім бос емес пе деп тексер: if len(x) > 0:")
        else:
            msg = T("Тізімде (мәтінде) мұндай нөмірлі элемент жоқ.")
            tip = T("Нөмір 0-ден басталады: 3 элементтің нөмірлері 0, 1, 2. Соңғы элемент үшін x[-1] не x[len(x) - 1] жаз.")
    elif isinstance(e, KeyError):
        msg = T("Сөздікте мұндай кілт жоқ: %s") % text
        tip = T("Кілттің жазылуын тексер (үлкен-кіші әріп, тырнақша). Тексеру үшін: if кілт in сөздік:")
    elif isinstance(e, AttributeError):
        attr = getattr(e, "name", None)
        obj = getattr(e, "obj", None)
        tname = type(obj).__name__ if obj is not None else ""
        kz_type = {"list": T("тізімде"), "str": T("мәтінде"), "int": T("санда"), "float": T("бөлшек санда"), "dict": T("сөздікте"), "NoneType": T("None мәнінде")}.get(tname, T("бұл нысанда"))
        msg = T("%s '%s' деген әрекет/қасиет жоқ.") % (kz_type[0].upper() + kz_type[1:], attr or "?")
        hints = {"push": "append", "length": "len(...)", "size": "len(...)", "add": "append", "toUpperCase": "upper", "toLowerCase": "lower"}
        sg = hints.get(attr) or (_suggest(attr, dir(obj)) if obj is not None and attr else None)
        if tname == "NoneType":
            tip = T("Қорап None болып тұр: алдыңғы функция ештеңе қайтармаған (return ұмытылған).")
        elif sg:
            tip = T("Python-да: %s. Атты дұрыс жаздың ба?") % ((T("len(x) жазу керек") if sg == "len(...)" else T("'%s' қолдан") % sg))
        else:
            tip = T("Атын дұрыс жаздың ба? Әрекеттер тізімін анықтамалықтан қара.")
    elif isinstance(e, TypeError):
        low = text
        if "can only concatenate str" in low or ("unsupported operand" in low and "'str'" in low) or "must be str, not" in low:
            msg = T("Мәтінді санмен қосуға болмайды.")
            tip = T("Санды мәтінге айналдыр: \"Жасым: \" + str(x). Не f-мәтін қолдан: f\"Жасым: {x}\"")
        elif "not callable" in low:
            m = re.search(r"'(\w+)' object is not callable", low)
            msg = T("Қорапты функция сияқты жақшамен шақырып тұрсың.")
            tip = (T("Қорап атының жанындағы жақшаны өшір. Көбейткің келсе, * қой: 2 * x. "
                   "Функция атымен бірдей ат қорапқа берілген болуы мүмкін (мысалы, print = 5)."))
        elif "not subscriptable" in low:
            msg = T("Бұл мәнге [ ] арқылы элемент алуға болмайды.")
            tip = T("[ ] тек тізімге, мәтінге және сөздікке қолданылады. Қорапта басқа мән (сан не None) тұр ма, тексер.")
        elif "nonetype" in low:
            msg = T("Мән жоқ (None) болып тұр, онымен жұмыс істеуге болмайды.")
            tip = T("Функция ештеңе қайтармаған болуы мүмкін: оның соңына return жаз.")
        elif "positional argument" in low or "required positional" in low or "takes" in low and "given" in low:
            msg = T("Функцияға берілген мәндер саны дұрыс емес.")
            tip = T("Функцияны жасағанда жақшада қанша параметр жазылса, шақырғанда сонша мән бер. (%s)") % text
        elif "not iterable" in low:
            msg = T("Бұл мәнді for арқылы тізіп шығуға болмайды.")
            tip = T("for-ға тізім, мәтін не range(...) керек. Сан болса, range(сан) жаз: for i in range(5):")
        elif "not supported between" in low:
            msg = T("Бұл екі мәнді салыстыруға болмайды (мысалы, мәтін мен сан).")
            tip = T("Біреуін екіншісінің түріне айналдыр: int(\"5\") мәтінді санға, str(5) санды мәтінге айналдырады.")
        elif "has no len" in low:
            msg = T("len() тек тізімге, мәтінге, сөздікке қолданылады.")
            tip = T("Санның ұзындығы болмайды. Цифр санын білгің келсе, len(str(x)) жаз.")
        elif "unsupported operand" in low:
            msg = T("Бұл екі мәнге мұндай амал қолдануға болмайды.")
            tip = T("Мәндердің түрлері үйлеспейді (сан, мәтін, тізім). Қайсысының түрі қандай екенін оң жақтағы қораптардан қара.")
        elif "can't multiply sequence" in low:
            msg = T("Мәтінді (тізімді) тек бүтін санға көбейтуге болады.")
            tip = T("\"ab\" * 3 жұмыс істейді, \"ab\" * \"3\" істемейді. Мәтінді int(...) арқылы санға айналдыр.")
        else:
            msg = T("Мәндердің түрлері сәйкес келмейді.")
            tip = T("Қатенің мәтіні: %s") % text
    elif isinstance(e, ValueError):
        if "invalid literal for int" in text or "could not convert string to float" in text:
            m = re.search(r": '(.*)'", text)
            msg = T("«%s» мәтінін санға айналдыру мүмкін емес.") % (m.group(1) if m else "")
            tip = T("int(...) тек цифрлардан тұратын мәтінді айналдырады: int(\"42\"). Бос орын не әріп болмауы керек.")
        elif "math domain" in text:
            msg = T("Бұл санға мұндай математикалық амал жоқ (мысалы, теріс санның түбірі).")
            tip = T("Санның таңбасын тексер: sqrt-қа теріс сан беруге болмайды.")
        elif "not enough values" in text or "too many values" in text:
            msg = T("Мәндер саны қораптар санына тең емес.")
            tip = T("a, b = [1, 2] жұмыс істейді: екі жағында да бірдей санда болуы керек.")
        elif "not in list" in text:
            msg = T("Тізімде мұндай мән жоқ, сондықтан өшіре алмаймын.")
            tip = T("Алдымен тексер: if мән in тізім:")
        elif "must not be zero" in text:
            msg = T("range үшін қадам 0 бола алмайды.")
            tip = T("Үшінші сан 1, 2, -1 сияқты болуы керек.")
        else:
            msg = T("Мән дұрыс емес: %s") % text
            tip = T("Функцияға берген мәніңді тексер: түрі мен шамасы сәйкес пе?")
    elif isinstance(e, RecursionError):
        msg = T("Функция өзін тым көп қайталап шақырды.")
        tip = T("Рекурсияда тоқтайтын шарт болуы керек: if n == 0: return. Ол орындалатынына көз жеткіз.")
    elif isinstance(e, (ImportError, ModuleNotFoundError)):
        msg = T("Бұл модуль табылмады.")
        tip = T("Мұнда тек Python-ның стандартты модульдері (math, random…) жұмыс істейді.")
    elif isinstance(e, OverflowError):
        msg = T("Сан тым үлкен болып кетті.")
        tip = T("Цикл тоқтап, санның шексіз өсіп кетпегенін тексер.")
    elif isinstance(e, AssertionError):
        msg = T("Тексеру (assert) орындалмады.")
        tip = text or None
    else:
        msg = text or name
        tip = T("Қатенің түрі: %s. Айтылған жолды және оның алдындағы жолды қара.") % name
    line = _line_of(e)
    return {"kind": "runtime", "type": name, "line": line, "msg": msg, "tip": tip,
            "src": _src_line(code, line), "detail": "%s: %s" % (name, text)}


def _count_lines(code):
    n = 0
    for raw in code.splitlines():
        s = raw.strip()
        if s and not s.startswith("#"):
            n += 1
    return n


def _features(tree):
    f = {"has_for": False, "has_while": False, "has_if": False,
         "has_def": False, "has_list": False}
    for node in ast.walk(tree):
        if isinstance(node, (ast.For, ast.AsyncFor)):
            f["has_for"] = True
        elif isinstance(node, ast.While):
            f["has_while"] = True
        elif isinstance(node, ast.If):
            f["has_if"] = True
        elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            f["has_def"] = True
        elif isinstance(node, ast.List):
            f["has_list"] = True
    return f


def run(code, cfg_json=None):
    cfg = json.loads(cfg_json) if cfg_json else {}
    rc = cfg.get("robot")
    frames, out = [], []
    cur = [0]
    cur_frame = [None]

    if rc:
        cols, rows = rc["cols"], rc["rows"]
        start = rc["start"]
        robot = {"x": start["x"], "y": start["y"], "d": start.get("d", 1), "got": 0}
        stars = {(s[0], s[1]) for s in rc["stars"]}
        walls = {(w[0], w[1]) for w in rc.get("walls", [])}
        total = len(stars)
        strict = bool(rc.get("strict", False))
    else:
        cols = rows = total = 0
        robot, stars, walls = None, set(), set()
        strict = False

    reserved = {"alga", "onga", "solga", "onga_burul", "solga_burul", "zhinau",
                "zhuldyz_bar", "aldy_bos", "print", "input",
                "vpered", "napravo", "nalevo", "sobrat", "zvezda_est", "vperedi_svobodno"}

    def snap_vars():
        items = dict(user_globals)
        fr = cur_frame[0]
        if fr is not None and fr.f_code.co_name != "<module>":
            items.update(fr.f_locals)
        res = []
        for name, val in items.items():
            if name.startswith("_") or name in reserved:
                continue
            tname = type(val).__name__
            if isinstance(val, (int, float, str, bool, type(None))):
                res.append({"n": name, "t": tname, "r": _clip(repr(val), 60),
                            "s": _clip(val, 200)})
            elif isinstance(val, (list, tuple)):
                res.append({"n": name, "t": tname, "r": _clip(repr(val), 80),
                            "i": [_clip(repr(x), 12) for x in list(val)[:16]],
                            "more": len(val) > 16})
            elif isinstance(val, (dict, set)):
                res.append({"n": name, "t": tname, "r": _clip(repr(val), 80)})
        return res

    def robot_snap():
        if robot is None:
            return None
        return {"x": robot["x"], "y": robot["y"], "d": robot["d"],
                "got": robot["got"], "total": total,
                "stars": sorted([list(s) for s in stars])}

    def add_frame(line, kind, msg=None, force=False):
        if len(frames) >= MAX_FRAMES and not force:
            raise _Stop()
        frames.append({"line": line, "kind": kind, "vars": snap_vars(),
                       "robot": robot_snap(), "out": "".join(out), "msg": msg})

    # ---- Робот командалары ----
    def need_robot():
        if robot is None:
            raise RobotError(T("Бұл тапсырмада робот жоқ."))

    def free(x, y):
        return 0 <= x < cols and 0 <= y < rows and (x, y) not in walls

    def alga(n=1):
        need_robot()
        for _ in range(n):
            dx, dy = DIRS[robot["d"]]
            nx, ny = robot["x"] + dx, robot["y"] + dy
            if not free(nx, ny):
                msg = T("Робот қабырғаға соқты! Бұрылуды ұмытпадың ба?")
                add_frame(cur[0], "crash", msg)
                raise RobotError(msg)
            robot["x"], robot["y"] = nx, ny
            add_frame(cur[0], "move")

    def onga():
        need_robot()
        robot["d"] = (robot["d"] + 1) % 4
        add_frame(cur[0], "turn")

    def solga():
        need_robot()
        robot["d"] = (robot["d"] - 1) % 4
        add_frame(cur[0], "turn")

    def zhinau():
        need_robot()
        pos = (robot["x"], robot["y"])
        if pos in stars:
            stars.discard(pos)
            robot["got"] += 1
            add_frame(cur[0], "collect",
                      T("Жұлдыз жиналды! (%d/%d)") % (robot["got"], total))
        elif strict:
            msg = T("Мұнда жұлдыз жоқ! Алдымен if zhuldyz_bar(): арқылы тексер.")
            add_frame(cur[0], "crash", msg)
            raise RobotError(msg)
        else:
            add_frame(cur[0], "miss", T("Мұнда жұлдыз жоқ."))

    def zhuldyz_bar():
        need_robot()
        return (robot["x"], robot["y"]) in stars

    def aldy_bos():
        need_robot()
        dx, dy = DIRS[robot["d"]]
        return free(robot["x"] + dx, robot["y"] + dy)

    # ---- print / input ----
    def _print(*args, sep=" ", end="\n", **kwargs):
        sep = " " if sep is None else sep
        end = "\n" if end is None else end
        out.append(sep.join(str(a) for a in args) + end)
        add_frame(cur[0], "print")

    def _input(prompt=""):
        raise RuntimeError(T("input() бұл платформада жұмыс істемейді. "
                           "Мәнді тікелей кодқа жаз, мысалы: x = 5"))

    safe_builtins = dict(vars(builtins))
    safe_builtins["print"] = _print
    safe_builtins["input"] = _input
    user_globals = {
        "__builtins__": safe_builtins, "__name__": "__main__",
        "alga": alga, "onga": onga, "solga": solga,
        "onga_burul": onga, "solga_burul": solga, "zhinau": zhinau,
        "zhuldyz_bar": zhuldyz_bar, "aldy_bos": aldy_bos,
        # орысша атаулар (орыс тіліндегі курс үшін)
        "vpered": alga, "napravo": onga, "nalevo": solga, "sobrat": zhinau,
        "zvezda_est": zhuldyz_bar, "vperedi_svobodno": aldy_bos,
    }

    def tracer(frame, event, arg):
        if frame.f_code.co_filename != FILENAME:
            return None
        if event == "line" and frame.f_lineno > 0:
            cur[0] = frame.f_lineno
            cur_frame[0] = frame
            add_frame(frame.f_lineno, "line")
        return tracer

    err = None
    features = {"has_for": False, "has_while": False, "has_if": False,
                "has_def": False, "has_list": False}
    try:
        tree = ast.parse(code, FILENAME)
        features = _features(tree)
        compiled = compile(tree, FILENAME, "exec")
    except SyntaxError as e:
        err = _describe_syntax(e, code)
        compiled = None
    except ValueError as e:  # мысалы, null байт
        err = {"kind": "syntax", "type": "ValueError", "line": None,
               "msg": T("Кодта дұрыс емес таңба бар."), "detail": str(e)}
        compiled = None

    if compiled is not None:
        sys.settrace(tracer)
        try:
            exec(compiled, user_globals)
        except _Stop:
            err = {"kind": "limit", "type": "Limit", "line": cur[0],
                   "msg": (T("Бағдарлама тым ұзақ жұмыс істеді. Шексіз цикл болуы "
                           "мүмкін: while шартын тексер.")),
                   "detail": "step limit"}
        except SystemExit:
            pass
        except RobotError as e:
            err = {"kind": "robot", "type": "RobotError", "line": _line_of(e),
                   "msg": str(e), "detail": str(e)}
        except Exception as e:
            err = _describe(e, code, list(user_globals))
        finally:
            sys.settrace(None)

    cur_frame[0] = None
    if err is None:
        add_frame(None, "end", force=True)
    else:
        add_frame(err.get("line"), "error", err["msg"], force=True)

    return json.dumps({
        "frames": frames,
        "error": err,
        "output": "".join(out),
        "lines": _count_lines(code),
        "features": features,
        "robot": robot_snap(),
    }, ensure_ascii=False)
