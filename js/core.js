/* Код Жолы: ортақ құралдар (курстар тізілімі, сақтау, прогресс, робот алаңы, тексеру) */
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
  KZ.courses.push(c);
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
KZ.topicOf = (level) => String(level.id).split(".")[0];
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
    const d = this._load();
    d[cid] = d[cid] || {};
    d[cid][lid] = Math.max(d[cid][lid] || 0, n);
    KZ.store.set("kodzholy.progress.v2", d);
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
    return all[cid].includes(lid);
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
  innerEl.style.transform = "rotate(" + angle + "deg)";

  return {
    root,
    stars,
    robotEl,
    innerEl,
    /* r: { x, y, d, stars: [[x, y], ...] }; kind: кадр түрі */
    setState(r, kind) {
      if (!r) return;
      robotEl.style.left = (r.x * 100) / cfg.cols + "%";
      robotEl.style.top = (r.y * 100) / cfg.rows + "%";
      const target = r.d * 90;
      const delta = ((((target - angle) % 360) + 540) % 360) - 180; // ең қысқа бұрылыс
      angle += delta;
      innerEl.style.transform = "rotate(" + angle + "deg)";
      const left = new Set(r.stars.map((s) => s[0] + "," + s[1]));
      stars.forEach((node, key) => node.classList.toggle("got", !left.has(key)));
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
    fails.push("Экранға «" + c.output + "» шығуы керек, ал сенде: «" + res.output.trim() + "».");
  }
  if (c.vars) {
    for (const name of Object.keys(c.vars)) {
      const v = res.vars[name];
      if (!v) fails.push("«" + name + "» қорабы жасалмаған.");
      else if (v.r !== c.vars[name]) {
        fails.push("«" + name + "» қорабында " + c.vars[name] + " болуы керек, ал қазір " + v.r + ".");
      }
    }
  }
  if (c.collectAll && res.robot && res.robot.stars.length > 0) {
    fails.push(
      "Жұлдыздар: " + res.robot.got + "/" + res.robot.total + " жиналды. Қалғандарына да бар!"
    );
  }
  if (c.requireFor && !res.features.has_for) {
    fails.push("Бұл тапсырмада for циклін қолдану керек.");
  }
  if (c.requireWhile && !res.features.has_while) {
    fails.push("Бұл тапсырмада while циклін қолдану керек.");
  }
  if (c.requireIf && !res.features.has_if) {
    fails.push("Бұл тапсырмада if шартын қолдану керек.");
  }
  if (c.requireDef && !res.features.has_def) {
    fails.push(res.features.js ? "Бұл тапсырмада function арқылы функция жасау керек." : "Бұл тапсырмада def арқылы функция жасау керек.");
  }
  if (c.requireList && !res.features.has_list) {
    fails.push(res.features.js ? "Бұл тапсырмада массив қолдану керек: квадрат жақша [ ]." : "Бұл тапсырмада тізім қолдану керек: квадрат жақша [ ].");
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
