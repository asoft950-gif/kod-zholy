"""Код Жолы: оқушы кодын орындап, әр қадамды жазып алатын модуль.

Pyodide ішінде жұмыс істейді: run(code, cfg_json) -> JSON жол.
Нәтижедегі "frames" тізімі браузерде анимация ретінде қайта ойнатылады.
"""
import ast
import builtins
import json
import sys

MAX_FRAMES = 3000
FILENAME = "<kod>"
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


def _describe_syntax(e):
    text = e.msg or ""
    low = text.lower()
    if isinstance(e, IndentationError) or "indent" in low:
        msg = ("Шегініс дұрыс емес. for, if сияқты жолдың ішіндегі жолдар "
               "алдында 4 бос орын тұруы керек.")
    elif "expected ':'" in low:
        msg = "Жолдың соңында ':' белгісі жетіспейді."
    elif "never closed" in low or "unterminated" in low or "unmatched" in low:
        msg = "Жақша немесе тырнақша жабылмаған (не артық тұр)."
    elif "perhaps you forgot a comma" in low:
        msg = "Бір жерде үтір жетіспейді, не жақша дұрыс емес."
    else:
        msg = "Жазылуында қате бар. Осы жолды (және алдыңғы жолды) қайта оқып шық."
    return {"kind": "syntax", "type": type(e).__name__, "line": e.lineno,
            "msg": msg, "detail": text}


def _describe(e):
    name, text = type(e).__name__, str(e)
    if isinstance(e, NameError):
        who = getattr(e, "name", None) or text
        msg = ("'%s' деген ат табылмады. Айнымалыны алдымен жасадың ба? "
               "Әріптері дұрыс па?" % who)
    elif isinstance(e, ZeroDivisionError):
        msg = "0-ге бөлуге болмайды."
    elif isinstance(e, IndexError):
        msg = "Тізімде мұндай нөмірлі элемент жоқ."
    elif isinstance(e, KeyError):
        msg = "Сөздікте мұндай кілт жоқ: %s" % text
    elif isinstance(e, TypeError):
        msg = ("Типтер сәйкес келмейді (мысалы, санды мәтінмен қосуға болмайды). "
               "Қатенің мәтіні: %s" % text)
    elif isinstance(e, ValueError):
        msg = "Мән дұрыс емес: %s" % text
    elif isinstance(e, RecursionError):
        msg = "Функция өзін тым көп қайталап шақырды."
    else:
        msg = text or name
    return {"kind": "runtime", "type": name, "line": _line_of(e),
            "msg": msg, "detail": "%s: %s" % (name, text)}


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
                "zhuldyz_bar", "aldy_bos", "print", "input"}

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
            raise RobotError("Бұл тапсырмада робот жоқ.")

    def free(x, y):
        return 0 <= x < cols and 0 <= y < rows and (x, y) not in walls

    def alga(n=1):
        need_robot()
        for _ in range(n):
            dx, dy = DIRS[robot["d"]]
            nx, ny = robot["x"] + dx, robot["y"] + dy
            if not free(nx, ny):
                msg = "Робот қабырғаға соқты! Бұрылуды ұмытпадың ба?"
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
                      "Жұлдыз жиналды! (%d/%d)" % (robot["got"], total))
        elif strict:
            msg = "Мұнда жұлдыз жоқ! Алдымен if zhuldyz_bar(): арқылы тексер."
            add_frame(cur[0], "crash", msg)
            raise RobotError(msg)
        else:
            add_frame(cur[0], "miss", "Мұнда жұлдыз жоқ.")

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
        raise RuntimeError("input() бұл платформада жұмыс істемейді. "
                           "Мәнді тікелей кодқа жаз, мысалы: x = 5")

    safe_builtins = dict(vars(builtins))
    safe_builtins["print"] = _print
    safe_builtins["input"] = _input
    user_globals = {
        "__builtins__": safe_builtins, "__name__": "__main__",
        "alga": alga, "onga": onga, "solga": solga,
        "onga_burul": onga, "solga_burul": solga, "zhinau": zhinau,
        "zhuldyz_bar": zhuldyz_bar, "aldy_bos": aldy_bos,
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
        err = _describe_syntax(e)
        compiled = None
    except ValueError as e:  # мысалы, null байт
        err = {"kind": "syntax", "type": "ValueError", "line": None,
               "msg": "Кодта дұрыс емес таңба бар.", "detail": str(e)}
        compiled = None

    if compiled is not None:
        sys.settrace(tracer)
        try:
            exec(compiled, user_globals)
        except _Stop:
            err = {"kind": "limit", "type": "Limit", "line": cur[0],
                   "msg": ("Бағдарлама тым ұзақ жұмыс істеді. Шексіз цикл болуы "
                           "мүмкін: while шартын тексер."),
                   "detail": "step limit"}
        except SystemExit:
            pass
        except RobotError as e:
            err = {"kind": "robot", "type": "RobotError", "line": _line_of(e),
                   "msg": str(e), "detail": str(e)}
        except Exception as e:
            err = _describe(e)
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
