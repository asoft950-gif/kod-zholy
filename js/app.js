/* Код Жолы: интерфейс және қадамдап қайта ойнату */
(() => {
  "use strict";

  const LEVELS = KZ.levels;
  const PY_BASE = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
  const PALETTE = ["#6c5ce7", "#ff6b6b", "#2ec4b6", "#f59f00", "#e64980", "#1c7ed6"];
  const DELAYS = [0, 1000, 600, 350, 150]; // жылдамдық 1..4 (мс)

  const $ = (s) => document.querySelector(s);
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  /* ---------- Сақтау (localStorage) ---------- */
  const store = {
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
  };

  /* ---------- Күй ---------- */
  let progress = store.get("kodzholy.progress", {}); // { "1.1": 3, ... }
  let levelIdx = store.get("kodzholy.level", 0);
  if (!(levelIdx >= 0 && levelIdx < LEVELS.length)) levelIdx = 0;

  let runFn = null; // Python дайын болғанда толады
  let run = null; // соңғы орындау нәтижесі
  let idx = -1; // көрсетіліп тұрған кадр
  let playing = false;
  let timer = null;
  let attempts = 0;
  let shownVars = {};
  let angle = 0;
  let activeLine = null;
  let activeCls = null;
  let board = { robotEl: null, innerEl: null, stars: new Map(), cfg: null };

  /* ---------- Элементтер ---------- */
  const runBtn = $("#runBtn");
  const stepBtn = $("#stepBtn");
  const backBtn = $("#backBtn");
  const resetBtn = $("#resetBtn");
  const scrub = $("#scrub");
  const speed = $("#speed");
  const stepCount = $("#stepCount");
  const pyStatus = $("#pyStatus");

  /* ---------- Редактор ---------- */
  const editor = CodeMirror.fromTextArea($("#code"), {
    mode: "python",
    lineNumbers: true,
    indentUnit: 4,
    tabSize: 4,
    indentWithTabs: false,
    smartIndent: true,
    viewportMargin: Infinity,
    inputStyle: "contenteditable",
    extraKeys: {
      Tab: (cm) => cm.execCommand("insertSoftTab"),
      "Ctrl-Enter": () => runBtn.click(),
      "Cmd-Enter": () => runBtn.click(),
    },
  });
  try {
    const input = editor.getInputField();
    input.setAttribute("autocapitalize", "off");
    input.setAttribute("autocorrect", "off");
    input.setAttribute("spellcheck", "false");
  } catch (e) {
    /* маңызды емес */
  }

  /* ---------- Python жүктеу ---------- */
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error("Скрипт жүктелмеді: " + src));
      document.head.appendChild(s);
    });
  }

  async function defaultLoader() {
    await loadScript(PY_BASE + "pyodide.js");
    const py = await loadPyodide({ indexURL: PY_BASE });
    const src = await (await fetch("py/runner.py")).text();
    py.runPython(src);
    const fn = py.globals.get("run");
    return (code, cfg) => fn(code, cfg);
  }

  function setStatus(kind, text) {
    pyStatus.className = "py-status " + kind;
    pyStatus.textContent = text || "";
  }

  async function initPython() {
    try {
      runFn = await (KZ.pyLoader || defaultLoader)();
      setStatus("ready");
    } catch (e) {
      console.error(e);
      setStatus("error", "Python жүктелмеді. Интернетті тексеріп, бетті қайта аш.");
    }
    updateButtons();
  }

  /* ---------- Орындау ---------- */
  function execute() {
    const level = LEVELS[levelIdx];
    let res;
    try {
      res = JSON.parse(runFn(editor.getValue(), JSON.stringify({ robot: level.robot })));
    } catch (e) {
      console.error(e);
      setStatus("error", "Күтпеген қате шықты. Бетті жаңартып көр.");
      return false;
    }
    const last = res.frames[res.frames.length - 1];
    res.vars = {};
    (last.vars || []).forEach((v) => (res.vars[v.n] = v));
    res.evaluated = null;
    run = res;
    scrub.max = String(res.frames.length - 1);
    return true;
  }

  function lastIdx() {
    return run ? run.frames.length - 1 : -1;
  }

  function delay() {
    return DELAYS[Number(speed.value)] || 600;
  }

  function play() {
    if (!runFn) return;
    const fresh = !run;
    if (fresh && !execute()) return;
    if (fresh || idx >= lastIdx()) show(0);
    playing = true;
    updateButtons();
    scrollToStage();
    tick();
  }

  function tick() {
    clearTimeout(timer);
    if (!playing) return;
    timer = setTimeout(() => {
      if (!playing) return;
      if (idx < lastIdx()) show(idx + 1);
      if (idx >= lastIdx()) stop();
      else tick();
    }, delay());
  }

  function stop() {
    playing = false;
    clearTimeout(timer);
    updateButtons();
  }

  function scrollToStage() {
    if (!window.matchMedia || !window.matchMedia("(max-width: 959px)").matches) return;
    const box = $("#stage").getBoundingClientRect();
    if (box.top > window.innerHeight - 120) {
      $("#stage").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function stepForward() {
    if (!runFn) return;
    if (playing) stop();
    if (!run) {
      if (!execute()) return;
      show(0);
    } else if (idx < lastIdx()) {
      show(idx + 1);
    }
  }

  function stepBack() {
    stop();
    if (run && idx > 0) show(idx - 1);
  }

  /* Код өзгергенде немесе «қайта бастау» басылғанда */
  function invalidate() {
    stop();
    run = null;
    idx = -1;
    clearLine();
    hideResult();
    renderInitial();
    scrub.max = "0";
    scrub.value = "0";
    updateCounter();
    updateButtons();
  }

  /* ---------- Кадрды көрсету ---------- */
  function show(i) {
    const f = run.frames[i];
    idx = i;
    if (f.line) setLine(f.line, f.kind === "error" ? "cm-err" : "cm-exec");
    else clearLine();
    renderRobot(f.robot, f.kind);
    renderVars(f.vars || []);
    $("#console").textContent = f.out || "";
    renderNote(f);
    scrub.value = String(i);
    updateCounter();
    if (i === lastIdx()) onEnd();
    else hideResult();
    updateButtons();
  }

  function setLine(line, cls) {
    clearLine();
    const n = Math.max(0, Math.min(line - 1, editor.lastLine()));
    editor.addLineClass(n, "background", cls);
    activeLine = n;
    activeCls = cls;
    if (editor.scrollIntoView) editor.scrollIntoView({ line: n, ch: 0 }, 40);
  }

  function clearLine() {
    if (activeLine !== null) {
      try {
        editor.removeLineClass(activeLine, "background", activeCls);
      } catch (e) {
        /* жол өшірілген болуы мүмкін */
      }
      activeLine = null;
    }
  }

  function renderNote(f) {
    const note = $("#note");
    if (!f || !f.msg || f.kind === "error") {
      note.hidden = true;
      return;
    }
    note.hidden = false;
    note.textContent = f.msg;
    note.className = "note" + (f.kind === "crash" ? " bad" : f.kind === "collect" ? " good" : "");
  }

  function updateCounter() {
    stepCount.textContent = run ? idx + 1 + " / " + run.frames.length : "—";
  }

  function updateButtons() {
    const ready = !!runFn;
    const atEnd = run && idx >= lastIdx();
    runBtn.disabled = !ready;
    runBtn.textContent = playing ? "⏸ Тоқтату" : run && !atEnd && idx >= 0 ? "▶ Жалғастыру" : "▶ Іске қосу";
    stepBtn.disabled = !ready || !!atEnd;
    backBtn.disabled = !run || idx <= 0;
    scrub.disabled = !run;
  }

  /* ---------- Қораптар (жад) ---------- */
  function colorFor(name) {
    let h = 0;
    for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return PALETTE[h % PALETTE.length];
  }

  function renderVars(list) {
    const box = $("#memory");
    box.textContent = "";
    if (!list.length) {
      box.appendChild(
        el("p", "empty", "Әзірге қораптар жоқ. x = 5 деп жазсаң, «x» қорабы осында пайда болады.")
      );
      shownVars = {};
      return;
    }
    list.forEach((v) => {
      const changed = shownVars[v.n] !== v.r;
      const card = el("div", "var" + (changed ? " changed" : ""));
      card.style.setProperty("--c", colorFor(v.n));
      const name = el("div", "var-name", v.n);
      name.appendChild(el("small", null, v.t));
      card.appendChild(name);
      if (v.i) {
        const row = el("div", "var-cells");
        v.i.forEach((item, k) => {
          const cell = el("div", "var-cell");
          cell.appendChild(el("div", "v", item));
          cell.appendChild(el("div", "i", String(k)));
          row.appendChild(cell);
        });
        if (v.more) row.appendChild(el("div", "var-cell", "…"));
        card.appendChild(row);
      } else {
        card.appendChild(el("div", "var-box", v.r));
      }
      box.appendChild(card);
    });
    shownVars = {};
    list.forEach((v) => (shownVars[v.n] = v.r));
  }

  /* ---------- Робот алаңы ---------- */
  const ROBOT_SVG =
    '<svg viewBox="0 0 100 100" aria-hidden="true">' +
    '<path d="M50 3 L66 22 L34 22 Z" fill="#ffd23f" stroke="#1f1d36" stroke-width="6" stroke-linejoin="round"/>' +
    '<rect x="12" y="22" width="76" height="70" rx="18" fill="#6c5ce7" stroke="#1f1d36" stroke-width="6"/>' +
    '<circle cx="36" cy="52" r="11" fill="#fff" stroke="#1f1d36" stroke-width="4"/>' +
    '<circle cx="64" cy="52" r="11" fill="#fff" stroke="#1f1d36" stroke-width="4"/>' +
    '<circle cx="36" cy="54" r="4.5" fill="#1f1d36"/><circle cx="64" cy="54" r="4.5" fill="#1f1d36"/>' +
    '<rect x="36" y="74" width="28" height="6" rx="3" fill="#1f1d36"/></svg>';

  function buildBoard(cfg) {
    const root = $("#board");
    root.textContent = "";
    board = { robotEl: null, innerEl: null, stars: new Map(), cfg };
    if (!cfg) return;
    root.style.setProperty("--cols", cfg.cols);
    root.style.setProperty("--rows", cfg.rows);
    root.style.aspectRatio = cfg.cols + " / " + cfg.rows;
    root.style.maxWidth = Math.min(560, cfg.cols * 92) + "px";
    const walls = new Set((cfg.walls || []).map((w) => w.join(",")));
    for (let y = 0; y < cfg.rows; y++) {
      for (let x = 0; x < cfg.cols; x++) {
        const alt = (x + y) % 2 ? " alt" : "";
        root.appendChild(el("div", "cell" + alt + (walls.has(x + "," + y) ? " wall" : "")));
      }
    }
    const place = (node, x, y) => {
      node.style.left = (x * 100) / cfg.cols + "%";
      node.style.top = (y * 100) / cfg.rows + "%";
      node.style.width = 100 / cfg.cols + "%";
      node.style.height = 100 / cfg.rows + "%";
    };
    cfg.stars.forEach(([x, y]) => {
      const s = el("div", "star", "⭐");
      place(s, x, y);
      root.appendChild(s);
      board.stars.set(x + "," + y, s);
    });
    const robot = el("div", "robot");
    const inner = el("div", "robot-inner");
    inner.innerHTML = ROBOT_SVG;
    robot.appendChild(inner);
    place(robot, cfg.start.x, cfg.start.y);
    root.appendChild(robot);
    board.robotEl = robot;
    board.innerEl = inner;
    angle = (cfg.start.d == null ? 1 : cfg.start.d) * 90;
    inner.style.transform = "rotate(" + angle + "deg)";
  }

  function renderRobot(r, kind) {
    if (!r || !board.robotEl) return;
    const cfg = board.cfg;
    board.robotEl.style.left = (r.x * 100) / cfg.cols + "%";
    board.robotEl.style.top = (r.y * 100) / cfg.rows + "%";
    const target = r.d * 90;
    const delta = ((((target - angle) % 360) + 540) % 360) - 180;
    angle += delta;
    board.innerEl.style.transform = "rotate(" + angle + "deg)";
    const left = new Set(r.stars.map((s) => s[0] + "," + s[1]));
    board.stars.forEach((node, key) => node.classList.toggle("got", !left.has(key)));
    if (kind === "crash") {
      board.robotEl.classList.remove("crash");
      void board.robotEl.offsetWidth; // анимацияны қайта іске қосу
      board.robotEl.classList.add("crash");
    } else if (kind !== "error") {
      board.robotEl.classList.remove("crash");
    }
  }

  function renderInitial() {
    const level = LEVELS[levelIdx];
    if (level.robot) {
      const s = level.robot.start;
      renderRobot({ x: s.x, y: s.y, d: s.d == null ? 1 : s.d, stars: level.robot.stars }, null);
    }
    renderVars([]);
    $("#console").textContent = "";
    renderNote(null);
  }

  /* ---------- Нәтиже ---------- */
  function hideResult() {
    $("#result").hidden = true;
  }

  function showResult(kind, build) {
    const box = $("#result");
    box.textContent = "";
    box.className = "card result " + kind;
    build(box);
    box.hidden = false;
  }

  function onEnd() {
    const level = LEVELS[levelIdx];
    if (run.evaluated === null) {
      run.evaluated = run.error ? { ok: false, error: true } : KZ.evaluate(level, run);
      if (run.evaluated.ok) {
        const old = progress[level.id] || 0;
        progress[level.id] = Math.max(old, run.evaluated.stars);
        store.set("kodzholy.progress", progress);
        refreshStars();
      } else {
        attempts++;
        if (attempts >= 3) $("#solutionBtn").hidden = false;
      }
    }
    const ev = run.evaluated;

    if (run.error) {
      const e = run.error;
      showResult("err", (box) => {
        box.appendChild(el("h2", null, "🙈 Қате шықты"));
        box.appendChild(el("p", null, e.msg));
        box.appendChild(
          el("small", null, (e.line ? e.line + "-жол · " : "") + (e.detail || ""))
        );
      });
    } else if (!ev.ok) {
      showResult("bad", (box) => {
        box.appendChild(el("h2", null, "🤔 Әлі толық емес"));
        box.appendChild(el("p", null, ev.reason));
        box.appendChild(el("small", null, "Кодты өзгертіп, қайта іске қосып көр."));
      });
    } else {
      showResult("ok", (box) => {
        box.appendChild(el("h2", null, "🎉 Тамаша!"));
        box.appendChild(el("div", "big-stars", "⭐".repeat(ev.stars) + "☆".repeat(3 - ev.stars)));
        box.appendChild(
          el(
            "p",
            null,
            ev.stars === 3
              ? "Ең қысқа шешім! Керемет."
              : "3 ⭐ алу үшін кодты " + level.par + " жолға дейін қысқартып көр (қазір " + run.lines + " жол)."
          )
        );
        const row = el("div", "row");
        if (levelIdx < LEVELS.length - 1) {
          const next = el("button", "btn primary", "Келесі тапсырма →");
          next.type = "button";
          next.addEventListener("click", () => loadLevel(levelIdx + 1, true));
          row.appendChild(next);
        } else {
          box.appendChild(el("p", null, "Барлық тапсырма аяқталды! Жаңа деңгейлер жақында."));
        }
        const again = el("button", "btn", "↺ Қайта көру");
        again.type = "button";
        again.addEventListener("click", () => {
          show(0);
          play();
        });
        row.appendChild(again);
        box.appendChild(row);
      });
    }
  }

  /* ---------- Деңгей ---------- */
  function totalStars() {
    return Object.values(progress).reduce((a, b) => a + b, 0);
  }

  function refreshStars() {
    $("#totalStars").textContent = String(totalStars());
    const n = progress[LEVELS[levelIdx].id] || 0;
    $("#levelStars").textContent = "⭐".repeat(n) + "☆".repeat(3 - n);
    buildMenu();
  }

  function loadLevel(i, scrollTop) {
    stop();
    levelIdx = i;
    store.set("kodzholy.level", i);
    const level = LEVELS[i];
    attempts = 0;

    $("#levelBadge").textContent = "Деңгей " + level.id;
    $("#taskTitle").textContent = level.title;
    $("#taskBody").innerHTML = level.task;
    $("#hintText").hidden = true;
    $("#hintText").textContent = level.hint;
    $("#solutionText").hidden = true;
    $("#solutionText").textContent = level.solution;
    $("#solutionBtn").hidden = true;

    const cmds = $("#commands");
    cmds.hidden = !level.robot;
    const chips = $("#commandChips");
    chips.textContent = "";
    if (level.robot) {
      KZ.commands.forEach((c) => {
        const b = el("button", "chip");
        b.type = "button";
        b.appendChild(el("b", null, c.code));
        b.appendChild(el("span", null, c.help));
        b.addEventListener("click", () => insertCommand(c.code));
        chips.appendChild(b);
      });
    }

    $("#boardWrap").hidden = !level.robot;
    buildBoard(level.robot);

    const saved = store.get("kodzholy.code." + level.id, null);
    editor.setValue(typeof saved === "string" ? saved : level.starter);
    editor.setCursor({ line: editor.lastLine(), ch: 0 });
    invalidate();
    refreshStars();
    if (scrollTop) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function insertCommand(text) {
    const c = editor.getCursor();
    const line = editor.getLine(c.line);
    const indent = (line.match(/^\s*/) || [""])[0];
    if (line.trim() === "") {
      editor.replaceRange(indent + text, { line: c.line, ch: 0 }, { line: c.line, ch: line.length });
    } else {
      editor.replaceRange("\n" + indent + text, { line: c.line, ch: line.length });
    }
    editor.focus();
  }

  /* ---------- Мәзір ---------- */
  function buildMenu() {
    const list = $("#menuList");
    list.textContent = "";
    let topic = null;
    LEVELS.forEach((lv, i) => {
      if (lv.topic !== topic) {
        topic = lv.topic;
        list.appendChild(el("h3", null, topic));
      }
      const b = el("button", "lv" + (i === levelIdx ? " current" : ""));
      b.type = "button";
      const n = progress[lv.id] || 0;
      b.appendChild(el("span", "num", lv.id));
      b.appendChild(el("span", "t", lv.title));
      b.appendChild(el("span", "s", "⭐".repeat(n) + "☆".repeat(3 - n)));
      b.addEventListener("click", () => {
        $("#menu").close();
        loadLevel(i, true);
      });
      list.appendChild(b);
    });
  }

  /* ---------- Оқиғалар ---------- */
  runBtn.addEventListener("click", () => (playing ? stop() : play()));
  stepBtn.addEventListener("click", stepForward);
  backBtn.addEventListener("click", stepBack);
  resetBtn.addEventListener("click", invalidate);
  scrub.addEventListener("input", () => {
    if (!run) return;
    stop();
    show(Number(scrub.value));
  });
  speed.addEventListener("input", () => {
    document.documentElement.style.setProperty("--dur", Math.min(0.35, (delay() * 0.8) / 1000) + "s");
  });
  $("#menuBtn").addEventListener("click", () => {
    buildMenu();
    $("#menu").showModal();
  });
  $("#menuClose").addEventListener("click", () => $("#menu").close());
  $("#hintBtn").addEventListener("click", () => {
    const h = $("#hintText");
    h.hidden = !h.hidden;
  });
  $("#solutionBtn").addEventListener("click", () => {
    const s = $("#solutionText");
    s.hidden = !s.hidden;
  });
  editor.on("change", () => {
    store.set("kodzholy.code." + LEVELS[levelIdx].id, editor.getValue());
    if (run || activeLine !== null) invalidate();
  });

  /* ---------- Бастау ---------- */
  document.documentElement.style.setProperty("--dur", Math.min(0.35, (delay() * 0.8) / 1000) + "s");
  loadLevel(levelIdx, false);
  initPython();
})();
