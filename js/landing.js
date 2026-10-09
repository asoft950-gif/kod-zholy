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
    txt.appendChild(h("span", "lp-pill", "🇰🇿 Қазақ тілінде · браузерде · ештеңе орнатпай"));
    txt.appendChild(h("h1", null, "Кодты ", h("mark", null, "көзбен көріп"), " үйрен"));
    txt.appendChild(h("p", null, "Python, HTML, CSS, JavaScript және SQL: код жаз, ол қалай жұмыс істейтінін бірден көр. Тапсырма шешіп ⭐ жина, кейіпкерің Бит-ті киіндір."));
    txt.appendChild(h("div", "lp-cta", A("btn primary big", "#/login/register", "✨ Тегін бастау"), A("btn big", "#/login", "🔑 Кіру")));
    txt.appendChild(h("small", "lp-note", "Тіркелу бір минут алады. Прогресің барлық құрылғыда сақталады."));
    hero.appendChild(txt);
    const stage = el("div", "lp-stage");
    stage.appendChild(bit("#6c5ce7", { hat: "cap", face: "round" }, "lp-bit-main"));
    stage.appendChild(h("div", "lp-bubble", "Сәлем! Мен Бит. Бірге бастаймыз ба? 👋"));
    hero.appendChild(stage);
    page.appendChild(hero);

    /* --- сандар --- */
    page.appendChild(
      h("div", "lp-stats",
        h("div", null, h("b", null, String(courses.length)), h("span", null, "курс")),
        h("div", null, h("b", null, String(nLect)), h("span", null, "лекция")),
        h("div", null, h("b", null, nLevels + "+"), h("span", null, "тапсырма")),
        h("div", null, h("b", null, "0 ₸"), h("span", null, "қазір тегін")))
    );

    /* --- қалай жұмыс істейді --- */
    const how = sec("lp-how", head("Қалай жұмыс істейді", "Үш қадам: оқы, шеш, өс"));
    const steps = el("div", "lp-grid3");
    steps.appendChild(feat("📖", "1. Қысқа лекция", "Әр тақырып 3–5 минуттық түсіндірме және «орындап көр» мысалдары."));
    steps.appendChild(feat("🎮", "2. Тапсырма", "Кодты жазасың, нәтиже бірден көрінеді. Қате болса, қазақша түсіндіреді."));
    steps.appendChild(feat("⭐", "3. Жұлдыз бен жетістік", "Жұлдыз жинайсың, күн сериясын сақтайсың, жаңа киімдер ашасың."));
    how.appendChild(steps);
    page.appendChild(how);

    /* --- курстар --- */
    const cs = sec("lp-courses", head("Курстар", "Нөлден бастап жобаға дейін", "Бәрі бір жерде, бір аккаунтпен."));
    const grid = el("div", "lp-cgrid");
    courses.forEach((c) => {
      const a = A("lp-course", "#/login/register", h("span", "lp-ce", c.emoji), h("b", null, c.name), h("small", null, c.tagline), h("em", null, KZ.allLevels(c).length + " тапсырма"));
      a.style.setProperty("--c", c.color);
      grid.appendChild(a);
    });
    cs.appendChild(grid);
    page.appendChild(cs);

    /* --- Бит --- */
    const b = sec("lp-bits", head("Кейіпкерің Бит", "Өзіңнің Битіңді жаса", "Түсін таңда, жетістік пен серия арқылы бас киім, көзілдірік, жапқыш пен аура аш. Апталық лигада топ-3 арнайы зат алады."));
    const row = el("div", "lp-bitrow");
    [["#ff6b6b", { hat: "wizard" }], ["#2ec4b6", { hat: "crown", face: "round" }], ["#ffa94d", { hat: "party", back: "cape" }], ["#4dabf7", { hat: "helmet" }], ["#f783ac", { hat: "takiya", face: "round" }]].forEach(([c, eq]) => row.appendChild(bit(c, eq)));
    b.appendChild(row);
    page.appendChild(b);

    /* --- мұғалімдерге --- */
    const t = sec("lp-teach", head("Мұғалімдерге", "Сыныбыңды бір жерден басқар", "Бағдарлама сабақты ауыстырмайды: ол сабаққа көмектеседі."));
    const tg = el("div", "lp-grid3");
    tg.appendChild(feat("🏫", "Сынып коды", "Сынып ашып, кодты оқушыларға бересің. Олар қосылады."));
    tg.appendChild(feat("📝", "Тапсырма беру", "Дайын деңгейді не өз тапсырмаңды мерзімімен тағайындайсың."));
    tg.appendChild(feat("📊", "Статистика мен есеп", "Кім қанша тапсырма жасады, кімге көмек керек. Апталық есепті басып шығарасың не PDF-ке сақтайсың."));
    tg.appendChild(feat("🏆", "Рейтинг", "Қаласаң ғана қосасың. Өшіріп тұрса, оқушылар көрмейді."));
    tg.appendChild(feat("🔑", "Құпиясөзді қалпына келтіру", "Оқушы ұмытса, уақытша құпиясөзді өзің қоясың, пошта керек емес."));
    tg.appendChild(feat("⭐", "Әділ жұлдыз", "Жұлдыз сервер жағында тексеріледі, оны қолмен жасап алуға болмайды."));
    t.appendChild(tg);
    t.appendChild(h("div", "lp-cta", A("btn primary big", "#/login/register", "👩‍🏫 Мұғалім ретінде тіркелу"), h("small", "lp-note", "Мұғалім аккаунтын әкімші растайды.")));
    page.appendChild(t);

    /* --- ата-аналарға --- */
    const p = sec("lp-parents", head("Ата-аналарға", "Баланың экран уақыты пайдалы болсын"));
    const pg = el("div", "lp-grid3");
    pg.appendChild(feat("🧠", "Ойлауды үйретеді", "Бала жаттамайды: өзі жазып, нәтижесін көреді де, қатесін өзі түзетеді."));
    pg.appendChild(feat("⏱️", "Күніне 10–15 минут", "Қысқа тапсырмалар мен күн сериясы тұрақты әдет қалыптастырады."));
    pg.appendChild(feat("🛡️", "Жарнамасыз және қарапайым", "Жарнама жоқ, қосымша ештеңе орнатпайсың. Тек аты мен поштасы сақталады."));
    pg.appendChild(feat("👀", "Не істеп жатқанын көресің", "Баланың жетістіктері мен сертификаттарын бірге қарауға болады."));
    p.appendChild(pg);
    page.appendChild(p);

    /* --- соңғы шақыру --- */
    page.appendChild(
      h("section", "lp-final",
        bit("#6c5ce7", { hat: "beanie" }, "lp-bit-sm"),
        h("h2", null, "Бүгін бастайық!"),
        h("p", null, "Бір минут: тіркел де, бірінші тапсырманы шеш."),
        h("div", "lp-cta", A("btn primary big", "#/login/register", "✨ Тегін бастау"), A("btn big", "#/login", "🔑 Аккаунтқа кіру")))
    );
    root.appendChild(page);
  };
})();
