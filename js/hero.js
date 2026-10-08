/* Ботакод: оқушының өз кейіпкері (Бота-робот). Киімдер мен аксессуарлар жетістіктер мен серия арқылы ашылады.
   Күй: kodzholy.hero.v1 = { color, starters:[id], eq:{ slot: id } } */
(() => {
  "use strict";
  const { el, h } = KZ;
  const KEY = "kodzholy.hero.v1";
  const INK = "#1f1d36";
  const S = `stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;
  const S3 = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;

  const COLORS = [
    ["#ffd23f", "Сары"],
    ["#2ec4b6", "Жасыл-көгілдір"],
    ["#ff6b6b", "Қызыл"],
    ["#6c5ce7", "Күлгін"],
    ["#74b9ff", "Көк"],
    ["#ff9ff3", "Қызғылт"],
  ];

  const SLOTS = [
    { id: "hat", name: "Бас киім", e: "🎩" },
    { id: "face", name: "Көзілдірік", e: "🕶️" },
    { id: "neck", name: "Мойын", e: "🧣" },
    { id: "outfit", name: "Киім", e: "👕" },
    { id: "pin", name: "Белгі", e: "📌" },
    { id: "back", name: "Арқа", e: "🎒" },
    { id: "aura", name: "Серия ауасы", e: "🔥" },
  ];

  /* unlock: "start" (басында кездейсоқ беріледі), жетістік id-і, не { streak: N } (қазіргі серия N-ге жеткенде ғана көрінеді) */
  const ITEMS = [
    /* ---- бас киім ---- */
    { id: "cap", slot: "hat", n: "Қызыл кепка", unlock: "start", svg: () => `<path d="M26 40q0-20 34-20t34 20z" fill="#ff6b6b" ${S}/><path d="M70 40h34" ${S}/>` },
    { id: "beanie", slot: "hat", n: "Тоқыма бөрік", unlock: "start", svg: () => `<path d="M28 40q0-24 32-24t32 24z" fill="#6c5ce7" ${S}/><path d="M28 40h64" ${S}/><circle cx="60" cy="14" r="6" fill="#fff" ${S3}/>` },
    { id: "flower", slot: "hat", n: "Гүл", unlock: "start", svg: () => `<g ${S3}><circle cx="82" cy="30" r="6" fill="#ff9ff3"/><circle cx="92" cy="26" r="6" fill="#ff9ff3"/><circle cx="90" cy="36" r="6" fill="#ff9ff3"/><circle cx="82" cy="38" r="6" fill="#ff9ff3"/><circle cx="87" cy="31" r="4" fill="#ffd23f"/></g>` },
    { id: "party", slot: "hat", n: "Мереке қалпағы", unlock: "daily1", svg: () => `<path d="M40 38L60 0l20 38z" fill="#2ec4b6" ${S}/><path d="M47 26h26M52 14h16" stroke="#fff" stroke-width="4"/><circle cx="60" cy="0" r="5" fill="#ffd23f" ${S3}/>` },
    { id: "phones", slot: "hat", n: "Құлаққап", unlock: "streak3", svg: () => `<path d="M26 56q0-34 34-34t34 34" fill="none" ${S}/><rect x="16" y="50" width="14" height="26" rx="6" fill="#ff6b6b" ${S}/><rect x="90" y="50" width="14" height="26" rx="6" fill="#ff6b6b" ${S}/>` },
    { id: "wizard", slot: "hat", n: "Сиқыршы қалпағы", unlock: "lv30", svg: () => `<path d="M22 40h76l-30-40q-6-4-12 4z" fill="#6c5ce7" ${S}/><path d="M22 40h76" ${S}/><path d="M52 24l3 6 7-1-4 5 4 5-7-1-3 6-3-6-7 1 4-5-4-5 7 1z" fill="#ffd23f" stroke="${INK}" stroke-width="2"/>` },
    { id: "crown", slot: "hat", n: "Тәж", unlock: "perfect30", svg: () => `<path d="M30 38l-4-26 18 12 16-18 16 18 18-12-4 26z" fill="#ffd23f" ${S}/><circle cx="60" cy="26" r="4" fill="#ff6b6b" stroke="${INK}" stroke-width="2"/>` },
    { id: "helmet", slot: "hat", n: "Ғарышкер дулыға", unlock: "lv60", svg: () => `<path d="M20 60q-4-52 40-52t40 52" fill="rgba(180,225,255,.55)" ${S}/><path d="M32 22q10-8 22-8" stroke="#fff" stroke-width="4" fill="none"/>` },
    /* ---- көзілдірік ---- */
    { id: "round", slot: "face", n: "Дөңгелек көзілдірік", unlock: "start", svg: () => `<circle cx="48" cy="58" r="13" fill="rgba(255,255,255,.25)" ${S3}/><circle cx="72" cy="58" r="13" fill="rgba(255,255,255,.25)" ${S3}/><path d="M61 58h-2" ${S3}/>` },
    { id: "sun", slot: "face", n: "Күннен қорғайтын", unlock: "start", svg: () => `<path d="M32 50h56v8q0 10-12 10t-12-10h-8q0 10-12 10t-12-10z" fill="#1f1d36" ${S3}/>` },
    { id: "visor", slot: "face", n: "Жасыл визор", unlock: "lv10", svg: () => `<rect x="30" y="48" width="60" height="20" rx="8" fill="rgba(46,196,182,.75)" ${S3}/><path d="M38 54h12" stroke="#fff" stroke-width="3"/>` },
    { id: "starshade", slot: "face", n: "Жұлдыз көзілдірік", unlock: "perfect10", svg: () => `<g fill="#ffd23f" ${S3}><path d="M48 44l4 9 10 1-8 6 3 10-9-6-9 6 3-10-8-6 10-1z"/><path d="M72 44l4 9 10 1-8 6 3 10-9-6-9 6 3-10-8-6 10-1z"/></g>` },
    { id: "monocle", slot: "face", n: "Монокль", unlock: "bug10", svg: () => `<circle cx="72" cy="58" r="14" fill="rgba(255,255,255,.3)" ${S3}/><path d="M84 66q10 14 4 26" fill="none" ${S3}/>` },
    { id: "lens", slot: "face", n: "Лупа", unlock: "bug1", svg: () => `<circle cx="74" cy="58" r="14" fill="rgba(255,255,255,.3)" ${S3}/><path d="M84 68l14 18" ${S}/>` },
    /* ---- мойын ---- */
    { id: "scarf", slot: "neck", n: "Қызыл шарф", unlock: "start", svg: () => `<path d="M36 90q24 12 48 0l2 10q-26 12-52 0z" fill="#ff6b6b" ${S3}/><path d="M72 98l6 20 10-4-6-18z" fill="#ff6b6b" ${S3}/>` },
    { id: "bow", slot: "neck", n: "Көбелек галстук", unlock: "start", svg: () => `<path d="M60 96l-14-8v16zM60 96l14-8v16z" fill="#6c5ce7" ${S3}/><circle cx="60" cy="96" r="4" fill="#fff" ${S3}/>` },
    { id: "tie", slot: "neck", n: "Галстук", unlock: "poly", svg: () => `<path d="M54 92h12l4 8-10 22-10-22z" fill="#2ec4b6" ${S3}/>` },
    { id: "medal", slot: "neck", n: "Жеңімпаз медалі", unlock: "bonus1", svg: () => `<path d="M48 90l12 20 12-20" fill="none" stroke="#ff6b6b" stroke-width="5"/><circle cx="60" cy="116" r="9" fill="#ffd23f" ${S3}/><path d="M60 111v10" ${S3}/>` },
    /* ---- киім ---- */
    { id: "tee_blue", slot: "outfit", n: "Көк футболка", unlock: "start", svg: () => `<rect x="38" y="94" width="44" height="32" rx="10" fill="#74b9ff" ${S}/>` },
    { id: "tee_green", slot: "outfit", n: "Жасыл футболка", unlock: "start", svg: () => `<rect x="38" y="94" width="44" height="32" rx="10" fill="#55efc4" ${S}/><path d="M48 106h24" stroke="#fff" stroke-width="4"/>` },
    { id: "hoodie", slot: "outfit", n: "Худи", unlock: "lv10", svg: () => `<rect x="36" y="92" width="48" height="36" rx="12" fill="#a29bfe" ${S}/><path d="M48 94q12 12 24 0" fill="none" ${S3}/><rect x="50" y="110" width="20" height="10" rx="4" fill="#8e86f0" ${S3}/>` },
    { id: "overall", slot: "outfit", n: "Комбинезон", unlock: "daily7", svg: () => `<rect x="38" y="94" width="44" height="32" rx="10" fill="#2d7dd2" ${S}/><path d="M46 94v-6M74 94v-6" ${S}/><rect x="52" y="106" width="16" height="10" rx="3" fill="#1b5aa0" ${S3}/>` },
    { id: "hero_suit", slot: "outfit", n: "Батыр костюмы", unlock: "streak7", svg: () => `<rect x="38" y="94" width="44" height="32" rx="10" fill="#ff6b6b" ${S}/><path d="M60 100l5 9 10 1-8 6 2 9-9-5-9 5 2-9-8-6 10-1z" fill="#ffd23f" stroke="${INK}" stroke-width="2"/>` },
    { id: "tux", slot: "outfit", n: "Смокинг", unlock: "lv60", svg: () => `<rect x="38" y="94" width="44" height="32" rx="10" fill="#2f2b4d" ${S}/><path d="M60 94v32M52 94l8 14 8-14" fill="#fff" ${S3}/>` },
    /* ---- белгі (курс бітіргенде) ---- */
    ...[
      ["python", "🐍", "Python"],
      ["html", "🌐", "HTML"],
      ["css", "🎨", "CSS"],
      ["javascript", "⚡", "JavaScript"],
      ["projects", "🚀", "Жобалар"],
      ["sql", "🗄️", "SQL"],
    ].map(([c, e, n]) => ({ id: "pin_" + c, slot: "pin", n: n + " белгісі", unlock: "done_" + c, svg: () => `<circle cx="72" cy="108" r="9" fill="#fff" ${S3}/><text x="72" y="113" font-size="12" text-anchor="middle">${e}</text>` })),
    { id: "star_pin", slot: "pin", n: "Алтын жұлдыз", unlock: "first", svg: () => `<path d="M72 98l3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z" fill="#ffd23f" stroke="${INK}" stroke-width="2.5"/>` },
    { id: "bug_pin", slot: "pin", n: "Қате аулаушы", unlock: "bug1", svg: () => `<circle cx="72" cy="108" r="9" fill="#fff" ${S3}/><text x="72" y="113" font-size="12" text-anchor="middle">🐞</text>` },
    /* ---- арқа ---- */
    { id: "pack", slot: "back", n: "Рюкзак", unlock: "start", back: true, svg: () => `<rect x="30" y="94" width="60" height="32" rx="10" fill="#e17055" ${S}/>` },
    { id: "book", slot: "back", n: "Кітап", unlock: "reader", back: true, svg: () => `<rect x="82" y="96" width="22" height="28" rx="3" fill="#74b9ff" ${S3}/><path d="M86 104h14M86 110h14" stroke="#fff" stroke-width="3"/>` },
    { id: "cape", slot: "back", n: "Батыр жапқышы", unlock: "streak7", back: true, svg: () => `<path d="M34 92L14 134h92L86 92z" fill="#e84393" ${S}/>` },
    { id: "wings", slot: "back", n: "Қанаттар", unlock: "streak30", back: true, svg: () => `<path d="M40 100Q6 96 2 58q14 2 22 12-4-16 4-26 10 10 12 24 2-10 10-14 6 22-10 46z" fill="#dff3ff" ${S3}/><path d="M80 100q34-4 38-42-14 2-22 12 4-16-4-26-10 10-12 24-2-10-10-14-6 22 10 46z" fill="#dff3ff" ${S3}/>` },
    { id: "sparkle", slot: "back", n: "Жарқыл", unlock: "perfect10", back: true, svg: () => `<g fill="#ffd23f" stroke="${INK}" stroke-width="2"><path d="M14 40l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/><path d="M106 70l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/></g>` },
    /* ---- серия ауасы (серия тірі болғанда ғана көрінеді) ---- */
    { id: "flame", slot: "aura", n: "Жалын ауасы", unlock: { streak: 3 }, back: true, svg: () => `<g opacity=".9"><path d="M60 140q-50 0-44-40 4-22 18-34-2 16 8 22 0-26 18-46 18 20 18 46 10-6 8-22 14 12 18 34 6 40-44 40z" fill="#ff9f43" ${S3}/><path d="M60 140q-34 0-30-28 4-14 12-20 0 12 8 14 0-16 10-28 10 12 10 28 8-2 8-14 8 6 12 20 4 28-30 28z" fill="#ffd23f"/></g>` },
    { id: "bolt", slot: "aura", n: "Найзағай ауасы", unlock: { streak: 7 }, back: true, svg: () => `<g fill="#ffe66d" ${S3}><path d="M10 36l14 4-8 12 14 4-18 20 4-16-12-4z"/><path d="M104 48l12 4-6 10 12 4-16 18 3-14-10-4z"/></g>` },
    { id: "galaxy", slot: "aura", n: "Галактика ауасы", unlock: { streak: 30 }, back: true, svg: () => `<circle cx="60" cy="80" r="58" fill="rgba(108,92,231,.35)" stroke="#a29bfe" stroke-width="3" stroke-dasharray="3 7"/><g fill="#fff"><circle cx="16" cy="60" r="2.5"/><circle cx="104" cy="40" r="2.5"/><circle cx="100" cy="112" r="2"/><circle cx="20" cy="112" r="2"/></g>` },
  ];
  const BYID = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
  const STARTERS_N = 4;
  let gradN = 0;
  /* екі HEX түсті араластыру (t: екінші түстің үлесі) */
  function mix(a, b, t) {
    const p = (x, i) => parseInt(x.slice(1 + i * 2, 3 + i * 2), 16);
    const o = [0, 1, 2].map((i) => Math.round(p(a, i) * (1 - t) + p(b, i) * t));
    return "#" + o.map((v) => v.toString(16).padStart(2, "0")).join("");
  }

  /* ---------- Күй ---------- */
  const load = () => {
    const s = KZ.store.get(KEY, null);
    return s && typeof s === "object" ? s : null;
  };
  function ensure() {
    let s = load();
    if (s && Array.isArray(s.starters)) return s;
    const pool = ITEMS.filter((i) => i.unlock === "start");
    const pick = pool.slice().sort(() => Math.random() - 0.5).slice(0, STARTERS_N);
    s = { color: COLORS[Math.floor(Math.random() * COLORS.length)][0], starters: pick.map((i) => i.id), eq: {} };
    // әр слотқа басында бір затты кигіземіз
    pick.forEach((i) => {
      if (!s.eq[i.slot]) s.eq[i.slot] = i.id;
    });
    KZ.store.set(KEY, s);
    return s;
  }
  const save = (s) => KZ.store.set(KEY, s);

  const need = (i) => {
    const u = i.unlock;
    if (u === "start") return "Бастапқы жиынтықта кездейсоқ беріледі";
    if (typeof u === "object") return "Серия " + u.streak + " күнге жеткенде ғана көрінеді";
    const a = KZ.ach.defs().find((x) => x.id === u);
    return a ? "Жетістік: " + a.t : "Жетістік арқылы ашылады";
  };
  const hero = (KZ.hero = {
    items: ITEMS,
    slots: SLOTS,
    colors: COLORS,
    state: ensure,
    need,
    owned(i, s) {
      s = s || ensure();
      const u = i.unlock;
      if (u === "start") return s.starters.includes(i.id);
      if (typeof u === "object") return hero.bestStreak() >= u.streak;
      return !!KZ.ach.unlocked()[u];
    },
    bestStreak: () => (KZ.activity ? KZ.activity.best() : 0),
    /* серия ауасы тек қазіргі серия жеткілікті болғанда көрінеді */
    visible(i) {
      if (typeof i.unlock === "object") return KZ.activity.streak().n >= i.unlock.streak;
      return true;
    },
    equip(slot, id) {
      const s = ensure();
      if (id == null) delete s.eq[slot];
      else s.eq[slot] = id;
      save(s);
    },
    setColor(c) {
      const s = ensure();
      s.color = c;
      save(s);
    },
    /* SVG жолы. opts: { eq, color, preview, still } */
    svg(opts) {
      const s = opts && opts.eq ? opts : ensure();
      const c = s.color || "#ffd23f";
      const eq = s.eq || {};
      const uid = "hg" + ++gradN;
      const defs = {};
      /* түс -> жоғарыдан төмен градиент (2.5D көлем) */
      const grad = (hex) => {
        const k = hex.slice(1);
        if (!defs[k]) defs[k] = `<linearGradient id="${uid}${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(hex, "#ffffff", 0.38)}"/><stop offset=".55" stop-color="${hex}"/><stop offset="1" stop-color="${mix(hex, "#1f1d36", 0.28)}"/></linearGradient>`;
        return `url(#${uid}${k})`;
      };
      const skin = (str) => str.replace(/fill="(#[0-9a-fA-F]{6})"/g, (m, hx) => `fill="${grad(hx)}"`);
      const get = (slot) => {
        const it = BYID[eq[slot]];
        return it && it.slot === slot && (s.preview || hero.visible(it)) ? it : null;
      };
      const draw = (it) => skin(it.svg(c));
      const auras = get("aura");
      const back = get("back");
      const dark = mix(c, "#1f1d36", 0.3);
      const P = [];
      P.push(`<ellipse cx="60" cy="140" rx="34" ry="6" fill="#1f1d36" opacity=".18"/>`);
      if (auras) P.push(`<g class="hf-aura">${draw(auras)}</g>`);
      P.push('<g class="hf-bob">');
      if (back && back.back) P.push(draw(back));
      // аяқтар
      P.push(`<ellipse cx="47" cy="130" rx="12" ry="7" fill="${dark}" ${S}/><ellipse cx="73" cy="130" rx="12" ry="7" fill="${dark}" ${S}/>`);
      // сол қол (қозғалмайды), оң қол (бұлғайды)
      P.push(`<path d="M40 102q-10 8-14 16" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M40 102q-10 8-14 16" fill="none" stroke="${dark}" stroke-width="6" stroke-linecap="round"/>`);
      P.push(`<g class="hf-arm"><path d="M80 102q10 8 14 16" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M80 102q10 8 14 16" fill="none" stroke="${dark}" stroke-width="6" stroke-linecap="round"/></g>`);
      // дене
      const outfit = get("outfit");
      P.push(outfit ? draw(outfit) : skin(`<rect x="38" y="94" width="44" height="34" rx="14" fill="${c}" ${S}/>`));
      P.push(`<ellipse cx="50" cy="104" rx="6" ry="3.5" fill="#fff" opacity=".35"/>`);
      const neck = get("neck");
      if (neck) P.push(draw(neck));
      const pin = get("pin");
      if (pin) P.push(draw(pin));
      // бас: антенна, құлақтар, бет, экран, көз, ауыз
      P.push(`<g class="hf-ant"><path d="M60 30V15" ${S}/><circle cx="60" cy="12" r="7" fill="#ff6b6b" ${S3}/><circle cx="57.5" cy="9.5" r="2.4" fill="#fff" opacity=".8"/></g>`);
      P.push(`<rect x="15" y="52" width="12" height="24" rx="6" fill="${dark}" ${S3}/><rect x="93" y="52" width="12" height="24" rx="6" fill="${dark}" ${S3}/>`);
      P.push(skin(`<rect x="25" y="30" width="70" height="62" rx="24" fill="${c}" ${S}/>`));
      P.push(`<path d="M33 42q4-8 16-8" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55"/>`);
      P.push(`<rect x="32" y="42" width="56" height="38" rx="17" fill="#fffdf5" ${S3}/><rect x="32" y="64" width="56" height="16" rx="12" fill="#1f1d36" opacity=".06"/>`);
      P.push(`<g class="hf-eyes"><ellipse cx="48" cy="58" rx="7" ry="9" fill="${INK}"/><ellipse cx="72" cy="58" rx="7" ry="9" fill="${INK}"/><circle cx="50.5" cy="54" r="2.8" fill="#fff"/><circle cx="74.5" cy="54" r="2.8" fill="#fff"/><circle cx="46.5" cy="62" r="1.3" fill="#fff" opacity=".8"/><circle cx="70.5" cy="62" r="1.3" fill="#fff" opacity=".8"/></g>`);
      P.push(`<ellipse cx="38" cy="70" rx="5" ry="3" fill="#ff8fa3" opacity=".6"/><ellipse cx="82" cy="70" rx="5" ry="3" fill="#ff8fa3" opacity=".6"/>`);
      P.push(`<path class="hf-m1" d="M52 71q8 6 16 0" fill="none" ${S3}/><path class="hf-m2" d="M50 69h20q-1 12-10 12t-10-12z" fill="#ff6b6b" ${S3}/>`);
      const face = get("face");
      if (face) P.push(draw(face));
      const hat = get("hat");
      if (hat) P.push(draw(hat));
      P.push("</g>");
      const defsStr = Object.values(defs).join("");
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -8 132 156" role="img" aria-label="Бота кейіпкері"><defs>${defsStr}</defs>${P.join("")}</svg>`;
    },
    /* Қуану: барлық көрінетін кейіпкер секіріп, күлімдейді */
    cheer() {
      document.querySelectorAll(".hero-fig").forEach((f) => {
        f.classList.add("cheer");
        setTimeout(() => f.classList.remove("cheer"), 1100);
      });
    },
    /* DOM элементі */
    node(cls) {
      const d = el("span", "hero-fig" + (cls ? " " + cls : ""));
      d.innerHTML = hero.svg();
      d.addEventListener("click", () => hero.cheer());
      return d;
    },
    /* Жаңа ашылған заттарды хабарлау үшін: жетістіктен кейін қайсы зат ашылды */
    newFor(achIds) {
      return ITEMS.filter((i) => typeof i.unlock === "string" && achIds.includes(i.unlock));
    },
  });

  /* ---------- Гардероб беті ---------- */
  KZ.heroPage = function (root) {
    root.textContent = "";
    if (KZ.ach) KZ.ach.check(true);
    const s = ensure();
    const page = el("div", "page");
    const back = h("a", "back", "← Басты бет");
    back.href = "#/";
    page.appendChild(back);
    page.appendChild(h("h1", null, "🎽 Менің кейіпкерім"));
    page.appendChild(h("p", "hint", "Бота — сенің кейіпкерің. Басында бірнеше зат кездейсоқ беріледі, ал қалғандарын жетістіктер мен күн сериясы арқылы ашасың."));
    const stage = el("section", "card hero-stage");
    const fig = el("div", "hero-big");
    stage.appendChild(fig);
    const wrap = el("div", "hero-ctl");
    stage.appendChild(wrap);
    page.appendChild(stage);
    const redraw = () => {
      fig.innerHTML = hero.svg();
      sw.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.c === ensure().color));
      lists.querySelectorAll(".item").forEach((b) => b.classList.toggle("on", ensure().eq[b.dataset.slot] === b.dataset.id));
      lists.querySelectorAll(".none").forEach((b) => b.classList.toggle("on", !ensure().eq[b.dataset.slot]));
    };
    wrap.appendChild(h("b", null, "Түсі"));
    const sw = el("div", "hero-sw");
    COLORS.forEach(([c, n]) => {
      const b = el("button", "swatch");
      b.type = "button";
      b.dataset.c = c;
      b.style.background = c;
      b.title = n;
      b.setAttribute("aria-label", n);
      b.addEventListener("click", () => {
        hero.setColor(c);
        redraw();
      });
      sw.appendChild(b);
    });
    wrap.appendChild(sw);
    const sa = KZ.activity.streak().n;
    wrap.appendChild(h("small", null, "🔥 Қазіргі серия: " + sa + " күн · ең ұзағы: " + KZ.activity.best()));
    const lists = el("div", "hero-lists");
    const have = ITEMS.filter((i) => hero.owned(i, s)).length;
    page.appendChild(h("h2", "section-title", "Гардероб · " + have + " / " + ITEMS.length));
    SLOTS.forEach((sl) => {
      const sec = el("section", "card hero-slot");
      sec.appendChild(h("h3", null, sl.e + " " + sl.name));
      const grid = el("div", "hero-grid");
      const none = el("button", "hero-item none");
      none.type = "button";
      none.dataset.slot = sl.id;
      none.appendChild(h("span", "hi-fig", "∅"));
      none.appendChild(h("small", null, "Жоқ"));
      none.addEventListener("click", () => {
        hero.equip(sl.id, null);
        redraw();
      });
      grid.appendChild(none);
      ITEMS.filter((i) => i.slot === sl.id).forEach((i) => {
        const ok = hero.owned(i, s);
        const b = el("button", "hero-item item" + (ok ? "" : " locked"));
        b.type = "button";
        b.dataset.slot = sl.id;
        b.dataset.id = i.id;
        const f = el("span", "hi-fig");
        // алдын ала көру: сол заттың өзі киілген кейіпкер
        f.innerHTML = ok ? hero.svg({ color: ensure().color, eq: { [sl.id]: i.id }, preview: true }) : "🔒";
        b.append(f, h("small", null, i.n));
        if (!ok) b.title = need(i);
        b.addEventListener("click", () => {
          if (!ok) {
            KZ.toast("🔒", i.n, need(i));
            return;
          }
          hero.equip(sl.id, i.id);
          redraw();
        });
        if (!ok) b.appendChild(h("small", "hi-need", need(i)));
        grid.appendChild(b);
      });
      sec.appendChild(grid);
      lists.appendChild(sec);
    });
    page.appendChild(lists);
    root.appendChild(page);
    redraw();
  };

  /* Тапсырма шешілгенде кейіпкер қуанады */
  if (KZ.progress && !KZ.progress._heroWrapped) {
    const set0 = KZ.progress.set;
    KZ.progress.set = function (cid, lid, n) {
      const r = set0.apply(this, arguments);
      if (n > 0) setTimeout(() => hero.cheer(), 50);
      return r;
    };
    KZ.progress._heroWrapped = true;
  }

  /* Жаңа жетістік ашылғанда, онымен бірге ашылған затты да хабарлау */
  if (KZ.ach && KZ.ach.check && !KZ.ach._heroWrapped) {
    const orig = KZ.ach.check;
    KZ.ach.check = function (silent) {
      const fresh = orig.call(this, silent);
      if (!silent && fresh && fresh.length) {
        const items = hero.newFor(fresh.map((a) => a.id));
        hero.cheer();
        if (items.length) setTimeout(() => KZ.toast("🎁", "Жаңа зат: " + items.map((i) => i.n).join(", "), "Кейіпкер бетінде киіп көр"), 900);
      }
      return fresh;
    };
    KZ.ach._heroWrapped = true;
  }
})();
