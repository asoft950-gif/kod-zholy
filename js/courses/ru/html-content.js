/* Курс HTML: задания, бонус, лекции, справочник */
(() => {
  const c = KZ.getCourse("html");
  c.status = "ready";

  const has = (re, label) => (d, w, code) => [{ label, ok: re.test(code) }];

  c.levels = [
    /* ---------- 1. Структура страницы ---------- */
    {
      id: "1.1", kind: "html", title: "Первый заголовок",
      task: "<p>Добавь на страницу большой заголовок: внутри тега <code>&lt;h1&gt;</code> напиши <b>Привет, мир!</b></p>" +
        "<p class='tip'>Тег состоит из двух частей: открывающего <code>&lt;h1&gt;</code> и закрывающего <code>&lt;/h1&gt;</code>. Текст пишется между ними.</p>",
      hint: "Поставь текст между открывающим и закрывающим тегом. В закрывающем теге перед именем стоит косая черта (/). Проверь результат в «Дереве структуры» справа.",
      starter: "<!-- пиши код здесь -->\n",
      solution: "<h1>Привет, мир!</h1>\n",
      par: 1,
      check: { rules: [{ sel: "h1", count: 1, text: "Привет, мир!", label: "На странице есть один <h1> с текстом «Привет, мир!»" }] },
    },
    {
      id: "1.2", kind: "html", title: "Каркас страницы",
      task: "<p>Сделай настоящий каркас HTML-страницы: внутри <code>&lt;html&gt;</code> должны быть <code>&lt;head&gt;</code> (а в нём <code>&lt;title&gt;</code>) и <code>&lt;body&gt;</code> (а в нём <code>&lt;h1&gt;</code>).</p>" +
        "<p class='tip'><b>head</b> — сведения о странице (название на вкладке браузера), <b>body</b> — видимая часть.</p>",
      hint: "Самый внешний тег — <html>. Внутри него два отдельных раздела: <head> (внутри <title>) и <body> (внутри заголовок). Не забывай закрывать каждый открытый тег!",
      starter: "<html>\n\n</html>\n",
      solution: "<html>\n  <head>\n    <title>Моя страница</title>\n  </head>\n  <body>\n    <h1>Привет</h1>\n  </body>\n</html>\n",
      par: 8,
      check: {
        rules: [
          { sel: "head > title", text: /\S/, label: "Внутри <head> есть <title> с текстом" },
          { sel: "body > h1", text: /\S/, label: "Внутри <body> есть <h1> с текстом" },
        ],
        fn: (d, w, code) => [
          { label: "Код начинается с тега <html>", ok: /<html[\s>]/i.test(code) && /<\/html>/i.test(code) },
          { label: "<head> и <body> записаны со своими закрывающими тегами", ok: /<\/head>/i.test(code) && /<\/body>/i.test(code) },
        ],
      },
    },

    /* ---------- 2. Текст ---------- */
    {
      id: "2.1", kind: "html", title: "Уровни заголовков",
      task: "<p>Сделай один заголовок <code>&lt;h1&gt;</code> (<b>Мой блог</b>) и два заголовка <code>&lt;h2&gt;</code> (тексты придумай сам).</p>" +
        "<p class='tip'>h1 — самый большой, h6 — самый маленький. Главный заголовок страницы (h1) бывает только один.</p>",
      hint: "Уровень заголовка показывает цифра в имени тега: 1 — самый крупный, 2 — поменьше. Закрывай каждый заголовок своим закрывающим тегом.",
      starter: "",
      solution: "<h1>Мой блог</h1>\n<h2>Сегодняшний день</h2>\n<h2>Мои планы</h2>\n",
      par: 3,
      check: { rules: [
        { sel: "h1", count: 1, text: "Мой блог", label: "Есть один <h1>: «Мой блог»" },
        { sel: "h2", min: 2, text: /\S/, label: "Есть не меньше двух <h2>" },
      ] },
    },
    {
      id: "2.2", kind: "html", title: "Красивый абзац",
      task: "<p>Сделай один абзац <code>&lt;p&gt;</code>. Внутри него должны быть: <code>&lt;b&gt;</code> (жирный), <code>&lt;i&gt;</code> (наклонный) и <code>&lt;br&gt;</code> (переход на новую строку).</p>",
      hint: "Внутрь абзаца можно вкладывать другие теги: оберни слово в <b> или <i>. <br> непарный — он ничего не закрывает и стоит сам по себе.",
      starter: "",
      solution: "<p>Я учу <b>HTML</b>, это <i>очень интересно!</i><br>Новая строка здесь.</p>\n",
      par: 2,
      check: { rules: [
        { sel: "p", count: 1, label: "Есть один абзац <p>" },
        { sel: "p b", text: /\S/, label: "В абзаце есть <b>" },
        { sel: "p i", text: /\S/, label: "В абзаце есть <i>" },
        { sel: "p br", label: "В абзаце есть <br>" },
      ] },
    },

    /* ---------- 3. Картинки и ссылки ---------- */
    {
      id: "3.1", kind: "html", title: "Картинка с роботом",
      task: "<p>Помести на страницу картинку <code>assets/robot.svg</code>. У тега <code>&lt;img&gt;</code> должны быть атрибуты <code>src</code> (где лежит картинка) и <code>alt</code> (описание картинки).</p>" +
        "<p class='tip'><code>&lt;img&gt;</code> не закрывается: внутри него нет текста.</p>",
      hint: '<img src="assets/robot.svg" alt="Робот">',
      starter: "",
      solution: '<img src="assets/robot.svg" alt="Робот">\n',
      par: 1,
      check: { rules: [
        { sel: "img", count: 1, attr: { src: /robot\.svg$/ }, label: "<img> ссылается через src на assets/robot.svg" },
        { sel: "img", attr: { alt: /\S/ }, label: "У тега <img> есть непустой alt" },
      ] },
    },
    {
      id: "3.2", kind: "html", title: "Ссылка",
      task: "<p>Сделай ссылку тегом <code>&lt;a&gt;</code>: текст ссылки — <b>Википедия</b>, адрес — <code>https://ru.wikipedia.org</code>.</p>",
      hint: "Для ссылки нужен тег <a> с атрибутом href: он хранит адрес, а текст внутри тега виден на странице. Форма: <a href=\"…\">…</a>.",
      starter: "",
      solution: '<a href="https://ru.wikipedia.org">Википедия</a>\n',
      par: 1,
      check: { rules: [
        { sel: "a", count: 1, text: "Википедия", attr: { href: /^https:\/\/ru\.wikipedia\.org\/?$/ }, label: "Текст <a> — «Википедия», адрес href правильный" },
      ] },
    },

    /* ---------- 4. Списки и таблицы ---------- */
    {
      id: "4.1", kind: "html", title: "Список покупок",
      task: "<p>Сделай маркированный список: внутри <code>&lt;ul&gt;</code> три пункта <code>&lt;li&gt;</code> (хлеб, молоко, яблоко — или что хочешь).</p>",
      hint: "Сначала напиши тег, который охватывает весь список, а внутрь положи отдельный <li> для каждого пункта. Три пункта — три <li>.",
      starter: "",
      solution: "<ul>\n  <li>Хлеб</li>\n  <li>Молоко</li>\n  <li>Яблоко</li>\n</ul>\n",
      par: 5,
      check: { rules: [
        { sel: "ul", count: 1, label: "Есть один список <ul>" },
        { sel: "ul > li", min: 3, text: /\S/, label: "Внутри <ul> не меньше трёх <li>" },
      ] },
    },
    {
      id: "4.2", kind: "html", title: "Маленькая таблица",
      task: "<p>Сделай таблицу из 2 строк и 2 столбцов. В первой строке должны быть <code>&lt;th&gt;</code> (ячейки-заголовки), во второй — <code>&lt;td&gt;</code> (данные).</p>" +
        "<p class='tip'><code>&lt;tr&gt;</code> — строка, <code>&lt;th&gt;</code>/<code>&lt;td&gt;</code> — ячейки внутри строки.</p>",
      hint: "Таблица <table> состоит из строк (<tr>), а внутри каждой строки лежат ячейки. В первую строку поставь две <th>, во вторую — две <td>.",
      starter: "",
      solution: "<table>\n  <tr>\n    <th>Имя</th>\n    <th>Возраст</th>\n  </tr>\n  <tr>\n    <td>Алия</td>\n    <td>12</td>\n  </tr>\n</table>\n",
      par: 10,
      check: { rules: [
        { sel: "table", count: 1, label: "Есть одна <table>" },
        { sel: "tr", count: 2, label: "Ровно 2 строки (<tr>)" },
        { sel: "tr > th", min: 2, text: /\S/, label: "Есть ячейки-заголовки (<th>)" },
        { sel: "tr > td", min: 2, text: /\S/, label: "Есть ячейки с данными (<td>)" },
      ] },
    },

    /* ---------- 5. Формы ---------- */
    {
      id: "5.1", kind: "html", title: "Форма с именем",
      task: "<p>Сделай <code>&lt;form&gt;</code>: внутри текстовое поле <code>&lt;input type=\"text\"&gt;</code> (с <code>placeholder</code> — подсказкой в поле) и кнопка <code>&lt;button&gt;</code>.</p>",
      hint: "<input> не закрывается: его тип и подсказка задаются атрибутами. <button> — парный тег, надпись пишется внутри. Оба элемента должны быть внутри <form>.",
      starter: "",
      solution: '<form>\n  <input type="text" placeholder="Твоё имя">\n  <button>Отправить</button>\n</form>\n',
      par: 4,
      check: { rules: [
        { sel: "form input[type=text]", attr: { placeholder: /\S/ }, label: "В форме есть текстовое поле с placeholder" },
        { sel: "form button", text: /\S/, label: "В форме есть кнопка с текстом" },
      ] },
    },
    {
      id: "5.2", kind: "html", title: "Форма с выбором",
      task: "<p>Добавь в форму: флажок (<code>type=\"checkbox\"</code>) с подписью <code>&lt;label&gt;</code> и <code>&lt;select&gt;</code> с двумя вариантами (<code>&lt;option&gt;</code>).</p>",
      hint: "Флажок — тоже тег <input>. Если положить его внутрь <label>, он будет отмечаться и при клике на надпись. В <select> добавь по одному <option> на каждый вариант.",
      starter: "<form>\n\n</form>\n",
      solution: '<form>\n  <label><input type="checkbox"> Согласен</label>\n  <select>\n    <option>Python</option>\n    <option>HTML</option>\n  </select>\n</form>\n',
      par: 8,
      check: { rules: [
        { sel: "form label", text: /\S/, label: "В форме есть <label> с подписью" },
        { sel: "form input[type=checkbox]", label: "Есть флажок (checkbox)" },
        { sel: "form select > option", min: 2, text: /\S/, label: "Внутри <select> не меньше 2 <option>" },
      ] },
    },

    /* ---------- 6. Семантика ---------- */
    {
      id: "6.1", kind: "html", title: "Семантический каркас",
      task: "<p>Назови части страницы по смыслу: <code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;footer&gt;</code>. В каждой должен быть короткий текст.</p>",
      hint: "Для каждой части используй свой тег: открыть, короткий текст, закрыть. Это обычные парные теги, просто с говорящим названием. Части страницы идут сверху вниз.",
      starter: "",
      solution: "<header>Заголовок</header>\n<nav>Меню</nav>\n<main>Основная часть</main>\n<footer>Нижняя часть</footer>\n",
      par: 8,
      check: { rules: ["header", "nav", "main", "footer"].map((t) => ({ sel: t, count: 1, text: /\S/, label: "Есть <" + t + "> с текстом" })) },
    },
    {
      id: "6.2", kind: "html", title: "Разделы",
      task: "<p>Внутри <code>&lt;main&gt;</code> сделай два <code>&lt;section&gt;</code>. В каждом разделе должны быть заголовок <code>&lt;h2&gt;</code> и абзац <code>&lt;p&gt;</code>.</p>",
      hint: "Сначала открой <main>, внутрь добавь первый <section>, а в него — заголовок и абзац. Затем повтори этот блок для второго раздела.",
      starter: "",
      solution: "<main>\n  <section>\n    <h2>О нас</h2>\n    <p>Мы учимся программировать.</p>\n  </section>\n  <section>\n    <h2>Связь</h2>\n    <p>Напиши письмо.</p>\n  </section>\n</main>\n",
      par: 12,
      check: { rules: [
        { sel: "main > section", count: 2, label: "Внутри <main> ровно 2 <section>" },
        { sel: "section > h2", min: 2, text: /\S/, label: "В каждом разделе есть <h2>" },
        { sel: "section > p", min: 2, text: /\S/, label: "В каждом разделе есть <p>" },
      ], fn: (d) => {
        const s = [...d.querySelectorAll("main > section")];
        return [{ label: "В каждом <section> есть свои <h2> и <p>", ok: s.length >= 2 && s.every((x) => x.querySelector("h2") && x.querySelector("p")) }];
      } },
    },

    /* ---------- 7. Проект ---------- */
    {
      id: "7.1", kind: "html", title: "Визитка",
      task: "<p>Сделай маленькую страницу о себе: <code>&lt;h1&gt;</code> (твоё имя), <code>&lt;img&gt;</code> (<code>assets/cat.svg</code> или <code>assets/robot.svg</code>), <code>&lt;p&gt;</code> (о себе), <code>&lt;ul&gt;</code> (не меньше 2 увлечений) и ссылка <code>&lt;a&gt;</code>.</p>",
      hint: "Объедини прошлые уроки: заголовок, картинка, абзац, список и ссылка. <img> не закрывается, ему нужны атрибуты src (путь) и alt (описание).",
      starter: "",
      solution: '<h1>Алия</h1>\n<img src="assets/cat.svg" alt="Кошка">\n<p>Мне 12 лет.</p>\n<ul>\n  <li>Рисование</li>\n  <li>Программирование</li>\n</ul>\n<a href="https://ru.wikipedia.org">Википедия</a>\n',
      par: 8,
      check: { rules: [
        { sel: "h1", count: 1, text: /\S/, label: "Есть заголовок (<h1>)" },
        { sel: "img", attr: { src: /assets\/(cat|robot|star)\.svg$/, alt: /\S/ }, label: "Есть <img> с картинкой и alt" },
        { sel: "p", text: /\S/, label: "Есть <p> о тебе" },
        { sel: "ul > li", min: 2, text: /\S/, label: "В списке не меньше 2 пунктов" },
        { sel: "a", attr: { href: /^https?:\/\// }, text: /\S/, label: "Есть ссылка (<a>)" },
      ] },
    },
    {
      id: "7.2", kind: "html", title: "Полная страница",
      task: "<p>Сделай семантическую страницу: в <code>&lt;header&gt;</code> — <code>&lt;h1&gt;</code>; в <code>&lt;nav&gt;</code> — 2 ссылки; в <code>&lt;main&gt;</code> — <code>&lt;section&gt;</code> (с <code>&lt;h2&gt;</code>, <code>&lt;p&gt;</code> и <code>&lt;img&gt;</code>); в <code>&lt;footer&gt;</code> — текст.</p>",
      hint: "Сначала напиши четыре крупные части по порядку, затем наполни каждую. В <nav> — две ссылки <a>, а в <section> внутри <main> — заголовок, абзац и картинку.",
      starter: "",
      solution: '<header>\n  <h1>Мой сайт</h1>\n</header>\n<nav>\n  <a href="#a">Главная</a>\n  <a href="#b">Связь</a>\n</nav>\n<main>\n  <section>\n    <h2>Привет</h2>\n    <p>Это мой первый сайт.</p>\n    <img src="assets/star.svg" alt="Звезда">\n  </section>\n</main>\n<footer>© 2026</footer>\n',
      par: 17,
      check: { rules: [
        { sel: "header > h1", text: /\S/, label: "Внутри <header> есть <h1>" },
        { sel: "nav a", min: 2, attr: { href: true }, text: /\S/, label: "Внутри <nav> не меньше 2 ссылок" },
        { sel: "main > section > h2", text: /\S/, label: "Внутри main > section есть <h2>" },
        { sel: "main > section > p", text: /\S/, label: "Внутри main > section есть <p>" },
        { sel: "main > section img", attr: { src: /\.svg$/, alt: /\S/ }, label: "В разделе есть <img> с картинкой и alt" },
        { sel: "footer", text: /\S/, label: "Есть <footer> с текстом" },
      ] },
    },
  ];

  /* ---------- Дополнительно ---------- */
  c.bonus = [
    {
      id: "B1", kind: "html", title: "Картинка-ссылка",
      task: "<p>Сделай так, чтобы по клику на картинку открывался сайт: помести <code>&lt;img&gt;</code> <b>внутрь</b> тега <code>&lt;a&gt;</code>.</p>",
      hint: '<a href="https://ru.wikipedia.org"><img src="assets/star.svg" alt="Звезда"></a>',
      starter: "", solution: '<a href="https://ru.wikipedia.org"><img src="assets/star.svg" alt="Звезда"></a>\n', par: 1,
      check: { rules: [
        { sel: "a[href] > img[src]", attr: { alt: /\S/ }, label: "Внутри <a href> стоит <img> с alt" },
      ] },
    },
    {
      id: "B2", kind: "html", title: "Вложенный список",
      task: "<p>Сделай список внутри списка: в одном пункте <code>&lt;li&gt;</code> внешнего <code>&lt;ul&gt;</code> должен быть второй <code>&lt;ul&gt;</code> с двумя пунктами.</p>",
      hint: "Вложенный список стоит не рядом с внешним, а внутри одного его пункта <li>. Поэтому открой новый список до того, как закроешь внешний <li>.",
      starter: "", solution: "<ul>\n  <li>Фрукты\n    <ul>\n      <li>Яблоко</li>\n      <li>Вишня</li>\n    </ul>\n  </li>\n</ul>\n", par: 8,
      check: { rules: [
        { sel: "ul > li > ul > li", min: 2, text: /\S/, label: "Во вложенном списке не меньше 2 пунктов" },
        { sel: "ul > li > ul", count: 1, label: "Один <ul> вложен в другой <ul>" },
      ] },
    },
    {
      id: "B3", kind: "html", title: "Таблица 3×3",
      task: "<p>Сделай таблицу из трёх строк и трёх столбцов (всего 9 ячеек). Первая строка — заголовки (<code>&lt;th&gt;</code>).</p>",
      hint: "Напиши одну строку (<tr>), проверь число ячеек, затем скопируй её и поменяй содержимое. В первой строке используй <th>, в остальных — <td>.",
      starter: "",
      solution: "<table>\n  <tr><th>A</th><th>B</th><th>C</th></tr>\n  <tr><td>1</td><td>2</td><td>3</td></tr>\n  <tr><td>4</td><td>5</td><td>6</td></tr>\n</table>\n", par: 5,
      check: { rules: [
        { sel: "tr", count: 3, label: "Ровно 3 строки" },
        { sel: "tr:first-child > th", count: 3, label: "В первой строке 3 ячейки-заголовка" },
        { sel: "tr:not(:first-child) > td", count: 6, label: "В остальных строках 6 ячеек с данными" },
      ] },
    },
  ];

  /* ---------- Лекции ---------- */
  c.lectures = [
    {
      id: "l1", topic: "1", title: "Что такое тег?", minutes: 3,
      blocks: [
        { t: "p", html: "HTML — язык, на котором пишут <b>каркас</b> веб-страницы. Это не «язык программирования», а <b>язык разметки</b>: мы ставим в тексте метки и говорим браузеру: «это заголовок, а это картинка»." },
        { t: "p", html: "Эти метки называются <b>тегами</b>. Чаще всего они парные: <b>открывающий</b> <code>&lt;p&gt;</code> и <b>закрывающий</b> <code>&lt;/p&gt;</code> (с косой чертой). Посередине — содержимое." },
        { t: "live", code: "<p>Это абзац.</p>" },
        { t: "h", text: "Теги вкладываются друг в друга" },
        { t: "p", html: "Один тег можно поместить внутрь другого. Так получается <b>дерево</b>: внешний тег — «родитель», внутренний — «ребёнок». На площадке посмотри на «Дерево структуры» справа: оно показывает именно это дерево." },
        { t: "live", code: "<div>\n  <h1>Заголовок</h1>\n  <p>Текст</p>\n</div>" },
        { t: "tip", html: "Если забыть закрывающий тег, браузер попробует сам «догадаться», но страница может выглядеть сломанной. Закрывай каждый открытый тег!" },
        { t: "h", text: "Каркас страницы" },
        { t: "p", html: "Настоящая страница состоит из трёх частей: <code>&lt;html&gt;</code> (содержит всё), <code>&lt;head&gt;</code> (сведения о странице, например <code>&lt;title&gt;</code>), <code>&lt;body&gt;</code> (часть, видимая на экране)." },
        { t: "try", code: "<html>\n  <head>\n    <title>Моя страница</title>\n  </head>\n  <body>\n    <h1>Привет!</h1>\n  </body>\n</html>" },
      ],
    },
    {
      id: "l2", topic: "2", title: "Заголовки и абзацы", minutes: 3,
      blocks: [
        { t: "p", html: "Самые важные теги для текста: <code>&lt;h1&gt;</code> … <code>&lt;h6&gt;</code> (заголовки) и <code>&lt;p&gt;</code> (абзац). Чем меньше число, тем важнее заголовок." },
        { t: "live", code: "<h1>Главный заголовок</h1>\n<h2>Подзаголовок</h2>\n<h3>Ещё поменьше</h3>\n<p>Это текст абзаца.</p>" },
        { t: "h", text: "Украшаем текст" },
        { t: "list", items: ["<code>&lt;b&gt;</code> — <b>жирный</b> текст", "<code>&lt;i&gt;</code> — <i>наклонный</i> текст", "<code>&lt;br&gt;</code> — переход на новую строку (не закрывается)", "<code>&lt;hr&gt;</code> — горизонтальная линия"] },
        { t: "live", code: "<p>Я учу <b>HTML</b>,<br><i>это очень интересно!</i></p>\n<hr>\n<p>Следующий абзац</p>" },
        { t: "warn", html: "Сколько бы строк ни занимал текст в коде, браузер соединит его в <b>одну строку</b>. Нужна новая строка — используй <code>&lt;br&gt;</code> или новый <code>&lt;p&gt;</code>." },
      ],
    },
    {
      id: "l3", topic: "3", title: "Картинки и ссылки", minutes: 3,
      blocks: [
        { t: "p", html: "<code>&lt;img&gt;</code> выводит картинку. Текст внутрь него не пишут, поэтому закрывающего тега нет. Сведения передаются через <b>атрибуты</b>:" },
        { t: "list", items: ["<code>src</code> — где лежит картинка (файл или адрес)", "<code>alt</code> — описание, которое прочитают, если картинка не загрузилась или её читает человек с плохим зрением"] },
        { t: "live", code: '<img src="assets/robot.svg" alt="Робот" width="100">' },
        { t: "h", text: "Ссылка" },
        { t: "p", html: "<code>&lt;a&gt;</code> по клику ведёт на другую страницу. Куда именно — говорит атрибут <code>href</code>. Вместо текста можно поставить и картинку." },
        { t: "live", code: '<a href="https://ru.wikipedia.org">Перейти в Википедию</a>' },
        { t: "tip", html: "В предпросмотре ссылки по клику не открываются (вместо этого выбирается сам элемент). На настоящей странице они работают." },
      ],
    },
    {
      id: "l4", topic: "4", title: "Списки и таблицы", minutes: 4,
      blocks: [
        { t: "p", html: "Списки бывают двух видов: маркированный <code>&lt;ul&gt;</code> и нумерованный <code>&lt;ol&gt;</code>. Каждый пункт — <code>&lt;li&gt;</code>." },
        { t: "live", code: "<ul>\n  <li>Хлеб</li>\n  <li>Молоко</li>\n</ul>\n<ol>\n  <li>Первый</li>\n  <li>Второй</li>\n</ol>" },
        { t: "h", text: "Таблица" },
        { t: "p", html: "Внутри <code>&lt;table&gt;</code> лежат строки <code>&lt;tr&gt;</code>, а в каждой строке — ячейки: <code>&lt;th&gt;</code> (заголовок) или <code>&lt;td&gt;</code> (данные). Посмотри на дерево: таблица → строка → ячейка." },
        { t: "live", code: "<table border=\"1\">\n  <tr><th>Имя</th><th>Возраст</th></tr>\n  <tr><td>Алия</td><td>12</td></tr>\n  <tr><td>Бота</td><td>11</td></tr>\n</table>" },
      ],
    },
    {
      id: "l5", topic: "5", title: "Формы", minutes: 4,
      blocks: [
        { t: "p", html: "Форма — это часть страницы, которая получает данные от пользователя. Всё собирается внутри <code>&lt;form&gt;</code>. Главный инструмент — <code>&lt;input&gt;</code>, его вид задаёт <code>type</code>." },
        { t: "list", items: ["<code>type=\"text\"</code> — текст", "<code>type=\"checkbox\"</code> — флажок", "<code>type=\"number\"</code> — число", "<code>placeholder</code> — подсказка внутри поля"] },
        { t: "live", code: '<form>\n  <input type="text" placeholder="Твоё имя">\n  <label><input type="checkbox"> Согласен</label>\n  <select>\n    <option>Python</option>\n    <option>HTML</option>\n  </select>\n  <button>Отправить</button>\n</form>' },
        { t: "tip", html: "<code>&lt;label&gt;</code> даёт полю подпись. Если нажать на подпись, поле станет активным: так удобнее!" },
      ],
    },
    {
      id: "l6", topic: "6", title: "Семантика: даём имена частям", minutes: 3,
      blocks: [
        { t: "p", html: "Можно всё писать через <code>&lt;div&gt;</code>, но это ничего не объясняет. <b>Семантические</b> теги говорят о смысле части страницы: их понимают и браузер, и поисковик, и программа, читающая экран вслух." },
        { t: "list", items: ["<code>&lt;header&gt;</code> — верх страницы", "<code>&lt;nav&gt;</code> — меню, ссылки", "<code>&lt;main&gt;</code> — основное содержимое (на странице одно)", "<code>&lt;section&gt;</code> — раздел с заголовком", "<code>&lt;footer&gt;</code> — низ страницы"] },
        { t: "live", code: "<header><h1>Мой сайт</h1></header>\n<nav><a href=\"#\">Главная</a> <a href=\"#\">Связь</a></nav>\n<main>\n  <section>\n    <h2>Раздел</h2>\n    <p>Текст</p>\n  </section>\n</main>\n<footer>© 2026</footer>" },
        { t: "tip", html: "Внешне страница всё равно выглядит одинаково, но если посмотреть на дерево, ты увидишь, насколько понятнее стала структура." },
      ],
    },
    {
      id: "l7", topic: "7", title: "Делаем свою страницу", minutes: 2,
      blocks: [
        { t: "p", html: "Теперь ты знаешь большинство тегов. Прежде чем взяться за проект, составь план:" },
        { t: "list", items: ["О чём страница? (о тебе, твоём увлечении, любимой игре)", "Какие нужны разделы? Придумай заголовок для каждого.", "Какую картинку и ссылку добавишь?", "Сначала напиши каркас (header, main, footer), потом содержимое."] },
        { t: "p", html: "Украшать страницу — задача следующего курса, <b>CSS</b>. HTML даёт только содержимое и структуру." },
        { t: "tip", html: "На свободной площадке пробуй любой код. Не бойся ошибиться: результат сразу виден справа!" },
      ],
    },
  ];

  /* ---------- Справочник ---------- */
  c.reference = [
    { term: "<h1> … <h6>", text: "Заголовки. h1 — самый важный, h6 — самый маленький.", code: "<h1>Заголовок</h1>\n<h2>Подзаголовок</h2>" },
    { term: "<p>", text: "Абзац. Новый абзац начинается с новой строки.", code: "<p>Первый абзац</p>\n<p>Второй абзац</p>" },
    { term: "<b>, <i>", text: "Жирный и наклонный текст.", code: "<p><b>Жирный</b> и <i>наклонный</i></p>" },
    { term: "<br>, <hr>", text: "br — новая строка, hr — горизонтальная линия. Оба не закрываются.", code: "<p>Первая<br>Вторая</p>\n<hr>" },
    { term: "<img>", text: "Картинка. src — где лежит, alt — описание.", code: '<img src="assets/cat.svg" alt="Кошка" width="100">' },
    { term: "<a>", text: "Ссылка. href — куда она ведёт.", code: '<a href="https://ru.wikipedia.org">Википедия</a>' },
    { term: "<ul>, <ol>, <li>", text: "Маркированный и нумерованный список; li — пункт.", code: "<ul><li>А</li><li>Б</li></ul>\n<ol><li>1</li><li>2</li></ol>" },
    { term: "<table>, <tr>, <th>, <td>", text: "Таблица, строка, ячейка-заголовок, ячейка с данными.", code: '<table border="1">\n  <tr><th>А</th><th>Б</th></tr>\n  <tr><td>1</td><td>2</td></tr>\n</table>' },
    { term: "<form>, <input>, <button>", text: "Форма, поле ввода, кнопка.", code: '<form>\n  <input type="text" placeholder="Твоё имя">\n  <button>OK</button>\n</form>' },
    { term: "<label>", text: "Подпись к полю. При нажатии на подпись поле становится активным.", code: '<label><input type="checkbox"> Согласен</label>' },
    { term: "<select>, <option>", text: "Выпадающий список для выбора.", code: "<select>\n  <option>А</option>\n  <option>Б</option>\n</select>" },
    { term: "<div>, <span>", text: "Коробки без смысла: div — блок, span — внутри строки. Чаще всего нужны для CSS.", code: "<div>Блок</div>\n<p>В строке есть <span>span</span></p>" },
    { term: "<header>, <nav>, <main>, <section>, <footer>", text: "Семантические теги: говорят о смысле частей страницы.", code: "<header>Верх</header>\n<main><section>Раздел</section></main>\n<footer>Низ</footer>" },
    { term: "Комментарий <!-- -->", text: "Пояснение для человека, которое браузер не показывает.", code: "<!-- это не видно -->\n<p>Это видно</p>" },
  ];
})();
