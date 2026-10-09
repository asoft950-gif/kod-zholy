/* Bitlings: келушіге арналған басты бет (лендинг). Кірмеген адамға #/ ішінде, ал #/welcome әрдайым ашылады. */
(() => {
  "use strict";
  const { el, h } = KZ;
  const A = (cls, href, ...kids) => {
    const a = h("a", cls, ...kids);
    a.href = href;
    return a;
  };
  const sec = (cls, ...kids) => h("section", "lp-sec " + cls, ...kids);
  const head = (kicker, title, lead) => {
    const d = el("div", "lp-head");
    d.appendChild(h("small", null, kicker));
    d.appendChild(h("h2", null, title));
    if (lead) d.appendChild(h("p", null, lead));
    return d;
  };
  const feat = (emoji, title, text) => h("div", "lp-feat", h("span", "lp-fe", emoji), h("b", null, title), h("p", null, text));
  const bit = (color, eq, cls) => {
    const f = el("span", "hero-fig lp-bit" + (cls ? " " + cls : ""));
    f.innerHTML = KZ.hero ? KZ.hero.svg({ color, eq, preview: true }) : "🤖";
    f.addEventListener("click", () => KZ.hero && KZ.hero.cheer());
    return f;
  };

  KZ.landingPage = function (root) {
    root.textContent = "";
    const courses = KZ.courses.filter((c) => c.status === "ready" || c.levels);
    const nLevels = courses.reduce((n, c) => n + KZ.allLevels(c).length, 0);
    const nLect = courses.reduce((n, c) => n + (c.lectures ? c.lectures.length : 0), 0);
    const page = el("div", "lp");

    /* --- бірінші экран --- */
    const hero = el("section", "lp-hero");
    const txt = el("div", "lp-hero-text");
    txt.appendChild(h("span", "lp-pill", KZ.t("🇰🇿 Қазақ тілінде · браузерде · ештеңе орнатпай")));
    txt.appendChild(h("h1", null, KZ.t("Кодты "), h("mark", null, KZ.t("көзбен көріп")), KZ.t(" үйрен")));
    txt.appendChild(h("p", null, KZ.t("Python, HTML, CSS, JavaScript, Kotlin және SQL: код жаз, ол қалай жұмыс істейтінін бірден көр. Тапсырма шешіп ⭐ жина, кейіпкерің Бит-ті киіндір.")));
    txt.appendChild(h("div", "lp-cta", A("btn primary big", "#/login/register", KZ.t("✨ Тегін бастау")), A("btn big", "#/login", KZ.t("🔑 Кіру"))));
    txt.appendChild(h("small", "lp-note", KZ.t("Тіркелу бір минут алады. Прогресің барлық құрылғыда сақталады.")));
    hero.appendChild(txt);
    const stage = el("div", "lp-stage");
    stage.appendChild(bit("#6c5ce7", { hat: "cap", face: "round" }, "lp-bit-main"));
    stage.appendChild(h("div", "lp-bubble", KZ.t("Сәлем! Мен Бит. Бірге бастаймыз ба? 👋")));
    hero.appendChild(stage);
    page.appendChild(hero);

    /* --- сандар --- */
    page.appendChild(
      h("div", "lp-stats",
        h("div", null, h("b", null, String(courses.length)), h("span", null, KZ.nt(courses.length, "курс"))),
        h("div", null, h("b", null, String(nLect)), h("span", null, KZ.nt(nLect, "лекция"))),
        h("div", null, h("b", null, nLevels + "+"), h("span", null, KZ.t("тапсырма"))),
        h("div", null, h("b", null, "0 ₸"), h("span", null, KZ.t("қазір тегін"))))
    );

    /* --- қалай жұмыс істейді --- */
    const how = sec("lp-how", head(KZ.t("Қалай жұмыс істейді"), KZ.t("Үш қадам: оқы, шеш, өс")));
    const steps = el("div", "lp-grid3");
    steps.appendChild(feat("📖", KZ.t("1. Қысқа лекция"), KZ.t("Әр тақырып 3–5 минуттық түсіндірме және «орындап көр» мысалдары.")));
    steps.appendChild(feat("🎮", KZ.t("2. Тапсырма"), KZ.t("Кодты жазасың, нәтиже бірден көрінеді. Қате болса, қазақша түсіндіреді.")));
    steps.appendChild(feat("⭐", KZ.t("3. Жұлдыз бен жетістік"), KZ.t("Жұлдыз жинайсың, күн сериясын сақтайсың, жаңа киімдер ашасың.")));
    how.appendChild(steps);
    page.appendChild(how);

    /* --- курстар --- */
    const cs = sec("lp-courses", head(KZ.t("Курстар"), KZ.t("Нөлден бастап жобаға дейін"), KZ.t("Бәрі бір жерде, бір аккаунтпен.")));
    const grid = el("div", "lp-cgrid");
    courses.forEach((c) => {
      const a = A("lp-course", "#/login/register", h("span", "lp-ce", c.emoji), h("b", null, c.name), h("small", null, c.tagline), h("em", null, KZ.allLevels(c).length + KZ.t(" тапсырма")));
      a.style.setProperty("--c", c.color);
      grid.appendChild(a);
    });
    cs.appendChild(grid);
    page.appendChild(cs);

    /* --- Бит --- */
    const b = sec("lp-bits", head(KZ.t("Кейіпкерің Бит"), KZ.t("Өзіңнің Битіңді жаса"), KZ.t("Түсін таңда, жетістік пен серия арқылы бас киім, көзілдірік, жапқыш пен аура аш. Апталық лигада топ-3 арнайы зат алады.")));
    const row = el("div", "lp-bitrow");
    [["#ff6b6b", { hat: "wizard" }], ["#2ec4b6", { hat: "crown", face: "round" }], ["#ffa94d", { hat: "party", back: "cape" }], ["#4dabf7", { hat: "helmet" }], ["#f783ac", { hat: "takiya", face: "round" }]].forEach(([c, eq]) => row.appendChild(bit(c, eq)));
    b.appendChild(row);
    page.appendChild(b);

    /* --- мұғалімдерге --- */
    const t = sec("lp-teach", head(KZ.t("Мұғалімдерге"), KZ.t("Сыныбыңды бір жерден басқар"), KZ.t("Бағдарлама сабақты ауыстырмайды: ол сабаққа көмектеседі.")));
    const tg = el("div", "lp-grid3");
    tg.appendChild(feat("🏫", KZ.t("Сынып коды"), KZ.t("Сынып ашып, кодты оқушыларға бересің. Олар қосылады.")));
    tg.appendChild(feat("📝", KZ.t("Тапсырма беру"), KZ.t("Дайын деңгейді не өз тапсырмаңды мерзімімен тағайындайсың.")));
    tg.appendChild(feat("📊", KZ.t("Статистика мен есеп"), KZ.t("Кім қанша тапсырма жасады, кімге көмек керек. Апталық есепті басып шығарасың не PDF-ке сақтайсың.")));
    tg.appendChild(feat("🏆", KZ.t("Рейтинг"), KZ.t("Қаласаң ғана қосасың. Өшіріп тұрса, оқушылар көрмейді.")));
    tg.appendChild(feat("🔑", KZ.t("Құпиясөзді қалпына келтіру"), KZ.t("Оқушы ұмытса, уақытша құпиясөзді өзің қоясың, пошта керек емес.")));
    tg.appendChild(feat("⭐", KZ.t("Әділ жұлдыз"), KZ.t("Жұлдыз сервер жағында тексеріледі, оны қолмен жасап алуға болмайды.")));
    t.appendChild(tg);
    t.appendChild(h("div", "lp-cta", A("btn primary big", "#/login/register", KZ.t("👩‍🏫 Мұғалім ретінде тіркелу")), h("small", "lp-note", KZ.t("Мұғалім аккаунтын әкімші растайды."))));
    page.appendChild(t);

    /* --- ата-аналарға --- */
    const p = sec("lp-parents", head(KZ.t("Ата-аналарға"), KZ.t("Баланың экран уақыты пайдалы болсын")));
    const pg = el("div", "lp-grid3");
    pg.appendChild(feat("🧠", KZ.t("Ойлауды үйретеді"), KZ.t("Бала жаттамайды: өзі жазып, нәтижесін көреді де, қатесін өзі түзетеді.")));
    pg.appendChild(feat("⏱️", KZ.t("Күніне 10–15 минут"), KZ.t("Қысқа тапсырмалар мен күн сериясы тұрақты әдет қалыптастырады.")));
    pg.appendChild(feat("🛡️", KZ.t("Жарнамасыз және қарапайым"), KZ.t("Жарнама жоқ, қосымша ештеңе орнатпайсың. Тек аты мен поштасы сақталады.")));
    pg.appendChild(feat("👀", KZ.t("Не істеп жатқанын көресің"), KZ.t("Баланың жетістіктері мен сертификаттарын бірге қарауға болады.")));
    p.appendChild(pg);
    page.appendChild(p);

    /* --- соңғы шақыру --- */
    page.appendChild(
      h("section", "lp-final",
        bit("#6c5ce7", { hat: "beanie" }, "lp-bit-sm"),
        h("h2", null, KZ.t("Бүгін бастайық!")),
        h("p", null, KZ.t("Бір минут: тіркел де, бірінші тапсырманы шеш.")),
        h("div", "lp-cta", A("btn primary big", "#/login/register", KZ.t("✨ Тегін бастау")), A("btn big", "#/login", KZ.t("🔑 Аккаунтқа кіру"))))
    );
    root.appendChild(page);
  };
})();
