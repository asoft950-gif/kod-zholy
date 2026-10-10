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
    ["#6c5ce7", KZ.t("Күлгін")],
    ["#2ec4b6", KZ.t("Жасыл-көгілдір")],
    ["#ff6b6b", KZ.t("Қызыл")],
    ["#ffa94d", KZ.t("Қызғылт сары")],
    ["#4dabf7", KZ.t("Көк")],
    ["#f783ac", KZ.t("Қызғылт")],
    ["#51cf66", KZ.t("Жасыл")],
    ["#495057", KZ.t("Графит")],
  ];

  const SLOTS = [
    { id: "hat", name: KZ.t("Бас киім"), e: "🎩" },
    { id: "face", name: KZ.t("Көзілдірік"), e: "🕶️" },
    { id: "neck", name: KZ.t("Мойын"), e: "🧣" },
    { id: "outfit", name: KZ.t("Киім"), e: "👕" },
    { id: "pin", name: KZ.t("Белгі"), e: "📌" },
    { id: "back", name: KZ.t("Арқа"), e: "🎒" },
    { id: "aura", name: KZ.t("Серия ауасы"), e: "🔥" },
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
  /* Аңыз заттардың металл, шыны, от градиенттері */
  const GS = 'stroke="#6b3d00" stroke-width="1.4" stroke-linejoin="round"';
  const TS = 'stroke="#2b1670" stroke-width="1.8" stroke-linejoin="round"';
  const richDefs = (u) => `<linearGradient id="${u}gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbe0"/><stop offset=".18" stop-color="#ffe066"/><stop offset=".42" stop-color="#fcc419"/><stop offset=".62" stop-color="#d9770b"/><stop offset=".8" stop-color="#ffd43b"/><stop offset="1" stop-color="#8f5200"/></linearGradient><linearGradient id="${u}goldH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a5200"/><stop offset=".22" stop-color="#ffd43b"/><stop offset=".45" stop-color="#fff6cc"/><stop offset=".62" stop-color="#fcc419"/><stop offset="1" stop-color="#7a4700"/></linearGradient><radialGradient id="${u}ruby" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffe3e3"/><stop offset=".3" stop-color="#ff6b6b"/><stop offset="1" stop-color="#8f1515"/></radialGradient><radialGradient id="${u}sapph" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#e7f5ff"/><stop offset=".35" stop-color="#339af0"/><stop offset="1" stop-color="#0b3a8a"/></radialGradient><radialGradient id="${u}emer" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ebfbee"/><stop offset=".35" stop-color="#40c057"/><stop offset="1" stop-color="#145a24"/></radialGradient><radialGradient id="${u}pearl" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#f1f3f5"/><stop offset="1" stop-color="#9aa3ad"/></radialGradient><linearGradient id="${u}frame" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#868e96"/><stop offset=".35" stop-color="#343a40"/><stop offset="1" stop-color="#101418"/></linearGradient><linearGradient id="${u}lens" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c2b52" stop-opacity=".78"/><stop offset="1" stop-color="#050a18" stop-opacity=".9"/></linearGradient><clipPath id="${u}lc"><rect x="52" y="108" width="44" height="36" rx="13"/><rect x="104" y="108" width="44" height="36" rx="13"/></clipPath><linearGradient id="${u}scarf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d0bfff"/><stop offset=".45" stop-color="#845ef7"/><stop offset="1" stop-color="#4c2bb0"/></linearGradient><pattern id="${u}knit" width="7" height="6" patternUnits="userSpaceOnUse"><path d="M0 0L3.5 4.5L7 0" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="1.3"/></pattern><linearGradient id="${u}fire" x1="1" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff9db"/><stop offset=".22" stop-color="#ffd43b"/><stop offset=".5" stop-color="#ff922b"/><stop offset=".8" stop-color="#f03e3e"/><stop offset="1" stop-color="#9c1717"/></linearGradient>`;
  const pinBadge = (txt) => `<circle cx="138" cy="176" r="12" fill="#ffffff" ${S3}/><text x="138" y="181" font-size="13" text-anchor="middle">${txt}</text>`;

  /* unlock: "start" (басында кездейсоқ беріледі), жетістік id-і, не { streak: N } (қазіргі серия N-ге жеткенде ғана көрінеді) */
  const ITEMS = [
    /* ---- бас киім ---- */
    { id: "cap", slot: "hat", n: KZ.t("Қызыл кепка"), unlock: "start", svg: () => `<path d="M50 86C50 50 72 38 100 38C128 38 150 50 150 86Z" fill="#ff6b6b" ${S}/><path d="M112 84Q150 76 184 88Q152 98 112 92Z" fill="#e8504f" ${S}/><circle cx="100" cy="38" r="5" fill="#e8504f" ${S3}/>` },
    { id: "beanie", slot: "hat", n: KZ.t("Тоқыма бөрік"), unlock: "start", svg: () => `<path d="M52 84C52 44 74 30 100 30C126 30 148 44 148 84Z" fill="#ffa94d" ${S}/><rect x="46" y="76" width="108" height="18" rx="9" fill="#ff922b" ${S}/><path d="M68 80v10M84 80v10M100 80v10M116 80v10M132 80v10" stroke="#ffd8a8" stroke-width="3"/><circle cx="100" cy="26" r="11" fill="#ffffff" ${S}/>` },
    { id: "flower", slot: "hat", n: KZ.t("Гүл"), unlock: "start", svg: () => `<g ${S3}><circle cx="138" cy="66" r="9" fill="#f783ac"/><circle cx="152" cy="74" r="9" fill="#f783ac"/><circle cx="148" cy="88" r="9" fill="#f783ac"/><circle cx="132" cy="86" r="9" fill="#f783ac"/><circle cx="128" cy="72" r="9" fill="#f783ac"/><circle cx="140" cy="78" r="6" fill="#ffd23f"/></g>` },
    { id: "party", slot: "hat", n: KZ.t("Мереке қалпағы"), unlock: "daily1", svg: () => `<path d="M74 82L100 14L126 82Z" fill="#2ec4b6" ${S}/><path d="M84 58h32M92 36h16" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="14" r="8" fill="#ffd23f" ${S3}/>` },
    { id: "phones", slot: "hat", n: KZ.t("Құлаққап"), unlock: "streak3", svg: () => `<path d="M34 112C34 46 166 46 166 112" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M34 112C34 46 166 46 166 112" fill="none" stroke="#495057" stroke-width="6" stroke-linecap="round"/><rect x="18" y="100" width="26" height="44" rx="12" fill="#ff6b6b" ${S}/><rect x="156" y="100" width="26" height="44" rx="12" fill="#ff6b6b" ${S}/>` },
    { id: "wizard", slot: "hat", n: KZ.t("Сиқыршы қалпағы"), unlock: "lv30", svg: () => `<ellipse cx="100" cy="82" rx="68" ry="13" fill="#5f3dc4" ${S}/><path d="M62 80L104 4Q112 -2 116 8L140 80Z" fill="#7048e8" ${S}/><path d="${star(104, 52, 11)}" fill="#ffd23f" stroke="${INK}" stroke-width="2.5"/>` },
    { id: "helmet", slot: "hat", n: KZ.t("Ғарышкер дулыға"), unlock: "lv60", svg: () => `<path d="M22 154C14 64 58 26 100 26C142 26 186 64 178 154Z" fill="rgba(165,216,255,.42)" ${S}/><path d="M46 70Q62 44 92 38" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" opacity=".8"/><g fill="#ffffff"><circle class="fx fx-twinkle" cx="74" cy="64" r="3"/><circle class="fx fx-twinkle d2" cx="128" cy="52" r="2.5"/><circle class="fx fx-twinkle d3" cx="146" cy="96" r="2"/></g>` },
    { id: "takiya", slot: "hat", n: KZ.t("Тақия"), unlock: "start", svg: () => `<path d="M56 84C56 50 76 38 100 38C124 38 144 50 144 84Q100 94 56 84Z" fill="#c92a2a" ${S}/><path d="M62 76Q100 84 138 76" fill="none" stroke="#ffd23f" stroke-width="3.5"/><path d="M86 56Q92 48 100 56Q108 48 114 56M92 64Q100 70 108 64" fill="none" stroke="#ffd23f" stroke-width="3" stroke-linecap="round"/>` },
    { id: "borik", slot: "hat", n: KZ.t("Бөрік"), unlock: "streak7", svg: () => `<path d="M62 78C62 44 80 30 100 30C120 30 138 44 138 78Z" fill="#c92a2a" ${S}/><path d="M48 86Q48 64 100 64Q152 64 152 86Q152 100 100 100Q48 100 48 86Z" fill="#8d6e63" ${S}/><path d="M100 30L94 12M100 30L104 10M100 30L110 14" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>` },
    /* ---- көзілдірік (көздер: 80/120, 126) ---- */
    { id: "round", slot: "face", n: KZ.t("Дөңгелек көзілдірік"), unlock: "start", svg: () => `<circle cx="79" cy="126" r="20" fill="rgba(255,255,255,.22)" ${S}/><circle cx="121" cy="126" r="20" fill="rgba(255,255,255,.22)" ${S}/><path d="M99 124h2M59 120L42 112M141 120L158 112" ${S}/>` },
    { id: "sun", slot: "face", n: KZ.t("Күннен қорғайтын"), unlock: "start", svg: () => `<path d="M52 110H148V124Q148 146 126 146Q104 146 104 128H96Q96 146 74 146Q52 146 52 124Z" fill="#212529" ${S}/><path d="M60 118L72 118M110 118L122 118" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" opacity=".7"/><path d="M52 114L40 108M148 114L160 108" ${S}/>` },
    { id: "visor", slot: "face", n: KZ.t("Жасыл визор"), unlock: "lv10", svg: () => `<rect x="48" y="108" width="104" height="36" rx="16" fill="rgba(46,196,182,.78)" ${S}/><path d="M60 118h22" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity=".8"/>` },
    { id: "starshade", slot: "face", n: KZ.t("Жұлдыз көзілдірік"), unlock: "perfect10", svg: () => `<path d="${star(79, 126, 22)}" fill="#ffd23f" ${S3}/><path d="${star(121, 126, 22)}" fill="#ffd23f" ${S3}/><path d="M96 126h8" ${S3}/>` },
    { id: "monocle", slot: "face", n: KZ.t("Монокль"), unlock: "bug10", svg: () => `<circle cx="121" cy="126" r="21" fill="rgba(255,255,255,.25)" ${S}/><path d="M140 136Q160 160 148 186" fill="none" stroke="#fab005" stroke-width="3"/>` },
    { id: "lens", slot: "face", n: KZ.t("Лупа"), unlock: "bug1", svg: () => `<path d="M138 144L166 178" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M138 144L166 178" stroke="#8d6e63" stroke-width="7" stroke-linecap="round"/><circle cx="122" cy="126" r="22" fill="rgba(165,216,255,.35)" ${S}/>` },
    /* ---- мойын (иек астында) ---- */
    { id: "scarf", slot: "neck", n: KZ.t("Қызыл шарф"), unlock: "start", svg: () => `<path d="M42 160Q100 182 158 160L160 174Q100 198 40 174Z" fill="#ff6b6b" ${S}/><path d="M118 178L126 208L144 202L136 174Z" fill="#e8504f" ${S}/>` },
    { id: "bow", slot: "neck", n: KZ.t("Көбелек галстук"), unlock: "start", svg: () => `<path d="M100 172L78 160V184ZM100 172L122 160V184Z" fill="#f783ac" ${S}/><circle cx="100" cy="172" r="6" fill="#ffffff" ${S3}/>` },
    { id: "tie", slot: "neck", n: KZ.t("Галстук"), unlock: "poly", svg: () => `<path d="M92 164H108L112 174L100 202L88 174Z" fill="#2ec4b6" ${S}/>` },
    { id: "medal", slot: "neck", n: KZ.t("Жеңімпаз медалі"), unlock: "bonus1", svg: () => `<path d="M76 160L100 184L124 160" fill="none" stroke="#ff6b6b" stroke-width="7"/><circle cx="100" cy="188" r="12" fill="#ffd23f" ${S}/><path d="${star(100, 188, 6)}" fill="#fab005"/>` },
    { id: "tumar", slot: "neck", n: KZ.t("Тұмар"), unlock: "start", svg: () => `<path d="M72 158Q100 178 128 158" fill="none" stroke="#c92a2a" stroke-width="3.5"/><path d="M100 168L113 181L100 194L87 181Z" fill="#ffd23f" ${S}/><circle cx="100" cy="181" r="3" fill="#c92a2a"/>` },
    /* ---- киім (дененің төменгі жағы) ---- */
    { id: "tee_blue", slot: "outfit", n: KZ.t("Көк футболка"), unlock: "start", svg: () => `<path d="${OUT}" fill="#4dabf7" ${S}/>` },
    { id: "tee_green", slot: "outfit", n: KZ.t("Жасыл футболка"), unlock: "start", svg: () => `<path d="${OUT}" fill="#51cf66" ${S}/><path d="M58 184H142" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity=".85"/>` },
    { id: "hoodie", slot: "outfit", n: KZ.t("Худи"), unlock: "lv10", svg: () => `<path d="${OUT}" fill="#9775fa" ${S}/><rect x="80" y="180" width="40" height="13" rx="6" fill="#845ef7" ${S3}/><path d="M90 172V180M110 172V180" ${S3}/>` },
    { id: "overall", slot: "outfit", n: KZ.t("Комбинезон"), unlock: "daily7", svg: () => `<path d="M58 168L52 150M142 168L148 150" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><path d="M58 168L52 150M142 168L148 150" stroke="#1971c2" stroke-width="5" stroke-linecap="round"/><path d="${OUT}" fill="#1c7ed6" ${S}/><rect x="86" y="180" width="28" height="13" rx="4" fill="#1864ab" ${S3}/>` },
    { id: "hero_suit", slot: "outfit", n: KZ.t("Батыр костюмы"), unlock: "streak7", svg: () => `<path d="${OUT}" fill="#fa5252" ${S}/><path d="${star(100, 184, 11)}" fill="#ffd23f" stroke="${INK}" stroke-width="2.5"/>` },
    { id: "tux", slot: "outfit", n: KZ.t("Смокинг"), unlock: "lv60", svg: () => `<path d="${OUT}" fill="#343a40" ${S}/><path d="M86 172L100 196L114 172Q100 176 86 172Z" fill="#ffffff" ${S3}/><path d="M100 178L92 173V183ZM100 178L108 173V183Z" fill="#c92a2a"/>` },
    { id: "kamzol", slot: "outfit", n: KZ.t("Камзол"), unlock: "start", svg: () => `<path d="${OUT}" fill="#2b8a3e" ${S}/><path d="M90 173Q100 174 110 173V198H90Z" fill="#fff4e6" ${S3}/><path d="M58 182Q64 176 70 182Q76 188 82 182M118 182Q124 176 130 182Q136 188 142 182" fill="none" stroke="#ffd23f" stroke-width="3" stroke-linecap="round"/>` },
    { id: "shapan", slot: "outfit", n: KZ.t("Шапан"), unlock: "done_python", svg: () => `<path d="${OUT}" fill="#862e9c" ${S}/><path d="M44 166Q100 184 156 166" fill="none" stroke="#ffd23f" stroke-width="4"/><path d="M100 176V198" ${S3}/><path d="M62 190Q68 184 74 190M126 190Q132 184 138 190" fill="none" stroke="#ffd23f" stroke-width="3" stroke-linecap="round"/>` },
    /* ---- белгі (курс бітіргенде) ---- */
    ...[
      ["python", "🐍", "Python"],
      ["html", "🌐", "HTML"],
      ["css", "🎨", "CSS"],
      ["javascript", "⚡", "JavaScript"],
      ["kotlin", "🟣", "Kotlin"],
      ["projects", "🚀", KZ.t("Жобалар")],
      ["sql", "🗄️", "SQL"],
    ].map(([c, e, n]) => ({ id: "pin_" + c, slot: "pin", n: n + KZ.t(" белгісі"), unlock: "done_" + c, svg: () => pinBadge(e) })),
    { id: "star_pin", slot: "pin", n: KZ.t("Алтын жұлдыз"), unlock: "first", svg: () => `<path d="${star(138, 176, 12)}" fill="#ffd23f" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>` },
    { id: "bug_pin", slot: "pin", n: KZ.t("Қате аулаушы"), unlock: "bug1", svg: () => pinBadge("🐞") },
    { id: "matrix_pin", slot: "pin", n: KZ.t("Матрицадан шыққан"), unlock: "game_z1", svg: () => pinBadge("💊") },
    { id: "farm_pin", slot: "pin", n: KZ.t("Кристалл фермері"), unlock: "game_farm", svg: () => pinBadge("🌾") },
    { id: "oyu_pin", slot: "pin", n: KZ.t("Ою белгісі"), unlock: "reader", svg: () => `<circle cx="138" cy="176" r="12" fill="#c92a2a" ${S3}/><path d="M138 168Q131 172 135 176Q131 180 138 184M138 168Q145 172 141 176Q145 180 138 184" fill="none" stroke="#ffd23f" stroke-width="2.5"/>` },
    /* ---- арқа ---- */
    { id: "pack", slot: "back", n: KZ.t("Рюкзак"), unlock: "start", back: true, svg: () => `<rect x="22" y="112" width="156" height="78" rx="26" fill="#ff922b" ${S}/><path d="M60 92Q52 130 60 168M140 92Q148 130 140 168" fill="none" stroke="${INK}" stroke-width="5"/>` },
    { id: "book", slot: "back", n: KZ.t("Кітап"), unlock: "reader", back: true, svg: () => `<rect x="150" y="136" width="36" height="48" rx="5" fill="#4dabf7" ${S}/><path d="M158 150h20M158 160h20M158 170h14" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>` },
    { id: "cape", slot: "back", n: KZ.t("Батыр жапқышы"), unlock: "streak7", back: true, svg: () => `<path d="M52 100L16 214H184L148 100Z" fill="#e64980" ${S}/>` },
    { id: "wings", slot: "back", n: KZ.t("Қанаттар"), unlock: "streak30", back: true, svg: () => `<path d="M44 140C8 138 -2 102 6 72C20 88 30 92 40 104C34 84 40 70 50 62C58 82 58 106 50 128Z" fill="#e7f5ff" ${S}/><path d="M156 140C192 138 202 102 194 72C180 88 170 92 160 104C166 84 160 70 150 62C142 82 142 106 150 128Z" fill="#e7f5ff" ${S}/>` },
    { id: "sparkle", slot: "back", n: KZ.t("Жарқыл"), unlock: "perfect10", back: true, svg: () => `<g fill="#ffd23f" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"><path d="M22 52l4 10 10 4-10 4-4 10-4-10-10-4 10-4z"/><path d="M182 96l4 10 10 4-10 4-4 10-4-10-10-4 10-4z"/><path d="M168 30l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/></g>` },
    { id: "dombyra", slot: "back", n: KZ.t("Домбыра"), unlock: "poly", back: true, svg: () => `<path d="M168 150L192 46" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M168 150L192 46" stroke="#a0522d" stroke-width="5" stroke-linecap="round"/><path d="M162 204C140 202 136 182 142 166C148 150 166 146 178 152C192 160 192 182 184 194C178 202 170 204 162 204Z" fill="#d9480f" ${S}/><circle cx="166" cy="178" r="5" fill="#5c2b0f"/>` },
    /* ---- серия ауасы (серия тірі болғанда ғана көрінеді) ---- */
    { id: "flame", slot: "aura", n: KZ.t("Жалын ауасы"), unlock: { streak: 3 }, back: true, svg: () => `<g opacity=".92"><path d="M100 214C40 214 16 172 24 128C30 96 54 84 58 54C72 70 76 86 80 96C82 70 92 48 100 28C108 48 118 70 120 96C124 86 128 70 142 54C146 84 170 96 176 128C184 172 160 214 100 214Z" fill="#ff922b" ${S3}/><path d="M100 210C58 210 42 180 48 150C52 128 68 120 72 100C80 112 84 122 86 130C88 112 94 98 100 84C106 98 112 112 114 130C116 122 120 112 128 100C132 120 148 128 152 150C158 180 142 210 100 210Z" fill="#ffd43b"/></g>` },
    { id: "bolt", slot: "aura", n: KZ.t("Найзағай ауасы"), unlock: { streak: 7 }, back: true, svg: () => `<g fill="#ffe066" ${S3}><path d="M14 54l22 6-12 18 20 6-28 30 6-24-18-6z"/><path d="M176 70l20 6-10 16 18 6-26 28 5-22-16-6z"/></g>` },
    { id: "galaxy", slot: "aura", n: KZ.t("Галактика ауасы"), unlock: { streak: 30 }, back: true, svg: () => `<circle cx="100" cy="132" r="98" fill="rgba(108,92,231,.28)" stroke="#9775fa" stroke-width="3" stroke-dasharray="4 9"/><g fill="#ffffff"><circle cx="20" cy="96" r="3"/><circle cx="178" cy="70" r="3"/><circle cx="172" cy="196" r="2.5"/><circle cx="26" cy="190" r="2.5"/><circle cx="150" cy="40" r="2"/></g>` },
    /* ---- АҢЫЗ (legend): анимациялы, тек ауыр жетістікпен ашылады ---- */
    { id: "crown_gold", slot: "hat", legend: true, rich: true, n: KZ.t("Алтын шаңырақ тәж"), unlock: "perfect60", svg: (c, u) => `<ellipse cx="100" cy="94" rx="54" ry="8" fill="rgba(18,13,42,.3)" filter="url(#${u}b3)"/><path d="M52 90L43 40Q44 32 51 36L74 57L94 22Q100 13 106 22L126 57L149 36Q156 32 157 40L148 90Q100 99 52 90Z" fill="url(#${u}gold)" ${GS}/><path d="M58 82L52 48L75 66L100 30L125 66L148 48L142 82" fill="none" stroke="rgba(255,246,204,.6)" stroke-width="2" stroke-linejoin="round"/><path d="M50 79Q100 91 150 79L149 93Q100 105 51 93Z" fill="url(#${u}goldH)" ${GS}/><path d="M56 86Q63 94 70 87Q77 95 84 88Q92 96 100 89Q108 96 116 88Q123 95 130 87Q137 94 144 86" fill="none" stroke="rgba(122,71,0,.55)" stroke-width="1.6"/><g class="fx fx-pulse"><path d="M100 48L110 59L100 72L90 59Z" fill="url(#${u}ruby)" ${GS}/><path d="M100 48L100 72M90 59L110 59" stroke="rgba(255,255,255,.45)" stroke-width=".8"/><ellipse cx="96" cy="55" rx="2.5" ry="1.6" fill="rgba(255,255,255,.9)"/></g><circle class="fx fx-pulse d2" cx="68" cy="88" r="5.5" fill="url(#${u}sapph)" ${GS}/><circle class="fx fx-pulse d3" cx="132" cy="88" r="5.5" fill="url(#${u}emer)" ${GS}/><circle cx="66.5" cy="86" r="1.6" fill="rgba(255,255,255,.95)"/><circle cx="130.5" cy="86" r="1.6" fill="rgba(255,255,255,.95)"/><circle cx="49" cy="34" r="5.5" fill="url(#${u}pearl)" ${GS}/><circle cx="100" cy="16" r="6.5" fill="url(#${u}pearl)" ${GS}/><circle cx="151" cy="34" r="5.5" fill="url(#${u}pearl)" ${GS}/><g fill="rgba(255,255,255,1)"><path class="fx fx-twinkle" d="M36 14l2.6 7 7 2.6-7 2.6-2.6 7-2.6-7-7-2.6 7-2.6z"/><path class="fx fx-twinkle d2" d="M166 10l2 5.5 5.5 2-5.5 2-2 5.5-2-5.5-5.5-2 5.5-2z"/><path class="fx fx-twinkle d3" d="M120 2l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6z"/></g>` },
    { id: "coder_glasses", slot: "face", legend: true, rich: true, n: KZ.t("Кодтаушы көзілдірігі"), unlock: "done_python", svg: (c, u) => `<path d="M52 118L32 109M148 118L168 109" stroke="url(#${u}frame)" stroke-width="5" stroke-linecap="round"/><rect x="52" y="108" width="44" height="36" rx="13" fill="url(#${u}lens)"/><rect x="104" y="108" width="44" height="36" rx="13" fill="url(#${u}lens)"/><g clip-path="url(#${u}lc)" font-family="ui-monospace, Menlo, Consolas, monospace" font-weight="700" font-size="7.4" fill="rgb(61,255,176)" filter="url(#${u}glow)"><text class="fx fx-bit" x="56" y="121">def kod():</text><text class="fx fx-bit d2" x="56" y="132">  ret 42</text><text class="fx fx-bit d3" x="108" y="121">for i in</text><text class="fx fx-bit d4" x="108" y="132">  print(i)</text><rect class="fx fx-bit d2" x="84" y="136" width="5" height="2"/><path d="M58 146L76 106L84 106L66 146Z M110 146L128 106L134 106L116 146Z" fill="rgba(255,255,255,.14)"/></g><rect x="52" y="108" width="44" height="36" rx="13" fill="none" stroke="url(#${u}frame)" stroke-width="5"/><rect x="104" y="108" width="44" height="36" rx="13" fill="none" stroke="url(#${u}frame)" stroke-width="5"/><path d="M96 121Q100 116 104 121" fill="none" stroke="url(#${u}frame)" stroke-width="4.5"/><path d="M60 107.5H88M112 107.5H140" stroke="rgba(222,226,230,.7)" stroke-width="1.6" stroke-linecap="round"/>` },
    { id: "fire_wings", slot: "back", legend: true, rich: true, n: KZ.t("Жалын қанаттар"), unlock: "done_projects", back: true, svg: (c, u) => {
      const w = `<path d="M44 150C10 150 -8 116 -2 72C12 90 22 94 32 102C24 80 30 60 42 50C50 70 54 88 50 104C58 88 62 78 70 72C70 100 64 128 44 150Z" fill="rgba(255,146,43,.55)" filter="url(#${u}b7)"/><path d="M44 150C10 150 -8 116 -2 72C12 90 22 94 32 102C24 80 30 60 42 50C50 70 54 88 50 104C58 88 62 78 70 72C70 100 64 128 44 150Z" fill="url(#${u}fire)" stroke="#a61e1e" stroke-width="1.6" stroke-linejoin="round"/><path d="M46 140C24 138 12 116 12 92C22 104 30 108 38 114C36 98 40 86 46 78C52 94 54 110 50 124C56 112 60 104 64 100C62 118 58 130 46 140Z" fill="rgba(255,224,102,.75)"/><path d="M44 132C30 128 22 114 22 102M48 122C42 110 42 96 44 86" fill="none" stroke="rgba(201,42,42,.4)" stroke-width="1.6"/>`;
      return `<g transform="translate(-16 -26) scale(1.18)"><g class="fx fx-flapL">${w}</g></g><g transform="translate(216 -26) scale(-1.18 1.18)"><g class="fx fx-flapL d2">${w}</g></g><g fill="rgb(255,212,59)" filter="url(#${u}glow)"><circle class="fx fx-spark" cx="10" cy="64" r="3"/><circle class="fx fx-spark d2" cx="190" cy="58" r="3"/><circle class="fx fx-spark d3" cx="22" cy="96" r="2.4"/><circle class="fx fx-spark d4" cx="178" cy="92" r="2.4"/></g>`;
    } },
    { id: "magic_scarf", slot: "neck", legend: true, rich: true, n: KZ.t("Сиқырлы шарф"), unlock: "streak14", svg: (c, u) => `<g class="fx fx-hue"><path d="M40 158Q100 182 160 158L162 175Q100 202 38 175Z" fill="url(#${u}scarf)" ${TS}/><path d="M40 158Q100 182 160 158L162 175Q100 202 38 175Z" fill="url(#${u}knit)"/><path d="M44 171Q100 194 156 171" fill="none" stroke="rgba(43,22,112,.35)" stroke-width="3"/><path d="M46 161Q100 182 154 161" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="2.2"/><g class="fx fx-flutter"><path d="M118 180L112 214Q126 220 140 213L138 180Z" fill="url(#${u}scarf)" ${TS}/><path d="M118 180L112 214Q126 220 140 213L138 180Z" fill="url(#${u}knit)"/><path d="M114 198Q126 201 139 197" stroke="rgb(255,212,59)" stroke-width="3.5" fill="none"/><path d="M113 206Q126 209 139.5 205" stroke="rgba(255,212,59,.8)" stroke-width="2" fill="none"/><path d="M115 216v6M120 217.5v6M125 218v6M130 217.5v6M135 216v6" stroke="rgb(132,94,247)" stroke-width="2.4" stroke-linecap="round"/></g><ellipse cx="128" cy="181" rx="10" ry="8" fill="url(#${u}scarf)" ${TS}/><ellipse cx="125" cy="178" rx="4" ry="2.5" fill="rgba(255,255,255,.5)"/><g fill="rgb(255,224,102)"><path class="fx fx-twinkle" d="M64 170l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path class="fx fx-twinkle d3" d="M96 177l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z"/></g></g>` },
    { id: "dombyra_play", slot: "back", legend: true, n: KZ.t("Шертетін домбыра"), unlock: "read30", back: true, svg: () => `<g class="fx fx-strum"><path d="M168 150L192 46" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M168 150L192 46" stroke="#a0522d" stroke-width="5" stroke-linecap="round"/><path d="M162 204C140 202 136 182 142 166C148 150 166 146 178 152C192 160 192 182 184 194C178 202 170 204 162 204Z" fill="#d9480f" ${S}/><circle cx="166" cy="178" r="5" fill="#5c2b0f"/><path d="M152 176L180 180" stroke="#ffe8cc" stroke-width="1.8"/></g><g font-size="16" font-weight="900" fill="rgb(31,29,54)"><text class="fx fx-note" x="132" y="150">♪</text><text class="fx fx-note d2" x="146" y="140">♫</text><text class="fx fx-note d3" x="124" y="136">♪</text></g>` },
    { id: "code_rain", slot: "aura", legend: true, n: KZ.t("Код жаңбыры"), unlock: "lv100", back: true, svg: () => `<g font-family="monospace" font-weight="800" font-size="13" fill="rgb(81,207,102)"><text class="fx fx-fall" x="8" y="60">1</text><text class="fx fx-fall d2" x="8" y="120">0</text><text class="fx fx-fall d3" x="22" y="90">1</text><text class="fx fx-fall d4" x="22" y="160">0</text><text class="fx fx-fall d3" x="176" y="70">0</text><text class="fx fx-fall" x="176" y="140">1</text><text class="fx fx-fall d2" x="190" y="100">1</text><text class="fx fx-fall d4" x="190" y="170">0</text></g>` },
    /* ---- САНДЫҚ: апталық сандықтан кездейсоқ түседі (анимациялы) ---- */
    { id: "star_rain", slot: "aura", chest: true, n: KZ.t("Жұлдыз жаңбыры"), unlock: "chest", back: true, svg: () => `<g fill="#ffd23f" stroke="${INK}" stroke-width="2" stroke-linejoin="round"><path class="fx fx-twinkle" d="${star(22, 70, 10)}"/><path class="fx fx-twinkle d2" d="${star(180, 60, 9)}"/><path class="fx fx-twinkle d3" d="${star(14, 150, 8)}"/><path class="fx fx-twinkle d4" d="${star(188, 150, 10)}"/><path class="fx fx-fall" d="${star(100, 18, 7)}"/><path class="fx fx-fall d3" d="${star(150, 26, 6)}"/></g>` },
    { id: "butterfly", slot: "pin", chest: true, n: KZ.t("Көбелек"), unlock: "chest", svg: () => `<g class="fx fx-bfly"><path d="M138 174C124 158 120 176 130 184C122 192 132 202 138 186Z" fill="#4dabf7" ${S3}/><path d="M138 174C152 158 156 176 146 184C154 192 144 202 138 186Z" fill="#f783ac" ${S3}/></g><path d="M138 172V190" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` },
    { id: "balloon", slot: "back", chest: true, n: KZ.t("Ұшатын шар"), unlock: "chest", back: true, svg: () => `<g class="fx fx-float"><path d="M168 96C168 134 168 134 168 140" fill="none" stroke="${INK}" stroke-width="3"/><ellipse cx="168" cy="70" rx="22" ry="28" fill="#ff6b6b" ${S}/><path d="M158 56Q160 46 170 44" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity=".7"/><path d="M164 98L168 104L172 98Z" fill="#e8504f" ${S3}/></g>` },
    { id: "heart_glasses", slot: "face", chest: true, n: KZ.t("Жүрек көзілдірік"), unlock: "chest", svg: () => `<g class="fx fx-pulse"><path d="M79 142C62 130 58 118 66 112C72 108 79 112 79 118C79 112 86 108 92 112C100 118 96 130 79 142Z" fill="#ff6b6b" ${S3}/></g><g class="fx fx-pulse d2"><path d="M121 142C104 130 100 118 108 112C114 108 121 112 121 118C121 112 128 108 134 112C142 118 138 130 121 142Z" fill="#ff6b6b" ${S3}/></g><path d="M96 120h8" ${S3}/>` },
    { id: "cat_ears", slot: "hat", chest: true, n: KZ.t("Мысық құлақ"), unlock: "chest", svg: () => `<g class="fx fx-ear"><path d="M54 88L52 40L88 66Z" fill="#ffa94d" ${S}/><path d="M60 78L60 54L78 68Z" fill="#f783ac"/></g><g class="fx fx-ear d3"><path d="M146 88L148 40L112 66Z" fill="#ffa94d" ${S}/><path d="M140 78L140 54L122 68Z" fill="#f783ac"/></g>` },
    { id: "cosmo_tee", slot: "outfit", chest: true, n: KZ.t("Ғарыш футболка"), unlock: "chest", svg: () => `<path d="${OUT}" fill="#1b1b3a" ${S}/><g fill="#ffffff"><circle class="fx fx-twinkle" cx="70" cy="184" r="2.5"/><circle class="fx fx-twinkle d2" cx="94" cy="190" r="2"/><circle class="fx fx-twinkle d3" cx="118" cy="184" r="2.8"/><circle class="fx fx-twinkle d4" cx="136" cy="190" r="2"/></g><circle cx="100" cy="182" r="6" fill="#ffd23f" ${S3}/>` },
    /* ---- МАУСЫМДЫҚ: мереке кезінде ғана ашық, кейін жабылады ---- */
    { id: "nauryz_wreath", slot: "hat", legend: true, n: KZ.t("Наурыз гүл тәжі"), unlock: { season: "nauryz" }, svg: () => `<path d="M48 84Q50 52 100 46Q150 52 152 84" fill="none" stroke="#51cf66" stroke-width="9" stroke-linecap="round"/><g ${S3}><circle class="fx fx-pulse" cx="62" cy="64" r="9" fill="#f783ac"/><circle class="fx fx-pulse d2" cx="100" cy="48" r="10" fill="#ffd23f"/><circle class="fx fx-pulse d3" cx="138" cy="64" r="9" fill="#4dabf7"/><circle cx="80" cy="52" r="6" fill="#ffa94d"/><circle cx="120" cy="52" r="6" fill="#f783ac"/></g><g fill="#f783ac"><circle class="fx fx-fall" cx="40" cy="60" r="3"/><circle class="fx fx-fall d2" cx="160" cy="52" r="3"/><circle class="fx fx-fall d3" cx="30" cy="90" r="2.5"/><circle class="fx fx-fall d4" cx="172" cy="84" r="2.5"/></g>` },
    { id: "snow_hat", slot: "hat", legend: true, n: KZ.t("Жаңа жыл бөрігі"), unlock: { season: "newyear" }, svg: () => `<path d="M52 84C52 50 76 34 108 40C136 44 150 60 150 84Z" fill="#e03131" ${S}/><rect x="46" y="76" width="108" height="18" rx="9" fill="#ffffff" ${S}/><g class="fx fx-flutter" style="transform-origin:70% 20%"><path d="M108 40Q150 30 160 62" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M108 40Q150 30 160 62" fill="none" stroke="#e03131" stroke-width="8" stroke-linecap="round"/><circle cx="162" cy="66" r="10" fill="#ffffff" ${S3}/></g><g fill="#ffffff" stroke="#74c0fc" stroke-width="1.5"><circle class="fx fx-fall" cx="30" cy="40" r="3.5"/><circle class="fx fx-fall d2" cx="62" cy="20" r="3"/><circle class="fx fx-fall d3" cx="150" cy="24" r="3.5"/><circle class="fx fx-fall d4" cx="176" cy="48" r="3"/></g>` },
    /* ---- апталық лига (өткен аптада сыныпта топ-3; тек осы апта ғана) ---- */
    { id: "lg1", slot: "hat", n: KZ.t("Алтын лавр (лига 🥇)"), unlock: { league: 1 }, svg: () => `<g ${S3} fill="#ffd23f"><ellipse cx="54" cy="84" rx="6" ry="11" transform="rotate(-28 54 84)"/><ellipse cx="47" cy="68" rx="6" ry="11" transform="rotate(-8 47 68)"/><ellipse cx="52" cy="52" rx="6" ry="11" transform="rotate(18 52 52)"/><ellipse cx="66" cy="40" rx="6" ry="11" transform="rotate(42 66 40)"/><ellipse cx="146" cy="84" rx="6" ry="11" transform="rotate(28 146 84)"/><ellipse cx="153" cy="68" rx="6" ry="11" transform="rotate(8 153 68)"/><ellipse cx="148" cy="52" rx="6" ry="11" transform="rotate(-18 148 52)"/><ellipse cx="134" cy="40" rx="6" ry="11" transform="rotate(-42 134 40)"/></g><path d="${star(100, 34, 13)}" fill="#ff6b6b" stroke="${INK}" stroke-width="3"/>` },
    { id: "lg2", slot: "pin", n: KZ.t("Күміс медаль (лига 🥈)"), unlock: { league: 2 }, svg: () => `<path d="M126 150l10 20M150 150l-10 20" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M126 150l10 20M150 150l-10 20" stroke="#4dabf7" stroke-width="5" stroke-linecap="round"/><circle cx="138" cy="182" r="14" fill="#ced4da" ${S3}/><text x="138" y="188" font-size="16" font-weight="900" text-anchor="middle" fill="#495057">2</text>` },
    { id: "lg3", slot: "pin", n: KZ.t("Қола медаль (лига 🥉)"), unlock: { league: 3 }, svg: () => `<path d="M126 150l10 20M150 150l-10 20" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M126 150l10 20M150 150l-10 20" stroke="#ff922b" stroke-width="5" stroke-linecap="round"/><circle cx="138" cy="182" r="14" fill="#e0955a" ${S3}/><text x="138" y="188" font-size="16" font-weight="900" text-anchor="middle" fill="#5c2b0f">3</text>` },
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
  /* маусым терезелері: [ай, күн] бастап — дейін (UTC емес, жергілікті уақыт) */
  const SEASONS = {
    nauryz: { a: [3, 14], b: [3, 25], t: KZ.t("14–25 наурыз") },
    newyear: { a: [12, 20], b: [1, 7], t: KZ.t("20 желтоқсан – 7 қаңтар") },
  };
  const inSeason = (k, now) => {
    const S = SEASONS[k];
    if (!S) return false;
    const d = now || new Date();
    const v = (d.getMonth() + 1) * 100 + d.getDate();
    const a = S.a[0] * 100 + S.a[1];
    const b = S.b[0] * 100 + S.b[1];
    return a <= b ? v >= a && v <= b : v >= a || v <= b;
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
    if (u === "start") return KZ.t("Бастапқы жиынтықта кездейсоқ беріледі");
    if (u === "chest") return KZ.t("Апталық сандықтан кездейсоқ түседі");
    if (u.season) return KZ.t("Маусымдық зат: тек ") + SEASONS[u.season].t + KZ.t(" аралығында киіледі");
    if (u.league) return KZ.t("Апталық лига: өткен аптада сыныпта ") + u.league + KZ.t("-орын алсаң, осы аптада ғана киесің");
    if (typeof u === "object") return KZ.t("Серия ") + u.streak + KZ.t(" күнге жеткенде ғана көрінеді");
    const a = KZ.ach.defs().find((x) => x.id === u);
    return a ? KZ.t("Жетістік: ") + a.t : KZ.t("Жетістік арқылы ашылады");
  };
  const hero = (KZ.hero = {
    items: ITEMS,
    slots: SLOTS,
    colors: COLORS,
    state: ensure,
    need,
    /* жасаушыға (owner) барлық зат ашық: көрініп тұрғанын тексеру үшін */
    god() {
      const A = KZ.auth;
      return !!(A && A.isActive && A.isActive() && A.profile && A.profile.role === "owner");
    },
    owned(i, s) {
      if (hero.god()) return true;
      s = s || ensure();
      const u = i.unlock;
      if (u === "start" || u === "chest") return s.starters.includes(i.id);
      if (u.season) return inSeason(u.season);
      if (u.league) return leagueRank() === u.league;
      if (typeof u === "object") return hero.bestStreak() >= u.streak;
      return !!KZ.ach.unlocked()[u];
    },
    bestStreak: () => (KZ.activity ? KZ.activity.best() : 0),
    /* серия ауасы тек қазіргі серия жеткілікті болғанда көрінеді */
    visible(i, ctx) {
      const u = i.unlock;
      if (u && u.season) return inSeason(u.season);
      if (u && u.league) return ctx && ctx.lg !== undefined ? ctx.lg === u.league : leagueRank() === u.league;
      if (u && u.streak) return (ctx && ctx.streak !== undefined ? ctx.streak : KZ.activity.streak().n) >= u.streak;
      return true;
    },
    weekKey,
    leagueRank,
    inSeason,
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
        setTimeout(() => KZ.toast && KZ.toast("🏅", KZ.t("Апталық лига: ") + rank + KZ.t("-орын!"), it ? KZ.t("Жаңа зат: ") + it.n + KZ.t(" — тек осы аптаға") : ""), 1200);
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
      document.querySelectorAll(".hero-fig[data-own]").forEach((f) => (f.innerHTML = hero.svg({ lite: f.dataset.lite === "1" })));
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
    /* SVG жолы (Мульт 3D стилі). opts: { eq, color, preview, still } */
    svg(opts) {
      const lite = !!(opts && opts.lite); // кішкентай суреттер: бұлыңғыр сүзгісіз (телефонға жеңіл)
      const own = !(opts && opts.eq);
      const s = own ? ensure() : opts;
      const c = s.color || "#6c5ce7";
      const eq = s.eq || {};
      const u = "hg" + ++gradN;
      const L = (x, t) => mix(x, "#ffffff", t);
      const Dk = (x, t) => mix(x, "#120d2a", t);
      const oc = Dk(c, 0.55); // контур: дененің қою реңі
      const SB = `stroke="${oc}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"`;
      const defs = {};
      /* зат түсі -> көлемді радиал градиент (жарық сол жақ жоғарыдан) */
      const grad = (hex) => {
        const k = hex.slice(1).toLowerCase();
        if (!defs[k]) defs[k] = `<radialGradient id="${u}g${k}" cx=".35" cy=".28" r=".95"><stop offset="0" stop-color="${L(hex, 0.55)}"/><stop offset=".5" stop-color="${hex}"/><stop offset="1" stop-color="${Dk(hex, 0.38)}"/></radialGradient>`;
        return `url(#${u}g${k})`;
      };
      /* ескі «жалпақ» заттарды 3D етеміз: түсті градиент, қара контурды өз түсінің қою реңімен ауыстырамыз */
      const inkRe = new RegExp(`stroke="${INK}"`, "g");
      const skin = (str) =>
        str.replace(/<(path|circle|ellipse|rect|polygon|g)\b([^>]*?)(\/?)>/g, (m, tag, a, sl) => {
          const fm = a.match(/fill="(#[0-9a-fA-F]{6})"/);
          if (fm) a = a.replace(fm[0], `fill="${grad(fm[1])}"`).replace(inkRe, `stroke="${Dk(fm[1], 0.6)}"`);
          else a = a.replace(inkRe, 'stroke="#2d2550"');
          a = a.replace(/stroke-width="4"/g, 'stroke-width="2.6"').replace(/stroke-width="3"/g, 'stroke-width="2.2"');
          return `<${tag}${a}${sl}>`;
        });
      const get = (slot) => {
        const it = BYID[eq[slot]];
        return it && it.slot === slot && (s.preview || (own && hero.god()) || hero.visible(it, s)) ? it : null;
      };
      let rich = false;
      const draw = (it) => {
        if (it.rich) rich = true;
        return `<g filter="url(#${u}sh)">${skin(it.svg(c, u))}</g>`;
      };
      const auras = get("aura");
      const back = get("back");
      const hat = get("hat");
      const outfit = get("outfit");
      const pin = get("pin");
      const neck = get("neck");
      const face = get("face");
      const fx = `
        <filter id="${u}b1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.1"/></filter>
        <filter id="${u}b3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
        <filter id="${u}b7" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>
        <filter id="${u}glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="${u}sh" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="2" stdDeviation="1.4" flood-color="#120d2a" flood-opacity=".28"/></filter>
        <clipPath id="${u}cb"><path d="${BODY}"/></clipPath>
        <clipPath id="${u}mo"><path d="M88 148Q100 165 112 148Q100 153 88 148Z"/></clipPath>
        <clipPath id="${u}mo2"><path d="M86 145C86 167 114 167 114 145Z"/></clipPath>
        <radialGradient id="${u}body" cx=".34" cy=".24" r="1"><stop offset="0" stop-color="${L(c, 0.6)}"/><stop offset=".28" stop-color="${L(c, 0.25)}"/><stop offset=".62" stop-color="${c}"/><stop offset="1" stop-color="${Dk(c, 0.42)}"/></radialGradient>
        <linearGradient id="${u}ao" x1="0" y1="0" x2="0" y2="1"><stop offset=".5" stop-color="${Dk(c, 0.7)}" stop-opacity="0"/><stop offset="1" stop-color="${Dk(c, 0.7)}" stop-opacity=".5"/></linearGradient>
        <linearGradient id="${u}side" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${Dk(c, 0.6)}" stop-opacity=".35"/><stop offset=".25" stop-color="${Dk(c, 0.6)}" stop-opacity="0"/><stop offset=".8" stop-color="${Dk(c, 0.6)}" stop-opacity="0"/><stop offset="1" stop-color="${Dk(c, 0.6)}" stop-opacity=".3"/></linearGradient>
        <radialGradient id="${u}iris" cx=".45" cy=".65" r=".7"><stop offset="0" stop-color="#9ff3ff"/><stop offset=".45" stop-color="#22b8cf"/><stop offset="1" stop-color="#0b5d7a"/></radialGradient>
        <linearGradient id="${u}ear" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6c8"/><stop offset=".45" stop-color="#ffd43b"/><stop offset="1" stop-color="#f08c00"/></linearGradient>
        <radialGradient id="${u}foot" cx=".4" cy=".25" r=".9"><stop offset="0" stop-color="${L(c, 0.25)}"/><stop offset="1" stop-color="${Dk(c, 0.5)}"/></radialGradient>
        <linearGradient id="${u}cur" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b2f2ea"/><stop offset=".45" stop-color="#2ec4b6"/><stop offset="1" stop-color="#0b7f74"/></linearGradient>`;
      const P = [];
      P.push(`<ellipse data-k="1" cx="100" cy="208" rx="62" ry="9" fill="#120d2a" opacity="${lite ? 0.13 : 0.22}" filter="url(#${u}b3)"/>`);
      if (auras) P.push(`<g class="hf-aura">${draw(auras)}</g>`);
      P.push('<g class="hf-bob">');
      if (back && back.back) P.push(draw(back));
      // аяқтар
      [78, 122].forEach((x) => P.push(`<ellipse cx="${x}" cy="200" rx="18" ry="9.5" fill="url(#${u}foot)" ${SB}/><ellipse cx="${x - 5}" cy="196" rx="6" ry="2.5" fill="#fff" opacity=".35" filter="url(#${u}b1)"/>`));
      // < > құлақтар: көлемді түтік
      const ear = (d, cls) => `<g class="${cls}"><path d="${d}" fill="none" stroke="#c75b00" stroke-width="17" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 1.5)"/><path d="${d}" fill="none" stroke="url(#${u}ear)" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" opacity=".75" transform="translate(-1 -2.5)" filter="url(#${u}b1)"/></g>`;
      P.push(ear("M40 98L18 124L40 150", "hf-ear-l") + ear("M160 98L182 124L160 150", "hf-ear-r"));
      // кішкентай қолдар
      [[46, -1], [154, 1]].forEach(([x, k]) => P.push(`<g transform="rotate(${k * -28} ${x} 160)"><ellipse cx="${x + k * 6}" cy="166" rx="10" ry="15" fill="url(#${u}body)" ${SB}/><ellipse cx="${x + k * 3}" cy="160" rx="3.5" ry="5" fill="#fff" opacity=".45" filter="url(#${u}b1)"/></g>`));
      // басындағы курсор (бас киім кисе, жасырылады)
      if (!hat) P.push(`<g class="hf-cur"><rect x="92" y="34" width="16" height="40" rx="8" fill="#2ec4b6" opacity=".35" filter="url(#${u}b3)"/><rect x="92" y="34" width="16" height="40" rx="8" fill="url(#${u}cur)" stroke="#0b6f66" stroke-width="2"/><rect x="96" y="39" width="4" height="16" rx="2" fill="#fff" opacity=".75"/></g>`);
      // дене: көлем, бүйір көлеңкесі, төменгі көлеңке, жылтыр
      P.push(`<path d="${BODY}" fill="url(#${u}body)" ${SB}/>`);
      P.push(`<g clip-path="url(#${u}cb)"><rect x="34" y="64" width="132" height="140" fill="url(#${u}side)"/><rect x="34" y="64" width="132" height="140" fill="url(#${u}ao)"/><path d="M62 186C82 196 118 196 138 186" fill="none" stroke="${L(c, 0.6)}" stroke-width="5" stroke-linecap="round" opacity=".45" filter="url(#${u}b1)"/></g>`);
      P.push(`<ellipse cx="70" cy="96" rx="22" ry="11" transform="rotate(-28 70 96)" fill="#fff" opacity=".38" filter="url(#${u}b3)"/><path d="M57 110C59 94 69 86 84 82" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".65"/><circle cx="54" cy="121" r="3" fill="#fff" opacity=".8"/>`);
      if (outfit) P.push(draw(outfit));
      if (pin) P.push(draw(pin));
      // ұрт
      P.push(`<ellipse data-k="1" cx="60" cy="148" rx="12" ry="7" fill="#ff5c9a" opacity="${lite ? 0.32 : 0.5}" filter="url(#${u}b3)"/><ellipse data-k="1" cx="140" cy="148" rx="12" ry="7" fill="#ff5c9a" opacity="${lite ? 0.32 : 0.5}" filter="url(#${u}b3)"/>`);
      // көздер: ақ алма, түрлі-түсті қарашық, жарқыл
      const eye = (x) =>
        `<ellipse cx="${x}" cy="129" rx="15" ry="18" fill="${Dk(c, 0.5)}" opacity=".35" filter="url(#${u}b3)"/><ellipse cx="${x}" cy="126" rx="13.5" ry="16" fill="#fff"/><ellipse cx="${x + 1}" cy="129" rx="10" ry="12" fill="url(#${u}iris)"/><ellipse cx="${x + 1}" cy="130" rx="5.5" ry="7" fill="#0a0720"/><path d="M${x - 13} 120Q${x} 106 ${x + 13} 120" fill="none" stroke="${Dk(c, 0.4)}" stroke-width="3" opacity=".35" filter="url(#${u}b1)"/><ellipse cx="${x + 4.5}" cy="122" rx="4.6" ry="5.4" fill="#fff"/><circle cx="${x - 4}" cy="135" r="2" fill="#fff" opacity=".9"/><circle cx="${x + 6}" cy="131" r="1.1" fill="#fff" opacity=".8"/>`;
      P.push(`<g class="hf-eyes hf-e1">${eye(80)}${eye(120)}</g>`);
      if (!s.still) P.push(`<g class="hf-e2"><path d="M67 130C71 115 89 115 93 130M107 130C111 115 129 115 133 130" fill="none" stroke="${Dk(c, 0.7)}" stroke-width="5.5" stroke-linecap="round"/></g>`);
      // қас
      P.push(`<path d="M67 103Q79 96 91 102M109 102Q121 96 133 103" fill="none" stroke="${Dk(c, 0.6)}" stroke-width="4.5" stroke-linecap="round"/>`);
      // ауыз: ашық күлкі (қуанғанда үлкен, мұңайғанда төмен)
      P.push(`<g class="hf-m1"><path d="M88 148Q100 165 112 148Q100 153 88 148Z" fill="#3a0f2e"/><ellipse cx="100" cy="160" rx="8" ry="5" fill="#ff7aa8" clip-path="url(#${u}mo)"/></g>`);
      if (!s.still) P.push(`<g class="hf-m2"><path d="M86 145C86 167 114 167 114 145Z" fill="#3a0f2e"/><ellipse cx="100" cy="162" rx="9" ry="6" fill="#ff7aa8" clip-path="url(#${u}mo2)"/><path d="M89 146H111" stroke="#fff" stroke-width="3" opacity=".9"/></g>`);
      if (!s.still) P.push(`<path class="hf-m3" d="M90 157C95 149 105 149 110 157" fill="none" stroke="#3a0f2e" stroke-width="3.5" stroke-linecap="round"/><path class="hf-sweat" d="M152 96C147 105 147 111 152 111C157 111 157 105 152 96Z" fill="#9fe3ff" stroke="#1c7ed6" stroke-width="1.5"/>`);
      if (neck) P.push(draw(neck));
      if (face) P.push(draw(face));
      if (hat) P.push(draw(hat));
      P.push("</g>");
      let defsStr = fx + Object.values(defs).join("") + (rich ? richDefs(u) : "");
      let body = P.join("");
      if (lite) {
        /* сүзгілерді алып тастаймыз: бұлыңғыр әшекейлер өшеді, қалғаны сүзгісіз қалады */
        defsStr = defsStr.replace(/<filter\b[\s\S]*?<\/filter>/g, "");
        body = body.replace(/<(\w+)([^>]*?) filter="url\(#hg\d+(\w+)\)"([^>]*?)(\/?)>/g, (m, tag, a1, id, a2, sl) => ((id === "b3" || id === "b7") && sl && !/data-k=/.test(a1 + a2) ? "" : `<${tag}${a1}${a2}${sl}>`));
      }
      return KZ.tt("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-12 -16 224 236\" role=\"img\" aria-label=\"Бит кейіпкері\"><defs>{0}</defs>{1}</svg>", defsStr, body);
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
      d.dataset.lite = "1"; // кішкентай: сүзгісіз
      d.innerHTML = hero.svg({ lite: true });
      d.addEventListener("click", () => hero.cheer());
      return d;
    },
    /* Жаңа ашылған заттарды хабарлау үшін: жетістіктен кейін қайсы зат ашылды */
    newFor(achIds) {
      return ITEMS.filter((i) => typeof i.unlock === "string" && achIds.includes(i.unlock));
    },
  });




  /* ---------- Апталық сандық: аптасына 3 күн белсенді болсаң, 1 кездейсоқ зат ---------- */
  const CKEY = "kodzholy.chest.v1";
  const CHEST_NEED = 3;
  const dstr = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const localMonday = () => {
    const d = new Date();
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return dstr(d);
  };
  const activeThisWeek = () => {
    const all = KZ.activity.all();
    const d = new Date();
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    let n = 0;
    for (let i = 0; i < 7; i++) {
      if ((all[dstr(d)] || 0) & 3) n++;
      d.setDate(d.getDate() + 1);
    }
    return n;
  };
  Object.assign(hero, {
    chestState() {
      const c = KZ.store.get(CKEY, null);
      const opened = !!(c && c.week === localMonday());
      const n = activeThisWeek();
      const left = ITEMS.filter((i) => i.chest && !hero.owned(i)).length;
      return { n, need: CHEST_NEED, opened, left, ready: !opened && n >= CHEST_NEED && left > 0 };
    },
    chestReady() {
      return hero.chestState().ready;
    },
    /* сандықты ашу: ашылған затты қайтарады */
    openChest() {
      const st = hero.chestState();
      if (!st.ready) return null;
      const s = ensure();
      const pool = ITEMS.filter((i) => i.chest && !hero.owned(i, s));
      const it = pool[Math.floor(Math.random() * pool.length)];
      s.starters.push(it.id);
      save(s);
      KZ.store.set(CKEY, { week: localMonday(), id: it.id });
      return it;
    },
  });

  /* ---------- Жаңа зат ашылғанда: анимациялы терезе ---------- */
  const popQ = [];
  let popOpen = false;
  function nextPop() {
    if (popOpen || !popQ.length) return;
    const it = popQ.shift();
    popOpen = true;
    const ov = el("div", "unl-ov");
    ov.setAttribute("role", "dialog");
    ov.setAttribute("aria-modal", "true");
    const box = el("div", "unl-box" + (it.legend ? " legend" : ""));
    for (let i = 0; i < 22; i++) {
      const c = el("i", "unl-c");
      c.style.cssText = `--x:${Math.round(Math.random() * 100)}%;--d:${(Math.random() * 1.2).toFixed(2)}s;--h:${Math.round(Math.random() * 360)};--r:${Math.round(Math.random() * 360)}deg`;
      box.appendChild(c);
    }
    const fig = el("div", "unl-fig");
    fig.innerHTML = hero.svg({ color: ensure().color, eq: { [it.slot]: it.id }, preview: true });
    const x = h("button", "btn", KZ.t("Жабу"));
    x.type = "button";
    const w = h("button", "btn primary", KZ.t("👕 Киіп көр"));
    w.type = "button";
    const close = () => {
      ov.classList.add("out");
      setTimeout(() => {
        ov.remove();
        popOpen = false;
        nextPop();
      }, 250);
    };
    x.addEventListener("click", close);
    w.addEventListener("click", () => {
      hero.equip(it.slot, it.id);
      hero.refresh();
      close();
    });
    ov.addEventListener("click", (e) => e.target === ov && close());
    box.append(h("div", "unl-tag", it.legend ? KZ.t("✨ АҢЫЗ ЗАТ ✨") : KZ.t("🎁 Жаңа зат!")), fig, h("b", "unl-name", it.n), h("small", null, need(it)), h("div", "unl-btns", w, x));
    ov.appendChild(box);
    document.body.appendChild(ov);
    w.focus();
  }
  hero.unlockPopup = (items) => {
    items.forEach((i) => popQ.push(i));
    setTimeout(nextPop, 700);
  };

  /* ---------- Сабақтағы көмекші: Бит тапсырма мен лекцияда сөйлейді ---------- */
  const SAY = {
    err: [KZ.t("Қате шықты — қорықпа, ол жол сілтеп тұр! Қызыл жазуды оқып көрейік."), KZ.t("Ештеңе етпейді, бағдарламашылар күніне жүз рет қателеседі 🐞"), KZ.t("Қате жолын тауып, бір әріпті түзетіп көр.")],
    bad: [KZ.t("Жақынсың! Тапсырма шартын қайта оқып көр."), KZ.t("Әлі сәл жетпей тұр. Нәтижені күткенмен салыстыр."), KZ.t("Ойланып көрейік: не өзгертсем болады?")],
    ok: [KZ.t("Керемет! Мықтысың! 🎉"), KZ.t("Дәл тапсың! Келесісіне!"), KZ.t("Ура! Бұл тапсырма шешілді ⭐"), KZ.t("Тамаша жұмыс!")],
    fail3: KZ.t("Бірнеше рет болмады ма? «Кеңес» батырмасын басып көр 💡"),
  };
  const FACTS = {
    python: [KZ.t("Python атауы жыланнан емес, «Монти Пайтон» комедия шоуынан шыққан."), KZ.t("Python-да шегініс (бос орын) — синтаксистің бір бөлігі, оны қалай болса солай қоюға болмайды."), KZ.t("print() ең алғашқы бағдарламаның қатар-қатарында жүреді: «Hello, world!».")],
    html: [KZ.t("HTML — бағдарламалау тілі емес, белгілеу тілі: ол бет құрылымын сипаттайды."), KZ.t("Алғашқы веб-сайт 1991 жылы жасалған және тек мәтіннен тұрған."), KZ.t("Тегтердің көбі жұп болады: ашатын <p> және жабатын </p>.")],
    css: [KZ.t("CSS — Cascading Style Sheets: «каскадты» дегені қайсы ереже басым екенін білдіреді."), KZ.t("Бір элементке бірнеше ереже тисе, нақтырақ селектор жеңеді."), KZ.t("Flexbox пен Grid болмай тұрған кезде беттер кестелермен жасалған.")],
    javascript: [KZ.t("JavaScript-ті 1995 жылы небәрі 10 күнде жазған деген әңгіме бар."), KZ.t("Java мен JavaScript — екі бөлек тіл, аттарының ұқсастығы тек маркетингтен."), KZ.t("Браузердің өзінде JavaScript жұмыс істейді — қосымша ештеңе орнатпайсың.")],
    kotlin: [KZ.t("Kotlin-ді JetBrains компаниясы жасады, аты Санкт-Петербург маңындағы Котлин аралынан шыққан."), KZ.t("Android қосымшаларының көбі қазір Kotlin-мен жазылады."), KZ.t("Kotlin-де қорап типі қатаң: Int-ке мәтін салуға болмайды, ал null-ға тек «?» белгілі қорап рұқсат береді.")],
    sql: [KZ.t("SQL-ді «сиквел» деп те оқиды, екеуі де дұрыс."), KZ.t("WHERE — жолдарды сүзеді, HAVING — топтарды сүзеді."), KZ.t("NULL — нөл емес, «мән жоқ» дегенді білдіреді.")],
    projects: [KZ.t("Үлкен жоба әрдайым кішкентай бөліктерден құралады."), KZ.t("Жобаны жазғанда алдымен жұмыс істейтін қарапайым нұсқа жаса, кейін әдемілей бер."), KZ.t("Кодты жиі іске қосып тексер — қатені ертерек табасың.")],
  };
  const FACTS_ANY = [KZ.t("Бағдарламашылардың көбі қатені Google-дан іздейді — бұл ұят емес 😉"), KZ.t("Күнде 10 минут оқу аптасына 1 сағат береді."), KZ.t("Қате — жаман емес, ол код саған жол көрсетіп тұр.")];
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
      x.setAttribute("aria-label", KZ.t("Жабу"));
      x.addEventListener("click", helperHide);
      helperEl.append(fig, bub, x);
      document.body.appendChild(helperEl);
      window.addEventListener("hashchange", () => {
        failN = 0;
        helperHide();
      });
    }
    const fig = helperEl.querySelector(".hero-fig");
    fig.dataset.lite = "1";
    fig.innerHTML = hero.svg({ lite: true });
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
        say("fact", KZ.t("💡 Білесің бе? ") + pick((FACTS[courseId] || []).concat(FACTS_ANY)), 8000);
      }, 3500);
    },
  });


  /* Бөлісу картасын PNG етіп сызу (сервер керек емес) */
  function shareCard(leg, legN, ach, achN) {
    const s = ensure();
    const svg = hero.svg({ color: s.color, eq: s.eq, still: true });
    const img = new Image();
    img.onload = () => {
      const W = 720;
      const H = 900;
      const cv = document.createElement("canvas");
      cv.width = W;
      cv.height = H;
      const g = cv.getContext("2d");
      const bgr = g.createLinearGradient(0, 0, 0, H);
      bgr.addColorStop(0, "#fff4c9");
      bgr.addColorStop(1, "#d0bfff");
      g.fillStyle = bgr;
      g.fillRect(0, 0, W, H);
      g.fillStyle = "#ffffff";
      g.strokeStyle = INK;
      g.lineWidth = 6;
      g.beginPath();
      g.roundRect(60, 60, W - 120, H - 120, 40);
      g.fill();
      g.stroke();
      g.drawImage(img, 160, 120, 400, 430);
      g.fillStyle = INK;
      g.textAlign = "center";
      const nm = (KZ.auth && KZ.auth.profile && KZ.auth.profile.full_name) || "Bitlings";
      g.font = "800 44px system-ui, sans-serif";
      g.fillText(nm.slice(0, 22), W / 2, 610);
      g.font = "700 30px system-ui, sans-serif";
      g.fillText("✨ " + leg + "/" + legN + "   🏆 " + ach + "/" + achN + "   🔥 " + KZ.activity.best(), W / 2, 670);
      g.font = "700 23px system-ui, sans-serif";
      g.fillStyle = "#6c5ce7";
      g.fillText(KZ.t("Python, HTML, CSS, JS, Kotlin, SQL үйреніп жатыр"), W / 2, 740);
      g.font = "800 30px system-ui, sans-serif";
      g.fillText("bitlings-kz.vercel.app", W / 2, 800);
      cv.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], "bitlings.png", { type: "image/png" });
        try {
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: "Bitlings" });
            return;
          }
        } catch (e) {
          if (e && e.name === "AbortError") return;
        }
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "bitlings.png";
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      }, "image/png");
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  /* Превьюлерді экранға жақындағанда ғана сызамыз (бет бірден жеңіл ашылады) */
  let lazyIO = null;
  function lazyFig(f, make) {
    if (!("IntersectionObserver" in window)) {
      f.innerHTML = make();
      return;
    }
    if (!lazyIO)
      lazyIO = new IntersectionObserver(
        (es) =>
          es.forEach((e) => {
            if (!e.isIntersecting) return;
            lazyIO.unobserve(e.target);
            const fn = e.target._make;
            e.target._make = null;
            if (fn) e.target.innerHTML = fn();
          }),
        { rootMargin: "300px 0px" }
      );
    f._make = make;
    lazyIO.observe(f);
  }

  /* ---------- Гардероб беті ---------- */
  KZ.heroPage = function (root) {
    root.textContent = "";
    if (KZ.ach) KZ.ach.check(true);
    const s = ensure();
    const page = el("div", "page");
    const back = h("a", "back", KZ.t("← Басты бет"));
    back.href = "#/";
    page.appendChild(back);
    page.appendChild(h("h1", null, KZ.t("🎽 Менің кейіпкерім")));
    page.appendChild(h("p", "hint", KZ.t("Бит — сенің кейіпкерің. Басында бірнеше зат кездейсоқ беріледі, ал қалғандарын жетістіктер мен күн сериясы арқылы ашасың.")));
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
    wrap.appendChild(h("b", null, KZ.t("Түсі")));
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
    wrap.appendChild(h("small", null, KZ.t("🔥 Қазіргі серия: ") + sa + KZ.t(" күн · ең ұзағы: ") + KZ.activity.best()));
    const lists = el("div", "hero-lists");
    const have0 = () => ITEMS.filter((i) => hero.owned(i, s)).length;
    const have = ITEMS.filter((i) => hero.owned(i, s)).length;
    /* ---------- Апталық сандық ---------- */
    const cs = hero.chestState();
    const cc = el("section", "card hero-chest" + (cs.ready ? " ready" : ""));
    const cbox = el("div", "chest-box");
    cbox.textContent = "🎁";
    const cbody = el("div", "chest-body");
    cbody.appendChild(h("b", null, KZ.t("🎁 Апталық сандық")));
    let msg;
    if (cs.left === 0) msg = KZ.t("Сандықтағы барлық заттарды жинадың! 🎉");
    else if (cs.opened) msg = KZ.t("Осы аптадағы сандық ашылды. Келесісі дүйсенбіде.");
    else if (cs.ready) msg = KZ.t("Сандық ашуға дайын! Ішінде кездейсоқ зат бар.");
    else msg = KZ.t("Осы аптада ") + CHEST_NEED + KZ.t(" күн тапсырма шешсең, сандық ашылады: ") + Math.min(cs.n, CHEST_NEED) + " / " + CHEST_NEED;
    cbody.appendChild(h("small", null, msg));
    const bar = el("div", "chest-bar");
    const fillb = el("i");
    fillb.style.width = Math.min(100, Math.round((Math.min(cs.n, CHEST_NEED) / CHEST_NEED) * 100)) + "%";
    bar.appendChild(fillb);
    cbody.appendChild(bar);
    const ob = h("button", "btn primary small", KZ.t("🎁 Ашу"));
    ob.type = "button";
    ob.disabled = !cs.ready;
    ob.addEventListener("click", () => {
      ob.disabled = true;
      cbox.classList.add("shake");
      setTimeout(async () => {
        cbox.classList.remove("shake");
        /* аккаунт бар болса, аптасына бір рет серверде тексеріледі (басқа құрылғыда ашылса, қайта ашылмайды) */
        const A = KZ.auth;
        if (A && A.isActive && A.isActive()) {
          try {
            const okc = await A.rpc("claim_chest", { wk: localMonday() });
            if (okc === false) {
              KZ.store.set(CKEY, { week: localMonday() });
              KZ.toast("🎁", KZ.t("Осы аптадағы сандық басқа құрылғыда ашылған"), KZ.t("Келесісі дүйсенбіде."));
              KZ.heroPage(root);
              return;
            }
          } catch (e) {
            /* офлайн: жергілікті шектеу ғана */
          }
        }
        const it = hero.openChest();
        if (it) {
          cbox.textContent = "✨";
          hero.unlockPopup([it]);
          setTimeout(() => KZ.heroPage(root), 2500);
        }
      }, 1100);
    });
    cbody.appendChild(ob);
    cc.append(cbox, cbody);
    page.appendChild(cc);

    /* ---------- Витрина: аңыз заттар, көрсеткіштер, бөлісу ---------- */
    const vit = el("section", "card hero-vit");
    const legAll = ITEMS.filter((i) => i.legend);
    const legHave = legAll.filter((i) => hero.owned(i, s));
    const achAll = KZ.ach.defs();
    const achHave = achAll.filter((a) => KZ.ach.unlocked()[a.id]).length;
    vit.appendChild(h("h2", "section-title", KZ.t("🏅 Витрина")));
    const st = el("div", "vit-stats");
    [
      ["✨", legHave.length + " / " + legAll.length, KZ.t("аңыз зат")],
      ["🎽", have0() + " / " + ITEMS.length, KZ.t("барлық зат")],
      ["🏆", achHave + " / " + achAll.length, KZ.t("жетістік")],
      ["🔥", String(KZ.activity.best()), KZ.t("ең ұзақ серия")],
    ].forEach(([e, v, t]) => st.appendChild(h("div", "vit-stat", h("span", null, e), h("b", null, v), h("small", null, t))));
    vit.appendChild(st);
    const shelf = el("div", "vit-shelf");
    legAll.forEach((i) => {
      const ok = legHave.includes(i);
      const c = el("div", "vit-slot" + (ok ? " on" : ""));
      const f = el("span", "hi-fig");
      if (ok) lazyFig(f, () => hero.svg({ color: s.color, eq: { [i.slot]: i.id }, preview: true, lite: true }));
      else f.textContent = "🔒";
      c.append(f, h("small", null, i.n));
      shelf.appendChild(c);
    });
    vit.appendChild(shelf);
    const share = h("button", "btn primary", KZ.t("📤 Бөлісу (сурет)"));
    share.type = "button";
    share.addEventListener("click", () => shareCard(legHave.length, legAll.length, achHave, achAll.length));
    vit.appendChild(share);
    page.appendChild(vit);
    page.appendChild(h("h2", "section-title", KZ.t("Гардероб · ") + have + " / " + ITEMS.length));
    SLOTS.forEach((sl) => {
      const sec = el("section", "card hero-slot");
      sec.appendChild(h("h3", null, sl.e + " " + sl.name));
      const grid = el("div", "hero-grid");
      const none = el("button", "hero-item none");
      none.type = "button";
      none.dataset.slot = sl.id;
      none.appendChild(h("span", "hi-fig", "∅"));
      none.appendChild(h("small", null, KZ.t("Жоқ")));
      none.addEventListener("click", () => {
        hero.equip(sl.id, null);
        redraw();
      });
      grid.appendChild(none);
      ITEMS.filter((i) => i.slot === sl.id).forEach((i) => {
        const ok = hero.owned(i, s);
        const b = el("button", "hero-item item" + (ok ? "" : " locked") + (i.legend ? " legend" : ""));
        b.type = "button";
        b.dataset.slot = sl.id;
        b.dataset.id = i.id;
        const f = el("span", "hi-fig");
        // алдын ала көру: сол заттың өзі киілген кейіпкер
        if (ok) lazyFig(f, () => hero.svg({ color: ensure().color, eq: { [sl.id]: i.id }, preview: true, lite: true }));
        else f.textContent = "🔒";
        b.append(f, h("small", null, i.n));
        if (i.chest) b.appendChild(h("small", "hi-legend", KZ.t("🎁 Сандықтан")));
        if (i.legend) b.appendChild(h("small", "hi-legend", i.unlock.season ? KZ.t("⏳ Маусымдық") : KZ.t("✨ Аңыз")));
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
        if (items.length) hero.unlockPopup(items);
      }
      return fresh;
    };
    KZ.ach._heroWrapped = true;
  }
})();
