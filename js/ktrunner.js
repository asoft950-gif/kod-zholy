/* Bitlings: Kotlin орындаушы.
   Kotlin тілінің оқуға қажетті бөлігін (айнымалылар, түрлер, null-қауіпсіздік, шарттар, циклдер, функциялар, коллекциялар,
   лямбдалар, класстар, исключениялар) өзі талдап, JavaScript-те орындайды. Интернет пен сервер керек емес.
   Нәтиже Python/JS орындаушыларымен бірдей пішімде қайтады: { frames, error, output, lines, features, ... }.
   Бұл нағыз Kotlin компиляторы емес: шағын оқу жиыны. Қолдау жоқ нәрсе кездессе, түсінікті қате шығады. */
globalThis.KZ = globalThis.KZ || {};
KZ.t = KZ.t || ((s) => s);
KZ.tt = KZ.tt || ((s, ...a) => s.replace(/\{(\d+)\}/g, (m, i) => a[i]));
(() => {
  "use strict";

  const MAX_FRAMES = 3000;
  const MAX_MS = 2500;
  const MAX_DEPTH = 160;
  const STOP = { __ktStop: true };

  class KtSyntax extends Error {
    constructor(msg, line, detail) {
      super(msg);
      this.line = line;
      this.detail = detail || "";
    }
  }

  /* ====================== Lexer ====================== */
  const OPS3 = ["===", "!==", "..<"];
  const OPS2 = ["?:", "?.", "!!", "->", "::", "==", "!=", "<=", ">=", "&&", "||", "++", "--", "+=", "-=", "*=", "/=", "%=", ".."];
  const isDigit = (c) => c >= "0" && c <= "9";
  const isIdStart = (c) => /[\p{L}_]/u.test(c);
  const isIdChar = (c) => /[\p{L}\p{N}_]/u.test(c);

  function lex(src, line0) {
    const toks = [];
    const n = src.length;
    let i = 0;
    let line = line0 || 1;
    let nl = false;
    const bad = (msg, l, detail) => {
      throw new KtSyntax(msg, l || line, detail);
    };
    const push = (t, v, L, extra) => {
      const tk = { t, v, line: L, nl };
      if (extra) Object.assign(tk, extra);
      toks.push(tk);
      nl = false;
    };
    const escape = (ch, j) => {
      // j: "\" белгісінің индексі; [мән, ұзындық]
      const e = src[j + 1];
      if (e === "n") return ["\n", 2];
      if (e === "t") return ["\t", 2];
      if (e === "r") return ["\r", 2];
      if (e === "b") return ["\b", 2];
      if (e === "0") return ["\0", 2];
      if (e === "\\" || e === '"' || e === "'" || e === "$") return [e, 2];
      if (e === "u") {
        const hex = src.slice(j + 2, j + 6);
        if (/^[0-9a-fA-F]{4}$/.test(hex)) return [String.fromCharCode(parseInt(hex, 16)), 6];
      }
      bad(KZ.t("Тырнақша ішінде белгісіз «\\") + (e || "") + KZ.t("» тіркесі тұр."), line, "Illegal escape");
    };
    while (i < n) {
      const c = src[i];
      if (c === "\n") {
        line++;
        nl = true;
        i++;
        continue;
      }
      if (c === " " || c === "\t" || c === "\r") {
        i++;
        continue;
      }
      if (c === "/" && src[i + 1] === "/") {
        while (i < n && src[i] !== "\n") i++;
        continue;
      }
      if (c === "/" && src[i + 1] === "*") {
        let d = 1;
        const L0 = line;
        i += 2;
        while (i < n && d > 0) {
          if (src[i] === "/" && src[i + 1] === "*") (d++, (i += 2));
          else if (src[i] === "*" && src[i + 1] === "/") (d--, (i += 2));
          else {
            if (src[i] === "\n") (line++, (nl = true));
            i++;
          }
        }
        if (d > 0) bad(KZ.t("Көп жолды пікір /* … */ жабылмаған. Соңына */ қой."), L0, "Unclosed comment");
        continue;
      }
      const L = line;
      if (isDigit(c)) {
        let j = i;
        let isD = false;
        if (c === "0" && /[xX]/.test(src[i + 1] || "")) {
          j = i + 2;
          while (j < n && /[0-9a-fA-F_]/.test(src[j])) j++;
          push("int", parseInt(src.slice(i + 2, j).replace(/_/g, ""), 16), L);
          i = j;
          if (src[i] === "L") i++;
          continue;
        }
        while (j < n && (isDigit(src[j]) || src[j] === "_")) j++;
        if (src[j] === "." && isDigit(src[j + 1] || "")) {
          isD = true;
          j++;
          while (j < n && (isDigit(src[j]) || src[j] === "_")) j++;
        }
        if (/[eE]/.test(src[j] || "") && (isDigit(src[j + 1] || "") || (/[+-]/.test(src[j + 1] || "") && isDigit(src[j + 2] || "")))) {
          isD = true;
          j += 2;
          while (j < n && isDigit(src[j])) j++;
        }
        const txt = src.slice(i, j).replace(/_/g, "");
        i = j;
        if (src[i] === "f" || src[i] === "F") {
          isD = true;
          i++;
        } else if (src[i] === "L") i++;
        push(isD ? "dbl" : "int", Number(txt), L);
        continue;
      }
      if (isIdStart(c)) {
        let j = i + 1;
        while (j < n && isIdChar(src[j])) j++;
        push("id", src.slice(i, j), L);
        i = j;
        continue;
      }
      if (c === "`") {
        const j = src.indexOf("`", i + 1);
        if (j < 0) bad(KZ.t("Кері тырнақша ` жабылмаған."), L, "Unclosed backtick");
        push("id", src.slice(i + 1, j), L, { bt: true });
        i = j + 1;
        continue;
      }
      if (c === '"') {
        const raw = src.startsWith('"""', i);
        const parts = [];
        let buf = "";
        let j = i + (raw ? 3 : 1);
        let closed = false;
        while (j < n) {
          const ch = src[j];
          if (raw ? src.startsWith('"""', j) : ch === '"') {
            closed = true;
            j += raw ? 3 : 1;
            break;
          }
          if (!raw && ch === "\n") break;
          if (ch === "\\" && !raw) {
            const [v, len] = escape(ch, j);
            buf += v;
            j += len;
            continue;
          }
          if (ch === "$") {
            if (src[j + 1] === "{") {
              let d = 1;
              let k = j + 2;
              while (k < n && d > 0) {
                const q = src[k];
                if (q === "{") d++;
                else if (q === "}") d--;
                else if (q === '"') {
                  k++;
                  while (k < n && src[k] !== '"' && src[k] !== "\n") k += src[k] === "\\" ? 2 : 1;
                } else if (q === "'") {
                  k++;
                  while (k < n && src[k] !== "'" && src[k] !== "\n") k += src[k] === "\\" ? 2 : 1;
                }
                if (d > 0) k++;
              }
              if (d > 0) bad(KZ.t("Мәтін ішіндегі ${ … } жабылмаған."), line, "Unclosed template");
              if (buf) (parts.push(buf), (buf = ""));
              parts.push({ code: src.slice(j + 2, k), line });
              line += (src.slice(j, k).match(/\n/g) || []).length;
              j = k + 1;
              continue;
            }
            if (isIdStart(src[j + 1] || "")) {
              let k = j + 2;
              while (k < n && isIdChar(src[k])) k++;
              if (buf) (parts.push(buf), (buf = ""));
              parts.push({ code: src.slice(j + 1, k), line });
              j = k;
              continue;
            }
          }
          if (ch === "\n") line++;
          buf += ch;
          j++;
        }
        if (!closed) bad(KZ.t("Мәтіннің тырнақшасы жабылмаған: басындағыдай \" белгісімен жап."), L, "Unclosed string literal");
        if (buf || !parts.length) parts.push(buf);
        push("str", parts, L, { raw });
        i = j;
        continue;
      }
      if (c === "'") {
        let ch;
        let j = i + 1;
        if (src[j] === "\\") {
          const [v, len] = escape(src[j], j);
          ch = v;
          j += len;
        } else {
          ch = src[j];
          j++;
          if (ch && ch.charCodeAt(0) >= 0xd800 && ch.charCodeAt(0) < 0xdc00) {
            ch += src[j];
            j++;
          }
        }
        if (src[j] !== "'" || ch === undefined) bad(KZ.t("Char (бір таңба) тырнақшасы дұрыс емес. Бір таңбаны 'a' деп жаз, мәтінді \"…\" деп жаз."), L, "Incorrect character literal");
        push("chr", ch, L);
        i = j + 1;
        continue;
      }
      const o3 = src.slice(i, i + 3);
      if (OPS3.includes(o3)) {
        push("op", o3, L);
        i += 3;
        continue;
      }
      const o2 = src.slice(i, i + 2);
      if (OPS2.includes(o2)) {
        push("op", o2, L);
        i += 2;
        continue;
      }
      if ("+-*/%=<>!?:;,.(){}[]@&|".includes(c)) {
        push("op", c, L);
        i++;
        continue;
      }
      if (c === "“" || c === "”" || c === "‘" || c === "’") {
        bad(KZ.t("Кодта қисық тырнақша ") + c + KZ.t(" бар. Тек тік тырнақша \" немесе ' қолдан."), L, "Illegal character");
      }
      bad(KZ.t("Белгісіз таңба: «") + c + "».", L, "Illegal character '" + c + "'");
    }
    toks.push({ t: "eof", v: "", line, nl: true });
    return toks;
  }

  /* ====================== Parser ====================== */
  const MODS = new Set(["private", "public", "internal", "protected", "override", "open", "abstract", "final", "const", "lateinit", "inline", "operator", "infix", "tailrec", "suspend", "data", "sealed", "enum", "annotation", "vararg", "noinline", "crossinline", "companion"]);
  const INFIX = new Set(["to", "until", "downTo", "step", "and", "or", "xor", "shl", "shr", "ushr"]);
  const ASSIGN = new Set(["=", "+=", "-=", "*=", "/=", "%="]);
  const RESERVED = new Set(["if", "else", "when", "for", "while", "do", "return", "break", "continue", "val", "var", "fun", "class", "object", "interface", "try", "catch", "finally", "throw", "in", "is", "as", "null", "true", "false", "this", "super", "typealias", "package", "import"]);

  class Parser {
    constructor(toks) {
      this.t = toks;
      this.p = 0;
    }
    get cur() {
      return this.t[this.p];
    }
    peek(k) {
      return this.t[Math.min(this.p + (k || 0), this.t.length - 1)];
    }
    next() {
      const t = this.t[this.p];
      if (this.p < this.t.length - 1) this.p++;
      return t;
    }
    prevLine() {
      return this.p > 0 ? this.t[this.p - 1].line : this.cur.line;
    }
    isOp(v, k) {
      const t = this.peek(k);
      return t.t === "op" && t.v === v;
    }
    isId(v, k) {
      const t = this.peek(k);
      return t.t === "id" && t.v === v && !t.bt;
    }
    show(t) {
      if (t.t === "eof") return KZ.t("файлдың соңы");
      if (t.t === "str") return '"…"';
      if (t.t === "chr") return "'" + t.v + "'";
      return String(t.v);
    }
    fail(kz, en, tok) {
      tok = tok || this.cur;
      const line = tok.nl && this.p > 0 ? this.prevLine() : tok.line;
      throw new KtSyntax(kz, line, en || "");
    }
    unexpected(tok) {
      tok = tok || this.cur;
      this.fail(KZ.t("Бұл жерде күтпеген «") + this.show(tok) + KZ.t("» тұр. Алдыңғы жолдағы жақша, үтір не белгіні тексер."), "Unexpected token '" + this.show(tok) + "'", tok);
    }
    expectOp(v) {
      if (!this.isOp(v)) this.fail(KZ.t("Мұнда «") + v + KZ.t("» болуы керек."), "Expecting '" + v + "'");
      return this.next();
    }
    expectId(what) {
      const t = this.cur;
      if (t.t !== "id" || (RESERVED.has(t.v) && !t.bt)) this.fail(KZ.t("Мұнда ") + (what || KZ.t("атау")) + KZ.t(" болуы керек."), "Expecting " + (what || "identifier"));
      return this.next().v;
    }
    skipSemis() {
      while (this.isOp(";")) this.next();
    }

    /* ----- Түр ----- */
    parseType() {
      if (this.isOp("(")) {
        this.next();
        const args = [];
        while (!this.isOp(")")) {
          args.push(this.parseType());
          if (this.isOp(",")) this.next();
          else break;
        }
        this.expectOp(")");
        this.expectOp("->");
        const ret = this.parseType();
        return { n: "fn", args, ret, nullable: false };
      }
      let name = this.expectId(KZ.t("түр атауы"));
      while (this.isOp(".") && this.peek(1).t === "id") {
        this.next();
        name = this.next().v;
      }
      const args = [];
      if (this.isOp("<")) {
        this.next();
        for (;;) {
          if (this.isOp("*")) this.next();
          else args.push(this.parseType());
          if (this.isOp(",")) this.next();
          else break;
        }
        this.expectOp(">");
      }
      let nullable = false;
      if (this.isOp("?") && !this.cur.nl) {
        this.next();
        nullable = true;
      }
      return { n: name, args, nullable };
    }
    skipTypeParams() {
      if (!this.isOp("<")) return;
      let d = 0;
      do {
        if (this.isOp("<")) d++;
        else if (this.isOp(">")) d--;
        else if (this.cur.t === "eof") this.unexpected();
        this.next();
      } while (d > 0);
    }

    /* ----- Бағдарлама ----- */
    parseProgram() {
      const decls = [];
      this.skipSemis();
      while (this.cur.t !== "eof") {
        if (this.isId("package") || this.isId("import")) {
          const line = this.cur.line;
          this.next();
          while (this.cur.t !== "eof" && !this.cur.nl) this.next();
          void line;
          this.skipSemis();
          continue;
        }
        const st = this.parseStatement(true);
        const k = st.k;
        if (!(k === "fun" || k === "class" || k === "var")) {
          throw new KtSyntax(
            KZ.t("Кодты main() функциясының ішіне жаз: fun main() { … }. Функция мен класстан тыс тек fun, class, val, var тұра алады."),
            st.line,
            "Expecting a top level declaration"
          );
        }
        decls.push(st);
        if (!this.cur.nl && !this.isOp(";") && this.cur.t !== "eof") this.unexpected();
        this.skipSemis();
      }
      return decls;
    }

    parseMods() {
      const m = new Set();
      for (;;) {
        const t = this.cur;
        if (t.t === "id" && MODS.has(t.v) && !t.bt) {
          // "data", "enum", "companion", "open"... тек кейін class/fun/val/object келсе ғана модификатор
          const nx = this.peek(1);
          if (nx.t === "id" || (nx.t === "op" && nx.v === "@")) {
            m.add(t.v);
            this.next();
            continue;
          }
        }
        if (this.isOp("@") && this.peek(1).t === "id") {
          this.next();
          this.next();
          if (this.isOp("(") && !this.cur.nl) {
            let d = 0;
            do {
              if (this.isOp("(")) d++;
              else if (this.isOp(")")) d--;
              this.next();
            } while (d > 0 && this.cur.t !== "eof");
          }
          continue;
        }
        break;
      }
      return m;
    }

    takeLabel() {
      if (this.isOp("@") && !this.cur.nl && this.peek(1).t === "id") {
        this.next();
        const l = this.cur.v;
        this.next();
        return l;
      }
      return null;
    }

    parseStatement(top) {
      const mods = this.parseMods();
      const t = this.cur;
      const line = t.line;
      if (t.t === "id" && !t.bt && this.peek(1).t === "op" && this.peek(1).v === "@" && !this.peek(1).nl && ["for", "while", "do"].includes(this.peek(2).v)) {
        this.next();
        this.next();
        const st = this.parseStatement();
        st.label = t.v;
        return st;
      }
      if (t.t === "id" && !t.bt) {
        switch (t.v) {
          case "val":
          case "var":
            return this.parseVar(mods);
          case "fun":
            if (this.peek(1).t === "id" || this.isOp("<", 1)) return this.parseFun(mods);
            break;
          case "class":
          case "interface":
          case "object":
            return this.parseClass(mods);
          case "for":
            return this.parseFor();
          case "while": {
            this.next();
            this.expectOp("(");
            const cond = this.parseExpr();
            this.expectOp(")");
            const body = this.parseBody();
            return { k: "while", line, cond, body };
          }
          case "do": {
            this.next();
            const body = this.parseBody();
            if (!this.isId("while")) this.fail(KZ.t("do { … } блогынан кейін while (шарт) болуы керек."), "Expecting 'while'");
            this.next();
            this.expectOp("(");
            const cond = this.parseExpr();
            this.expectOp(")");
            return { k: "dowhile", line, cond, body };
          }
          case "return": {
            this.next();
            let e = null;
            if (!this.cur.nl && !this.isOp("}") && !this.isOp(";") && this.cur.t !== "eof") e = this.parseExpr();
            return { k: "return", line, e };
          }
          case "break":
            this.next();
            return { k: "break", line, label: this.takeLabel() };
          case "continue":
            this.next();
            return { k: "continue", line, label: this.takeLabel() };
          case "throw": {
            this.next();
            return { k: "throw", line, e: this.parseExpr() };
          }
          case "typealias":
            this.fail(KZ.t("typealias бұл курста қолдау таппайды."), "typealias is not supported");
        }
      }
      if (top && mods.size && !(t.t === "id")) this.unexpected();
      // өрнек не меншіктеу
      const e = this.parseExpr();
      if (this.cur.t === "op" && ASSIGN.has(this.cur.v) && !this.cur.nl) {
        const op = this.next().v;
        if (!(e.k === "id" || e.k === "mem" || e.k === "idx")) {
          throw new KtSyntax(KZ.t("Теңдік белгісінің сол жағында қорап аты (айнымалы) тұруы керек."), line, "The left-hand side of an assignment must be a variable");
        }
        const value = this.parseExpr();
        return { k: "assign", line, target: e, op, value };
      }
      return { k: "expr", line, e };
    }

    parseVar(mods) {
      const line = this.cur.line;
      const mut = this.next().v === "var";
      let names = null;
      let name = null;
      if (this.isOp("(")) {
        this.next();
        names = [];
        for (;;) {
          names.push(this.isId("_") ? (this.next(), "_") : this.expectId());
          if (this.isOp(",")) this.next();
          else break;
        }
        this.expectOp(")");
      } else name = this.expectId(KZ.t("айнымалы аты"));
      let type = null;
      if (this.isOp(":")) {
        this.next();
        type = this.parseType();
      }
      let init = null;
      if (this.isOp("=")) {
        this.next();
        init = this.parseExpr();
      } else if (this.isId("by")) {
        this.fail(KZ.t("by (delegate) бұл курста қолдау таппайды."), "Delegates are not supported");
      }
      let getter = null;
      if (this.isId("get") && this.isOp("(", 1)) {
        this.next();
        this.expectOp("(");
        this.expectOp(")");
        if (this.isOp(":")) (this.next(), this.parseType());
        if (this.isOp("=")) {
          this.next();
          getter = { expr: this.parseExpr() };
        } else getter = { block: this.parseBlock() };
      }
      if (!init && !type && !getter) this.fail("«" + (name || "…") + KZ.t("» үшін түр не бастапқы мән керек: val x = 5 не val x: Int = 5."), "This variable must either have a type annotation or be initialized");
      return { k: "var", line, mut, name, names, type, init, getter, mods };
    }

    parseFun(mods) {
      const line = this.cur.line;
      this.next(); // fun
      this.skipTypeParams();
      let name = this.expectId(KZ.t("функция аты"));
      let recv = null;
      if (this.isOp(".")) {
        this.next();
        recv = name;
        name = this.expectId(KZ.t("функция аты"));
      }
      const params = this.parseParams();
      let ret = null;
      if (this.isOp(":")) {
        this.next();
        ret = this.parseType();
      }
      let body = null;
      let expr = null;
      if (this.isOp("{")) body = this.parseBlock();
      else if (this.isOp("=")) {
        this.next();
        expr = this.parseExpr();
      } else if (!mods.has("abstract") && !this.inInterface) {
        this.fail(KZ.t("Функцияның денесі { … } немесе = өрнек болуы керек."), "Function body is expected");
      }
      return { k: "fun", line, name, recv, params, ret, body, expr, mods };
    }

    parseParams() {
      this.expectOp("(");
      const params = [];
      while (!this.isOp(")")) {
        const m = this.parseMods();
        let isProp = false;
        let mut = false;
        if (this.isId("val") || this.isId("var")) {
          isProp = true;
          mut = this.next().v === "var";
        }
        const nameTok = this.cur;
        const name = this.expectId(KZ.t("параметр аты"));
        let type = null;
        if (this.isOp(":")) {
          this.next();
          type = this.parseType();
        } else if (!this.lambdaParams) this.fail(KZ.t("Параметрдің түрін жаз: ") + name + ": Int.", "A type annotation is required on parameter '" + name + "'", nameTok);
        let def = null;
        if (this.isOp("=")) {
          this.next();
          def = this.parseExpr();
        }
        params.push({ name, type, def, vararg: m.has("vararg"), isProp, mut, priv: m.has("private") });
        if (this.isOp(",")) this.next();
        else break;
      }
      this.expectOp(")");
      return params;
    }

    parseClass(mods) {
      const line = this.cur.line;
      const kw = this.next().v; // class | interface | object
      let kind = kw;
      if (kw === "class" && mods.has("enum")) kind = "enum";
      const name = this.expectId(kw === "object" ? KZ.t("объект аты") : KZ.t("класс аты"));
      this.skipTypeParams();
      let params = [];
      if (this.isOp("(") && kw === "class") params = this.parseParams();
      const supers = [];
      if (this.isOp(":")) {
        this.next();
        for (;;) {
          const type = this.parseType();
          let args = null;
          if (this.isOp("(")) args = this.parseArgs().args;
          supers.push({ type, args });
          if (this.isOp(",")) this.next();
          else break;
        }
      }
      const members = [];
      const entries = [];
      if (this.isOp("{")) {
        this.next();
        this.skipSemis();
        const prevIface = this.inInterface;
        this.inInterface = kind === "interface";
        if (kind === "enum") {
          while (this.cur.t === "id" && !this.isOp("}")) {
            const eline = this.cur.line;
            const en = this.expectId(KZ.t("enum мәні"));
            let args = [];
            if (this.isOp("(")) args = this.parseArgs().args;
            entries.push({ name: en, args, line: eline });
            if (this.isOp(",")) this.next();
            else break;
          }
          this.skipSemis();
        }
        while (!this.isOp("}")) {
          if (this.cur.t === "eof") this.fail(KZ.t("Класстың { ілмегі жабылмаған. Соңына } қой."), "Expecting '}'");
          const mm = this.parseMods();
          const t = this.cur;
          if (t.t === "id" && (t.v === "val" || t.v === "var")) {
            const v = this.parseVar(mm);
            members.push({ k: "prop", v, mods: mm });
          } else if (this.isId("fun")) members.push({ k: "method", f: this.parseFun(mm), mods: mm });
          else if (this.isId("init") && this.isOp("{", 1)) {
            this.next();
            members.push({ k: "init", body: this.parseBlock() });
          } else if (this.isId("constructor")) {
            this.fail(KZ.t("Қосымша constructor бұл курста қолдау таппайды. Негізгі конструкторды класс атының жанында жаз."), "Secondary constructors are not supported");
          } else if (this.isId("class") || this.isId("object") || this.isId("interface")) {
            this.fail(KZ.t("Класстың ішінде басқа класс бұл курста қолдау таппайды."), "Nested classes are not supported");
          } else if (mm.has("companion")) this.fail(KZ.t("companion object бұл курста қолдау таппайды."), "Companion objects are not supported");
          else this.unexpected();
          this.skipSemis();
        }
        this.expectOp("}");
        this.inInterface = prevIface;
      }
      return { k: "class", line, name, kind, data: mods.has("data"), abstract: mods.has("abstract"), params, supers, members, entries, mods };
    }

    parseFor() {
      const line = this.next().line;
      this.expectOp("(");
      let names = null;
      let name = null;
      if (this.isOp("(")) {
        this.next();
        names = [];
        for (;;) {
          names.push(this.isId("_") ? (this.next(), "_") : this.expectId());
          if (this.isOp(",")) this.next();
          else break;
        }
        this.expectOp(")");
      } else name = this.isId("_") ? (this.next(), "_") : this.expectId(KZ.t("цикл айнымалысы"));
      if (this.isOp(":")) {
        this.next();
        this.parseType();
      }
      if (!this.isId("in")) this.fail(KZ.t("for циклінде «in» керек: for (x in 1..5)."), "Expecting 'in'");
      this.next();
      const iter = this.parseExpr();
      this.expectOp(")");
      const body = this.parseBody();
      return { k: "for", line, name, names, iter, body };
    }

    parseBlock() {
      const open = this.expectOp("{");
      const stmts = this.parseStmts();
      if (!this.isOp("}")) {
        this.fail(KZ.t("«{» ілмегі жабылмаған (") + open.line + KZ.t("-жолдан басталған). Соңына «}» қой."), "Expecting '}'");
      }
      this.next();
      return { k: "block", line: open.line, stmts };
    }
    parseStmts() {
      const stmts = [];
      this.skipSemis();
      while (!this.isOp("}") && this.cur.t !== "eof") {
        stmts.push(this.parseStatement(false));
        if (!this.cur.nl && !this.isOp(";") && !this.isOp("}") && this.cur.t !== "eof") this.unexpected();
        this.skipSemis();
      }
      return stmts;
    }
    parseBody() {
      if (this.isOp("{")) return this.parseBlock();
      return this.parseStatement(false);
    }

    /* ----- Өрнектер ----- */
    parseExpr() {
      return this.parseBin(0);
    }
    parseBin(level) {
      if (level > 9) return this.parseAs();
      let left = this.parseBin(level + 1);
      for (;;) {
        const t = this.cur;
        let op = null;
        let neg = false;
        let adv = 1;
        if (t.t === "op") {
          if (t.nl && !(t.v === "&&" || t.v === "||" || t.v === "?:")) break;
          const v = t.v;
          if (level === 0 && v === "||") op = "||";
          else if (level === 1 && v === "&&") op = "&&";
          else if (level === 2 && (v === "==" || v === "!=" || v === "===" || v === "!==")) op = v;
          else if (level === 3 && (v === "<" || v === ">" || v === "<=" || v === ">=")) op = v;
          else if (level === 4 && v === "!" && this.peek(1).t === "id" && (this.peek(1).v === "in" || this.peek(1).v === "is") && !this.peek(1).nl) {
            op = this.peek(1).v;
            neg = true;
            adv = 2;
          } else if (level === 5 && v === "?:") op = "?:";
          else if (level === 7 && (v === ".." || v === "..<")) op = v;
          else if (level === 8 && (v === "+" || v === "-")) op = v;
          else if (level === 9 && (v === "*" || v === "/" || v === "%")) op = v;
        } else if (t.t === "id" && !t.bt && !t.nl) {
          if (level === 4 && (t.v === "in" || t.v === "is")) op = t.v;
          else if (level === 6 && INFIX.has(t.v)) op = t.v;
        }
        if (!op) break;
        const line = t.line;
        for (let k = 0; k < adv; k++) this.next();
        if (op === "is") {
          const type = this.parseType();
          left = { k: "is", line, e: left, type, neg };
          continue;
        }
        const right = this.parseBin(level + 1);
        if (op === "&&" || op === "||") left = { k: "logic", line, op, a: left, b: right };
        else if (op === "?:") left = { k: "elvis", line, a: left, b: right };
        else if (op === "in") left = { k: "in", line, e: left, c: right, neg };
        else left = { k: "bin", line, op, a: left, b: right };
      }
      return left;
    }
    parseAs() {
      let e = this.parseUnary();
      while (this.isId("as") && !this.cur.nl) {
        const line = this.next().line;
        let safe = false;
        if (this.isOp("?")) {
          this.next();
          safe = true;
        }
        e = { k: "as", line, e, type: this.parseType(), safe };
      }
      return e;
    }
    parseUnary() {
      const t = this.cur;
      if (t.t === "op") {
        if (t.v === "-" || t.v === "+" || t.v === "!") {
          this.next();
          const e = this.parseUnary();
          if (t.v === "-" && e.k === "lit" && (typeof e.v === "number" || e.d)) return { k: "lit", line: t.line, v: -e.v, d: e.d };
          return { k: "un", line: t.line, op: t.v, e };
        }
        if (t.v === "++" || t.v === "--") {
          this.next();
          return { k: "incdec", line: t.line, op: t.v, prefix: true, target: this.parseUnary() };
        }
      }
      return this.parsePostfix();
    }

    parseArgs() {
      this.expectOp("(");
      const args = [];
      const named = [];
      while (!this.isOp(")")) {
        if (this.cur.t === "eof") this.fail(KZ.t("Функция шақыруындағы « ( » жабылмаған. Соңына « ) » қой."), "Expecting ')'");
        if (this.cur.t === "id" && this.isOp("=", 1) && !this.isOp("==", 1)) {
          const nm = this.next().v;
          this.next();
          named.push({ name: nm, e: this.parseExpr() });
        } else args.push(this.parseExpr());
        if (this.isOp(",")) this.next();
        else break;
      }
      this.expectOp(")");
      return { args, named };
    }

    trySkipTypeArgs() {
      if (!this.isOp("<")) return false;
      const save = this.p;
      try {
        this.next();
        for (;;) {
          this.parseType();
          if (this.isOp(",")) this.next();
          else break;
        }
        this.expectOp(">");
        if (this.isOp("(") && !this.cur.nl) return true;
      } catch (e) {
        if (!(e instanceof KtSyntax)) throw e;
      }
      this.p = save;
      return false;
    }

    parsePostfix() {
      let e = this.parsePrimary();
      for (;;) {
        const t = this.cur;
        if (t.t !== "op") break;
        if (t.v === "." || t.v === "?.") {
          this.next();
          const nt = this.cur;
          if (nt.t !== "id") this.fail(KZ.t("Нүктеден кейін қасиет не функция аты болуы керек."), "Expecting member name after '.'");
          this.next();
          e = { k: "mem", line: nt.line, obj: e, name: nt.v, safe: t.v === "?." };
          continue;
        }
        if (t.v === "(" && !t.nl) {
          const line = t.line;
          const { args, named } = this.parseArgs();
          let trailing = null;
          if (this.isOp("{") && !this.cur.nl) trailing = this.parseLambda();
          e = { k: "call", line, fn: e, args, named, trailing };
          continue;
        }
        if (t.v === "<" && e.k === "id" && this.trySkipTypeArgs()) continue;
        if (t.v === "{" && !t.nl && (e.k === "id" || e.k === "mem" || e.k === "call")) {
          // trailing lambda: list.forEach { … }
          if (e.k === "call" && e.trailing) break;
          const line = t.line;
          const trailing = this.parseLambda();
          if (e.k === "call") e = Object.assign({}, e, { trailing });
          else e = { k: "call", line, fn: e, args: [], named: [], trailing };
          continue;
        }
        if (t.v === "[" && !t.nl) {
          const line = this.next().line;
          const idx = [];
          for (;;) {
            idx.push(this.parseExpr());
            if (this.isOp(",")) this.next();
            else break;
          }
          this.expectOp("]");
          e = { k: "idx", line, obj: e, idx };
          continue;
        }
        if (t.v === "!!" && !t.nl) {
          this.next();
          e = { k: "nn", line: t.line, e };
          continue;
        }
        if ((t.v === "++" || t.v === "--") && !t.nl) {
          this.next();
          e = { k: "incdec", line: t.line, op: t.v, prefix: false, target: e };
          continue;
        }
        break;
      }
      return e;
    }

    parseLambda() {
      const open = this.expectOp("{");
      let params = null;
      const save = this.p;
      // параметрлер: x, y ->  не (a, b) ->
      try {
        const ps = [];
        for (;;) {
          if (this.isOp("(")) {
            this.next();
            const names = [];
            for (;;) {
              names.push(this.isId("_") ? (this.next(), "_") : this.expectId());
              if (this.isOp(",")) this.next();
              else break;
            }
            this.expectOp(")");
            ps.push({ destruct: names });
          } else {
            const nm = this.isId("_") ? (this.next(), "_") : this.expectId();
            let type = null;
            if (this.isOp(":")) {
              this.next();
              type = this.parseType();
            }
            ps.push({ name: nm, type });
          }
          if (this.isOp(",")) this.next();
          else break;
        }
        if (this.isOp("->")) {
          this.next();
          params = ps;
        } else this.p = save;
      } catch (e) {
        if (!(e instanceof KtSyntax)) throw e;
        this.p = save;
      }
      if (!params && this.isOp("->")) {
        this.next();
        params = [];
      }
      const stmts = this.parseStmts();
      if (!this.isOp("}")) this.fail(KZ.t("Лямбданың « { » ілмегі жабылмаған. Соңына « } » қой."), "Expecting '}'");
      this.next();
      return { k: "lambda", line: open.line, params, body: { k: "block", line: open.line, stmts } };
    }

    parseIf() {
      const line = this.next().line;
      this.expectOp("(");
      const cond = this.parseExpr();
      this.expectOp(")");
      const then = this.parseBody();
      let els = null;
      if (this.isId("else")) {
        this.next();
        els = this.parseBody();
      }
      return { k: "if", line, cond, then, els };
    }

    parseWhen() {
      const line = this.next().line;
      let subject = null;
      if (this.isOp("(")) {
        this.next();
        subject = this.parseExpr();
        this.expectOp(")");
      }
      this.expectOp("{");
      const branches = [];
      this.skipSemis();
      while (!this.isOp("}")) {
        if (this.cur.t === "eof") this.fail(KZ.t("when { … } блогы жабылмаған. Соңына } қой."), "Expecting '}'");
        const bline = this.cur.line;
        let conds = null;
        if (this.isId("else")) {
          this.next();
        } else {
          conds = [];
          for (;;) {
            if (this.isId("in")) {
              this.next();
              conds.push({ kind: "in", neg: false, e: this.parseBin(5) });
            } else if (this.isOp("!") && this.isId("in", 1)) {
              this.next();
              this.next();
              conds.push({ kind: "in", neg: true, e: this.parseBin(5) });
            } else if (this.isId("is")) {
              this.next();
              conds.push({ kind: "is", neg: false, type: this.parseType() });
            } else if (this.isOp("!") && this.isId("is", 1)) {
              this.next();
              this.next();
              conds.push({ kind: "is", neg: true, type: this.parseType() });
            } else conds.push({ kind: "eq", e: this.parseExpr() });
            if (this.isOp(",")) this.next();
            else break;
          }
        }
        if (!this.isOp("->")) this.fail(KZ.t("when ішінде шарттан кейін «->» керек."), "Expecting '->'");
        this.next();
        const body = this.parseBody();
        branches.push({ line: bline, conds, body });
        this.skipSemis();
      }
      this.next();
      return { k: "when", line, subject, branches };
    }

    parseTry() {
      const line = this.next().line;
      const block = this.parseBlock();
      const catches = [];
      let fin = null;
      while (this.isId("catch")) {
        this.next();
        this.expectOp("(");
        const name = this.expectId();
        this.expectOp(":");
        const type = this.parseType();
        this.expectOp(")");
        catches.push({ name, type, body: this.parseBlock() });
      }
      if (this.isId("finally")) {
        this.next();
        fin = this.parseBlock();
      }
      if (!catches.length && !fin) this.fail(KZ.t("try-дан кейін catch не finally болуы керек."), "Expecting 'catch' or 'finally'");
      return { k: "try", line, block, catches, fin };
    }

    parseTemplate(tok) {
      const parts = tok.v.map((p) => {
        if (typeof p === "string") return p;
        const sub = new Parser(lex(p.code, p.line));
        const e = sub.parseExpr();
        if (sub.cur.t !== "eof") sub.unexpected();
        return e;
      });
      if (parts.length === 1 && typeof parts[0] === "string") return { k: "lit", line: tok.line, v: parts[0] };
      return { k: "tpl", line: tok.line, parts };
    }

    parsePrimary() {
      const t = this.cur;
      const line = t.line;
      if (t.t === "int") {
        this.next();
        return { k: "lit", line, v: t.v };
      }
      if (t.t === "dbl") {
        this.next();
        return { k: "lit", line, v: t.v, d: true };
      }
      if (t.t === "str") {
        this.next();
        return this.parseTemplate(t);
      }
      if (t.t === "chr") {
        this.next();
        return { k: "chr", line, v: t.v };
      }
      if (t.t === "id" && !t.bt) {
        switch (t.v) {
          case "true":
          case "false":
            this.next();
            return { k: "lit", line, v: t.v === "true" };
          case "null":
            this.next();
            return { k: "lit", line, v: null };
          case "this":
            this.next();
            return { k: "id", line, name: "this" };
          case "super":
            this.next();
            return { k: "id", line, name: "super" };
          case "if":
            return this.parseIf();
          case "when":
            return this.parseWhen();
          case "try":
            return this.parseTry();
          case "return": {
            this.next();
            let e = null;
            if (!this.cur.nl && !this.isOp("}") && !this.isOp(")") && !this.isOp(";")) e = this.parseExpr();
            return { k: "retx", line, e };
          }
          case "throw":
            this.next();
            return { k: "throwx", line, e: this.parseExpr() };
          case "break":
            this.next();
            return { k: "brkx", line, label: this.takeLabel() };
          case "continue":
            this.next();
            return { k: "contx", line, label: this.takeLabel() };
          case "object":
            this.fail(KZ.t("Анонимді object бұл курста қолдау таппайды."), "Anonymous objects are not supported");
        }
        if (RESERVED.has(t.v)) this.unexpected();
        this.next();
        return { k: "id", line, name: t.v };
      }
      if (t.t === "id") {
        this.next();
        return { k: "id", line, name: t.v };
      }
      if (t.t === "op") {
        if (t.v === "(") {
          this.next();
          const e = this.parseExpr();
          this.expectOp(")");
          return { k: "paren", line, e };
        }
        if (t.v === "{") return this.parseLambda();
        if (t.v === "::") {
          this.next();
          return { k: "ref", line, name: this.expectId() };
        }
      }
      this.unexpected();
    }
  }

  function parse(code) {
    const toks = lex(code, 1);
    return new Parser(toks).parseProgram();
  }

  KZ.ktParse = parse;
  KZ.ktLex = lex;
  KZ.__ktInternals = { KtSyntax, STOP, MAX_FRAMES, MAX_MS, MAX_DEPTH };
})();

/* ====================== Орындаушы ====================== */
(() => {
  "use strict";
  const { KtSyntax, STOP, MAX_FRAMES, MAX_MS, MAX_DEPTH } = KZ.__ktInternals;

  /* ---------- Мәндер ---------- */
  class KD { constructor(v) { this.v = v; } }
  class KC { constructor(c) { this.c = c; } }
  class KList { constructor(a, mut, arr) { this.a = a; this.mut = !!mut; this.arr = !!arr; } }
  class KSet { constructor(a, mut) { this.a = a; this.mut = !!mut; } }
  class KMap { constructor(mut) { this.m = new Map(); this.mut = !!mut; } }
  class KPair { constructor(a, b) { this.a = a; this.b = b; } }
  class KRange { constructor(a, b, step, excl, chr) { this.a = a; this.b = b; this.step = step || 1; this.excl = !!excl; this.chr = !!chr; } }
  class KFun {
    constructor(o) { Object.assign(this, o); this.more = []; }
  }
  class KClass {
    constructor(name) { this.name = name; this.parent = null; this.supers = []; this.methods = new Map(); this.getters = new Map(); this.props = []; this.node = null; this.env = null; this.builtin = false; this.entries = null; }
  }
  class KObj { constructor(cls) { this.cls = cls; this.f = new Map(); } }
  class KNs { constructor(name) { this.name = name; } }
  const UNIT = { unit: true };
  const NOPE = { nope: true };

  class KtErr extends Error {
    constructor(msg, tip, detail) { super(msg); this.tip = tip || ""; this.detail = detail || ""; this.line = null; }
  }
  class KThrow { constructor(obj) { this.obj = obj; } }
  class BreakSig { constructor(label) { this.label = label || null; } }
  class ContinueSig { constructor(label) { this.label = label || null; } }
  class ReturnSig { constructor(v) { this.v = v; } }
  const BRK = new BreakSig();
  const CNT = new ContinueSig();

  class Scope {
    constructor(parent) { this.parent = parent || null; this.vars = new Map(); this.self = null; this.recv = undefined; }
  }

  /* ---------- Көмекшілер ---------- */
  const clip = (s, n) => (String(s).length > n ? String(s).slice(0, n - 1) + "…" : String(s));
  const isNum = (v) => typeof v === "number";
  const isNumeric = (v) => typeof v === "number" || v instanceof KD;
  const numv = (v) => (v instanceof KD ? v.v : v);
  const cpoint = (c) => c.codePointAt(0);

  function dstr(x) {
    if (Number.isNaN(x)) return "NaN";
    if (!Number.isFinite(x)) return x > 0 ? "Infinity" : "-Infinity";
    const ax = Math.abs(x);
    if (Number.isInteger(x) && ax < 1e7) return x.toFixed(1);
    if (ax >= 1e7 || (ax < 1e-3 && x !== 0)) {
      const [m, e] = x.toExponential().split("e");
      return (m.includes(".") ? m : m + ".0") + "E" + e.replace("+", "");
    }
    return String(x);
  }

  function typeName(v) {
    if (v === null) return "Nothing?";
    if (v === UNIT) return "Unit";
    if (isNum(v)) return "Int";
    if (v instanceof KD) return "Double";
    if (typeof v === "string") return "String";
    if (typeof v === "boolean") return "Boolean";
    if (v instanceof KC) return "Char";
    if (v instanceof KList) return v.arr ? "Array" : v.mut ? "MutableList" : "List";
    if (v instanceof KSet) return v.mut ? "MutableSet" : "Set";
    if (v instanceof KMap) return v.mut ? "MutableMap" : "Map";
    if (v instanceof KPair) return "Pair";
    if (v instanceof KRange) return v.chr ? "CharRange" : "IntRange";
    if (v instanceof KObj) return v.cls.name;
    if (v instanceof KFun || typeof v === "function") return "Function";
    if (v instanceof KClass) return "KClass";
    return "Any";
  }
  const kindOf = (v) => (isNum(v) ? "Int" : v instanceof KD ? "Double" : typeof v === "string" ? "String" : typeof v === "boolean" ? "Boolean" : v instanceof KC ? "Char" : v instanceof KList ? "List" : v instanceof KMap ? "Map" : v instanceof KSet ? "Set" : null);

  let idSeq = 0;
  const ids = new WeakMap();
  function objId(o) {
    if (!ids.has(o)) ids.set(o, ++idSeq);
    return ids.get(o);
  }

  /* ---------- Негізгі түрлер мен исключениялар ---------- */
  const EXC = {};
  function mkExc(name, parent, pkg) {
    const c = new KClass(name);
    c.builtin = true;
    c.pkg = pkg === undefined ? "java.lang." : pkg;
    c.parent = parent ? EXC[parent] : null;
    EXC[name] = c;
    return c;
  }
  mkExc("Throwable");
  mkExc("Exception", "Throwable");
  mkExc("Error", "Throwable");
  mkExc("RuntimeException", "Exception");
  mkExc("IllegalArgumentException", "RuntimeException");
  mkExc("IllegalStateException", "RuntimeException");
  mkExc("NumberFormatException", "IllegalArgumentException");
  mkExc("ArithmeticException", "RuntimeException");
  mkExc("IndexOutOfBoundsException", "RuntimeException");
  mkExc("StringIndexOutOfBoundsException", "IndexOutOfBoundsException");
  mkExc("ArrayIndexOutOfBoundsException", "IndexOutOfBoundsException");
  mkExc("NullPointerException", "RuntimeException");
  mkExc("ClassCastException", "RuntimeException");
  mkExc("UnsupportedOperationException", "RuntimeException");
  mkExc("NoSuchElementException", "RuntimeException", "java.util.");
  mkExc("ConcurrentModificationException", "RuntimeException", "java.util.");
  mkExc("StackOverflowError", "Error");
  mkExc("OutOfMemoryError", "Error");
  mkExc("AssertionError", "Error");
  mkExc("NotImplementedError", "Error", "kotlin.");

  const isSub = (cls, name) => {
    for (let c = cls; c; c = c.parent) {
      if (c.name === name) return true;
      for (const s of c.supers) if (isSub(s, name)) return true;
    }
    return false;
  };
  const isSubCls = (cls, target) => {
    for (let c = cls; c; c = c.parent) {
      if (c === target) return true;
      for (const s of c.supers) if (isSubCls(s, target)) return true;
    }
    return false;
  };

  const KMUT = new Set(["add", "remove", "removeAt", "clear", "addAll", "removeAll", "set", "sort", "reverse", "removeFirst", "removeLast", "addFirst", "addLast", "sortBy", "sortByDescending", "sortDescending", "retainAll", "removeIf", "fill", "put", "putAll", "shuffle"]);

  function fmtFormat(fmt, args) {
    let k = 0;
    return fmt.replace(/%([-+0 ,#]*)(\d+)?(?:\.(\d+))?([sdfcbxXeEn%])/g, (m, flags, w, p, conv) => {
      if (conv === "%") return "%";
      if (conv === "n") return "\n";
      let a = args[k++];
      let s;
      switch (conv) {
        case "d":
          s = String(numv(a));
          if (flags.includes("+") && numv(a) >= 0) s = "+" + s;
          if (flags.includes(",")) s = Number(numv(a)).toLocaleString("en-US");
          break;
        case "f":
          s = Number(numv(a)).toFixed(p === undefined ? 6 : Number(p));
          if (flags.includes("+") && numv(a) >= 0) s = "+" + s;
          if (flags.includes(",")) s = Number(s).toLocaleString("en-US", { minimumFractionDigits: p === undefined ? 6 : Number(p), maximumFractionDigits: p === undefined ? 6 : Number(p) });
          break;
        case "e":
        case "E":
          s = Number(numv(a)).toExponential(p === undefined ? 6 : Number(p));
          break;
        case "x":
          s = Number(numv(a)).toString(16);
          break;
        case "X":
          s = Number(numv(a)).toString(16).toUpperCase();
          break;
        case "c":
          s = a instanceof KC ? a.c : String.fromCodePoint(a);
          break;
        case "b":
          s = String(a);
          break;
        default:
          s = fmtFormat.toStr(a);
          if (p !== undefined) s = s.slice(0, Number(p));
      }
      if (w) {
        const wd = Number(w);
        if (flags.includes("-")) s = s.padEnd(wd);
        else if (flags.includes("0") && conv !== "s") s = (s[0] === "-" || s[0] === "+" ? s[0] + s.slice(1).padStart(wd - 1, "0") : s.padStart(wd, "0"));
        else s = s.padStart(wd);
      }
      return s;
    });
  }

  /* ---------- Қазақша қате түсіндірмелері ---------- */
  function excInfo(obj, toStr) {
    const name = obj.cls.name;
    const mEnt = obj.f.get("message");
    const m = mEnt && mEnt.v !== null && mEnt.v !== undefined ? String(mEnt.v) : "";
    const full = (obj.cls.builtin ? obj.cls.pkg : "") + name + (m ? ": " + m : "");
    const detail = 'Exception in thread "main" ' + full;
    let msg;
    let tip = "";
    switch (name) {
      case "ArithmeticException":
        msg = KZ.t("0-ге бөлуге болмайды.");
        tip = KZ.t("Бөлместен бұрын бөлгіш 0 емес екенін if арқылы тексер.");
        break;
      case "IndexOutOfBoundsException":
      case "StringIndexOutOfBoundsException":
      case "ArrayIndexOutOfBoundsException":
        msg = KZ.t("Тізімде не мәтінде мұндай нөмір жоқ (") + m + ").";
        tip = KZ.t("Нөмір 0-ден басталады және size - 1-ге дейін барады. Соңғы элемент: list[list.size - 1] не list.last().");
        break;
      case "NumberFormatException":
        msg = KZ.t("Мәтінді санға айналдыру мүмкін болмады (") + m + ").";
        tip = KZ.t("toInt() тек «123» сияқты мәтінге жарайды. Сенімсіз болса, toIntOrNull() қолдан: ол сәтсіз болса null береді.");
        break;
      case "NullPointerException":
        msg = KZ.t("Мән null болып тұр, ал оны null емес деп күттің.");
        tip = KZ.t("!! белгісін қолданбай, ?. не ?: (Элвис) қолдан, не if (x != null) деп тексер.");
        break;
      case "NoSuchElementException":
        msg = KZ.t("Керек элемент табылмады (") + (m || KZ.t("бос жиын")) + ").";
        tip = KZ.t("Бос тізімнен first()/last() алуға болмайды. firstOrNull() қолдан не алдымен isNotEmpty() тексер.");
        break;
      case "StackOverflowError":
        msg = KZ.t("Функция өзін шексіз шақырып жатыр (рекурсия тоқтамады).");
        tip = KZ.t("Рекурсияда тоқтау шарты (if … return) болуы керек және әр шақыруда есеп кішірейіп отыруы керек.");
        break;
      case "IllegalArgumentException":
      case "IllegalStateException":
        msg = KZ.t("Бағдарлама қатемен тоқтады: ") + (m || name);
        tip = KZ.t("Бұл қатені require(…) / check(…) / error(…) шақырған. Шартты не мәнді тексер.");
        break;
      case "UnsupportedOperationException":
        msg = KZ.t("Бұл амалға рұқсат жоқ") + (m ? " (" + m + ")" : "") + ".";
        break;
      case "ClassCastException":
        msg = KZ.t("Мәнді басқа түрге айналдыру мүмкін емес") + (m ? " (" + m + ")" : "") + ".";
        break;
      default:
        msg = KZ.t("Бағдарлама қатемен тоқтады: ") + name + (m ? ": " + m : "") + ".";
        tip = KZ.t("Бұл — throw арқылы лақтырылған қате. try { … } catch (e: ") + name + KZ.t(") { … } арқылы ұстауға болады.");
    }
    return { msg, tip, detail };
  }

  /* ---------- Негізгі функция ---------- */
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
  function srcLine(code, line) {
    if (!line) return "";
    const l = String(code).split("\n")[line - 1];
    return l == null ? "" : l.trim().slice(0, 120);
  }
  function bracketTip(code) {
    const pairs = { ")": "(", "}": "{", "]": "[" };
    const stack = [];
    let q = null;
    for (let i = 0; i < code.length; i++) {
      const c = code[i];
      if (q) {
        if (c === "\\") i++;
        else if (c === q || c === "\n") q = null;
        continue;
      }
      if (c === '"' || c === "'") {
        q = c;
        continue;
      }
      if (c === "/" && code[i + 1] === "/") {
        while (i < code.length && code[i] !== "\n") i++;
        continue;
      }
      if ("({[".includes(c)) stack.push({ c, i });
      else if (pairs[c]) {
        const top = stack.pop();
        if (!top || top.c !== pairs[c]) return "«" + c + KZ.t("» белгісіне сәйкес ашатын жақша жоқ. Артық жабылған жақшаны өшір.");
      }
    }
    if (stack.length) {
      const o = stack[stack.length - 1].c;
      const cl = { "(": ")", "{": "}", "[": "]" }[o];
      return "«" + o + KZ.t("» ашылған, бірақ жабылмаған. Соңына «") + cl + KZ.t("» қой.");
    }
    return "";
  }

  function run(code, cfgJson) {
    void cfgJson;
    const frames = [];
    let outStr = "";
    const started = Date.now();
    let curLine = 0;
    let finished = false;
    let lastVars = [];
    let endVars = null;
    let depth = 0;
    let steps = 0;
    const lines = countLines(code);
    const features = { has_for: false, has_while: false, has_if: false, has_def: false, has_list: false, js: false, kt: true };
    let error = null;
    const exts = [];

    const fail = (msg, tip, detail) => new KtErr(msg, tip, detail);
    const mismatch = (T, v) => {
      const tn = T.n + (T.nullable ? "?" : "");
      let tip = "";
      let msg;
      if (v === null) {
        msg = "«" + T.n + KZ.t("» түріне null беруге болмайды.");
        tip = KZ.t("Мән null болуы мүмкін болса, түрдің соңына ? қой: ") + T.n + "?";
      } else if (T.n === "Double" && isNum(v)) {
        msg = KZ.t("Double түріне бүтін сан беруге болмайды.");
        tip = KZ.t("Нүктелі жаз: 5.0, не санды .toDouble() арқылы айналдыр.");
      } else if (T.n === "Int" && v instanceof KD) {
        msg = KZ.t("Int түріне Double мәнін беруге болмайды (үтірден кейінгі бөлігі жоғалады).");
        tip = KZ.t("Керек болса, .toInt() қолдан: 3.7.toInt() = 3. Не қорап түрін Double қыл.");
      } else if (T.n === "String" && (isNumeric(v) || typeof v === "boolean" || v instanceof KC)) {
        msg = KZ.t("String түріне ") + typeName(v) + KZ.t(" мәнін беруге болмайды.");
        tip = KZ.t("Мәтінге айналдыру үшін .toString() не шаблон \"$x\" қолдан.");
      } else if ((T.n === "Int" || T.n === "Double") && typeof v === "string") {
        msg = T.n + KZ.t(" түріне String мәнін беруге болмайды.");
        tip = T.n === "Int" ? KZ.t("Мәтінді санға айналдыру үшін .toInt() қолдан.") : KZ.t("Мәтінді санға айналдыру үшін .toDouble() қолдан.");
      } else if (T.n === "MutableList" && v instanceof KList) {
        msg = KZ.t("listOf() тізімі өзгермейді, ал «MutableList» өзгеретін тізімді күтеді.");
        tip = KZ.t("mutableListOf(…) қолдан.");
      } else {
        msg = KZ.t("Түр сәйкес емес: «") + tn + KZ.t("» күтілген, ал мәні «") + typeName(v) + "».";
        tip = KZ.t("Қораптың түрі мен оған салатын мәннің түрі бірдей болуы керек.");
      }
      return fail(msg, tip, "Type mismatch: inferred type is " + typeName(v) + " but " + tn + " was expected");
    };
    const typeOk = (v, T) => {
      if (!T) return true;
      if (T.n === "fn") return v instanceof KFun || typeof v === "function" || (T.nullable && v === null);
      if (v === null) return T.nullable || T.n === "Nothing" || T.n === "Any" && T.nullable;
      switch (T.n) {
        case "Int":
        case "Long":
        case "Short":
        case "Byte":
          return isNum(v);
        case "Double":
        case "Float":
          return v instanceof KD;
        case "Number":
          return isNumeric(v);
        case "String":
        case "CharSequence":
          return typeof v === "string";
        case "Boolean":
          return typeof v === "boolean";
        case "Char":
          return v instanceof KC;
        case "Any":
          return true;
        case "Unit":
          return v === UNIT;
        case "List":
        case "Collection":
        case "Iterable":
          return v instanceof KList || v instanceof KSet;
        case "MutableList":
        case "ArrayList":
          return v instanceof KList && v.mut;
        case "Array":
        case "IntArray":
        case "DoubleArray":
          return v instanceof KList;
        case "Set":
          return v instanceof KSet;
        case "MutableSet":
          return v instanceof KSet && v.mut;
        case "Map":
          return v instanceof KMap;
        case "MutableMap":
          return v instanceof KMap && v.mut;
        case "Pair":
          return v instanceof KPair;
        default: {
          const cls = userClasses.get(T.n) || EXC[T.n];
          if (cls) return v instanceof KObj && isSubCls(v.cls, cls);
          return true;
        }
      }
    };
    const userClasses = new Map();
    const checkDecl = (v, T) => {
      if (!typeOk(v, T)) throw mismatch(T, v);
    };
    const checkKind = (v, kind, name) => {
      if (v === null) throw fail("«" + name + KZ.t("» қорабына null беруге болмайды: ол ") + kind + KZ.t(" түрінде жасалған."), KZ.t("Null қабылдау үшін түрді жазып көрсет: var ") + name + ": " + kind + "? = …", "Null can not be a value of a non-null type " + kind);
      const k = kindOf(v);
      if (k && k !== kind && (kind === "Int" || kind === "Double" || kind === "String" || kind === "Boolean" || kind === "Char")) throw mismatch({ n: kind, nullable: false }, v);
    };

    const throwKt = (name, msg) => {
      const obj = new KObj(EXC[name]);
      obj.f.set("message", { v: msg === undefined ? null : msg, mut: false });
      throw new KThrow(obj);
    };

    /* ----- Мәнді мәтінге ----- */
    const toStr = (v) => {
      if (v === null) return "null";
      if (v === UNIT) return "kotlin.Unit";
      if (typeof v === "string") return v;
      if (typeof v === "number" || typeof v === "boolean") return String(v);
      if (v instanceof KD) return dstr(v.v);
      if (v instanceof KC) return v.c;
      if (v instanceof KList) return "[" + v.a.map(toStr).join(", ") + "]";
      if (v instanceof KSet) return "[" + v.a.map(toStr).join(", ") + "]";
      if (v instanceof KMap) return "{" + [...v.m.values()].map(([k, x]) => toStr(k) + "=" + toStr(x)).join(", ") + "}";
      if (v instanceof KPair) return "(" + toStr(v.a) + ", " + toStr(v.b) + ")";
      if (v instanceof KRange) return v.chr ? v.a + ".." + v.b : v.a + (v.excl ? "..<" : "..") + v.b;
      if (v instanceof KObj) return objStr(v);
      if (v instanceof KClass) return "class " + v.name;
      return "Function";
    };
    fmtFormat.toStr = toStr;
    const repr = (v) => {
      if (typeof v === "string") return JSON.stringify(v);
      if (v instanceof KC) return "'" + v.c + "'";
      if (v instanceof KList || v instanceof KSet) return "[" + v.a.map(repr).join(", ") + "]";
      if (v instanceof KMap) return "{" + [...v.m.values()].map(([k, x]) => repr(k) + "=" + repr(x)).join(", ") + "}";
      if (v instanceof KPair) return "(" + repr(v.a) + ", " + repr(v.b) + ")";
      return toStr(v);
    };
    const objStr = (o) => {
      const m = findMethod(o.cls, "toString");
      if (m) return toStr(callFn(bindFn(m, o), [], {}, null));
      const c = o.cls;
      if (c.enumEntry) return o.enumName;
      if (isSub(c, "Throwable")) {
        const mm = o.f.get("message");
        const base = (c.builtin ? c.pkg : "") + c.name;
        return mm && mm.v !== null ? base + ": " + toStr(mm.v) : base;
      }
      if (c.node && c.node.data) return c.name + "(" + c.node.params.filter((p) => p.isProp).map((p) => p.name + "=" + toStr(o.f.get(p.name).v)).join(", ") + ")";
      if (c.node && c.node.kind === "object") return c.name;
      return c.name + "@" + (objId(o) * 7919 + 0x1b6d3586).toString(16);
    };

    const keyOf = (v) => {
      if (v === null) return "null";
      if (isNum(v)) return "n" + v;
      if (v instanceof KD) return "d" + v.v;
      if (typeof v === "string") return "s" + v;
      if (typeof v === "boolean") return "b" + v;
      if (v instanceof KC) return "c" + v.c;
      if (v instanceof KPair) return "p(" + keyOf(v.a) + "," + keyOf(v.b) + ")";
      if (v instanceof KList) return "l[" + v.a.map(keyOf).join(",") + "]";
      if (v instanceof KObj && v.cls.node && v.cls.node.data) return "o" + v.cls.name + "(" + v.cls.node.params.filter((p) => p.isProp).map((p) => keyOf(v.f.get(p.name).v)).join(",") + ")";
      if (v instanceof KObj) {
        const m = findMethod(v.cls, "hashCode");
        if (m) return "h" + keyOf(callFn(bindFn(m, v), [], {}, null));
      }
      return "i" + objId(v);
    };
    const eq = (a, b) => {
      if (a === b) return true;
      if (a === null || b === null || a === undefined || b === undefined) return false;
      if (a instanceof KD && b instanceof KD) return a.v === b.v;
      if (a instanceof KC && b instanceof KC) return a.c === b.c;
      if (a instanceof KList && b instanceof KList) return a.a.length === b.a.length && a.a.every((x, i) => eq(x, b.a[i]));
      if (a instanceof KSet && b instanceof KSet) return a.a.length === b.a.length && a.a.every((x) => b.a.some((y) => eq(x, y)));
      if (a instanceof KMap && b instanceof KMap) {
        if (a.m.size !== b.m.size) return false;
        for (const [k, e] of a.m) {
          const o = b.m.get(k);
          if (!o || !eq(e[1], o[1])) return false;
        }
        return true;
      }
      if (a instanceof KPair && b instanceof KPair) return eq(a.a, b.a) && eq(a.b, b.b);
      if (a instanceof KObj && b instanceof KObj) {
        const m = findMethod(a.cls, "equals");
        if (m) return callFn(bindFn(m, a), [b], {}, null) === true;
        if (a.cls === b.cls && a.cls.node && a.cls.node.data) return a.cls.node.params.filter((p) => p.isProp).every((p) => eq(a.f.get(p.name).v, b.f.get(p.name).v));
      }
      return false;
    };
    const cmp = (a, b) => {
      if (isNumeric(a) && isNumeric(b)) {
        const x = numv(a);
        const y = numv(b);
        return x < y ? -1 : x > y ? 1 : 0;
      }
      if (typeof a === "string" && typeof b === "string") return a < b ? -1 : a > b ? 1 : 0;
      if (a instanceof KC && b instanceof KC) return cpoint(a.c) - cpoint(b.c);
      if (typeof a === "boolean" && typeof b === "boolean") return a === b ? 0 : a ? 1 : -1;
      if (a instanceof KObj) {
        const m = findMethod(a.cls, "compareTo");
        if (m) return callFn(bindFn(m, a), [b], {}, null);
      }
      throw fail("«" + typeName(a) + KZ.t("» мен «") + typeName(b) + KZ.t("» мәндерін салыстыруға болмайды."), KZ.t("Салыстыру үшін екі мән де бірдей түрде болуы керек (екеуі де сан, не екеуі де мәтін)."), "Operator '<' cannot be applied to '" + typeName(a) + "' and '" + typeName(b) + "'");
    };

    /* ----- Iterator ----- */
    function* iterate(v) {
      if (v instanceof KRange) {
        if (v.chr) {
          const a = cpoint(v.a.c ? v.a.c : v.a);
          const b = cpoint(v.b.c ? v.b.c : v.b);
          if (v.step > 0) for (let i = a; i <= b; i += v.step) yield new KC(String.fromCodePoint(i));
          else for (let i = a; i >= b; i += v.step) yield new KC(String.fromCodePoint(i));
          return;
        }
        const a = v.a;
        const b = v.excl ? v.b - 1 : v.b;
        if (v.step > 0) for (let i = a; i <= b; i += v.step) yield i;
        else for (let i = a; i >= b; i += v.step) yield i;
        return;
      }
      if (v instanceof KList || v instanceof KSet) {
        const arr = v.a;
        for (let i = 0; i < arr.length; i++) yield arr[i];
        return;
      }
      if (typeof v === "string") {
        for (const ch of v) yield new KC(ch);
        return;
      }
      if (v instanceof KMap) {
        for (const [k, x] of [...v.m.values()]) yield new KPair(k, x);
        return;
      }
      throw fail("«" + typeName(v) + KZ.t("» түрін for циклінде айналып шығуға болмайды."), KZ.t("for (x in …) тек диапазон (1..5), тізім, жиын, map не мәтінмен жұмыс істейді."), "For-loop range must have an 'iterator()' method");
    }
    const toArr = (v) => {
      if (v instanceof KList || v instanceof KSet) return v.a.slice();
      return [...iterate(v)];
    };
    const component = (v, i) => {
      if (v instanceof KPair) {
        if (i === 0) return v.a;
        if (i === 1) return v.b;
      }
      if (v instanceof KList) {
        if (i < v.a.length) return v.a[i];
        throwKt("IndexOutOfBoundsException", "Index: " + i + ", Size: " + v.a.length);
      }
      if (v instanceof KObj && v.cls.node && v.cls.node.data) {
        const ps = v.cls.node.params.filter((p) => p.isProp);
        if (i < ps.length) return v.f.get(ps[i].name).v;
      }
      throw fail(KZ.t("Мәнді бөліп (destructuring) алу мүмкін емес: «") + typeName(v) + "».", KZ.t("Бөлуге Pair, data class не тізім жарайды: val (a, b) = Pair(1, 2)"));
    };

    const L = (a, mut) => new KList(a, mut);

    /* ----- Қорап (айнымалы) операциялары ----- */
    function findMethod(cls, name) {
      for (let c = cls; c; c = c.parent) {
        const m = c.methods.get(name);
        if (m && m.hasBody) return m;
        for (const s of c.supers) {
          const r = findMethod(s, name);
          if (r) return r;
        }
      }
      return null;
    }
    function findGetter(cls, name) {
      for (let c = cls; c; c = c.parent) {
        const g = c.getters.get(name);
        if (g) return g;
        for (const s of c.supers) {
          const r = findGetter(s, name);
          if (r) return r;
        }
      }
      return null;
    }
    const bindFn = (fn, self) => {
      const b = Object.create(KFun.prototype);
      Object.assign(b, fn);
      b.self = self;
      b.more = fn.more.map((x) => bindFn(x, self));
      return b;
    };
    function findEnt(env, name) {
      for (let s = env; s; s = s.parent) {
        let e = s.vars.get(name);
        if (e) return e;
        if (s.self) {
          e = s.self.f.get(name);
          if (e) return e;
          const g = findGetter(s.self.cls, name);
          if (g) return { v: callFn(bindFn(g, s.self), [], {}, null), mut: false, getter: true };
          const m = findMethod(s.self.cls, name);
          if (m) return { v: bindFn(m, s.self), mut: false, fn: true };
        }
      }
      return null;
    }
    const recvOf = (env) => {
      for (let s = env; s; s = s.parent) if (s.recv !== undefined) return s.recv;
      return undefined;
    };
    const unresolved = (name) =>
      fail("«" + name + KZ.t("» әлі жасалмаған (не атын қате жаздың)."), KZ.t("Атын қайта тексер: бас әріп пен кіші әріп маңызды (name ≠ Name). Не алдымен val ") + name + KZ.t(" = … деп жаса."), "Unresolved reference: " + name);
    const valErr = (name) =>
      fail(KZ.t("val арқылы жасалған «") + name + KZ.t("» қорабын өзгертуге болмайды."), KZ.t("Өзгеретін мәнге var қолдан: var ") + name + " = …", "Val cannot be reassigned");
    function declare(env, name, val, mut, tn) {
      const old = env.vars.get(name);
      if (old && !old.hidden) throw fail("«" + name + KZ.t("» қорабы бұл жерде бұрын жасалған."), KZ.t("val/var-ды тек бір рет жаз. Кейін мәнін өзгерткің келсе: ") + name + " = …", "Conflicting declarations: " + name);
      if (tn) checkDecl(val, tn);
      env.vars.set(name, { v: val, mut, tn: tn || null, kind: tn ? null : kindOf(val) });
    }
    function setEnt(ent, name, val) {
      if (!ent.mut && !ent.unset) throw valErr(name);
      if (ent.tn) checkDecl(val, ent.tn);
      else if (ent.kind) checkKind(val, ent.kind, name);
      ent.v = val;
      ent.unset = false;
    }

    /* ----- Түрді тексеру (is / as) ----- */
    const isType = (v, T) => {
      if (v === null) return !!T.nullable;
      switch (T.n) {
        case "Any":
          return true;
        case "Int":
        case "Long":
          return isNum(v);
        case "Double":
          return v instanceof KD;
        case "Number":
          return isNumeric(v);
        case "String":
          return typeof v === "string";
        case "Boolean":
          return typeof v === "boolean";
        case "Char":
          return v instanceof KC;
        case "List":
          return v instanceof KList;
        case "MutableList":
          return v instanceof KList && v.mut;
        case "Set":
          return v instanceof KSet;
        case "Map":
          return v instanceof KMap;
        case "Pair":
          return v instanceof KPair;
        default: {
          const cls = userClasses.get(T.n) || EXC[T.n];
          return !!cls && v instanceof KObj && isSubCls(v.cls, cls);
        }
      }
    };

    /* ----- Frames ----- */
    const snapshot = (env) => {
      const chain = [];
      for (let s = env; s; s = s.parent) chain.push(s);
      const m = new Map();
      for (let k = chain.length - 1; k >= 0; k--) {
        for (const [name, ent] of chain[k].vars) {
          if (ent.hidden || ent.unset) continue;
          const v = ent.v;
          if (v === undefined || typeof v === "function" || v instanceof KFun || v instanceof KClass || v instanceof KNs) continue;
          m.set(name, v);
        }
      }
      const res = [];
      m.forEach((v, name) => describe(name, v, res));
      return res;
    };
    const describe = (name, v, res) => {
      if (v === null) return res.push({ n: name, t: "null", r: "null", s: "null" });
      if (typeof v === "string") return res.push({ n: name, t: "String", r: clip(JSON.stringify(v), 60), s: clip(v, 200) });
      if (isNum(v)) return res.push({ n: name, t: "Int", r: String(v), s: String(v) });
      if (v instanceof KD) return res.push({ n: name, t: "Double", r: dstr(v.v), s: dstr(v.v) });
      if (typeof v === "boolean") return res.push({ n: name, t: "Boolean", r: String(v), s: String(v) });
      if (v instanceof KC) return res.push({ n: name, t: "Char", r: "'" + v.c + "'", s: v.c });
      if (v instanceof KList || v instanceof KSet) {
        const first = v.a.length ? typeName(v.a[0]) : "";
        const base = v instanceof KSet ? (v.mut ? "MutableSet" : "Set") : v.arr ? "Array" : v.mut ? "MutableList" : "List";
        return res.push({ n: name, t: base + (first ? "<" + first + ">" : ""), r: clip(repr(v), 80), i: v.a.slice(0, 16).map((x) => clip(repr(x), 12)), more: v.a.length > 16 });
      }
      if (v instanceof KMap) {
        const e = v.m.size ? [...v.m.values()][0] : null;
        return res.push({ n: name, t: (v.mut ? "MutableMap" : "Map") + (e ? "<" + typeName(e[0]) + ", " + typeName(e[1]) + ">" : ""), r: clip(repr(v), 80) });
      }
      if (v instanceof KObj) return res.push({ n: name, t: v.cls.name, r: clip(repr(v), 80) });
      res.push({ n: name, t: typeName(v), r: clip(repr(v), 80) });
    };
    const trace = (line, env) => {
      if (finished) return;
      if (frames.length >= MAX_FRAMES || Date.now() - started > MAX_MS) {
        finished = true;
        throw STOP;
      }
      curLine = line;
      lastVars = snapshot(env);
      frames.push({ line, kind: "line", vars: lastVars, robot: null, out: outStr, msg: null, dom: undefined });
    };
    const tick = () => {
      if (++steps % 256 === 0 && Date.now() - started > MAX_MS) {
        finished = true;
        throw STOP;
      }
    };
    const write = (s) => {
      outStr += s;
      if (outStr.length > 200000) {
        finished = true;
        throw STOP;
      }
    };

    /* ====== Функция шақыру ====== */
    function pickOverload(fn, nArgs, namedKeys) {
      const cands = [fn].concat(fn.more);
      if (cands.length === 1) return fn;
      for (const c of cands) {
        const ps = c.params || [];
        const req = ps.filter((p) => !p.def && !p.vararg).length;
        const max = ps.some((p) => p.vararg) ? Infinity : ps.length;
        if (nArgs + namedKeys.length >= req && nArgs + namedKeys.length <= max) return c;
      }
      return fn;
    }
    function callFn(fn, args, named, node, recvObj) {
      if (typeof fn === "function") return fn(args, named || {}, node);
      if (fn instanceof KClass) return construct(fn, args, named || {}, node);
      if (!(fn instanceof KFun)) throw fail(KZ.t("Бұл мәнді функция сияқты шақыруға болмайды."), KZ.t("Жақшамен () тек функцияны шақыруға болады."), "Expression is not a function");
      named = named || {};
      const f = pickOverload(fn, args.length, Object.keys(named));
      if (++depth > MAX_DEPTH) {
        depth = 0;
        throwKt("StackOverflowError", null);
      }
      tick();
      try {
        const env = new Scope(f.env);
        if (f.owner) env.owner = f.owner;
        if (f.self) {
          env.self = f.self;
          env.vars.set("this", { v: f.self, mut: false, hidden: true });
        }
        const rv = recvObj !== undefined ? recvObj : f.recvVal;
        if (rv !== undefined) {
          env.recv = rv;
          env.vars.set("this", { v: rv, mut: false, hidden: true });
          if (rv instanceof KObj && f.isLambda) env.self = rv;
        }
        bindParams(f, env, args, named);
        let result = UNIT;
        try {
          if (f.isLambda) {
            result = execBlock(f.body.stmts, env, true);
          } else if (f.expr) {
            result = ev(f.expr, env);
          } else if (f.body) {
            result = f.isMain ? execBlock(f.body.stmts, env, true, (sc) => (endVars = snapshot(sc))) : execBlock(f.body.stmts, env, true);
            if (!f.isMain) result = UNIT;
          }
        } catch (e) {
          if (e instanceof ReturnSig && !f.isLambda) result = e.v === undefined ? UNIT : e.v;
          else throw e;
        }
        if (f.ret && !f.isLambda) {
          if (f.ret.n === "Unit") result = UNIT;
          else if (result === UNIT && !f.expr) throw fail("«" + f.name + KZ.t("» функциясы ") + f.ret.n + KZ.t(" қайтаруы керек, бірақ return жоқ."), KZ.t("Функцияның соңында return мән жаз."), "A 'return' expression required in a function with a block body");
          else checkDecl(result, f.ret);
        }
        return result;
      } finally {
        depth = Math.max(0, depth - 1);
      }
    }
    function bindParams(f, env, args, named) {
      const ps = f.params;
      if (f.isLambda) {
        if (ps === null) {
          if (args.length >= 1) env.vars.set("it", { v: args[0], mut: false, kind: null });
          return;
        }
        let a = args;
        if (a.length === 1 && ps.length > 1 && a[0] instanceof KPair) a = [a[0].a, a[0].b];
        ps.forEach((p, i) => {
          if (i >= a.length) throw fail(KZ.t("Лямбдаға аргумент жетіспейді."), KZ.t("Лямбда ") + ps.length + KZ.t(" мән күтеді."), "Missing argument");
          if (p.destruct) p.destruct.forEach((n, j) => n !== "_" && env.vars.set(n, { v: component(a[i], j), mut: false, kind: null }));
          else if (p.name !== "_") {
            if (p.type) checkDecl(a[i], p.type);
            env.vars.set(p.name, { v: a[i], mut: false, kind: null });
          }
        });
        return;
      }
      const used = new Set();
      let ai = 0;
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        if (p.vararg) {
          const rest = args.slice(ai);
          ai = args.length;
          env.vars.set(p.name, { v: new KList(rest, false, true), mut: false });
          continue;
        }
        let val;
        let has = false;
        if (ai < args.length && !(p.name in named && false)) {
          val = args[ai++];
          has = true;
        } else if (Object.prototype.hasOwnProperty.call(named, p.name)) {
          val = named[p.name];
          used.add(p.name);
          has = true;
        }
        if (!has) {
          if (p.def) val = ev(p.def, env);
          else throw fail("«" + f.name + KZ.t("» функциясына «") + p.name + KZ.t("» аргументі жетіспейді."), KZ.t("Функцияны шақырғанда барлық параметрдің мәнін бер: ") + f.name + "(" + ps.map((x) => x.name).join(", ") + ")", "No value passed for parameter '" + p.name + "'");
        }
        if (p.type) checkDecl(val, p.type);
        env.vars.set(p.name, { v: val, mut: false, tn: null, kind: null });
      }
      if (ai < args.length) throw fail("«" + f.name + KZ.t("» функциясына артық аргумент берілді (") + args.length + KZ.t(" берілді, ") + ps.length + KZ.t(" керек)."), KZ.t("Параметр санын тексер."), "Too many arguments for " + f.name);
      for (const k of Object.keys(named)) if (!used.has(k) && !ps.some((p) => p.name === k)) throw fail("«" + f.name + KZ.t("» функциясында «") + k + KZ.t("» деген параметр жоқ."), KZ.t("Параметр атын қайта тексер."), "Cannot find a parameter with this name: " + k);
    }

    /* ====== Класстар ====== */
    function defineClass(n, env) {
      const cls = new KClass(n.name);
      cls.node = n;
      cls.env = env;
      userClasses.set(n.name, cls);
      env.vars.set(n.name, { v: cls, mut: false, kind: null });
      return cls;
    }
    function linkClass(cls) {
      const n = cls.node;
      n.supers.forEach((s) => {
        const sc = userClasses.get(s.type.n) || EXC[s.type.n];
        if (!sc) throw fail("«" + s.type.n + KZ.t("» класы табылмады."), KZ.t("Ата-класс аты дұрыс па? Ол алдында жасалды ма?"), "Unresolved reference: " + s.type.n);
        if (s.args !== null || (sc.node && sc.node.kind === "class") || sc.builtin) {
          if (sc.node && sc.node.kind === "interface") cls.supers.push(sc);
          else {
            if (sc.node && !sc.node.mods.has("open") && !sc.node.mods.has("abstract") && !sc.node.mods.has("sealed") && sc.node.kind === "class" && !sc.node.data === false) void 0;
            if (sc.node && sc.node.kind === "class" && !sc.node.mods.has("open") && !sc.node.mods.has("abstract") && !sc.node.mods.has("sealed"))
              throw fail("«" + sc.name + KZ.t("» класынан тұқым қуалауға болмайды: ол open емес."), KZ.t("Ата-класты open class ") + sc.name + KZ.t(" деп жаз."), "This type is final, so it cannot be inherited from");
            cls.parent = sc;
            cls.parentArgs = s.args || [];
          }
        } else cls.supers.push(sc);
      });
      n.members.forEach((m) => {
        if (m.k === "method") {
          const f = m.f;
          const fn = new KFun({ name: f.name, params: f.params, body: f.body, expr: f.expr, ret: f.ret, env: cls.env, hasBody: !!(f.body || f.expr), owner: cls, priv: m.mods.has("private") });
          const old = cls.methods.get(f.name);
          if (old) old.more.push(fn);
          else cls.methods.set(f.name, fn);
        } else if (m.k === "prop" && m.v.getter) {
          const g = m.v.getter;
          cls.getters.set(m.v.name, new KFun({ name: m.v.name, params: [], body: g.block || null, expr: g.expr || null, env: cls.env, hasBody: true, owner: cls }));
        }
      });
    }
    function construct(cls, args, named, node) {
      const n = cls.node;
      if (cls.builtin) {
        const o = new KObj(cls);
        o.f.set("message", { v: args.length ? args[0] : null, mut: false });
        o.f.set("cause", { v: args.length > 1 ? args[1] : null, mut: false });
        return o;
      }
      if (n.kind === "interface" || n.abstract) throw fail("«" + cls.name + KZ.t("» абстракт: одан тікелей объект жасалмайды."), KZ.t("Одан тұқым қуалайтын класс жасап, соны шақыр."), "Cannot create an instance of an abstract class");
      if (n.kind === "enum" || n.kind === "object") throw fail("«" + cls.name + KZ.t("» үшін объект жасалмайды."), "", "Cannot create an instance");
      const obj = new KObj(cls);
      initObject(cls, obj, args, named, node);
      return obj;
    }
    function initObject(cls, obj, args, named, node) {
      const n = cls.node;
      const env = new Scope(cls.env);
      env.self = obj;
      env.vars.set("this", { v: obj, mut: false, hidden: true });
      // конструктор параметрлері
      const f = { name: cls.name, params: n.params, isLambda: false };
      if (++depth > MAX_DEPTH) {
        depth = 0;
        throwKt("StackOverflowError", null);
      }
      try {
        bindParams(f, env, args, named);
        if (cls.parent) {
          const pc = cls.parent;
          const pargs = (cls.parentArgs || []).map((a) => ev(a, env));
          if (pc.builtin) {
            obj.f.set("message", { v: pargs.length ? pargs[0] : null, mut: false });
            obj.f.set("cause", { v: pargs.length > 1 ? pargs[1] : null, mut: false });
          } else initObject(pc, obj, pargs, {}, node);
        }
        n.params.forEach((p) => {
          if (p.isProp) {
            const ent = env.vars.get(p.name);
            obj.f.set(p.name, { v: ent.v, mut: p.mut, tn: p.type, kind: null, priv: p.priv, owner: cls });
          }
        });
        n.members.forEach((m) => {
          if (m.k === "prop" && !m.v.getter) {
            const p = m.v;
            let v;
            if (p.init) v = ev(p.init, env);
            else if (p.type) v = undefined;
            if (v !== undefined && p.type) checkDecl(v, p.type);
            obj.f.set(p.name, { v, mut: p.mut, tn: p.type, kind: p.type ? null : kindOf(v), unset: v === undefined, priv: m.mods.has("private"), owner: cls });
          } else if (m.k === "init") execBlock(m.body.stmts, env, true);
        });
      } finally {
        depth = Math.max(0, depth - 1);
      }
    }

    /* ====== Операторлар ====== */
    const typeErr = (msg, tip, detail) => fail(msg, tip, detail);
    function arith(op, a, b) {
      if (op === "+") {
        if (typeof a === "string") return a + toStr(b);
        if (a instanceof KList) return L(b instanceof KList || b instanceof KSet ? a.a.concat(b.a) : a.a.concat([b]), false);
        if (a instanceof KSet) return new KSet(dedupe(a.a.concat(b instanceof KList || b instanceof KSet ? b.a : [b])), false);
        if (a instanceof KMap && b instanceof KPair) {
          const m = new KMap(false);
          a.m.forEach((e, k) => m.m.set(k, e));
          m.m.set(keyOf(b.a), [b.a, b.b]);
          return m;
        }
        if (a instanceof KC && isNum(b)) return new KC(String.fromCodePoint(cpoint(a.c) + b));
        if (a instanceof KObj) {
          const m = findMethod(a.cls, "plus");
          if (m) return callFn(bindFn(m, a), [b], {}, null);
        }
      }
      if (op === "-") {
        if (a instanceof KC && b instanceof KC) return cpoint(a.c) - cpoint(b.c);
        if (a instanceof KC && isNum(b)) return new KC(String.fromCodePoint(cpoint(a.c) - b));
        if (a instanceof KList) return L(a.a.filter((x) => !(b instanceof KList ? b.a.some((y) => eq(x, y)) : eq(x, b))), false);
        if (a instanceof KObj) {
          const m = findMethod(a.cls, "minus");
          if (m) return callFn(bindFn(m, a), [b], {}, null);
        }
      }
      if (a instanceof KObj) {
        const nm = { "*": "times", "/": "div", "%": "rem" }[op];
        const m = nm && findMethod(a.cls, nm);
        if (m) return callFn(bindFn(m, a), [b], {}, null);
      }
      if (!isNumeric(a) || !isNumeric(b)) {
        let tip = KZ.t("Амалдың екі жағы да сан болуы керек.");
        if (op === "+" && isNumeric(a) && typeof b === "string") tip = KZ.t("Санды мәтінге қосу үшін мәтіннен баста: \"\" + ") + toStr(a) + KZ.t(", не шаблон \"$x\" қолдан.");
        else if (typeof a === "string" || typeof b === "string") tip = KZ.t("Мәтінді санға айналдыру үшін .toInt() не .toDouble() қолдан.");
        throw typeErr("«" + op + KZ.t("» амалын ") + typeName(a) + KZ.t(" және ") + typeName(b) + KZ.t(" түрлеріне қолдануға болмайды."), tip, "None of the following candidates is applicable: operator " + op);
      }
      const d = a instanceof KD || b instanceof KD;
      const x = numv(a);
      const y = numv(b);
      let r;
      switch (op) {
        case "+":
          r = x + y;
          break;
        case "-":
          r = x - y;
          break;
        case "*":
          r = x * y;
          break;
        case "/":
          if (!d) {
            if (y === 0) throwKt("ArithmeticException", "/ by zero");
            r = Math.trunc(x / y);
          } else r = x / y;
          break;
        case "%":
          if (!d && y === 0) throwKt("ArithmeticException", "/ by zero");
          r = x % y;
          break;
      }
      return d ? new KD(r) : r;
    }
    const dedupe = (arr) => {
      const seen = new Set();
      const out = [];
      arr.forEach((x) => {
        const k = keyOf(x);
        if (!seen.has(k)) {
          seen.add(k);
          out.push(x);
        }
      });
      return out;
    };
    function eqOp(a, b) {
      if ((isNum(a) && b instanceof KD) || (a instanceof KD && isNum(b))) throw typeErr(KZ.t("«==» амалын Int және Double түрлеріне қолдануға болмайды."), KZ.t("Түрлерін теңестір: a.toDouble() == b не a == b.toInt()."), "Operator '==' cannot be applied to 'Int' and 'Double'");
      if (a !== null && b !== null && kindOf(a) && kindOf(b) && ["Int", "String", "Boolean", "Char", "Double"].includes(kindOf(a)) && ["Int", "String", "Boolean", "Char", "Double"].includes(kindOf(b)) && kindOf(a) !== kindOf(b))
        throw typeErr(KZ.t("«==» амалын ") + typeName(a) + KZ.t(" және ") + typeName(b) + KZ.t(" түрлеріне қолдануға болмайды."), KZ.t("Салыстыру үшін екі жақтың түрі бірдей болуы керек: \"5\" емес 5, не 5.toString() == \"5\"."), "Operator '==' cannot be applied to '" + typeName(a) + "' and '" + typeName(b) + "'");
      return eq(a, b);
    }
    function contains(c, x) {
      if (c instanceof KRange) {
        if (c.chr) {
          if (!(x instanceof KC)) return false;
          const p = cpoint(x.c);
          const a = cpoint(c.a.c ? c.a.c : c.a);
          const b = cpoint(c.b.c ? c.b.c : c.b);
          return c.step > 0 ? p >= a && p <= b : p <= a && p >= b;
        }
        if (!isNumeric(x)) throw typeErr(KZ.t("Диапазонның ішінде ") + typeName(x) + KZ.t(" мәнін іздеуге болмайды."), KZ.t("Сан үшін сандық диапазон қолдан."), "Type mismatch");
        const v = numv(x);
        const hi = c.excl ? v < numv(c.b) : v <= numv(c.b);
        if (c.step > 0) return v >= numv(c.a) && hi && (v - numv(c.a)) % c.step === 0;
        return v <= numv(c.a) && v >= numv(c.b);
      }
      if (c instanceof KList || c instanceof KSet) return c.a.some((y) => eq(x, y));
      if (c instanceof KMap) return c.m.has(keyOf(x));
      if (typeof c === "string") {
        if (typeof x === "string") return c.includes(x);
        if (x instanceof KC) return c.includes(x.c);
        throw typeErr(KZ.t("Мәтіннің ішінен ") + typeName(x) + KZ.t(" іздеуге болмайды."), KZ.t("Мәтін не бір таңба (Char) іздеуге болады."), "Type mismatch");
      }
      throw typeErr(KZ.t("«in» амалы ") + typeName(c) + KZ.t(" түріне қолданылмайды."), KZ.t("in-ді диапазонмен (1..5), тізіммен, жиынмен, map-пен не мәтінмен қолдан."), "Unresolved reference: contains");
    }
    function mkRange(a, b, excl) {
      if (a instanceof KC && b instanceof KC) return new KRange(a, b, 1, excl, true);
      if (isNum(a) && isNum(b)) return new KRange(a, b, 1, excl, false);
      if (isNumeric(a) && isNumeric(b)) return new KRange(a, b, 1, excl, false); // Double диапазоны (in үшін)
      throw typeErr(KZ.t("«..» диапазонын ") + typeName(a) + KZ.t(" және ") + typeName(b) + KZ.t(" түрлерінен жасауға болмайды."), KZ.t("Диапазон 1..5 не 'a'..'z' түрінде болады."), "Type mismatch");
    }
    function binop(op, a, b) {
      switch (op) {
        case "+":
        case "-":
        case "*":
        case "/":
        case "%":
          return arith(op, a, b);
        case "==":
          return eqOp(a, b);
        case "!=":
          return !eqOp(a, b);
        case "===":
          return a === b || eq(a, b);
        case "!==":
          return !(a === b || eq(a, b));
        case "<":
          return cmp(a, b) < 0;
        case ">":
          return cmp(a, b) > 0;
        case "<=":
          return cmp(a, b) <= 0;
        case ">=":
          return cmp(a, b) >= 0;
        case "..":
          return mkRange(a, b, false);
        case "..<":
          return mkRange(a, b, true);
        case "until":
          return mkRange(a, b, true);
        case "downTo":
          if (a instanceof KC) return new KRange(a, b, -1, false, true);
          return new KRange(a, b, -1, false, false);
        case "step": {
          if (!(a instanceof KRange) || !isNum(b) || b <= 0) throw typeErr(KZ.t("step тек диапазонға және оң бүтін санға қолданылады."), KZ.t("Мысалы: 1..10 step 2"), "Type mismatch");
          return new KRange(a.a, a.b, a.step < 0 ? -b : b, a.excl, a.chr);
        }
        case "to":
          return new KPair(a, b);
        case "and":
          return typeof a === "boolean" ? a && b : a & b;
        case "or":
          return typeof a === "boolean" ? a || b : a | b;
        case "xor":
          return typeof a === "boolean" ? a !== b : a ^ b;
        case "shl":
          return a << b;
        case "shr":
          return a >> b;
        case "ushr":
          return a >>> b;
      }
      throw typeErr("«" + op + KZ.t("» амалы қолдау таппайды."), "");
    }
    const condErr = (c) =>
      typeErr(KZ.t("Шарт Boolean (true/false) болуы керек, ал мұнда ") + typeName(c) + KZ.t(" тұр."), KZ.t("Салыстыру жаз: if (x > 0), if (name != \"\"). Kotlin-де 0 не бос мәтін «жалған» болмайды."), "Condition type mismatch: inferred type is " + typeName(c) + " but Boolean was expected");

    /* ====== Өрнекті есептеу ====== */
    function evArgs(n, env) {
      const args = n.args.map((a) => ev(a, env));
      const named = {};
      (n.named || []).forEach((x) => (named[x.name] = ev(x.e, env)));
      if (n.trailing) args.push(ev(n.trailing, env));
      return { args, named };
    }
    function ev(n, env) {
      switch (n.k) {
        case "lit":
          if (n.d) return new KD(n.v);
          return n.v;
        case "chr":
          return new KC(n.v);
        case "tpl": {
          let s = "";
          for (const p of n.parts) s += typeof p === "string" ? p : toStr(ev(p, env));
          return s;
        }
        case "paren":
          return ev(n.e, env);
        case "id": {
          const ent = findEnt(env, n.name);
          if (ent) {
            if (ent.unset) throw fail("«" + n.name + KZ.t("» қорабына әлі мән берілмеген."), KZ.t("Қолданбас бұрын мән бер: ") + n.name + " = …", "Variable '" + n.name + "' must be initialized");
            return ent.v;
          }
          if (n.name === "this") throw fail(KZ.t("this тек класстың не extension функцияның ішінде жұмыс істейді."), "", "'this' is not defined in this context");
          throw unresolved(n.name);
        }
        case "logic": {
          const a = ev(n.a, env);
          if (typeof a !== "boolean") throw condErr(a);
          if (n.op === "&&" ? !a : a) return a;
          const b = ev(n.b, env);
          if (typeof b !== "boolean") throw condErr(b);
          return b;
        }
        case "elvis": {
          const a = ev(n.a, env);
          return a === null ? ev(n.b, env) : a;
        }
        case "bin": {
          const a = ev(n.a, env);
          const b = ev(n.b, env);
          return binop(n.op, a, b);
        }
        case "un": {
          const v = ev(n.e, env);
          if (n.op === "!") {
            if (typeof v !== "boolean") throw typeErr(KZ.t("«!» тек Boolean мәніне қолданылады, ал мұнда ") + typeName(v) + ".", "", "Unresolved reference: not");
            return !v;
          }
          if (!isNumeric(v)) throw typeErr("«" + n.op + KZ.t("» таңбасын ") + typeName(v) + KZ.t(" түріне қолдануға болмайды."), "", "Unresolved reference: unaryMinus");
          if (n.op === "-") return v instanceof KD ? new KD(-v.v) : -v;
          return v;
        }
        case "incdec":
          return incdec(n, env);
        case "is": {
          const v = ev(n.e, env);
          const r = isType(v, n.type);
          return n.neg ? !r : r;
        }
        case "as": {
          const v = ev(n.e, env);
          if (isType(v, n.type) || (v === null && n.type.nullable)) return v;
          if (n.safe) return null;
          throwKt("ClassCastException", "class " + typeName(v) + " cannot be cast to class " + n.type.n);
          return null;
        }
        case "in": {
          const x = ev(n.e, env);
          const c = ev(n.c, env);
          const r = contains(c, x);
          return n.neg ? !r : r;
        }
        case "nn": {
          const v = ev(n.e, env);
          if (v === null) throwKt("NullPointerException", null);
          return v;
        }
        case "if": {
          const c = ev(n.cond, env);
          if (typeof c !== "boolean") throw condErr(c);
          if (c) return execBody(n.then, env, n.line);
          if (n.els) return execBody(n.els, env, n.line);
          return UNIT;
        }
        case "when":
          return evWhen(n, env);
        case "try":
          return evTry(n, env);
        case "lambda":
          return new KFun({ name: "lambda", params: n.params, body: n.body, env, isLambda: true });
        case "ref": {
          const ent = findEnt(env, n.name);
          if (!ent) throw unresolved(n.name);
          return ent.v;
        }
        case "retx":
          throw new ReturnSig(n.e ? ev(n.e, env) : UNIT);
        case "throwx":
          return doThrow(ev(n.e, env));
        case "brkx":
          throw n.label ? new BreakSig(n.label) : BRK;
        case "contx":
          throw n.label ? new ContinueSig(n.label) : CNT;
        case "mem":
          return evMember(n, env);
        case "idx": {
          const o = ev(n.obj, env);
          return getIndex(o, n.idx.map((i) => ev(i, env)));
        }
        case "call":
          return evCall(n, env);
      }
      throw fail(KZ.t("Бұл жазу қолдау таппайды (") + n.k + ").", "");
    }
    function doThrow(v) {
      if (!(v instanceof KObj) || !isSub(v.cls, "Throwable")) throw typeErr(KZ.t("throw тек Exception түріндегі объектіні лақтырады."), KZ.t("Мысалы: throw IllegalArgumentException(\"қате\")"), "Type mismatch: inferred type is " + typeName(v) + " but Throwable was expected");
      throw new KThrow(v);
    }
    function execBody(body, env, hdrLine) {
      if (body.k === "block") return execBlock(body.stmts, env, true);
      if (body.line !== hdrLine) trace(body.line, env);
      return execStmt(body, env);
    }
    function evWhen(n, env) {
      const has = !!n.subject;
      const subj = has ? ev(n.subject, env) : undefined;
      let elseB = null;
      for (const br of n.branches) {
        if (br.conds === null) {
          elseB = br;
          continue;
        }
        for (const c of br.conds) {
          let ok;
          if (c.kind === "eq") {
            const v = ev(c.e, env);
            if (has) ok = eqOp(subj, v);
            else {
              if (typeof v !== "boolean") throw condErr(v);
              ok = v;
            }
          } else if (c.kind === "in") {
            ok = contains(ev(c.e, env), subj);
            if (c.neg) ok = !ok;
          } else {
            ok = isType(subj, c.type);
            if (c.neg) ok = !ok;
          }
          if (ok) return execBody(br.body, env, br.line);
        }
      }
      if (elseB) return execBody(elseB.body, env, elseB.line);
      return UNIT;
    }
    function evTry(n, env) {
      try {
        return execBlock(n.block.stmts, env, true);
      } catch (e) {
        if (e instanceof KThrow) {
          for (const c of n.catches) {
            if (c.type.n === "Throwable" || isSub(e.obj.cls, c.type.n)) {
              const sc = new Scope(env);
              sc.vars.set(c.name, { v: e.obj, mut: false, kind: null });
              return execBlock(c.body.stmts, sc, true);
            }
          }
        }
        throw e;
      } finally {
        if (n.fin) execBlock(n.fin.stmts, env, true);
      }
    }
    function incdec(n, env) {
      const old = ev(n.target, env);
      if (!isNumeric(old) && !(old instanceof KC)) throw typeErr("«" + n.op + KZ.t("» тек санға қолданылады, ал мұнда ") + typeName(old) + ".", "", "Unresolved reference: inc");
      const nv = arith(n.op === "++" ? "+" : "-", old, 1);
      assignTo(n.target, nv, env);
      return n.prefix ? nv : old;
    }

    /* ====== Меншіктеу ====== */
    function assignTo(t, val, env) {
      if (t.k === "id") {
        const ent = findEnt(env, t.name);
        if (!ent) throw unresolved(t.name);
        if (ent.fn || ent.getter) throw valErr(t.name);
        setEnt(ent, t.name, val);
        return;
      }
      if (t.k === "mem") {
        const o = ev(t.obj, env);
        if (o === null) throw nullErr(t.name);
        if (!(o instanceof KObj)) throw typeErr("«" + typeName(o) + KZ.t("» түрінің «") + t.name + KZ.t("» қасиетін өзгертуге болмайды."), "", "Val cannot be reassigned");
        const ent = o.f.get(t.name);
        if (!ent) throw unresolved(t.name);
        checkPriv(ent, t.name, env, o);
        setEnt(ent, t.name, val);
        return;
      }
      if (t.k === "idx") {
        const o = ev(t.obj, env);
        setIndex(o, t.idx.map((i) => ev(i, env)), val);
        return;
      }
    }
    const nullErr = (name) =>
      fail(KZ.t("Мән null болуы мүмкін, сондықтан «.") + name + KZ.t("» деп тікелей қолдануға болмайды."), KZ.t("Қауіпсіз шақыру: x?.") + name + KZ.t(". Не алдымен тексер: if (x != null) { … }. Не x!! (null болса, қате береді)."), "Only safe (?.) or non-null asserted (!!.) calls are allowed on a nullable receiver");
    function checkPriv(ent, name, env, o) {
      if (!ent.priv) return;
      for (let s = env; s; s = s.parent) if (s.self && isSubCls(s.self.cls, ent.owner)) return;
      throw fail("«" + name + KZ.t("» жеке (private), оған класстың сыртынан қол жеткізуге болмайды."), KZ.t("Класстың ішіндегі функция арқылы қол жеткіз (get/set әдістері)."), "Cannot access '" + name + "': it is private in '" + o.cls.name + "'");
    }
    function execAssign(st, env) {
      const t = st.target;
      let val = ev(st.value, env);
      if (st.op !== "=") {
        const cur = ev(t, env);
        const bop = st.op[0];
        if (bop === "+" && (cur instanceof KList || cur instanceof KSet) && cur.mut) {
          const add = val instanceof KList || val instanceof KSet ? val.a : [val];
          if (cur instanceof KSet) add.forEach((x) => !cur.a.some((y) => eq(x, y)) && cur.a.push(x));
          else cur.a.push(...add);
          return;
        }
        if (bop === "-" && cur instanceof KList && cur.mut) {
          (val instanceof KList ? val.a : [val]).forEach((x) => {
            const i = cur.a.findIndex((y) => eq(x, y));
            if (i >= 0) cur.a.splice(i, 1);
          });
          return;
        }
        if (bop === "+" && cur instanceof KMap && cur.mut && val instanceof KPair) {
          cur.m.set(keyOf(val.a), [val.a, val.b]);
          return;
        }
        if (cur instanceof KList && !cur.mut && bop === "+" && t.k === "id") {
          const ent = findEnt(env, t.name);
          if (ent && !ent.mut) throw fail("«" + t.name + KZ.t("» — val және өзгермейтін тізім: оған += арқылы қосуға болмайды."), KZ.t("mutableListOf() қолдан не var жаса."), "Val cannot be reassigned");
        }
        val = arith(bop, cur, val);
      }
      if (t.k === "id") {
        const ent = findEnt(env, t.name);
        if (!ent) throw unresolved(t.name);
        if (ent.fn || ent.getter) throw valErr(t.name);
        setEnt(ent, t.name, val);
        return;
      }
      assignTo(t, val, env);
    }

    /* ====== Индекс ====== */
    function getIndex(o, idx) {
      const i = idx[0];
      if (o instanceof KList) {
        if (!isNum(i)) throw typeErr(KZ.t("Тізім нөмірі бүтін сан болуы керек."), "", "Type mismatch");
        if (i < 0 || i >= o.a.length) throwKt(o.arr ? "ArrayIndexOutOfBoundsException" : "IndexOutOfBoundsException", o.arr ? "Index " + i + " out of bounds for length " + o.a.length : "Index " + i + " out of bounds for length " + o.a.length);
        return o.a[i];
      }
      if (typeof o === "string") {
        if (!isNum(i)) throw typeErr(KZ.t("Мәтін нөмірі бүтін сан болуы керек."), "", "Type mismatch");
        if (i < 0 || i >= o.length) throwKt("StringIndexOutOfBoundsException", "index " + i + ", length " + o.length);
        return new KC(o[i]);
      }
      if (o instanceof KMap) {
        const e = o.m.get(keyOf(i));
        return e ? e[1] : null;
      }
      if (o === null) throw nullErr("get");
      if (o instanceof KObj) {
        const m = findMethod(o.cls, "get");
        if (m) return callFn(bindFn(m, o), idx, {}, null);
      }
      throw typeErr("«" + typeName(o) + KZ.t("» түрінен [ ] арқылы мән алуға болмайды."), KZ.t("[ ] тізіммен, массивпен, map-пен және мәтінмен жұмыс істейді."), "No get method providing array access");
    }
    function setIndex(o, idx, val) {
      const i = idx[0];
      if (o instanceof KList) {
        if (!o.mut && !o.arr) throw typeErr(KZ.t("listOf() тізімінің элементін өзгертуге болмайды."), KZ.t("mutableListOf(…) қолдан."), "No set method providing array access");
        if (!isNum(i) || i < 0 || i >= o.a.length) throwKt(o.arr ? "ArrayIndexOutOfBoundsException" : "IndexOutOfBoundsException", "Index " + i + " out of bounds for length " + o.a.length);
        o.a[i] = val;
        return;
      }
      if (o instanceof KMap) {
        if (!o.mut) throw typeErr(KZ.t("mapOf() өзгермейді: оған мән қосуға болмайды."), KZ.t("mutableMapOf(…) қолдан."), "No set method providing array access");
        o.m.set(keyOf(i), [i, val]);
        return;
      }
      if (typeof o === "string") throw typeErr(KZ.t("Мәтін (String) өзгермейді: оның таңбасын ауыстыруға болмайды."), KZ.t("Жаңа мәтін жаса: replace, substring не StringBuilder сияқты жолмен."), "No set method providing array access");
      throw typeErr("«" + typeName(o) + KZ.t("» түрінің элементін [ ] арқылы өзгертуге болмайды."), "", "No set method providing array access");
    }

    /* ====== Қасиет алу ====== */
    function evMember(n, env) {
      if (n.obj.k === "id" && n.obj.name === "super") throw fail(KZ.t("super.қасиет бұл курста қолдау таппайды (тек super.функция())."), "");
      const o = ev(n.obj, env);
      if (o === null) {
        if (n.safe) return null;
        throw nullErr(n.name);
      }
      return getMember(o, n.name, env);
    }
    function getMember(o, name, env) {
      if (o instanceof KObj && o.cls === SBCLS && name === "length") return o.f.get("s").v.length;
      if (o instanceof KObj) {
        const g = findGetter(o.cls, name);
        if (g) return callFn(bindFn(g, o), [], {}, null);
        const ent = o.f.get(name);
        if (ent) {
          checkPriv(ent, name, env, o);
          if (ent.unset) throw fail("«" + name + KZ.t("» қасиетіне әлі мән берілмеген."), "", "Property must be initialized");
          return ent.v;
        }
        if (o.cls.enumEntry) {
          if (name === "name") return o.enumName;
          if (name === "ordinal") return o.ordinal;
        }
        const m = findMethod(o.cls, name);
        if (m) return bindFn(m, o);
        if (name === "message" && isSub(o.cls, "Throwable")) return null;
        if (name === "cause" && isSub(o.cls, "Throwable")) return null;
        throw unresolved(name);
      }
      if (o instanceof KNs) return nsConst(o, name);
      if (o instanceof KClass) {
        const n = o.node;
        if (n && n.kind === "enum") {
          const e = o.entries.find((x) => x.enumName === name);
          if (e) return e;
          if (name === "entries") return L(o.entries.slice(), false);
        }
        if (n && n.kind === "object") return getMember(o.instance, name, env);
        throw unresolved(name);
      }
      if (typeof o === "string") {
        if (name === "length") return o.length;
        if (name === "indices") return new KRange(0, o.length, 1, true);
        if (name === "lastIndex") return o.length - 1;
      }
      if (o instanceof KList || o instanceof KSet) {
        if (name === "size") return o.a.length;
        if (name === "indices") return new KRange(0, o.a.length, 1, true);
        if (name === "lastIndex") return o.a.length - 1;
      }
      if (o instanceof KMap) {
        if (name === "size") return o.m.size;
        if (name === "keys") return new KSet([...o.m.values()].map((e) => e[0]), false);
        if (name === "values") return L([...o.m.values()].map((e) => e[1]), false);
        if (name === "entries") return new KSet([...o.m.values()].map((e) => new KPair(e[0], e[1])), false);
      }
      if (o instanceof KPair) {
        if (name === "first" || name === "key" || name === "index") return o.a;
        if (name === "second" || name === "value") return o.b;
      }
      if (o instanceof KRange) {
        if (name === "first") return o.a;
        if (name === "last") return o.b;
        if (name === "step") return o.step;
      }
      if (o instanceof KC && name === "code") return cpoint(o.c);
      if (isNumeric(o) && name === "absoluteValue") return o instanceof KD ? new KD(Math.abs(o.v)) : Math.abs(o);
      if (isNumeric(o) && name === "sign") return Math.sign(numv(o));
      throw unresolved(name);
    }
    function nsConst(ns, name) {
      const t = ns.name;
      if (t === "Int" && name === "MAX_VALUE") return 2147483647;
      if (t === "Int" && name === "MIN_VALUE") return -2147483648;
      if (t === "Long" && name === "MAX_VALUE") return Number.MAX_SAFE_INTEGER;
      if (t === "Long" && name === "MIN_VALUE") return Number.MIN_SAFE_INTEGER;
      if (t === "Double" && name === "MAX_VALUE") return new KD(Number.MAX_VALUE);
      if (t === "Double" && name === "MIN_VALUE") return new KD(Number.MIN_VALUE);
      if (t === "Double" && name === "POSITIVE_INFINITY") return new KD(Infinity);
      if (t === "Double" && name === "NaN") return new KD(NaN);
      if (t === "Math" && name === "PI") return new KD(Math.PI);
      if (t === "Math" && name === "E") return new KD(Math.E);
      throw unresolved(t + "." + name);
    }

    /* ====== Шақыру өрнегі ====== */
    function evCall(n, env) {
      const f = n.fn;
      if (f.k === "mem") {
        if (f.obj.k === "id" && f.obj.name === "super") {
          const { args, named } = evArgs(n, env);
          let selfObj = null;
          let ownerCls = null;
          for (let s = env; s; s = s.parent) {
            if (s.self) {
              selfObj = s.self;
              break;
            }
          }
          const cur = env && findCurrentOwner(env);
          ownerCls = cur || (selfObj && selfObj.cls);
          if (!selfObj) throw fail(KZ.t("super тек класстың ішінде жұмыс істейді."), "");
          let m = null;
          if (ownerCls && ownerCls.parent) m = findMethod(ownerCls.parent, f.name);
          if (!m && ownerCls) for (const s of ownerCls.supers) if ((m = findMethod(s, f.name))) break;
          if (!m) {
            if (f.name === "toString") return "obj";
            throw unresolved("super." + f.name);
          }
          return callFn(bindFn(m, selfObj), args, named, n);
        }
        const o = ev(f.obj, env);
        if (f.safe && o === null) return null;
        const { args, named } = evArgs(n, env);
        if (o === null) throw nullErr(f.name);
        return callMember(o, f.name, args, named, n, env);
      }
      if (f.k === "id") {
        const ent = findEnt(env, f.name);
        const { args, named } = evArgs(n, env);
        if (ent) {
          const v = ent.v;
          if (v instanceof KFun || v instanceof KClass || typeof v === "function") {
            if (v instanceof KFun && !v.isLambda && v.recv) {
              // extension функцияны қарапайым шақыру мүмкін емес
            }
            if (v instanceof KClass && v.node && v.node.kind === "enum") throw fail(KZ.t("enum-нан объект жасалмайды."), "", "");
            return callFn(v, args, named, n);
          }
          if (ent.unset) throw fail("«" + f.name + KZ.t("» қорабына әлі мән берілмеген."), "", "");
          throw typeErr("«" + f.name + KZ.t("» функция емес, оны жақшамен () шақыруға болмайды."), KZ.t("Бұл қорапта ") + typeName(v) + KZ.t(" тұр."), "Expression '" + f.name + "' cannot be invoked as a function");
        }
        const rv = recvOf(env);
        if (rv !== undefined) {
          const r = tryMember(rv, f.name, args, named, n, env);
          if (r !== NOPE) return r;
        }
        throw fail("«" + f.name + KZ.t("» функциясы табылмады."), KZ.t("Атын қайта тексер: бас әріп пен кіші әріп маңызды. Функцияны fun ") + f.name + KZ.t("(…) деп жаздың ба?"), "Unresolved reference: " + f.name);
      }
      const fv = ev(f, env);
      const { args, named } = evArgs(n, env);
      return callFn(fv, args, named, n);
    }
    function loopSig(e, st) {
      if (e instanceof BreakSig && (!e.label || e.label === st.label)) return true;
      if (e instanceof ContinueSig && (!e.label || e.label === st.label)) return false;
      throw e;
    }
    function findCurrentOwner(env) {
      for (let s = env; s; s = s.parent) {
        if (s.owner) return s.owner;
      }
      return null;
    }
    function callMember(o, name, args, named, node, env) {
      const r = tryMember(o, name, args, named, node, env);
      if (r !== NOPE) return r;
      throw fail("«" + name + KZ.t("» функциясы (не қасиеті) ") + typeName(o) + KZ.t(" түрінде жоқ."), KZ.t("Атын тексер. Мысалы, мәтінде uppercase(), тізімде add() бар. Бас/кіші әріп маңызды."), "Unresolved reference: " + name);
    }
    function tryMember(o, name, args, named, node, env) {
      if (o instanceof KNs) return nsCall(o, name, args, named);
      if (o instanceof KClass) {
        const nd = o.node;
        if (nd && nd.kind === "enum") {
          if (name === "values") return L(o.entries.slice(), false);
          if (name === "valueOf") {
            const e = o.entries.find((x) => x.enumName === args[0]);
            if (!e) throwKt("IllegalArgumentException", "No enum constant " + o.name + "." + args[0]);
            return e;
          }
        }
        if (nd && nd.kind === "object") return tryMember(o.instance, name, args, named, node, env);
        return NOPE;
      }
      if (o instanceof KObj) {
        const fe = o.f.get(name);
        if (fe && (fe.v instanceof KFun || typeof fe.v === "function")) return callFn(fe.v, args, named, node);
        const m = findMethod(o.cls, name);
        if (m) {
          if (m.priv) {
            for (let s = env; s; s = s.parent) if (s.self && isSubCls(s.self.cls, m.owner)) return callFn(bindFn(m, o), args, named, node);
            throw fail("«" + name + KZ.t("» функциясы жеке (private), оны класстың сыртынан шақыруға болмайды."), KZ.t("Бұл функцияны класстың ішінен шақыр."), "Cannot access '" + name + "': it is private");
          }
          return callFn(bindFn(m, o), args, named, node);
        }
      }
      const r = anyMethods(o, name, args, named, node, env);
      if (r !== NOPE) return r;
      let b = NOPE;
      if (typeof o === "string") b = strM(o, name, args, named, node);
      else if (o instanceof KList) b = listM(o, name, args, named, node);
      else if (o instanceof KSet) b = setM(o, name, args, named, node);
      else if (o instanceof KMap) b = mapM(o, name, args, named, node);
      else if (isNum(o)) b = intM(o, name, args, named, node);
      else if (o instanceof KD) b = dblM(o, name, args, named, node);
      else if (o instanceof KC) b = chrM(o, name, args, named, node);
      else if (o instanceof KRange) b = rangeM(o, name, args, named, node);
      else if (o instanceof KPair) b = pairM(o, name, args);
      else if (typeof o === "boolean") b = name === "not" ? !o : NOPE;
      else if (o instanceof KObj) b = objM(o, name, args, named, node);
      else if (o instanceof KFun || typeof o === "function") b = name === "invoke" ? callFn(o, args, named, node) : NOPE;
      if (b !== NOPE) return b;
      // extension функциялар
      for (let k = exts.length - 1; k >= 0; k--) {
        const e = exts[k];
        if (e.name !== name) continue;
        if (e.recv === "Any" || e.recv === typeName(o) || (o instanceof KObj && isSubCls(o.cls, userClasses.get(e.recv) || {})) || (e.recv === "List" && o instanceof KList) || (e.recv === "Number" && isNumeric(o)))
          return callFn(e.fn, args, named, node, o);
      }
      // өрістегі функция (мысалы, obj.callback)
      return NOPE;
    }
    function callF(f, a) {
      return callFn(f, a, {}, null);
    }
    function anyMethods(o, name, args, named, node, env) {
      switch (name) {
        case "toString":
          if (!args.length) return toStr(o);
          break;
        case "equals":
          return eq(o, args[0]);
        case "hashCode":
          return Math.abs([...keyOf(o)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7));
        case "let":
          return callFn(args[0], [o], {}, node);
        case "also":
          callFn(args[0], [o], {}, node);
          return o;
        case "run":
          if (args.length === 1 && (args[0] instanceof KFun)) return callFn(args[0], [], {}, node, o);
          break;
        case "apply":
          callFn(args[0], [], {}, node, o);
          return o;
        case "takeIf":
          return callF(args[0], [o]) === true ? o : null;
        case "takeUnless":
          return callF(args[0], [o]) === true ? null : o;
        case "to":
          return new KPair(o, args[0]);
        case "javaClass":
          return typeName(o);
      }
      if (o instanceof KObj) {
        const d = o.cls.node && o.cls.node.data;
        if (d) {
          if (name === "copy") {
            const c = new KObj(o.cls);
            const ps = o.cls.node.params.filter((p) => p.isProp);
            ps.forEach((p, i) => {
              let v;
              if (Object.prototype.hasOwnProperty.call(named, p.name)) v = named[p.name];
              else if (i < args.length) v = args[i];
              else v = o.f.get(p.name).v;
              const old = o.f.get(p.name);
              if (old.tn) checkDecl(v, old.tn);
              c.f.set(p.name, { v, mut: old.mut, tn: old.tn, kind: null, priv: old.priv, owner: old.owner });
            });
            o.f.forEach((e, k) => {
              if (!c.f.has(k)) c.f.set(k, Object.assign({}, e));
            });
            return c;
          }
          const m = /^component(\d+)$/.exec(name);
          if (m) return component(o, Number(m[1]) - 1);
        }
        if (isSub(o.cls, "Throwable")) {
          if (name === "printStackTrace") {
            write(toStr(o) + "\n");
            return UNIT;
          }
          if (name === "stackTraceToString") return toStr(o);
        }
        if (o.cls.enumEntry) {
          if (name === "compareTo") return o.ordinal - args[0].ordinal;
        }
      }
      void env;
      return NOPE;
    }
    function objM(o, name, args) {
      if (o.cls === SBCLS) return sbM(o, name, args);
      return NOPE;
    }
    function nsCall(ns, name, args) {
      const t = ns.name;
      const f = (x) => numv(x);
      if (t === "Math") {
        switch (name) {
          case "sqrt": return new KD(Math.sqrt(f(args[0])));
          case "abs": return args[0] instanceof KD ? new KD(Math.abs(args[0].v)) : Math.abs(args[0]);
          case "pow": return new KD(Math.pow(f(args[0]), f(args[1])));
          case "max": return args.some((x) => x instanceof KD) ? new KD(Math.max(f(args[0]), f(args[1]))) : Math.max(args[0], args[1]);
          case "min": return args.some((x) => x instanceof KD) ? new KD(Math.min(f(args[0]), f(args[1]))) : Math.min(args[0], args[1]);
          case "floor": return new KD(Math.floor(f(args[0])));
          case "ceil": return new KD(Math.ceil(f(args[0])));
          case "round": return Math.floor(f(args[0]) + 0.5);
          case "sin": return new KD(Math.sin(f(args[0])));
          case "cos": return new KD(Math.cos(f(args[0])));
          case "random": return new KD(Math.random());
        }
      }
      if (t === "Int" || t === "Double" || t === "Long") {
        if (name === "parseInt" || name === "valueOf") return Number(args[0]);
      }
      if (t === "String") {
        if (name === "format") return fmtFormat(args[0], args.slice(1));
        if (name === "valueOf") return toStr(args[0]);
      }
      if (t === "System" && name === "currentTimeMillis") return Date.now();
      throw unresolved(t + "." + name);
    }

    /* ====== Ішкі функциялар (global) ====== */
    const G = new Scope(null);
    const defG = (name, fn) => G.vars.set(name, { v: fn, mut: false, hidden: true });
    ["Int", "Double", "Long", "Math", "String", "System"].forEach((n) => G.vars.set(n, { v: new KNs(n), mut: false, hidden: true }));
    Object.keys(EXC).forEach((n) => G.vars.set(n, { v: EXC[n], mut: false, hidden: true }));
    const dnum = (v) => (v instanceof KD ? v : new KD(v));
    defG("println", (a) => (write((a.length ? toStr(a[0]) : "") + "\n"), UNIT));
    defG("print", (a) => (write(a.length ? toStr(a[0]) : ""), UNIT));
    defG("listOf", (a) => (a.length === 1 && a[0] instanceof KList && a[0].arr && false ? a[0] : L(a, false)));
    defG("mutableListOf", (a) => L(a.slice(), true));
    defG("arrayListOf", (a) => L(a.slice(), true));
    defG("emptyList", () => L([], false));
    defG("setOf", (a) => new KSet(dedupe(a), false));
    defG("mutableSetOf", (a) => new KSet(dedupe(a), true));
    defG("emptySet", () => new KSet([], false));
    defG("hashSetOf", (a) => new KSet(dedupe(a), true));
    const mkMap = (pairs, mut) => {
      const m = new KMap(mut);
      pairs.forEach((p) => {
        if (!(p instanceof KPair)) throw typeErr(KZ.t("mapOf ішіне «ключ to мән» жұбын жаз: mapOf(\"a\" to 1)."), "", "Type mismatch");
        m.m.set(keyOf(p.a), [p.a, p.b]);
      });
      return m;
    };
    defG("mapOf", (a) => mkMap(a, false));
    defG("mutableMapOf", (a) => mkMap(a, true));
    defG("hashMapOf", (a) => mkMap(a, true));
    defG("emptyMap", () => new KMap(false));
    defG("arrayOf", (a) => new KList(a.slice(), true, true));
    defG("intArrayOf", (a) => new KList(a.slice(), true, true));
    defG("doubleArrayOf", (a) => new KList(a.map(dnum), true, true));
    defG("arrayOfNulls", (a) => new KList(new Array(a[0]).fill(null), true, true));
    const mkN = (arr) => (a) => {
      const n = a[0];
      if (!isNum(n) || n < 0) throwKt("IllegalArgumentException", "Size must be non-negative");
      const out = [];
      for (let i = 0; i < n; i++) out.push(a.length > 1 ? callF(a[1], [i]) : arr);
      return out;
    };
    defG("IntArray", (a) => new KList(mkN(0)(a), true, true));
    defG("DoubleArray", (a) => new KList(mkN(new KD(0))(a), true, true));
    defG("Array", (a) => new KList(mkN(null)(a), true, true));
    defG("List", (a) => L(mkN(null)(a), false));
    defG("MutableList", (a) => L(mkN(null)(a), true));
    defG("Pair", (a) => new KPair(a[0], a[1]));
    defG("readln", () => "");
    defG("readLine", () => null);
    defG("readlnOrNull", () => null);
    defG("maxOf", (a) => a.reduce((x, y) => (cmp(x, y) >= 0 ? x : y)));
    defG("minOf", (a) => a.reduce((x, y) => (cmp(x, y) <= 0 ? x : y)));
    defG("max", (a) => a.reduce((x, y) => (cmp(x, y) >= 0 ? x : y)));
    defG("min", (a) => a.reduce((x, y) => (cmp(x, y) <= 0 ? x : y)));
    defG("abs", (a) => (a[0] instanceof KD ? new KD(Math.abs(a[0].v)) : Math.abs(a[0])));
    defG("sqrt", (a) => new KD(Math.sqrt(numv(a[0]))));
    defG("pow", (a) => new KD(Math.pow(numv(a[0]), numv(a[1]))));
    defG("floor", (a) => new KD(Math.floor(numv(a[0]))));
    defG("ceil", (a) => new KD(Math.ceil(numv(a[0]))));
    defG("round", (a) => new KD(roundEven(numv(a[0]))));
    defG("sin", (a) => new KD(Math.sin(numv(a[0]))));
    defG("cos", (a) => new KD(Math.cos(numv(a[0]))));
    defG("tan", (a) => new KD(Math.tan(numv(a[0]))));
    defG("log10", (a) => new KD(Math.log10(numv(a[0]))));
    defG("ln", (a) => new KD(Math.log(numv(a[0]))));
    G.vars.set("PI", { v: new KD(Math.PI), mut: false, hidden: true });
    G.vars.set("E", { v: new KD(Math.E), mut: false, hidden: true });
    defG("repeat", (a) => {
      for (let i = 0; i < a[0]; i++) {
        tick();
        callF(a[1], [i]);
      }
      return UNIT;
    });
    defG("require", (a) => {
      if (a[0] !== true) throwKt("IllegalArgumentException", a.length > 1 ? toStr(callF(a[1], [])) : "Failed requirement.");
      return UNIT;
    });
    defG("check", (a) => {
      if (a[0] !== true) throwKt("IllegalStateException", a.length > 1 ? toStr(callF(a[1], [])) : "Check failed.");
      return UNIT;
    });
    defG("error", (a) => throwKt("IllegalStateException", toStr(a[0])));
    defG("TODO", (a) => throwKt("NotImplementedError", "An operation is not implemented" + (a.length ? ": " + toStr(a[0]) : "")));
    defG("with", (a, nm, node) => callFn(a[1], [], {}, node, a[0]));
    defG("run", (a, nm, node) => callFn(a[0], [], {}, node));
    defG("lazy", (a) => callF(a[0], []));
    defG("buildString", (a) => {
      const sb = new KObj(SBCLS);
      sb.f.set("s", { v: "", mut: true });
      callFn(a[0], [], {}, null, sb);
      return sb.f.get("s").v;
    });
    defG("compareValues", (a) => cmp(a[0], a[1]));
    const SBCLS = new KClass("StringBuilder");
    SBCLS.builtin = true;
    SBCLS.pkg = "java.lang.";
    function roundEven(x) {
      const r = Math.round(x);
      return Math.abs(x % 1) === 0.5 && r % 2 !== 0 ? r - 1 : r;
    }

    /* ====== Қосымша: StringBuilder ====== */
    defG("StringBuilder", () => {
      const sb = new KObj(SBCLS);
      sb.f.set("s", { v: "", mut: true });
      return sb;
    });
    const sbM = (o, name, args) => {
      const e = o.f.get("s");
      switch (name) {
        case "append": e.v += toStr(args[0]); return o;
        case "toString": return e.v;
        case "length": return e.v.length;
        case "reverse": e.v = [...e.v].reverse().join(""); return o;
        case "clear": e.v = ""; return o;
        case "insert": e.v = e.v.slice(0, args[0]) + toStr(args[1]) + e.v.slice(args[0]); return o;
        case "isEmpty": return e.v.length === 0;
      }
      return NOPE;
    };
    const objM0 = objM;
    void objM0;

    /* ====== Мәтін әдістері ====== */
    const strIdx = (s, i) => {
      if (!isNum(i) || i < 0 || i > s.length) throwKt("StringIndexOutOfBoundsException", "index " + i + ", length " + s.length);
      return i;
    };
    function strM(s, name, args, named, node) {
      const a0 = args[0];
      switch (name) {
        case "length": return s.length;
        case "uppercase": case "toUpperCase": return s.toUpperCase();
        case "lowercase": case "toLowerCase": return s.toLowerCase();
        case "capitalize": return s.charAt(0).toUpperCase() + s.slice(1);
        case "trim": return s.trim();
        case "trimStart": return s.trimStart();
        case "trimEnd": return s.trimEnd();
        case "trimIndent": {
          const ls = s.split("\n");
          if (ls.length && !ls[0].trim()) ls.shift();
          if (ls.length && !ls[ls.length - 1].trim()) ls.pop();
          const ind = Math.min(...ls.filter((l) => l.trim()).map((l) => l.match(/^\s*/)[0].length));
          return ls.map((l) => l.slice(Number.isFinite(ind) ? ind : 0)).join("\n");
        }
        case "substring": {
          const b = args.length > 1 ? args[1] : s.length;
          if (!isNum(a0) || !isNum(b) || a0 < 0 || b > s.length || a0 > b) throwKt("StringIndexOutOfBoundsException", "begin " + a0 + ", end " + b + ", length " + s.length);
          return s.slice(a0, b);
        }
        case "substringBefore": { const i = s.indexOf(a0); return i < 0 ? s : s.slice(0, i); }
        case "substringAfter": { const i = s.indexOf(a0); return i < 0 ? s : s.slice(i + a0.length); }
        case "removePrefix": return s.startsWith(a0) ? s.slice(a0.length) : s;
        case "removeSuffix": return s.endsWith(a0) ? s.slice(0, s.length - a0.length) : s;
        case "contains": {
          const ic = named.ignoreCase === true;
          const x = a0 instanceof KC ? a0.c : a0;
          if (typeof x !== "string") throw typeErr(KZ.t("contains ішіне мәтін не таңба бер."), "", "Type mismatch");
          return ic ? s.toLowerCase().includes(x.toLowerCase()) : s.includes(x);
        }
        case "startsWith": return named.ignoreCase === true ? s.toLowerCase().startsWith(String(a0).toLowerCase()) : s.startsWith(a0 instanceof KC ? a0.c : a0);
        case "endsWith": return named.ignoreCase === true ? s.toLowerCase().endsWith(String(a0).toLowerCase()) : s.endsWith(a0 instanceof KC ? a0.c : a0);
        case "equals": return named.ignoreCase === true || args[1] === true ? typeof a0 === "string" && s.toLowerCase() === a0.toLowerCase() : s === a0;
        case "replace": return s.split(a0 instanceof KC ? a0.c : a0).join(args[1] instanceof KC ? args[1].c : args[1]);
        case "split": {
          const ds = args.filter((x) => typeof x === "string" || x instanceof KC).map((x) => (x instanceof KC ? x.c : x));
          if (!ds.length) throw typeErr(KZ.t("split ішіне бөлгіш мәтін бер: split(\" \")."), "", "Type mismatch");
          if (ds.length === 1) return L(ds[0] === "" ? [...s] : s.split(ds[0]), false);
          const re = new RegExp(ds.map((d) => d.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"));
          return L(s.split(re), false);
        }
        case "lines": return L(s.split(/\r?\n/), false);
        case "reversed": return [...s].reverse().join("");
        case "indexOf": { const x = a0 instanceof KC ? a0.c : a0; return s.indexOf(x); }
        case "lastIndexOf": { const x = a0 instanceof KC ? a0.c : a0; return s.lastIndexOf(x); }
        case "isEmpty": return s.length === 0;
        case "isNotEmpty": return s.length > 0;
        case "isBlank": return s.trim().length === 0;
        case "isNotBlank": return s.trim().length > 0;
        case "repeat":
          if (!isNum(a0) || a0 < 0) throwKt("IllegalArgumentException", "Count 'n' must be non-negative, but was " + a0 + ".");
          return s.repeat(a0);
        case "first":
          if (!s.length) throwKt("NoSuchElementException", "Char sequence is empty.");
          return new KC(s[0]);
        case "last":
          if (!s.length) throwKt("NoSuchElementException", "Char sequence is empty.");
          return new KC(s[s.length - 1]);
        case "firstOrNull": return s.length ? new KC(s[0]) : null;
        case "lastOrNull": return s.length ? new KC(s[s.length - 1]) : null;
        case "take": return s.slice(0, Math.max(0, a0));
        case "drop": return s.slice(Math.max(0, a0));
        case "takeLast": return a0 <= 0 ? "" : s.slice(-a0);
        case "dropLast": return s.slice(0, Math.max(0, s.length - a0));
        case "padStart": return s.padStart(a0, args.length > 1 ? toStr(args[1]) : " ");
        case "padEnd": return s.padEnd(a0, args.length > 1 ? toStr(args[1]) : " ");
        case "get": return getIndex(s, args);
        case "compareTo": return s < a0 ? -1 : s > a0 ? 1 : 0;
        case "toInt": case "toLong": case "toShort": case "toByte": {
          if (!/^[+-]?\d+$/.test(s)) throwKt("NumberFormatException", 'For input string: "' + s + '"');
          return Number(s);
        }
        case "toIntOrNull": case "toLongOrNull": return /^[+-]?\d+$/.test(s) ? Number(s) : null;
        case "toDouble": case "toFloat": {
          if (!/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(s.trim())) throwKt("NumberFormatException", s === "" ? "empty String" : 'For input string: "' + s + '"');
          return new KD(Number(s));
        }
        case "toDoubleOrNull": case "toFloatOrNull": return /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(s.trim()) ? new KD(Number(s)) : null;
        case "toBoolean": return s.toLowerCase() === "true";
        case "toList": case "toCharArray": return name === "toCharArray" ? new KList([...s].map((c) => new KC(c)), true, true) : L([...s].map((c) => new KC(c)), false);
        case "toSet": return new KSet(dedupe([...s].map((c) => new KC(c))), false);
        case "format": return fmtFormat(s, args);
        case "replaceFirstChar": {
          if (!s.length) return s;
          const r = callF(a0, [new KC(s[0])]);
          return toStr(r) + s.slice(1);
        }
        case "filter": return [...s].filter((c) => callF(a0, [new KC(c)]) === true).join("");
        case "filterNot": return [...s].filter((c) => callF(a0, [new KC(c)]) !== true).join("");
        case "plus": return s + toStr(a0);
        case "count": return args.length ? [...s].filter((c) => callF(a0, [new KC(c)]) === true).length : s.length;
        case "chars": return L([...s].map((c) => new KC(c)), false);
        case "hashCode": return [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0);
        case "sorted": case "map": case "forEach": case "forEachIndexed": case "any": case "all": case "none": case "withIndex": case "sumOf": case "joinToString": case "distinct": case "mapIndexed": case "associate": case "groupBy": case "find": case "indexOfFirst": case "toMutableList": case "asSequence":
          return listM(L([...s].map((c) => new KC(c)), false), name, args, named, node);
      }
      return NOPE;
    }

    /* ====== Char ====== */
    function chrM(c, name, args) {
      const ch = c.c;
      switch (name) {
        case "toString": return ch;
        case "isDigit": return /\p{Nd}/u.test(ch);
        case "isLetter": return /\p{L}/u.test(ch);
        case "isLetterOrDigit": return /[\p{L}\p{Nd}]/u.test(ch);
        case "isUpperCase": return /\p{Lu}/u.test(ch);
        case "isLowerCase": return /\p{Ll}/u.test(ch);
        case "isWhitespace": return /\s/.test(ch);
        case "uppercaseChar": case "toUpperCase": return name === "toUpperCase" ? new KC(ch.toUpperCase()) : new KC(ch.toUpperCase());
        case "lowercaseChar": case "toLowerCase": return new KC(ch.toLowerCase());
        case "uppercase": return ch.toUpperCase();
        case "lowercase": return ch.toLowerCase();
        case "digitToInt": {
          if (!/[0-9]/.test(ch)) throwKt("IllegalArgumentException", "Char " + ch + " is not a decimal digit");
          return Number(ch);
        }
        case "code": case "toInt": return cpoint(ch);
        case "compareTo": return cpoint(ch) - cpoint(args[0].c);
        case "plus": return arith("+", c, args[0]);
        case "minus": return arith("-", c, args[0]);
      }
      return NOPE;
    }

    /* ====== Int / Double ====== */
    function intM(n, name, args) {
      switch (name) {
        case "toDouble": case "toFloat": return new KD(n);
        case "toInt": case "toLong": case "toShort": case "toByte": return n;
        case "toString": return String(n);
        case "toChar": return new KC(String.fromCodePoint(n));
        case "compareTo": return cmp(n, args[0]);
        case "coerceIn": return Math.min(Math.max(n, args[0]), args[1]);
        case "coerceAtLeast": return Math.max(n, args[0]);
        case "coerceAtMost": return Math.min(n, args[0]);
        case "plus": return arith("+", n, args[0]);
        case "minus": return arith("-", n, args[0]);
        case "times": return arith("*", n, args[0]);
        case "div": return arith("/", n, args[0]);
        case "rem": case "mod": return arith("%", n, args[0]);
        case "inc": return n + 1;
        case "dec": return n - 1;
        case "absoluteValue": return Math.abs(n);
        case "pow": throw typeErr(KZ.t("Int үшін .pow() жоқ: Double жасап алу керек."), KZ.t("n.toDouble().pow(2) не Math.pow(n.toDouble(), 2.0) қолдан."), "Unresolved reference: pow");
        case "until": return mkRange(n, args[0], true);
        case "downTo": return binop("downTo", n, args[0]);
        case "rangeTo": return mkRange(n, args[0], false);
        case "isEven": break;
      }
      return NOPE;
    }
    function dblM(d, name, args) {
      const x = d.v;
      switch (name) {
        case "toInt": case "toLong":
          if (!Number.isFinite(x)) return Number.isNaN(x) ? 0 : x > 0 ? 2147483647 : -2147483648;
          return Math.trunc(x);
        case "toDouble": case "toFloat": return d;
        case "toString": return dstr(x);
        case "roundToInt": case "roundToLong": return Math.floor(x + 0.5);
        case "pow": return new KD(Math.pow(x, numv(args[0])));
        case "isNaN": return Number.isNaN(x);
        case "isInfinite": return !Number.isFinite(x) && !Number.isNaN(x);
        case "compareTo": return cmp(d, args[0]);
        case "coerceIn": return new KD(Math.min(Math.max(x, numv(args[0])), numv(args[1])));
        case "coerceAtLeast": return new KD(Math.max(x, numv(args[0])));
        case "coerceAtMost": return new KD(Math.min(x, numv(args[0])));
        case "plus": return arith("+", d, args[0]);
        case "minus": return arith("-", d, args[0]);
        case "times": return arith("*", d, args[0]);
        case "div": return arith("/", d, args[0]);
        case "absoluteValue": return new KD(Math.abs(x));
      }
      return NOPE;
    }

    /* ====== Pair, Range ====== */
    function pairM(p, name) {
      if (name === "component1") return p.a;
      if (name === "component2") return p.b;
      if (name === "toList") return L([p.a, p.b], false);
      return NOPE;
    }
    function rangeM(r, name, args, named, node) {
      switch (name) {
        case "contains": return contains(r, args[0]);
        case "reversed": {
          if (r.chr) return L(toArr(r).reverse(), false);
          const hi = r.excl ? r.b - 1 : r.b;
          return new KRange(hi, r.a, -r.step, false, false);
        }
        case "step": return binop("step", r, args[0]);
        case "isEmpty": return toArr(r).length === 0;
        case "first": return r.a;
        case "last": return r.excl ? r.b - 1 : r.b;
        case "count": case "sum": case "toList": case "map": case "filter": case "forEach": case "toMutableList": case "any": case "all": case "none": case "average": case "joinToString": case "fold": case "reduce": case "forEachIndexed": case "mapIndexed": case "sumOf": case "toSet": case "shuffled": case "withIndex": case "associate": case "groupBy": case "max": case "min": case "find": case "firstOrNull": case "lastOrNull": case "sorted": case "sortedDescending": case "take": case "drop": case "flatMap": case "partition": case "zip": case "maxOrNull": case "minOrNull": case "distinct":
          if ((name === "count") && !args.length) return toArr(r).length;
          return listM(L(toArr(r), false), name, args, named, node);
      }
      return NOPE;
    }

    /* ====== Тізім ====== */
    const emptyErr = () => throwKt("NoSuchElementException", "List is empty.");
    const sortArr = (arr, keyFn, desc) => {
      const withKeys = arr.map((x, i) => ({ x, k: keyFn ? keyFn(x) : x, i }));
      withKeys.sort((p, q) => {
        const c = cmp(p.k, q.k);
        return (desc ? -c : c) || p.i - q.i;
      });
      return withKeys.map((p) => p.x);
    };
    function sumOfList(arr) {
      let s = 0;
      let dbl = false;
      arr.forEach((x) => {
        if (!isNumeric(x)) throw typeErr(KZ.t("sum() тек сандардан тұратын тізімге жарайды, ал мұнда ") + typeName(x) + KZ.t(" бар."), "", "Type mismatch");
        if (x instanceof KD) dbl = true;
        s += numv(x);
      });
      return dbl ? new KD(s) : s;
    }
    function listM(l, name, args, named, node) {
      const a = l.a;
      const a0 = args[0];
      if (KMUT.has(name) && (!l.mut || (l.arr && name !== "set" && name !== "sort" && name !== "reverse" && name !== "fill" && name !== "shuffle"))) {
        throw typeErr(l.arr ? KZ.t("Array көлемі өзгермейді: «") + name + KZ.t("» жоқ.") : KZ.t("listOf() тізімі өзгермейді (read-only): «") + name + KZ.t("» қолдануға болмайды."), l.arr ? KZ.t("Көлемі өзгеретін тізім керек болса, mutableListOf() қолдан.") : KZ.t("Өзгеретін тізім керек болса, mutableListOf(…) қолдан."), "Unresolved reference: " + name);
      }
      const chk = (i, size) => {
        if (!isNum(i) || i < 0 || i >= size) throwKt("IndexOutOfBoundsException", "Index " + i + " out of bounds for length " + size);
      };
      switch (name) {
        case "size": return a.length;
        case "isEmpty": return a.length === 0;
        case "isNotEmpty": return a.length > 0;
        case "get": chk(a0, a.length); return a[a0];
        case "getOrNull": return isNum(a0) && a0 >= 0 && a0 < a.length ? a[a0] : null;
        case "getOrElse": return isNum(a0) && a0 >= 0 && a0 < a.length ? a[a0] : callF(args[1], [a0]);
        case "set": chk(a0, a.length); { const old = a[a0]; a[a0] = args[1]; return old; }
        case "add":
          if (args.length === 2) {
            if (a0 < 0 || a0 > a.length) throwKt("IndexOutOfBoundsException", "Index: " + a0 + ", Size: " + a.length);
            a.splice(a0, 0, args[1]);
          } else a.push(a0);
          return true;
        case "addAll": a.push(...toArr(a0)); return true;
        case "addFirst": a.unshift(a0); return UNIT;
        case "addLast": a.push(a0); return UNIT;
        case "remove": { const i = a.findIndex((x) => eq(x, a0)); if (i >= 0) a.splice(i, 1); return i >= 0; }
        case "removeAt": chk(a0, a.length); return a.splice(a0, 1)[0];
        case "removeFirst": if (!a.length) emptyErr(); return a.shift();
        case "removeLast": if (!a.length) emptyErr(); return a.pop();
        case "removeAll": { const b = toArr(a0); for (let i = a.length - 1; i >= 0; i--) if (b.some((y) => eq(a[i], y))) a.splice(i, 1); return true; }
        case "removeIf": { for (let i = a.length - 1; i >= 0; i--) if (callF(a0, [a[i]]) === true) a.splice(i, 1); return true; }
        case "clear": a.length = 0; return UNIT;
        case "contains": return a.some((x) => eq(x, a0));
        case "containsAll": return toArr(a0).every((y) => a.some((x) => eq(x, y)));
        case "indexOf": return a.findIndex((x) => eq(x, a0));
        case "lastIndexOf": { for (let i = a.length - 1; i >= 0; i--) if (eq(a[i], a0)) return i; return -1; }
        case "first": if (args.length) { const f = a.find((x) => callF(a0, [x]) === true); if (f === undefined) throwKt("NoSuchElementException", "Collection contains no element matching the predicate."); return f; } if (!a.length) emptyErr(); return a[0];
        case "last": if (args.length) { for (let i = a.length - 1; i >= 0; i--) if (callF(a0, [a[i]]) === true) return a[i]; throwKt("NoSuchElementException", "Collection contains no element matching the predicate."); } if (!a.length) emptyErr(); return a[a.length - 1];
        case "firstOrNull": if (args.length) { const f = a.find((x) => callF(a0, [x]) === true); return f === undefined ? null : f; } return a.length ? a[0] : null;
        case "lastOrNull": if (args.length) { for (let i = a.length - 1; i >= 0; i--) if (callF(a0, [a[i]]) === true) return a[i]; return null; } return a.length ? a[a.length - 1] : null;
        case "find": { const f = a.find((x) => callF(a0, [x]) === true); return f === undefined ? null : f; }
        case "findLast": { for (let i = a.length - 1; i >= 0; i--) if (callF(a0, [a[i]]) === true) return a[i]; return null; }
        case "single": if (a.length !== 1) throwKt(a.length ? "IllegalArgumentException" : "NoSuchElementException", a.length ? "List has more than one element." : "List is empty."); return a[0];
        case "sum": return sumOfList(a);
        case "sumOf": return sumOfList(a.map((x) => callF(a0, [x])));
        case "average": return new KD(a.length ? a.reduce((s, x) => s + numv(x), 0) / a.length : NaN);
        case "max": case "min": {
          if (!a.length) emptyErr();
          return a.reduce((x, y) => ((name === "max" ? cmp(x, y) >= 0 : cmp(x, y) <= 0) ? x : y));
        }
        case "maxOrNull": case "minOrNull":
          if (!a.length) return null;
          return a.reduce((x, y) => ((name === "maxOrNull" ? cmp(x, y) >= 0 : cmp(x, y) <= 0) ? x : y));
        case "maxOf": case "minOf": {
          if (!a.length) emptyErr();
          const ks = a.map((x) => callF(a0, [x]));
          return ks.reduce((x, y) => ((name === "maxOf" ? cmp(x, y) >= 0 : cmp(x, y) <= 0) ? x : y));
        }
        case "maxByOrNull": case "minByOrNull": case "maxBy": case "minBy": {
          if (!a.length) { if (name.endsWith("OrNull")) return null; emptyErr(); }
          const big = name.startsWith("max");
          let best = a[0];
          let bk = callF(a0, [best]);
          for (let i = 1; i < a.length; i++) {
            const k = callF(a0, [a[i]]);
            if (big ? cmp(k, bk) > 0 : cmp(k, bk) < 0) { best = a[i]; bk = k; }
          }
          return best;
        }
        case "sorted": return L(sortArr(a), false);
        case "sortedDescending": return L(sortArr(a, null, true), false);
        case "sortedBy": return L(sortArr(a, (x) => callF(a0, [x])), false);
        case "sortedByDescending": return L(sortArr(a, (x) => callF(a0, [x]), true), false);
        case "sort": { const s = sortArr(a); a.splice(0, a.length, ...s); return UNIT; }
        case "sortDescending": { const s = sortArr(a, null, true); a.splice(0, a.length, ...s); return UNIT; }
        case "sortBy": { const s = sortArr(a, (x) => callF(a0, [x])); a.splice(0, a.length, ...s); return UNIT; }
        case "reverse": a.reverse(); return UNIT;
        case "reversed": return L(a.slice().reverse(), false);
        case "shuffled": return L(a.slice(), false);
        case "map": return L(a.map((x) => (tick(), callF(a0, [x]))), false);
        case "mapIndexed": return L(a.map((x, i) => callF(a0, [i, x])), false);
        case "mapNotNull": return L(a.map((x) => callF(a0, [x])).filter((x) => x !== null), false);
        case "flatMap": return L([].concat(...a.map((x) => toArr(callF(a0, [x])))), false);
        case "flatten": return L([].concat(...a.map((x) => toArr(x))), false);
        case "filter": return L(a.filter((x) => (tick(), callF(a0, [x]) === true)), false);
        case "filterNot": return L(a.filter((x) => callF(a0, [x]) !== true), false);
        case "filterNotNull": return L(a.filter((x) => x !== null), false);
        case "filterIndexed": return L(a.filter((x, i) => callF(a0, [i, x]) === true), false);
        case "filterIsInstance": return L(a, false);
        case "forEach": a.slice().forEach((x) => (tick(), callF(a0, [x]))); return UNIT;
        case "forEachIndexed": a.slice().forEach((x, i) => callF(a0, [i, x])); return UNIT;
        case "onEach": a.forEach((x) => callF(a0, [x])); return l;
        case "any": return args.length ? a.some((x) => callF(a0, [x]) === true) : a.length > 0;
        case "all": return a.every((x) => callF(a0, [x]) === true);
        case "none": return args.length ? !a.some((x) => callF(a0, [x]) === true) : a.length === 0;
        case "count": return args.length ? a.filter((x) => callF(a0, [x]) === true).length : a.length;
        case "indexOfFirst": return a.findIndex((x) => callF(a0, [x]) === true);
        case "indexOfLast": { for (let i = a.length - 1; i >= 0; i--) if (callF(a0, [a[i]]) === true) return i; return -1; }
        case "joinToString": {
          const sep = named.separator !== undefined ? named.separator : args.length ? toStr(a0) : ", ";
          const pre = named.prefix !== undefined ? named.prefix : args.length > 1 && typeof args[1] === "string" ? args[1] : "";
          const post = named.postfix !== undefined ? named.postfix : args.length > 2 && typeof args[2] === "string" ? args[2] : "";
          const tr = named.transform || args.find((x) => x instanceof KFun);
          return pre + a.map((x) => (tr ? toStr(callF(tr, [x])) : toStr(x))).join(sep) + post;
        }
        case "take": return L(a.slice(0, Math.max(0, a0)), false);
        case "drop": return L(a.slice(Math.max(0, a0)), false);
        case "takeLast": return L(a0 <= 0 ? [] : a.slice(-a0), false);
        case "dropLast": return L(a.slice(0, Math.max(0, a.length - a0)), false);
        case "takeWhile": { const o = []; for (const x of a) { if (callF(a0, [x]) !== true) break; o.push(x); } return L(o, false); }
        case "dropWhile": { let i = 0; while (i < a.length && callF(a0, [a[i]]) === true) i++; return L(a.slice(i), false); }
        case "subList": if (a0 < 0 || args[1] > a.length || a0 > args[1]) throwKt("IndexOutOfBoundsException", "fromIndex: " + a0 + ", toIndex: " + args[1] + ", size: " + a.length); return L(a.slice(a0, args[1]), l.mut);
        case "slice": return L(toArr(a0).map((i) => a[i]), false);
        case "distinct": return L(dedupe(a), false);
        case "toList": return L(a.slice(), false);
        case "toMutableList": return L(a.slice(), true);
        case "toSet": return new KSet(dedupe(a), false);
        case "toTypedArray": case "toIntArray": return new KList(a.slice(), true, true);
        case "asSequence": case "asIterable": case "iterator": return l;
        case "plus": return arith("+", l, a0);
        case "minus": return arith("-", l, a0);
        case "withIndex": return L(a.map((x, i) => new KPair(i, x)), false);
        case "zip": return L(a.slice(0, Math.min(a.length, toArr(a0).length)).map((x, i) => new KPair(x, toArr(a0)[i])), false);
        case "chunked": { const o = []; for (let i = 0; i < a.length; i += a0) o.push(L(a.slice(i, i + a0), false)); return L(o, false); }
        case "fold": { let acc = a0; a.forEach((x) => (acc = callF(args[1], [acc, x]))); return acc; }
        case "reduce": { if (!a.length) throwKt("UnsupportedOperationException", "Empty collection can't be reduced."); let acc = a[0]; for (let i = 1; i < a.length; i++) acc = callF(a0, [acc, a[i]]); return acc; }
        case "groupBy": {
          const m = new KMap(false);
          a.forEach((x) => {
            const k = callF(a0, [x]);
            const e = m.m.get(keyOf(k));
            if (e) e[1].a.push(x);
            else m.m.set(keyOf(k), [k, L([x], false)]);
          });
          return m;
        }
        case "associate": { const m = new KMap(false); a.forEach((x) => { const p = callF(a0, [x]); m.m.set(keyOf(p.a), [p.a, p.b]); }); return m; }
        case "associateWith": { const m = new KMap(false); a.forEach((x) => m.m.set(keyOf(x), [x, callF(a0, [x])])); return m; }
        case "associateBy": { const m = new KMap(false); a.forEach((x) => { const k = callF(a0, [x]); m.m.set(keyOf(k), [k, x]); }); return m; }
        case "partition": { const y = []; const n = []; a.forEach((x) => (callF(a0, [x]) === true ? y : n).push(x)); return new KPair(L(y, false), L(n, false)); }
        case "contentToString": return toStr(l);
        case "copyOf": return new KList(a.slice(), true, true);
        case "fill": a.fill(a0); return UNIT;
        case "equals": return eq(l, a0);
        case "component1": return a[0];
        case "component2": return a[1];
        case "component3": return a[2];
        case "random": if (!a.length) emptyErr(); return a[Math.floor(Math.random() * a.length)];
      }
      return NOPE;
    }

    /* ====== Жиын ====== */
    function setM(s, name, args, named, node) {
      const a = s.a;
      const a0 = args[0];
      if (KMUT.has(name) && !s.mut) throw typeErr(KZ.t("setOf() жиыны өзгермейді: «") + name + KZ.t("» қолдануға болмайды."), KZ.t("mutableSetOf(…) қолдан."), "Unresolved reference: " + name);
      switch (name) {
        case "size": return a.length;
        case "add": if (a.some((x) => eq(x, a0))) return false; a.push(a0); return true;
        case "addAll": { let ch = false; toArr(a0).forEach((x) => { if (!a.some((y) => eq(x, y))) { a.push(x); ch = true; } }); return ch; }
        case "remove": { const i = a.findIndex((x) => eq(x, a0)); if (i >= 0) a.splice(i, 1); return i >= 0; }
        case "clear": a.length = 0; return UNIT;
        case "contains": return a.some((x) => eq(x, a0));
        case "containsAll": return toArr(a0).every((y) => a.some((x) => eq(x, y)));
        case "isEmpty": return a.length === 0;
        case "isNotEmpty": return a.length > 0;
        case "union": return new KSet(dedupe(a.concat(toArr(a0))), false);
        case "intersect": return new KSet(a.filter((x) => toArr(a0).some((y) => eq(x, y))), false);
        case "subtract": return new KSet(a.filter((x) => !toArr(a0).some((y) => eq(x, y))), false);
        case "toSet": return new KSet(a.slice(), false);
        case "toMutableSet": return new KSet(a.slice(), true);
        case "plus": return arith("+", s, a0);
        case "equals": return eq(s, a0);
      }
      return listM(L(a.slice(), false), name, args, named, node);
    }

    /* ====== Map ====== */
    function mapM(m, name, args, named, node) {
      const a0 = args[0];
      if (KMUT.has(name) && !m.mut && name !== "remove" || (name === "remove" && !m.mut)) throw typeErr(KZ.t("mapOf() өзгермейді (read-only): «") + name + KZ.t("» қолдануға болмайды."), KZ.t("mutableMapOf(…) қолдан."), "Unresolved reference: " + name);
      const entries = () => [...m.m.values()];
      const pairs = () => entries().map((e) => new KPair(e[0], e[1]));
      switch (name) {
        case "size": return m.m.size;
        case "isEmpty": return m.m.size === 0;
        case "isNotEmpty": return m.m.size > 0;
        case "get": { const e = m.m.get(keyOf(a0)); return e ? e[1] : null; }
        case "getValue": { const e = m.m.get(keyOf(a0)); if (!e) throwKt("NoSuchElementException", "Key " + toStr(a0) + " is missing in the map."); return e[1]; }
        case "getOrDefault": { const e = m.m.get(keyOf(a0)); return e ? e[1] : args[1]; }
        case "getOrElse": { const e = m.m.get(keyOf(a0)); return e ? e[1] : callF(args[1], []); }
        case "getOrPut": { const e = m.m.get(keyOf(a0)); if (e) return e[1]; const v = callF(args[1], []); m.m.set(keyOf(a0), [a0, v]); return v; }
        case "put": { const k = keyOf(a0); const e = m.m.get(k); const old = e ? e[1] : null; m.m.set(k, [a0, args[1]]); return old; }
        case "set": m.m.set(keyOf(a0), [a0, args[1]]); return UNIT;
        case "putAll": a0.m.forEach((e, k) => m.m.set(k, [e[0], e[1]])); return UNIT;
        case "remove": { const k = keyOf(a0); const e = m.m.get(k); m.m.delete(k); return e ? e[1] : null; }
        case "clear": m.m.clear(); return UNIT;
        case "containsKey": return m.m.has(keyOf(a0));
        case "containsValue": return entries().some((e) => eq(e[1], a0));
        case "keys": return new KSet(entries().map((e) => e[0]), false);
        case "values": return L(entries().map((e) => e[1]), false);
        case "entries": return new KSet(pairs(), false);
        case "toList": return L(pairs(), false);
        case "toMap": case "toMutableMap": { const r = new KMap(name === "toMutableMap"); m.m.forEach((e, k) => r.m.set(k, [e[0], e[1]])); return r; }
        case "forEach": pairs().forEach((p) => callF(a0, [p])); return UNIT;
        case "mapValues": { const r = new KMap(false); m.m.forEach((e, k) => r.m.set(k, [e[0], callF(a0, [new KPair(e[0], e[1])])])); return r; }
        case "mapKeys": { const r = new KMap(false); entries().forEach((e) => { const nk = callF(a0, [new KPair(e[0], e[1])]); r.m.set(keyOf(nk), [nk, e[1]]); }); return r; }
        case "filter": { const r = new KMap(false); entries().forEach((e) => { if (callF(a0, [new KPair(e[0], e[1])]) === true) r.m.set(keyOf(e[0]), [e[0], e[1]]); }); return r; }
        case "filterKeys": { const r = new KMap(false); entries().forEach((e) => { if (callF(a0, [e[0]]) === true) r.m.set(keyOf(e[0]), e); }); return r; }
        case "filterValues": { const r = new KMap(false); entries().forEach((e) => { if (callF(a0, [e[1]]) === true) r.m.set(keyOf(e[0]), e); }); return r; }
        case "plus": return arith("+", m, a0);
        case "equals": return eq(m, a0);
        case "map": case "count": case "any": case "all": case "none": case "maxByOrNull": case "minByOrNull": case "sortedBy": case "sortedByDescending": case "sumOf": case "firstOrNull": case "first": case "find": case "flatMap": case "maxBy": case "minBy": case "joinToString": case "sorted": case "toSortedMap": case "filterNot": case "forEachIndexed": case "withIndex": case "asSequence": case "take": case "drop": case "last": case "lastOrNull": case "toMutableList":
          if (name === "toSortedMap") { const r = new KMap(false); sortArr(entries(), (e) => e[0]).forEach((e) => r.m.set(keyOf(e[0]), e)); return r; }
          return listM(L(pairs(), false), name, args, named, node);
      }
      return NOPE;
    }
    void sbM;

    /* ====== Операторлар (Statement) ====== */
    function execBlock(stmts, env, scoped, onEnd) {
      const sc = scoped ? new Scope(env) : env;
      let last = UNIT;
      try {
        for (let i = 0; i < stmts.length; i++) {
          const st = stmts[i];
          if (st.k !== "fun" && st.k !== "class") trace(st.line, sc);
          last = execStmt(st, sc);
        }
      } finally {
        if (onEnd) onEnd(sc);
      }
      return last;
    }
    function defineFun(st, env) {
      const fn = new KFun({ name: st.name, params: st.params, body: st.body, expr: st.expr, ret: st.ret, env, hasBody: true, isMain: st.name === "main" && env === G });
      if (st.recv) {
        exts.push({ name: st.name, recv: st.recv, fn });
        return;
      }
      const old = env.vars.get(st.name);
      if (old && old.v instanceof KFun && !old.hidden) old.v.more.push(fn);
      else env.vars.set(st.name, { v: fn, mut: false, kind: null });
    }
    function execStmt(st, env) {
      switch (st.k) {
        case "expr":
          return ev(st.e, env);
        case "var": {
          if (st.names) {
            const v = ev(st.init, env);
            st.names.forEach((nm, i) => nm !== "_" && declare(env, nm, component(v, i), st.mut));
            return UNIT;
          }
          if (st.init) {
            const v = ev(st.init, env);
            declare(env, st.name, v, st.mut, st.type);
          } else {
            env.vars.set(st.name, { v: undefined, mut: st.mut, tn: st.type, unset: true });
          }
          return UNIT;
        }
        case "assign":
          execAssign(st, env);
          return UNIT;
        case "fun":
          defineFun(st, env);
          return UNIT;
        case "class": {
          const cls = defineClass(st, env);
          setupClass(cls);
          return UNIT;
        }
        case "for": {
          const it = ev(st.iter, env);
          const gen = iterate(it);
          for (const x of gen) {
            tick();
            const sc = new Scope(env);
            if (st.names) st.names.forEach((nm, i) => nm !== "_" && sc.vars.set(nm, { v: component(x, i), mut: false, kind: null }));
            else if (st.name !== "_") sc.vars.set(st.name, { v: x, mut: false, kind: null });
            try {
              execBody(st.body, sc, st.line);
            } catch (e) {
              if (loopSig(e, st)) break;
            }
            trace(st.line, sc);
          }
          return UNIT;
        }
        case "while": {
          for (;;) {
            tick();
            const c = ev(st.cond, env);
            if (typeof c !== "boolean") throw condErr(c);
            if (!c) break;
            try {
              execBody(st.body, env, st.line);
            } catch (e) {
              if (loopSig(e, st)) break;
            }
            trace(st.line, env);
          }
          return UNIT;
        }
        case "dowhile": {
          for (;;) {
            tick();
            try {
              execBody(st.body, env, st.line);
            } catch (e) {
              if (loopSig(e, st)) break;
            }
            const c = ev(st.cond, env);
            if (typeof c !== "boolean") throw condErr(c);
            if (!c) break;
          }
          return UNIT;
        }
        case "return":
          throw new ReturnSig(st.e ? ev(st.e, env) : UNIT);
        case "break":
          throw st.label ? new BreakSig(st.label) : BRK;
        case "continue":
          throw st.label ? new ContinueSig(st.label) : CNT;
        case "throw":
          return doThrow(ev(st.e, env));
        case "block":
          return execBlock(st.stmts, env, true);
      }
      throw fail(KZ.t("Бұл оператор қолдау таппайды (") + st.k + ").", "");
    }

    function setupClass(cls) {
      const n = cls.node;
      linkClass(cls);
      if (n.kind === "enum") {
        cls.entries = [];
        n.entries.forEach((en, i) => {
          const o = new KObj(cls);
          o.enumName = en.name;
          o.ordinal = i;
          cls.enumEntry = true;
          const args = en.args.map((a) => ev(a, cls.env));
          initObject(cls, o, args, {}, null);
          cls.entries.push(o);
        });
        cls.enumEntry = true;
      }
      if (n.kind === "object") {
        const o = new KObj(cls);
        cls.instance = o;
        initObject(cls, o, [], {}, null);
      }
    }
    // curOwner белгілеу үшін әдіс өрісін класқа байлау
    const origBind = bindFn;
    void origBind;

    /* ====== Іске қосу ====== */
    const collectFeatures = (node) => {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) return node.forEach(collectFeatures);
      switch (node.k) {
        case "for": features.has_for = true; break;
        case "while": case "dowhile": features.has_while = true; break;
        case "if": case "when": features.has_if = true; break;
        case "fun": if (node.name !== "main") features.has_def = true; break;
        case "call":
          if (node.fn && node.fn.k === "id" && /^(listOf|mutableListOf|arrayListOf|arrayOf|intArrayOf|emptyList|List|IntArray|setOf|mutableSetOf)$/.test(node.fn.name)) features.has_list = true;
          break;
      }
      for (const k of Object.keys(node)) {
        if (k === "k" || k === "line") continue;
        const c = node[k];
        if (c && typeof c === "object") collectFeatures(c);
      }
    };

    let ast = null;
    try {
      ast = KZ.ktParse(code);
    } catch (e) {
      if (!(e instanceof KtSyntax)) throw e;
      error = { kind: "syntax", msg: e.message, line: e.line, detail: e.detail, tip: bracketTip(code), src: srcLine(code, e.line) };
    }

    if (ast) {
      collectFeatures(ast);
      try {
        // 1) класстар мен функцияларды тіркеу
        const classes = [];
        ast.forEach((d) => {
          if (d.k === "class") classes.push(defineClass(d, G));
          else if (d.k === "fun") defineFun(d, G);
        });
        classes.forEach(setupClass);
        // 2) жоғарғы деңгейдегі val/var
        ast.forEach((d) => {
          if (d.k === "var") {
            trace(d.line, G);
            execStmt(d, G);
          }
        });
        // 3) main
        const me = G.vars.get("main");
        if (!me || !(me.v instanceof KFun) || me.hidden) throw fail(KZ.t("main() функциясы табылмады."), KZ.t("Бағдарлама fun main() { … } функциясынан басталады. Кодыңды соның ішіне жаз."), "Function 'main' not found");
        callFn(me.v, me.v.params.length ? [new KList([], false, true)] : [], {}, null);
      } catch (e) {
        if (e === STOP) {
          error = { kind: "limit", msg: KZ.t("Бағдарлама тым ұзақ жұмыс істеді. Шексіз цикл болып жүрген жоқ па? Циклдің тоқтайтын шартын тексер."), line: curLine, detail: "", tip: KZ.t("while циклінің шарты ақыры жалған болуы керек (санауыш өсіп отыруы керек). Рекурсияда тоқтау шарты (if … return) болсын."), src: srcLine(code, curLine) };
        } else if (e instanceof KThrow) {
          const info = excInfo(e.obj);
          error = { kind: "runtime", msg: info.msg, line: curLine || null, detail: info.detail, tip: info.tip, src: srcLine(code, curLine) };
        } else if (e instanceof KtErr) {
          error = { kind: "runtime", msg: e.message, line: e.line || curLine || null, detail: e.detail, tip: e.tip, src: srcLine(code, e.line || curLine) };
        } else if (e instanceof BreakSig || e instanceof ContinueSig) {
          error = { kind: "runtime", msg: KZ.t("break не continue тек цикл ішінде жұмыс істейді."), line: curLine || null, detail: "'break' and 'continue' are only allowed inside a loop", tip: "", src: srcLine(code, curLine) };
        } else if (e instanceof ReturnSig) {
          // main ішінен return
        } else if (e instanceof RangeError && /call stack/i.test(String(e.message))) {
          const info = excInfo(new KObj(EXC.StackOverflowError));
          error = { kind: "runtime", msg: info.msg, line: curLine || null, detail: info.detail, tip: info.tip, src: srcLine(code, curLine) };
        } else {
          console.error(e);
          error = { kind: "runtime", msg: KZ.t("Түсіндірушіде күтпеген қате шықты: ") + String((e && e.message) || e), line: curLine || null, detail: String(e && e.stack || ""), tip: KZ.t("Бұл жағдайды маған хабарла: код басқаша жазылса, жұмыс істеуі мүмкін."), src: srcLine(code, curLine) };
        }
      }
    }
    finished = true;

    const finalVars = endVars || lastVars;
    if (error) frames.push({ line: error.line, kind: "error", vars: lastVars, robot: null, out: outStr, msg: error.msg, dom: undefined });
    else frames.push({ line: null, kind: "end", vars: finalVars, robot: null, out: outStr, msg: null, dom: undefined });
    return { frames, error, output: outStr, lines, features, robot: null, engine: "kt", dom: null };
  }

  KZ.ktRunner = {
    run,
    async load() {
      return run;
    },
  };
})();
