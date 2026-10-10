/* Bitlings: ортақ құралдар (курстар тізілімі, сақтау, прогресс, робот алаңы, тексеру) */
globalThis.KZ = globalThis.KZ || {};

/* ---------- DOM көмекшілері ---------- */
KZ.$ = (sel, root) => (root || document).querySelector(sel);
KZ.el = function (tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};
/* h("div", "cls", "мәтін", node, ...) */
KZ.h = function (tag, cls, ...kids) {
  const e = KZ.el(tag, cls);
  kids.forEach((k) => {
    if (k == null || k === false) return;
    e.appendChild(typeof k === "string" ? document.createTextNode(k) : k);
  });
  return e;
};

/* ---------- Курстар тізілімі ---------- */
KZ.courses = [];
KZ.registerCourse = function (c) {
  /* Орысша файлдар (js/courses/ru) сол id-ді қазақша курстың орнына қояды */
  const i = KZ.courses.findIndex((x) => x.id === c.id);
  if (i >= 0) KZ.courses[i] = c;
  else KZ.courses.push(c);
};
KZ.getCourse = (id) => KZ.courses.find((c) => c.id === id) || null;
/* Деңгейді табу: { level, kind: "tasks" | "bonus" } */
KZ.findLevel = function (course, id) {
  let l = (course.levels || []).find((x) => x.id === id);
  if (l) return { level: l, kind: "tasks" };
  l = (course.bonus || []).find((x) => x.id === id);
  if (l) return { level: l, kind: "bonus" };
  return null;
};
/* Мұғалім берген дайын деңгейге сілтеме (ойын деңгейі — ойын бетінде) */
KZ.levelHref = (course, id) => (course === "game" ? "#/game/" + id : "#/" + course + "/play/" + id + "/open");
KZ.levelStars = (course, id) => (course === "game" ? (KZ.game ? KZ.game.stars(id) : 0) : KZ.progress.stars(course, id));
KZ.topicOf = (level) => String(level.id).split(".")[0];
/* Тақырып аяқталып, келесі тақырыптың лекциясы бар болса, соның сілтемесі (тапсырмаға тікелей өтпей, алдымен лекция оқу үшін) */
KZ.nextLectureHref = (course, level, list, listKind) => {
  if (listKind !== "tasks") return null;
  const i = list.findIndex((l) => l.id === level.id);
  if (i < 0 || i >= list.length - 1) return null;
  const nxt = KZ.topicOf(list[i + 1]);
  if (KZ.topicOf(level) === nxt) return null;
  const lec = (course.lectures || []).find((l) => String(l.topic) === nxt);
  if (lec && KZ.progress.tasksUnlocked(course, nxt)) return null; // лекция оқылған: тікелей тапсырмаға өтуге болады
  return lec ? "#/" + course.id + "/lecture/" + lec.id : null;
};
KZ.allLevels = (course) => (course.levels || []).concat(course.bonus || []);

/* ---------- Сақтау ---------- */
KZ.store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v == null ? fallback : JSON.parse(v);
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* жеке режимде сақтау жұмыс істемеуі мүмкін */
    }
  },
  getSession(key, fallback) {
    try {
      const v = sessionStorage.getItem(key);
      return v == null ? fallback : JSON.parse(v);
    } catch (e) {
      return fallback;
    }
  },
  setSession(key, value) {
    try {
      if (value == null) sessionStorage.removeItem(key);
      else sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* маңызды емес */
    }
  },
};

/* ---------- Прогресс: { курс: { деңгей: жұлдыз } } ---------- */
/* Кеңес/шешім қолданғаны деңгейге сақталады (бетті жауып-ашса, жаңартса да жоғалмайды).
   Деңгей сәтті аяқталғанда ғана тазаланады. cap: ең көп алатын жұлдыз (3 / 2 кеңес / 1 шешім) */
KZ.penalty = {
  _k: (cid, lid) => cid + "/" + lid,
  _all() {
    const d = KZ.store.get("kodzholy.penalty.v1", {});
    return d && typeof d === "object" ? d : {};
  },
  cap(cid, lid) {
    return this._all()[this._k(cid, lid)] || 3;
  },
  _lower(cid, lid, n) {
    const d = this._all();
    const k = this._k(cid, lid);
    if ((d[k] || 3) <= n) return;
    d[k] = n;
    KZ.store.set("kodzholy.penalty.v1", d);
  },
  hint(cid, lid) { this._lower(cid, lid, 2); },
  solution(cid, lid) { this._lower(cid, lid, 1); },
  clear(cid, lid) {
    const d = this._all();
    if (this._k(cid, lid) in d) {
      delete d[this._k(cid, lid)];
      KZ.store.set("kodzholy.penalty.v1", d);
    }
  },
};

KZ.progress = {
  _d: null,
  _load() {
    if (this._d) return this._d;
    let d = KZ.store.get("kodzholy.progress.v2", null);
    if (!d) {
      const old = KZ.store.get("kodzholy.progress", null); // бірінші нұсқадан көшіру
      d = old ? { python: old } : {};
      KZ.store.set("kodzholy.progress.v2", d);
    }
    this._d = d;
    return d;
  },
  stars(cid, lid) {
    return (this._load()[cid] || {})[lid] || 0;
  },
  set(cid, lid, n) {
    const dl = KZ.activity ? KZ.activity.daily() : null; // күннің тапсырмасын прогресс өзгермей тұрып бекітеміз
    const d = this._load();
    d[cid] = d[cid] || {};
    d[cid][lid] = Math.max(d[cid][lid] || 0, n);
    KZ.store.set("kodzholy.progress.v2", d);
    if (KZ.activity) KZ.activity.onLevel(cid, lid, n, dl);
    if (KZ.auth) KZ.auth.queueSync();
  },
  courseStars(cid) {
    return Object.values(this._load()[cid] || {}).reduce((a, b) => a + b, 0);
  },
  total() {
    return Object.keys(this._load()).reduce((a, k) => a + this.courseStars(k), 0);
  },
  /* жұлдыз алған деңгей саны */
  done(course) {
    return KZ.allLevels(course).filter((l) => this.stars(course.id, l.id) > 0).length;
  },
  reset() {
    this._d = null;
  },
  /* Тақырып ашық па? Алдыңғы тақырыптың барлық тапсырмасы өтілуі керек (Coursera сияқты) */
  openAll() {
    return KZ.store.get("kodzholy.openall", false) === true;
  },
  setOpenAll(v) {
    KZ.store.set("kodzholy.openall", !!v);
  },
  topicUnlocked(course, topicId) {
    if (this.openAll()) return true;
    const ids = (course.topics || []).map((t) => t.id).filter((id) => (course.levels || []).some((l) => KZ.topicOf(l) === id));
    const i = ids.indexOf(topicId);
    if (i <= 0) return true;
    return (course.levels || []).filter((l) => KZ.topicOf(l) === ids[i - 1]).every((l) => this.stars(course.id, l.id) > 0) && this.topicUnlocked(course, ids[i - 1]);
  },
  /* Тапсырмалар ашық па? Тақырып ашық + сол тақырыптың лекциясы «оқылды» деп белгіленген болуы керек (ескі прогресс бар болса, бұғаттамаймыз) */
  tasksUnlocked(course, topicId) {
    if (!this.topicUnlocked(course, topicId)) return false;
    if (this.openAll()) return true;
    const lecs = (course.lectures || []).filter((l) => String(l.topic) === String(topicId));
    if (!lecs.length || lecs.every((l) => KZ.read.has(course.id, l.id))) return true;
    return (course.levels || []).some((l) => KZ.topicOf(l) === String(topicId) && this.stars(course.id, l.id) > 0);
  },
  /* Алдыңғы тақырып атауы (құлып хабары үшін) */
  prevTopic(course, topicId) {
    const ids = (course.topics || []).filter((t) => (course.levels || []).some((l) => KZ.topicOf(l) === t.id));
    const i = ids.findIndex((t) => t.id === topicId);
    return i > 0 ? ids[i - 1] : null;
  },
};

KZ.read = {
  _all() {
    return KZ.store.get("kodzholy.read.v1", {});
  },
  has(cid, lid) {
    return (this._all()[cid] || []).includes(lid);
  },
  count(cid) {
    return (this._all()[cid] || []).length;
  },
  toggle(cid, lid) {
    const all = this._all();
    const arr = all[cid] || [];
    all[cid] = arr.includes(lid) ? arr.filter((x) => x !== lid) : arr.concat(lid);
    KZ.store.set("kodzholy.read.v1", all);
    const now = all[cid].includes(lid);
    if (now && KZ.activity) KZ.activity.onRead();
    if (KZ.auth) KZ.auth.queueSync();
    return now;
  },
};

KZ.last = {
  get() {
    return KZ.store.get("kodzholy.last", null);
  },
  set(cid, lid) {
    KZ.store.set("kodzholy.last", { course: cid, level: lid });
  },
};

KZ.codeStore = {
  get(cid, lid) {
    const v = KZ.store.get("kodzholy.code." + cid + "." + lid, null);
    if (typeof v === "string") return v;
    if (cid === "python") {
      const old = KZ.store.get("kodzholy.code." + lid, null); // бірінші нұсқа
      if (typeof old === "string") return old;
    }
    return null;
  },
  set(cid, lid, code) {
    KZ.store.set("kodzholy.code." + cid + "." + lid, code);
  },
};

KZ.updateTotal = function () {
  const e = document.getElementById("totalStars");
  if (e) e.textContent = String(KZ.progress.total());
  if (KZ.updateStreak) KZ.updateStreak();
};

/* ---------- Қораптардың түсі ---------- */
KZ.PALETTE = ["#6c5ce7", "#ff6b6b", "#2ec4b6", "#f59f00", "#e64980", "#1c7ed6"];
KZ.colorFor = function (name) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return KZ.PALETTE[h % KZ.PALETTE.length];
};

/* ---------- Робот алаңы ---------- */
KZ.ROBOT_SVG =
  '<svg viewBox="0 0 100 100" aria-hidden="true">' +
  '<path d="M50 3 L66 22 L34 22 Z" fill="#ffd23f" stroke="#1f1d36" stroke-width="6" stroke-linejoin="round"/>' +
  '<rect x="12" y="22" width="76" height="70" rx="18" fill="#6c5ce7" stroke="#1f1d36" stroke-width="6"/>' +
  '<circle cx="36" cy="52" r="11" fill="#fff" stroke="#1f1d36" stroke-width="4"/>' +
  '<circle cx="64" cy="52" r="11" fill="#fff" stroke="#1f1d36" stroke-width="4"/>' +
  '<circle cx="36" cy="54" r="4.5" fill="#1f1d36"/><circle cx="64" cy="54" r="4.5" fill="#1f1d36"/>' +
  '<rect x="36" y="74" width="28" height="6" rx="3" fill="#1f1d36"/></svg>';

KZ.makeBoard = function (cfg) {
  const root = KZ.el("div", "board");
  root.style.setProperty("--cols", cfg.cols);
  root.style.setProperty("--rows", cfg.rows);
  root.style.aspectRatio = cfg.cols + " / " + cfg.rows;
  root.style.maxWidth = Math.min(560, cfg.cols * 92) + "px";
  const walls = new Set((cfg.walls || []).map((w) => w.join(",")));
  for (let y = 0; y < cfg.rows; y++) {
    for (let x = 0; x < cfg.cols; x++) {
      const alt = (x + y) % 2 ? " alt" : "";
      root.appendChild(KZ.el("div", "cell" + alt + (walls.has(x + "," + y) ? " wall" : "")));
    }
  }
  const place = (node, x, y) => {
    node.style.left = (x * 100) / cfg.cols + "%";
    node.style.top = (y * 100) / cfg.rows + "%";
    node.style.width = 100 / cfg.cols + "%";
    node.style.height = 100 / cfg.rows + "%";
  };
  const stars = new Map();
  cfg.stars.forEach(([x, y]) => {
    const s = KZ.el("div", "star", "⭐");
    place(s, x, y);
    root.appendChild(s);
    stars.set(x + "," + y, s);
  });
  const robotEl = KZ.el("div", "robot");
  const innerEl = KZ.el("div", "robot-inner");
  innerEl.innerHTML = KZ.ROBOT_SVG;
  robotEl.appendChild(innerEl);
  place(robotEl, cfg.start.x, cfg.start.y);
  root.appendChild(robotEl);
  let angle = (cfg.start.d == null ? 1 : cfg.start.d) * 90;
  let px = cfg.start.x;
  let py = cfg.start.y;
  /* Жұлдыз алынғанда ұшқын шашырайды */
  const burst = (key) => {
    const [x, y] = key.split(",").map(Number);
    for (let i = 0; i < 8; i++) {
      const sp = KZ.el("div", "spark");
      place(sp, x, y);
      const a = (i / 8) * Math.PI * 2;
      sp.style.setProperty("--dx", Math.round(Math.cos(a) * 34) + "px");
      sp.style.setProperty("--dy", Math.round(Math.sin(a) * 34) + "px");
      root.appendChild(sp);
      setTimeout(() => sp.remove(), 700);
    }
  };
  innerEl.style.transform = "rotate(" + angle + "deg)";

  return {
    root,
    stars,
    robotEl,
    innerEl,
    /* r: { x, y, d, stars: [[x, y], ...] }; kind: кадр түрі */
    setState(r, kind) {
      if (!r) return;
      const moved = r.x !== px || r.y !== py;
      const target = r.d * 90;
      const delta = ((((target - angle) % 360) + 540) % 360) - 180; // ең қысқа бұрылыс
      const left = new Set(r.stars.map((s) => s[0] + "," + s[1]));
      const live = kind != null; // null: қайта бастау, дыбыс пен із қажет емес
      const sound = window.KZS ? window.KZS.beep : () => {};
      if (live && moved) {
        // өткен ұяшықта із қалады
        const t = KZ.el("div", "trail");
        place(t, px, py);
        root.insertBefore(t, robotEl);
        setTimeout(() => t.remove(), 1400);
        robotEl.classList.remove("walk");
        void robotEl.offsetWidth;
        robotEl.classList.add("walk");
      }
      robotEl.style.left = (r.x * 100) / cfg.cols + "%";
      robotEl.style.top = (r.y * 100) / cfg.rows + "%";
      angle += delta;
      innerEl.style.transform = "rotate(" + angle + "deg)";
      let gotNew = false;
      stars.forEach((node, key) => {
        const got = !left.has(key);
        if (got && !node.classList.contains("got") && live) {
          gotNew = true;
          burst(key);
        }
        node.classList.toggle("got", got);
      });
      if (live) {
        if (kind === "crash") sound("crash");
        else if (gotNew) sound("star");
        else if (moved) sound("move");
        else if (delta) sound("turn");
      }
      px = r.x;
      py = r.y;
      if (kind === "crash") {
        robotEl.classList.remove("crash");
        void robotEl.offsetWidth; // анимацияны қайта іске қосу
        robotEl.classList.add("crash");
      } else if (kind !== "error") {
        robotEl.classList.remove("crash");
      }
    },
  };
};

/* ---------- Жұлдыз санау және тексеру ---------- */
/* Код неғұрлым қысқа болса, соғұрлым көп жұлдыз */
KZ.starsFor = function (level, lines) {
  if (lines <= level.par) return 3;
  if (lines <= level.par + 2) return 2;
  return 1;
};

/* Орындау нәтижесін тексеру. res: runner.py қайтарған нәтиже (vars, code қосылған) */
KZ.evaluate = function (level, res) {
  const c = level.check || {};
  const fails = [];

  if (c.output !== undefined && res.output.trim() !== c.output) {
    fails.push(KZ.t("Экранға «") + c.output + KZ.t("» шығуы керек, ал сенде: «") + res.output.trim() + "».");
  }
  if (c.vars) {
    for (const name of Object.keys(c.vars)) {
      const v = res.vars[name];
      if (!v) fails.push("«" + name + KZ.t("» қорабы жасалмаған."));
      else if (v.r !== c.vars[name]) {
        fails.push("«" + name + KZ.t("» қорабында ") + c.vars[name] + KZ.t(" болуы керек, ал қазір ") + v.r + ".");
      }
    }
  }
  if (c.collectAll && res.robot && res.robot.stars.length > 0) {
    fails.push(
      KZ.t("Жұлдыздар: ") + res.robot.got + "/" + res.robot.total + KZ.t(" жиналды. Қалғандарына да бар!")
    );
  }
  if (c.requireFor && !res.features.has_for) {
    fails.push(KZ.t("Бұл тапсырмада for циклін қолдану керек."));
  }
  if (c.requireWhile && !res.features.has_while) {
    fails.push(KZ.t("Бұл тапсырмада while циклін қолдану керек."));
  }
  if (c.requireIf && !res.features.has_if) {
    fails.push(KZ.t("Бұл тапсырмада if шартын қолдану керек."));
  }
  if (c.requireDef && !res.features.has_def) {
    fails.push(res.features.kt ? KZ.t("Бұл тапсырмада fun арқылы функция жасау керек.") : res.features.js ? KZ.t("Бұл тапсырмада function арқылы функция жасау керек.") : KZ.t("Бұл тапсырмада def арқылы функция жасау керек."));
  }
  if (c.requireList && !res.features.has_list) {
    fails.push(res.features.kt ? KZ.t("Бұл тапсырмада тізім қолдану керек: listOf(…) не mutableListOf(…).") : res.features.js ? KZ.t("Бұл тапсырмада массив қолдану керек: квадрат жақша [ ].") : KZ.t("Бұл тапсырмада тізім қолдану керек: квадрат жақша [ ]."));
  }
  if (c.forbid && res.code) {
    c.forbid.forEach((f) => {
      if (f.re.test(res.code)) fails.push(f.msg);
    });
  }
  if (c.fn) {
    const m = c.fn(res);
    if (m) fails.push(m);
  }

  if (fails.length) return { ok: false, reason: fails.join(" ") };
  return { ok: true, stars: KZ.starsFor(level, res.lines) };
};
