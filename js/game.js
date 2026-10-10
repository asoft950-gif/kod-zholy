/* Bitlings ойыны «Бит: Матрицадан шығу»: Python кодымен басқарылатын 2.5D (жоғарыдан қарау) ойын.
   Python (py/game.py) әлемді есептеп, оқиғалар тізімін қайтарады, ал мына файл оны канвасқа анимация етіп қайта ойнатады. */
(() => {
  "use strict";
  const { el, h } = KZ;
  const t = KZ.t;
  const KEY = "kodzholy.game.v1";

  /* ---------- Прогресс (құрылғыда) ---------- */
  let st = null;
  const load = () => {
    if (st) return st;
    try {
      st = JSON.parse(localStorage.getItem(KEY)) || {};
    } catch (e) {
      st = {};
    }
    st.s = st.s || {}; // деңгей -> жұлдыз
    st.b = st.b || {}; // деңгей -> ең жақсы тиын/кристалл
    st.code = st.code || {};
    return st;
  };
  const save = () => {
    KZ.store.set(KEY, st); // KZ.store арқылы: бұлтпен синхрондалады
  };
  window.addEventListener("kz-synced", () => (st = null)); // басқа құрылғыдан келген деректі қайта оқу
  const stars = (id) => load().s[id] || 0;
  const D = () => KZ.gameData();
  const gem = () => Object.values(load().b).reduce((a, b) => a + b, 0);

  KZ.game = {
    stat() {
      const d = D();
      return { z1: d.levels.every((l) => stars(l.id) > 0), z2: d.zone2.levels.every((l) => stars(l.id) > 0), z3: d.zone3.levels.every((l) => stars(l.id) > 0), farm: d.farm.every((l) => stars(l.id) > 0) };
    },
    gems: gem,
    stars,
    /* бұлтқа: барлық жұлдыз ('game' курсы ретінде) */
    cloudItems() {
      const s = load().s;
      return Object.keys(s)
        .filter((id) => s[id] > 0)
        .map((id) => ({ c: "game", l: id, s: Math.min(3, s[id]) }));
    },
    /* бұлттан келген жұлдыздармен біріктіру (үлкені жеңеді) */
    fromCloud(map) {
      const st2 = load();
      let ch = false;
      Object.keys(map || {}).forEach((id) => {
        if ((map[id] || 0) > (st2.s[id] || 0)) {
          st2.s[id] = map[id];
          ch = true;
        }
      });
      if (ch) save();
    },
  };

  /* ---------- Python жүктеу ---------- */
  let runPromise = null;
  function loadRunner() {
    return (
      runPromise ||
      (runPromise = (async () => {
        const py = await KZ.pyodide();
        const src = await (await fetch("py/game.py")).text();
        const g = py.globals.get("dict")();
        if (KZ.lang === "ru") g.set("_TR", py.toPy(KZ.ru));
        py.runPython(src, { globals: g });
        const fn = g.get("run_game");
        return (code, cfg) => JSON.parse(fn(code, JSON.stringify(cfg)));
      })().catch((e) => {
        runPromise = null;
        throw e;
      }))
    );
  }

  /* ---------- Кейіпкер суреті (гардеробтағы скиндермен) ---------- */
  let heroImg = null;
  function heroImage() {
    if (heroImg) return heroImg;
    const img = new Image();
    heroImg = { img, ok: false, ar: 1.2 };
    try {
      const svg = KZ.hero.svg({ still: true, lite: true, streak: 0 });
      const m = /viewBox="([\d.\s-]+)"/.exec(svg);
      if (m) {
        const v = m[1].trim().split(/\s+/).map(Number);
        heroImg.ar = v[3] / v[2];
      }
      const src = /xmlns=/.test(svg) ? svg : svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
      img.onload = () => (heroImg.ok = true);
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(src);
    } catch (e) {
      /* эмоджи қолданылады */
    }
    return heroImg;
  }
  KZ.game.resetHero = () => (heroImg = null);

  /* ---------- Хаб ---------- */
  function hub(box) {
    const d = D();
    box.textContent = "";
    const w = el("div", "gm");
    w.appendChild(h("a", "btn small ghost", t("← Басты бет"))).href = "#/";
    w.appendChild(h("h1", "gm-title", "🎮 " + t("Бит: Матрицадан шығу")));
    w.appendChild(h("p", "hint", d.zone.intro));
    w.appendChild(h("div", "gm-gems", "💎 " + gem() + " " + t("кристалл")));
    w.appendChild(h("h2", "section-title", d.zone.name));
    const grid = el("div", "gm-grid");
    d.levels.forEach((l, i) => {
      const open = i === 0 || stars(d.levels[i - 1].id) > 0;
      grid.appendChild(tile(l, i + 1, open, l.enemies ? (l.enemies.B ? "👾" : "⚔️") : ""));
    });
    w.appendChild(grid);
    const z2open = stars("g9") > 0;
    w.appendChild(h("h2", "section-title", d.zone2.name));
    w.appendChild(h("p", "hint", z2open ? d.zone2.intro : t("🔒 2-аймақ «Матрица қарауылы» бастығын жеңгенде ашылады.")));
    const grid2 = el("div", "gm-grid");
    d.zone2.levels.forEach((l, i) => grid2.appendChild(tile(l, i + 1, z2open && (i === 0 || stars(d.zone2.levels[i - 1].id) > 0), l.enemies ? (l.enemies.B ? "👾" : "⚔️") : "🧩")));
    w.appendChild(grid2);
    const z3open = stars("h6") > 0;
    w.appendChild(h("h2", "section-title", d.zone3.name));
    w.appendChild(h("p", "hint", z3open ? d.zone3.intro : t("🔒 3-аймақ «Агент Матрица» бастығын жеңгенде ашылады.")));
    const grid3 = el("div", "gm-grid");
    d.zone3.levels.forEach((l, i) => grid3.appendChild(tile(l, i + 1, z3open && (i === 0 || stars(d.zone3.levels[i - 1].id) > 0), l.enemies ? (l.enemies.B ? "👾" : "⚔️") : "📦")));
    w.appendChild(grid3);
    w.appendChild(h("h2", "section-title", "🌾 " + t("Кристалл фермасы")));
    w.appendChild(h("p", "hint", t("Код жазып егін ек, пісіп жатқанын жина. Кристалл — ойын валютасы.")));
    const fg = el("div", "gm-grid");
    const farmOpen = stars("g3") > 0;
    d.farm.forEach((l, i) => fg.appendChild(tile(l, i + 1, farmOpen && (i === 0 || stars(d.farm[i - 1].id) > 0), "🌱")));
    w.appendChild(fg);
    if (!farmOpen) w.appendChild(h("p", "hint", t("🔒 Ферма «Алтын жол» деңгейін өткенде ашылады.")));
    w.appendChild(h("p", "hint gm-reward", t("🎁 Сыйлық: 1-аймақты өтсең — «Матрицадан шыққан» белгісі, үш фермаңды өтсең — «Кристалл фермері» белгісі кейіпкеріңе беріледі.")));
    box.appendChild(w);

    function tile(l, n, open, mark) {
      const a = h("a", "gm-tile" + (open ? "" : " lock") + (stars(l.id) ? " done" : ""));
      if (open) a.href = "#/game/" + l.id;
      a.append(h("b", null, open ? String(n) : "🔒"), h("span", null, l.title), h("small", null, mark + " " + "★".repeat(stars(l.id)) + "☆".repeat(3 - stars(l.id))));
      return a;
    }
  }

  /* ---------- Деңгей беті ---------- */
  let cleanup = null;
  function level(box, id) {
    const d = D();
    const all = d.levels.concat(d.zone2.levels, d.zone3.levels, d.farm);
    const L = all.find((x) => x.id === id);
    if (!L) return hub(box);
    const isFarm = L.mode === "farm";
    const idx = all.indexOf(L);
    const chain = isFarm ? d.farm : d.levels.concat(d.zone2.levels, d.zone3.levels);
    const next = chain[chain.indexOf(L) + 1] || null;
    box.textContent = "";
    const w = el("div", "gm");
    box.appendChild(w);
    w.appendChild(h("a", "btn small ghost", t("← Ойын"))).href = "#/game";
    w.appendChild(h("h2", "gm-title", L.title));
    w.appendChild(h("p", "gm-story", L.story));
    w.appendChild(h("p", "gm-goal", "🎯 " + (L.goal_t || L.goal)));

    const stage = el("div", "gm-stage");
    const cv = el("canvas", "gm-cv");
    stage.appendChild(cv);
    const hud = el("div", "gm-hud");
    stage.appendChild(hud);
    w.appendChild(stage);

    const bar = el("div", "gm-bar");
    const runBtn = el("button", "btn primary", "▶ " + t("Іске қос"));
    const resetBtn = el("button", "btn ghost", "⟲ " + t("Қайта"));
    const spd = el("select", "gm-speed");
    [["1", "1×"], ["2", "2×"], ["4", "4×"]].forEach(([v, n]) => spd.appendChild(new Option(n, v)));
    bar.append(runBtn, resetBtn, spd);
    w.appendChild(bar);
    const msg = el("div", "gm-msg");
    msg.setAttribute("aria-live", "polite");
    w.appendChild(msg);

    const ta = el("textarea", "gm-code");
    ta.value = load().code[L.id] != null ? load().code[L.id] : L.start;
    ta.spellcheck = false;
    ta.setAttribute("autocapitalize", "off");
    ta.setAttribute("autocorrect", "off");
    w.appendChild(ta);
    let cm = null;
    if (window.CodeMirror) {
      cm = CodeMirror.fromTextArea(ta, { mode: "python", lineNumbers: true, indentUnit: 4, tabSize: 4, indentWithTabs: false, viewportMargin: Infinity, inputStyle: "contenteditable", autoCloseBrackets: true, extraKeys: { Tab: (c) => c.execCommand("insertSoftTab"), "Ctrl-Enter": () => runBtn.click() } });
    } else {
      ta.addEventListener("keydown", (e) => {
        if (e.key === "Tab") {
          e.preventDefault();
          document.execCommand("insertText", false, "    ");
        }
      });
    }
    const getCode = () => (cm ? cm.getValue() : ta.value);
    const setCode = (v) => (cm ? cm.setValue(v) : (ta.value = v));

    /* Командалар панелі: басқанда код жазатын жерге түседі */
    const cmds = el("div", "gm-cmds");
    const tip = el("div", "gm-tip", t("Команданы бас — ол кодқа түседі 👇"));
    const chipRow = el("div", "gm-chips");
    function insert(text, stmt) {
      if (cm) {
        cm.focus();
        const cur = cm.getCursor();
        const line = cm.getLine(cur.line);
        const ind = line.match(/^\s*/)[0];
        const body = text.split("\n").join("\n" + ind);
        if (stmt && line.trim() !== "") {
          const end = { line: cur.line, ch: line.length };
          cm.replaceRange("\n" + ind + body, end);
          const nl = cm.lineCount();
          void nl;
        } else cm.replaceSelection(stmt ? body : text);
        cm.setCursor(cm.getCursor());
        cm.scrollIntoView(null, 80);
      } else {
        const v = ta.value;
        const pos = ta.selectionStart || v.length;
        const ls = v.lastIndexOf("\n", pos - 1) + 1;
        const lineEnd = v.indexOf("\n", pos) < 0 ? v.length : v.indexOf("\n", pos);
        const ind = v.slice(ls, lineEnd).match(/^\s*/)[0];
        const body = text.split("\n").join("\n" + ind);
        if (stmt && v.slice(ls, lineEnd).trim() !== "") {
          ta.value = v.slice(0, lineEnd) + "\n" + ind + body + v.slice(lineEnd);
          ta.selectionStart = ta.selectionEnd = lineEnd + 1 + ind.length + body.length;
        } else {
          ta.value = v.slice(0, pos) + (stmt ? body : text) + v.slice(pos);
          ta.selectionStart = ta.selectionEnd = pos + (stmt ? body : text).length;
        }
        ta.focus();
      }
    }
    /* [белгі, кодқа түсетін мәтін, сипаттама, тұтас жол ма] */
    const api = [
      ["alga(1)", "alga(1)", t("n қадам алға"), true],
      ["onga()", "onga()", t("оңға бұрыл"), true],
      ["solga()", "solga()", t("солға бұрыл"), true],
      ["zhol_bos()", "zhol_bos()", t("алдында жол бос па? (True/False)"), false],
      ["tiken_bar()", "tiken_bar()", t("алдында тікен бар ма?"), false],
      ["for", "for i in range(3):\n    ", t("қайталау: 3 рет"), true],
      ["while", "while zhol_bos():\n    ", t("шарт орындалғанша қайтала"), true],
      ["if", "if zhol_bos():\n    ", t("шарт дұрыс болса ғана орында"), true],
      ["def", "def jur(n):\n    ", t("өз функцияңды жаса"), true],
    ];
    if (isFarm) api.push(["ek()", "ek()", t("тұқым ек"), true], ["zhi()", "zhi()", t("пісіп тұрғанды жина"), true], ["pisti()", "pisti()", t("осы жердегі егін піскен бе?"), false]);
    if (L.lists) {
      api.push(["list", "qadam = [3, 2, 3]\n", t("тізім (list): бірнеше мәнді бірге сақтайды"), true], ["for in list", "for n in qadam:\n    ", t("тізімнің әр элементі үшін"), true], ["qadam[0]", "qadam[0]", t("тізімнің бірінші элементі (индекс 0)"), false], ["len(qadam)", "len(qadam)", t("тізім ұзындығы"), false], ["dict", "kom = {\"A\": alga}\n", t("сөздік (dict): кілт → мән"), true], ["kom[h]()", "kom[h]()", t("сөздіктен кілт бойынша команданы алып орында"), true]);
    }
    if (L.enemies) {
      api.push(["def shaiqas", "def shaiqas(men, zhau):\n    return \"ur\"\n", t("әр раундта шақырылады; 'ur', 'qorgan' не 'emde' қайтар"), true]);
      api.push(["return ur", "return \"ur\"", t("жауды ұр"), true], ["return qorgan", "return \"qorgan\"", t("қорған"), true], ["return emde", "return \"emde\"", t("емделу"), true]);
      api.push(["men.hp", "men.hp", t("денсаулығың"), false], ["men.heals", "men.heals", t("емделу саны"), false], ["zhau.hp", "zhau.hp", t("жау денсаулығы"), false], ["zhau.auyr", "zhau.auyr", t("ауыр соққы келе ме"), false], ["zhau.kezek", "zhau.kezek", t("раунд нөмірі"), false], ["zhau.tur", "zhau.tur", t("жау түрі: \"slime\", \"bug\", \"boss\""), false]);
    }
    api.forEach(([lab, code, desc, stmt]) => {
      const b = el("button", "gm-chipbtn", lab);
      b.type = "button";
      b.title = desc;
      b.addEventListener("click", () => {
        insert(code, stmt);
        tip.textContent = lab + " — " + desc;
      });
      chipRow.appendChild(b);
    });
    cmds.append(h("b", "gm-cmdtitle", "🧩 " + t("Командалар")), chipRow, tip);
    w.insertBefore(cmds, msg);

    /* ---------- Әлем күйі ---------- */
    const rows = L.map.length;
    const cols = L.map[0].length;
    let T = 40;
    let WH = 13;
    let dpr = 1;
    let ctx = cv.getContext("2d");
    let S; // анимация күйі
    const hi = heroImage();

    function fit() {
      const cw = Math.max(260, stage.clientWidth || 320);
      T = Math.max(26, Math.min(64, Math.floor(cw / cols)));
      WH = Math.round(T * 0.32);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = cols * T;
      const H = rows * T + WH + 4;
      cv.width = W * dpr;
      cv.height = H * dpr;
      cv.style.width = W + "px";
      cv.style.height = H + "px";
    }

    function fresh() {
      const grid = L.map.map((r) => r.split(""));
      let sx = 0;
      let sy = 0;
      grid.forEach((r, j) =>
        r.forEach((c, i) => {
          if (c === "S") {
            sx = i;
            sy = j;
            r[i] = ".";
          }
        })
      );
      const hp = L.hero ? L.hero.hp : 0;
      S = { grid, hx: sx, hy: sy, hd: L.dir, hp, hpmax: hp, coins: 0, keys: 0, gems: 0, crops: {}, fight: null, floats: [], parts: [], shake: 0, flash: 0, lunge: 0, elunge: 0, ehit: 0, shield: 0, banner: null, moving: 0, done: false, tk: 0, walkP: 0, turn: 0, slash: 0, vis: {}, tr: [], lastTr: 0, step: 0 };
      S.vis[sx + "," + sy] = performance.now();
      paintHud();
    }

    function paintHud() {
      hud.textContent = "";
      const chips = [];
      if (L.hero) chips.push("❤️ " + S.hp + "/" + S.hpmax);
      if (!isFarm && L.map.join("").includes("c")) chips.push("🪙 " + S.coins);
      if (L.map.join("").includes("k")) chips.push("🔑 " + S.keys);
      if (isFarm) chips.push("💎 " + S.gems + "/" + L.goal);
      chips.forEach((c) => hud.appendChild(h("span", "gm-chip", c)));
    }

    /* ---------- Сурет салу ---------- */
    const C = { bg1: "#06130f", bg2: "#0b2a20", fa: "#0f3a2c", fb: "#0c3025", wallTop: "#2a8a6a", wallSide: "#12503d", wallDark: "#0a2e24", glow: "#3dffb0" };
    function rr(x, y, w, hh, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + hh, r);
      ctx.arcTo(x + w, y + hh, x, y + hh, r);
      ctx.arcTo(x, y + hh, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
    const oy = () => WH;
    const px = (x) => x * T;
    const py2 = (y) => oy() + y * T;

    function drawFloor(x, y, c, now) {
      const X = px(x);
      const Y = py2(y);
      const plot = c === "f";
      const chk = (x + y) % 2;
      if (plot) {
        const g = ctx.createLinearGradient(X, Y, X, Y + T);
        g.addColorStop(0, chk ? "#6b4529" : "#5f3d24");
        g.addColorStop(1, chk ? "#4a2f1a" : "#42291a");
        ctx.fillStyle = g;
      } else {
        const g = ctx.createLinearGradient(X, Y, X + T, Y + T);
        g.addColorStop(0, chk ? "#0c3326" : "#0a2d22");
        g.addColorStop(1, chk ? "#071f17" : "#061b14");
        ctx.fillStyle = g;
      }
      ctx.fillRect(X, Y, T, T);
      /* қыры: жарық жоғарыдан-солдан, көлеңке төменнен-оңнан */
      ctx.fillStyle = plot ? "rgba(255,230,200,.10)" : "rgba(120,255,200,.10)";
      ctx.fillRect(X, Y, T, 2);
      ctx.fillRect(X, Y, 2, T);
      ctx.fillStyle = "rgba(0,0,0,.35)";
      ctx.fillRect(X, Y + T - 2, T, 2);
      ctx.fillRect(X + T - 2, Y, 2, T);
      if (plot) {
        ctx.strokeStyle = "rgba(0,0,0,.3)";
        ctx.lineWidth = 2;
        for (let k = 1; k <= 3; k++) {
          ctx.beginPath();
          ctx.moveTo(X + 5, Y + (T * k) / 4);
          ctx.lineTo(X + T - 5, Y + (T * k) / 4);
          ctx.stroke();
        }
      } else if (c === "~") {
        ctx.fillStyle = "#0a3b56";
        ctx.fillRect(X, Y, T, T);
        ctx.strokeStyle = "rgba(120,220,255,.55)";
        ctx.lineWidth = 2;
        for (let k = 0; k < 2; k++) {
          ctx.beginPath();
          const o = Math.sin(now / 400 + x + k) * 3;
          ctx.moveTo(X + 4, Y + T * (0.35 + k * 0.3) + o);
          ctx.quadraticCurveTo(X + T / 2, Y + T * (0.35 + k * 0.3) - 6 + o, X + T - 4, Y + T * (0.35 + k * 0.3) + o);
          ctx.stroke();
        }
      } else {
        /* схема сызықтары */
        const h2 = (x * 31 + y * 17) % 4;
        ctx.strokeStyle = "rgba(61,255,176,.16)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (h2 === 0) {
          ctx.moveTo(X + 6, Y + T * 0.5);
          ctx.lineTo(X + T * 0.45, Y + T * 0.5);
          ctx.lineTo(X + T * 0.6, Y + T * 0.3);
          ctx.lineTo(X + T - 6, Y + T * 0.3);
        } else if (h2 === 1) {
          ctx.moveTo(X + T * 0.3, Y + 6);
          ctx.lineTo(X + T * 0.3, Y + T * 0.55);
          ctx.lineTo(X + T * 0.7, Y + T * 0.7);
          ctx.lineTo(X + T * 0.7, Y + T - 6);
        } else if (h2 === 2) {
          ctx.rect(X + T * 0.28, Y + T * 0.28, T * 0.44, T * 0.44);
        }
        ctx.stroke();
        if (h2 !== 3) {
          ctx.fillStyle = "rgba(61,255,176,.35)";
          ctx.beginPath();
          ctx.arc(X + T * 0.5, Y + T * 0.5, 1.8, 0, 7);
          ctx.fill();
        }
        ctx.fillStyle = "rgba(61,255,176,.14)";
        ctx.font = "bold " + Math.round(T * 0.2) + "px ui-monospace,monospace";
        ctx.fillText((x * 7 + y * 13) % 3 ? "0" : "1", X + 4, Y + T - 5);
      }
      /* Бит өткен із: жасыл жарқыл баяу сөнеді */
      const vt = S.vis && S.vis[x + "," + y];
      if (vt) {
        const a = Math.max(0, 1 - (now - vt) / 2600);
        if (a > 0) {
          ctx.fillStyle = "rgba(61,255,176," + (0.28 * a).toFixed(3) + ")";
          ctx.fillRect(X, Y, T, T);
          ctx.strokeStyle = "rgba(180,255,226," + (0.5 * a).toFixed(3) + ")";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(X + 2, Y + 2, T - 4, T - 4);
        }
      }
    }

    function drawWall(x, y, now) {
      const X = px(x);
      const Y = py2(y);
      const below = y + 1 < rows && S.grid[y + 1][x] === "#";
      /* жерге түсетін көлеңке */
      ctx.fillStyle = "rgba(0,0,0,.4)";
      ctx.fillRect(X + 2, Y - WH + T - 1, T, 9);
      /* алдыңғы қыры (қабырғаның беті) */
      if (!below) {
        const g2 = ctx.createLinearGradient(0, Y - WH + T, 0, Y + T);
        g2.addColorStop(0, "#176650");
        g2.addColorStop(1, "#082a21");
        ctx.fillStyle = g2;
        ctx.fillRect(X, Y - WH + T, T, WH);
        ctx.fillStyle = "rgba(61,255,176,.55)";
        ctx.fillRect(X, Y - WH + T, T, 1.5);
        ctx.fillStyle = "rgba(0,0,0,.35)";
        for (let k = 0; k < 2; k++) ctx.fillRect(X + (T / 2) * k + 1, Y - WH + T + 2, 1.5, WH - 2);
      }
      /* үсті */
      const g = ctx.createLinearGradient(X, Y - WH, X + T, Y - WH + T);
      g.addColorStop(0, "#3fbf96");
      g.addColorStop(1, "#1f7c5c");
      ctx.fillStyle = g;
      ctx.fillRect(X, Y - WH, T, T);
      /* кірпіш тігістері */
      ctx.strokeStyle = "rgba(4,40,30,.45)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(X, Y - WH + T / 2);
      ctx.lineTo(X + T, Y - WH + T / 2);
      const off = (x + y) % 2 ? T * 0.3 : T * 0.7;
      ctx.moveTo(X + off, Y - WH);
      ctx.lineTo(X + off, Y - WH + T / 2);
      ctx.moveTo(X + T - off, Y - WH + T / 2);
      ctx.lineTo(X + T - off, Y - WH + T);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,.22)";
      ctx.fillRect(X, Y - WH, T, 2);
      ctx.fillRect(X, Y - WH, 2, T);
      ctx.fillStyle = "rgba(0,0,0,.2)";
      ctx.fillRect(X + T - 2, Y - WH, 2, T);
      /* жыпылықтайтын диод */
      if ((x * 5 + y * 3) % 4 === 0) {
        const on = Math.sin(now / 500 + x * 2 + y) > 0.2;
        ctx.fillStyle = on ? "#b2ffe3" : "#1f7c5c";
        ctx.beginPath();
        ctx.arc(X + T * 0.5, Y - WH + T * 0.5, 2.2, 0, 7);
        ctx.fill();
        if (on) {
          ctx.fillStyle = "rgba(61,255,176,.3)";
          ctx.beginPath();
          ctx.arc(X + T * 0.5, Y - WH + T * 0.5, 6, 0, 7);
          ctx.fill();
        }
      }
    }

    function gemShape(cx, cy, r, col, now, spin) {
      const sx = spin ? Math.abs(Math.cos(now / 380)) * 0.6 + 0.4 : 1;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(sx, 1);
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(r * 0.8, -r * 0.2);
      ctx.lineTo(0, r);
      ctx.lineTo(-r * 0.8, -r * 0.2);
      ctx.closePath();
      const g = ctx.createLinearGradient(-r, -r, r, r);
      g.addColorStop(0, "#fff");
      g.addColorStop(0.35, col);
      g.addColorStop(1, "rgba(0,0,0,.45)");
      ctx.fillStyle = g;
      ctx.shadowColor = col;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(255,255,255,.55)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    function drawCell(x, y, c, now) {
      const cx = px(x) + T / 2;
      const cy = py2(y) + T / 2;
      if (c === "c") {
        ctx.fillStyle = "rgba(0,0,0,.3)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + T * 0.2, T * 0.16, T * 0.06, 0, 0, 7);
        ctx.fill();
        const bob = Math.sin(now / 300 + x) * 2;
        ctx.beginPath();
        ctx.arc(cx, cy - 3 + bob, T * 0.17, 0, 7);
        const g = ctx.createRadialGradient(cx - 3, cy - 7 + bob, 1, cx, cy - 3 + bob, T * 0.2);
        g.addColorStop(0, "#fff7c2");
        g.addColorStop(0.5, "#ffd23f");
        g.addColorStop(1, "#b8860b");
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = "#7a5200";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (c === "k") {
        ctx.font = Math.round(T * 0.55) + "px serif";
        ctx.textAlign = "center";
        ctx.fillText("🔑", cx, cy + 8 + Math.sin(now / 300) * 2);
        ctx.textAlign = "left";
      } else if (c === "D") {
        const X = px(x);
        const Y = py2(y);
        ctx.fillStyle = "#6b3d17";
        ctx.fillRect(X + 3, Y - WH + 3, T - 6, T + WH - 3);
        ctx.fillStyle = "#8b5a2b";
        ctx.fillRect(X + 3, Y - WH + 3, T - 6, T * 0.55);
        ctx.strokeStyle = "#3d2008";
        ctx.lineWidth = 2;
        ctx.strokeRect(X + 3, Y - WH + 3, T - 6, T + WH - 3);
        ctx.font = Math.round(T * 0.4) + "px serif";
        ctx.textAlign = "center";
        ctx.fillText("🔒", cx, cy + 2);
        ctx.textAlign = "left";
      } else if (c === "E") {
        const p = (now / 900) % 1;
        for (let k = 0; k < 3; k++) {
          const q = (p + k / 3) % 1;
          ctx.strokeStyle = "rgba(61,255,176," + (0.7 * (1 - q)).toFixed(2) + ")";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.ellipse(cx, cy + 2, T * (0.14 + q * 0.34), T * (0.1 + q * 0.24), 0, 0, 7);
          ctx.stroke();
        }
        const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, T * 0.34);
        g.addColorStop(0, "#eafff6");
        g.addColorStop(0.5, "rgba(61,255,176,.8)");
        g.addColorStop(1, "rgba(61,255,176,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 2, T * 0.34, T * 0.26, 0, 0, 7);
        ctx.fill();
      } else if (c === "^") {
        const X = px(x);
        const Y = py2(y);
        for (let k = 0; k < 3; k++) {
          const bx = X + T * (0.2 + k * 0.3);
          ctx.beginPath();
          ctx.moveTo(bx - T * 0.13, Y + T * 0.78);
          ctx.lineTo(bx, Y + T * 0.3);
          ctx.lineTo(bx + T * 0.13, Y + T * 0.78);
          ctx.closePath();
          const g = ctx.createLinearGradient(bx - 6, 0, bx + 6, 0);
          g.addColorStop(0, "#ff6b6b");
          g.addColorStop(1, "#a61e1e");
          ctx.fillStyle = g;
          ctx.fill();
          ctx.strokeStyle = "#5c0f0f";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      } else if (c === "M" || c === "B") {
        const sp = enemySpec(c, x, y);
        drawEnemy(sp.kind, cx, py2(y) + T * 0.82, c === "B" ? 1.45 : 1, now, sp, S.fight && S.fight.x === x && S.fight.y === y);
      }
      const cr = S.crops[x + "," + y];
      if (cr) {
        const ripe = S.tk - cr.tk >= (L.ripe || 3);
        const X = px(x) + T / 2;
        const Y = py2(y) + T * 0.8;
        ctx.strokeStyle = "#51cf66";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(X, Y);
        ctx.quadraticCurveTo(X + 3, Y - T * 0.2, X, Y - (ripe ? T * 0.38 : T * 0.2));
        ctx.stroke();
        if (ripe) gemShape(X, Y - T * 0.55 + Math.sin(now / 300 + x) * 1.5, T * 0.22, "#4dabf7", now, true);
        else {
          ctx.fillStyle = "#69db7c";
          ctx.beginPath();
          ctx.ellipse(X - 5, Y - T * 0.22, 5, 3, -0.6, 0, 7);
          ctx.ellipse(X + 5, Y - T * 0.26, 5, 3, 0.6, 0, 7);
          ctx.fill();
        }
      }
    }

    function enemySpec(c, x, y) {
      const e = (L.enemies && (L.enemies[x + "," + y] || L.enemies[c])) || {};
      return { kind: e.kind || (c === "B" ? "boss" : "slime"), name: e.name || "?", hp: e.hp || 6 };
    }

    function drawEnemy(kind, cx, fy, sc, now, sp, fighting) {
      const r = T * 0.34 * sc;
      const bob = Math.sin(now / 260) * 2;
      const hit = fighting && S.ehit > 0 ? (Math.random() - 0.5) * 6 : 0;
      const lunge = fighting ? S.elunge * T * 0.35 : 0;
      cx += hit - lunge;
      ctx.fillStyle = "rgba(0,0,0,.35)";
      ctx.beginPath();
      ctx.ellipse(cx, fy, r * 1.05, r * 0.32, 0, 0, 7);
      ctx.fill();
      ctx.save();
      ctx.translate(cx + (kind === "boss" && Math.floor(now / 140) % 9 === 0 ? 3 : 0), fy - r * 0.2 + bob * (kind === "boss" ? 2.2 : 0.5));
      if (S.ehit > 0) ctx.globalAlpha = 0.6 + 0.4 * Math.sin(now / 30);
      if (kind === "slime") {
        const q = Math.sin(now / 240);
        ctx.scale(1 + 0.08 * q, 1 - 0.08 * q);
        const g = ctx.createRadialGradient(-r * 0.3, -r * 0.9, 2, 0, -r * 0.5, r * 1.3);
        g.addColorStop(0, "#d3f9d8");
        g.addColorStop(0.45, "#40c057");
        g.addColorStop(1, "#1b6b2a");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(-r, 0);
        ctx.bezierCurveTo(-r, -r * 1.5, r, -r * 1.5, r, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#0d3d17";
        ctx.lineWidth = 2;
        ctx.stroke();
        eyes(r * 0.36, -r * 0.6, r * 0.2, "#102a14");
      } else if (kind === "bug") {
        ctx.fillStyle = "#862e9c";
        for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
          ctx.strokeStyle = "#3b0a49";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(s * r * 0.5, -r * 0.3);
          ctx.lineTo(s * r * 1.15, -r * 0.55 + k * r * 0.35 + Math.sin(now / 120 + k) * 2);
          ctx.stroke();
        }
        const g = ctx.createRadialGradient(-r * 0.3, -r * 0.9, 2, 0, -r * 0.5, r * 1.2);
        g.addColorStop(0, "#f3d9fa");
        g.addColorStop(0.4, "#be4bdb");
        g.addColorStop(1, "#4a1260");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.55, r * 0.95, r * 0.8, 0, 0, 7);
        ctx.fill();
        ctx.strokeStyle = "#2b0838";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,.3)";
        ctx.beginPath();
        ctx.moveTo(0, -r * 1.3);
        ctx.lineTo(0, -r * 0.1);
        ctx.stroke();
        eyes(r * 0.34, -r * 0.8, r * 0.17, "#fff", "#e03131");
      } else {
        const g = ctx.createLinearGradient(0, -r * 2, 0, 0);
        g.addColorStop(0, "#3a3f4a");
        g.addColorStop(1, "#0b0d12");
        ctx.fillStyle = g;
        rr(-r * 0.85, -r * 1.7, r * 1.7, r * 1.7, r * 0.35);
        ctx.fill();
        ctx.strokeStyle = C.glow;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "#ffe0bd";
        ctx.beginPath();
        ctx.arc(0, -r * 1.55, r * 0.42, 0, 7);
        ctx.fill();
        ctx.fillStyle = "#000";
        rr(-r * 0.42, -r * 1.68, r * 0.84, r * 0.2, 3);
        ctx.fill();
        ctx.fillStyle = C.glow;
        ctx.fillRect(-r * 0.3, -r * 1.64, r * 0.2, r * 0.05);
        ctx.fillRect(r * 0.1, -r * 1.64, r * 0.2, r * 0.05);
        ctx.font = "bold " + Math.round(r * 0.45) + "px ui-monospace,monospace";
        ctx.fillStyle = C.glow;
        ctx.textAlign = "center";
        ctx.fillText(Math.floor(now / 90) % 2 ? "01" : "10", 0, -r * 0.7);
        ctx.fillText(Math.floor(now / 90) % 2 ? "10" : "01", 0, -r * 0.3);
        ctx.textAlign = "left";
      }
      ctx.restore();
      ctx.globalAlpha = 1;
      if (fighting && S.fight) hpBar(cx, fy - r * (kind === "boss" ? 2.2 : 1.9) - 8, S.fight.ehp, S.fight.emax, "#ff6b6b", S.fight.name, 0.32);
      else if (!fighting && sp) tag(cx, fy - r * (kind === "boss" ? 2.2 : 1.9) - 4, String(sp.hp));
    }
    function eyes(dx, y, r, col, pupil) {
      for (const s of [-1, 1]) {
        ctx.fillStyle = pupil ? "#fff" : col;
        ctx.beginPath();
        ctx.arc(s * dx, y, r, 0, 7);
        ctx.fill();
        if (pupil) {
          ctx.fillStyle = pupil;
          ctx.beginPath();
          ctx.arc(s * dx, y, r * 0.55, 0, 7);
          ctx.fill();
        } else {
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(s * dx - r * 0.3, y - r * 0.3, r * 0.3, 0, 7);
          ctx.fill();
        }
      }
    }
    function tag(cx, y, text) {
      ctx.font = "bold " + Math.max(10, Math.round(T * 0.26)) + "px ui-monospace,monospace";
      const w = ctx.measureText(text).width + 10;
      ctx.fillStyle = "rgba(2,16,12,.85)";
      rr(cx - w / 2, y - 14, w, 16, 6);
      ctx.fill();
      ctx.fillStyle = C.glow;
      ctx.textAlign = "center";
      ctx.fillText(text, cx, y - 2);
      ctx.textAlign = "left";
    }
    function hpBar(cx, y, v, max, col, name, off) {
      const w = Math.max(54, T * 1.3);
      cx += (off || 0) * w;
      ctx.fillStyle = "rgba(2,16,12,.88)";
      rr(cx - w / 2 - 2, y - 18, w + 4, 20, 6);
      ctx.fill();
      ctx.fillStyle = "#26352f";
      ctx.fillRect(cx - w / 2, y - 6, w, 6);
      ctx.fillStyle = col;
      ctx.fillRect(cx - w / 2, y - 6, (w * Math.max(0, v)) / max, 6);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 10px ui-monospace,monospace";
      ctx.textAlign = "center";
      ctx.fillText((name ? name + " " : "") + v + "/" + max, cx, y - 9);
      ctx.textAlign = "left";
    }

    function drawHero(now) {
      const hh = T * 1.32;
      const ww = hh / hi.ar;
      const shk = S.shake ? (Math.random() - 0.5) * 5 : 0;
      const cx = px(S.hx) + T / 2 + shk;
      const feet = py2(S.hy) + T * 0.62;
      const dir = S.hd;
      const lunge = S.lunge * T * 0.35;
      const mv = S.moving;
      const ph = S.walkP || 0;
      let hop = mv ? Math.abs(Math.sin(ph)) * T * 0.13 : 0;
      let sy = mv ? 1 - 0.07 * Math.cos(ph * 2) : 1 + 0.025 * Math.sin(now / 380);
      let tilt = mv ? Math.sin(ph) * 0.09 + (dir === 1 ? 0.05 : dir === 3 ? -0.05 : 0) : Math.sin(now / 900) * 0.025;
      let sx = 1 / sy;
      if (S.turn > 0) sx *= 1 - 0.45 * Math.sin(S.turn * Math.PI);
      if (S.done) {
        hop = Math.abs(Math.sin(now / 170)) * T * 0.38;
        tilt = Math.sin(now / 170) * 0.18;
        sy = 1 + 0.08 * Math.cos(now / 85);
        sx = 1 / sy;
      }
      if (S.fight && S.lunge > 0) tilt += 0.18 * S.lunge;
      const hurtK = S.flash > 0 ? Math.sin(now / 25) * 0.05 : 0;
      /* жарық дақ (қоршаған ортаны жарықтандырады) */
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const lg = ctx.createRadialGradient(cx, feet, 2, cx, feet, T * 1.5);
      lg.addColorStop(0, "rgba(61,255,176,.30)");
      lg.addColorStop(1, "rgba(61,255,176,0)");
      ctx.fillStyle = lg;
      ctx.fillRect(cx - T * 1.6, feet - T * 1.6, T * 3.2, T * 3.2);
      ctx.restore();
      /* көлеңке: секіргенде кішірейеді */
      const sc = 1 - Math.min(0.4, hop / (T * 0.5));
      ctx.fillStyle = "rgba(0,0,0,.45)";
      ctx.beginPath();
      ctx.ellipse(cx, feet + 1, T * 0.3 * sc, T * 0.1 * sc, 0, 0, 7);
      ctx.fill();
      const drawImg = (ox, oy2, alpha) => {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(ox + (S.fight ? lunge : 0), oy2 - hop);
        ctx.rotate(tilt + hurtK);
        ctx.scale((dir === 3 ? -1 : 1) * sx, sy);
        if (hi.ok) ctx.drawImage(hi.img, -ww / 2, -hh * 0.95, ww, hh);
        else {
          ctx.font = Math.round(T * 0.9) + "px serif";
          ctx.textAlign = "center";
          ctx.fillText("🙂", 0, -T * 0.2);
        }
        ctx.restore();
      };
      /* қозғалыс ізі */
      if (mv && S.tr) S.tr.forEach((g, i) => drawImg(px(g.x) + T / 2, py2(g.y) + T * 0.62, 0.1 + 0.07 * i));
      drawImg(cx, feet, S.flash > 0 ? 0.55 + 0.45 * Math.sin(now / 30) : 1);
      if (S.shield > 0) {
        ctx.strokeStyle = "rgba(77,171,247," + Math.min(1, S.shield).toFixed(2) + ")";
        ctx.fillStyle = "rgba(77,171,247," + (0.25 * Math.min(1, S.shield)).toFixed(2) + ")";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(cx, feet - hh * 0.4, T * 0.5, hh * 0.55, 0, 0, 7);
        ctx.fill();
        ctx.stroke();
      }
      if (S.fight) hpBar(cx, feet - hh - 6, S.hp, S.hpmax, "#51cf66", "", -0.32);
    }

    function draw(now) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const W = cols * T;
      const H = rows * T + WH + 4;
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, C.bg2);
      bg.addColorStop(1, C.bg1);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      /* Матрица жаңбыры */
      ctx.font = "bold " + Math.max(9, Math.round(T * 0.2)) + "px ui-monospace,monospace";
      const colW = Math.max(12, Math.round(T * 0.3));
      for (let i = 0; i * colW < W; i++) {
        const sp = 40 + ((i * 37) % 50);
        const yy = (((now / 1000) * sp + i * 97) % (H + 120)) - 60;
        for (let k = 0; k < 6; k++) {
          ctx.fillStyle = "rgba(61,255,176," + (0.5 - k * 0.08).toFixed(2) + ")";
          ctx.fillText(((i * 3 + k + Math.floor(now / 220)) % 5 < 2 ? "1" : "0"), i * colW + 2, yy - k * 12);
        }
      }
      ctx.fillStyle = "rgba(6,19,15,.55)";
      ctx.fillRect(0, 0, W, H);
      const sx = S.shake ? (Math.random() - 0.5) * 6 : 0;
      ctx.save();
      ctx.translate(sx, 0);
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (S.grid[y][x] !== "#") drawFloor(x, y, S.grid[y][x], now);
      const hrow = Math.max(0, Math.min(rows - 1, Math.floor(S.hy + 0.5)));
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const c = S.grid[y][x];
          if (c === "#") drawWall(x, y, now);
          else if (c !== "." && c !== "f" && c !== "~") drawCell(x, y, c, now);
          else drawCell(x, y, c, now);
        }
        if (y === hrow) drawHero(now);
      }
      ctx.restore();
      S.ghosts = (S.ghosts || []).filter((g) => now - g.t0 < 600);
      S.ghosts.forEach((g) => {
        const p = (now - g.t0) / 600;
        const gx = px(g.x) + T / 2;
        const gy = py2(g.y) + T * 0.82;
        ctx.save();
        ctx.globalAlpha = 1 - p;
        ctx.translate(gx, gy);
        ctx.scale(1 + p * 0.3, 1 - p * 0.9);
        ctx.translate(-gx, -gy);
        drawEnemy(g.kind, gx, gy, g.kind === "boss" ? 1.45 : 1, now, null, false);
        ctx.restore();
      });
      /* слэш (қылыш ізі) */
      if (S.slash > 0 && S.fight) {
        const ex = px(S.fight.x) + T / 2;
        const ey = py2(S.fight.y) + T * 0.4;
        ctx.strokeStyle = "rgba(255,255,255," + S.slash.toFixed(2) + ")";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(ex, ey, T * 0.55, -2.2 + (1 - S.slash) * 1.5, -0.6 + (1 - S.slash) * 1.5);
        ctx.stroke();
      }
      const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,.5)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
      S.parts.forEach((p) => {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.c;
        ctx.fillRect(p.x, p.y, p.s, p.s);
      });
      ctx.globalAlpha = 1;
      S.floats.forEach((f) => {
        ctx.globalAlpha = Math.max(0, Math.min(1, f.life * 1.5));
        ctx.font = "bold " + Math.round(T * 0.38) + "px system-ui,sans-serif";
        ctx.textAlign = "center";
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(0,0,0,.7)";
        ctx.strokeText(f.s, f.x, f.y);
        ctx.fillStyle = f.c;
        ctx.fillText(f.s, f.x, f.y);
      });
      ctx.globalAlpha = 1;
      ctx.textAlign = "left";
      if (S.banner) {
        ctx.fillStyle = "rgba(2,16,12,.78)";
        ctx.fillRect(0, H / 2 - 22, W, 44);
        ctx.fillStyle = S.banner.c || C.glow;
        ctx.font = "bold " + Math.round(Math.max(16, T * 0.5)) + "px system-ui,sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(S.banner.s, W / 2, H / 2 + 7);
        ctx.textAlign = "left";
      }
      if (S.red > 0) {
        ctx.fillStyle = "rgba(255,40,40," + (0.3 * S.red).toFixed(2) + ")";
        ctx.fillRect(0, 0, W, H);
      }
    }

    /* ---------- Цикл ---------- */
    let alive = true;
    let last = performance.now();
    let rafId = 0;
    function loop(now) {
      if (!alive || !stage.isConnected) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      S.parts = S.parts.filter((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += (p.g || 0) * dt;
        p.life -= dt / p.d;
        return p.life > 0;
      });
      S.floats = S.floats.filter((f) => {
        f.y -= 28 * dt;
        f.life -= dt / 0.9;
        return f.life > 0;
      });
      S.shake = Math.max(0, S.shake - dt);
      S.flash = Math.max(0, S.flash - dt);
      S.ehit = Math.max(0, S.ehit - dt);
      S.red = Math.max(0, (S.red || 0) - dt * 2);
      S.shield = Math.max(0, S.shield - dt * 1.4);
      S.turn = Math.max(0, S.turn - dt * 4.5);
      S.slash = Math.max(0, S.slash - dt * 4);
      if (S.moving) {
        const spv = Number(spd.value) || 1;
        S.walkP += dt * 15 * spv;
        const stp = Math.floor(S.walkP / Math.PI);
        if (stp !== S.step) {
          S.step = stp;
          const fxp = px(S.hx) + T / 2;
          const fyp = py2(S.hy) + T * 0.62;
          for (let i = 0; i < 3; i++) S.parts.push({ x: fxp + (Math.random() - 0.5) * 10, y: fyp, vx: (Math.random() - 0.5) * 40, vy: -20 - Math.random() * 30, g: 60, s: 2 + Math.random() * 3, c: "rgba(150,255,210,.8)", life: 1, d: 0.5 });
        }
        if (now - S.lastTr > 50) {
          S.lastTr = now;
          S.tr.push({ x: S.hx, y: S.hy });
          if (S.tr.length > 3) S.tr.shift();
        }
        S.vis[Math.round(S.hx) + "," + Math.round(S.hy)] = now;
      } else S.tr = [];
      draw(now);
      rafId = requestAnimationFrame(loop);
    }
    cleanup = () => {
      alive = false;
      token++;
      cancelAnimationFrame(rafId);
    };

    function float(x, y, s, c) {
      S.floats.push({ x: px(x) + T / 2, y: py2(y) + T * 0.1, s, c: c || "#fff", life: 1 });
    }
    function burst(x, y, col, n, up) {
      for (let i = 0; i < n; i++) S.parts.push({ x: px(x) + T / 2, y: py2(y) + T / 2, vx: (Math.random() - 0.5) * 160, vy: (Math.random() - (up ? 0.9 : 0.5)) * 160, g: 220, s: 3 + Math.random() * 3, c: col, life: 1, d: 0.8 });
    }
    function confetti() {
      const cols2 = ["#ffd23f", "#3dffb0", "#4dabf7", "#ff6b6b", "#be4bdb"];
      for (let i = 0; i < 70; i++) S.parts.push({ x: Math.random() * cols * T, y: -10, vx: (Math.random() - 0.5) * 60, vy: 40 + Math.random() * 120, g: 60, s: 4 + Math.random() * 4, c: cols2[i % 5], life: 1, d: 1.6 });
    }

    /* ---------- Қайта ойнату ---------- */
    let token = 0;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    function tween(ms, fn, my) {
      return new Promise((res) => {
        const t0 = performance.now();
        const dur = ms / Number(spd.value);
        const tick = () => {
          if (my !== token || !alive) return res(false);
          const p = Math.min(1, (performance.now() - t0) / dur);
          fn(p);
          if (p < 1) requestAnimationFrame(tick);
          else res(true);
        };
        tick();
      });
    }
    const wait = (ms, my) => tween(ms, () => {}, my);

    function setLine(n) {
      if (!cm) return;
      cm.operation(() => {
        for (let i = 0; i < cm.lineCount(); i++) cm.removeLineClass(i, "background", "gm-line");
        if (n && n > 0 && n <= cm.lineCount()) cm.addLineClass(n - 1, "background", "gm-line");
      });
    }
    function errLine(n) {
      if (cm && n && n > 0 && n <= cm.lineCount()) cm.addLineClass(n - 1, "background", "gm-errline");
    }

    async function replay(res, my) {
      for (const e of res.events) {
        if (my !== token) return false;
        setLine(e.l);
        if (e.tk != null) S.tk = e.tk;
        switch (e.t) {
          case "move": {
            const fx = S.hx;
            const fy = S.hy;
            S.hd = e.d;
            const cell = S.grid[e.y][e.x];
            const k = cell === "M" || cell === "B" ? 0 : 1;
            S.moving = 1;
            const ok = await tween(250, (p) => {
              S.hx = fx + (e.x - fx) * k * p;
              S.hy = fy + (e.y - fy) * k * p;
            }, my);
            S.moving = 0;
            if (!ok) return false;
            if (k === 1) {
              S.hx = e.x;
              S.hy = e.y;
            }
            break;
          }
          case "turn":
            S.hd = e.d;
            S.turn = 1;
            if (!(await wait(170, my))) return false;
            break;
          case "coin":
            S.grid[e.y][e.x] = ".";
            S.coins = e.n;
            float(e.x, e.y, "+1 🪙", "#ffd23f");
            burst(e.x, e.y, "#ffd23f", 8, true);
            paintHud();
            break;
          case "key":
            S.grid[e.y][e.x] = ".";
            S.keys = e.n;
            float(e.x, e.y, "🔑", "#ffd23f");
            paintHud();
            break;
          case "door":
            S.grid[e.y][e.x] = ".";
            S.keys = e.keys;
            float(e.x, e.y, "🔓", "#ffd23f");
            burst(e.x, e.y, "#c98a4b", 12);
            paintHud();
            break;
          case "bump":
            S.shake = 0.3;
            S.red = 1;
            if (!(await wait(350, my))) return false;
            break;
          case "hurt":
            S.flash = 0.6;
            S.red = 1;
            burst(e.x, e.y, "#ff6b6b", 14);
            if (!(await wait(400, my))) return false;
            break;
          case "plant":
            S.crops[e.x + "," + e.y] = { tk: e.tk };
            float(e.x, e.y, "🌱", "#69db7c");
            if (!(await wait(130, my))) return false;
            break;
          case "harvest":
            delete S.crops[e.x + "," + e.y];
            S.gems = e.n;
            float(e.x, e.y, "+1 💎", "#74c0fc");
            burst(e.x, e.y, "#4dabf7", 10, true);
            paintHud();
            if (!(await wait(150, my))) return false;
            break;
          case "raw":
            float(e.x, e.y, "⏳", "#ffd43b");
            if (!(await wait(160, my))) return false;
            break;
          case "nothing":
            float(e.x, e.y, "∅", "#adb5bd");
            if (!(await wait(130, my))) return false;
            break;
          case "say":
            msg.className = "gm-msg out";
            msg.textContent = "💬 " + e.s;
            break;
          case "fightstart": {
            S.fight = { x: e.x, y: e.y, name: e.name, ehp: e.ehp, emax: e.ehp, kind: enemySpec(e.c, e.x, e.y).kind };
            S.hp = e.mhp;
            S.hpmax = e.mmax || e.mhp;
            S.banner = { s: (e.boss ? "👾 " : "⚔️ ") + e.name + "!", c: e.boss ? "#ff6b6b" : "#ffd23f" };
            paintHud();
            if (!(await wait(800, my))) return false;
            S.banner = null;
            break;
          }
          case "round": {
            const ff = S.fight;
            if (!ff) break;
            if (e.heavy) {
              S.banner = { s: "⚠️ " + t("Ауыр соққы келеді!"), c: "#ff922b" };
              if (!(await wait(450, my))) return false;
              S.banner = null;
            }
            if (e.act === "ur") {
              await tween(240, (p) => (S.lunge = Math.sin(p * Math.PI)), my);
              S.lunge = 0;
              S.slash = 1;
              S.ehit = 0.3;
              ff.ehp = Math.max(0, ff.ehp - e.de);
              float(ff.x, ff.y - 0.2, "-" + e.de, "#ff8787");
              burst(ff.x, ff.y, "#ff8787", 8);
              await wait(160, my);
            } else if (e.act === "qorgan") {
              S.shield = 1.6;
              float(S.hx, S.hy - 0.2, "🛡️", "#74c0fc");
              await wait(380, my);
            } else if (e.act === "emde") {
              S.hp = Math.min(S.hpmax, S.hp + e.heal);
              float(S.hx, S.hy - 0.2, "+" + e.heal + " ❤️", "#69db7c");
              burst(S.hx, S.hy, "#69db7c", 10, true);
              await wait(380, my);
            } else {
              float(S.hx, S.hy - 0.2, "…", "#adb5bd");
              await wait(250, my);
            }
            if (my !== token) return false;
            if (e.ehp > 0) {
              await tween(260, (p) => (S.elunge = Math.sin(p * Math.PI)), my);
              S.elunge = 0;
              if (e.dm > 0) {
                S.flash = 0.35;
                S.shake = 0.2;
                float(S.hx, S.hy - 0.2, "-" + e.dm, "#ff6b6b");
              } else float(S.hx, S.hy - 0.2, "🛡️ 0", "#74c0fc");
            }
            S.hp = e.mhp;
            ff.ehp = e.ehp;
            paintHud();
            if (!(await wait(260, my))) return false;
            break;
          }
          case "fightend":
            if (e.win) {
              burst(e.x, e.y, "#3dffb0", 22, true);
              (S.ghosts = S.ghosts || []).push({ x: e.x, y: e.y, kind: S.fight ? S.fight.kind : "slime", t0: performance.now() });
              S.grid[e.y][e.x] = ".";
              float(e.x, e.y, "✔", "#3dffb0");
              S.fight = null;
              S.hx = S.hx; // позицияны келесі қозғалыс жаңартады
            } else {
              S.red = 1;
              S.banner = { s: "💥 " + t("Жеңілдің"), c: "#ff6b6b" };
            }
            if (!(await wait(450, my))) return false;
            S.banner = null;
            break;
          case "win":
            confetti();
            S.done = true;
            break;
        }
      }
      return true;
    }

    function lines(code) {
      return code
        .split("\n")
        .map((x) => x.trim())
        .filter((x) => x && !x.startsWith("#")).length;
    }

    async function onRun() {
      const my = ++token;
      runBtn.disabled = true;
      msg.className = "gm-msg";
      msg.textContent = t("Python жүктелуде…") + " " + t("(алғашқы жолы 10–20 секунд)");
      setLine(0);
      if (cm) cm.operation(() => { for (let i = 0; i < cm.lineCount(); i++) cm.removeLineClass(i, "background", "gm-errline"); });
      const code = getCode();
      load().code[L.id] = code;
      save();
      fresh();
      let run;
      try {
        run = await loadRunner();
      } catch (e) {
        msg.className = "gm-msg bad";
        msg.textContent = t("Python жүктелмеді. Интернетті тексеріп, қайта көр.");
        runBtn.disabled = false;
        return;
      }
      if (my !== token) return;
      let res;
      try {
        res = run(code, { mode: L.mode, map: L.map, dir: L.dir, enemies: L.enemies || {}, hero: L.hero || null, goal: L.goal, ripe: L.ripe });
      } catch (e) {
        msg.className = "gm-msg bad";
        msg.textContent = String(e.message || e);
        runBtn.disabled = false;
        return;
      }
      msg.textContent = "";
      const finished = await replay(res, my);
      if (!finished || my !== token) {
        runBtn.disabled = false;
        return;
      }
      setLine(0);
      runBtn.disabled = false;
      if (!res.ok) {
        msg.className = "gm-msg bad";
        msg.textContent = "❌ " + res.error + (res.line ? " (" + t("жол") + " " + res.line + ")" : "");
        errLine(res.line);
        return;
      }
      /* жеңіс */
      const n = lines(code);
      const full = isFarm ? n <= L.par + 6 : res.coins >= res.total;
      const stars3 = 1 + (full ? 1 : 0) + (n <= L.par ? 1 : 0);
      const s0 = load();
      const prev = s0.s[L.id] || 0;
      s0.s[L.id] = Math.max(prev, stars3);
      const gain = isFarm ? res.crystals : res.coins;
      s0.b[L.id] = Math.max(s0.b[L.id] || 0, gain);
      save();
      if (KZ.ach && KZ.ach.check) KZ.ach.check();
      winCard(stars3, n, res);
    }

    function winCard(stars3, n, res) {
      msg.className = "gm-msg win";
      msg.textContent = "";
      msg.appendChild(h("b", null, "🎉 " + t("Жарайсың!") + " " + "★".repeat(stars3) + "☆".repeat(3 - stars3)));
      const why = [];
      why.push(h("div", null, "📏 " + n + " " + t("жол кодта") + " · " + t("3 жұлдыз үшін ≤") + " " + L.par));
      if (!isFarm && res.total) why.push(h("div", null, "🪙 " + res.coins + "/" + res.total));
      if (isFarm) why.push(h("div", null, "💎 " + res.crystals));
      why.forEach((x) => msg.appendChild(x));
      const row = el("div", "gm-bar");
      if (next) {
        const a = h("a", "btn primary", t("Келесі ▶"));
        a.href = "#/game/" + next.id;
        row.appendChild(a);
      } else {
        const a = h("a", "btn primary", t("Ойын картасы"));
        a.href = "#/game";
        row.appendChild(a);
      }
      msg.appendChild(row);
      if (KZ.hero && KZ.hero.cheer) KZ.hero.cheer();
    }

    runBtn.addEventListener("click", onRun);
    resetBtn.addEventListener("click", () => {
      token++;
      runBtn.disabled = false;
      msg.className = "gm-msg";
      msg.textContent = "";
      setLine(0);
      if (cm) cm.operation(() => { for (let i = 0; i < cm.lineCount(); i++) cm.removeLineClass(i, "background", "gm-errline"); });
      fresh();
    });
    const rs = () => {
      if (!stage.isConnected) return;
      fit();
    };
    window.addEventListener("resize", rs);
    const prevCleanup = cleanup;
    cleanup = () => {
      prevCleanup();
      window.removeEventListener("resize", rs);
    };
    fit();
    fresh();
    rafId = requestAnimationFrame(loop);
    void setCode;
    /* кіріспе кеңес: бірінші ашқанда */
    if (!L.hero && L.id === "g1" && !load().code.g1) msg.textContent = t("Кодты өзгертіп, ▶ басып көр: Бит қалай жүреді?");
  }

  KZ.gamePage = (box, id) => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
    heroImage();
    if (id) level(box, id);
    else hub(box);
  };
  KZ.gameLeave = () => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
  };
})();
