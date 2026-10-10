"""Bitlings ойыны: оқушы коды әлемді басқарады, барлық оқиға жазылып алынады.

run_game(code, cfg_json) -> JSON: { ok, events, error, line, out }
events браузерде анимация ретінде қайта ойнатылады.
"""
import json
import sys

FILENAME = "<kod>"
MAX_EVENTS = 1500
MAX_LINES = 300000
_TR = {}


def T(s):
    return _TR.get(s, s)


DIRS = [(0, -1), (1, 0), (0, 1), (-1, 0)]


class GameError(Exception):
    pass


class _Stop(BaseException):
    pass


class _Done(BaseException):
    pass


class Fighter:
    """Шайқастағы кейіпкер не жау: hp, shield, heals, atk, kezek (раунд нөмірі), auyr (ауыр соққы келе ме)."""

    def __init__(self, name, hp, atk, **kw):
        self.at = name
        self.hp = hp
        self.max = hp
        self.atk = atk
        self.shield = 0
        self.heals = kw.get("heals", 0)
        self.kezek = 1
        self.auyr = False
        self.tur = kw.get("tur", "")
        self.name = name

    def __repr__(self):
        return "<%s hp=%d>" % (self.at, self.hp)


class World:
    def __init__(self, cfg):
        self.mode = cfg.get("mode", "walk")
        rows = cfg["map"]
        self.h = len(rows)
        self.w = len(rows[0])
        self.grid = [list(r) for r in rows]
        self.d = cfg.get("dir", 1)
        self.x = self.y = 0
        for j, r in enumerate(self.grid):
            for i, c in enumerate(r):
                if c == "S":
                    self.x, self.y = i, j
                    self.grid[j][i] = "."
        self.events = []
        self.coins = 0
        self.keys = 0
        self.total_coins = sum(r.count("c") for r in self.grid)
        self.out = []
        self.enemies = cfg.get("enemies", {})
        self.hero = cfg.get("hero") or {"hp": 12, "atk": 3, "heals": 2}
        self.hp = self.hero["hp"]
        self.won = False
        self.crystals = 0
        self.crops = {}  # (x,y) -> tick
        self.tick = 0
        self.ripe = cfg.get("ripe", 3)
        self.cur_line = 0
        self.fought = 0
        self.ns = {}
        self.heals_left = self.hero["heals"]

    # ---------- көмекші ----------
    def emit(self, t, **kw):
        if len(self.events) >= MAX_EVENTS:
            raise GameError(T("Әрекет тым көп болды: цикл шексіз болуы мүмкін."))
        kw["t"] = t
        kw["l"] = self.cur_line
        kw["tk"] = self.tick
        self.events.append(kw)

    def at(self, x, y):
        if 0 <= x < self.w and 0 <= y < self.h:
            return self.grid[y][x]
        return "#"

    def ahead(self):
        dx, dy = DIRS[self.d]
        return self.x + dx, self.y + dy

    # ---------- қозғалыс ----------
    def step(self):
        nx, ny = self.ahead()
        c = self.at(nx, ny)
        if c == "#" or c == "~":
            self.emit("bump", x=self.x, y=self.y, d=self.d)
            raise GameError(T("Бит қабырғаға тіреліп қалды. Алдында жол жоқ!") if c == "#" else T("Бит суға түсіп кетпек болды! Су алдында."))
        if c == "D":
            if self.keys <= 0:
                self.emit("bump", x=self.x, y=self.y, d=self.d)
                raise GameError(T("Есік жабық. Алдымен кілтті ал!"))
            self.keys -= 1
            self.grid[ny][nx] = "."
            self.emit("door", x=nx, y=ny, keys=self.keys)
            c = "."
        self.x, self.y = nx, ny
        if self.mode == "farm":
            self.tick += 1
        self.emit("move", x=nx, y=ny, d=self.d)
        if c == "^":
            self.emit("hurt", x=nx, y=ny)
            raise GameError(T("Бит тікенге түсіп қалды! Айналып өт."))
        if c == "c":
            self.coins += 1
            self.grid[ny][nx] = "."
            self.emit("coin", x=nx, y=ny, n=self.coins)
        elif c == "k":
            self.keys += 1
            self.grid[ny][nx] = "."
            self.emit("key", x=nx, y=ny, n=self.keys)
        elif c in "MB":
            self.fight(nx, ny, c)
        elif c == "E":
            self.won = True
            self.emit("win", x=nx, y=ny)
            raise _Done()

    def turn(self, k):
        self.d = (self.d + k) % 4
        self.emit("turn", d=self.d)

    # ---------- шайқас ----------
    def fight(self, x, y, c):
        spec = self.enemies.get(str(x) + "," + str(y)) or self.enemies.get(c) or {"name": "Slime", "hp": 6, "atk": 2}
        g = self.ns
        fn = g.get("shaiqas") or g.get("fight") or g.get("soqqy")
        if fn is None:
            self.emit("fightstart", x=x, y=y, c=c, name=spec["name"], ehp=spec["hp"], mhp=self.hp, mmax=self.hero["hp"], boss=c == "B")
            raise GameError(T("Жау шықты! Шайқас үшін def shaiqas(men, zhau): функциясын жаз."))
        me = Fighter("Бит", self.hp, self.hero["atk"], heals=self.heals_left)
        me.max = self.hero["hp"]
        en = Fighter(spec["name"], spec["hp"], spec["atk"], tur=spec.get("tur", ""))
        heavy = spec.get("heavy", 0)
        self.emit("fightstart", x=x, y=y, c=c, name=en.at, ehp=en.max, mhp=me.hp, mmax=me.max, boss=c == "B", heals=me.heals)
        rnd = 0
        while me.hp > 0 and en.hp > 0:
            rnd += 1
            if rnd > 40:
                raise GameError(T("Шайқас тым ұзаққа созылды. Қорғанып қана тұрма, соқ!"))
            me.kezek = en.kezek = rnd
            en.auyr = bool(heavy) and rnd % heavy == 0
            me.shield = 0
            try:
                act = fn(me, en)
            except (GameError, _Stop, _Done):
                raise
            act = str(act).strip().lower() if act is not None else ""
            dmg_e = dmg_m = 0
            heal = 0
            if act in ("ur", "ұр", "соқ", "atak", "attack", "удар", "бей"):
                act = "ur"
                dmg_e = me.atk
                en.hp = max(0, en.hp - dmg_e)
            elif act in ("qorgan", "қорған", "щит", "shield", "защита"):
                act = "qorgan"
                me.shield = 1
            elif act in ("emde", "емде", "heal", "лечи"):
                act = "emde"
                if me.heals > 0:
                    me.heals -= 1
                    heal = 5
                    me.hp = min(me.max, me.hp + heal)
                else:
                    act = "bos"
            else:
                raise GameError(T("shaiqas функциясы 'ur', 'qorgan' не 'emde' қайтаруы керек. Қазір: ") + repr(act))
            if en.hp > 0:
                base = en.atk * 2 if en.auyr else en.atk
                if me.shield:
                    dmg_m = 0 if en.auyr else max(0, base - 1)
                else:
                    dmg_m = base
                me.hp = max(0, me.hp - dmg_m)
            self.emit("round", n=rnd, act=act, de=dmg_e, dm=dmg_m, heal=heal, mhp=me.hp, ehp=en.hp, heavy=en.auyr, heals=me.heals)
        self.hp = me.hp if me.hp > 0 else 0
        self.heals_left = me.heals
        if me.hp <= 0:
            self.emit("fightend", win=False)
            raise GameError(T("Бит шайқаста жеңілді. Стратегияны өзгертіп көр!"))
        self.grid[y][x] = "."
        self.fought += 1
        self.emit("fightend", win=True, x=x, y=y, mhp=me.hp)

    # ---------- ферма ----------
    def plant(self):
        p = (self.x, self.y)
        if self.at(*p) != "f":
            raise GameError(T("Мұнда егін егуге болмайды: бұл жер жыртылмаған."))
        if p in self.crops:
            return
        self.tick += 1
        self.crops[p] = self.tick
        self.emit("plant", x=self.x, y=self.y)

    def harvest(self):
        p = (self.x, self.y)
        self.tick += 1
        if p not in self.crops:
            self.emit("nothing", x=self.x, y=self.y)
            return
        if self.tick - self.crops[p] < self.ripe:
            self.emit("raw", x=self.x, y=self.y)
            return
        del self.crops[p]
        self.crystals += 1
        self.emit("harvest", x=self.x, y=self.y, n=self.crystals)

    def ripe_here(self):
        p = (self.x, self.y)
        return p in self.crops and self.tick - self.crops[p] >= self.ripe


def run_game(code, cfg_json):
    cfg = json.loads(cfg_json)
    w = World(cfg)
    ns = {"__name__": "__main__"}
    w.ns = ns
    count = [0]

    def line():
        f = sys._getframe(2)
        while f is not None and f.f_code.co_filename != FILENAME:
            f = f.f_back
        w.cur_line = f.f_lineno if f else 0

    def wrap(fn):
        def inner(*a, **k):
            line()
            return fn(*a, **k)
        return inner

    def alga(n=1):
        for _ in range(int(n)):
            w.step()

    def onga():
        w.turn(1)

    def solga():
        w.turn(-1)

    def zhol_bos():
        nx, ny = w.ahead()
        return w.at(nx, ny) not in "#~D"

    def aldynda(nl=None):
        nx, ny = w.ahead()
        return w.at(nx, ny)

    def tikenbar():
        nx, ny = w.ahead()
        return w.at(nx, ny) == "^"

    def kitbar():
        return w.keys

    def say(*a, **k):
        w.out.append(" ".join(str(x) for x in a))
        w.emit("say", s=w.out[-1])

    api = {
        "alga": alga, "onga": onga, "solga": solga, "zhol_bos": zhol_bos, "tiken_bar": tikenbar,
        "aldynda": aldynda, "kilt_sany": kitbar, "plant": w.plant, "ek": w.plant, "zhi": w.harvest, "harvest": w.harvest,
        "pisti": w.ripe_here, "print": say,
        # орысша атаулар
        "vpered": alga, "napravo": onga, "nalevo": solga, "put_svoboden": zhol_bos, "shipy_est": tikenbar,
        "kolichestvo_klyuchey": kitbar, "posadit": w.plant, "sobrat": w.harvest, "spelo": w.ripe_here,
    }
    for k, f in list(api.items()):
        api[k] = wrap(f)
    ns.update(api)
    ns["Fighter"] = Fighter

    err = None
    errline = None

    def tracer(frame, event, arg):
        if frame.f_code.co_filename != FILENAME:
            return None
        if event == "line":
            count[0] += 1
            w.cur_line = frame.f_lineno
            if count[0] > MAX_LINES:
                raise _Stop()
        return tracer

    try:
        compiled = compile(code, FILENAME, "exec")
        sys.settrace(tracer)
        try:
            exec(compiled, ns)
        finally:
            sys.settrace(None)
    except _Done:
        pass
    except _Stop:
        err = T("Код тым ұзақ орындалды: цикл тоқтамай тұрған болуы керек (while True?).")
    except GameError as e:
        err = str(e)
        errline = w.cur_line
    except SyntaxError as e:
        err = T("Синтаксис қатесі") + ": " + str(e.msg)
        errline = e.lineno
    except Exception as e:
        tb = e.__traceback__
        ln = None
        while tb is not None:
            if tb.tb_frame.f_code.co_filename == FILENAME:
                ln = tb.tb_lineno
            tb = tb.tb_next
        errline = ln
        if isinstance(e, NameError):
            err = T("Белгісіз ат: ") + str(e).split("'")[1] if "'" in str(e) else str(e)
        else:
            err = type(e).__name__ + ": " + str(e)
    if err is None and cfg.get("mode") == "farm":
        goal = cfg.get("goal", 1)
        if w.crystals >= goal:
            w.won = True
            w.cur_line = 0
            w.events.append({"t": "win", "x": w.x, "y": w.y, "l": 0, "tk": w.tick})
        else:
            err = T("Жиналған кристалл: ") + str(w.crystals) + " / " + str(goal) + T(". Тағы жина!")
    if err is None and not w.won:
        err = T("Код бітті, бірақ Бит шығуға жетпеді. Тағы қадам керек!")
    return json.dumps(
        {
            "ok": err is None,
            "won": w.won,
            "error": err,
            "line": errline,
            "events": w.events,
            "coins": w.coins,
            "total": w.total_coins,
            "crystals": w.crystals,
            "out": w.out,
            "fought": w.fought,
            "hp": w.hp,
        }
    )
