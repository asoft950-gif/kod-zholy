/* HTML курсы: тапсырмалар, қосымша, лекциялар, анықтамалық */
(() => {
  const c = KZ.getCourse("html");
  c.status = "ready";

  const has = (re, label) => (d, w, code) => [{ label, ok: re.test(code) }];

  c.levels = [
    /* ---------- 1. Бет құрылымы ---------- */
    {
      id: "1.1", kind: "html", title: "Бірінші тақырып",
      task: "<p>Бетке үлкен тақырып қос: <code>&lt;h1&gt;</code> тегінің ішіне <b>Сәлем, әлем!</b> деп жаз.</p>" +
        "<p class='tip'>Тег екі бөліктен тұрады: ашатын <code>&lt;h1&gt;</code> және жабатын <code>&lt;/h1&gt;</code>. Мәтін солардың арасына жазылады.</p>",
      hint: "Жазып көр: <h1>Сәлем, әлем!</h1>. Оң жақта бетте тақырып пайда болады, ал «Құрылым ағашында» <h1> көрінеді.",
      starter: "<!-- кодты осында жаз -->\n",
      solution: "<h1>Сәлем, әлем!</h1>\n",
      par: 1,
      check: { rules: [{ sel: "h1", count: 1, text: "Сәлем, әлем!", label: "Бетте «Сәлем, әлем!» деген бір <h1> бар" }] },
    },
    {
      id: "1.2", kind: "html", title: "Бет қаңқасы",
      task: "<p>Нағыз HTML-бет қаңқасын жаса: <code>&lt;html&gt;</code> ішінде <code>&lt;head&gt;</code> (оның ішінде <code>&lt;title&gt;</code>) және <code>&lt;body&gt;</code> (оның ішінде <code>&lt;h1&gt;</code>) болсын.</p>" +
        "<p class='tip'><b>head</b> — бет туралы мәлімет (браузер қойындысындағы ат), <b>body</b> — көрінетін бөлігі.</p>",
      hint: "<html>\n  <head>\n    <title>Менің бетім</title>\n  </head>\n  <body>\n    <h1>Сәлем</h1>\n  </body>\n</html>",
      starter: "<html>\n\n</html>\n",
      solution: "<html>\n  <head>\n    <title>Менің бетім</title>\n  </head>\n  <body>\n    <h1>Сәлем</h1>\n  </body>\n</html>\n",
      par: 8,
      check: {
        rules: [
          { sel: "head > title", text: /\S/, label: "<head> ішінде мәтіні бар <title> бар" },
          { sel: "body > h1", text: /\S/, label: "<body> ішінде мәтіні бар <h1> бар" },
        ],
        fn: (d, w, code) => [
          { label: "Код <html> тегінен басталады", ok: /<html[\s>]/i.test(code) && /<\/html>/i.test(code) },
          { label: "<head> және <body> өз жабатын тегімен жазылған", ok: /<\/head>/i.test(code) && /<\/body>/i.test(code) },
        ],
      },
    },

    /* ---------- 2. Мәтін ---------- */
    {
      id: "2.1", kind: "html", title: "Тақырыптар деңгейі",
      task: "<p>Бір <code>&lt;h1&gt;</code> (<b>Менің блогым</b>) және екі <code>&lt;h2&gt;</code> тақырып жаса (мәтіндерін өзің ойлап тап).</p>" +
        "<p class='tip'>h1 — ең үлкен, h6 — ең кішкентай. Беттің басты тақырыбы (h1) бір ғана болады.</p>",
      hint: "<h1>Менің блогым</h1> жаз, одан кейін екі рет <h2>…</h2>.",
      starter: "",
      solution: "<h1>Менің блогым</h1>\n<h2>Бүгінгі күн</h2>\n<h2>Менің жоспарым</h2>\n",
      par: 3,
      check: { rules: [
        { sel: "h1", count: 1, text: "Менің блогым", label: "Бір <h1> бар: «Менің блогым»" },
        { sel: "h2", min: 2, text: /\S/, label: "Кемінде екі <h2> бар" },
      ] },
    },
    {
      id: "2.2", kind: "html", title: "Әдемі абзац",
      task: "<p>Бір <code>&lt;p&gt;</code> абзац жаса. Оның ішінде: <code>&lt;b&gt;</code> (қалың), <code>&lt;i&gt;</code> (көлбеу) және <code>&lt;br&gt;</code> (жаңа жолға өту) болсын.</p>",
      hint: "<p>Мен <b>HTML</b> үйренемін, <i>өте қызық!</i><br>Жаңа жол осында.</p>",
      starter: "",
      solution: "<p>Мен <b>HTML</b> үйренемін, <i>өте қызық!</i><br>Жаңа жол осында.</p>\n",
      par: 2,
      check: { rules: [
        { sel: "p", count: 1, label: "Бір <p> абзац бар" },
        { sel: "p b", text: /\S/, label: "Абзацта <b> бар" },
        { sel: "p i", text: /\S/, label: "Абзацта <i> бар" },
        { sel: "p br", label: "Абзацта <br> бар" },
      ] },
    },

    /* ---------- 3. Суреттер мен сілтемелер ---------- */
    {
      id: "3.1", kind: "html", title: "Робот суреті",
      task: "<p>Бетке <code>assets/robot.svg</code> суретін қой. <code>&lt;img&gt;</code> тегінің <code>src</code> (суреттің орны) және <code>alt</code> (сурет сипаттамасы) атрибуттары болсын.</p>" +
        "<p class='tip'><code>&lt;img&gt;</code> жабылмайды: оның ішінде мәтін жоқ.</p>",
      hint: '<img src="assets/robot.svg" alt="Робот">',
      starter: "",
      solution: '<img src="assets/robot.svg" alt="Робот">\n',
      par: 1,
      check: { rules: [
        { sel: "img", count: 1, attr: { src: /robot\.svg$/ }, label: "<img> src арқылы assets/robot.svg-ге сілтейді" },
        { sel: "img", attr: { alt: /\S/ }, label: "<img> тегінде бос емес alt бар" },
      ] },
    },
    {
      id: "3.2", kind: "html", title: "Сілтеме",
      task: "<p><code>&lt;a&gt;</code> тегімен сілтеме жаса: мәтіні <b>Википедия</b>, мекенжайы <code>https://kk.wikipedia.org</code> болсын.</p>",
      hint: '<a href="https://kk.wikipedia.org">Википедия</a>',
      starter: "",
      solution: '<a href="https://kk.wikipedia.org">Википедия</a>\n',
      par: 1,
      check: { rules: [
        { sel: "a", count: 1, text: "Википедия", attr: { href: /^https:\/\/kk\.wikipedia\.org\/?$/ }, label: "<a> мәтіні «Википедия», href мекенжайы дұрыс" },
      ] },
    },

    /* ---------- 4. Тізімдер мен кестелер ---------- */
    {
      id: "4.1", kind: "html", title: "Сатып алу тізімі",
      task: "<p>Маркерлі тізім жаса: <code>&lt;ul&gt;</code> ішінде үш <code>&lt;li&gt;</code> пункт (нан, сүт, алма — не өзің қалағаның).</p>",
      hint: "<ul>\n  <li>Нан</li>\n  <li>Сүт</li>\n  <li>Алма</li>\n</ul>",
      starter: "",
      solution: "<ul>\n  <li>Нан</li>\n  <li>Сүт</li>\n  <li>Алма</li>\n</ul>\n",
      par: 5,
      check: { rules: [
        { sel: "ul", count: 1, label: "Бір <ul> тізім бар" },
        { sel: "ul > li", min: 3, text: /\S/, label: "<ul> ішінде кемінде үш <li> бар" },
      ] },
    },
    {
      id: "4.2", kind: "html", title: "Кішкентай кесте",
      task: "<p>2 жолы және 2 бағаны бар кесте жаса. Бірінші жолда <code>&lt;th&gt;</code> (тақырып ұяшықтары), екіншісінде <code>&lt;td&gt;</code> (деректер) болсын.</p>" +
        "<p class='tip'><code>&lt;tr&gt;</code> — жол, <code>&lt;th&gt;</code>/<code>&lt;td&gt;</code> — жол ішіндегі ұяшықтар.</p>",
      hint: "<table>\n  <tr>\n    <th>Аты</th>\n    <th>Жасы</th>\n  </tr>\n  <tr>\n    <td>Алия</td>\n    <td>12</td>\n  </tr>\n</table>",
      starter: "",
      solution: "<table>\n  <tr>\n    <th>Аты</th>\n    <th>Жасы</th>\n  </tr>\n  <tr>\n    <td>Алия</td>\n    <td>12</td>\n  </tr>\n</table>\n",
      par: 10,
      check: { rules: [
        { sel: "table", count: 1, label: "Бір <table> бар" },
        { sel: "tr", count: 2, label: "Дәл 2 жол (<tr>) бар" },
        { sel: "tr > th", min: 2, text: /\S/, label: "Тақырып ұяшықтары (<th>) бар" },
        { sel: "tr > td", min: 2, text: /\S/, label: "Дерек ұяшықтары (<td>) бар" },
      ] },
    },

    /* ---------- 5. Формалар ---------- */
    {
      id: "5.1", kind: "html", title: "Есім формасы",
      task: "<p><code>&lt;form&gt;</code> жаса: ішінде мәтін өрісі <code>&lt;input type=\"text\"&gt;</code> (<code>placeholder</code> — көмекші жазуы болсын) және <code>&lt;button&gt;</code> батырмасы тұрсын.</p>",
      hint: '<form>\n  <input type="text" placeholder="Атың">\n  <button>Жіберу</button>\n</form>',
      starter: "",
      solution: '<form>\n  <input type="text" placeholder="Атың">\n  <button>Жіберу</button>\n</form>\n',
      par: 4,
      check: { rules: [
        { sel: "form input[type=text]", attr: { placeholder: /\S/ }, label: "Формада placeholder-і бар мәтін өрісі бар" },
        { sel: "form button", text: /\S/, label: "Формада мәтіні бар батырма бар" },
      ] },
    },
    {
      id: "5.2", kind: "html", title: "Таңдау формасы",
      task: "<p>Формаға қос: <code>&lt;label&gt;</code> жазуы бар құсбелгі (<code>type=\"checkbox\"</code>) және екі нұсқасы бар <code>&lt;select&gt;</code> (<code>&lt;option&gt;</code> нұсқалары).</p>",
      hint: '<form>\n  <label><input type="checkbox"> Келісемін</label>\n  <select>\n    <option>Python</option>\n    <option>HTML</option>\n  </select>\n</form>',
      starter: "<form>\n\n</form>\n",
      solution: '<form>\n  <label><input type="checkbox"> Келісемін</label>\n  <select>\n    <option>Python</option>\n    <option>HTML</option>\n  </select>\n</form>\n',
      par: 8,
      check: { rules: [
        { sel: "form label", text: /\S/, label: "Формада жазуы бар <label> бар" },
        { sel: "form input[type=checkbox]", label: "Құсбелгі (checkbox) бар" },
        { sel: "form select > option", min: 2, text: /\S/, label: "<select> ішінде кемінде 2 <option> бар" },
      ] },
    },

    /* ---------- 6. Семантика ---------- */
    {
      id: "6.1", kind: "html", title: "Семантикалық қаңқа",
      task: "<p>Бет бөліктерін мағынасына қарай ата: <code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;footer&gt;</code>. Әрқайсысының ішінде қысқа мәтін болсын.</p>",
      hint: "<header>Тақырып</header>\n<nav>Мәзір</nav>\n<main>Негізгі бөлім</main>\n<footer>Төменгі бөлім</footer>",
      starter: "",
      solution: "<header>Тақырып</header>\n<nav>Мәзір</nav>\n<main>Негізгі бөлім</main>\n<footer>Төменгі бөлім</footer>\n",
      par: 8,
      check: { rules: ["header", "nav", "main", "footer"].map((t) => ({ sel: t, count: 1, text: /\S/, label: "Мәтіні бар <" + t + "> бар" })) },
    },
    {
      id: "6.2", kind: "html", title: "Бөлімдер",
      task: "<p><code>&lt;main&gt;</code> ішінде екі <code>&lt;section&gt;</code> жаса. Әр бөлімде <code>&lt;h2&gt;</code> тақырып пен <code>&lt;p&gt;</code> абзац болсын.</p>",
      hint: "<main>\n  <section>\n    <h2>…</h2>\n    <p>…</p>\n  </section>\n  <section>…</section>\n</main>",
      starter: "",
      solution: "<main>\n  <section>\n    <h2>Біз туралы</h2>\n    <p>Біз кодтауды үйренеміз.</p>\n  </section>\n  <section>\n    <h2>Байланыс</h2>\n    <p>Хат жаз.</p>\n  </section>\n</main>\n",
      par: 12,
      check: { rules: [
        { sel: "main > section", count: 2, label: "<main> ішінде дәл 2 <section> бар" },
        { sel: "section > h2", min: 2, text: /\S/, label: "Әр бөлімде <h2> бар" },
        { sel: "section > p", min: 2, text: /\S/, label: "Әр бөлімде <p> бар" },
      ], fn: (d) => {
        const s = [...d.querySelectorAll("main > section")];
        return [{ label: "Әр <section> ішінде өз <h2> және <p> тұр", ok: s.length >= 2 && s.every((x) => x.querySelector("h2") && x.querySelector("p")) }];
      } },
    },

    /* ---------- 7. Жоба ---------- */
    {
      id: "7.1", kind: "html", title: "Визит карточкасы",
      task: "<p>Өзің туралы шағын бет жаса: <code>&lt;h1&gt;</code> (атың), <code>&lt;img&gt;</code> (<code>assets/cat.svg</code> не <code>assets/robot.svg</code>), <code>&lt;p&gt;</code> (өзің туралы), <code>&lt;ul&gt;</code> (кемінде 2 хобби) және <code>&lt;a&gt;</code> сілтеме.</p>",
      hint: "Бұрынғы тапсырмалардағы кодты біріктір: h1, img, p, ul + li, a.",
      starter: "",
      solution: '<h1>Алия</h1>\n<img src="assets/cat.svg" alt="Мысық">\n<p>Мен 12 жастамын.</p>\n<ul>\n  <li>Сурет салу</li>\n  <li>Кодтау</li>\n</ul>\n<a href="https://kk.wikipedia.org">Википедия</a>\n',
      par: 8,
      check: { rules: [
        { sel: "h1", count: 1, text: /\S/, label: "Тақырып (<h1>) бар" },
        { sel: "img", attr: { src: /assets\/(cat|robot|star)\.svg$/, alt: /\S/ }, label: "Суреті мен alt-ы бар <img> бар" },
        { sel: "p", text: /\S/, label: "Өзің туралы <p> бар" },
        { sel: "ul > li", min: 2, text: /\S/, label: "Тізімде кемінде 2 пункт бар" },
        { sel: "a", attr: { href: /^https?:\/\// }, text: /\S/, label: "Сілтеме (<a>) бар" },
      ] },
    },
    {
      id: "7.2", kind: "html", title: "Толық бет",
      task: "<p>Семантикалық бет жаса: <code>&lt;header&gt;</code> ішінде <code>&lt;h1&gt;</code>; <code>&lt;nav&gt;</code> ішінде 2 сілтеме; <code>&lt;main&gt;</code> ішінде <code>&lt;section&gt;</code> (<code>&lt;h2&gt;</code>, <code>&lt;p&gt;</code> және <code>&lt;img&gt;</code>); <code>&lt;footer&gt;</code> ішінде мәтін.</p>",
      hint: "Қаңқадан бастап: header, nav, main > section, footer. Содан кейін ішіне мазмұнын толтыр.",
      starter: "",
      solution: '<header>\n  <h1>Менің сайтым</h1>\n</header>\n<nav>\n  <a href="#a">Басты</a>\n  <a href="#b">Байланыс</a>\n</nav>\n<main>\n  <section>\n    <h2>Сәлем</h2>\n    <p>Бұл менің бірінші сайтым.</p>\n    <img src="assets/star.svg" alt="Жұлдыз">\n  </section>\n</main>\n<footer>© 2026</footer>\n',
      par: 17,
      check: { rules: [
        { sel: "header > h1", text: /\S/, label: "<header> ішінде <h1> бар" },
        { sel: "nav a", min: 2, attr: { href: true }, text: /\S/, label: "<nav> ішінде кемінде 2 сілтеме бар" },
        { sel: "main > section > h2", text: /\S/, label: "main > section ішінде <h2> бар" },
        { sel: "main > section > p", text: /\S/, label: "main > section ішінде <p> бар" },
        { sel: "main > section img", attr: { src: /\.svg$/, alt: /\S/ }, label: "Бөлімде суреті мен alt-ы бар <img> бар" },
        { sel: "footer", text: /\S/, label: "Мәтіні бар <footer> бар" },
      ] },
    },
  ];

  /* ---------- Қосымша ---------- */
  c.bonus = [
    {
      id: "B1", kind: "html", title: "Сурет-сілтеме",
      task: "<p>Суретті басса, сайтқа өтетіндей жаса: <code>&lt;a&gt;</code> тегінің <b>ішіне</b> <code>&lt;img&gt;</code> қой.</p>",
      hint: '<a href="https://kk.wikipedia.org"><img src="assets/star.svg" alt="Жұлдыз"></a>',
      starter: "", solution: '<a href="https://kk.wikipedia.org"><img src="assets/star.svg" alt="Жұлдыз"></a>\n', par: 1,
      check: { rules: [
        { sel: "a[href] > img[src]", attr: { alt: /\S/ }, label: "<a href> ішінде alt-ы бар <img> тұр" },
      ] },
    },
    {
      id: "B2", kind: "html", title: "Ішкі тізім",
      task: "<p>Тізім ішінде тізім жаса: сыртқы <code>&lt;ul&gt;</code>-тың бір <code>&lt;li&gt;</code> пунктінің ішінде екінші <code>&lt;ul&gt;</code> болсын, оның екі пункті бар.</p>",
      hint: "<ul>\n  <li>Жемістер\n    <ul>\n      <li>Алма</li>\n      <li>Шие</li>\n    </ul>\n  </li>\n</ul>",
      starter: "", solution: "<ul>\n  <li>Жемістер\n    <ul>\n      <li>Алма</li>\n      <li>Шие</li>\n    </ul>\n  </li>\n</ul>\n", par: 8,
      check: { rules: [
        { sel: "ul > li > ul > li", min: 2, text: /\S/, label: "Ішкі тізімде кемінде 2 пункт бар" },
        { sel: "ul > li > ul", count: 1, label: "Бір <ul> екінші <ul> ішіне кірген" },
      ] },
    },
    {
      id: "B3", kind: "html", title: "Кесте 3×3",
      task: "<p>Үш жол, үш бағаны бар кесте жаса (барлығы 9 ұяшық). Бірінші жолы тақырып (<code>&lt;th&gt;</code>) болсын.</p>",
      hint: "Бір <tr> жазып, оны көшіріп қой. <th> жолы бір, <td> жолы екі.",
      starter: "",
      solution: "<table>\n  <tr><th>A</th><th>B</th><th>C</th></tr>\n  <tr><td>1</td><td>2</td><td>3</td></tr>\n  <tr><td>4</td><td>5</td><td>6</td></tr>\n</table>\n", par: 5,
      check: { rules: [
        { sel: "tr", count: 3, label: "Дәл 3 жол бар" },
        { sel: "tr:first-child > th", count: 3, label: "Бірінші жолда 3 тақырып ұяшығы бар" },
        { sel: "tr:not(:first-child) > td", count: 6, label: "Қалған жолдарда 6 деректі ұяшық бар" },
      ] },
    },
  ];

  /* ---------- Лекциялар ---------- */
  c.lectures = [
    {
      id: "l1", topic: "1", title: "Тег дегеніміз не?", minutes: 3,
      blocks: [
        { t: "p", html: "HTML — веб-беттің <b>қаңқасын</b> жазатын тіл. Ол «бағдарламалау тілі» емес, <b>белгілеу тілі</b>: мәтінге белгі қойып, «бұл — тақырып, бұл — сурет» деп браузерге айтады." },
        { t: "p", html: "Белгілер <b>тегтер</b> деп аталады. Көбіне жұп болады: <b>ашатын</b> <code>&lt;p&gt;</code> және <b>жабатын</b> <code>&lt;/p&gt;</code> (қиғаш сызықпен). Ортасында — мазмұн." },
        { t: "live", code: "<p>Бұл абзац.</p>" },
        { t: "h", text: "Тегтер бір-бірінің ішіне кіреді" },
        { t: "p", html: "Тегті тегтің ішіне салуға болады. Сонда <b>ағаш</b> пайда болады: сыртқы тег — «ата-ана», ішкісі — «бала». Жауап алаңында оң жақтағы «Құрылым ағашына» қара: ол осы ағашты көрсетеді." },
        { t: "live", code: "<div>\n  <h1>Тақырып</h1>\n  <p>Мәтін</p>\n</div>" },
        { t: "tip", html: "Жабатын тегті ұмытсаң, браузер өзі «түсінуге» тырысады, бірақ бет бұзылып көрінуі мүмкін. Әр ашқан тегіңді жап!" },
        { t: "h", text: "Бет қаңқасы" },
        { t: "p", html: "Нағыз бет үш бөліктен тұрады: <code>&lt;html&gt;</code> (барлығын қамтиды), <code>&lt;head&gt;</code> (бет туралы мәлімет, мысалы <code>&lt;title&gt;</code>), <code>&lt;body&gt;</code> (экранда көрінетін бөлігі)." },
        { t: "try", code: "<html>\n  <head>\n    <title>Менің бетім</title>\n  </head>\n  <body>\n    <h1>Сәлем!</h1>\n  </body>\n</html>" },
      ],
    },
    {
      id: "l2", topic: "2", title: "Тақырыптар мен абзацтар", minutes: 3,
      blocks: [
        { t: "p", html: "Мәтіннің ең маңызды тегтері: <code>&lt;h1&gt;</code> … <code>&lt;h6&gt;</code> (тақырыптар) және <code>&lt;p&gt;</code> (абзац). Саны кіші болған сайын тақырып маңыздырақ." },
        { t: "live", code: "<h1>Басты тақырып</h1>\n<h2>Кіші тақырып</h2>\n<h3>Тағы кішірек</h3>\n<p>Бұл абзац мәтіні.</p>" },
        { t: "h", text: "Мәтінді безендіру" },
        { t: "list", items: ["<code>&lt;b&gt;</code> — <b>қалың</b> жазу", "<code>&lt;i&gt;</code> — <i>көлбеу</i> жазу", "<code>&lt;br&gt;</code> — жаңа жолға өту (жабылмайды)", "<code>&lt;hr&gt;</code> — көлденең сызық"] },
        { t: "live", code: "<p>Мен <b>HTML</b> үйренемін,<br><i>өте қызық!</i></p>\n<hr>\n<p>Келесі абзац</p>" },
        { t: "warn", html: "Мәтін кодта қанша жолға бөлінсе де, браузер оны <b>бір жолға</b> біріктіреді. Жаңа жол керек болса — <code>&lt;br&gt;</code> не жаңа <code>&lt;p&gt;</code> қолдан." },
      ],
    },
    {
      id: "l3", topic: "3", title: "Суреттер және сілтемелер", minutes: 3,
      blocks: [
        { t: "p", html: "<code>&lt;img&gt;</code> суретті шығарады. Оның ішіне мәтін жазылмайды, сондықтан жабатын тегі жоқ. Мәлімет <b>атрибуттар</b> арқылы беріледі:" },
        { t: "list", items: ["<code>src</code> — суреттің орны (файл не мекенжай)", "<code>alt</code> — сурет жүктелмесе не көзі көрмейтін адамға оқылатын сипаттама"] },
        { t: "live", code: '<img src="assets/robot.svg" alt="Робот" width="100">' },
        { t: "h", text: "Сілтеме" },
        { t: "p", html: "<code>&lt;a&gt;</code> басқан кезде басқа бетке апарады. Қайда апаратынын <code>href</code> атрибуты айтады. Мәтіннің орнына суретті де қоюға болады." },
        { t: "live", code: '<a href="https://kk.wikipedia.org">Википедияға өту</a>' },
        { t: "tip", html: "Алдын ала көруде сілтемелер басқанда ашылмайды (оның орнына элементтің өзі таңдалады). Нағыз бетте олар жұмыс істейді." },
      ],
    },
    {
      id: "l4", topic: "4", title: "Тізімдер мен кестелер", minutes: 4,
      blocks: [
        { t: "p", html: "Тізімнің екі түрі бар: маркерлі <code>&lt;ul&gt;</code> және нөмірленген <code>&lt;ol&gt;</code>. Әр пункт — <code>&lt;li&gt;</code>." },
        { t: "live", code: "<ul>\n  <li>Нан</li>\n  <li>Сүт</li>\n</ul>\n<ol>\n  <li>Бірінші</li>\n  <li>Екінші</li>\n</ol>" },
        { t: "h", text: "Кесте" },
        { t: "p", html: "<code>&lt;table&gt;</code> ішінде жолдар <code>&lt;tr&gt;</code>, әр жолда ұяшықтар: <code>&lt;th&gt;</code> (тақырып) не <code>&lt;td&gt;</code> (дерек). Ағашқа қара: кесте → жол → ұяшық." },
        { t: "live", code: "<table border=\"1\">\n  <tr><th>Аты</th><th>Жасы</th></tr>\n  <tr><td>Алия</td><td>12</td></tr>\n  <tr><td>Бота</td><td>11</td></tr>\n</table>" },
      ],
    },
    {
      id: "l5", topic: "5", title: "Формалар", minutes: 4,
      blocks: [
        { t: "p", html: "Форма — пайдаланушыдан мәлімет алатын бөлік. Ол <code>&lt;form&gt;</code> ішіне жиналады. Негізгі құрал — <code>&lt;input&gt;</code>, оның түрін <code>type</code> айтады." },
        { t: "list", items: ["<code>type=\"text\"</code> — мәтін", "<code>type=\"checkbox\"</code> — құсбелгі", "<code>type=\"number\"</code> — сан", "<code>placeholder</code> — өріс ішіндегі көмекші жазу"] },
        { t: "live", code: '<form>\n  <input type="text" placeholder="Атың">\n  <label><input type="checkbox"> Келісемін</label>\n  <select>\n    <option>Python</option>\n    <option>HTML</option>\n  </select>\n  <button>Жіберу</button>\n</form>' },
        { t: "tip", html: "<code>&lt;label&gt;</code> өріске жазу береді. Жазуды бассаң, өріс белсенді болады: қолайлырақ!" },
      ],
    },
    {
      id: "l6", topic: "6", title: "Семантика: бөліктерге ат беру", minutes: 3,
      blocks: [
        { t: "p", html: "Барлығын <code>&lt;div&gt;</code> деп жазуға болады, бірақ бұл ештеңе түсіндірмейді. <b>Семантикалық</b> тегтер бет бөлігінің мағынасын айтады: оны браузер де, іздеу жүйесі де, экран оқитын бағдарлама да түсінеді." },
        { t: "list", items: ["<code>&lt;header&gt;</code> — бет басы", "<code>&lt;nav&gt;</code> — мәзір, сілтемелер", "<code>&lt;main&gt;</code> — негізгі мазмұн (бетте біреу)", "<code>&lt;section&gt;</code> — тақырыбы бар бөлім", "<code>&lt;footer&gt;</code> — бет төмені"] },
        { t: "live", code: "<header><h1>Сайтым</h1></header>\n<nav><a href=\"#\">Басты</a> <a href=\"#\">Байланыс</a></nav>\n<main>\n  <section>\n    <h2>Бөлім</h2>\n    <p>Мәтін</p>\n  </section>\n</main>\n<footer>© 2026</footer>" },
        { t: "tip", html: "Бет көрінісі бәрібір бірдей, бірақ ағашқа қарасаң, құрылымның неге түсінікті екенін көресің." },
      ],
    },
    {
      id: "l7", topic: "7", title: "Өз бетіңді жасау", minutes: 2,
      blocks: [
        { t: "p", html: "Енді сен тегтердің көбін білесің. Жобаға кірісу алдында жоспар құр:" },
        { t: "list", items: ["Бет не туралы? (өзің, хоббиің, сүйікті ойының)", "Қандай бөлімдер керек? Әр бөлімге тақырып ойлап тап.", "Қандай сурет пен сілтеме қосасың?", "Алдымен қаңқасын (header, main, footer), содан кейін мазмұнын жаз."] },
        { t: "p", html: "Бетті безендіру — келесі курс, <b>CSS</b> ісі. HTML тек мазмұн мен құрылымды береді." },
        { t: "tip", html: "Еркін алаңда кез келген кодты сынап көр. Қателесуден қорықпа: оң жақта бірден көресің!" },
      ],
    },
  ];

  /* ---------- Анықтамалық ---------- */
  c.reference = [
    { term: "<h1> … <h6>", text: "Тақырыптар. h1 — ең маңызды, h6 — ең кіші.", code: "<h1>Тақырып</h1>\n<h2>Кіші тақырып</h2>" },
    { term: "<p>", text: "Абзац. Жаңа абзац жаңа жолдан басталады.", code: "<p>Бірінші абзац</p>\n<p>Екінші абзац</p>" },
    { term: "<b>, <i>", text: "Қалың және көлбеу мәтін.", code: "<p><b>Қалың</b> және <i>көлбеу</i></p>" },
    { term: "<br>, <hr>", text: "br — жаңа жол, hr — көлденең сызық. Екеуі де жабылмайды.", code: "<p>Бірінші<br>Екінші</p>\n<hr>" },
    { term: "<img>", text: "Сурет. src — орны, alt — сипаттамасы.", code: '<img src="assets/cat.svg" alt="Мысық" width="100">' },
    { term: "<a>", text: "Сілтеме. href — қайда апаратыны.", code: '<a href="https://kk.wikipedia.org">Википедия</a>' },
    { term: "<ul>, <ol>, <li>", text: "Маркерлі және нөмірленген тізім; li — пункт.", code: "<ul><li>А</li><li>Б</li></ul>\n<ol><li>1</li><li>2</li></ol>" },
    { term: "<table>, <tr>, <th>, <td>", text: "Кесте, жол, тақырып ұяшығы, дерек ұяшығы.", code: '<table border="1">\n  <tr><th>А</th><th>Б</th></tr>\n  <tr><td>1</td><td>2</td></tr>\n</table>' },
    { term: "<form>, <input>, <button>", text: "Форма, енгізу өрісі, батырма.", code: '<form>\n  <input type="text" placeholder="Атың">\n  <button>OK</button>\n</form>' },
    { term: "<label>", text: "Өріске жазу. Жазуды басқанда өріс белсенеді.", code: '<label><input type="checkbox"> Келісемін</label>' },
    { term: "<select>, <option>", text: "Ашылатын таңдау тізімі.", code: "<select>\n  <option>А</option>\n  <option>Б</option>\n</select>" },
    { term: "<div>, <span>", text: "Мағынасыз қораптар: div — блок, span — жол ішінде. Көбіне CSS үшін.", code: "<div>Блок</div>\n<p>Жол ішінде <span>span</span> бар</p>" },
    { term: "<header>, <nav>, <main>, <section>, <footer>", text: "Семантикалық тегтер: бет бөліктерінің мағынасын айтады.", code: "<header>Басы</header>\n<main><section>Бөлім</section></main>\n<footer>Төмені</footer>" },
    { term: "Комментарий <!-- -->", text: "Браузер көрсетпейтін, адамға арналған түсініктеме.", code: "<!-- бұл көрінбейді -->\n<p>Бұл көрінеді</p>" },
  ];
})();
