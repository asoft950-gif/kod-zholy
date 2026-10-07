/* Код Жолы: Python жұмыс алаңы (редактор, қадамдап қайта ойнату, тексеру) */
(() => {
  "use strict";

  const { $, el } = KZ;
  const PY_BASE = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
  const DELAYS = [0, 1000, 600, 350, 150]; // жылдамдық 1..4 (мс)
  const DEFAULT_ROBOT = {
    cols: 7, rows: 5, start: { x: 0, y: 2, d: 1 }, stars: [[3, 2], [6, 2], [3, 0]],
  };

  let course = null;
  let level = null;
  let list = []; // осы деңгей кіретін тізім (тапсырмалар не қосымша)
  let listKind = "tasks";
  let runFn = null; // Python дайын болғанда толады
  let pyState = "idle"; // idle | loading | ready | error
  let run = null; // соңғы орындау нәтижесі
  let idx = -1; // көрсетіліп тұрған кадр
  let playing = false;
  let timer = null;
  let attempts = 0;
  let shownVars = {};
  let activeLine = null;
  let activeCls = null;
  let board = null;

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

  /* ---------- Python жүктеу (алғаш қажет болғанда ғана) ---------- */
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

  async function ensurePython() {
    if (runFn || pyState === "loading") return;
    pyState = "loading";
    setStatus("loading", "Python жүктелуде… (алғашқы жолы 10–20 секунд)");
    updateButtons();
    try {
      runFn = await (KZ.pyLoader || defaultLoader)();
      pyState = "ready";
      setStatus("ready");
    } catch (e) {
      console.error(e);
      pyState = "error";
      setStatus("error", "Python жүктелмеді. Интернетті тексеріп, бетті қайта аш.");
    }
    updateButtons();
  }

  /* ---------- Орындау ---------- */
  function execute() {
    const code = editor.getValue();
    let res;
    try {
      res = JSON.parse(runFn(code, JSON.stringify({ robot: level.robot })));
    } catch (e) {
      console.error(e);
      setStatus("error", "Күтпеген қате шықты. Бетті жаңартып көр.");
      return false;
    }
    const last = res.frames[res.frames.length - 1];
    res.vars = {};
    (last.vars || []).forEach((v) => (res.vars[v.n] = v));
    res.code = code;
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
    if (board) board.setState(f.robot, f.kind);
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
  function renderVars(vars) {
    const box = $("#memory");
    box.textContent = "";
    if (!vars.length) {
      box.appendChild(
        el("p", "empty", "Әзірге қораптар жоқ. x = 5 деп жазсаң, «x» қорабы осында пайда болады.")
      );
      shownVars = {};
      return;
    }
    vars.forEach((v) => {
      const changed = shownVars[v.n] !== v.r;
      const card = el("div", "var" + (changed ? " changed" : ""));
      card.style.setProperty("--c", KZ.colorFor(v.n));
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
    vars.forEach((v) => (shownVars[v.n] = v.r));
  }

  /* ---------- Робот алаңы ---------- */
  function buildBoard(cfg) {
    const root = $("#board");
    root.textContent = "";
    board = null;
    if (!cfg) return;
    board = KZ.makeBoard(cfg);
    root.appendChild(board.root);
  }

  function renderInitial() {
    if (level && level.robot && board) {
      const s = level.robot.start;
      board.setState({ x: s.x, y: s.y, d: s.d == null ? 1 : s.d, stars: level.robot.stars }, null);
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

  function nextHref() {
    const i = list.findIndex((l) => l.id === level.id);
    if (i >= 0 && i < list.length - 1) return "#/" + course.id + "/play/" + list[i + 1].id;
    return null;
  }

  function onEnd() {
    if (run.evaluated === null) {
      if (run.error) run.evaluated = { ok: false, error: true };
      else if (level.sandbox) run.evaluated = { ok: true, sandbox: true };
      else run.evaluated = KZ.evaluate(level, run);

      if (run.evaluated.ok && !level.sandbox) {
        KZ.progress.set(course.id, level.id, run.evaluated.stars);
        KZ.updateTotal();
        refreshLevelStars();
      } else if (!run.evaluated.ok) {
        attempts++;
        if (attempts >= 3 && !level.sandbox) $("#solutionBtn").hidden = false;
      }
    }
    const ev = run.evaluated;

    if (run.error) {
      const e = run.error;
      showResult("err", (box) => {
        box.appendChild(el("h2", null, "🙈 Қате шықты"));
        box.appendChild(el("p", null, e.msg));
        box.appendChild(el("small", null, (e.line ? e.line + "-жол · " : "") + (e.detail || "")));
      });
    } else if (level.sandbox) {
      hideResult();
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
        const next = nextHref();
        if (next) {
          const a = el("a", "btn primary", "Келесі тапсырма →");
          a.href = next;
          row.appendChild(a);
        } else {
          const a = el("a", "btn primary", "← Курсқа оралу");
          a.href = "#/" + course.id + "/" + listKind;
          row.appendChild(a);
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
  function refreshLevelStars() {
    const n = level.sandbox ? 0 : KZ.progress.stars(course.id, level.id);
    $("#levelStars").textContent = level.sandbox ? "" : "⭐".repeat(n) + "☆".repeat(3 - n);
  }

  function sandboxLevel() {
    const s = KZ.store.getSession("kodzholy.sandbox", null);
    KZ.store.setSession("kodzholy.sandbox", null);
    const robot = s && s.robot === false ? null : (s && s.robot) || DEFAULT_ROBOT;
    return {
      id: "free",
      sandbox: true,
      title: "Еркін алаң",
      task:
        "<p>Мұнда тапсырма жоқ: кез келген код жазып, не болатынын көр. Қателесуден қорықпа!</p>" +
        "<p class='tip'>Кодты ⏭ «Қадам» арқылы бір-бірден орындап, оң жақтағы қораптарға қара.</p>",
      hint: "",
      starter: "# өз кодыңды жаз\n",
      solution: "",
      par: 99,
      robot,
      check: {},
      sandboxCode: s && typeof s.code === "string" ? s.code : null,
    };
  }

  function loadLevel() {
    stop();
    attempts = 0;
    $("#levelBadge").textContent = level.sandbox
      ? "Еркін алаң"
      : listKind === "bonus"
      ? "Қосымша " + level.id
      : "Деңгей " + level.id;
    $("#taskTitle").textContent = level.title;
    $("#taskBody").innerHTML = level.task;
    $("#hintText").hidden = true;
    $("#hintText").textContent = level.hint;
    $("#hintBtn").hidden = !!level.sandbox;
    $("#solutionText").hidden = true;
    $("#solutionText").textContent = level.solution;
    $("#solutionBtn").hidden = true;
    const back = $("#backLink");
    back.href = "#/" + course.id + "/" + listKind;
    back.textContent = listKind === "bonus" ? "← Қосымша тапсырмалар" : "← " + course.name + ": тапсырмалар";

    const cmds = $("#commands");
    cmds.hidden = !level.robot;
    const chips = $("#commandChips");
    chips.textContent = "";
    if (level.robot) {
      (course.commands || []).forEach((c) => {
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

    const saved = KZ.codeStore.get(course.id, level.id);
    let code = typeof saved === "string" ? saved : level.starter;
    if (level.sandbox && level.sandboxCode != null) code = level.sandboxCode;
    editor.setValue(code);
    editor.setCursor({ line: editor.lastLine(), ch: 0 });
    invalidate();
    refreshLevelStars();
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

  /* ---------- Деңгейлер мәзірі ---------- */
  function buildMenu() {
    const box = $("#menuList");
    box.textContent = "";
    const addLevel = (lv, kind) => {
      const b = el("a", "lv" + (level && lv.id === level.id ? " current" : ""));
      b.href = "#/" + course.id + "/play/" + lv.id;
      const n = KZ.progress.stars(course.id, lv.id);
      b.appendChild(el("span", "num", lv.id));
      b.appendChild(el("span", "t", lv.title));
      b.appendChild(el("span", "s", "⭐".repeat(n) + "☆".repeat(3 - n)));
      b.addEventListener("click", () => $("#menu").close());
      box.appendChild(b);
    };
    (course.topics || []).forEach((t) => {
      const items = (course.levels || []).filter((l) => KZ.topicOf(l) === t.id);
      if (!items.length) return;
      box.appendChild(el("h3", null, t.emoji + " " + t.id + " · " + t.title));
      items.forEach((l) => addLevel(l, "tasks"));
    });
    if ((course.bonus || []).length) {
      box.appendChild(el("h3", null, "🏆 Қосымша"));
      course.bonus.forEach((l) => addLevel(l, "bonus"));
    }
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
    if (!course) return;
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
    if (course && level) KZ.codeStore.set(course.id, level.id, editor.getValue());
    if (run || activeLine !== null) invalidate();
  });
  document.documentElement.style.setProperty("--dur", Math.min(0.35, (delay() * 0.8) / 1000) + "s");

  /* ---------- Сыртқы API ---------- */
  KZ.play = {
    /* Жұмыс алаңын ашу; табылмаса false */
    open(courseId, levelId) {
      stop();
      const c = KZ.getCourse(courseId);
      if (!c) return false;
      let found;
      if (levelId === "free") found = { level: null, kind: "tasks" };
      else found = KZ.findLevel(c, levelId);
      if (!found) return false;
      course = c;
      listKind = found.kind;
      list = listKind === "bonus" ? c.bonus : c.levels;
      level = found.level || sandboxLevel();
      if (!level.sandbox) KZ.last.set(course.id, level.id);
      loadLevel();
      ensurePython();
      setTimeout(() => editor.refresh(), 0);
      return true;
    },
    leave() {
      stop();
    },
  };
})();
