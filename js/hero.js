/* Bitlings: оқушының өз кейіпкері (Бит: < > құлақты желе-кейіпкер). Киімдер мен аксессуарлар жетістіктер мен серия арқылы ашылады.
   Күй: kodzholy.hero.v1 = { color, starters:[id], eq:{ slot: id } } */
(() => {
  "use strict";
  const { el, h } = KZ;
  const KEY = "kodzholy.hero.v1";
  const INK = "#1f1d36";
  const S = `stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;
  const S3 = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;

  const COLORS = [
    ["#6c5ce7", "Күлгін"],
    ["#2ec4b6", "Жасыл-көгілдір"],
    ["#ff6b6b", "Қызыл"],
    ["#ffa94d", "Қызғылт сары"],
    ["#4dabf7", "Көк"],
    ["#f783ac", "Қызғылт"],
    ["#51cf66", "Жасыл"],
    ["#495057", "Графит"],
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

  /* Биттің пішіні (координаттар 0..200 x 0..220) */
  const BODY = "M100 70C150 70 162 86 162 130C162 178 150 198 100 198C50 198 38 178 38 130C38 86 50 70 100 70Z";
  const OUT = "M40 162C42 186 58 198 100 198C142 198 158 186 160 162Q100 182 40 162Z"; // дененің төменгі жартысы (киім)
  const star = (cx, cy, r) => {
    const p = [];
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI / 5) * i - Math.PI / 2;
      const rr = i % 2 ? r * 0.45 : r;
      p.push((cx + rr * Math.cos(a)).toFixed(1) + " " + (cy + rr * Math.sin(a)).toFixed(1));
    }
    return "M" + p.join("L") + "Z";
  };
  const pinBadge = (txt) => `<circle cx="138" cy="176" r="12" fill="#ffffff" ${S3}/><text x="138" y="181" font-size="13" text-anchor="middle">${txt}</text>`;

  /* unlock: "start" (басында кездейсоқ беріледі), жетістік id-і, не { streak: N } (қазіргі серия N-ге жеткенде ғана көрінеді) */
  const ITEMS = [
    /* ---- бас киім ---- */
    { id: "cap", slot: "hat", n: "Қызыл кепка", unlock: "start", svg: () => `<path d="M50 86C50 50 72 38 100 38C128 38 150 50 150 86Z" fill="#ff6b6b" ${S}/><path d="M112 84Q150 76 184 88Q152 98 112 92Z" fill="#e8504f" ${S}/><circle cx="100" cy="38" r="5" fill="#e8504f" ${S3}/>` },
    { id: "beanie", slot: "hat", n: "Тоқыма бөрік", unlock: "start", svg: () => `<path d="M52 84C52 44 74 30 100 30C126 30 148 44 148 84Z" fill="#ffa94d" ${S}/><rect x="46" y="76" width="108" height="18" rx="9" fill="#ff922b" ${S}/><path d="M68 80v10M84 80v10M100 80v10M116 80v10M132 80v10" stroke="#ffd8a8" stroke-width="3"/><circle cx="100" cy="26" r="11" fill="#ffffff" ${S}/>` },
    { id: "flower", slot: "hat", n: "Гүл", unlock: "start", svg: () => `<g ${S3}><circle cx="138" cy="66" r="9" fill="#f783ac"/><circle cx="152" cy="74" r="9" fill="#f783ac"/><circle cx="148" cy="88" r="9" fill="#f783ac"/><circle cx="132" cy="86" r="9" fill="#f783ac"/><circle cx="128" cy="72" r="9" fill="#f783ac"/><circle cx="140" cy="78" r="6" fill="#ffd23f"/></g>` },
    { id: "party", slot: "hat", n: "Мереке қалпағы", unlock: "daily1", svg: () => `<path d="M74 82L100 14L126 82Z" fill="#2ec4b6" ${S}/><path d="M84 58h32M92 36h16" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="14" r="8" fill="#ffd23f" ${S3}/>` },
    { id: "phones", slot: "hat", n: "Құлаққап", unlock: "streak3", svg: () => `<path d="M34 112C34 46 166 46 166 112" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M34 112C34 46 166 46 166 112" fill="none" stroke="#495057" stroke-width="6" stroke-linecap="round"/><rect x="18" y="100" width="26" height="44" rx="12" fill="#ff6b6b" ${S}/><rect x="156" y="100" width="26" height="44" rx="12" fill="#ff6b6b" ${S}/>` },
    { id: "wizard", slot: "hat", n: "Сиқыршы қалпағы", unlock: "lv30", svg: () => `<ellipse cx="100" cy="82" rx="68" ry="13" fill="#5f3dc4" ${S}/><path d="M62 80L104 4Q112 -2 116 8L140 80Z" fill="#7048e8" ${S}/><path d="${star(104, 52, 11)}" fill="#ffd23f" stroke="${INK}" stroke-width="2.5"/>` },
    { id: "crown", slot: "hat", n: "Тәж", unlock: "perfect30", svg: () => `<path d="M58 84L50 36L78 58L100 26L122 58L150 36L142 84Z" fill="#ffd23f" ${S}/><circle cx="100" cy="66" r="7" fill="#ff6b6b" ${S3}/><circle cx="74" cy="72" r="4.5" fill="#4dabf7" ${S3}/><circle cx="126" cy="72" r="4.5" fill="#51cf66" ${S3}/>` },
    { id: "helmet", slot: "hat", n: "Ғарышкер дулыға", unlock: "lv60", svg: () => `<path d="M22 154C14 64 58 26 100 26C142 26 186 64 178 154Z" fill="rgba(165,216,255,.42)" ${S}/><path d="M46 70Q62 44 92 38" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" opacity=".8"/>` },
    { id: "takiya", slot: "hat", n: "Тақия", unlock: "start", svg: () => `<path d="M56 84C56 50 76 38 100 38C124 38 144 50 144 84Q100 94 56 84Z" fill="#c92a2a" ${S}/><path d="M62 76Q100 84 138 76" fill="none" stroke="#ffd23f" stroke-width="3.5"/><path d="M86 56Q92 48 100 56Q108 48 114 56M92 64Q100 70 108 64" fill="none" stroke="#ffd23f" stroke-width="3" stroke-linecap="round"/>` },
    { id: "borik", slot: "hat", n: "Бөрік", unlock: "streak7", svg: () => `<path d="M62 78C62 44 80 30 100 30C120 30 138 44 138 78Z" fill="#c92a2a" ${S}/><path d="M48 86Q48 64 100 64Q152 64 152 86Q152 100 100 100Q48 100 48 86Z" fill="#8d6e63" ${S}/><path d="M100 30L94 12M100 30L104 10M100 30L110 14" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>` },
    /* ---- көзілдірік (көздер: 80/120, 126) ---- */
    { id: "round", slot: "face", n: "Дөңгелек көзілдірік", unlock: "start", svg: () => `<circle cx="79" cy="126" r="20" fill="rgba(255,255,255,.22)" ${S}/><circle cx="121" cy="126" r="20" fill="rgba(255,255,255,.22)" ${S}/><path d="M99 124h2M59 120L42 112M141 120L158 112" ${S}/>` },
    { id: "sun", slot: "face", n: "Күннен қорғайтын", unlock: "start", svg: () => `<path d="M52 110H148V124Q148 146 126 146Q104 146 104 128H96Q96 146 74 146Q52 146 52 124Z" fill="#212529" ${S}/><path d="M60 118L72 118M110 118L122 118" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" opacity=".7"/><path d="M52 114L40 108M148 114L160 108" ${S}/>` },
    { id: "visor", slot: "face", n: "Жасыл визор", unlock: "lv10", svg: () => `<rect x="48" y="108" width="104" height="36" rx="16" fill="rgba(46,196,182,.78)" ${S}/><path d="M60 118h22" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity=".8"/>` },
    { id: "starshade", slot: "face", n: "Жұлдыз көзілдірік", unlock: "perfect10", svg: () => `<path d="${star(79, 126, 22)}" fill="#ffd23f" ${S3}/><path d="${star(121, 126, 22)}" fill="#ffd23f" ${S3}/><path d="M96 126h8" ${S3}/>` },
    { id: "monocle", slot: "face", n: "Монокль", unlock: "bug10", svg: () => `<circle cx="121" cy="126" r="21" fill="rgba(255,255,255,.25)" ${S}/><path d="M140 136Q160 160 148 186" fill="none" stroke="#fab005" stroke-width="3"/>` },
    { id: "lens", slot: "face", n: "Лупа", unlock: "bug1", svg: () => `<path d="M138 144L166 178" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M138 144L166 178" stroke="#8d6e63" stroke-width="7" stroke-linecap="round"/><circle cx="122" cy="126" r="22" fill="rgba(165,216,255,.35)" ${S}/>` },
    /* ---- мойын (иек астында) ---- */
    { id: "scarf", slot: "neck", n: "Қызыл шарф", unlock: "start", svg: () => `<path d="M42 160Q100 182 158 160L160 174Q100 198 40 174Z" fill="#ff6b6b" ${S}/><path d="M118 178L126 208L144 202L136 174Z" fill="#e8504f" ${S}/>` },
    { id: "bow", slot: "neck", n: "Көбелек галстук", unlock: "start", svg: () => `<path d="M100 172L78 160V184ZM100 172L122 160V184Z" fill="#f783ac" ${S}/><circle cx="100" cy="172" r="6" fill="#ffffff" ${S3}/>` },
    { id: "tie", slot: "neck", n: "Галстук", unlock: "poly", svg: () => `<path d="M92 164H108L112 174L100 202L88 174Z" fill="#2ec4b6" ${S}/>` },
    { id: "medal", slot: "neck", n: "Жеңімпаз медалі", unlock: "bonus1", svg: () => `<path d="M76 160L100 184L124 160" fill="none" stroke="#ff6b6b" stroke-width="7"/><circle cx="100" cy="188" r="12" fill="#ffd23f" ${S}/><path d="${star(100, 188, 6)}" fill="#fab005"/>` },
    { id: "tumar", slot: "neck", n: "Тұмар", unlock: "start", svg: () => `<path d="M72 158Q100 178 128 158" fill="none" stroke="#c92a2a" stroke-width="3.5"/><path d="M100 168L113 181L100 194L87 181Z" fill="#ffd23f" ${S}/><circle cx="100" cy="181" r="3" fill="#c92a2a"/>` },
    /* ---- киім (дененің төменгі жағы) ---- */
    { id: "tee_blue", slot: "outfit", n: "Көк футболка", unlock: "start", svg: () => `<path d="${OUT}" fill="#4dabf7" ${S}/>` },
    { id: "tee_green", slot: "outfit", n: "Жасыл футболка", unlock: "start", svg: () => `<path d="${OUT}" fill="#51cf66" ${S}/><path d="M58 184H142" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity=".85"/>` },
    { id: "hoodie", slot: "outfit", n: "Худи", unlock: "lv10", svg: () => `<path d="${OUT}" fill="#9775fa" ${S}/><rect x="80" y="180" width="40" height="13" rx="6" fill="#845ef7" ${S3}/><path d="M90 172V180M110 172V180" ${S3}/>` },
    { id: "overall", slot: "outfit", n: "Комбинезон", unlock: "daily7", svg: () => `<path d="M58 168L52 150M142 168L148 150" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><path d="M58 168L52 150M142 168L148 150" stroke="#1971c2" stroke-width="5" stroke-linecap="round"/><path d="${OUT}" fill="#1c7ed6" ${S}/><rect x="86" y="180" width="28" height="13" rx="4" fill="#1864ab" ${S3}/>` },
    { id: "hero_suit", slot: "outfit", n: "Батыр костюмы", unlock: "streak7", svg: () => `<path d="${OUT}" fill="#fa5252" ${S}/><path d="${star(100, 184, 11)}" fill="#ffd23f" stroke="${INK}" stroke-width="2.5"/>` },
    { id: "tux", slot: "outfit", n: "Смокинг", unlock: "lv60", svg: () => `<path d="${OUT}" fill="#343a40" ${S}/><path d="M86 172L100 196L114 172Q100 176 86 172Z" fill="#ffffff" ${S3}/><path d="M100 178L92 173V183ZM100 178L108 173V183Z" fill="#c92a2a"/>` },
    { id: "kamzol", slot: "outfit", n: "Камзол", unlock: "start", svg: () => `<path d="${OUT}" fill="#2b8a3e" ${S}/><path d="M90 173Q100 174 110 173V198H90Z" fill="#fff4e6" ${S3}/><path d="M58 182Q64 176 70 182Q76 188 82 182M118 182Q124 176 130 182Q136 188 142 182" fill="none" stroke="#ffd23f" stroke-width="3" stroke-linecap="round"/>` },
    { id: "shapan", slot: "outfit", n: "Шапан", unlock: "done_python", svg: () => `<path d="${OUT}" fill="#862e9c" ${S}/><path d="M44 166Q100 184 156 166" fill="none" stroke="#ffd23f" stroke-width="4"/><path d="M100 176V198" ${S3}/><path d="M62 190Q68 184 74 190M126 190Q132 184 138 190" fill="none" stroke="#ffd23f" stroke-width="3" stroke-linecap="round"/>` },
    /* ---- белгі (курс бітіргенде) ---- */
    ...[
      ["python", "🐍", "Python"],
      ["html", "🌐", "HTML"],
      ["css", "🎨", "CSS"],
      ["javascript", "⚡", "JavaScript"],
      ["kotlin", "🟣", "Kotlin"],
      ["projects", "🚀", "Жобалар"],
      ["sql", "🗄️", "SQL"],
    ].map(([c, e, n]) => ({ id: "pin_" + c, slot: "pin", n: n + " белгісі", unlock: "done_" + c, svg: () => pinBadge(e) })),
    { id: "star_pin", slot: "pin", n: "Алтын жұлдыз", unlock: "first", svg: () => `<path d="${star(138, 176, 12)}" fill="#ffd23f" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>` },
    { id: "bug_pin", slot: "pin", n: "Қате аулаушы", unlock: "bug1", svg: () => pinBadge("🐞") },
    { id: "oyu_pin", slot: "pin", n: "Ою белгісі", unlock: "reader", svg: () => `<circle cx="138" cy="176" r="12" fill="#c92a2a" ${S3}/><path d="M138 168Q131 172 135 176Q131 180 138 184M138 168Q145 172 141 176Q145 180 138 184" fill="none" stroke="#ffd23f" stroke-width="2.5"/>` },
    /* ---- арқа ---- */
    { id: "pack", slot: "back", n: "Рюкзак", unlock: "start", back: true, svg: () => `<rect x="22" y="112" width="156" height="78" rx="26" fill="#ff922b" ${S}/><path d="M60 92Q52 130 60 168M140 92Q148 130 140 168" fill="none" stroke="${INK}" stroke-width="5"/>` },
    { id: "book", slot: "back", n: "Кітап", unlock: "reader", back: true, svg: () => `<rect x="150" y="136" width="36" height="48" rx="5" fill="#4dabf7" ${S}/><path d="M158 150h20M158 160h20M158 170h14" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>` },
    { id: "cape", slot: "back", n: "Батыр жапқышы", unlock: "streak7", back: true, svg: () => `<path d="M52 100L16 214H184L148 100Z" fill="#e64980" ${S}/>` },
    { id: "wings", slot: "back", n: "Қанаттар", unlock: "streak30", back: true, svg: () => `<path d="M44 140C8 138 -2 102 6 72C20 88 30 92 40 104C34 84 40 70 50 62C58 82 58 106 50 128Z" fill="#e7f5ff" ${S}/><path d="M156 140C192 138 202 102 194 72C180 88 170 92 160 104C166 84 160 70 150 62C142 82 142 106 150 128Z" fill="#e7f5ff" ${S}/>` },
    { id: "sparkle", slot: "back", n: "Жарқыл", unlock: "perfect10", back: true, svg: () => `<g fill="#ffd23f" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"><path d="M22 52l4 10 10 4-10 4-4 10-4-10-10-4 10-4z"/><path d="M182 96l4 10 10 4-10 4-4 10-4-10-10-4 10-4z"/><path d="M168 30l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/></g>` },
    { id: "dombyra", slot: "back", n: "Домбыра", unlock: "poly", back: true, svg: () => `<path d="M168 150L192 46" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M168 150L192 46" stroke="#a0522d" stroke-width="5" stroke-linecap="round"/><path d="M162 204C140 202 136 182 142 166C148 150 166 146 178 152C192 160 192 182 184 194C178 202 170 204 162 204Z" fill="#d9480f" ${S}/><circle cx="166" cy="178" r="5" fill="#5c2b0f"/>` },
    /* ---- серия ауасы (серия тірі болғанда ғана көрінеді) ---- */
    { id: "flame", slot: "aura", n: "Жалын ауасы", unlock: { streak: 3 }, back: true, svg: () => `<g opacity=".92"><path d="M100 214C40 214 16 172 24 128C30 96 54 84 58 54C72 70 76 86 80 96C82 70 92 48 100 28C108 48 118 70 120 96C124 86 128 70 142 54C146 84 170 96 176 128C184 172 160 214 100 214Z" fill="#ff922b" ${S3}/><path d="M100 210C58 210 42 180 48 150C52 128 68 120 72 100C80 112 84 122 86 130C88 112 94 98 100 84C106 98 112 112 114 130C116 122 120 112 128 100C132 120 148 128 152 150C158 180 142 210 100 210Z" fill="#ffd43b"/></g>` },
    { id: "bolt", slot: "aura", n: "Найзағай ауасы", unlock: { streak: 7 }, back: true, svg: () => `<g fill="#ffe066" ${S3}><path d="M14 54l22 6-12 18 20 6-28 30 6-24-18-6z"/><path d="M176 70l20 6-10 16 18 6-26 28 5-22-16-6z"/></g>` },
    { id: "galaxy", slot: "aura", n: "Галактика ауасы", unlock: { streak: 30 }, back: true, svg: () => `<circle cx="100" cy="132" r="98" fill="rgba(108,92,231,.28)" stroke="#9775fa" stroke-width="3" stroke-dasharray="4 9"/><g fill="#ffffff"><circle cx="20" cy="96" r="3"/><circle cx="178" cy="70" r="3"/><circle cx="172" cy="196" r="2.5"/><circle cx="26" cy="190" r="2.5"/><circle cx="150" cy="40" r="2"/></g>` },
    /* ---- апталық лига (өткен аптада сыныпта топ-3; тек осы апта ғана) ---- */
    { id: "lg1", slot: "hat", n: "Алтын лавр (лига 🥇)", unlock: { league: 1 }, svg: () => `<g ${S3} fill="#ffd23f"><ellipse cx="54" cy="84" rx="6" ry="11" transform="rotate(-28 54 84)"/><ellipse cx="47" cy="68" rx="6" ry="11" transform="rotate(-8 47 68)"/><ellipse cx="52" cy="52" rx="6" ry="11" transform="rotate(18 52 52)"/><ellipse cx="66" cy="40" rx="6" ry="11" transform="rotate(42 66 40)"/><ellipse cx="146" cy="84" rx="6" ry="11" transform="rotate(28 146 84)"/><ellipse cx="153" cy="68" rx="6" ry="11" transform="rotate(8 153 68)"/><ellipse cx="148" cy="52" rx="6" ry="11" transform="rotate(-18 148 52)"/><ellipse cx="134" cy="40" rx="6" ry="11" transform="rotate(-42 134 40)"/></g><path d="${star(100, 34, 13)}" fill="#ff6b6b" stroke="${INK}" stroke-width="3"/>` },
    { id: "lg2", slot: "pin", n: "Күміс медаль (лига 🥈)", unlock: { league: 2 }, svg: () => `<path d="M126 150l10 20M150 150l-10 20" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M126 150l10 20M150 150l-10 20" stroke="#4dabf7" stroke-width="5" stroke-linecap="round"/><circle cx="138" cy="182" r="14" fill="#ced4da" ${S3}/><text x="138" y="188" font-size="16" font-weight="900" text-anchor="middle" fill="#495057">2</text>` },
    { id: "lg3", slot: "pin", n: "Қола медаль (лига 🥉)", unlock: { league: 3 }, svg: () => `<path d="M126 150l10 20M150 150l-10 20" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M126 150l10 20M150 150l-10 20" stroke="#ff922b" stroke-width="5" stroke-linecap="round"/><circle cx="138" cy="182" r="14" fill="#e0955a" ${S3}/><text x="138" y="188" font-size="16" font-weight="900" text-anchor="middle" fill="#5c2b0f">3</text>` },
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
    push();
    return s;
  }
  const LKEY = "kodzholy.league";
  /* апта басы (дүйсенбі, UTC): сервердегі date_trunc('week') сияқты */
  const weekKey = () => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
    return d.toISOString().slice(0, 10);
  };
  const leagueRank = () => {
    const L = KZ.store.get(LKEY, null);
    return L && L.week === weekKey() ? L.rank : null;
  };
  /* аккаунтқа сақтау (қысқа кідіріспен, интернет жоқта үнсіз өтеді) */
  let pushT = null;
  function push() {
    clearTimeout(pushT);
    pushT = setTimeout(() => {
      const A = KZ.auth;
      if (A && A.isActive && A.isActive()) A.rpc("save_hero", { h: ensure() }).catch(() => {});
    }, 1500);
  }
  const save = (s) => {
    s.t = Date.now();
    KZ.store.set(KEY, s);
    push();
  };

  const need = (i) => {
    const u = i.unlock;
    if (u === "start") return "Бастапқы жиынтықта кездейсоқ беріледі";
    if (u.league) return "Апталық лига: өткен аптада сыныпта " + u.league + "-орын алсаң, осы аптада ғана киесің";
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
      if (u.league) return leagueRank() === u.league;
      if (typeof u === "object") return hero.bestStreak() >= u.streak;
      return !!KZ.ach.unlocked()[u];
    },
    bestStreak: () => (KZ.activity ? KZ.activity.best() : 0),
    /* серия ауасы тек қазіргі серия жеткілікті болғанда көрінеді */
    visible(i, ctx) {
      const u = i.unlock;
      if (u && u.league) return ctx && ctx.lg !== undefined ? ctx.lg === u.league : leagueRank() === u.league;
      if (u && u.streak) return (ctx && ctx.streak !== undefined ? ctx.streak : KZ.activity.streak().n) >= u.streak;
      return true;
    },
    weekKey,
    leagueRank,
    /* серверден лига орнын алу (кіргенде және рейтинг ашқанда) */
    async loadLeague() {
      const A = KZ.auth;
      if (!A || !A.isActive || !A.isActive()) return;
      try {
        const r = await A.rpc("my_league");
        hero.setLeague(r);
      } catch (e) {
        /* офлайн: соңғы белгілі мән қалады */
      }
    },
    setLeague(rank) {
      const prev = leagueRank();
      if (rank) KZ.store.set(LKEY, { rank, week: weekKey() });
      else KZ.store.set(LKEY, null);
      if (rank && rank !== prev && !hero._lgToast) {
        hero._lgToast = true;
        const it = ITEMS.find((x) => x.unlock && x.unlock.league === rank);
        setTimeout(() => KZ.toast && KZ.toast("🏅", "Апталық лига: " + rank + "-орын!", it ? "Жаңа зат: " + it.n + " — тек осы аптаға" : ""), 1200);
      }
      hero.refresh();
    },
    /* басқа құрылғыдан келген кейіпкерді қабылдау: жаңасы (t үлкені) жеңеді */
    fromCloud(c) {
      const l = load();
      if (c && c.eq && Array.isArray(c.starters)) {
        const ct = Number(c.t) || 0;
        if (!l || ct >= (l.t || 0)) {
          KZ.store.set(KEY, { color: c.color, starters: c.starters, eq: c.eq, t: ct });
          hero.refresh();
        } else push();
      } else if (l) push();
    },
    /* көрінетін өз кейіпкерлерін қайта сызу */
    refresh() {
      document.querySelectorAll(".hero-fig[data-own]").forEach((f) => (f.innerHTML = hero.svg()));
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
      const c = s.color || "#6c5ce7";
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
        return it && it.slot === slot && (s.preview || hero.visible(it, s)) ? it : null;
      };
      const draw = (it) => skin(it.svg(c));
      const auras = get("aura");
      const back = get("back");
      const deep = mix(c, "#1f1d36", 0.32);
      const bg = uid + "b";
      defs.body = `<radialGradient id="${bg}" cx=".36" cy=".28" r=".85"><stop offset="0" stop-color="${mix(c, "#ffffff", 0.7)}"/><stop offset=".4" stop-color="${mix(c, "#ffffff", 0.3)}"/><stop offset=".78" stop-color="${c}"/><stop offset="1" stop-color="${deep}"/></radialGradient>`;
      defs.ear = `<linearGradient id="${uid}e" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0a6"/><stop offset="1" stop-color="#ffc43d"/></linearGradient>`;
      const hat = get("hat");
      const P = [];
      P.push(`<ellipse cx="100" cy="210" rx="58" ry="8" fill="${INK}" opacity=".15"/>`);
      if (auras) P.push(`<g class="hf-aura">${draw(auras)}</g>`);
      P.push('<g class="hf-bob">');
      if (back && back.back) P.push(draw(back));
      // аяқтар
      P.push(`<ellipse cx="78" cy="200" rx="17" ry="9" fill="${deep}" ${S}/><ellipse cx="122" cy="200" rx="17" ry="9" fill="${deep}" ${S}/>`);
      // құлақтар: < > жақшалары
      const ear = (d, cls) => `<g class="${cls}"><path d="${d}" fill="none" stroke="${INK}" stroke-width="19" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="url(#${uid}e)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></g>`;
      P.push(ear("M40 98L18 124L40 150", "hf-ear-l") + ear("M160 98L182 124L160 150", "hf-ear-r"));
      // басындағы курсор (бас киім кисе, жасырылады)
      if (!hat) P.push(`<g class="hf-cur"><rect x="93" y="36" width="14" height="36" rx="7" fill="#2ec4b6" ${S}/><rect x="97" y="41" width="4" height="12" rx="2" fill="#ffffff" opacity=".6"/></g>`);
      // дене (желе)
      P.push(`<path d="${BODY}" fill="url(#${bg})" ${S}/>`);
      P.push(`<path d="M56 108C58 92 68 84 82 81" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" opacity=".6"/><circle cx="55" cy="121" r="3.5" fill="#ffffff" opacity=".7"/>`);
      P.push(`<path d="M62 182C82 192 118 192 138 182" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity=".35"/>`);
      const outfit = get("outfit");
      if (outfit) P.push(draw(outfit));
      const pin = get("pin");
      if (pin) P.push(draw(pin));
      // бет: ұрт, көз, ауыз
      P.push(`<ellipse cx="62" cy="146" rx="9" ry="5.5" fill="#ff7eb6" opacity=".55"/><ellipse cx="138" cy="146" rx="9" ry="5.5" fill="#ff7eb6" opacity=".55"/>`);
      P.push(`<g class="hf-eyes hf-e1"><ellipse cx="80" cy="126" rx="11" ry="14" fill="#1c1240"/><ellipse cx="120" cy="126" rx="11" ry="14" fill="#1c1240"/><circle cx="84" cy="120" r="4.5" fill="#ffffff"/><circle cx="124" cy="120" r="4.5" fill="#ffffff"/><circle cx="77" cy="132" r="2" fill="#ffffff"/><circle cx="117" cy="132" r="2" fill="#ffffff"/></g>`);
      if (!s.still) P.push(`<g class="hf-e2"><path d="M69 130C73 118 87 118 91 130M109 130C113 118 127 118 131 130" fill="none" stroke="#1c1240" stroke-width="6" stroke-linecap="round"/></g>`);
      P.push(`<path class="hf-m1" d="M92 150C96 156 104 156 108 150" fill="none" ${S}/>`);
      if (!s.still) P.push(`<g class="hf-m2"><path d="M87 145C87 163 113 163 113 145Z" fill="#5a1e52" ${S}/><ellipse cx="100" cy="156" rx="7" ry="3.5" fill="#ff7eb6"/></g>`);
      P.push(`<path class="hf-m3" d="M91 156C95 148 105 148 109 156" fill="none" ${S}/><path class="hf-sweat" d="M152 96C147 105 147 111 152 111C157 111 157 105 152 96Z" fill="#9fe3ff" stroke="${INK}" stroke-width="2.5"/>`);
      const neck = get("neck");
      if (neck) P.push(draw(neck));
      const face = get("face");
      if (face) P.push(draw(face));
      if (hat) P.push(draw(hat));
      P.push("</g>");
      const defsStr = Object.values(defs).join("");
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 212 228" role="img" aria-label="Бит кейіпкері"><defs>${defsStr}</defs>${P.join("")}</svg>`;
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
      d.dataset.own = "1";
      d.innerHTML = hero.svg();
      d.addEventListener("click", () => hero.cheer());
      return d;
    },
    /* Жаңа ашылған заттарды хабарлау үшін: жетістіктен кейін қайсы зат ашылды */
    newFor(achIds) {
      return ITEMS.filter((i) => typeof i.unlock === "string" && achIds.includes(i.unlock));
    },
  });


  /* ---------- Сабақтағы көмекші: Бит тапсырма мен лекцияда сөйлейді ---------- */
  const SAY = {
    err: ["Қате шықты — қорықпа, ол жол сілтеп тұр! Қызыл жазуды оқып көрейік.", "Ештеңе етпейді, бағдарламашылар күніне жүз рет қателеседі 🐞", "Қате жолын тауып, бір әріпті түзетіп көр."],
    bad: ["Жақынсың! Тапсырма шартын қайта оқып көр.", "Әлі сәл жетпей тұр. Нәтижені күткенмен салыстыр.", "Ойланып көрейік: не өзгертсем болады?"],
    ok: ["Керемет! Мықтысың! 🎉", "Дәл тапсың! Келесісіне!", "Ура! Бұл тапсырма шешілді ⭐", "Тамаша жұмыс!"],
    fail3: "Бірнеше рет болмады ма? «Кеңес» батырмасын басып көр 💡",
  };
  const FACTS = {
    python: ["Python атауы жыланнан емес, «Монти Пайтон» комедия шоуынан шыққан.", "Python-да шегініс (бос орын) — синтаксистің бір бөлігі, оны қалай болса солай қоюға болмайды.", "print() ең алғашқы бағдарламаның қатар-қатарында жүреді: «Hello, world!»."],
    html: ["HTML — бағдарламалау тілі емес, белгілеу тілі: ол бет құрылымын сипаттайды.", "Алғашқы веб-сайт 1991 жылы жасалған және тек мәтіннен тұрған.", "Тегтердің көбі жұп болады: ашатын <p> және жабатын </p>."],
    css: ["CSS — Cascading Style Sheets: «каскадты» дегені қайсы ереже басым екенін білдіреді.", "Бір элементке бірнеше ереже тисе, нақтырақ селектор жеңеді.", "Flexbox пен Grid болмай тұрған кезде беттер кестелермен жасалған."],
    javascript: ["JavaScript-ті 1995 жылы небәрі 10 күнде жазған деген әңгіме бар.", "Java мен JavaScript — екі бөлек тіл, аттарының ұқсастығы тек маркетингтен.", "Браузердің өзінде JavaScript жұмыс істейді — қосымша ештеңе орнатпайсың."],
    kotlin: ["Kotlin-ді JetBrains компаниясы жасады, аты Санкт-Петербург маңындағы Котлин аралынан шыққан.", "Android қосымшаларының көбі қазір Kotlin-мен жазылады.", "Kotlin-де қорап типі қатаң: Int-ке мәтін салуға болмайды, ал null-ға тек «?» белгілі қорап рұқсат береді."],
    sql: ["SQL-ді «сиквел» деп те оқиды, екеуі де дұрыс.", "WHERE — жолдарды сүзеді, HAVING — топтарды сүзеді.", "NULL — нөл емес, «мән жоқ» дегенді білдіреді."],
    projects: ["Үлкен жоба әрдайым кішкентай бөліктерден құралады.", "Жобаны жазғанда алдымен жұмыс істейтін қарапайым нұсқа жаса, кейін әдемілей бер.", "Кодты жиі іске қосып тексер — қатені ертерек табасың."],
  };
  const FACTS_ANY = ["Бағдарламашылардың көбі қатені Google-дан іздейді — бұл ұят емес 😉", "Күнде 10 минут оқу аптасына 1 сағат береді.", "Қате — жаман емес, ол код саған жол көрсетіп тұр."];
  let helperEl = null;
  let helperT = null;
  let failN = 0;
  let lastHash = "";
  const helperOn = () => KZ.store.get("kodzholy.helper", true) !== false;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  function helperHide() {
    clearTimeout(helperT);
    if (helperEl) helperEl.classList.remove("on", "sad");
    if (helperEl) helperEl.querySelector(".hero-fig").classList.remove("sad");
  }
  function say(mood, text, ms) {
    if (!helperOn() || !text) return;
    if (!helperEl) {
      helperEl = el("div", "bit-helper");
      helperEl.setAttribute("aria-live", "polite");
      const fig = el("span", "hero-fig");
      fig.dataset.own = "1";
      const bub = el("div", "bit-bubble");
      const x = h("button", "bit-x", "✕");
      x.type = "button";
      x.setAttribute("aria-label", "Жабу");
      x.addEventListener("click", helperHide);
      helperEl.append(fig, bub, x);
      document.body.appendChild(helperEl);
      window.addEventListener("hashchange", () => {
        failN = 0;
        helperHide();
      });
    }
    const fig = helperEl.querySelector(".hero-fig");
    fig.innerHTML = hero.svg();
    fig.classList.toggle("sad", mood === "sad");
    helperEl.querySelector(".bit-bubble").textContent = text;
    helperEl.classList.add("on");
    helperEl.classList.toggle("fact", mood === "fact");
    if (mood === "happy") setTimeout(() => hero.cheer(), 60);
    clearTimeout(helperT);
    helperT = setTimeout(helperHide, ms || 5200);
  }
  Object.assign(hero, {
    say,
    helperOn,
    setHelper(v) {
      KZ.store.set("kodzholy.helper", !!v);
      if (!v) helperHide();
    },
    /* тапсырма нәтижесі: "ok" | "bad" | "err" */
    react(kind) {
      if (location.hash !== lastHash) {
        lastHash = location.hash;
        failN = 0;
      }
      if (kind === "ok") {
        failN = 0;
        return say("happy", pick(SAY.ok));
      }
      failN++;
      if (failN >= 3 && failN % 3 === 0) return say("sad", SAY.fail3, 6500);
      say("sad", pick(kind === "err" ? SAY.err : SAY.bad));
    },
    /* лекцияда «Білесің бе?» */
    tip(courseId) {
      const route = location.hash;
      setTimeout(() => {
        if (location.hash !== route || !helperOn()) return;
        say("fact", "💡 Білесің бе? " + pick((FACTS[courseId] || []).concat(FACTS_ANY)), 8000);
      }, 3500);
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
    page.appendChild(h("p", "hint", "Бит — сенің кейіпкерің. Басында бірнеше зат кездейсоқ беріледі, ал қалғандарын жетістіктер мен күн сериясы арқылы ашасың."));
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
