/* Bitlings: код редакторындағы автотолтыру. Теріп жатқанда ұсыныс шығады, Tab (немесе басу) қабылдайды.
   KZ.attachHints(cm, kind): kind = "python" | "js" | "kt" | "sql" | "html" | "css" (не соны қайтаратын функция) */
(() => {
  "use strict";
  const w = (s) => s.split(" ");
  /* [мәтін, көрсетілетін, курсорды неше таңба артқа қою] */
  const S = (text, disp, back) => ({ text, displayText: disp || text.replace(/\n\s*/g, " ⏎ ").trim(), back: back || 0 });

  const PY_WORDS = w("and as break class continue def elif else except False finally for from if import in is lambda None not or pass return True try while with print input int str float len range list dict set tuple sum min max abs round sorted type bool enumerate zip");
  const PY_ROBOT_KZ = w("alga onga solga zhinau zhuldyz_bar aldy_bos onga_burul solga_burul");
  const PY_ROBOT_RU = w("vpered napravo nalevo sobrat zvezda_est vperedi_svobodno");
  const PY_MEMBERS = w("append pop insert remove sort reverse index count extend upper lower strip split join replace startswith endswith find format keys values items get capitalize isdigit");
  const PY_DOTTED = w("random.randint random.choice random.random random.shuffle math.sqrt math.pi math.floor math.ceil");
  const PY_SNIPS = [
    S("for i in range(5):\n    ", "for … in range(5):"), S("while True:\n    ", "while …:"), S("if x > 0:\n    ", "if …:"),
    S("elif x > 0:\n    ", "elif …:"), S("else:\n    ", "else:"), S("def name():\n    ", "def …():"),
    S("print()", "print( )", 1), S('input("")', 'input(" ")', 2), S("range()", "range( )", 1), S("len()", "len( )", 1),
  ];

  const JS_WORDS = w("const let var function return if else for while break continue true false null undefined new class switch case default try catch throw typeof alert prompt parseInt parseFloat setTimeout setInterval");
  const JS_DOTTED = w("console.log document.getElementById document.querySelector document.querySelectorAll document.createElement document.body Math.random Math.floor Math.round Math.max Math.min Math.sqrt JSON.stringify JSON.parse Array.isArray");
  const JS_MEMBERS = w("push pop shift unshift length map filter forEach join split includes indexOf slice toUpperCase toLowerCase trim textContent innerHTML value style classList addEventListener getAttribute setAttribute appendChild remove click toString toFixed");
  const JS_SNIPS = [
    S("for (let i = 0; i < 5; i++) {\n  \n}", "for (…) { }"), S("function name() {\n  \n}", "function …() { }"), S("if () {\n  \n}", "if (…) { }"),
    S("while () {\n  \n}", "while (…) { }"), S("console.log()", "console.log( )", 1), S("() => {\n  \n}", "() => { }"),
  ];

  const KT_WORDS = w("fun val var if else for while when return println print readLine true false null in until downTo step class listOf mutableListOf mapOf mutableMapOf setOf arrayOf toInt toDouble toString length size add remove contains isEmpty first last sorted reversed joinToString repeat");
  const KT_SNIPS = [
    S("fun main() {\n    \n}", "fun main() { }"), S("fun name() {\n    \n}", "fun …() { }"), S("for (i in 1..5) {\n    \n}", "for (… in …) { }"),
    S("if () {\n    \n}", "if (…) { }"), S("while () {\n    \n}", "while (…) { }"), S("println()", "println( )", 1),
  ];

  const SQL_KW = ["SELECT", "FROM", "WHERE", "AND", "OR", "NOT", "ORDER BY", "GROUP BY", "HAVING", "LIMIT", "JOIN", "INNER JOIN", "LEFT JOIN", "ON", "AS", "DISTINCT", "COUNT", "AVG", "SUM", "MIN", "MAX", "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM", "LIKE", "IN", "BETWEEN", "IS NULL", "IS NOT NULL", "ASC", "DESC", "CREATE TABLE", "ROUND", "UPPER", "LOWER", "LENGTH"];
  const SQL_TBL = ["oqushylar", "bagalar"];
  const SQL_COL = ["id", "aty", "synyp", "jasy", "qala", "oqushy_id", "pan", "baga"];

  const TAGS = w("html head body title h1 h2 h3 h4 h5 h6 p a img div span ul ol li button input form label table tr td th br hr style script header footer nav section article b i strong em textarea select option");
  const VOID = new Set(["img", "br", "hr", "input"]);
  const ATTRS = w("class id src href alt style type value placeholder width height name for target title");
  const CSS_PROPS = w("color background background-color font-size font-family font-weight text-align margin padding border border-radius width height max-width min-height display flex justify-content align-items gap position top left right bottom z-index opacity box-shadow transition transform line-height overflow cursor grid-template-columns flex-direction text-decoration letter-spacing margin-top margin-bottom padding-top padding-bottom border-color");
  const CSS_VALS = w("red blue green yellow orange purple pink black white gray none block flex grid inline-block center left right bold italic solid dashed 1px 2px 10px 100% auto relative absolute fixed hidden pointer underline");

  const WORD = /[A-Za-z_0-9А-Яа-яӘәҒғҚқҢңӨөҰұҮүҺһІі]/;

  function docWords(cm, skip) {
    const out = new Set();
    const re = /[A-Za-z_А-Яа-яӘәҒғҚқҢңӨөҰұҮүҺһІі][\wА-Яа-яӘәҒғҚқҢңӨөҰұҮүҺһІі]{2,}/g;
    let m;
    const txt = cm.getValue();
    while ((m = re.exec(txt))) if (m[0] !== skip) out.add(m[0]);
    return [...out];
  }

  function match(items, typed, cap) {
    const t = typed.toLowerCase();
    const res = [];
    for (const it of items) {
      const lab = typeof it === "string" ? it : it.displayText;
      const txt = typeof it === "string" ? it : it.text;
      const key = (typeof it === "string" ? it : it.text).toLowerCase();
      if (key.startsWith(t) && (typeof it !== "string" || key !== t || it.length > 0)) {
        if (typeof it === "string" && key === t) continue;
        res.push(typeof it === "string" ? { text: txt, displayText: lab, back: 0 } : it);
        if (res.length >= cap) break;
      }
    }
    return res;
  }

  function pick(cm, data, c) {
    cm.replaceRange(c.text, data.from, data.to, "complete");
    if (c.back) {
      const cur = cm.getCursor();
      cm.setCursor({ line: cur.line, ch: cur.ch - c.back });
    }
  }
  const wrap = (arr) => arr.map((o) => ({ ...o, hint: pick }));

  function compute(cm, kind) {
    const cur = cm.getCursor();
    const line = cm.getLine(cur.line).slice(0, cur.ch);
    const wm = /[A-Za-z_0-9А-Яа-яӘәҒғҚқҢңӨөҰұҮүҺһІі.\-]*$/.exec(line);
    let tok = wm ? wm[0] : "";
    const start = cur.ch - tok.length;
    const mk = (list, from) => (list.length ? { list: wrap(list), from: { line: cur.line, ch: from }, to: cur } : null);
    const ru = window.KZ && KZ.lang === "ru";
    let k = typeof kind === "function" ? kind() : kind;

    if (k === "html") {
      const mode = cm.getModeAt ? cm.getModeAt(cur) : null;
      if (mode && mode.name === "css") k = "css";
    }

    if (k === "html") {
      let m = /<([a-zA-Z0-9]*)$/.exec(line);
      if (m) {
        const list = TAGS.filter((t) => t.startsWith(m[1].toLowerCase()) && t !== m[1]).slice(0, 12).map((t) =>
          VOID.has(t) ? S(t + (t === "img" ? ' src="">' : t === "input" ? ' type="text">' : ">"), "<" + t + ">", t === "img" || t === "input" ? 2 : 0) : S(t + "></" + t + ">", "<" + t + "> </" + t + ">", t.length + 3));
        return mk(list, cur.ch - m[1].length);
      }
      m = /<[a-zA-Z0-9]+\s[^<>]*?([a-zA-Z-]*)$/.exec(line);
      if (m && !/"[^"]*$/.test(line.slice(0, cur.ch))) {
        const typed = m[1].toLowerCase();
        const list = ATTRS.filter((a) => a.startsWith(typed) && a !== typed).slice(0, 10).map((a) => S(a + '=""', a + '=" "', 1));
        return mk(list, cur.ch - m[1].length);
      }
      return null;
    }

    if (k === "css") {
      const m = /([a-zA-Z-]*)$/.exec(line);
      const typed = m[1].toLowerCase();
      const afterColon = /:\s*[^;{}]*$/.test(line);
      if (afterColon) {
        if (typed.length < 1) return null;
        return mk(CSS_VALS.filter((v) => v.startsWith(typed) && v !== typed).slice(0, 10).map((v) => S(v)), cur.ch - typed.length);
      }
      if (!/(^\s*|[{;]\s*)[a-zA-Z-]*$/.test(line) || typed.length < 1) return null;
      return mk(CSS_PROPS.filter((p) => p.startsWith(typed) && p !== typed).slice(0, 10).map((p) => S(p + ": ;", p + ": …;", 1)), cur.ch - typed.length);
    }

    if (k === "sql") {
      const typed = (/[A-Za-z_]*$/.exec(line) || [""])[0];
      if (typed.length < 2) return null;
      const list = [...SQL_KW, ...SQL_TBL, ...SQL_COL].filter((x) => x.toLowerCase().startsWith(typed.toLowerCase()) && x.toLowerCase() !== typed.toLowerCase()).slice(0, 10).map((x) => S(x));
      return mk(list, cur.ch - typed.length);
    }

    // python | js | kt
    const dot = tok.lastIndexOf(".");
    let words, members, dotted, snips;
    if (k === "python") {
      words = [...PY_WORDS, ...(ru ? PY_ROBOT_RU : PY_ROBOT_KZ)];
      members = PY_MEMBERS; dotted = PY_DOTTED; snips = PY_SNIPS;
    } else if (k === "js") {
      words = JS_WORDS; members = JS_MEMBERS; dotted = JS_DOTTED; snips = JS_SNIPS;
    } else if (k === "kt") {
      words = KT_WORDS; members = []; dotted = []; snips = KT_SNIPS;
    } else return null;
    if (/(["'#]).*$/.test(line) && ((line.match(/"/g) || []).length % 2 === 1 || (line.match(/'/g) || []).length % 2 === 1)) return null; // жолдың ішінде
    if (k === "python" && /#/.test(line)) return null;
    if (k !== "python" && /\/\//.test(line)) return null;
    if (dot >= 0) {
      const whole = match(dotted.map((d) => d), tok, 10);
      const after = tok.slice(dot + 1).toLowerCase();
      const mem = members.filter((m) => m.toLowerCase().startsWith(after) && m.toLowerCase() !== after).slice(0, 10).map((m) => S(m, null, 0));
      const list = [...whole.map((x) => S(x.text)), ...mem.filter((m) => !whole.length)];
      if (whole.length) return mk(whole.map((x) => S(x.text, null, x.text.endsWith("log") ? 0 : 0)), start);
      return mk(mem, start + dot + 1);
    }
    if (tok.length < 2) return null;
    const lt = tok.toLowerCase();
    const sn = snips.filter((s) => s.text.toLowerCase().startsWith(lt) && s.text !== tok);
    const pl = match(words, tok, 8);
    const dt = match(dotted, tok, 6);
    const seen = new Set([...sn.map((s) => s.text.split(/\W/)[0]), ...pl.map((p) => p.text)]);
    const dw = docWords(cm, tok).filter((x) => x.toLowerCase().startsWith(lt) && !seen.has(x)).slice(0, 5).map((x) => S(x));
    // толық сөз терілген болса, тек сниппеттерді ұсынамыз
    const list = [...sn, ...pl.filter((p) => !sn.some((s) => s.text.startsWith(p.text + " ") || s.text.startsWith(p.text + "(") || s.text.startsWith(p.text + "\n"))), ...dt, ...dw].slice(0, 10);
    return mk(list, start);
  }

  KZ.attachHints = function (cm, kind) {
    if (!cm || !cm.showHint) return;
    const fn = (c) => {
      let r = null;
      try { r = compute(c, kind); } catch (e) { r = null; }
      return r;
    };
    cm.on("inputRead", (c, ch) => {
      if (c.state.completionActive || ch.origin !== "+input") return;
      const t = ch.text[0];
      if (!t || t.length !== 1) return;
      if (!/[A-Za-z_0-9.<А-Яа-яӘәҒғҚқҢңӨөҰұҮүҺһІі\s-]/.test(t)) return;
      const k = typeof kind === "function" ? kind() : kind;
      if (/\s/.test(t) && k !== "html") return;
      setTimeout(() => {
        if (c.state.completionActive) return;
        c.showHint({
          hint: fn,
          completeSingle: false,
          closeCharacters: /[()\[\]{};:>,"']/,
          extraKeys: { Enter: (cc, h) => { h.close(); cc.execCommand("newlineAndIndent"); } },
        });
      }, 0);
    });
  };
})();
