/* Bitlings: лекция ішіндегі «Өзің көр» шағын редакторы.
   Бетті ауыстырмайды, еркін алаңға (робот, жұлдыз) апармайды: код пен нәтиже (консоль, айнымалылар, робот, бет, кесте) дәл мысалдың жанында. */
(() => {
  "use strict";
  const { el } = KZ;
  const ROBOT_RE = /\b(alga|onga|solga|zhinau|zhuldyz_bar|aldy_bos|onga_burul|solga_burul|vpered|napravo|nalevo|sobrat|zvezda_est|vperedi_svobodno)\s*\(/;
  const DEFAULT_ROBOT = { cols: 7, rows: 5, start: { x: 0, y: 2, d: 1 }, stars: [[3, 2], [6, 2], [3, 0]] };
  const JS_HTML = KZ.t('<h1 id="title">Сәлем!</h1>\n<button id="btn">Бас</button>\n<p id="out"></p>');
  const MODES = { python: "python", js: "javascript", kt: "text/x-kotlin", sql: "text/x-sql", web: "htmlmixed" };

  function table(set) {
    const t = el("table", "itry-tbl");
    const head = el("tr");
    set.columns.forEach((c) => head.appendChild(el("th", null, String(c))));
    t.appendChild(head);
    set.values.slice(0, 30).forEach((r) => {
      const tr = el("tr");
      r.forEach((v) => tr.appendChild(el("td", typeof v === "number" ? "num" : v === null ? "null" : null, v === null ? "NULL" : String(v))));
      t.appendChild(tr);
    });
    return t;
  }

  function varsView(vars) {
    const row = el("div", "itry-vars");
    (vars || []).forEach((v) => {
      if (!v || !v.n || String(v.n).startsWith("__")) return;
      const card = el("div", "var");
      card.style.setProperty("--c", KZ.colorFor(v.n));
      card.appendChild(el("div", "var-name", v.n));
      if (v.i) {
        const cells = el("div", "var-cells");
        v.i.forEach((item, k) => {
          const cell = el("div", "var-cell");
          cell.appendChild(el("div", "v", item));
          cell.appendChild(el("div", "i", String(k)));
          cells.appendChild(cell);
        });
        if (v.more) cells.appendChild(el("div", "var-cell", "…"));
        card.appendChild(cells);
      } else card.appendChild(el("div", "var-box", v.r));
      row.appendChild(card);
    });
    return row.children.length ? row : null;
  }

  KZ.inlineTry = function (c, b) {
    const engine = c.engine;
    const wrap = el("div", "itry");
    const startCode = b.code;
    const head = el("div", "itry-head");
    head.appendChild(el("b", null, KZ.t("✏️ Өзің көр: кодты өзгертіп, іске қос")));
    wrap.appendChild(head);
    if (b.note) wrap.appendChild(el("p", "try-note", b.note));

    const row = el("div", "itry-row");
    const left = el("div", "itry-left");
    const ta = el("textarea");
    ta.value = startCode;
    left.appendChild(ta);
    const bar = el("div", "itry-bar");
    const runBtn = el("button", "btn small primary", KZ.t("▶ Іске қос"));
    runBtn.type = "button";
    const resetBtn = el("button", "btn small", KZ.t("↺ Бастапқы код"));
    resetBtn.type = "button";
    bar.appendChild(runBtn);
    bar.appendChild(resetBtn);
    left.appendChild(bar);
    const out = el("div", "itry-out");
    out.appendChild(el("p", "itry-empty", KZ.t("Нәтиже осында шығады")));
    row.appendChild(left);
    row.appendChild(out);
    wrap.appendChild(row);

    let cm = null;
    const getCode = () => (cm ? cm.getValue() : ta.value);
    let token = 0;
    let timer = null;
    const setCode = (v) => (cm ? cm.setValue(v) : (ta.value = v));

    function initEditor() {
      if (cm || !window.CodeMirror) return;
      cm = CodeMirror.fromTextArea(ta, {
        mode: engine === "web" && webKind() === "css" ? "css" : MODES[engine] || "text", lineNumbers: true, indentUnit: engine === "python" || engine === "kt" ? 4 : 2, tabSize: 4,
        indentWithTabs: false, viewportMargin: Infinity, inputStyle: "contenteditable", autoCloseBrackets: true,
        extraKeys: { Tab: (e) => e.execCommand("insertSoftTab"), "Ctrl-Enter": () => runBtn.click(), "Cmd-Enter": () => runBtn.click() },
      });
      KZ.attachHints(cm, engine === "web" ? (webKind() === "css" ? "css" : "html") : engine);
      try {
        const input = cm.getInputField();
        input.setAttribute("autocapitalize", "off");
        input.setAttribute("autocorrect", "off");
        input.setAttribute("spellcheck", "false");
      } catch (e) { /* маңызды емес */ }
      if (engine === "web") cm.on("change", () => { if (liveFrame) updateLive(); });
    }
    // DOM-ға қосылған соң ғана құрамыз (CodeMirror өлшемі дұрыс болу үшін)
    setTimeout(() => { initEditor(); if (cm) cm.refresh(); }, 0);

    function note(cls, text) {
      out.appendChild(el("div", "itry-note " + cls, text));
    }

    let liveFrame = null;
    const webKind = () => b.kind || (c.id === "css" ? "css" : "html");
    function updateLive() {
      liveFrame.srcdoc = KZ.buildWebDoc(webKind(), getCode(), b.html, false);
    }

    let stopPlayer = () => {};
    function clearLineMark() {
      if (cm && cm.__itryLine != null) {
        try { cm.removeLineClass(cm.__itryLine, "background", cm.__itryCls); } catch (e) { /* жол өшкен */ }
        cm.__itryLine = null;
      }
    }

    /* Қадамдап ойнатқыш: әр кадрда жол жарықтайды, айнымалылар мен робот анимациямен өзгереді */
    function showRun(res, withDom) {
      stopPlayer();
      out.textContent = "";
      const frames = res.frames;
      const last = frames.length - 1;
      const my = ++token;
      let idx = -1;
      let playing = false;
      let shown = {};
      let board = null;

      const ctl = el("div", "itry-ctl");
      const back = el("button", "btn small", "⏮");
      const pp = el("button", "btn small primary", "⏸");
      const fwd = el("button", "btn small", "⏭");
      [back, pp, fwd].forEach((x) => (x.type = "button"));
      back.title = KZ.t("Артқа");
      fwd.title = KZ.t("Алға");
      const count = el("span", "itry-count", "");
      ctl.appendChild(back);
      ctl.appendChild(pp);
      ctl.appendChild(fwd);
      ctl.appendChild(count);
      out.appendChild(ctl);

      let msg = null;
      if (res.robotCfg) {
        board = KZ.makeBoard(res.robotCfg);
        const wrapB = el("div", "itry-board");
        wrapB.appendChild(board.root);
        out.appendChild(wrapB);
        msg = el("div", "itry-note", "");
        msg.hidden = true;
        out.appendChild(msg);
      }
      const varsBox = el("div", "itry-vars");
      const varsHead = el("div", "itry-h", KZ.t("Айнымалылар"));
      const consHead = el("div", "itry-h", KZ.t("Экранға шықты"));
      const cons = el("pre", "itry-console", "");
      let fr = null;
      if (!board) {
        out.appendChild(varsHead);
        out.appendChild(varsBox);
      }
      if (withDom) {
        out.appendChild(el("div", "itry-h", KZ.t("Бет")));
        fr = el("iframe", "itry-frame");
        fr.setAttribute("sandbox", "");
        out.appendChild(fr);
      }
      out.appendChild(consHead);
      out.appendChild(cons);
      const errBox = el("div", "itry-note bad");
      errBox.hidden = true;
      out.appendChild(errBox);

      function drawVars(vars) {
        varsBox.textContent = "";
        const prev = shown;
        shown = {};
        (vars || []).forEach((v) => {
          if (!v || !v.n || String(v.n).startsWith("__")) return;
          const old = prev[v.n];
          const isNew = !old;
          const changed = !isNew && old.r !== v.r;
          const card = el("div", "var" + (isNew ? " fresh" : changed ? " changed" : ""));
          card.style.setProperty("--c", KZ.colorFor(v.n));
          const nm = el("div", "var-name", v.n);
          if (v.t) nm.appendChild(el("small", null, v.t));
          card.appendChild(nm);
          if (v.i) {
            const cells = el("div", "var-cells");
            v.i.forEach((item, k) => {
              const was = old && old.i;
              const cls = !was || k >= was.length ? (isNew ? "" : " new") : was[k] !== item ? " hot" : "";
              const cell = el("div", "var-cell" + cls);
              cell.appendChild(el("div", "v", item));
              cell.appendChild(el("div", "i", String(k)));
              cells.appendChild(cell);
            });
            if (v.more) cells.appendChild(el("div", "var-cell", "…"));
            card.appendChild(cells);
          } else {
            if (changed && !old.i) card.appendChild(el("div", "var-old", old.r));
            card.appendChild(el("div", "var-box", v.r));
          }
          varsBox.appendChild(card);
          shown[v.n] = { r: v.r, i: v.i };
        });
        if (!varsBox.children.length) varsBox.appendChild(el("p", "itry-empty", KZ.t("Айнымалылар жоқ")));
      }

      function draw(i) {
        idx = i;
        const f = frames[i];
        clearLineMark();
        if (cm && f.line) {
          const n = Math.max(0, Math.min(f.line - 1, cm.lastLine()));
          const cls = f.kind === "error" ? "cm-err" : "cm-exec";
          cm.addLineClass(n, "background", cls);
          cm.__itryLine = n;
          cm.__itryCls = cls;
        }
        if (board && f.robot) board.setState(f.robot, f.kind);
        if (msg) {
          if (f.msg) {
            msg.hidden = false;
            msg.textContent = f.msg;
            msg.className = "itry-note" + (f.kind === "crash" ? " bad" : f.kind === "collect" ? " good" : "");
          } else msg.hidden = true;
        }
        if (!board) drawVars(f.vars);
        cons.textContent = f.out || "";
        consHead.hidden = cons.hidden = !f.out;
        if (fr && f.dom !== undefined && f.dom !== fr.__dom) {
          fr.__dom = f.dom;
          fr.srcdoc = f.dom;
        }
        count.textContent = i + 1 + " / " + frames.length;
        back.disabled = i <= 0;
        fwd.disabled = i >= last;
        if (i >= last) {
          clearLineMark();
          if (res.error) {
            const e = res.error;
            errBox.textContent = "";
            errBox.appendChild(el("b", null, "🙈 " + e.msg));
            if (e.line) errBox.appendChild(el("small", null, " (" + e.line + KZ.t("-жол)")));
            if (e.tip) errBox.appendChild(el("div", null, "💡 " + e.tip));
            errBox.hidden = false;
          }
          setPlaying(false);
        } else errBox.hidden = true;
      }

      const delay = board ? 450 : frames.length > 60 ? 120 : 550;
      function setPlaying(v) {
        playing = v;
        pp.textContent = v ? "⏸" : idx >= last ? "↻" : "▶";
        clearTimeout(timer);
        if (v) timer = setTimeout(tickPlay, delay);
      }
      function tickPlay() {
        if (my !== token || !playing) return;
        if (idx < last) draw(idx + 1);
        if (playing) timer = setTimeout(tickPlay, delay);
      }
      stopPlayer = () => {
        playing = false;
        clearTimeout(timer);
        clearLineMark();
      };
      back.addEventListener("click", () => {
        setPlaying(false);
        if (idx > 0) draw(idx - 1);
        pp.textContent = "▶";
      });
      fwd.addEventListener("click", () => {
        setPlaying(false);
        if (idx < last) draw(idx + 1);
        pp.textContent = idx >= last ? "↻" : "▶";
      });
      pp.addEventListener("click", () => {
        if (playing) return setPlaying(false);
        if (idx >= last) {
          shown = {};
          if (board) {
            const s = res.robotCfg.start;
            board.setState({ x: s.x, y: s.y, d: s.d == null ? 1 : s.d, stars: res.robotCfg.stars }, null);
          }
          draw(0);
        }
        setPlaying(true);
      });

      if (board) {
        const s = res.robotCfg.start;
        board.setState({ x: s.x, y: s.y, d: s.d == null ? 1 : s.d, stars: res.robotCfg.stars }, null);
      }
      draw(0);
      if (last > 0) setPlaying(true);
    }

    async function runCode() {
      stopPlayer();
      token++;
      clearTimeout(timer);
      const code = getCode();
      runBtn.disabled = true;
      try {
        if (engine === "web") {
          out.textContent = "";
          liveFrame = el("iframe", "itry-frame tall");
          liveFrame.setAttribute("sandbox", "");
          out.appendChild(liveFrame);
          updateLive();
          return;
        }
        if (engine === "sql") {
          out.textContent = "";
          out.appendChild(el("p", "itry-empty", KZ.t("SQL қозғалтқышы жүктелуде…")));
          const SQL = await KZ.sql.loadEngine();
          const r = KZ.sqlCore.execute(SQL, code);
          out.textContent = "";
          if (r.error) note("bad", "🙈 " + r.error);
          else if (r.last) {
            out.appendChild(table(r.last));
            if (r.last.values.length > 30) out.appendChild(el("small", null, KZ.t("Алғашқы 30 жол көрсетілді")));
          } else note("good", KZ.t("✔ Сұраныс орындалды") + (r.changed ? KZ.t(". Өзгерген жол: ") + r.changed : "") + ".");
          if (r.db) r.db.close();
          return;
        }
        out.textContent = "";
        const wait = el("p", "itry-empty", (engine === "python" ? "Python" : engine === "kt" ? "Kotlin" : "JavaScript") + KZ.t(" жүктелуде…"));
        out.appendChild(wait);
        const fn = await (engine === "python" ? KZ.loadPython() : engine === "kt" ? KZ.ktRunner.load() : KZ.jsRunner.load());
        let robotCfg = null;
        if (engine === "python") {
          if (b.robot && typeof b.robot === "object") robotCfg = b.robot;
          else if (b.robot !== false && ROBOT_RE.test(code)) robotCfg = DEFAULT_ROBOT;
        }
        const raw = fn(code, JSON.stringify({ robot: robotCfg, html: typeof b.html === "string" ? b.html : engine === "js" ? JS_HTML : undefined }));
        const res = typeof raw === "string" ? JSON.parse(raw) : raw;
        res.robotCfg = robotCfg;
        showRun(res, engine === "js" && !!res.dom && /\bdocument\b|\bwindow\b/.test(code));
      } catch (e) {
        console.error(e);
        out.textContent = "";
        note("bad", KZ.t("Орындау мүмкін болмады. Интернетті тексеріп, қайта көр."));
      } finally {
        runBtn.disabled = false;
      }
    }

    runBtn.addEventListener("click", runCode);
    resetBtn.addEventListener("click", () => {
      setCode(startCode);
      stopPlayer();
      token++;
      clearTimeout(timer);
      out.textContent = "";
      out.appendChild(el("p", "itry-empty", KZ.t("Нәтиже осында шығады")));
    });
    if (engine === "web") setTimeout(runCode, 0);
    return wrap;
  };
})();
