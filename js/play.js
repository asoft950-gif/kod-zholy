/* Bitlings: Python жұмыс алаңы (редактор, қадамдап қайта ойнату, тексеру) */
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
  let runFn = null; // қозғалтқыш дайын болғанда толады
  let loadedEngine = null; // runFn қай қозғалтқышқа тиесілі: python | js
  let engine = "python";
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
  const onceFns = {};

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
    autoCloseBrackets: true,
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

  /* ---------- Қозғалтқыш жүктеу (алғаш қажет болғанда ғана) ---------- */
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
    if (loadedEngine !== engine) {
      runFn = null;
      pyState = "idle";
    }
    if (runFn || pyState === "loading") return;
    const isJs = engine === "js";
    const name = isJs ? "JavaScript" : "Python";
    pyState = "loading";
    setStatus("loading", name + " жүктелуде…" + (isJs ? "" : " (алғашқы жолы 10–20 секунд)"));
    updateButtons();
    const mine = engine;
    try {
      const fn = await (isJs ? KZ.jsRunner.load() : (KZ.pyLoader || defaultLoader)());
      if (mine !== engine) return; // жүктеу кезінде басқа курсқа өтіп кеттік
      runFn = fn;
      loadedEngine = mine;
      pyState = "ready";
      setStatus("ready");
    } catch (e) {
      console.error(e);
      pyState = "error";
      setStatus("error", name + " жүктелмеді. Интернетті тексеріп, бетті қайта аш. (Алдын ала жүктеу: ⚙ Баптаулар → Офлайн.)");
    }
    updateButtons();
  }

  /* ---------- Орындау ---------- */
  function execute() {
    const code = editor.getValue();
    let res;
    try {
      const raw = runFn(code, JSON.stringify({ robot: level.robot, html: typeof level.html === "string" ? level.html : undefined }));
      res = typeof raw === "string" ? JSON.parse(raw) : raw;
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
    renderVars(f.vars || [], loopInfoAt(i));
    $("#console").textContent = f.out || "";
    renderNote(f);
    showDom(f, i === lastIdx());
    scrub.value = String(i);
    updateCounter();
    if (i === lastIdx()) onEnd();
    else hideResult();
    updateButtons();
  }

  /* ---------- DOM көрінісі (JavaScript) ---------- */
  let domShown = null;
  function showDom(f, atEnd) {
    const card = $("#domCard");
    if (!card || card.hidden) return;
    const stat = $("#domPreview");
    const liveHost = $("#domLive");
    if (atEnd && run && run.dom) {
      // соңғы кадр: нағыз бет, батырмаларды басуға болады
      liveHost.classList.remove("off");
      stat.hidden = true;
      return;
    }
    liveHost.classList.add("off");
    stat.hidden = false;
    if (f.dom !== undefined && f.dom !== domShown) {
      domShown = f.dom;
      stat.srcdoc = f.dom;
    }
  }

  function renderDomInitial() {
    const card = $("#domCard");
    if (!card || card.hidden) return;
    $("#domLive").classList.add("off");
    $("#domPreview").hidden = false;
    domShown = KZ.buildWebDoc("html", level.html || "", null, false);
    $("#domPreview").srcdoc = domShown;
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
  function renderVars(vars, loopInfo) {
    const box = $("#memory");
    box.textContent = "";
    const prev = shownVars;
    if (loopInfo) box.appendChild(loopCard(loopInfo));
    if (!vars.length) {
      if (!loopInfo)
        box.appendChild(el("p", "empty", "Әзірге қораптар жоқ. x = 5 деп жазсаң, «x» қорабы осында пайда болады."));
      shownVars = {};
      return;
    }
    vars.forEach((v) => {
      const old = prev[v.n];
      const isNew = !old;
      const changed = !isNew && old.r !== v.r;
      const card = el("div", "var" + (isNew ? " fresh" : changed ? " changed" : ""));
      card.style.setProperty("--c", KZ.colorFor(v.n));
      const name = el("div", "var-name", v.n);
      name.appendChild(el("small", null, v.t));
      if (v.i) name.appendChild(el("small", "len", "· " + (v.more ? v.i.length + "+" : v.i.length) + " элемент"));
      card.appendChild(name);
      if (v.i) {
        const row = el("div", "var-cells");
        v.i.forEach((item, k) => {
          const was = old && old.i;
          const cls = !was || k >= was.length ? (isNew ? "" : " new") : was[k] !== item ? " hot" : "";
          const cell = el("div", "var-cell" + cls);
          cell.appendChild(el("div", "v", item));
          cell.appendChild(el("div", "i", String(k)));
          row.appendChild(cell);
        });
        if (v.more) row.appendChild(el("div", "var-cell", "…"));
        card.appendChild(row);
      } else {
        if (changed && !old.i) card.appendChild(el("div", "var-old", old.r));
        card.appendChild(el("div", "var-box", v.r));
      }
      box.appendChild(card);
    });
    shownVars = {};
    vars.forEach((v) => (shownVars[v.n] = { r: v.r, i: v.i }));
  }

  /* Цикл көрсеткіші: for/while жолына неше рет келді */
  function loopInfoAt(i) {
    const f = run && run.frames[i];
    if (!f || !f.line || f.kind === "error") return null;
    const src = (editor.getLine(f.line - 1) || "").trim();
    const m = /^(for|while)\b/.exec(src);
    if (!m) return null;
    let total = 0;
    let upto = 0;
    run.frames.forEach((g, k) => {
      if (g.line === f.line && g.kind !== "error") {
        total++;
        if (k <= i) upto++;
      }
    });
    const rounds = Math.max(total - 1, 0); // соңғы келу: цикл аяқталатын тексеру
    return { src, upto, rounds, done: upto > rounds, kw: m[1] };
  }
  function loopCard(info) {
    const card = el("div", "loopbox");
    const cur = Math.min(info.upto, info.rounds);
    card.appendChild(
      el("div", "loop-t", info.done ? "🔁 Цикл аяқталды · " + info.rounds + " айналым" : "🔁 " + cur + "-айналым / " + info.rounds)
    );
    const dots = el("div", "loop-dots");
    for (let k = 1; k <= Math.min(info.rounds, 40); k++) {
      dots.appendChild(el("span", "ld" + (k < cur || info.done ? " done" : k === cur ? " now" : "")));
    }
    card.appendChild(dots);
    return card;
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
    renderDomInitial();
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
    if (KZ.hero && KZ.hero.react && (kind === "ok" || kind === "bad" || kind === "err")) KZ.hero.react(kind);
  }

  function nextHref() {
    const i = list.findIndex((l) => l.id === level.id);
    if (i >= 0 && i < list.length - 1) return "#/" + course.id + "/play/" + list[i + 1].id;
    return null;
  }

  /* Мұғалім тапсырмасы: нәтиженің хэшін күтілген хэшпен салыстыру */
  async function evalAssign(r, a) {
    try {
      const hash = await KZ.assign.hash(r.output);
      if (hash !== a.expected_hash) {
        return { ok: false, reason: "Экранға шыққан нәтиже күтілгенге сәйкес емес. Тапсырма шартын қайта оқып, кодты тексер." };
      }
      return { ok: true, stars: KZ.starsFor({ par: a.par || 999 }, r.lines) };
    } catch (e) {
      return { ok: false, reason: e.message };
    }
  }

  function onEnd() {
    if (run.evaluated === null) {
      if (level.assign && !run.error) {
        const r = run;
        const lv = level;
        r.evaluated = { pending: true };
        evalAssign(r, lv.assign).then((ev) => {
          if (run !== r) return;
          r.evaluated = ev;
          if (ev.ok) {
            if (!lv.assign.manager) {
              KZ.assign
                .submit(lv.assign.id, ev.stars)
                .then((best) => {
                  lv.assign.stars = best;
                  if (level === lv) refreshLevelStars();
                })
                .catch((e) => KZ.toast("⚠️", "Нәтиже жіберілмеді", e.message));
              if (KZ.activity) KZ.activity.onLevel("assign", lv.assign.id, ev.stars, null);
            }
          } else {
            attempts++;
          }
          renderEnd();
        });
        return;
      }
      if (run.error) run.evaluated = { ok: false, error: true };
      else if (level.sandbox) run.evaluated = { ok: true, sandbox: true };
      else run.evaluated = KZ.evaluate(level, run);

      if (run.evaluated.ok && !level.sandbox) {
        KZ.progress.set(course.id, level.id, run.evaluated.stars);
        KZ.updateTotal();
        refreshLevelStars();
      } else if (!run.evaluated.ok) {
        attempts++;
        if (attempts >= 3 && !level.sandbox && !level.assign) $("#solutionBtn").hidden = false;
      }
    }
    renderEnd();
  }

  function renderEnd() {
    if (run.evaluated && run.evaluated.pending) return;
    const ev = run.evaluated;

    if (run.error) {
      const e = run.error;
      if (window.KZS && run.error.kind !== "crash") KZS.beep("error");
      showResult("err", (box) => {
        box.appendChild(el("h2", null, "🙈 Қате шықты"));
        box.appendChild(el("p", null, e.msg));
        box.appendChild(el("small", null, (e.line ? e.line + "-жол · " : "") + (e.detail || "")));
        if (e.src) box.appendChild(el("pre", "err-line", e.src));
        if (e.tip) box.appendChild(el("p", "err-tip", "💡 " + e.tip));
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
      if (window.KZS) KZS.beep("win");
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
        if (level.assign && level.assign.manager) {
          box.appendChild(el("small", null, "Мұғалім ретінде тексеріп жатырсың: нәтиже сақталмайды."));
        }
        const next = level.assign ? null : nextHref();
        if (level.assign) {
          const a = el("a", "btn primary", level.assign.manager ? "← Сыныптарға оралу" : "← Менің тапсырмаларым");
          a.href = level.assign.manager ? "#/teacher" : "#/account";
          row.appendChild(a);
        } else if (next) {
          const lec = KZ.nextLectureHref(course, level, list, listKind);
          if (lec) {
            const l = el("a", "btn primary", "📖 Келесі лекция →");
            l.href = lec;
            row.appendChild(l);
          }
          if (!lec) {
            const a = el("a", "btn primary", "Келесі тапсырма →");
            a.href = next;
            row.appendChild(a);
          }
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
    const n = level.sandbox ? 0 : level.assign ? level.assign.stars || 0 : KZ.progress.stars(course.id, level.id);
    $("#levelStars").textContent = level.sandbox ? "" : "⭐".repeat(n) + "☆".repeat(3 - n);
  }

  function sandboxLevel() {
    const s = KZ.store.getSession("kodzholy.sandbox", null);
    KZ.store.setSession("kodzholy.sandbox", null);
    const isJs = engine === "js";
    const robot = isJs || (s && s.robot === false) ? null : (s && s.robot) || DEFAULT_ROBOT;
    return {
      id: "free",
      sandbox: true,
      title: "Еркін алаң",
      task:
        "<p>Мұнда тапсырма жоқ: кез келген код жазып, не болатынын көр. Қателесуден қорықпа!</p>" +
        "<p class='tip'>Кодты ⏭ «Қадам» арқылы бір-бірден орындап, оң жақтағы қораптарға қара.</p>",
      hint: "",
      starter: isJs ? "// өз кодыңды жаз\n" : "# өз кодыңды жаз\n",
      solution: "",
      par: 99,
      robot,
      html: isJs ? '<h1 id="title">Сәлем!</h1>\n<button id="btn">Бас</button>\n<p id="out"></p>' : undefined,
      check: {},
      sandboxCode: s && typeof s.code === "string" ? s.code : null,
    };
  }

  function loadLevel() {
    stop();
    attempts = 0;
    $("#levelBadge").textContent = level.sandbox
      ? "Еркін алаң"
      : level.assign
      ? "Мұғалім тапсырмасы"
      : level.debug
      ? "🐞 Қате тап " + level.id
      : listKind === "bonus"
      ? "Қосымша " + level.id
      : "Деңгей " + level.id;
    const isJs = engine === "js";
    editor.setOption("mode", isJs ? "javascript" : "python");
    editor.setOption("indentUnit", isJs ? 2 : 4);
    editor.setOption("tabSize", isJs ? 2 : 4);
    $("#editorTitle").textContent = isJs ? "JavaScript коды" : "Python коды";
    $("#consoleTitle").textContent = isJs ? "Экран (console.log)" : "Экран (print)";
    $("#console").dataset.ph = isJs ? "Мұнда console.log жазғаныңның нәтижесі шығады" : "Мұнда print жазғаныңның нәтижесі шығады";
    $("#domCard").hidden = !(isJs && typeof level.html === "string");
    $("#taskTitle").textContent = level.title;
    $("#taskBody").innerHTML = level.task;
    $("#hintText").hidden = true;
    $("#hintText").textContent = level.hint;
    $("#hintBtn").hidden = !!level.sandbox || !!(level.assign && !level.assign.hint);
    $("#solutionText").hidden = true;
    $("#solutionText").textContent = level.solution;
    $("#solutionBtn").hidden = true;
    const back = $("#backLink");
    if (level.assign) {
      back.href = level.assign.manager ? "#/teacher" : "#/account";
      back.textContent = level.assign.manager ? "← Сыныптарым" : "← Менің тапсырмаларым";
    } else {
      back.href = "#/" + course.id + "/" + listKind;
      back.textContent = listKind === "bonus" ? "← Қосымша тапсырмалар" : "← " + course.name + ": тапсырмалар";
    }

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
    const plain = (course.bonus || []).filter((l) => !l.debug);
    const dbg = (course.bonus || []).filter((l) => l.debug);
    if (plain.length) {
      box.appendChild(el("h3", null, "🏆 Қосымша"));
      plain.forEach((l) => addLevel(l, "bonus"));
    }
    if (dbg.length) {
      box.appendChild(el("h3", null, "🐞 Қате тап"));
      dbg.forEach((l) => addLevel(l, "bonus"));
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
      engine = c.engine === "js" ? "js" : "python";
      listKind = found.kind;
      list = listKind === "bonus" ? c.bonus : c.levels;
      level = found.level || sandboxLevel();
      if (!level.sandbox) KZ.last.set(course.id, level.id);
      loadLevel();
      ensurePython();
      setTimeout(() => editor.refresh(), 0);
      return true;
    },
    /* Мұғалім тапсырмасын ашу (KZ.assign.get нәтижесі) */
    openAssignment(a) {
      stop();
      const c = KZ.getCourse(a.course);
      if (!c) return false;
      course = c;
      engine = c.engine === "js" ? "js" : "python";
      listKind = "assign";
      list = [];
      level = {
        id: "t-" + a.id,
        assign: a,
        title: a.title,
        task: KZ.assign.bodyHtml(a),
        hint: a.hint || "",
        starter: a.starter || "",
        solution: "",
        par: a.par || 999,
        check: {},
      };
      loadLevel();
      ensurePython();
      setTimeout(() => editor.refresh(), 0);
      return true;
    },
    /* Кодты бір рет орындап, экран нәтижесін қайтару (мұғалім шешімін тексеруі үшін) */
    async runOnce(eng, code) {
      const key = eng === "js" ? "js" : "python";
      if (!onceFns[key]) onceFns[key] = await (key === "js" ? KZ.jsRunner.load() : (KZ.pyLoader || defaultLoader)());
      const raw = onceFns[key](code, JSON.stringify({}));
      const res = typeof raw === "string" ? JSON.parse(raw) : raw;
      return { output: res.output || "", lines: res.lines || 0, error: res.error || null };
    },
    leave() {
      stop();
    },
  };
})();
