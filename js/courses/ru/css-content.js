/* Курс CSS: задания, бонус, лекции, справочник */
(() => {
  const c = KZ.getCourse("css");
  c.status = "ready";

  const TRANSPARENT = (v) => v === "rgba(0, 0, 0, 0)" || v === "transparent";
  const px = (v) => parseFloat(v) || 0;
  const sides = (prop, val) => ({ [prop + "Top"]: val, [prop + "Right"]: val, [prop + "Bottom"]: val, [prop + "Left"]: val });

  c.levels = [
    /* ---------- 1. Селекторы и цвет ---------- */
    {
      id: "1.1", kind: "css", title: "Первый цвет",
      html: "<h1>Привет, CSS!</h1>\n<p>Это обычный абзац.</p>",
      task: "<p>Покрась заголовок <code>h1</code> в <b>красный</b> цвет (<code>red</code>). Цвет абзаца менять не надо.</p>" +
        "<p class='tip'>Правило CSS: <code>селектор { свойство: значение; }</code>. Селектор — «кому», свойство — «что», значение — «как».</p>",
      hint: "h1 { color: red; }",
      starter: "/* пиши стиль здесь */\n",
      solution: "h1 { color: red; }\n",
      par: 3,
      check: { rules: [
        { sel: "h1", style: { color: "red" }, label: "Цвет h1 — красный" },
        { sel: "p", style: { color: "rgb(31, 29, 54)" }, label: "Цвет абзаца не изменился" },
      ] },
    },
    {
      id: "1.2", kind: "css", title: "Селектор класса",
      html: '<p class="a">Первый (a)</p>\n<p class="b">Второй (b)</p>\n<p class="a">Третий (a)</p>',
      task: "<p>Сделай жёлтый фон (<code>yellow</code>) только у абзацев класса <code>a</code>. Селектор класса начинается с точки: <code>.a</code></p>",
      hint: ".a { background-color: yellow; }",
      starter: "/* сделай класс .a жёлтым */\n",
      solution: ".a { background-color: yellow; }\n",
      par: 3,
      check: { rules: [
        { sel: ".a", count: 2, style: { backgroundColor: "yellow" }, label: "Оба абзаца .a жёлтые" },
        { sel: ".b", style: { backgroundColor: TRANSPARENT }, label: "Абзац .b не закрашен" },
      ] },
    },

    /* ---------- 2. Текст ---------- */
    {
      id: "2.1", kind: "css", title: "Большой, по центру",
      html: "<h1>Заголовок</h1>\n<p>Увеличь абзац и поставь его по центру.</p>",
      task: "<p>Задай абзацу <code>p</code> размер шрифта <code>24px</code> и выровняй его <b>по центру</b> (<code>text-align: center</code>).</p>",
      hint: "p { font-size: 24px; text-align: center; }",
      starter: "/* напиши правило для p */\n",
      solution: "p {\n  font-size: 24px;\n  text-align: center;\n}\n",
      par: 4,
      check: { rules: [
        { sel: "p", style: { fontSize: "24px" }, label: "Размер шрифта 24px" },
        { sel: "p", style: { textAlign: "center" }, label: "Текст по центру" },
      ] },
    },
    {
      id: "2.2", kind: "css", title: "Характер шрифта",
      html: "<h1>Мой блог</h1>",
      task: "<p>Сделай текст <code>h1</code> <b>наклонным</b> (<code>font-style: italic</code>), <b>ЗАГЛАВНЫМИ БУКВАМИ</b> (<code>text-transform: uppercase</code>) и задай расстояние между буквами <code>3px</code> (<code>letter-spacing</code>).</p>",
      hint: "h1 { font-style: italic; text-transform: uppercase; letter-spacing: 3px; }",
      starter: "/* стиль для h1 */\n",
      solution: "h1 {\n  font-style: italic;\n  text-transform: uppercase;\n  letter-spacing: 3px;\n}\n",
      par: 5,
      check: { rules: [
        { sel: "h1", style: { fontStyle: "italic" }, label: "Наклонный текст" },
        { sel: "h1", style: { textTransform: "uppercase" }, label: "Заглавные буквы" },
        { sel: "h1", style: { letterSpacing: "3px" }, label: "Расстояние между буквами 3px" },
      ] },
    },

    /* ---------- 3. Модель коробки ---------- */
    {
      id: "3.1", kind: "css", title: "Внутренний отступ",
      html: '<div class="box">Коробка</div>',
      task: "<p>Дай коробке <code>.box</code> <b>padding: 20px</b> (внутренний отступ) и фон <code>lightblue</code>. Зелёный слой на диаграмме «Выбранный элемент» справа станет больше!</p>" +
        "<p class='tip'>Если нажать на элемент, ты увидишь его отступы: <b>margin</b> (внешний), <b>border</b> (рамка), <b>padding</b> (внутренний).</p>",
      hint: ".box { padding: 20px; background-color: lightblue; }",
      starter: "/* стиль для .box */\n",
      solution: ".box {\n  padding: 20px;\n  background-color: lightblue;\n}\n",
      par: 4,
      check: { rules: [
        { sel: ".box", style: sides("padding", "20px"), label: "padding 20px со всех четырёх сторон" },
        { sel: ".box", style: { backgroundColor: "lightblue" }, label: "Фон lightblue" },
      ] },
    },
    {
      id: "3.2", kind: "css", title: "Рамка и внешний отступ",
      html: '<div class="box">Коробка</div>\n<div class="box">Вторая коробка</div>',
      task: "<p>Дай каждой коробке <code>.box</code> <b>сплошную красную рамку 4px</b> (<code>border: 4px solid red</code>) и <b>margin: 30px</b>. Коробки отодвинутся друг от друга.</p>",
      hint: ".box { border: 4px solid red; margin: 30px; }",
      starter: "/* стиль для .box */\n",
      solution: ".box {\n  border: 4px solid red;\n  margin: 30px;\n}\n",
      par: 4,
      check: { rules: [
        { sel: ".box", count: 2, style: { borderTopWidth: (v) => v === "4px", borderTopStyle: "solid", borderTopColor: "red" }, label: "Рамка: 4px solid red" },
        { sel: ".box", count: 2, style: sides("margin", "30px"), label: "margin 30px" },
      ] },
    },

    /* ---------- 4. Размер и расположение ---------- */
    {
      id: "4.1", kind: "css", title: "Из строчного в блочный",
      html: '<span class="b">Раз</span>\n<span class="b">Два</span>\n<span class="b">Три</span>',
      task: "<p>Элементы <code>span</code> обычно стоят в один ряд. Сделай каждому <code>.b</code> <code>display: block</code>, ширину <code>150px</code> и фон <code>orange</code>: они встанут друг под другом.</p>",
      hint: ".b { display: block; width: 150px; background-color: orange; }",
      starter: "/* стиль для .b */\n",
      solution: ".b {\n  display: block;\n  width: 150px;\n  background-color: orange;\n}\n",
      par: 5,
      check: { rules: [
        { sel: ".b", count: 3, style: { display: "block" }, label: "У всех трёх display: block" },
        { sel: ".b", count: 3, style: { width: "150px" }, label: "Ширина 150px" },
        { sel: ".b", count: 3, style: { backgroundColor: "orange" }, label: "Фон orange" },
      ] },
    },
    {
      id: "4.2", kind: "css", title: "Приклеить к углу",
      html: '<div class="card">\n  <span class="badge">NEW</span>\n  Текст карточки\n</div>',
      task: "<p>Приклей значок <code>.badge</code> к <b>правому верхнему углу</b> карточки. Для этого задай <code>.card</code> свойство <code>position: relative</code>, а <code>.badge</code> — <code>position: absolute; top: 0; right: 0</code>. Ещё добавь карточке рамку (<code>border: 2px solid black</code>) и <code>height: 100px</code>.</p>",
      hint: ".card { position: relative; border: 2px solid black; height: 100px; }\n.badge { position: absolute; top: 0; right: 0; }",
      starter: "/* .card и .badge */\n",
      solution: ".card {\n  position: relative;\n  border: 2px solid black;\n  height: 100px;\n}\n.badge {\n  position: absolute;\n  top: 0;\n  right: 0;\n}\n",
      par: 10,
      check: { rules: [
        { sel: ".card", style: { position: "relative", height: "100px" }, label: ".card: position relative, высота 100px" },
        { sel: ".badge", style: { position: "absolute" }, label: ".badge: position absolute" },
      ], fn: (d, w) => {
        const card = d.querySelector(".card"), b = d.querySelector(".badge");
        if (!card || !b) return [{ label: "Значок в правом верхнем углу карточки", ok: false }];
        const cr = card.getBoundingClientRect(), br = b.getBoundingClientRect();
        const bw = px(w.getComputedStyle(card).borderRightWidth), bt = px(w.getComputedStyle(card).borderTopWidth);
        return [{ label: "Значок в правом верхнем углу карточки", ok: Math.abs(br.right - (cr.right - bw)) < 2 && Math.abs(br.top - (cr.top + bt)) < 2 }];
      } },
    },

    /* ---------- 5. Flexbox ---------- */
    {
      id: "5.1", kind: "css", title: "Выстрой в ряд",
      html: '<div class="row">\n  <div class="item">1</div>\n  <div class="item">2</div>\n  <div class="item">3</div>\n</div>',
      task: "<p>Коробки внутри <code>.row</code> стоят друг под другом. Дай <code>.row</code> свойства <code>display: flex</code> и <code>gap: 10px</code>: они выстроятся в ряд.</p>" +
        "<p class='tip'><b>Flexbox</b> — инструмент, который позволяет одной строкой у родителя выстроить его детей в ряд или в столбец.</p>",
      hint: ".row { display: flex; gap: 10px; }",
      starter: "/* стиль для .row */\n.item { background: #ffd23f; padding: 12px; border: 2px solid #1f1d36; }\n",
      solution: ".row {\n  display: flex;\n  gap: 10px;\n}\n.item { background: #ffd23f; padding: 12px; border: 2px solid #1f1d36; }\n",
      par: 6,
      check: { rules: [
        { sel: ".row", style: { display: "flex" }, label: ".row: display flex" },
        { sel: ".row", style: { columnGap: "10px" }, label: "gap: 10px" },
      ], fn: (d) => {
        const r = [...d.querySelectorAll(".item")].map((e) => e.getBoundingClientRect().top);
        return [{ label: "Три коробки стоят в один ряд", ok: r.length === 3 && r.every((t) => Math.abs(t - r[0]) < 2) }];
      } },
    },
    {
      id: "5.2", kind: "css", title: "К краям и по центру",
      html: '<div class="row">\n  <div class="item">A</div>\n  <div class="item tall">B</div>\n  <div class="item">C</div>\n</div>',
      task: "<p><code>.row</code> — flex. Расставь коробки <b>по краям</b> (<code>justify-content: space-between</code>) и выровняй <b>по центру по вертикали</b> (<code>align-items: center</code>).</p>",
      hint: ".row { display: flex; justify-content: space-between; align-items: center; }",
      starter: "/* .row: flex, раздвинь по краям, выровняй по центру */\n.item { background: #ffd23f; padding: 12px; border: 2px solid #1f1d36; }\n.tall { padding: 30px 12px; }\n",
      solution: ".row {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n.item { background: #ffd23f; padding: 12px; border: 2px solid #1f1d36; }\n.tall { padding: 30px 12px; }\n",
      par: 8,
      check: { rules: [
        { sel: ".row", style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, label: ".row: flex, space-between, center" },
      ] },
    },

    /* ---------- 6. Grid ---------- */
    {
      id: "6.1", kind: "css", title: "Сетка из трёх столбцов",
      html: '<div class="grid">\n  <div class="cell">1</div>\n  <div class="cell">2</div>\n  <div class="cell">3</div>\n  <div class="cell">4</div>\n  <div class="cell">5</div>\n  <div class="cell">6</div>\n</div>',
      task: "<p>Сделай <code>.grid</code> сеткой (<code>display: grid</code>) с <b>3 равными столбцами</b> (<code>grid-template-columns: repeat(3, 1fr)</code>) и <code>gap: 8px</code>. Шесть ячеек встанут в две строки по 3.</p>" +
        "<p class='tip'><code>1fr</code> — «одна доля свободного места». <code>repeat(3, 1fr)</code> = <code>1fr 1fr 1fr</code>.</p>",
      hint: ".grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }",
      starter: "/* стиль для .grid */\n.cell { background: #5ad8c8; padding: 12px; border: 2px solid #1f1d36; text-align: center; }\n",
      solution: ".grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 8px;\n}\n.cell { background: #5ad8c8; padding: 12px; border: 2px solid #1f1d36; text-align: center; }\n",
      par: 6,
      check: { rules: [
        { sel: ".grid", style: { display: "grid" }, label: ".grid: display grid" },
        { sel: ".grid", style: { gridTemplateColumns: (v) => v.trim().split(/\s+/).length === 3 }, label: "Есть 3 столбца" },
        { sel: ".grid", style: { columnGap: "8px" }, label: "gap: 8px" },
      ] },
    },
    {
      id: "6.2", kind: "css", title: "Занять две ячейки",
      html: '<div class="grid">\n  <div class="cell wide">Широкая</div>\n  <div class="cell">2</div>\n  <div class="cell">3</div>\n  <div class="cell">4</div>\n</div>',
      task: "<p>Сетка готова (3 столбца). Пусть ячейка <code>.wide</code> занимает <b>2 столбца</b>: <code>grid-column: span 2</code>.</p>",
      hint: ".wide { grid-column: span 2; }",
      starter: ".grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }\n.cell { background: #5ad8c8; padding: 12px; border: 2px solid #1f1d36; text-align: center; }\n/* напиши правило для .wide */\n",
      solution: ".grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }\n.cell { background: #5ad8c8; padding: 12px; border: 2px solid #1f1d36; text-align: center; }\n.wide { grid-column: span 2; }\n",
      par: 4,
      check: { rules: [
        { sel: ".wide", style: { gridColumnStart: (v) => v === "span 2" }, label: ".wide: grid-column span 2" },
      ], fn: (d) => {
        const wide = d.querySelector(".wide").getBoundingClientRect().width;
        const cell = d.querySelectorAll(".cell")[1].getBoundingClientRect().width;
        return [{ label: "Ячейка .wide примерно вдвое шире остальных", ok: wide > cell * 1.8 }];
      } },
    },

    /* ---------- 7. Анимация и адаптивность ---------- */
    {
      id: "7.1", kind: "css", title: "Плавное изменение",
      html: '<button class="btn">Нажми меня</button>',
      task: "<p>Дай кнопке <code>.btn</code> свойство <code>transition: 0.3s</code>, а при наведении (<code>.btn:hover</code>) пусть её фон станет <code>tomato</code>. После проверки наведи курсор на кнопку!</p>",
      hint: ".btn { transition: 0.3s; }\n.btn:hover { background-color: tomato; }",
      starter: ".btn { padding: 12px 20px; font-size: 18px; border: 3px solid #1f1d36; background: #ffd23f; border-radius: 10px; }\n/* transition и :hover */\n",
      solution: ".btn { padding: 12px 20px; font-size: 18px; border: 3px solid #1f1d36; background: #ffd23f; border-radius: 10px; }\n.btn {\n  transition: 0.3s;\n}\n.btn:hover {\n  background-color: tomato;\n}\n",
      par: 7,
      check: { rules: [
        { sel: ".btn", style: { transitionDuration: (v) => parseFloat(v) > 0 }, label: "У .btn есть transition (длительность больше 0)" },
      ], fn: (d, w, code) => [
        { label: "В правиле .btn:hover фон tomato", ok: /\.btn:hover\s*\{[^}]*background(-color)?\s*:\s*tomato/i.test(code) },
      ] },
    },
    {
      id: "7.2", kind: "css", title: "Подстройка под телефон",
      html: '<div class="row">\n  <div class="item">1</div>\n  <div class="item">2</div>\n  <div class="item">3</div>\n</div>',
      task: "<p>Когда экран широкий, коробки стоят в ряд, а когда <b>ширина 600px или меньше</b> — в столбец. Для этого внутри <code>@media (max-width: 600px) { … }</code> задай <code>.row</code> свойство <code>flex-direction: column</code>.</p>" +
        "<p class='tip'>Окно предпросмотра узкое, поэтому медиа-правило сработает сразу. На настоящей странице оно смотрит на ширину экрана.</p>",
      hint: "@media (max-width: 600px) {\n  .row { flex-direction: column; }\n}",
      starter: ".row { display: flex; gap: 8px; }\n.item { background: #ffd23f; padding: 12px; border: 2px solid #1f1d36; }\n/* @media пиши здесь */\n",
      solution: ".row { display: flex; gap: 8px; }\n.item { background: #ffd23f; padding: 12px; border: 2px solid #1f1d36; }\n@media (max-width: 600px) {\n  .row { flex-direction: column; }\n}\n",
      par: 6,
      check: { rules: [
        { sel: ".row", style: { flexDirection: "column" }, label: "На узком экране .row выстраивается в столбец" },
      ], fn: (d, w, code) => [
        { label: "Код написан внутри @media (max-width: 600px)", ok: /@media[^{]*max-width\s*:\s*600px[^{]*\{[^}]*\{[^}]*flex-direction\s*:\s*column/i.test(code) },
      ] },
    },
  ];

  /* ---------- Дополнительно ---------- */
  c.bonus = [
    {
      id: "B1", kind: "css", title: "Светофор",
      html: '<div class="light"></div>\n<div class="light"></div>\n<div class="light"></div>',
      task: "<p>Сделай из трёх элементов <code>.light</code> круги: ширина и высота <code>60px</code>, <code>border-radius: 50%</code>. Цвета сверху вниз: <b>красный, жёлтый, зелёный</b> (<code>.light:nth-child(1)</code> и так далее). Коробки стоят друг под другом.</p>",
      hint: ".light { width: 60px; height: 60px; border-radius: 50%; }\n.light:nth-child(1) { background: red; }\n…",
      starter: "/* светофор */\n",
      solution: ".light {\n  width: 60px;\n  height: 60px;\n  border-radius: 50%;\n}\n.light:nth-child(1) { background: red; }\n.light:nth-child(2) { background: yellow; }\n.light:nth-child(3) { background: green; }\n",
      par: 10,
      check: { rules: [
        { sel: ".light", count: 3, style: { width: "60px", height: "60px" }, label: "Все три 60px × 60px" },
        { sel: ".light", count: 3, style: { borderTopLeftRadius: "50%" }, label: "Все три — круги (border-radius 50%)" },
        { sel: ".light:nth-child(1)", style: { backgroundColor: "red" }, label: "Первый — красный" },
        { sel: ".light:nth-child(2)", style: { backgroundColor: "yellow" }, label: "Второй — жёлтый" },
        { sel: ".light:nth-child(3)", style: { backgroundColor: "green" }, label: "Третий — зелёный" },
      ] },
    },
    {
      id: "B2", kind: "css", title: "Красивая карточка",
      html: '<div class="card">\n  <h2>Карточка</h2>\n  <p>Украшать страницу с CSS очень просто.</p>\n</div>',
      task: "<p>Оформи <code>.card</code>: <code>padding: 16px</code>, <code>border-radius: 12px</code>, <code>background: white</code>, тень (<code>box-shadow: 4px 4px 0 #1f1d36</code>) и <code>max-width: 300px</code>.</p>",
      hint: ".card { padding: 16px; border-radius: 12px; background: white; box-shadow: 4px 4px 0 #1f1d36; max-width: 300px; }",
      starter: "/* .card */\n",
      solution: ".card {\n  padding: 16px;\n  border-radius: 12px;\n  background: white;\n  box-shadow: 4px 4px 0 #1f1d36;\n  max-width: 300px;\n}\n",
      par: 7,
      check: { rules: [
        { sel: ".card", style: sides("padding", "16px"), label: "padding 16px" },
        { sel: ".card", style: { borderTopLeftRadius: "12px" }, label: "border-radius 12px" },
        { sel: ".card", style: { backgroundColor: "white" }, label: "Фон белый" },
        { sel: ".card", style: { boxShadow: (v) => v !== "none" }, label: "Есть тень" },
        { sel: ".card", style: { maxWidth: "300px" }, label: "max-width 300px" },
      ] },
    },
    {
      id: "B3", kind: "css", title: "Точно по центру",
      html: '<div class="parent">\n  <div class="child">Я в центре</div>\n</div>',
      task: "<p>У <code>.parent</code> должна быть высота <code>200px</code> и рамка (<code>border: 2px solid black</code>). Элемент <code>.child</code> внутри должен стоять <b>по центру и по горизонтали, и по вертикали</b>. Подсказка: flex и два свойства.</p>",
      hint: ".parent { height: 200px; border: 2px solid black; display: flex; justify-content: center; align-items: center; }",
      starter: "/* .parent */\n",
      solution: ".parent {\n  height: 200px;\n  border: 2px solid black;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n",
      par: 8,
      check: { rules: [
        { sel: ".parent", style: { height: "200px" }, label: "Высота .parent 200px" },
        { sel: ".parent", style: { borderTopWidth: (v) => v === "2px" }, label: "У .parent есть рамка" },
      ], fn: (d) => {
        const p = d.querySelector(".parent").getBoundingClientRect();
        const ch = d.querySelector(".child").getBoundingClientRect();
        const dx = Math.abs(p.left + p.width / 2 - (ch.left + ch.width / 2));
        const dy = Math.abs(p.top + p.height / 2 - (ch.top + ch.height / 2));
        return [{ label: ".child по центру в обоих направлениях", ok: dx < 3 && dy < 3 }];
      } },
    },
  ];

  /* ---------- Лекции ---------- */
  const H = "<h1>Заголовок</h1>\n<p>Первый абзац.</p>\n<p class=\"a\">Абзац класса a.</p>";
  c.lectures = [
    {
      id: "l1", topic: "1", title: "Правило CSS и селекторы", minutes: 4,
      blocks: [
        { t: "p", html: "Если HTML строит страницу, то <b>CSS</b> её <b>украшает</b>: цвет, размер, расположение. Код CSS состоит из правил:" },
        { t: "code", code: "селектор {\n  свойство: значение;\n}" },
        { t: "list", items: ["<b>селектор</b> — к кому применяем (h1, .класс, #id)", "<b>свойство</b> — что меняем (color, font-size)", "<b>значение</b> — как меняем (red, 20px)"] },
        { t: "live", kind: "css", html: H, code: "h1 {\n  color: tomato;\n}" },
        { t: "h", text: "Три основных селектора" },
        { t: "list", items: ["<code>p</code> — все <code>&lt;p&gt;</code>", "<code>.a</code> — все с классом <code>a</code> (<code>class=\"a\"</code>)", "<code>#x</code> — один элемент с id <code>x</code>"] },
        { t: "live", kind: "css", html: H, code: ".a {\n  background-color: yellow;\n}\np {\n  color: purple;\n}" },
        { t: "tip", html: "Если нажать на любой элемент, его код подсветится. Это поможет выбрать селектор." },
      ],
    },
    {
      id: "l2", topic: "2", title: "Оформляем текст", minutes: 3,
      blocks: [
        { t: "list", items: ["<code>color</code> — цвет текста", "<code>font-size</code> — размер (<code>20px</code>)", "<code>font-weight</code> — толщина (<code>bold</code>)", "<code>font-style</code> — <code>italic</code>", "<code>text-align</code> — <code>left / center / right</code>", "<code>text-decoration</code> — <code>underline</code>", "<code>letter-spacing</code>, <code>line-height</code> — расстояния"] },
        { t: "live", kind: "css", html: "<h1>Заголовок</h1>\n<p>Текст абзаца здесь.</p>", code: "h1 {\n  text-align: center;\n  letter-spacing: 4px;\n}\np {\n  font-size: 22px;\n  font-style: italic;\n  color: teal;\n}" },
        { t: "tip", html: "Цвета можно писать по имени (<code>red</code>), HEX-кодом (<code>#ff6b6b</code>) или в виде <code>rgb(255, 107, 107)</code>." },
      ],
    },
    {
      id: "l3", topic: "3", title: "Модель коробки", minutes: 4,
      blocks: [
        { t: "p", html: "В HTML <b>каждый элемент — прямоугольная коробка</b>. Коробка состоит из слоёв (изнутри наружу):" },
        { t: "list", items: ["<b>content</b> — содержимое (текст, картинка)", "<b>padding</b> — внутренний отступ между содержимым и рамкой", "<b>border</b> — рамка", "<b>margin</b> — отступ снаружи коробки"] },
        { t: "live", kind: "css", html: '<div class="box">Коробка</div>', code: ".box {\n  background: lightblue;\n  padding: 20px;\n  border: 4px solid navy;\n  margin: 30px;\n}" },
        { t: "p", html: "Нажми на коробку и посмотри на диаграмму «Выбранный элемент» справа: она показывает эти слои. Меняй значения и смотри, как обновляется диаграмма." },
        { t: "tip", html: "<code>margin: 10px 20px</code> — сверху и снизу 10, слева и справа 20. Четыре значения идут по часовой стрелке: сверху, справа, снизу, слева." },
      ],
    },
    {
      id: "l4", topic: "4", title: "display и position", minutes: 4,
      blocks: [
        { t: "p", html: "<code>display</code> говорит, как элемент себя ведёт:" },
        { t: "list", items: ["<code>block</code> — занимает всю ширину, начинается с новой строки (div, p, h1)", "<code>inline</code> — стоит внутри текста, ширину и высоту не изменить (span, a)", "<code>none</code> — как будто его совсем нет"] },
        { t: "live", kind: "css", html: '<span class="s">Раз</span> <span class="s">Два</span> <span class="s">Три</span>', code: ".s {\n  background: orange;\n  display: block;\n  width: 120px;\n}" },
        { t: "h", text: "position" },
        { t: "p", html: "<code>position: absolute</code> ставит элемент в точное место внутри родителя (у родителя должно быть <code>position: relative</code>)." },
        { t: "live", kind: "css", html: '<div class="card"><span class="badge">NEW</span>Карточка</div>', code: ".card {\n  position: relative;\n  border: 2px solid black;\n  height: 80px;\n}\n.badge {\n  position: absolute;\n  top: 0;\n  right: 0;\n  background: gold;\n}" },
      ],
    },
    {
      id: "l5", topic: "5", title: "Flexbox", minutes: 4,
      blocks: [
        { t: "p", html: "Если дать родителю <code>display: flex</code>, его дети выстроятся <b>в ряд</b>. Дальше ты управляешь ими по двум осям:" },
        { t: "list", items: ["<code>justify-content</code> — распределение по горизонтали (<code>center</code>, <code>space-between</code>, <code>flex-end</code>)", "<code>align-items</code> — выравнивание по вертикали (<code>center</code>, <code>flex-start</code>)", "<code>gap</code> — расстояние между элементами", "<code>flex-direction: column</code> — столбец вместо ряда"] },
        { t: "live", kind: "css", html: '<div class="row"><div class="i">1</div><div class="i">2</div><div class="i">3</div></div>', code: ".row {\n  display: flex;\n  justify-content: space-between;\n  gap: 10px;\n}\n.i {\n  background: #ffd23f;\n  padding: 14px;\n  border: 2px solid #1f1d36;\n}" },
        { t: "tip", html: "Попробуй поменять значения по очереди: <code>center</code>, <code>flex-end</code>, <code>space-around</code>." },
      ],
    },
    {
      id: "l6", topic: "6", title: "Grid", minutes: 3,
      blocks: [
        { t: "p", html: "Flexbox выстраивает в одном направлении, а <b>Grid</b> — это двумерная сетка: строки и столбцы. У родителя пишем:" },
        { t: "code", code: ".grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 8px;\n}" },
        { t: "live", kind: "css", html: '<div class="g"><div class="c">1</div><div class="c">2</div><div class="c">3</div><div class="c">4</div><div class="c">5</div></div>', code: ".g {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 8px;\n}\n.c {\n  background: #5ad8c8;\n  padding: 14px;\n  border: 2px solid #1f1d36;\n}\n.c:first-child {\n  grid-column: span 2;\n}" },
        { t: "tip", html: "Когда что? Один ряд или один столбец — <b>flex</b>. Макет страницы, галерея, сетка — <b>grid</b>." },
      ],
    },
    {
      id: "l7", topic: "7", title: "Анимация и адаптивность", minutes: 3,
      blocks: [
        { t: "p", html: "<code>transition</code> делает изменение плавным, а <code>:hover</code> задаёт вид при наведении курсора." },
        { t: "live", kind: "css", html: '<button class="btn">Наведи курсор</button>', code: ".btn {\n  padding: 12px 20px;\n  border: 3px solid #1f1d36;\n  background: #ffd23f;\n  transition: 0.3s;\n}\n.btn:hover {\n  background: tomato;\n  transform: scale(1.1);\n}" },
        { t: "h", text: "Адаптивность" },
        { t: "p", html: "<code>@media</code> меняет стиль в зависимости от размера экрана. В примере ниже, когда экран уже 600px, фон меняется:" },
        { t: "live", kind: "css", html: '<div class="b">Я меняюсь в зависимости от размера</div>', code: ".b {\n  padding: 20px;\n  background: lightgreen;\n}\n@media (max-width: 600px) {\n  .b {\n    background: pink;\n  }\n}" },
      ],
    },
  ];

  /* ---------- Справочник ---------- */
  c.reference = [
    { term: "color, background-color", text: "Цвет текста и цвет фона.", code: "h1 {\n  color: white;\n  background-color: #6c5ce7;\n}" },
    { term: "font-size, font-weight, font-style", text: "Размер шрифта, толщина, наклон.", code: "h1 {\n  font-size: 40px;\n  font-weight: bold;\n  font-style: italic;\n}" },
    { term: "text-align", text: "Выравнивание текста: left, center, right.", code: "h1 { text-align: center; }" },
    { term: "padding", text: "Внутренний отступ между содержимым и рамкой.", code: "h1 {\n  padding: 20px;\n  background: gold;\n}" },
    { term: "margin", text: "Отступ снаружи элемента.", code: "h1 {\n  margin: 40px;\n  background: gold;\n}" },
    { term: "border", text: "Рамка: толщина, вид, цвет. Виды: solid, dashed, dotted.", code: "p {\n  border: 3px dashed tomato;\n}" },
    { term: "border-radius", text: "Скругляет углы. 50% — круг.", code: ".box {\n  width: 80px;\n  height: 80px;\n  background: orange;\n  border-radius: 50%;\n}" },
    { term: "width, height, max-width", text: "Ширина, высота, наибольшая ширина.", code: ".box {\n  width: 200px;\n  height: 60px;\n  background: skyblue;\n}" },
    { term: "display", text: "block, inline, none, flex, grid: как элемент себя ведёт.", code: "p { display: none; }" },
    { term: "display: flex", text: "Выстраивает детей в ряд. justify-content, align-items, gap, flex-direction.", code: ".row {\n  display: flex;\n  gap: 10px;\n  justify-content: center;\n}" },
    { term: "display: grid", text: "Располагает детей по сетке.", code: ".grid {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr;\n  gap: 8px;\n}" },
    { term: "position", text: "relative, absolute, fixed: поставить элемент в точное место.", code: ".box {\n  position: relative;\n  top: 10px;\n  left: 10px;\n  background: pink;\n}" },
    { term: "box-shadow", text: "Тень: x, y, размытие, цвет.", code: ".box {\n  padding: 20px;\n  box-shadow: 6px 6px 0 black;\n}" },
    { term: "transition, :hover", text: "Плавное изменение и вид при наведении курсора.", code: ".box {\n  background: gold;\n  transition: 0.3s;\n}\n.box:hover {\n  background: tomato;\n}" },
    { term: "@media", text: "Стиль в зависимости от размера экрана.", code: "@media (max-width: 600px) {\n  body { background: pink; }\n}" },
  ];
})();
