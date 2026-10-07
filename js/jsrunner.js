/* Код Жолы: JavaScript орындаушы.
   Код acorn арқылы талданып, әр оператордың алдына із қалдыратын __t(...) шақыруы қосылады.
   Нәтиже Python орындаушысымен бірдей пішімде қайтады: { frames, error, output, lines, features, ... } */
(() => {
  "use strict";

  const ACORN_URL = "https://cdn.jsdelivr.net/npm/acorn@8.12.1/dist/acorn.min.js";
  const MAX_FRAMES = 3000;
  const MAX_MS = 2500;
  const STOP = { __kzStop: true };

  function loadAcorn() {
    if (window.acorn) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = ACORN_URL;
      s.onload = resolve;
      s.onerror = () => reject(new Error("acorn жүктелмеді"));
      document.head.appendChild(s);
    });
  }

  const clip = (s, n) => (String(s).length > n ? String(s).slice(0, n - 1) + "…" : String(s));

  /* ---------- Мәнді мәтінге айналдыру ---------- */
  function fmt(v, top, depth) {
    depth = depth || 0;
    if (typeof v === "string") return top ? v : JSON.stringify(v);
    if (v === null) return "null";
    if (v === undefined) return "undefined";
    if (typeof v === "function") return "[функция]";
    if (typeof v !== "object") return String(v);
    if (v.nodeType === 1) return "<" + v.tagName.toLowerCase() + ">";
    if (depth > 2) return Array.isArray(v) ? "[…]" : "{…}";
    try {
      if (Array.isArray(v)) return "[" + v.slice(0, 30).map((x) => fmt(x, false, depth + 1)).join(", ") + (v.length > 30 ? ", …" : "") + "]";
      const keys = Object.keys(v).slice(0, 20);
      return "{" + keys.map((k) => k + ": " + fmt(v[k], false, depth + 1)).join(", ") + "}";
    } catch (e) {
      return "[нысан]";
    }
  }

  function describe(name, v, res) {
    const t = typeof v;
    if (t === "function" || t === "symbol") return;
    if (v === null) return res.push({ n: name, t: "null", r: "null", s: "null" });
    if (t === "string") return res.push({ n: name, t: "string", r: clip(JSON.stringify(v), 60), s: clip(v, 200) });
    if (t !== "object") return res.push({ n: name, t: t, r: clip(String(v), 60), s: clip(String(v), 200) });
    if (Array.isArray(v)) {
      return res.push({
        n: name, t: "array", r: clip(fmt(v), 80),
        i: v.slice(0, 16).map((x) => clip(fmt(x), 12)), more: v.length > 16,
      });
    }
    if (v.nodeType === 1) return res.push({ n: name, t: "element", r: fmt(v) });
    res.push({ n: name, t: "object", r: clip(fmt(v), 80) });
  }

  /* ---------- Қазақша қате түсіндірмелері ---------- */
  function kzSyntax(msg) {
    let m;
    if (/Unterminated string/.test(msg)) return "Тырнақша жабылмаған: мәтіннің басында да, соңында да бірдей тырнақша болуы керек.";
    if (/Unterminated template/.test(msg)) return "Кері тырнақша ` жабылмаған.";
    if ((m = /Identifier '(.+?)' has already been declared/.exec(msg))) return "«" + m[1] + "» қорабы бұрын жасалған. let-ті екінші рет жазба: тек " + m[1] + " = … деп жаз.";
    if (/Missing initializer in const/.test(msg)) return "const қорабына бірден мән беру керек: const x = 5;";
    if (/Unexpected token|Unexpected character|Unexpected string|Unexpected number|Unexpected identifier/.test(msg)) {
      return "Бұл жерде күтпеген белгі тұр. Жақша ( ), ілмек { }, тырнақша не үтір жетіспей тұрған шығар.";
    }
    if (/Assigning to rvalue|Invalid left-hand/.test(msg)) return "Теңдік белгісінің сол жағында қорап аты тұруы керек.";
    return "Жазуда қате бар (синтаксис).";
  }

  function kzRuntime(e) {
    const name = (e && e.name) || "Error";
    const msg = String((e && e.message) || e);
    let m;
    if (name === "ReferenceError") {
      if ((m = /^(.+?) is not defined/.exec(msg))) return "«" + m[1] + "» әлі жасалмаған. Атын дұрыс жаздың ба? let " + m[1] + " = … деп жасадың ба?";
      if ((m = /Cannot access '(.+?)' before initialization/.exec(msg))) return "«" + m[1] + "» қорабын жасамай тұрып қолданып тұрсың. Алдымен let " + m[1] + " = … деп жаз.";
    }
    if (name === "TypeError") {
      if (/Assignment to constant/.test(msg)) return "const арқылы жасалған қорапты өзгертуге болмайды. Өзгеретін мәнге let қолдан.";
      if ((m = /^(.+?) is not a function/.exec(msg))) return "«" + m[1] + "» функция емес, оны жақшамен шақыруға болмайды.";
      if ((m = /Cannot read propert(?:y|ies) of (undefined|null) \(reading '(.+?)'\)/.exec(msg))) return m[1] + " мәнінің «" + m[2] + "» қасиетін оқуға болмайды. Қорапта мән бар ма?";
      if ((m = /Cannot set propert(?:y|ies) of (undefined|null)/.exec(msg))) return m[1] + " мәніне ештеңе жазуға болмайды. Элементті дұрыс таптың ба?";
    }
    if (name === "RangeError" && /call stack/i.test(msg)) return "Функция өзін шексіз шақырып жатыр (рекурсия тоқтамады).";
    if (name === "RangeError" && /array length/i.test(msg)) return "Массив ұзындығы дұрыс емес.";
    return name + ": " + msg;
  }

  /* ---------- Кодты талдау және із қосу ---------- */
  function instrument(code) {
    const ast = acorn.parse(code, { ecmaVersion: "latest", locations: true, sourceType: "script" });
    const ins = [];
    let seq = 0;
    const add = (pos, text) => ins.push({ pos, text, seq: seq++ });
    const features = { has_for: false, has_while: false, has_if: false, has_def: false, has_list: false, js: true };
    const root = { names: new Set(), parent: null };

    const scopeOf = (parent) => ({ names: new Set(), parent });
    const visible = (scope) => {
      const set = new Set();
      for (let s = scope; s; s = s.parent) s.names.forEach((n) => set.add(n));
      return [...set];
    };
    const getters = (names) => "[" + names.map((n) => JSON.stringify(n) + ",()=>" + n).join(",") + "]";
    const trace = (line, scope) => "__t(" + line + "," + getters(visible(scope)) + ");";

    function declare(scope, p) {
      if (!p) return;
      switch (p.type) {
        case "Identifier": scope.names.add(p.name); break;
        case "ObjectPattern": p.properties.forEach((x) => declare(scope, x.type === "RestElement" ? x.argument : x.value)); break;
        case "ArrayPattern": p.elements.forEach((x) => declare(scope, x)); break;
        case "AssignmentPattern": declare(scope, p.left); break;
        case "RestElement": declare(scope, p.argument); break;
      }
    }
    const isVisible = (scope, name) => visible(scope).includes(name);

    function list(stmts, scope, fnScope) {
      stmts.forEach((st) => {
        if (st.type !== "FunctionDeclaration" && st.type !== "EmptyStatement") add(st.start, trace(st.loc.start.line, scope));
        walk(st, scope, fnScope);
      });
    }

    function sub(b, scope, fnScope, isElseIf) {
      if (!b) return;
      if (b.type === "BlockStatement") {
        if (!b.body.some((s) => s.type !== "FunctionDeclaration" && s.type !== "EmptyStatement")) add(b.start + 1, trace(b.loc.start.line, scope));
        return walk(b, scope, fnScope);
      }
      if (isElseIf && b.type === "IfStatement") return walk(b, scope, fnScope);
      add(b.start, "{" + trace(b.loc.start.line, scope));
      walk(b, scope, fnScope);
      add(b.end, "}");
    }

    function walk(n, scope, fnScope) {
      if (!n || typeof n.type !== "string") return;
      switch (n.type) {
        case "Program":
          return list(n.body, scope, fnScope);
        case "BlockStatement":
          return list(n.body, scopeOf(scope), fnScope);
        case "FunctionDeclaration":
        case "FunctionExpression":
        case "ArrowFunctionExpression": {
          features.has_def = true;
          const s = scopeOf(scope);
          n.params.forEach((p) => declare(s, p));
          n.params.forEach((p) => p.type === "AssignmentPattern" && walk(p.right, s, s));
          if (n.body.type === "BlockStatement") list(n.body.body, s, s);
          else walk(n.body, s, s);
          return;
        }
        case "VariableDeclaration":
          n.declarations.forEach((d) => {
            walk(d.init, scope, fnScope);
            declare(n.kind === "var" ? fnScope : scope, d.id);
          });
          return;
        case "ForStatement": {
          features.has_for = true;
          const s = scopeOf(scope);
          walk(n.init, s, fnScope);
          walk(n.test, s, fnScope);
          walk(n.update, s, fnScope);
          return sub(n.body, s, fnScope);
        }
        case "ForInStatement":
        case "ForOfStatement": {
          features.has_for = true;
          const s = scopeOf(scope);
          if (n.left.type === "VariableDeclaration") declare(n.left.kind === "var" ? fnScope : s, n.left.declarations[0].id);
          else walk(n.left, s, fnScope);
          walk(n.right, s, fnScope);
          return sub(n.body, s, fnScope);
        }
        case "WhileStatement":
        case "DoWhileStatement":
          features.has_while = true;
          walk(n.test, scope, fnScope);
          return sub(n.body, scope, fnScope);
        case "IfStatement":
          features.has_if = true;
          walk(n.test, scope, fnScope);
          sub(n.consequent, scope, fnScope);
          return sub(n.alternate, scope, fnScope, true);
        case "SwitchStatement":
          features.has_if = true;
          walk(n.discriminant, scope, fnScope);
          n.cases.forEach((c) => {
            walk(c.test, scope, fnScope);
            list(c.consequent, scopeOf(scope), fnScope);
          });
          return;
        case "TryStatement":
          walk(n.block, scope, fnScope);
          if (n.handler) {
            const s = scopeOf(scope);
            declare(s, n.handler.param);
            list(n.handler.body.body, s, fnScope);
          }
          return walk(n.finalizer, scope, fnScope);
        case "ArrayExpression":
          features.has_list = true;
          break;
        case "AssignmentExpression":
          walk(n.right, scope, fnScope);
          if (n.left.type === "Identifier" && !isVisible(scope, n.left.name)) root.names.add(n.left.name);
          else if (n.left.type !== "Identifier") walk(n.left, scope, fnScope);
          return;
      }
      for (const k of Object.keys(n)) {
        if (k === "type" || k === "start" || k === "end" || k === "loc") continue;
        const c = n[k];
        if (Array.isArray(c)) c.forEach((x) => x && typeof x.type === "string" && walk(x, scope, fnScope));
        else if (c && typeof c.type === "string") walk(c, scope, fnScope);
      }
    }

    walk(ast, root, root);
    ins.sort((a, b) => a.pos - b.pos || a.seq - b.seq);
    let out = "";
    let last = 0;
    ins.forEach((i) => {
      out += code.slice(last, i.pos) + i.text;
      last = i.pos;
    });
    out += code.slice(last);
    out += "\n;__end(" + getters([...root.names]) + ");";
    return { code: out, features };
  }

  function countLines(code) {
    let n = 0;
    let inBlock = false;
    code.split("\n").forEach((raw) => {
      let s = raw.trim();
      if (inBlock) {
        if (s.includes("*/")) {
          inBlock = false;
          s = s.slice(s.indexOf("*/") + 2).trim();
        } else return;
      }
      if (s.startsWith("/*")) {
        if (!s.includes("*/")) inBlock = true;
        return;
      }
      if (s && !s.startsWith("//")) n++;
    });
    return n;
  }

  /* ---------- Орындау ---------- */
  let hostIframe = null;

  function makeFrame(html) {
    if (hostIframe) hostIframe.remove();
    const f = document.createElement("iframe");
    f.title = "Бет";
    f.className = "web-preview js-live";
    const host = document.getElementById("domLive");
    if (host) {
      host.textContent = "";
      host.appendChild(f);
    } else {
      f.style.cssText = "position:fixed;left:-9999px;top:0;width:500px;height:300px;visibility:hidden";
      document.body.appendChild(f);
    }
    const d = f.contentDocument;
    d.open();
    d.write(KZ.buildWebDoc("html", html || "", null, false));
    d.close();
    hostIframe = f;
    return f;
  }

  function run(code, cfgJson) {
    const cfg = cfgJson ? JSON.parse(cfgJson) : {};
    const hasDom = typeof cfg.html === "string";
    const frame = makeFrame(cfg.html || "");
    const win = frame.contentWindow;
    const doc = frame.contentDocument;

    const frames = [];
    const out = [];
    let curLine = 0;
    let finished = false;
    let lastVars = [];
    let lastDom = null;
    const started = Date.now();
    const lines = countLines(code);

    const domNow = () => {
      if (!hasDom) return undefined;
      const h = "<!doctype html>" + clip(doc.documentElement.outerHTML, 40000);
      lastDom = h;
      return h;
    };
    const snap = (g) => {
      const res = [];
      for (let i = 0; i < g.length; i += 2) {
        let v;
        try {
          v = g[i + 1]();
        } catch (e) {
          continue;
        }
        describe(g[i], v, res);
      }
      return res;
    };
    const push = (line, kind, vars, msg) => {
      frames.push({ line, kind, vars, robot: null, out: out.join(""), msg: msg || null, dom: domNow() });
    };
    const __t = (line, g) => {
      if (finished) return;
      if (frames.length >= MAX_FRAMES || Date.now() - started > MAX_MS) {
        finished = true;
        throw STOP;
      }
      curLine = line;
      lastVars = snap(g);
      push(line, "line", lastVars);
    };
    let endVars = null;
    const __end = (g) => {
      endVars = snap(g);
    };

    const write = (args) => out.push(args.map((a) => fmt(a, true)).join(" ") + "\n");
    const cons = {
      log: (...a) => write(a), info: (...a) => write(a), warn: (...a) => write(a), error: (...a) => write(a),
      table: (...a) => write(a), clear: () => {},
    };
    win.alert = (...a) => write(a);
    win.prompt = () => "";
    win.confirm = () => true;

    let error = null;
    let features = { has_for: false, has_while: false, has_if: false, has_def: false, has_list: false, js: true };
    let inst = null;
    try {
      inst = instrument(code);
      features = inst.features;
    } catch (e) {
      const msg = String(e.message || "");
      error = {
        kind: "syntax", msg: kzSyntax(msg), line: e.loc ? e.loc.line : null,
        detail: msg.replace(/\s*\(\d+:\d+\)$/, ""),
      };
    }

    if (inst) {
      try {
        const fn = new win.Function("__t", "__end", "console", inst.code);
        fn(__t, __end, cons);
      } catch (e) {
        if (e === STOP) {
          error = { kind: "limit", msg: "Бағдарлама тым ұзақ жұмыс істеді. Шексіз цикл болып жүрген жоқ па? Циклдің тоқтайтын шартын тексер.", line: curLine, detail: "" };
        } else {
          error = { kind: "runtime", msg: kzRuntime(e), line: curLine || null, detail: String((e && e.name) || "") + ": " + String((e && e.message) || e) };
        }
      }
    }
    finished = true;

    const finalVars = endVars || lastVars;
    if (error) {
      frames.push({ line: error.line, kind: "error", vars: lastVars, robot: null, out: out.join(""), msg: error.msg, dom: hasDom ? lastDom || domNow() : undefined });
    } else {
      frames.push({ line: null, kind: "end", vars: finalVars, robot: null, out: out.join(""), msg: null, dom: domNow() });
    }
    return {
      frames, error, output: out.join(""), lines, features, robot: null,
      engine: "js", dom: hasDom ? { doc, win, iframe: frame } : null,
    };
  }

  KZ.jsRunner = {
    instrument,
    run,
    async load() {
      await loadAcorn();
      return run;
    },
  };
})();
