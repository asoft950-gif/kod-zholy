/* Ботакод: алгоритм көрінісі (сұрыптау, іздеу, рекурсия) */
(() => {
  "use strict";

  const { el } = KZ;
  const beep = (n) => window.KZS && KZS.beep(n);

  /* ---------- Алгоритмдер: әрқайсысы қадамдар тізімін жасайды ---------- */
  /* қадам: { a: массив, cls: {индекс: класс}, tags: {индекс: жапсырма}, line, text, hold, snd } */
  const ALGOS = {};

  function snap(a, cls, line, text, extra) {
    return Object.assign({ a: a.slice(), cls: cls || {}, tags: {}, line, text }, extra || {});
  }
  const sortedSet = (from, to) => {
    const o = {};
    for (let k = from; k <= to; k++) o[k] = "ok";
    return o;
  };

  ALGOS.bubble = {
    title: "Көпіршік сұрыптау",
    kind: "sort",
    intro: "Көрші екі санды салыстырады: сол жағы үлкен болса, орнын ауыстырады. Әр айналымда ең үлкен сан оң жаққа «қалқып» шығады.",
    code: ["for i in range(len(a) - 1):", "    for j in range(len(a) - 1 - i):", "        if a[j] > a[j + 1]:", "            a[j], a[j + 1] = a[j + 1], a[j]"],
    steps(src) {
      const a = src.slice();
      const n = a.length;
      const st = [];
      let done = {};
      let c = 0;
      let s = 0;
      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - 1 - i; j++) {
          c++;
          st.push(snap(a, Object.assign({}, done, { [j]: "cmp", [j + 1]: "cmp" }), 3, a[j] + " пен " + a[j + 1] + " салыстырамыз: " + a[j] + " > " + a[j + 1] + " ма? " + (a[j] > a[j + 1] ? "Иә." : "Жоқ."), { c, s, snd: "tick" }));
          if (a[j] > a[j + 1]) {
            [a[j], a[j + 1]] = [a[j + 1], a[j]];
            s++;
            st.push(snap(a, Object.assign({}, done, { [j]: "swap", [j + 1]: "swap" }), 4, "Орындарын ауыстырамыз.", { c, s, snd: "swap" }));
          }
        }
        done = Object.assign({}, done, { [n - 1 - i]: "ok" });
        st.push(snap(a, done, 1, a[n - 1 - i] + " өз орнына түсті (ең үлкені оң жақта).", { c, s, snd: "star" }));
      }
      done[0] = "ok";
      st.push(snap(a, sortedSet(0, n - 1), 1, "Дайын! Массив өсу ретімен тұр.", { c, s, snd: "win", end: true }));
      return st;
    },
  };

  ALGOS.selection = {
    title: "Таңдау арқылы сұрыптау",
    kind: "sort",
    intro: "Әр айналымда қалған бөліктен ең кішісін тауып, оны өз орнына (сол жаққа) қояды.",
    code: ["for i in range(len(a)):", "    m = i", "    for j in range(i + 1, len(a)):", "        if a[j] < a[m]:", "            m = j", "    a[i], a[m] = a[m], a[i]"],
    steps(src) {
      const a = src.slice();
      const n = a.length;
      const st = [];
      let c = 0;
      let s = 0;
      for (let i = 0; i < n; i++) {
        let m = i;
        const done = i ? sortedSet(0, i - 1) : {};
        st.push(snap(a, Object.assign({}, done, { [m]: "min" }), 2, i + "-орынға ең кіші санды іздейміз. Әзірге ең кішісі — " + a[m] + ".", { c, s, snd: "tick", tags: { [m]: "m" } }));
        for (let j = i + 1; j < n; j++) {
          c++;
          const better = a[j] < a[m];
          st.push(snap(a, Object.assign({}, done, { [m]: "min", [j]: "cmp" }), 4, a[j] + " < " + a[m] + " ма? " + (better ? "Иә, жаңа ең кіші табылды." : "Жоқ."), { c, s, snd: "tick", tags: { [m]: "m" } }));
          if (better) {
            m = j;
            st.push(snap(a, Object.assign({}, done, { [m]: "min" }), 5, "m = " + j + ": ең кіші енді " + a[m] + ".", { c, s, snd: "tick", tags: { [m]: "m" } }));
          }
        }
        if (m !== i) {
          [a[i], a[m]] = [a[m], a[i]];
          s++;
          st.push(snap(a, Object.assign({}, done, { [i]: "swap", [m]: "swap" }), 6, "Ең кішіні " + i + "-орынға қоямыз (ауыстырамыз).", { c, s, snd: "swap" }));
        }
        st.push(snap(a, sortedSet(0, i), 1, a[i] + " өз орнында.", { c, s, snd: "star" }));
      }
      st.push(snap(a, sortedSet(0, n - 1), 1, "Дайын! Массив өсу ретімен тұр.", { c, s, snd: "win", end: true }));
      return st;
    },
  };

  ALGOS.insertion = {
    title: "Енгізу арқылы сұрыптау",
    kind: "sort",
    intro: "Карталарды қолда сұрыптағандай: әр жаңа санды сол жақтағы реттелген бөлікте өз орнына қояды.",
    code: ["for i in range(1, len(a)):", "    key = a[i]", "    j = i - 1", "    while j >= 0 and a[j] > key:", "        a[j + 1] = a[j]", "        j -= 1", "    a[j + 1] = key"],
    steps(src) {
      const a = src.slice();
      const n = a.length;
      const st = [];
      let c = 0;
      let s = 0;
      st.push(snap(a, { 0: "ok" }, 1, "Бірінші сан өзі жеке реттелген бөлік болып саналады.", { c, s }));
      for (let i = 1; i < n; i++) {
        const key = a[i];
        let j = i - 1;
        st.push(snap(a, Object.assign({}, sortedSet(0, i - 1), { [i]: "min" }), 2, "key = " + key + ". Оны сол жақтағы реттелген бөлікке орналастырамыз.", { c, s, hold: key, snd: "tick" }));
        while (j >= 0) {
          c++;
          const bigger = a[j] > key;
          st.push(snap(a, Object.assign({}, sortedSet(0, i - 1), { [i]: "min", [j]: "cmp" }), 4, a[j] + " > " + key + " ма? " + (bigger ? "Иә, оны оңға жылжытамыз." : "Жоқ, тоқтаймыз."), { c, s, hold: key, snd: "tick" }));
          if (!bigger) break;
          a[j + 1] = a[j];
          s++;
          st.push(snap(a, Object.assign({}, sortedSet(0, i), { [j + 1]: "swap" }), 5, a[j] + " оңға жылжыды.", { c, s, hold: key, snd: "swap" }));
          j--;
        }
        a[j + 1] = key;
        st.push(snap(a, sortedSet(0, i), 7, key + " өз орнына түсті (" + (j + 1) + "-орын).", { c, s, snd: "star" }));
      }
      st.push(snap(a, sortedSet(0, n - 1), 1, "Дайын! Массив өсу ретімен тұр.", { c, s, snd: "win", end: true }));
      return st;
    },
  };

  ALGOS.linear = {
    title: "Сызықтық іздеу",
    kind: "search",
    intro: "Элементтерді бірінен соң бірін тексереді, іздеген санды тапқанша.",
    code: ["for i in range(len(a)):", "    if a[i] == x:", "        return i", "return -1"],
    steps(src, x) {
      const a = src.slice();
      const st = [];
      let c = 0;
      for (let i = 0; i < a.length; i++) {
        c++;
        const hit = a[i] === x;
        st.push(snap(a, { [i]: hit ? "found" : "cmp" }, 2, a[i] + " == " + x + " ма? " + (hit ? "Иә!" : "Жоқ, келесіге өтеміз."), { c, snd: hit ? "star" : "tick" }));
        if (hit) {
          st.push(snap(a, { [i]: "found" }, 3, x + " саны " + i + "-орында табылды. " + c + " рет тексердік.", { c, snd: "win", end: true }));
          return st;
        }
      }
      st.push(snap(a, {}, 4, x + " саны жоқ екен. Бәрін тексердік: -1 қайтады.", { c, snd: "error", end: true }));
      return st;
    },
  };

  ALGOS.binary = {
    title: "Бинарлық іздеу",
    kind: "search",
    sorted: true,
    intro: "Реттелген массивте ортасына қарайды: іздеген сан кіші болса, сол жарты, үлкен болса, оң жарты қалады. Әр қадам аралықты екі есе қысқартады.",
    code: ["lo, hi = 0, len(a) - 1", "while lo <= hi:", "    mid = (lo + hi) // 2", "    if a[mid] == x:", "        return mid", "    elif a[mid] < x:", "        lo = mid + 1", "    else:", "        hi = mid - 1", "return -1"],
    steps(src, x) {
      const a = src.slice();
      const st = [];
      let lo = 0;
      let hi = a.length - 1;
      let c = 0;
      const view = (mid, extra) => {
        const cls = {};
        a.forEach((_, k) => {
          if (k < lo || k > hi) cls[k] = "dim";
        });
        if (mid != null) cls[mid] = (extra && extra.cls) || "cmp";
        const tags = {};
        if (lo <= hi) {
          tags[lo] = "lo";
          tags[hi] = tags[hi] ? tags[hi] + "/hi" : "hi";
        }
        if (mid != null) tags[mid] = tags[mid] ? tags[mid] + "/mid" : "mid";
        return { cls, tags };
      };
      const push = (line, text, mid, extra) => {
        const v = view(mid, extra);
        st.push(Object.assign(snap(a, v.cls, line, text, Object.assign({ c }, extra)), { tags: v.tags }));
      };
      push(1, "Іздейтін аралық: бүкіл массив (lo=0, hi=" + hi + "). Іздейтін сан: " + x + ".", null, { snd: "tick" });
      while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        c++;
        push(3, "Ортасы: mid = (" + lo + " + " + hi + ") // 2 = " + mid + ". a[" + mid + "] = " + a[mid] + ".", mid, { snd: "tick" });
        if (a[mid] === x) {
          push(5, x + " табылды: " + mid + "-орында! " + c + " қадамда таптық.", mid, { cls: "found", snd: "win", end: true });
          return st;
        }
        if (a[mid] < x) {
          lo = mid + 1;
          push(7, a[mid] + " < " + x + ", сондықтан сол жарты керек емес: lo = " + lo + ".", null, { snd: "tick" });
        } else {
          hi = mid - 1;
          push(9, a[mid] + " > " + x + ", сондықтан оң жарты керек емес: hi = " + hi + ".", null, { snd: "tick" });
        }
      }
      push(10, "Аралық бос қалды: " + x + " саны жоқ. -1 қайтады.", null, { snd: "error", end: true });
      return st;
    },
  };

  /* ---------- Рекурсия: fib шақыру ағашы ---------- */
  function fibSteps(n0) {
    const nodes = [];
    const st = [];
    const done = {};
    let calls = 0;
    const snapT = (active, line, text, snd, end) =>
      st.push({ tree: true, upto: nodes.length, done: Object.assign({}, done), active, line, text, c: calls, snd, end });
    (function go(n, parent) {
      const node = { id: nodes.length, n, parent, kids: [] };
      nodes.push(node);
      if (parent != null) nodes[parent].kids.push(node.id);
      calls++;
      snapT(node.id, 1, "fib(" + n + ") шақырылды.", "tick");
      if (n < 2) {
        done[node.id] = n;
        snapT(node.id, 3, "fib(" + n + ") < 2: жауап дайын, " + n + " қайтарады.", "swap");
        return n;
      }
      snapT(node.id, 4, "fib(" + n + ") = fib(" + (n - 1) + ") + fib(" + (n - 2) + "). Алдымен fib(" + (n - 1) + ") шақырамыз.", "tick");
      const a = go(n - 1, node.id);
      snapT(node.id, 4, "fib(" + (n - 1) + ") = " + a + " болды. Енді fib(" + (n - 2) + ") шақырамыз.", "tick");
      const b = go(n - 2, node.id);
      done[node.id] = a + b;
      snapT(node.id, 4, "fib(" + n + ") = " + a + " + " + b + " = " + (a + b) + ".", "star");
      return a + b;
    })(n0, null);
    st[st.length - 1].end = true;
    st[st.length - 1].snd = "win";
    return { nodes, st };
  }

  const FIB = {
    title: "Рекурсия: fib",
    kind: "tree",
    intro: "Функция өзін өзі шақырады. Ағаштан бір сандың есебі қанша рет қайталанатынын көр: сондықтан рекурсия баяу болуы мүмкін.",
    code: ["def fib(n):", "    if n < 2:", "        return n", "    return fib(n - 1) + fib(n - 2)"],
  };

  const ORDER = ["bubble", "selection", "insertion", "linear", "binary", "fib"];
  const GET = (k) => (k === "fib" ? FIB : ALGOS[k]);

  /* ---------- Бет ---------- */
  KZ.algoPage = function (root, startKey) {
    root.textContent = "";
    let key = ORDER.includes(startKey) ? startKey : "bubble";
    let values = [5, 2, 9, 1, 7, 3];
    let target = 7;
    let fibN = 5;
    let steps = [];
    let fibTree = null;
    let pos = 0;
    let timer = null;
    let speed = 2;

    const page = el("div", "page");
    const back = el("a", "back", "← Басты бет");
    back.href = "#/";
    page.appendChild(back);
    page.appendChild(el("h1", "section-title", "🎬 Алгоритм көрінісі"));
    page.appendChild(el("p", "muted", "Алгоритмнің қалай жұмыс істейтінін қадам-қадамымен көр. Қадамдап өтуге, кері қайтуға болады."));

    const chips = el("div", "algo-chips");
    page.appendChild(chips);

    const card = el("section", "card algo-card");
    const intro = el("p", "algo-intro");
    const stage = el("div", "algo-stage");
    const holdBox = el("div", "algo-hold");
    const say = el("div", "algo-say");
    const stats = el("div", "algo-stats");
    card.append(intro, holdBox, stage, say, stats);

    const inputs = el("div", "algo-inputs");
    const numIn = el("input");
    numIn.type = "text";
    numIn.setAttribute("aria-label", "Сандар");
    numIn.setAttribute("inputmode", "numeric");
    const tgtWrap = el("label", "algo-tgt");
    const tgtIn = el("input");
    tgtIn.type = "number";
    tgtIn.min = "1";
    tgtIn.max = "99";
    tgtWrap.append("Іздейтін сан: ", tgtIn);
    const fibWrap = el("label", "algo-tgt");
    const fibIn = el("input");
    fibIn.type = "number";
    fibIn.min = "2";
    fibIn.max = "7";
    fibWrap.append("n = ", fibIn);
    const rnd = el("button", "btn small", "🎲 Кездейсоқ");
    rnd.type = "button";
    const apply = el("button", "btn small", "Қолдану");
    apply.type = "button";
    const numWrap = el("label", "algo-nums");
    numWrap.append("Сандар: ", numIn);
    inputs.append(numWrap, tgtWrap, fibWrap, rnd, apply);
    card.appendChild(inputs);

    const ctr = el("div", "controls");
    const bPlay = el("button", "btn primary", "▶ Қосу");
    const bBack = el("button", "btn", "⏮");
    const bNext = el("button", "btn", "⏭ Қадам");
    const bReset = el("button", "btn ghost", "↺");
    [bPlay, bBack, bNext, bReset].forEach((b) => (b.type = "button"));
    ctr.append(bPlay, bBack, bNext, bReset);
    card.appendChild(ctr);
    const sp = el("label", "tl");
    const spl = el("span", "tl-label");
    spl.innerHTML = "<span>Жылдамдық</span><span aria-hidden='true'>🐢 баяу · жылдам 🐇</span>";
    const spIn = el("input");
    spIn.type = "range";
    spIn.min = "1";
    spIn.max = "4";
    spIn.value = "2";
    sp.append(spl, spIn);
    card.appendChild(sp);
    const scrubL = el("label", "tl");
    const scl = el("span", "tl-label");
    const scCount = el("b");
    scl.append(el("span", null, "Қадам"), scCount);
    const scrub = el("input");
    scrub.type = "range";
    scrub.min = "0";
    scrub.value = "0";
    scrubL.append(scl, scrub);
    card.appendChild(scrubL);
    page.appendChild(card);

    const codeCard = el("section", "card");
    codeCard.appendChild(el("div", "card-title", "Python коды"));
    const codeBox = el("pre", "algo-code");
    codeCard.appendChild(codeBox);
    page.appendChild(codeCard);
    root.appendChild(page);

    /* --- көмекші --- */
    function parseNums(txt) {
      const arr = String(txt).split(/[\s,;]+/).filter(Boolean).map(Number);
      if (arr.length < 2 || arr.length > 14 || arr.some((v) => !Number.isInteger(v) || v < 1 || v > 99)) return null;
      return arr;
    }
    const randNums = () => Array.from({ length: 7 }, () => 1 + Math.floor(Math.random() * 30));

    function stop() {
      if (timer) clearTimeout(timer);
      timer = null;
      bPlay.textContent = pos >= steps.length - 1 ? "▶ Қайта" : "▶ Қосу";
    }

    function build() {
      stop();
      const A = GET(key);
      intro.textContent = A.intro;
      codeBox.textContent = "";
      A.code.forEach((l, k) => {
        const ln = el("span", "cl", l + "\n");
        ln.dataset.n = String(k + 1);
        codeBox.appendChild(ln);
      });
      numWrap.hidden = A.kind === "tree";
      tgtWrap.hidden = A.kind !== "search";
      fibWrap.hidden = A.kind !== "tree";
      rnd.hidden = A.kind === "tree";
      let src = values.slice();
      if (A.sorted) src.sort((a, b) => a - b);
      numIn.value = values.join(" ");
      tgtIn.value = String(target);
      fibIn.value = String(fibN);
      if (A.kind === "tree") {
        fibTree = fibSteps(fibN);
        steps = fibTree.st;
      } else {
        steps = A.steps(src, target);
        if (A.sorted) steps.sortedNote = true;
      }
      scrub.max = String(steps.length - 1);
      pos = 0;
      render();
      if (A.sorted) say.textContent = "Бинарлық іздеу үшін сандар алдымен өсу ретімен тізіледі. " + say.textContent;
    }

    function render() {
      const A = GET(key);
      const s = steps[pos];
      stage.textContent = "";
      holdBox.textContent = "";
      holdBox.hidden = !(s && s.hold != null);
      if (s.hold != null) holdBox.append("key = ", el("b", null, String(s.hold)));
      if (s.tree) {
        stage.className = "algo-stage tree";
        stage.appendChild(treeHtml(0));
      } else {
        stage.className = "algo-stage";
        const max = Math.max(...s.a);
        s.a.forEach((v, k) => {
          const col = el("div", "abar" + (s.cls[k] ? " " + s.cls[k] : ""));
          col.appendChild(el("div", "abar-v", String(v)));
          const bar = el("div", "abar-b");
          bar.style.height = 14 + (v / max) * 86 + "%";
          col.appendChild(bar);
          col.appendChild(el("div", "abar-i", String(k)));
          col.appendChild(el("div", "abar-t", s.tags[k] || ""));
          stage.appendChild(col);
        });
      }
      say.textContent = s.text;
      stats.textContent = "";
      if (s.tree) stats.append(chip("📞 шақыру: " + s.c));
      else if (A.kind === "sort") stats.append(chip("🔍 салыстыру: " + (s.c || 0)), chip("🔁 ауыстыру: " + (s.s || 0)));
      else stats.append(chip("🔍 тексеру: " + (s.c || 0)));
      codeBox.querySelectorAll(".cl").forEach((n) => n.classList.toggle("on", Number(n.dataset.n) === s.line));
      scrub.value = String(pos);
      scCount.textContent = pos + 1 + " / " + steps.length;
      bBack.disabled = pos <= 0;
      bNext.disabled = pos >= steps.length - 1;
      bPlay.textContent = timer ? "⏸ Тоқтату" : pos >= steps.length - 1 ? "▶ Қайта" : "▶ Қосу";
    }
    const chip = (t) => el("span", "algo-chip", t);

    function treeHtml(id) {
      const s = steps[pos];
      const node = fibTree.nodes[id];
      const box = el("div", "tnode");
      const isDone = s.done[id] != null;
      const lab = el("div", "tlab" + (s.active === id ? " active" : "") + (isDone ? " done" : ""));
      lab.textContent = "fib(" + node.n + ")" + (isDone ? " = " + s.done[id] : "");
      box.appendChild(lab);
      const kids = node.kids.filter((k) => k < s.upto);
      if (kids.length) {
        const row = el("div", "tkidsrow");
        kids.forEach((k) => row.appendChild(treeHtml(k)));
        box.appendChild(row);
      }
      return box;
    }

    function tick() {
      timer = null;
      if (!root.isConnected || location.hash.indexOf("#/algo") !== 0) return;
      if (pos >= steps.length - 1) return render();
      pos++;
      beep(steps[pos].snd);
      render();
      if (pos < steps.length - 1) timer = setTimeout(tick, [1400, 800, 420, 180][speed - 1]);
      render();
    }

    /* --- оқиғалар --- */
    ORDER.forEach((k) => {
      const b = el("button", "algo-chip-btn", GET(k).title);
      b.type = "button";
      b.dataset.k = k;
      b.addEventListener("click", () => {
        key = k;
        chips.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x.dataset.k === key));
        build();
      });
      chips.appendChild(b);
    });
    chips.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x.dataset.k === key));

    bPlay.addEventListener("click", () => {
      if (timer) {
        stop();
        return render();
      }
      if (pos >= steps.length - 1) pos = 0;
      render();
      timer = setTimeout(tick, 300);
      render();
    });
    bNext.addEventListener("click", () => {
      stop();
      if (pos < steps.length - 1) pos++;
      beep(steps[pos].snd);
      render();
    });
    bBack.addEventListener("click", () => {
      stop();
      if (pos > 0) pos--;
      render();
    });
    bReset.addEventListener("click", () => {
      stop();
      pos = 0;
      render();
    });
    scrub.addEventListener("input", () => {
      stop();
      pos = Number(scrub.value);
      render();
    });
    spIn.addEventListener("input", () => (speed = Number(spIn.value)));
    rnd.addEventListener("click", () => {
      values = randNums();
      target = values[Math.floor(Math.random() * values.length)];
      build();
    });
    apply.addEventListener("click", () => {
      const A = GET(key);
      if (A.kind === "tree") {
        const n = Number(fibIn.value);
        if (Number.isInteger(n) && n >= 2 && n <= 7) fibN = n;
      } else {
        const arr = parseNums(numIn.value);
        if (!arr) {
          say.textContent = "2-ден 14-ке дейін, 1–99 аралығындағы бүтін сандарды бос орынмен бөліп жаз.";
          return;
        }
        values = arr;
        const t = Number(tgtIn.value);
        if (Number.isInteger(t) && t >= 1 && t <= 99) target = t;
      }
      build();
    });
    [numIn, tgtIn, fibIn].forEach((i) => i.addEventListener("keydown", (e) => e.key === "Enter" && apply.click()));

    build();
  };
})();
