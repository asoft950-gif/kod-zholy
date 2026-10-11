/* Bitlings: оқушының өз кейіпкері (Битлинг: < > құлақты желе-кейіпкер). Киімдер мен аксессуарлар жетістіктер мен серия арқылы ашылады.
   Күй: kodzholy.hero.v1 = { color, starters:[id], eq:{ slot: id } } */
(() => {
  "use strict";
  const { el, h } = KZ;
  const KEY = "kodzholy.hero.v1";
  const INK = "#1f1d36";
  const S = `stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;
  const S3 = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;

  const COLORS = [
    ["#3fae3c", KZ.t("Лайм (Loop)")],
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
    { id: "outfit", name: KZ.t("Костюм"), e: "👕" },
    { id: "head", name: KZ.t("Бас киім"), e: "🎩" },
    { id: "ears", name: KZ.t("Құлаққап"), e: "🎧" },
    { id: "face", name: KZ.t("Көзілдірік"), e: "🕶️" },
    { id: "neck", name: KZ.t("Мойын"), e: "🧣" },
    { id: "back", name: KZ.t("Арқа"), e: "🎒" },
    { id: "hand", name: KZ.t("Қолда"), e: "🪄" },
  ];

  /* Биттің пішіні (координаттар 0..200 x 0..220) */
  const BODY = "M100 62C142 62 160 88 160 122C160 150 140 170 100 170C60 170 40 150 40 122C40 88 58 62 100 62Z"; // бас (тұмсықты кесіртке)
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
  /* Loop Python гардеробы: lw — img/wardrobe/wardrobe.json ішіндегі id. unlock: "start" | жетістік id | "chest" */
  const ITEMS = [
    { id: "sk_street", lw: "street", slot: "outfit", n: KZ.t("Күнделікті худи"), unlock: "start" },
    { id: "sk_sport", lw: "sport", slot: "outfit", n: KZ.t("Спорттық киім"), unlock: "daily1" },
    { id: "sk_knight", lw: "knight", slot: "outfit", legend: true, n: KZ.t("Фэнтези сауыт"), unlock: "streak7" },
    { id: "sk_formal", lw: "formal", slot: "outfit", n: KZ.t("Классикалық костюм"), unlock: "poly" },
    { id: "sk_wizard", lw: "wizard", slot: "outfit", legend: true, n: KZ.t("Сиқыршы киімі"), unlock: "lv30" },
    { id: "sk_cyber", lw: "cyber", slot: "outfit", legend: true, n: KZ.t("Киберпанк киімі"), unlock: "game_z1" },
    { id: "ac_cap", lw: "cap", slot: "head", n: KZ.t("Кепка"), unlock: "start" },
    { id: "ac_beanie", lw: "beanie", slot: "head", chest: true, n: KZ.t("Тоқылған қалпақ"), unlock: "chest" },
    { id: "ac_wizard_hat", lw: "wizard-hat", slot: "head", legend: true, n: KZ.t("Сиқыршы қалпағы"), unlock: "done_python" },
    { id: "ac_crown", lw: "crown", slot: "head", legend: true, n: KZ.t("Алтын тәж"), unlock: "perfect60" },
    { id: "ac_helmet", lw: "space-helmet", slot: "head", legend: true, n: KZ.t("Ғарыш дулығасы"), unlock: "lv60" },
    { id: "ac_phones", lw: "headphones", slot: "ears", n: KZ.t("Құлаққап"), unlock: "streak3" },
    { id: "ac_glasses", lw: "glasses", slot: "face", n: KZ.t("Дөңгелек көзілдірік"), unlock: "start" },
    { id: "ac_scarf", lw: "scarf", slot: "neck", n: KZ.t("Шарф"), unlock: "start" },
    { id: "ac_backpack", lw: "backpack", slot: "back", n: KZ.t("Рюкзак"), unlock: "start" },
    { id: "ac_cape", lw: "cape", slot: "back", legend: true, n: KZ.t("Батыр мантиясы"), unlock: "streak14" },
    { id: "ac_wings", lw: "wings", slot: "back", legend: true, n: KZ.t("Фея қанаттары"), unlock: "streak30" },
    { id: "ac_wand", lw: "wand", slot: "hand", n: KZ.t("Сиқырлы таяқша"), unlock: "perfect10" },
  ];
  const BYID = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
  const STARTERS_N = 5;
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
    if (s && Array.isArray(s.starters)) {
      if (s.mv !== 4) {
        /* Loop Python гардеробы: ескі заттар жаңа жүйеге көшпейді, бастапқы жиынтық қайта беріледі */
        const pool = ITEMS.filter((i) => i.unlock === "start");
        s.mv = 4;
        s.starters = pool.map((i) => i.id);
        s.eq = {};
        pool.forEach((i) => {
          if (!s.eq[i.slot]) s.eq[i.slot] = i.id;
        });
        save(s);
      }
      return s;
    }
    const pool = ITEMS.filter((i) => i.unlock === "start");
    const pick = pool.slice().sort(() => Math.random() - 0.5).slice(0, STARTERS_N);
    s = { mv: 4, color: COLORS[0][0], starters: pick.map((i) => i.id), eq: {} };
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
    /* Мульт 3D стилінде қайта салынған заттар: { id: (c, u) => "<svg бөлігі>" } */
    skin3d(map) {
      ITEMS.forEach((it) => {
        const f = map[it.id];
        if (f) {
          it.svg = f;
          it.rich = true;
        }
      });
    },
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
          KZ.store.set(KEY, { mv: c.mv, color: c.color, starters: c.starters, eq: c.eq, t: ct });
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
    /* Кейіпкер суреті (canvas белгілеуі). opts: { eq, preview, still, lite }. lite/still — қозғалмайтын сурет; lite+still — бас қана (аватар) */
    svg(opts) {
      const own = !(opts && opts.eq);
      const s = own ? ensure() : opts;
      const eq = s.eq || {};
      const sel = {};
      SLOTS.forEach((sl) => {
        const it = BYID[eq[sl.id]];
        if (it && it.slot === sl.id && (s.preview || (own && hero.god()) || hero.visible(it, s))) sel[sl.id] = it.lw;
      });
      const lite = !!(opts && opts.lite);
      const still = !!(opts && opts.still);
      return KZ.mascot.markup(sel, { live: !lite && !still, crop: lite && still, px: lite ? (still ? 96 : 120) : 300 });
    },
    /* ойын, куәлік үшін: ағымдағы киім (lw id-лері) */
    lwSel() {
      const s = ensure();
      const sel = {};
      SLOTS.forEach((sl) => {
        const it = BYID[s.eq[sl.id]];
        if (it && it.slot === sl.id && (hero.god() || hero.visible(it, s))) sel[sl.id] = it.lw;
      });
      return sel;
    },
    /* куәлік/бөлісу картасы үшін: кейіпкер canvas ретінде */
    canvasAsync(px) {
      return KZ.mascot.snapshot(hero.lwSel(), px || 512);
    },
    /* Сәлем: қолын булғайды */
    wave(f) {
      if (!f || f.classList.contains("waving")) return;
      f.classList.add("waving");
      setTimeout(() => f.classList.remove("waving"), 2900);
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

  /* ---------- Сабақтағы көмекші: Битлинг тапсырма мен лекцияда сөйлейді ---------- */
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
    hero.canvasAsync(480).then((cv) => {
      img.src = cv.toDataURL("image/png");
    });
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
    page.appendChild(h("p", "hint", KZ.t("Битлинг — сенің кейіпкерің. Басында бірнеше зат кездейсоқ беріледі, ал қалғандарын жетістіктер мен күн сериясы арқылы ашасың.")));
    const stage = el("section", "card hero-stage");
    const fig = el("div", "hero-big");
    stage.appendChild(fig);
    const wrap = el("div", "hero-ctl");
    stage.appendChild(wrap);
    page.appendChild(stage);
    const redraw = () => {
      fig.innerHTML = hero.svg();
      lists.querySelectorAll(".item").forEach((b) => b.classList.toggle("on", ensure().eq[b.dataset.slot] === b.dataset.id));
      lists.querySelectorAll(".none").forEach((b) => b.classList.toggle("on", !ensure().eq[b.dataset.slot]));
    };
    const sw = el("div", "hero-sw");
    sw.hidden = true;
    fig.classList.add("hero-fig", "calm");
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
    cc.hidden = true;
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
    lists.hidden = true; // v3 кейіпкерде киім кадрлары жоқ — гардероб уақытша жасырылған
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
