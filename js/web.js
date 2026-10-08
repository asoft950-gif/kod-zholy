/* Ботакод: HTML/CSS жұмыс алаңы (тірі алдын ала көру, құрылым ағашы, қорап моделі) */
(() => {
  "use strict";

  const { $, el } = KZ;

  let course = null;
  let level = null;
  let list = [];
  let listKind = "tasks";
  let doc = null;
  let win = null;
  let selected = null;
  let selKey = null; // қайта жүктелгенде таңдауды қалпына келтіру үшін
  let chips = new Map();
  let timer = null;
  let checkedOnce = false;

  const preview = $("#webPreview");

  /* ---------- Редакторлар ---------- */
  const editor = CodeMirror.fromTextArea($("#webCode"), {
    mode: "htmlmixed",
    lineNumbers: true,
    indentUnit: 2,
    tabSize: 2,
    indentWithTabs: false,
    viewportMargin: Infinity,
    inputStyle: "contenteditable",
    autoCloseTags: true,
    autoCloseBrackets: true,
    extraKeys: { Tab: (cm) => cm.execCommand("insertSoftTab") },
  });
  const viewer = CodeMirror.fromTextArea($("#webHtmlCode"), {
    mode: "htmlmixed",
    lineNumbers: true,
    readOnly: "nocursor",
    viewportMargin: Infinity,
  });
  try {
    const input = editor.getInputField();
    input.setAttribute("autocapitalize", "off");
    input.setAttribute("autocorrect", "off");
    input.setAttribute("spellcheck", "false");
  } catch (e) {
    /* маңызды емес */
  }

  /* ---------- Тексеру ережелері ---------- */
  const squash = (s) => String(s).replace(/\s+/g, " ").trim();

  function normalizeStyle(w, prop, value) {
    const d = w.document;
    const probe = d.createElement("div");
    probe.style[prop] = value;
    d.body.appendChild(probe);
    const v = w.getComputedStyle(probe)[prop];
    probe.remove();
    return v;
  }

  function matchText(elm, t) {
    const txt = squash(elm.textContent || "");
    return t instanceof RegExp ? t.test(txt) : txt.toLowerCase() === String(t).toLowerCase();
  }

  function matchAttr(elm, attrs) {
    return Object.keys(attrs).every((name) => {
      const want = attrs[name];
      const v = elm.getAttribute(name);
      if (v == null) return false;
      if (want === true) return true;
      return want instanceof RegExp ? want.test(v) : v === String(want);
    });
  }

  function matchStyle(w, elm, styles) {
    const cs = w.getComputedStyle(elm);
    return Object.keys(styles).every((prop) => {
      const want = styles[prop];
      const got = cs[prop];
      if (typeof want === "function") return !!want(got, cs, elm);
      if (want instanceof RegExp) return want.test(got);
      return got === normalizeStyle(w, prop, want);
    });
  }

  function runRule(d, w, r) {
    let found;
    try {
      found = [...d.querySelectorAll(r.sel)];
    } catch (e) {
      return false;
    }
    if (r.text !== undefined) found = found.filter((e) => matchText(e, r.text));
    if (r.attr) found = found.filter((e) => matchAttr(e, r.attr));
    if (r.style) found = found.filter((e) => matchStyle(w, e, r.style));
    const n = found.length;
    if (r.not) return n === 0;
    if (r.count !== undefined) return n === r.count;
    if (r.max !== undefined && n > r.max) return false;
    return n >= (r.min !== undefined ? r.min : 1);
  }

  /* Қайтарады: [{ label, ok }] */
  function evaluateRules(lv, d, w, code) {
    const items = [];
    ((lv.check && lv.check.rules) || []).forEach((r) => {
      items.push({ label: r.label || r.sel, ok: runRule(d, w, r) });
    });
    if (lv.check && lv.check.fn) {
      const extra = lv.check.fn(d, w, code) || [];
      extra.forEach((x) => items.push(x));
    }
    return items;
  }

  function codeLines(code) {
    return code
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("<!--") && !l.startsWith("/*") && !l.startsWith("//") && l !== "-->" && l !== "*/")
      .length;
  }

  /* ---------- Алдын ала көру ---------- */
  function currentDocHtml() {
    return KZ.buildWebDoc(level.kind, editor.getValue(), level.html);
  }

  function updatePreview() {
    clearTimeout(timer);
    preview.srcdoc = currentDocHtml();
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(updatePreview, 250);
  }

  function lineTarget() {
    return level.kind === "css" ? viewer : editor;
  }

  function lineOf(elm) {
    const host = elm && elm.closest ? elm.closest("[data-kzl]") : null;
    return host ? Number(host.getAttribute("data-kzl")) : null;
  }

  let hlLine = null;
  function markLine(line) {
    const t = lineTarget();
    if (hlLine !== null) {
      try {
        t.removeLineClass(hlLine.n, "background", "cm-exec");
      } catch (e) {
        /* маңызды емес */
      }
      hlLine = null;
    }
    if (line == null) return;
    const n = Math.max(0, Math.min(line - 1, t.lastLine()));
    t.addLineClass(n, "background", "cm-exec");
    hlLine = { n };
    if (t.scrollIntoView) t.scrollIntoView({ line: n, ch: 0 }, 40);
  }

  function select(elm) {
    if (!doc) return;
    doc.querySelectorAll("[data-kz-sel]").forEach((e) => e.removeAttribute("data-kz-sel"));
    selected = elm && elm !== doc.documentElement ? elm : null;
    chips.forEach((chip) => chip.classList.remove("active"));
    if (selected) {
      selected.setAttribute("data-kz-sel", "");
      const line = lineOf(selected);
      selKey = line ? line + ":" + selected.tagName : null;
      markLine(line);
      const chip = chips.get(selected);
      if (chip) chip.classList.add("active");
    } else {
      selKey = null;
      markLine(null);
    }
    renderInspect();
  }

  /* ---------- Құрылым ағашы ---------- */
  function nodeFor(elm, depth) {
    const wrap = el("div", "tn");
    const row = el("div", "trow");
    const chip = el("button", "tchip", "<" + elm.tagName.toLowerCase() + ">");
    chip.type = "button";
    chip.addEventListener("click", () => select(elm));
    chips.set(elm, chip);
    row.appendChild(chip);
    const own = [...elm.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => squash(n.textContent))
      .join(" ")
      .trim();
    if (own) row.appendChild(el("span", "ttext", own.length > 22 ? own.slice(0, 21) + "…" : own));
    wrap.appendChild(row);
    const kids = [...elm.children].filter((c) => !["SCRIPT", "STYLE"].includes(c.tagName));
    if (kids.length && depth < 8) {
      const box = el("div", "tkids");
      kids.forEach((k) => box.appendChild(nodeFor(k, depth + 1)));
      wrap.appendChild(box);
    }
    return wrap;
  }

  function buildTree() {
    const root = $("#webTree");
    root.textContent = "";
    chips = new Map();
    if (!doc || !doc.body) return;
    if (!doc.body.children.length) {
      root.appendChild(el("p", "empty", "Әзірге бетте элемент жоқ. Теріп көр: <h1>Сәлем</h1>"));
      return;
    }
    root.appendChild(nodeFor(doc.body, 0));
  }

  /* ---------- Таңдалған элемент ---------- */
  const px = (v) => Math.round(parseFloat(v) || 0);

  function layer(name, vals, inner) {
    const L = el("div", "bm bm-" + name);
    L.appendChild(el("span", "bm-name", name));
    const g = el("div", "bm-grid");
    [null, vals[0], null, vals[3], inner, vals[1], null, vals[2], null].forEach((c) => {
      const cell = el("div", "bm-cell");
      if (c instanceof Node) cell.appendChild(c);
      else if (c != null) cell.textContent = String(c);
      g.appendChild(cell);
    });
    L.appendChild(g);
    return L;
  }

  function boxModel(elm) {
    const cs = win.getComputedStyle(elm);
    const rect = elm.getBoundingClientRect();
    const side = (p, suf) => ["Top", "Right", "Bottom", "Left"].map((s) => px(cs[p + s + (suf || "")]));
    const m = side("margin");
    const b = side("border", "Width");
    const p = side("padding");
    const cw = Math.max(0, Math.round(rect.width - b[1] - b[3] - p[1] - p[3]));
    const ch = Math.max(0, Math.round(rect.height - b[0] - b[2] - p[0] - p[2]));
    const content = el("div", "bm bm-content", cw + " × " + ch);
    return layer("margin", m, layer("border", b, layer("padding", p, content)));
  }

  function renderInspect() {
    const box = $("#webInspect");
    box.textContent = "";
    if (!selected) {
      box.appendChild(el("p", "empty", "Бетте не ағаштағы бір элементті бас: оның коды жарқырап, өлшемдері осында көрінеді."));
      return;
    }
    const tag = selected.tagName.toLowerCase();
    const attrs = [...selected.attributes]
      .filter((a) => !a.name.startsWith("data-kz"))
      .map((a) => a.name + '="' + a.value + '"')
      .join(" ");
    box.appendChild(el("code", "insp-tag", "<" + tag + (attrs ? " " + attrs : "") + ">"));
    const line = lineOf(selected);
    if (line) box.appendChild(el("p", "insp-line", line + "-жол"));
    box.appendChild(boxModel(selected));
  }

  /* ---------- Ілмектер: iframe жүктелгенде ---------- */
  preview.addEventListener("load", () => {
    doc = preview.contentDocument;
    win = preview.contentWindow;
    if (!doc) return;
    doc.addEventListener(
      "click",
      (e) => {
        e.preventDefault();
        select(e.target.nodeType === 1 ? e.target : e.target.parentElement);
      },
      true
    );
    buildTree();
    selected = null;
    if (selKey) {
      const [line, tag] = selKey.split(":");
      const again = [...doc.querySelectorAll('[data-kzl="' + line + '"]')].find((e) => e.tagName === tag);
      if (again) select(again);
      else select(null);
    } else {
      renderInspect();
    }
  });

  /* ---------- Тексеру ---------- */
  function hideResult() {
    $("#webResult").hidden = true;
  }

  function nextHref() {
    const i = list.findIndex((l) => l.id === level.id);
    if (i >= 0 && i < list.length - 1) return "#/" + course.id + "/play/" + list[i + 1].id;
    return null;
  }

  function check() {
    if (!doc || level.sandbox) return;
    clearTimeout(timer);
    if (preview.srcdoc !== currentDocHtml()) {
      // алдын ала көру әлі жаңармаған: алдымен жаңартамыз
      preview.addEventListener("load", check, { once: true });
      updatePreview();
      return;
    }
    const code = editor.getValue();
    const items = evaluateRules(level, doc, win, code);
    const ok = items.length > 0 && items.every((i) => i.ok);
    const lines = codeLines(code);
    const box = $("#webResult");
    box.textContent = "";
    box.className = "card result " + (ok ? "ok" : "bad");
    box.appendChild(el("h2", null, ok ? "🎉 Тамаша!" : "🤔 Әлі толық емес"));
    if (ok) {
      const stars = KZ.starsFor(level, lines);
      KZ.progress.set(course.id, level.id, stars);
      KZ.updateTotal();
      refreshStars();
      box.appendChild(el("div", "big-stars", "⭐".repeat(stars) + "☆".repeat(3 - stars)));
      box.appendChild(
        el("p", null, stars === 3 ? "Ең қысқа шешім! Керемет." : "3 ⭐ алу үшін кодты " + level.par + " жолға дейін қысқартып көр (қазір " + lines + " жол).")
      );
    }
    const checklist = el("ul", "checklist");
    items.forEach((i) => checklist.appendChild(el("li", i.ok ? "yes" : "no", (i.ok ? "✅ " : "❌ ") + i.label)));
    box.appendChild(checklist);
    if (ok) {
      const row = el("div", "row");
      const next = nextHref();
      const a = el("a", "btn primary", next ? "Келесі тапсырма →" : "← Курсқа оралу");
      a.href = next || "#/" + course.id + "/" + listKind;
      row.appendChild(a);
      box.appendChild(row);
    } else {
      checkedOnce = true;
      $("#webSolutionBtn").hidden = false;
      box.appendChild(el("small", null, "Кодты өзгертіп, қайта тексеріп көр."));
    }
    box.hidden = false;
    if (window.matchMedia && window.matchMedia("(max-width: 959px)").matches && box.scrollIntoView) {
      box.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  /* ---------- Деңгей ---------- */
  function refreshStars() {
    const n = level.sandbox ? 0 : KZ.progress.stars(course.id, level.id);
    $("#webStars").textContent = level.sandbox ? "" : "⭐".repeat(n) + "☆".repeat(3 - n);
  }

  function freeLevel() {
    const s = KZ.store.getSession("kodzholy.sandbox", null);
    KZ.store.setSession("kodzholy.sandbox", null);
    const isCss = course.id === "css";
    return {
      id: "free",
      sandbox: true,
      title: "Еркін алаң",
      kind: isCss ? "css" : "html",
      task: "<p>Мұнда тапсырма жоқ: кез келген код жазып, не болатынын көр. Бетте элементтерді басып көр!</p>",
      hint: "",
      solution: "",
      par: 99,
      html: isCss
        ? '<h1>Тақырып</h1>\n<p class="a">Абзац мәтіні</p>\n<div class="box">Қорап</div>'
        : "",
      starter: isCss ? "/* стильдерді осында жаз */\n" : "<h1>Сәлем!</h1>\n<p>Бұл менің бетім.</p>\n",
      sandboxCode: s && typeof s.code === "string" ? s.code : null,
      check: {},
    };
  }

  function loadLevel() {
    clearTimeout(timer);
    selKey = null;
    selected = null;
    hlLine = null;
    checkedOnce = false;
    const isCss = level.kind === "css";
    $("#webBadge").textContent = level.sandbox ? "Еркін алаң" : level.debug ? "🐞 Қате тап " + level.id : listKind === "bonus" ? "Қосымша " + level.id : "Деңгей " + level.id;
    $("#webTitle").textContent = level.title;
    $("#webTaskBody").innerHTML = level.task;
    $("#webHint").hidden = true;
    $("#webHint").textContent = level.hint;
    $("#webHintBtn").hidden = !!level.sandbox;
    $("#webSolution").hidden = true;
    $("#webSolution").textContent = level.solution;
    $("#webSolutionBtn").hidden = true;
    $("#webCheck").hidden = !!level.sandbox;
    const back = $("#webBack");
    back.href = "#/" + course.id + "/" + listKind;
    back.textContent = listKind === "bonus" ? "← Қосымша тапсырмалар" : "← " + course.name + ": тапсырмалар";
    $("#webEditorTitle").textContent = isCss ? "CSS коды" : "HTML коды";
    editor.setOption("mode", isCss ? "css" : "htmlmixed");
    editor.setOption("autoCloseTags", !isCss);

    $("#webHtmlCard").hidden = !isCss;
    if (isCss) viewer.setValue(level.html);

    const saved = KZ.codeStore.get(course.id, level.id);
    let code = typeof saved === "string" ? saved : level.starter;
    if (level.sandbox && level.sandboxCode != null) code = level.sandboxCode;
    editor.setValue(code);
    editor.setCursor({ line: editor.lastLine(), ch: 0 });
    hideResult();
    refreshStars();
    updatePreview();
  }

  /* ---------- Оқиғалар ---------- */
  editor.on("change", () => {
    if (course && level) KZ.codeStore.set(course.id, level.id, editor.getValue());
    hideResult();
    schedule();
  });
  $("#webCheck").addEventListener("click", check);
  $("#webReset").addEventListener("click", () => {
    if (level) editor.setValue(level.starter);
  });
  $("#webHintBtn").addEventListener("click", () => {
    const h = $("#webHint");
    h.hidden = !h.hidden;
  });
  $("#webSolutionBtn").addEventListener("click", () => {
    const s = $("#webSolution");
    s.hidden = !s.hidden;
  });

  /* ---------- Сыртқы API ---------- */
  KZ.web = {
    evaluateRules,
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
      setTimeout(() => {
        editor.refresh();
        viewer.refresh();
      }, 0);
      return true;
    },
    leave() {
      clearTimeout(timer);
    },
    /* тестілеу үшін */
    _state: () => ({ doc, win, level, editor }),
  };
})();
