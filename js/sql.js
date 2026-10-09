/* Bitlings: SQL жұмыс алаңы (sql.js: SQLite браузер ішінде) */
(() => {
  "use strict";

  const { $, el, h } = KZ;
  const CDN = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/";
  const core = KZ.sqlCore;

  let SQL = null;
  let loading = null;
  let course = null;
  let level = null;
  let list = [];
  let listKind = "tasks";
  let fails = 0;
  let usedHint = false;
  let usedSolution = false;

  const editor = CodeMirror.fromTextArea($("#sqlCode"), {
    mode: "text/x-sqlite",
    lineNumbers: true,
    indentUnit: 2,
    tabSize: 2,
    viewportMargin: Infinity,
    inputStyle: "contenteditable",
    autoCloseBrackets: true,
    extraKeys: {
      Tab: (cm) => cm.execCommand("insertSoftTab"),
      "Ctrl-Enter": () => run(),
      "Cmd-Enter": () => run(),
    },
  });
  KZ.attachHints(editor, "sql");
  try {
    const input = editor.getInputField();
    input.setAttribute("autocapitalize", "off");
    input.setAttribute("autocorrect", "off");
    input.setAttribute("spellcheck", "false");
  } catch (e) {
    /* маңызды емес */
  }

  /* ---------- sql.js жүктеу ---------- */
  function loadEngine() {
    if (SQL) return Promise.resolve(SQL);
    if (loading) return loading;
    loading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = CDN + "sql-wasm.js";
      s.onload = () => {
        window
          .initSqlJs({ locateFile: (f) => CDN + f })
          .then((m) => {
            SQL = m;
            resolve(m);
          })
          .catch(reject);
      };
      s.onerror = () => reject(new Error(KZ.t("SQL қозғалтқышы жүктелмеді. Интернетті тексер.")));
      document.head.appendChild(s);
    }).catch((e) => {
      loading = null;
      throw e;
    });
    return loading;
  }

  /* ---------- Кесте көрсету ---------- */
  function cell(v) {
    if (v === null) return h("td", "null", "NULL");
    return h("td", typeof v === "number" ? "num" : null, String(v));
  }
  function table(set, max) {
    const wrap = el("div", "sql-table-wrap");
    const t = el("table", "sql-table");
    const head = el("tr");
    set.columns.forEach((c) => head.appendChild(h("th", null, String(c))));
    t.appendChild(el("thead")).appendChild(head);
    const body = el("tbody");
    set.values.slice(0, max || 100).forEach((r) => {
      const tr = el("tr");
      r.forEach((v) => tr.appendChild(cell(v)));
      body.appendChild(tr);
    });
    t.appendChild(body);
    wrap.appendChild(t);
    if (set.values.length > (max || 100)) wrap.appendChild(h("small", null, KZ.t("… тағы ") + (set.values.length - (max || 100)) + KZ.nt(set.values.length - (max || 100), " жол")));
    return wrap;
  }

  function showOut(run, view) {
    const out = $("#sqlOut");
    out.textContent = "";
    if (run.error) {
      out.appendChild(h("p", "sql-err", "❌ " + run.error));
      return;
    }
    if (run.last) {
      out.appendChild(h("small", null, run.last.values.length + KZ.nt(run.last.values.length, " жол")));
      out.appendChild(table(run.last));
    } else {
      out.appendChild(h("p", null, KZ.t("✔ Сұраныс орындалды") + (run.changed ? KZ.t(". Өзгерген жол: ") + run.changed : "") + "."));
    }
    if (view && level.verify) {
      out.appendChild(h("h4", "st-h", KZ.t("Кестенің қазіргі күйі")));
      out.appendChild(table(view));
    }
  }

  /* ---------- Кестелер схемасы ---------- */
  function renderSchema() {
    const box = $("#sqlSchema");
    box.textContent = "";
    const db = core.open(SQL);
    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")[0].values.map((r) => r[0]);
    tables.forEach((t) => {
      const det = el("details", "sql-tbl");
      det.open = true;
      const cols = db.exec("PRAGMA table_info(" + t + ")")[0].values.map((r) => r[1] + " " + r[2].toLowerCase());
      det.appendChild(h("summary", null, h("b", null, t), h("small", null, " (" + cols.join(", ") + ")")));
      det.appendChild(table(db.exec("SELECT * FROM " + t)[0], 30));
      box.appendChild(det);
    });
    db.close();
  }

  /* ---------- Орындау ---------- */
  function hideResult() {
    $("#sqlResult").hidden = true;
  }

  function nextHref() {
    const i = list.findIndex((l) => l.id === level.id);
    if (i >= 0 && i < list.length - 1) return "#/" + course.id + "/play/" + list[i + 1].id;
    return null;
  }

  function refreshStars() {
    const n = level.sandbox ? 0 : KZ.progress.stars(course.id, level.id);
    $("#sqlStars").textContent = level.sandbox ? "" : "⭐".repeat(n) + "☆".repeat(3 - n);
  }

  function run() {
    if (!SQL || !level) return;
    const code = editor.getValue();
    if (window.KZS) window.KZS.beep("click");
    if (level.sandbox) {
      const r = core.execute(SQL, code);
      showOut(r.error ? r : r);
      if (r.db) r.db.close();
      return;
    }
    const ev = core.evaluate(SQL, level, code);
    showOut(ev.run, ev.run.view);
    const box = $("#sqlResult");
    box.textContent = "";
    box.className = "card result " + (ev.ok ? "ok" : "bad");
    if (KZ.hero && KZ.hero.react) KZ.hero.react(ev.ok ? "ok" : ev.run && ev.run.error ? "err" : "bad");
    if (ev.ok) {
      const stars = Math.min(core.starsFor(fails, usedHint), usedSolution ? 1 : 3);
      KZ.progress.set(course.id, level.id, stars);
      KZ.updateTotal();
      refreshStars();
      if (window.KZS) window.KZS.beep("win");
      box.appendChild(h("h2", null, KZ.t("🎉 Тамаша!")));
      box.appendChild(el("div", "big-stars", "⭐".repeat(stars) + "☆".repeat(3 - stars)));
      if (stars < 3) box.appendChild(h("p", null, usedSolution ? KZ.t("Шешімді қарағандықтан 1 ⭐. Келесі тапсырманы өзің шешіп көр!") : KZ.t("3 ⭐ алу үшін кеңес қарамай, бірінші талпыныста дұрыс жаз.")));
      const row = el("div", "row");
      const next = nextHref();
      const lec = next ? KZ.nextLectureHref(course, level, list, listKind) : null;
      if (lec) {
        const l = el("a", "btn primary", KZ.t("📖 Келесі лекция →"));
        l.href = lec;
        row.appendChild(l);
      } else {
        const a = el("a", "btn primary", next ? KZ.t("Келесі тапсырма →") : KZ.t("← Курсқа оралу"));
        a.href = next || "#/" + course.id + "/" + listKind;
        row.appendChild(a);
      }
      box.appendChild(row);
    } else {
      fails++;
      if (window.KZS) window.KZS.beep("error");
      box.appendChild(h("h2", null, ev.error ? KZ.t("🙈 Қате") : KZ.t("🤔 Әлі толық емес")));
      box.appendChild(h("p", null, ev.reason));
      if (ev.expected && !ev.error) {
        box.appendChild(h("small", null, KZ.t("Күтілген нәтиже (алғашқы жолдары):")));
        box.appendChild(table(ev.expected, 4));
      }
      if (fails >= 3) $("#sqlSolutionBtn").hidden = false;
    }
    box.hidden = false;
    if (window.matchMedia && window.matchMedia("(max-width: 959px)").matches && box.scrollIntoView) box.scrollIntoView({ behavior: "smooth", block: "nearest" });
    if (ev.run.db) ev.run.db.close();
  }

  /* ---------- Деңгей ---------- */
  function freeLevel() {
    const s = KZ.store.getSession("kodzholy.sandbox", null);
    KZ.store.setSession("kodzholy.sandbox", null);
    return {
      id: "free",
      sandbox: true,
      title: KZ.t("Еркін алаң"),
      task: KZ.t("<p>Мұнда тапсырма жоқ: кез келген сұраныс жазып, кестелерді зерттеп көр. Әр орындау деректерді бастапқы күйден бастайды.</p>"),
      hint: "",
      solution: "",
      par: 1,
      starter: "SELECT * FROM oqushylar;\n",
      sandboxCode: s && typeof s.code === "string" ? s.code : null,
      check: {},
    };
  }

  function loadLevel() {
    fails = 0;
    usedHint = false;
    usedSolution = false;
    $("#sqlBadge").textContent = level.sandbox ? KZ.t("Еркін алаң") : KZ.t("Деңгей ") + level.id;
    $("#sqlTitle").textContent = level.title;
    $("#sqlTaskBody").innerHTML = level.task;
    $("#sqlHint").hidden = true;
    $("#sqlHint").textContent = level.hint;
    $("#sqlHintBtn").hidden = !!level.sandbox;
    $("#sqlSolution").hidden = true;
    $("#sqlSolution").textContent = level.solution;
    $("#sqlSolutionBtn").hidden = true;
    const back = $("#sqlBack");
    back.href = "#/" + course.id + "/" + listKind;
    back.textContent = "← " + course.name + KZ.t(": тапсырмалар");
    const saved = KZ.codeStore.get(course.id, level.id);
    let code = typeof saved === "string" ? saved : level.starter;
    if (level.sandbox && level.sandboxCode != null) code = level.sandboxCode;
    editor.setValue(code);
    editor.setCursor({ line: editor.lastLine(), ch: 0 });
    hideResult();
    $("#sqlOut").textContent = "";
    $("#sqlOut").appendChild(h("p", "empty-note", KZ.t("Сұранысты орындасаң, нәтиже осында шығады.")));
    refreshStars();
  }

  editor.on("change", () => {
    if (course && level) KZ.codeStore.set(course.id, level.id, editor.getValue());
    hideResult();
  });
  $("#sqlRun").addEventListener("click", run);
  $("#sqlReset").addEventListener("click", () => level && editor.setValue(level.starter));
  $("#sqlHintBtn").addEventListener("click", () => {
    const hint = $("#sqlHint");
    hint.hidden = !hint.hidden;
    if (!hint.hidden) usedHint = true;
  });
  $("#sqlSolutionBtn").addEventListener("click", () => {
    const s = $("#sqlSolution");
    s.hidden = !s.hidden;
    if (!s.hidden && level && !level.sandbox) usedSolution = true;
  });

  KZ.sql = {
    loadEngine,
    open(courseId, levelId) {
      const c = KZ.getCourse(courseId);
      if (!c) return false;
      course = c;
      let found;
      if (levelId === "free") found = { level: freeLevel(), kind: "tasks" };
      else found = KZ.findLevel(c, levelId);
      if (!found) return false;
      listKind = found.kind;
      list = listKind === "bonus" ? c.bonus : c.levels;
      level = found.level;
      if (!level.sandbox) KZ.last.set(course.id, level.id);
      loadLevel();
      $("#sqlRun").disabled = !SQL;
      $("#sqlStatus").textContent = SQL ? KZ.t("Ctrl+Enter — орындау") : KZ.t("SQL қозғалтқышы жүктелуде…");
      loadEngine()
        .then(() => {
          $("#sqlRun").disabled = false;
          $("#sqlStatus").textContent = KZ.t("Ctrl+Enter — орындау");
          renderSchema();
        })
        .catch((e) => {
          $("#sqlStatus").textContent = e.message;
        });
      setTimeout(() => editor.refresh(), 0);
      return true;
    },
    leave() {},
    _state: () => ({ SQL, level, editor }),
  };
})();
