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
  /* Кеңес/шешім қолданылса, жұлдыз азаяды; бұл деңгейге сақталады (KZ.penalty) */
  const pkey = () => (level.assign ? ["assign", "a:" + level.assign.id] : [course.id, level.id]);
  const capNow = () => (level && !level.sandbox ? KZ.penalty.cap(...pkey()) : 3);
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
  KZ.attachHints(editor, () => engine);
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
      s.onerror = () => reject(new Error(KZ.t("Скрипт жүктелмеді: ") + src));
      document.head.appendChild(s);
    });
  }

  /* Pyodide бір рет жүктеледі: тапсырмалар да, ойын да осыны қолданады */
  let pyoPromise = null;
  KZ.pyodide = () =>
    pyoPromise ||
    (pyoPromise = (async () => {
      await loadScript(PY_BASE + "pyodide.js");
      return loadPyodide({ indexURL: PY_BASE });
    })().catch((e) => {
      pyoPromise = null;
      throw e;
    }));

  async function defaultLoader() {
    const py = await KZ.pyodide();
    const src = await (await fetch("py/runner.py")).text();
    py.runPython(src);
    if (KZ.lang === "ru") py.globals.set("_TR", py.toPy(KZ.ru)); // қате хабарларының орысша сөздігі
    const fn = py.globals.get("run");
    return (code, cfg) => fn(code, cfg);
  }

  /* Лекциядағы шағын редактор да осыны қолданады: Pyodide бір рет қана жүктеледі */
  let pyPromise = null;
  KZ.loadPython = () =>
    pyPromise ||
    (pyPromise = (KZ.pyLoader || defaultLoader)().catch((e) => {
      pyPromise = null;
      throw e;
    }));

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
    const isJs = engine === "js" || engine === "kt";
    const name = engine === "kt" ? "Kotlin" : isJs ? "JavaScript" : "Python";
    pyState = "loading";
    setStatus("loading", name + KZ.t(" жүктелуде…") + (isJs ? "" : KZ.t(" (алғашқы жолы 10–20 секунд)")));
    updateButtons();
    const mine = engine;
    try {
      const fn = await (engine === "kt" ? KZ.ktRunner.load() : isJs ? KZ.jsRunner.load() : KZ.loadPython());
      if (mine !== engine) return; // жүктеу кезінде басқа курсқа өтіп кеттік
      runFn = fn;
      loadedEngine = mine;
      pyState = "ready";
      setStatus("ready");
    } catch (e) {
      console.error(e);
      pyState = "error";
      setStatus("error", name + KZ.t(" жүктелмеді. Интернетті тексеріп, бетті қайта аш. (Алдын ала жүктеу: ⚙ Баптаулар → Офлайн.)"));
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
      setStatus("error", KZ.t("Күтпеген қате шықты. Бетті жаңартып көр."));
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
    const fwd = preview() && idx === i - 1 && i > 0 && !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
    idx = i;
    if (f.line) setLine(f.line, f.kind === "error" ? "cm-err" : "cm-exec");
    else clearLine();
    if (board) board.setState(f.robot, f.kind);
    renderVars(f.vars || [], loopInfoAt(i), preview() ? narrate(i) : null, fwd);
    if (fwd) flyAll(i);
    showOut(f, i, fwd);
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
    runBtn.textContent = playing ? KZ.t("⏸ Тоқтату") : run && !atEnd && idx >= 0 ? KZ.t("▶ Жалғастыру") : KZ.t("▶ Іске қосу");
    stepBtn.disabled = !ready || !!atEnd;
    backBtn.disabled = !run || idx <= 0;
    scrub.disabled = !run;
  }

  /* Жаңа визуализация (түсіндіру, ұшатын мән, сөздік кестесі, print) барлығына ашық */
  const preview = () => true;

  /* ---------- Қораптар (жад) ---------- */
  function renderVars(vars, loopInfo, narr, anim) {
    const box = $("#memory");
    box.textContent = "";
    const prev = shownVars;
    if (narr) box.appendChild(narrCard(narr));
    if (loopInfo) box.appendChild(loopCard(loopInfo));
    if (!vars.length) {
      if (!loopInfo)
        box.appendChild(el("p", "empty", KZ.t("Әзірге қораптар жоқ. x = 5 деп жазсаң, «x» қорабы осында пайда болады.")));
      shownVars = {};
      return;
    }
    vars.forEach((v) => {
      const old = prev[v.n];
      const isNew = !old;
      const changed = !isNew && old.r !== v.r;
      const card = el("div", "var" + (isNew ? " fresh" : changed ? " changed" : "") + (narr && narr.calc && narr.calc.names.includes(v.n) ? " src" : ""));
      card.style.setProperty("--c", KZ.colorFor(v.n));
      const name = el("div", "var-name", v.n);
      name.appendChild(el("small", null, v.t));
      if (v.i) name.appendChild(el("small", "len", "· " + (v.more ? v.i.length + "+" : v.i.length) + KZ.nt(v.i.length, " элемент")));
      card.appendChild(name);
      if (v.i) {
        const row = el("div", "var-cells");
        v.i.forEach((item, k) => {
          const was = old && old.i;
          const cls = !was || k >= was.length ? (isNew ? "" : " new") : was[k] !== item ? " hot" : "";
          const cell = el("div", "var-cell" + cls + (anim && cls ? " wait" : ""));
          cell.appendChild(el("div", "v", item));
          cell.appendChild(el("div", "i", String(k)));
          row.appendChild(cell);
        });
        if (v.more) row.appendChild(el("div", "var-cell", "…"));
        /* алынып тасталған элементтер (pop/remove): ұяшық жоғары көтеріліп жоғалады */
        if (anim && old && old.i && !v.more && !old.more && old.i.length > v.i.length) {
          for (let k = v.i.length; k < Math.min(old.i.length, v.i.length + 3); k++) {
            const g = el("div", "var-cell gone");
            g.appendChild(el("div", "v", old.i[k]));
            g.appendChild(el("div", "i", String(k)));
            row.appendChild(g);
          }
        }
        card.appendChild(row);
      } else if (v.d && preview()) {
        const tb = el("div", "var-dict");
        v.d.forEach((kv) => {
          const was = old && old.d && old.d.find((x) => x[0] === kv[0]);
          const row = el("div", "dict-row" + (!old || !old.d ? "" : !was ? " new" : was[1] !== kv[1] ? " hot" : ""));
          row.appendChild(el("div", "dk", kv[0]));
          row.appendChild(el("div", "dv", kv[1]));
          tb.appendChild(row);
        });
        if (v.dn > v.d.length) tb.appendChild(el("div", "dict-row", "…"));
        card.appendChild(tb);
      } else {
        if (!preview()) {
          if (changed && !old.i) card.appendChild(el("div", "var-old", old.r));
          card.appendChild(el("div", "var-box", v.r));
          box.appendChild(card);
          return;
        }
        const bx = el("div", "bx" + (isNew ? " fresh" : changed && !old.i ? " changed" : "") + (anim && (isNew || (changed && !old.i)) ? " wait" : ""));
        bx.dataset.v = v.n;
        const lids = el("div", "bx-lids");
        lids.append(el("i", "lid l"), el("i", "lid r"));
        const body = el("div", "bx-body");
        if (changed && !old.i) body.appendChild(el("div", "bx-old", old.r));
        body.appendChild(el("div", "bx-val", v.r));
        bx.append(lids, body);
        card.appendChild(bx);
        if (v.t === "str" && v.s && v.s.length >= 2 && v.s.length <= 12) {
          const row = el("div", "var-chars");
          Array.from(v.s).forEach((ch, k) => {
            const c = el("div", "var-cell");
            c.appendChild(el("div", "v", ch === " " ? "␣" : ch));
            c.appendChild(el("div", "i", String(k)));
            row.appendChild(c);
          });
          card.appendChild(row);
        }
      }
      box.appendChild(card);
    });
    shownVars = {};
    vars.forEach((v) => (shownVars[v.n] = { r: v.r, i: v.i, d: v.d, more: v.more }));
  }

  /* ---------- print: мәтін коддан экранға ұшып барып, әріп-әріптен жазылады ---------- */
  let outTimers = [];
  function showOut(f, i, fwd) {
    const con = $("#console");
    outTimers.forEach(clearTimeout);
    outTimers = [];
    document.querySelectorAll(".fly-token.out").forEach((n) => n.remove());
    con.classList.toggle("mon", preview());
    const now = f.out || "";
    const prev = i > 0 ? run.frames[i - 1] : null;
    const before = prev ? prev.out || "" : "";
    if (!fwd || now.length <= before.length || now.slice(0, before.length) !== before) {
      con.textContent = now;
      con.scrollTop = con.scrollHeight;
      return;
    }
    const add = now.slice(before.length);
    const d = delay();
    const F = d > 0 && d < 300 ? 0 : Math.round(d > 0 ? Math.min(650, Math.max(350, d * 0.6)) : 650);
    if (!F || !prev.line) {
      con.textContent = now;
      con.scrollTop = con.scrollHeight;
      return;
    }
    con.textContent = before;
    con.classList.add("typing");
    const r0 = con.getBoundingClientRect();
    if (r0.bottom > innerHeight - 30) window.scrollBy(0, Math.round(r0.bottom - innerHeight + 60));
    else if (r0.top < 70) window.scrollBy(0, Math.round(r0.top - 90));
    const r = con.getBoundingClientRect();
    const lineN = Math.max(0, Math.min(prev.line - 1, editor.lastLine()));
    let sx = innerWidth / 2;
    let sy = 80;
    try {
      const c = editor.charCoords({ line: lineN, ch: (editor.getLine(lineN) || "").length }, "window");
      sx = Math.min(Math.max(c.right - 6, 20), innerWidth - 20);
      sy = Math.min(Math.max((c.top + c.bottom) / 2, 20), innerHeight - 20);
    } catch (e) {
      /* координата табылмады */
    }
    const tx = r.left + Math.min(r.width / 2, 120);
    const ty = Math.min(r.bottom - 24, Math.max(r.top + 24, r.top + r.height / 2));
    const label = add.replace(/\n$/, "");
    const tok = el("div", "fly-token out", label.length > 22 ? label.slice(0, 21) + "…" : label);
    document.body.appendChild(tok);
    const at = (x, y, sc) => "translate(" + x + "px," + y + "px) translate(-50%,-50%) scale(" + sc + ")";
    const midY = Math.min(sy, ty) - 40;
    if (tok.animate) {
      const a = tok.animate(
        [
          { transform: at(sx, sy, 0.7), opacity: 0.2 },
          { transform: at(sx, sy - 24, 1.2), opacity: 1, offset: 0.2 },
          { transform: at((sx + tx) / 2, midY, 1.2), opacity: 1, offset: 0.55 },
          { transform: at(tx, ty, 0.9), opacity: 1 },
        ],
        { duration: F, easing: "cubic-bezier(.45,.05,.4,1)", fill: "forwards" }
      );
      a.onfinish = () => tok.remove();
    } else tok.remove();
    /* токен экранға түскенде мәтін әріп-әріптен жазылады */
    const step = Math.max(22, Math.min(80, 700 / Math.max(1, add.length)));
    let k = 0;
    const type = () => {
      k++;
      con.textContent = before + add.slice(0, k);
      con.scrollTop = con.scrollHeight;
      if (k < add.length) outTimers.push(setTimeout(type, step));
      else con.classList.remove("typing");
    };
    outTimers.push(setTimeout(() => {
      tok.remove();
      type();
    }, F - 30));
  }

  /* ---------- Мән коддан қорапқа ұшып барады ---------- */
  let flyTimers = [];
  function flyAll(i) {
    flyTimers.forEach(clearTimeout);
    flyTimers = [];
    document.querySelectorAll(".fly-token").forEach((n) => n.remove());
    const waits = Array.from(document.querySelectorAll("#memory .bx.wait, #memory .var-cell.wait"));
    if (!waits.length) return;
    const prev = run.frames[i - 1];
    const d = delay();
    const F = d > 0 && d < 300 ? 0 : Math.round(d > 0 ? Math.min(750, Math.max(380, d * 0.75)) : 750);
    const done = (bx) => {
      bx.classList.remove("wait");
      bx.classList.add("recv");
    };
    if (!F || !prev || !prev.line) return waits.forEach(done);
    /* қорап көрінбей тұрса, бетті сәл жылжытамыз: мәннің қайда түскенін көру үшін */
    const bodyOf = (n) => n.querySelector(".bx-body") || n;
    const r0 = bodyOf(waits[0]).getBoundingClientRect();
    if (r0.bottom > innerHeight - 30) window.scrollBy(0, Math.round(r0.bottom - innerHeight + 60));
    else if (r0.top < 70) window.scrollBy(0, Math.round(r0.top - 90));
    const lineN = Math.max(0, Math.min(prev.line - 1, editor.lastLine()));
    let sx = innerWidth / 2;
    let sy = 80;
    try {
      const c = editor.charCoords({ line: lineN, ch: (editor.getLine(lineN) || "").length }, "window");
      sx = Math.min(Math.max(c.right - 6, 20), innerWidth - 20);
      sy = Math.min(Math.max((c.top + c.bottom) / 2, 20), innerHeight - 20);
    } catch (e) {
      /* координата табылмады: жоғарыдан ұшады */
    }
    waits.slice(0, 3).forEach((bx, k) => {
      const val = bx.querySelector(".bx-val") || bx.querySelector(".v");
      const body = bodyOf(bx);
      const r = body.getBoundingClientRect();
      const tx = r.left + r.width / 2;
      const ty = r.top + r.height / 2;
      const tok = el("div", "fly-token", val ? val.textContent : "");
      document.body.appendChild(tok);
      const at = (x, y, sc) => "translate(" + x + "px," + y + "px) translate(-50%,-50%) scale(" + sc + ")";
      const mid = { x: (sx + tx) / 2, y: Math.min(sy, ty) - 50 - k * 10 };
      if (tok.animate) {
        const a = tok.animate(
          [
            { transform: at(sx, sy, 0.7), opacity: 0.2 },
            { transform: at(sx + (mid.x - sx) * 0.2, sy + (mid.y - sy) * 0.4, 1.2), opacity: 1, offset: 0.2 },
            { transform: at(mid.x, mid.y, 1.25), opacity: 1, offset: 0.55 },
            { transform: at(tx, ty - 6, 0.95), opacity: 1 },
          ],
          { duration: F, easing: "cubic-bezier(.45,.05,.4,1)", fill: "forwards" }
        );
        a.onfinish = () => tok.remove();
      } else tok.remove();
      flyTimers.push(setTimeout(() => done(bx), F - 40));
    });
    waits.slice(3).forEach(done);
    flyTimers.push(setTimeout(() => document.querySelectorAll(".fly-token").forEach((n) => n.remove()), F + 200));
  }

  /* ---------- Битлинг қадамды түсіндіреді ---------- */
  const indentOf = (t) => (/^\s*/.exec(t) || [""])[0].replace(/\t/g, "    ").length;
  function condOf(src) {
    return src
      .replace(/^(else\s+if|elif|if|while)\b\s*/, "")
      .replace(/\s*\{\s*$/, "")
      .replace(/:\s*$/, "")
      .replace(/^\((.*)\)$/, "$1")
      .trim();
  }
  /* өрнектегі айнымалыларды қазіргі мәндерімен алмастыру: total > 1 → 3 > 1 */
  function subst(expr, f) {
    const cur = {};
    ((f && f.vars) || []).forEach((v) => (cur[v.n] = v.r));
    return expr.replace(/(["'])(?:\\.|(?!\1).)*\1|[A-Za-z_]\w*/g, (w) => (/^["']/.test(w) || /^(and|or|not|in|is|True|False|true|false|null|None)$/.test(w) ? w : cur[w] !== undefined ? cur[w] : w));
  }
  /* арифметика: өрнек қадам-қадаммен есептеледі (120 × 5 → 600) */
  function buildCalc(expr, cur, want) {
    const re = /\s*(\d+\.?\d*|[A-Za-z_]\w*|\*\*|\/\/|[-+*\/%()])/y;
    const toks = [];
    let pos = 0;
    expr = expr.trim();
    let mm;
    while (pos < expr.length) {
      re.lastIndex = pos;
      mm = re.exec(expr);
      if (!mm) return null;
      pos = re.lastIndex;
      const w = mm[1];
      if (/^\d/.test(w)) toks.push({ k: "n", v: w });
      else if (/^[A-Za-z_]/.test(w)) {
        if (cur[w] === undefined || !/^-?\d+(\.\d+)?$/.test(cur[w])) return null;
        toks.push({ k: "n", v: cur[w], name: w });
      } else toks.push({ k: w === "(" ? "(" : w === ")" ? ")" : "o", v: w });
    }
    if (!toks.some((t) => t.k === "o") || toks.length > 15) return null;
    const names = Array.from(new Set(toks.filter((t) => t.name).map((t) => t.name)));
    const fmt = (x, fl) => (Number.isInteger(x) && fl ? x.toFixed(1) : String(x));
    const num = (t) => Number(t.v);
    const isF = (t) => /\./.test(t.v);
    const apply = (a, o, b) => {
      const x = num(a);
      const y = num(b);
      const fl = isF(a) || isF(b);
      if (o === "+") return fmt(x + y, fl);
      if (o === "-") return fmt(x - y, fl);
      if (o === "*") return fmt(x * y, fl);
      if (o === "/") return y === 0 ? null : fmt(x / y, true);
      if (o === "//") return y === 0 ? null : fmt(Math.floor(x / y), fl);
      if (o === "%") return y === 0 ? null : fmt(x - y * Math.floor(x / y), fl);
      if (o === "**") return fmt(Math.pow(x, y), fl);
      return null;
    };
    const prec = { "**": 3, "*": 2, "/": 2, "//": 2, "%": 2, "+": 1, "-": 1 };
    const rows = [];
    let cr = toks.slice();
    for (let g = 0; g < 8 && cr.length > 1; g++) {
      /* ішкі жақшаны табу */
      let lo = 0;
      let hi = cr.length;
      const cl = cr.findIndex((t) => t.k === ")");
      if (cl >= 0) {
        const op = cr.slice(0, cl).map((t) => t.k).lastIndexOf("(");
        if (op < 0) return null;
        lo = op + 1;
        hi = cl;
        if (hi - lo === 1) {
          rows.push({ t: cr, hl: [op, cl] });
          cr = cr.slice(0, op).concat([cr[lo]], cr.slice(cl + 1));
          continue;
        }
      }
      let best = -1;
      for (let k = lo; k < hi; k++) if (cr[k].k === "o" && (best < 0 || prec[cr[k].v] > prec[cr[best].v])) best = k;
      if (best <= lo - 0 && best < lo + 1) return null;
      const a = cr[best - 1];
      const b = cr[best + 1];
      if (!a || !b || a.k !== "n" || b.k !== "n") return null;
      const r = apply(a, cr[best].v, b);
      if (r === null) return null;
      rows.push({ t: cr, hl: [best - 1, best + 1] });
      cr = cr.slice(0, best - 1).concat([{ k: "n", v: r, res: true }], cr.slice(best + 2));
    }
    if (cr.length !== 1 || cr[0].k !== "n") return null;
    if (Math.abs(Number(cr[0].v) - Number(want)) > 1e-9 || !Number.isFinite(Number(want))) return null;
    rows.push({ t: cr, hl: [0, 0], fin: true });
    return { rows, names };
  }
  function narrate(i) {
    const f = run && run.frames[i];
    if (!f || !f.line || f.kind === "error") return null;
    const raw = editor.getLine(f.line - 1) || "";
    const src = raw.trim();
    if (!src || src.startsWith("#") || src.startsWith("//") || f.kind === "move" || f.kind === "collect" || f.kind === "crash") return null;
    const next = run.frames[i + 1];
    const prev = i > 0 ? run.frames[i - 1] : null;
    let text = null;
    let verdict = null;
    let eq = null;
    let fork = null;
    let calc = null;
    let m;
    if ((m = /^(?:\}\s*)?(if|else\s+if|elif|while)\b/.exec(src))) {
      const wh = m[1] === "while";
      text = (wh ? KZ.t("Шартты тексереміз (қайталау үшін): ") : KZ.t("Шартты тексереміз: ")) + "`" + condOf(src) + "`";
      if (next && next.line) {
        const ni = indentOf(editor.getLine(next.line - 1) || "");
        const inside = next.line === f.line + 1 || ni > indentOf(raw);
        fork = { expr: condOf(src), sub: subst(condOf(src), f), ok: inside, wh };
        verdict = inside ? { ok: true, t: wh ? KZ.t("✅ Ақиқат: цикл денесі қайта орындалады") : KZ.t("✅ Ақиқат: ішіндегі код орындалады") } : { ok: false, t: wh ? KZ.t("❌ Жалған: циклден шығамыз") : KZ.t("❌ Жалған: бұл блокты өткізіп жібереміз") };
      }
    } else if (/^(?:\}\s*)?for\b/.test(src)) {
      const li = loopInfoAt(i);
      text = KZ.t("Цикл: айнымалы келесі мәнді алады") + (li && !li.done ? " (" + Math.min(li.upto, li.rounds) + "/" + li.rounds + ")" : "");
      if (li && li.done) verdict = { ok: false, t: KZ.t("Мәндер бітті: циклден шығамыз") };
    } else if ((m = /^(?:def|fun|function)\s+(\w+)/.exec(src))) {
      text = KZ.t("Функция жасалады: ") + "`" + m[1] + "`" + KZ.t(" (әлі іске қосылмайды)");
    } else if (/^return\b/.test(src)) {
      text = KZ.t("Функция нәтижені қайтарып, шақырған жерге оралады");
    } else if (/^(print|println|console\.log)\b/.test(src)) {
      const was = (f.out || "").length;
      const after = next ? (next.out || "").slice(was).trim() : "";
      text = KZ.t("Экранға шығарамыз") + (after ? ": " + after : "");
    } else if ((m = /^(?:var\s+|val\s+|let\s+|const\s+)?([A-Za-z_][\w.\[\]'"]*)\s*(\+=|-=|\*=|\/=|=)(?!=)\s*(.+)$/.exec(src))) {
      const rhs = m[3].replace(/;$/, "");
      text = KZ.t("Айнымалыға мән жазамыз: ") + "`" + m[1] + "` " + (m[2] === "=" ? "←" : m[2]) + " `" + rhs + "`";
      /* ойша есептеу: айнымалы орнына мәнін қоямыз */
      const cur = {};
      (f.vars || []).forEach((v) => (cur[v.n] = v.r));
      const base = m[2] === "=" ? rhs : m[1] + " " + m[2].slice(0, -1) + " (" + rhs + ")";
      const sub = base.replace(/(["'])(?:\\.|(?!\1).)*\1|[A-Za-z_]\w*/g, (w) => (/^["']/.test(w) ? w : cur[w] !== undefined ? cur[w] : w));
      const tgt = next && (next.vars || []).find((v) => v.n === m[1]);
      if (tgt && sub !== tgt.r && (m[2] !== "=" || /[A-Za-z_+\-*\/%()\[\]]/.test(rhs)) && !/^["'].*["']$/.test(rhs)) {
        eq = { expr: sub, res: tgt.r };
        calc = buildCalc(base, cur, tgt.r);
        if (calc) eq = null;
      }
    } else text = KZ.t("Жолды орындаймыз: ") + "`" + src + "`";
    /* алдыңғы қадамның нәтижесі: өзгерген айнымалылар */
    const chips = [];
    if (prev) {
      const pv = {};
      (prev.vars || []).forEach((v) => (pv[v.n] = v.r));
      (f.vars || []).forEach((v) => {
        if (pv[v.n] === undefined) chips.push(v.n + " = " + v.r);
        else if (pv[v.n] !== v.r) chips.push(v.n + ": " + pv[v.n] + " → " + v.r);
      });
    }
    return { text, verdict, eq, fork, calc, chips: chips.slice(0, 4), n: i + 1 };
  }
  function narrCard(n) {
    const card = el("div", "narr");
    const face = el("div", "narr-face");
    face.innerHTML = KZ.hero ? KZ.hero.svg({ lite: true, still: true }) : "";
    const body = el("div", "narr-body");
    const line = el("div", "narr-t");
    n.text.split("`").forEach((part, k) => line.appendChild(k % 2 ? el("code", null, part) : document.createTextNode(part)));
    body.appendChild(line);
    if (n.calc) {
      const cb = el("div", "calc");
      const sym = { "*": "×", "/": "÷", "**": "^" };
      n.calc.rows.forEach((r, k) => {
        const row = el("div", "calc-row" + (r.fin ? " fin" : ""));
        row.style.animationDelay = k * 1.15 + "s";
        if (r.fin) row.appendChild(el("span", "calc-eq", "="));
        r.t.forEach((t, j) => {
          const hl = !r.fin && j >= r.hl[0] && j <= r.hl[1];
          if (t.k === "n") {
            const c = el("span", "cc" + (hl ? " hl" : "") + (t.res ? " res" : "") + (r.fin ? " big" : ""));
            if (t.name) {
              c.style.setProperty("--c", KZ.colorFor(t.name));
              c.appendChild(el("small", null, t.name));
            }
            c.appendChild(document.createTextNode(t.v));
            row.appendChild(c);
          } else row.appendChild(el("span", "co" + (hl ? " hl" : ""), t.k === "o" ? sym[t.v] || t.v : t.v));
        });
        cb.appendChild(row);
      });
      body.appendChild(cb);
    } else if (n.eq) {
      const e = el("div", "narr-eq");
      e.append("🧮 ", el("code", null, n.eq.expr), " = ", el("code", null, n.eq.res));
      body.appendChild(e);
    }
    if (n.fork) {
      const fk = el("div", "fork " + (n.fork.ok ? "yes" : "no"));
      const q = el("div", "fork-q");
      q.appendChild(el("code", null, n.fork.sub));
      q.appendChild(el("b", "fork-b", n.fork.ok ? "True" : "False"));
      const arms = el("div", "fork-arms");
      const yes = el("div", "fork-arm y", n.fork.wh ? KZ.t("иә → цикл денесі") : KZ.t("иә → ішіндегі код"));
      const no = el("div", "fork-arm n", n.fork.wh ? KZ.t("жоқ → циклден шығу") : KZ.t("жоқ → өткізу"));
      arms.append(yes, no);
      fk.append(q, arms);
      body.appendChild(fk);
    } else if (n.verdict) body.appendChild(el("div", "narr-v " + (n.verdict.ok ? "yes" : "no"), n.verdict.t));
    if (n.chips.length) {
      const row = el("div", "narr-chips");
      n.chips.forEach((c) => row.appendChild(el("span", "narr-chip", c)));
      body.appendChild(row);
    }
    card.append(face, body);
    return card;
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
    /* for: айнымалы әр айналымда қандай мән алатынын алдын ала көрсетеміз */
    let seq = null;
    let name = null;
    if (m[1] === "for") {
      const mm = /^for\s*\(?\s*(?:(?:let|const|var|val)\s+)?(\w+)\s*(?:in|of|=)/.exec(src);
      if (mm) {
        name = mm[1];
        seq = [];
        run.frames.forEach((g, k) => {
          if (g.line === f.line && g.kind !== "error" && run.frames[k + 1]) {
            const nv = (run.frames[k + 1].vars || []).find((x) => x.n === name);
            if (nv && run.frames[k + 1].line !== f.line) seq.push(nv.r);
          }
        });
        seq = seq.slice(0, rounds);
        if (seq.length !== rounds) seq = null;
      }
    }
    return { src, upto, rounds, done: upto > rounds, kw: m[1], seq, name };
  }
  function loopCard(info) {
    const card = el("div", "loopbox");
    const cur = Math.min(info.upto, info.rounds);
    card.appendChild(
      el("div", "loop-t", info.done ? KZ.t("🔁 Цикл аяқталды · ") + info.rounds + KZ.nt(info.rounds, " айналым") : "🔁 " + cur + KZ.t("-айналым / ") + info.rounds)
    );
    if (info.seq && info.seq.length <= 12) {
      const tr = el("div", "loop-track");
      tr.appendChild(el("span", "lt-name", info.name + " ∈"));
      info.seq.forEach((val, k) => {
        const st = info.done || k + 1 < cur ? " past" : k + 1 === cur ? " now" : "";
        tr.appendChild(el("span", "lt" + st, val));
      });
      tr.appendChild(el("span", "lt-back" + (info.done ? " out" : ""), info.done ? "🏁" : "↻"));
      card.appendChild(tr);
      return card;
    }
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
    if (KZ.mistakes && level && !level.sandbox && !level.assign && course) {
      if (kind === "bad" || kind === "err") KZ.mistakes.add(course.id, KZ.topicOf(level));
      else if (kind === "ok") KZ.mistakes.ok(course.id, KZ.topicOf(level));
    }
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
        return { ok: false, reason: KZ.t("Экранға шыққан нәтиже күтілгенге сәйкес емес. Тапсырма шартын қайта оқып, кодты тексер.") };
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
        r.cap = capNow();
        r.evaluated = { pending: true };
        evalAssign(r, lv.assign).then((ev) => {
          if (run !== r) return;
          if (ev.ok && ev.stars) ev.stars = Math.min(ev.stars, r.cap);
          if (ev.ok && !lv.assign.manager) KZ.penalty.clear("assign", "a:" + lv.assign.id);
          r.evaluated = ev;
          if (ev.ok) {
            if (!lv.assign.manager) {
              KZ.assign
                .submit(lv.assign.id, ev.stars)
                .then((best) => {
                  lv.assign.stars = best;
                  if (level === lv) refreshLevelStars();
                })
                .catch((e) => KZ.toast("⚠️", KZ.t("Нәтиже жіберілмеді"), e.message));
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
      run.cap = capNow();
      if (run.evaluated.ok && run.evaluated.stars) run.evaluated.stars = Math.min(run.evaluated.stars, run.cap);

      if (run.evaluated.ok && !level.sandbox) {
        KZ.progress.set(course.id, level.id, run.evaluated.stars);
        KZ.penalty.clear(course.id, level.id);
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
        box.appendChild(el("h2", null, KZ.t("🙈 Қате шықты")));
        box.appendChild(el("p", null, e.msg));
        box.appendChild(el("small", null, (e.line ? e.line + KZ.t("-жол · ") : "") + (e.detail || "")));
        if (e.src) box.appendChild(el("pre", "err-line", e.src));
        if (e.tip) box.appendChild(el("p", "err-tip", "💡 " + e.tip));
      });
    } else if (level.sandbox) {
      hideResult();
    } else if (!ev.ok) {
      showResult("bad", (box) => {
        box.appendChild(el("h2", null, KZ.t("🤔 Әлі толық емес")));
        box.appendChild(el("p", null, ev.reason));
        box.appendChild(el("small", null, KZ.t("Кодты өзгертіп, қайта іске қосып көр.")));
      });
    } else {
      if (window.KZS) KZS.beep("win");
      showResult("ok", (box) => {
        box.appendChild(el("h2", null, KZ.t("🎉 Тамаша!")));
        box.appendChild(el("div", "big-stars", "⭐".repeat(ev.stars) + "☆".repeat(3 - ev.stars)));
        box.appendChild(
          el(
            "p",
            null,
            ev.stars === 3
              ? KZ.t("Ең қысқа шешім! Керемет.")
              : run.cap === 1
              ? KZ.t("Шешімді қарағандықтан 1 ⭐. Келесі тапсырманы өзің шешіп көр!")
              : run.cap === 2 && ev.stars === 2
              ? KZ.t("Кеңес қолданылды, сондықтан ең көбі 2 ⭐. Келесі жолы кеңессіз 3 ⭐ ал!")
              : KZ.t("3 ⭐ алу үшін кодты ") + level.par + KZ.nt(level.par, " жолға дейін қысқартып көр (қазір ") + run.lines + KZ.nt(run.lines, " жол).")
          )
        );
        const row = el("div", "row");
        if (level.assign && level.assign.manager) {
          box.appendChild(el("small", null, KZ.t("Мұғалім ретінде тексеріп жатырсың: нәтиже сақталмайды.")));
        }
        const next = level.assign ? null : nextHref();
        if (level.assign) {
          const a = el("a", "btn primary", level.assign.manager ? KZ.t("← Сыныптарға оралу") : KZ.t("← Менің тапсырмаларым"));
          a.href = level.assign.manager ? "#/teacher" : "#/account";
          row.appendChild(a);
        } else if (next) {
          const lec = KZ.nextLectureHref(course, level, list, listKind);
          if (lec) {
            const l = el("a", "btn primary", KZ.t("📖 Келесі лекция →"));
            l.href = lec;
            row.appendChild(l);
          }
          if (!lec) {
            const a = el("a", "btn primary", KZ.t("Келесі тапсырма →"));
            a.href = next;
            row.appendChild(a);
          }
        } else {
          const a = el("a", "btn primary", KZ.t("← Курсқа оралу"));
          a.href = "#/" + course.id + "/" + listKind;
          row.appendChild(a);
        }
        const again = el("button", "btn", KZ.t("↺ Қайта көру"));
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
    const isKt = engine === "kt";
    const robot = isJs || isKt || (s && s.robot === false) ? null : (s && s.robot) || DEFAULT_ROBOT;
    return {
      id: "free",
      sandbox: true,
      title: KZ.t("Еркін алаң"),
      task:
        KZ.t("<p>Мұнда тапсырма жоқ: кез келген код жазып, не болатынын көр. Қателесуден қорықпа!</p>") +
        KZ.t("<p class='tip'>Кодты ⏭ «Қадам» арқылы бір-бірден орындап, оң жақтағы қораптарға қара.</p>"),
      hint: "",
      starter: isKt ? KZ.t("fun main() {\n    // өз кодыңды жаз\n    \n}\n") : isJs ? KZ.t("// өз кодыңды жаз\n") : KZ.t("# өз кодыңды жаз\n"),
      solution: "",
      par: 99,
      robot,
      html: isJs ? KZ.t('<h1 id="title">Сәлем!</h1>\n<button id="btn">Бас</button>\n<p id="out"></p>') : undefined,
      check: {},
      sandboxCode: s && typeof s.code === "string" ? s.code : null,
    };
  }

  function loadLevel() {
    stop();
    attempts = 0;
    $("#levelBadge").textContent = level.sandbox
      ? KZ.t("Еркін алаң")
      : level.assign
      ? KZ.t("Мұғалім тапсырмасы")
      : level.debug
      ? KZ.t("🐞 Қате тап ") + level.id
      : listKind === "bonus"
      ? KZ.t("Қосымша ") + level.id
      : KZ.t("Деңгей ") + level.id;
    const isJs = engine === "js";
    const isKt = engine === "kt";
    editor.setOption("mode", isKt ? "text/x-kotlin" : isJs ? "javascript" : "python");
    editor.setOption("indentUnit", isJs ? 2 : 4);
    editor.setOption("tabSize", isJs ? 2 : 4);
    $("#editorTitle").textContent = isKt ? KZ.t("Kotlin коды") : isJs ? KZ.t("JavaScript коды") : KZ.t("Python коды");
    $("#consoleTitle").textContent = isKt ? KZ.t("Экран (println)") : isJs ? KZ.t("Экран (console.log)") : KZ.t("Экран (print)");
    $("#console").dataset.ph = isKt ? KZ.t("Мұнда println жазғаныңның нәтижесі шығады") : isJs ? KZ.t("Мұнда console.log жазғаныңның нәтижесі шығады") : KZ.t("Мұнда print жазғаныңның нәтижесі шығады");
    $("#domCard").hidden = !(isJs && typeof level.html === "string");
    $("#taskTitle").textContent = level.title;
    $("#taskBody").innerHTML = level.task;
    $("#hintText").hidden = true;
    $("#hintText").textContent = level.hint;
    $("#hintBtn").hidden = !!level.sandbox || !!(level.assign && !level.assign.hint);
    $("#solutionText").hidden = true;
    $("#solutionText").textContent = level.solution;
    $("#solutionBtn").hidden = true;
    shareBtn.hidden = !level.sandbox;
    /* Осы тапсырма тақырыбының лекциясы бар болса — батырма көрінеді */
    const lecBtn = $("#lecBtn");
    const lec = !level.sandbox && !level.assign ? (course.lectures || []).find((l) => String(l.topic) === KZ.topicOf(level)) : null;
    lecBtn.hidden = !lec;
    lecBtn.onclick = lec ? () => KZ.views.lectureModal(course, lec) : null;
    const back = $("#backLink");
    if (level.assign) {
      back.href = level.assign.manager ? "#/teacher" : "#/account";
      back.textContent = level.assign.manager ? KZ.t("← Сыныптарым") : KZ.t("← Менің тапсырмаларым");
    } else {
      back.href = "#/" + course.id + "/" + listKind;
      back.textContent = listKind === "bonus" ? KZ.t("← Қосымша тапсырмалар") : "← " + course.name + KZ.t(": тапсырмалар");
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
      box.appendChild(el("h3", null, KZ.t("🏆 Қосымша")));
      plain.forEach((l) => addLevel(l, "bonus"));
    }
    if (dbg.length) {
      box.appendChild(el("h3", null, KZ.t("🐞 Қате тап")));
      dbg.forEach((l) => addLevel(l, "bonus"));
    }
  }

  /* ---------- Оқиғалар ---------- */
  runBtn.addEventListener("click", () => (playing ? stop() : play()));
  stepBtn.addEventListener("click", stepForward);
  backBtn.addEventListener("click", stepBack);
  resetBtn.addEventListener("click", invalidate);

  /* Кодты сілтеме етіп бөлісу: код сілтеменің өзінде (сервер керек емес), ашқан адам Еркін алаңда көреді */
  const shareBtn = $("#shareBtn");
  const enc = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  shareBtn.addEventListener("click", async () => {
    const code = editor.getValue();
    if (!code.trim()) return KZ.toast("🔗", KZ.t("Код бос"), KZ.t("Алдымен код жаз."));
    if (code.length > 3000) return KZ.toast("🔗", KZ.t("Код тым ұзын"), KZ.t("Бөлісу үшін 3000 таңбадан аспауы керек."));
    const url = location.origin + location.pathname + "#/" + course.id + "/play/free/s/" + enc(code);
    try {
      if (navigator.share) await navigator.share({ title: "Bitlings", url });
      else {
        await navigator.clipboard.writeText(url);
        KZ.toast("🔗", KZ.t("Сілтеме көшірілді"), KZ.t("Досыңа жібер: ол кодыңды Еркін алаңда ашады."));
      }
    } catch (e) {
      if (e && e.name === "AbortError") return;
      window.prompt(KZ.t("Сілтемені көшір:"), url);
    }
  });
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
    if (!h.hidden && level && !level.sandbox) KZ.penalty.hint(...pkey());
  });
  $("#solutionBtn").addEventListener("click", () => {
    const s = $("#solutionText");
    s.hidden = !s.hidden;
    if (!s.hidden && level && !level.sandbox) KZ.penalty.solution(...pkey());
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
      engine = c.engine === "js" ? "js" : c.engine === "kt" ? "kt" : "python";
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
      engine = c.engine === "js" ? "js" : c.engine === "kt" ? "kt" : "python";
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
      const key = eng === "js" ? "js" : eng === "kt" ? "kt" : "python";
      if (!onceFns[key]) onceFns[key] = await (key === "kt" ? KZ.ktRunner.load() : key === "js" ? KZ.jsRunner.load() : KZ.loadPython());
      const raw = onceFns[key](code, JSON.stringify({}));
      const res = typeof raw === "string" ? JSON.parse(raw) : raw;
      return { output: res.output || "", lines: res.lines || 0, error: res.error || null };
    },
    leave() {
      stop();
    },
  };
})();
