/* CSS курсы: тапсырмалар, қосымша, лекциялар, анықтамалық */
(() => {
  const c = KZ.getCourse("css");
  c.status = "ready";

  const TRANSPARENT = (v) => v === "rgba(0, 0, 0, 0)" || v === "transparent";
  const px = (v) => parseFloat(v) || 0;
  const sides = (prop, val) => ({ [prop + "Top"]: val, [prop + "Right"]: val, [prop + "Bottom"]: val, [prop + "Left"]: val });

  c.levels = [
    /* ---------- 1. Селекторлар және түс ---------- */
    {
      id: "1.1", kind: "css", title: "Бірінші түс",
      html: "<h1>Сәлем, CSS!</h1>\n<p>Бұл қарапайым абзац.</p>",
      task: "<p><code>h1</code> тақырыбын <b>қызыл</b> (<code>red</code>) түске бояу. Абзац түсі өзгермесін.</p>" +
        "<p class='tip'>CSS ережесі: <code>селектор { қасиет: мән; }</code>. Селектор — «кімге», қасиет — «нені», мән — «қалай».</p>",
      hint: "h1 { color: red; }",
      starter: "/* стильді осында жаз */\n",
      solution: "h1 { color: red; }\n",
      par: 3,
      check: { rules: [
        { sel: "h1", style: { color: "red" }, label: "h1 түсі қызыл" },
        { sel: "p", style: { color: "rgb(31, 29, 54)" }, label: "Абзац түсі өзгерген жоқ" },
      ] },
    },
    {
      id: "1.2", kind: "css", title: "Класс селекторы",
      html: '<p class="a">Бірінші (a)</p>\n<p class="b">Екінші (b)</p>\n<p class="a">Үшінші (a)</p>',
      task: "<p>Тек <code>a</code> класындағы абзацтардың фонын сары (<code>yellow</code>) жаса. Класс селекторы нүктеден басталады: <code>.a</code></p>",
      hint: ".a { background-color: yellow; }",
      starter: "/* .a класын сары жаса */\n",
      solution: ".a { background-color: yellow; }\n",
      par: 3,
      check: { rules: [
        { sel: ".a", count: 2, style: { backgroundColor: "yellow" }, label: "Екі .a абзацының екеуі де сары" },
        { sel: ".b", style: { backgroundColor: TRANSPARENT }, label: ".b абзацы боялмаған" },
      ] },
    },

    /* ---------- 2. Мәтін ---------- */
    {
      id: "2.1", kind: "css", title: "Үлкен, ортада",
      html: "<h1>Тақырып</h1>\n<p>Абзацты үлкейтіп, ортаға қой.</p>",
      task: "<p><code>p</code> абзацының қаріп өлшемін <code>24px</code> және оны <b>ортаға</b> (<code>text-align: center</code>) орналастыр.</p>",
      hint: "p { font-size: 24px; text-align: center; }",
      starter: "/* p үшін ереже жаз */\n",
      solution: "p {\n  font-size: 24px;\n  text-align: center;\n}\n",
      par: 4,
      check: { rules: [
        { sel: "p", style: { fontSize: "24px" }, label: "Қаріп өлшемі 24px" },
        { sel: "p", style: { textAlign: "center" }, label: "Мәтін ортада" },
      ] },
    },
    {
      id: "2.2", kind: "css", title: "Қаріп мінезі",
      html: "<h1>Менің блогым</h1>",
      task: "<p><code>h1</code> мәтінін <b>көлбеу</b> (<code>font-style: italic</code>), <b>БАС ӘРІППЕН</b> (<code>text-transform: uppercase</code>) және әріптер аралығын <code>3px</code> (<code>letter-spacing</code>) жаса.</p>",
      hint: "h1 { font-style: italic; text-transform: uppercase; letter-spacing: 3px; }",
      starter: "/* h1 стилі */\n",
      solution: "h1 {\n  font-style: italic;\n  text-transform: uppercase;\n  letter-spacing: 3px;\n}\n",
      par: 5,
      check: { rules: [
        { sel: "h1", style: { fontStyle: "italic" }, label: "Көлбеу мәтін" },
        { sel: "h1", style: { textTransform: "uppercase" }, label: "Бас әріптер" },
        { sel: "h1", style: { letterSpacing: "3px" }, label: "Әріп аралығы 3px" },
      ] },
    },

    /* ---------- 3. Қорап моделі ---------- */
    {
      id: "3.1", kind: "css", title: "Ішкі бос орын",
      html: '<div class="box">Қорап</div>',
      task: "<p><code>.box</code> қорабына <b>padding: 20px</b> (ішкі бос орын) және <code>lightblue</code> фон бер. Оң жақтағы «Таңдалған элемент» диаграммасындағы жасыл қабат өседі!</p>" +
        "<p class='tip'>Элементті бассаң, оның <b>margin</b> (сыртқы), <b>border</b> (жиек), <b>padding</b> (ішкі) бос орындарын көресің.</p>",
      hint: ".box { padding: 20px; background-color: lightblue; }",
      starter: "/* .box стилі */\n",
      solution: ".box {\n  padding: 20px;\n  background-color: lightblue;\n}\n",
      par: 4,
      check: { rules: [
        { sel: ".box", style: sides("padding", "20px"), label: "Төрт жағынан padding 20px" },
        { sel: ".box", style: { backgroundColor: "lightblue" }, label: "Фон lightblue" },
      ] },
    },
    {
      id: "3.2", kind: "css", title: "Жиек және сыртқы орын",
      html: '<div class="box">Қорап</div>\n<div class="box">Екінші қорап</div>',
      task: "<p>Әр <code>.box</code> қорабына <b>4px қатты қызыл жиек</b> (<code>border: 4px solid red</code>) және <b>margin: 30px</b> бер. Қораптар бір-бірінен алыстайды.</p>",
      hint: ".box { border: 4px solid red; margin: 30px; }",
      starter: "/* .box стилі */\n",
      solution: ".box {\n  border: 4px solid red;\n  margin: 30px;\n}\n",
      par: 4,
      check: { rules: [
        { sel: ".box", count: 2, style: { borderTopWidth: (v) => v === "4px", borderTopStyle: "solid", borderTopColor: "red" }, label: "Жиек: 4px solid red" },
        { sel: ".box", count: 2, style: sides("margin", "30px"), label: "margin 30px" },
      ] },
    },

    /* ---------- 4. Өлшем және орналасу ---------- */
    {
      id: "4.1", kind: "css", title: "Жол ішінен блокқа",
      html: '<span class="b">Бір</span>\n<span class="b">Екі</span>\n<span class="b">Үш</span>',
      task: "<p><code>span</code> элементтері әдетте бір қатарда тұрады. Әр <code>.b</code>-ны <code>display: block</code> жасап, ені <code>150px</code>, фоны <code>orange</code> болсын: олар бірінің астына бірі тұрады.</p>",
      hint: ".b { display: block; width: 150px; background-color: orange; }",
      starter: "/* .b стилі */\n",
      solution: ".b {\n  display: block;\n  width: 150px;\n  background-color: orange;\n}\n",
      par: 5,
      check: { rules: [
        { sel: ".b", count: 3, style: { display: "block" }, label: "Үшеуі де display: block" },
        { sel: ".b", count: 3, style: { width: "150px" }, label: "Ені 150px" },
        { sel: ".b", count: 3, style: { backgroundColor: "orange" }, label: "Фон orange" },
      ] },
    },
    {
      id: "4.2", kind: "css", title: "Бұрышқа жапсыру",
      html: '<div class="card">\n  <span class="badge">NEW</span>\n  Карточка мәтіні\n</div>',
      task: "<p><code>.badge</code> белгісін карточканың <b>оң жоғарғы бұрышына</b> жапсыр. Ол үшін <code>.card</code>-қа <code>position: relative</code>, ал <code>.badge</code>-ке <code>position: absolute; top: 0; right: 0</code> бер. Карточкаға жиек (<code>border: 2px solid black</code>) және <code>height: 100px</code> де қос.</p>",
      hint: ".card { position: relative; border: 2px solid black; height: 100px; }\n.badge { position: absolute; top: 0; right: 0; }",
      starter: "/* .card және .badge */\n",
      solution: ".card {\n  position: relative;\n  border: 2px solid black;\n  height: 100px;\n}\n.badge {\n  position: absolute;\n  top: 0;\n  right: 0;\n}\n",
      par: 10,
      check: { rules: [
        { sel: ".card", style: { position: "relative", height: "100px" }, label: ".card: position relative, биіктігі 100px" },
        { sel: ".badge", style: { position: "absolute" }, label: ".badge: position absolute" },
      ], fn: (d, w) => {
        const card = d.querySelector(".card"), b = d.querySelector(".badge");
        if (!card || !b) return [{ label: "Белгі карточканың оң жоғарғы бұрышында", ok: false }];
        const cr = card.getBoundingClientRect(), br = b.getBoundingClientRect();
        const bw = px(w.getComputedStyle(card).borderRightWidth), bt = px(w.getComputedStyle(card).borderTopWidth);
        return [{ label: "Белгі карточканың оң жоғарғы бұрышында", ok: Math.abs(br.right - (cr.right - bw)) < 2 && Math.abs(br.top - (cr.top + bt)) < 2 }];
      } },
    },

    /* ---------- 5. Flexbox ---------- */
    {
      id: "5.1", kind: "css", title: "Қатарға тіз",
      html: '<div class="row">\n  <div class="item">1</div>\n  <div class="item">2</div>\n  <div class="item">3</div>\n</div>',
      task: "<p><code>.row</code> ішіндегі қораптар бірінің астына тұр. <code>.row</code>-ға <code>display: flex</code> және <code>gap: 10px</code> бер: олар қатарға тізіледі.</p>" +
        "<p class='tip'><b>Flexbox</b> — ата-ана элементке бір жол жазып, балаларын қатарға не бағанға тізетін құрал.</p>",
      hint: ".row { display: flex; gap: 10px; }",
      starter: "/* .row стилі */\n.item { background: #ffd23f; padding: 12px; border: 2px solid #1f1d36; }\n",
      solution: ".row {\n  display: flex;\n  gap: 10px;\n}\n.item { background: #ffd23f; padding: 12px; border: 2px solid #1f1d36; }\n",
      par: 6,
      check: { rules: [
        { sel: ".row", style: { display: "flex" }, label: ".row: display flex" },
        { sel: ".row", style: { columnGap: "10px" }, label: "gap: 10px" },
      ], fn: (d) => {
        const r = [...d.querySelectorAll(".item")].map((e) => e.getBoundingClientRect().top);
        return [{ label: "Үш қорап бір қатарда тұр", ok: r.length === 3 && r.every((t) => Math.abs(t - r[0]) < 2) }];
      } },
    },
    {
      id: "5.2", kind: "css", title: "Екі шетке және ортаға",
      html: '<div class="row">\n  <div class="item">A</div>\n  <div class="item tall">B</div>\n  <div class="item">C</div>\n</div>',
      task: "<p><code>.row</code> — flex. Қораптарды <b>екі шетке</b> таратып (<code>justify-content: space-between</code>), <b>тік бойынша ортаға</b> (<code>align-items: center</code>) қой.</p>",
      hint: ".row { display: flex; justify-content: space-between; align-items: center; }",
      starter: "/* .row: flex, шеттерге тарат, ортаға қой */\n.item { background: #ffd23f; padding: 12px; border: 2px solid #1f1d36; }\n.tall { padding: 30px 12px; }\n",
      solution: ".row {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n.item { background: #ffd23f; padding: 12px; border: 2px solid #1f1d36; }\n.tall { padding: 30px 12px; }\n",
      par: 8,
      check: { rules: [
        { sel: ".row", style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, label: ".row: flex, space-between, center" },
      ] },
    },

    /* ---------- 6. Grid ---------- */
    {
      id: "6.1", kind: "css", title: "Үш бағанды тор",
      html: '<div class="grid">\n  <div class="cell">1</div>\n  <div class="cell">2</div>\n  <div class="cell">3</div>\n  <div class="cell">4</div>\n  <div class="cell">5</div>\n  <div class="cell">6</div>\n</div>',
      task: "<p><code>.grid</code> элементін <code>display: grid</code> жасап, <b>3 тең баған</b> (<code>grid-template-columns: repeat(3, 1fr)</code>) және <code>gap: 8px</code> бер. Алты ұяшық екі жолға 3-тен орналасады.</p>" +
        "<p class='tip'><code>1fr</code> — «бос орынның бір үлесі». <code>repeat(3, 1fr)</code> = <code>1fr 1fr 1fr</code>.</p>",
      hint: ".grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }",
      starter: "/* .grid стилі */\n.cell { background: #5ad8c8; padding: 12px; border: 2px solid #1f1d36; text-align: center; }\n",
      solution: ".grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 8px;\n}\n.cell { background: #5ad8c8; padding: 12px; border: 2px solid #1f1d36; text-align: center; }\n",
      par: 6,
      check: { rules: [
        { sel: ".grid", style: { display: "grid" }, label: ".grid: display grid" },
        { sel: ".grid", style: { gridTemplateColumns: (v) => v.trim().split(/\s+/).length === 3 }, label: "3 баған бар" },
        { sel: ".grid", style: { columnGap: "8px" }, label: "gap: 8px" },
      ] },
    },
    {
      id: "6.2", kind: "css", title: "Екі ұяшықты алып жату",
      html: '<div class="grid">\n  <div class="cell wide">Кең</div>\n  <div class="cell">2</div>\n  <div class="cell">3</div>\n  <div class="cell">4</div>\n</div>',
      task: "<p>Тор дайын (3 баған). <code>.wide</code> ұяшығы <b>2 бағанды</b> алып жатсын: <code>grid-column: span 2</code>.</p>",
      hint: ".wide { grid-column: span 2; }",
      starter: ".grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }\n.cell { background: #5ad8c8; padding: 12px; border: 2px solid #1f1d36; text-align: center; }\n/* .wide үшін ереже жаз */\n",
      solution: ".grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }\n.cell { background: #5ad8c8; padding: 12px; border: 2px solid #1f1d36; text-align: center; }\n.wide { grid-column: span 2; }\n",
      par: 4,
      check: { rules: [
        { sel: ".wide", style: { gridColumnStart: (v) => v === "span 2" }, label: ".wide: grid-column span 2" },
      ], fn: (d) => {
        const wide = d.querySelector(".wide").getBoundingClientRect().width;
        const cell = d.querySelectorAll(".cell")[1].getBoundingClientRect().width;
        return [{ label: ".wide ұяшығы қалғандардан шамамен екі есе кең", ok: wide > cell * 1.8 }];
      } },
    },

    /* ---------- 7. Анимация және адаптивтілік ---------- */
    {
      id: "7.1", kind: "css", title: "Жұмсақ өзгеріс",
      html: '<button class="btn">Мені бас</button>',
      task: "<p><code>.btn</code> батырмасына <code>transition: 0.3s</code> бер, ал <code>.btn:hover</code> (меңзер үстіне келгенде) оның фоны <code>tomato</code> болсын. Тексерген соң батырмаға меңзерді апарып көр!</p>",
      hint: ".btn { transition: 0.3s; }\n.btn:hover { background-color: tomato; }",
      starter: ".btn { padding: 12px 20px; font-size: 18px; border: 3px solid #1f1d36; background: #ffd23f; border-radius: 10px; }\n/* transition және :hover */\n",
      solution: ".btn { padding: 12px 20px; font-size: 18px; border: 3px solid #1f1d36; background: #ffd23f; border-radius: 10px; }\n.btn {\n  transition: 0.3s;\n}\n.btn:hover {\n  background-color: tomato;\n}\n",
      par: 7,
      check: { rules: [
        { sel: ".btn", style: { transitionDuration: (v) => parseFloat(v) > 0 }, label: ".btn-да transition бар (ұзақтығы 0-ден артық)" },
      ], fn: (d, w, code) => [
        { label: ".btn:hover ережесінде фон tomato", ok: /\.btn:hover\s*\{[^}]*background(-color)?\s*:\s*tomato/i.test(code) },
      ] },
    },
    {
      id: "7.2", kind: "css", title: "Телефонға бейімдеу",
      html: '<div class="row">\n  <div class="item">1</div>\n  <div class="item">2</div>\n  <div class="item">3</div>\n</div>',
      task: "<p>Экран кең болғанда қораптар қатарда, ал <b>ені 600px немесе кіші</b> болғанда бағанға тізілсін. Ол үшін <code>@media (max-width: 600px) { … }</code> ішінде <code>.row</code>-ға <code>flex-direction: column</code> бер.</p>" +
        "<p class='tip'>Алдын ала көру терезесі тар болғандықтан, медиа-ереже бірден жұмыс істейді. Нағыз бетте ол экран енін қарайды.</p>",
      hint: "@media (max-width: 600px) {\n  .row { flex-direction: column; }\n}",
      starter: ".row { display: flex; gap: 8px; }\n.item { background: #ffd23f; padding: 12px; border: 2px solid #1f1d36; }\n/* @media осында */\n",
      solution: ".row { display: flex; gap: 8px; }\n.item { background: #ffd23f; padding: 12px; border: 2px solid #1f1d36; }\n@media (max-width: 600px) {\n  .row { flex-direction: column; }\n}\n",
      par: 6,
      check: { rules: [
        { sel: ".row", style: { flexDirection: "column" }, label: "Тар экранда .row бағанға тізіледі" },
      ], fn: (d, w, code) => [
        { label: "Код @media (max-width: 600px) ішінде жазылған", ok: /@media[^{]*max-width\s*:\s*600px[^{]*\{[^}]*\{[^}]*flex-direction\s*:\s*column/i.test(code) },
      ] },
    },
  ];

  /* ---------- Қосымша ---------- */
  c.bonus = [
    {
      id: "B1", kind: "css", title: "Светофор",
      html: '<div class="light"></div>\n<div class="light"></div>\n<div class="light"></div>',
      task: "<p>Үш <code>.light</code> элементін шеңбер ет: ені мен биіктігі <code>60px</code>, <code>border-radius: 50%</code>. Түстері жоғарыдан төмен: <b>қызыл, сары, жасыл</b> (<code>.light:nth-child(1)</code> т.с.с.). Қораптар бірінің астына тұрсын.</p>",
      hint: ".light { width: 60px; height: 60px; border-radius: 50%; }\n.light:nth-child(1) { background: red; }\n…",
      starter: "/* светофор */\n",
      solution: ".light {\n  width: 60px;\n  height: 60px;\n  border-radius: 50%;\n}\n.light:nth-child(1) { background: red; }\n.light:nth-child(2) { background: yellow; }\n.light:nth-child(3) { background: green; }\n",
      par: 10,
      check: { rules: [
        { sel: ".light", count: 3, style: { width: "60px", height: "60px" }, label: "Үшеуі де 60px × 60px" },
        { sel: ".light", count: 3, style: { borderTopLeftRadius: "50%" }, label: "Үшеуі де шеңбер (border-radius 50%)" },
        { sel: ".light:nth-child(1)", style: { backgroundColor: "red" }, label: "Бірінші — қызыл" },
        { sel: ".light:nth-child(2)", style: { backgroundColor: "yellow" }, label: "Екінші — сары" },
        { sel: ".light:nth-child(3)", style: { backgroundColor: "green" }, label: "Үшінші — жасыл" },
      ] },
    },
    {
      id: "B2", kind: "css", title: "Әдемі карточка",
      html: '<div class="card">\n  <h2>Карточка</h2>\n  <p>CSS-пен әдемілеу өте оңай.</p>\n</div>',
      task: "<p><code>.card</code>-ты безендір: <code>padding: 16px</code>, <code>border-radius: 12px</code>, <code>background: white</code>, көлеңке (<code>box-shadow: 4px 4px 0 #1f1d36</code>) және <code>max-width: 300px</code>.</p>",
      hint: ".card { padding: 16px; border-radius: 12px; background: white; box-shadow: 4px 4px 0 #1f1d36; max-width: 300px; }",
      starter: "/* .card */\n",
      solution: ".card {\n  padding: 16px;\n  border-radius: 12px;\n  background: white;\n  box-shadow: 4px 4px 0 #1f1d36;\n  max-width: 300px;\n}\n",
      par: 7,
      check: { rules: [
        { sel: ".card", style: sides("padding", "16px"), label: "padding 16px" },
        { sel: ".card", style: { borderTopLeftRadius: "12px" }, label: "border-radius 12px" },
        { sel: ".card", style: { backgroundColor: "white" }, label: "Фон ақ" },
        { sel: ".card", style: { boxShadow: (v) => v !== "none" }, label: "Көлеңке бар" },
        { sel: ".card", style: { maxWidth: "300px" }, label: "max-width 300px" },
      ] },
    },
    {
      id: "B3", kind: "css", title: "Дәл ортада",
      html: '<div class="parent">\n  <div class="child">Мен ортадамын</div>\n</div>',
      task: "<p><code>.parent</code> биіктігі <code>200px</code> болсын және жиегі (<code>border: 2px solid black</code>) бар. Ішіндегі <code>.child</code> <b>көлденең де, тік те ортада</b> тұрсын. Көмек: flex пен екі қасиет.</p>",
      hint: ".parent { height: 200px; border: 2px solid black; display: flex; justify-content: center; align-items: center; }",
      starter: "/* .parent */\n",
      solution: ".parent {\n  height: 200px;\n  border: 2px solid black;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}\n",
      par: 8,
      check: { rules: [
        { sel: ".parent", style: { height: "200px" }, label: ".parent биіктігі 200px" },
        { sel: ".parent", style: { borderTopWidth: (v) => v === "2px" }, label: ".parent жиегі бар" },
      ], fn: (d) => {
        const p = d.querySelector(".parent").getBoundingClientRect();
        const ch = d.querySelector(".child").getBoundingClientRect();
        const dx = Math.abs(p.left + p.width / 2 - (ch.left + ch.width / 2));
        const dy = Math.abs(p.top + p.height / 2 - (ch.top + ch.height / 2));
        return [{ label: ".child екі бағытта да ортада", ok: dx < 3 && dy < 3 }];
      } },
    },
  ];

  /* ---------- Лекциялар ---------- */
  const H = "<h1>Тақырып</h1>\n<p>Бірінші абзац.</p>\n<p class=\"a\">a класты абзац.</p>";
  c.lectures = [
    {
      id: "l1", topic: "1", title: "CSS ережесі және селекторлар", minutes: 4,
      blocks: [
        { t: "p", html: "HTML бетті құрса, <b>CSS</b> оны <b>безендіреді</b>: түс, өлшем, орналасу. CSS жазуы ережелерден тұрады:" },
        { t: "code", code: "селектор {\n  қасиет: мән;\n}" },
        { t: "list", items: ["<b>селектор</b> — кімге қолданамыз (h1, .класс, #id)", "<b>қасиет</b> — нені өзгертеміз (color, font-size)", "<b>мән</b> — қалай өзгертеміз (red, 20px)"] },
        { t: "live", kind: "css", html: H, code: "h1 {\n  color: tomato;\n}" },
        { t: "h", text: "Үш негізгі селектор" },
        { t: "list", items: ["<code>p</code> — барлық <code>&lt;p&gt;</code>", "<code>.a</code> — класы <code>a</code> барлығы (<code>class=\"a\"</code>)", "<code>#x</code> — id-і <code>x</code> бір элемент"] },
        { t: "live", kind: "css", html: H, code: ".a {\n  background-color: yellow;\n}\np {\n  color: purple;\n}" },
        { t: "tip", html: "Кез келген элементті бассаң, оның коды жарқырайды. Селекторды таңдауға көмектеседі." },
      ],
    },
    {
      id: "l2", topic: "2", title: "Мәтінді стильдеу", minutes: 3,
      blocks: [
        { t: "list", items: ["<code>color</code> — мәтін түсі", "<code>font-size</code> — өлшем (<code>20px</code>)", "<code>font-weight</code> — қалыңдық (<code>bold</code>)", "<code>font-style</code> — <code>italic</code>", "<code>text-align</code> — <code>left / center / right</code>", "<code>text-decoration</code> — <code>underline</code>", "<code>letter-spacing</code>, <code>line-height</code> — аралық"] },
        { t: "live", kind: "css", html: "<h1>Тақырып</h1>\n<p>Абзац мәтіні осында.</p>", code: "h1 {\n  text-align: center;\n  letter-spacing: 4px;\n}\np {\n  font-size: 22px;\n  font-style: italic;\n  color: teal;\n}" },
        { t: "tip", html: "Түстерді атымен (<code>red</code>), HEX кодымен (<code>#ff6b6b</code>) немесе <code>rgb(255, 107, 107)</code> түрінде жазуға болады." },
      ],
    },
    {
      id: "l3", topic: "3", title: "Қорап моделі", minutes: 4,
      blocks: [
        { t: "p", html: "HTML-дағы <b>әр элемент — төртбұрышты қорап</b>. Қорап қабаттардан тұрады (ішінен сыртқа):" },
        { t: "list", items: ["<b>content</b> — мазмұн (мәтін, сурет)", "<b>padding</b> — мазмұн мен жиек арасындағы ішкі бос орын", "<b>border</b> — жиек", "<b>margin</b> — қораптың сыртындағы бос орын"] },
        { t: "live", kind: "css", html: '<div class="box">Қорап</div>', code: ".box {\n  background: lightblue;\n  padding: 20px;\n  border: 4px solid navy;\n  margin: 30px;\n}" },
        { t: "p", html: "Қорапты басып, оң жақтағы «Таңдалған элемент» диаграммасына қара: ол осы қабаттарды көрсетеді. Мәндерді өзгертіп, диаграмма қалай жаңаратынын бақыла." },
        { t: "tip", html: "<code>margin: 10px 20px</code> — жоғары/төмен 10, сол/оң 20. Төрт мән — сағат тілі бойынша: жоғары, оң, төмен, сол." },
      ],
    },
    {
      id: "l4", topic: "4", title: "display және position", minutes: 4,
      blocks: [
        { t: "p", html: "<code>display</code> элементтің өзін қалай ұстайтынын айтады:" },
        { t: "list", items: ["<code>block</code> — бүкіл енді алады, жаңа жолдан басталады (div, p, h1)", "<code>inline</code> — мәтін ішінде тұрады, ені мен биіктігі өзгермейді (span, a)", "<code>none</code> — мүлде жоқ сияқты"] },
        { t: "live", kind: "css", html: '<span class="s">Бір</span> <span class="s">Екі</span> <span class="s">Үш</span>', code: ".s {\n  background: orange;\n  display: block;\n  width: 120px;\n}" },
        { t: "h", text: "position" },
        { t: "p", html: "<code>position: absolute</code> элементті ата-анасының ішінде нақты орынға қояды (ата-анада <code>position: relative</code> болу керек)." },
        { t: "live", kind: "css", html: '<div class="card"><span class="badge">NEW</span>Карточка</div>', code: ".card {\n  position: relative;\n  border: 2px solid black;\n  height: 80px;\n}\n.badge {\n  position: absolute;\n  top: 0;\n  right: 0;\n  background: gold;\n}" },
      ],
    },
    {
      id: "l5", topic: "5", title: "Flexbox", minutes: 4,
      blocks: [
        { t: "p", html: "Ата-анаға <code>display: flex</code> берсең, балалары <b>қатарға</b> тізіледі. Содан кейін оларды екі өспен басқарасың:" },
        { t: "list", items: ["<code>justify-content</code> — көлденең бағытта тарату (<code>center</code>, <code>space-between</code>, <code>flex-end</code>)", "<code>align-items</code> — тік бағытта туралау (<code>center</code>, <code>flex-start</code>)", "<code>gap</code> — арасындағы бос орын", "<code>flex-direction: column</code> — қатардың орнына баған"] },
        { t: "live", kind: "css", html: '<div class="row"><div class="i">1</div><div class="i">2</div><div class="i">3</div></div>', code: ".row {\n  display: flex;\n  justify-content: space-between;\n  gap: 10px;\n}\n.i {\n  background: #ffd23f;\n  padding: 14px;\n  border: 2px solid #1f1d36;\n}" },
        { t: "tip", html: "Мәндерді бір-бірлеп ауыстырып көр: <code>center</code>, <code>flex-end</code>, <code>space-around</code>." },
      ],
    },
    {
      id: "l6", topic: "6", title: "Grid", minutes: 3,
      blocks: [
        { t: "p", html: "Flexbox бір бағытта тізсе, <b>Grid</b> — екі өлшемді тор: жолдар мен бағандар. Ата-анада:" },
        { t: "code", code: ".grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 8px;\n}" },
        { t: "live", kind: "css", html: '<div class="g"><div class="c">1</div><div class="c">2</div><div class="c">3</div><div class="c">4</div><div class="c">5</div></div>', code: ".g {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 8px;\n}\n.c {\n  background: #5ad8c8;\n  padding: 14px;\n  border: 2px solid #1f1d36;\n}\n.c:first-child {\n  grid-column: span 2;\n}" },
        { t: "tip", html: "Қашан қайсысы? Бір қатар не бір баған — <b>flex</b>. Бет макеті, галерея, тор — <b>grid</b>." },
      ],
    },
    {
      id: "l7", topic: "7", title: "Анимация және адаптивтілік", minutes: 3,
      blocks: [
        { t: "p", html: "<code>transition</code> өзгерісті жұмсақ етеді, ал <code>:hover</code> меңзер үстіне келгендегі күйді береді." },
        { t: "live", kind: "css", html: '<button class="btn">Меңзерді апар</button>', code: ".btn {\n  padding: 12px 20px;\n  border: 3px solid #1f1d36;\n  background: #ffd23f;\n  transition: 0.3s;\n}\n.btn:hover {\n  background: tomato;\n  transform: scale(1.1);\n}" },
        { t: "h", text: "Адаптивтілік" },
        { t: "p", html: "<code>@media</code> экран өлшеміне қарай стильді өзгертеді. Төмендегі мысалда экран 600px-тен тар болғанда фон өзгереді:" },
        { t: "live", kind: "css", html: '<div class="b">Өлшемге байланысты өзгеремін</div>', code: ".b {\n  padding: 20px;\n  background: lightgreen;\n}\n@media (max-width: 600px) {\n  .b {\n    background: pink;\n  }\n}" },
      ],
    },
  ];

  /* ---------- Анықтамалық ---------- */
  c.reference = [
    { term: "color, background-color", text: "Мәтін түсі және фон түсі.", code: "h1 {\n  color: white;\n  background-color: #6c5ce7;\n}" },
    { term: "font-size, font-weight, font-style", text: "Қаріп өлшемі, қалыңдығы, көлбеулігі.", code: "h1 {\n  font-size: 40px;\n  font-weight: bold;\n  font-style: italic;\n}" },
    { term: "text-align", text: "Мәтінді туралау: left, center, right.", code: "h1 { text-align: center; }" },
    { term: "padding", text: "Мазмұн мен жиек арасындағы ішкі бос орын.", code: "h1 {\n  padding: 20px;\n  background: gold;\n}" },
    { term: "margin", text: "Элементтің сыртындағы бос орын.", code: "h1 {\n  margin: 40px;\n  background: gold;\n}" },
    { term: "border", text: "Жиек: қалыңдық, түрі, түсі. Түрлері: solid, dashed, dotted.", code: "p {\n  border: 3px dashed tomato;\n}" },
    { term: "border-radius", text: "Бұрыштарды дөңгелектейді. 50% — шеңбер.", code: ".box {\n  width: 80px;\n  height: 80px;\n  background: orange;\n  border-radius: 50%;\n}" },
    { term: "width, height, max-width", text: "Ені, биіктігі, ең үлкен ені.", code: ".box {\n  width: 200px;\n  height: 60px;\n  background: skyblue;\n}" },
    { term: "display", text: "block, inline, none, flex, grid: элемент өзін қалай ұстайды.", code: "p { display: none; }" },
    { term: "display: flex", text: "Балаларды қатарға тізеді. justify-content, align-items, gap, flex-direction.", code: ".row {\n  display: flex;\n  gap: 10px;\n  justify-content: center;\n}" },
    { term: "display: grid", text: "Балаларды торға орналастырады.", code: ".grid {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr;\n  gap: 8px;\n}" },
    { term: "position", text: "relative, absolute, fixed: элементті нақты орынға қою.", code: ".box {\n  position: relative;\n  top: 10px;\n  left: 10px;\n  background: pink;\n}" },
    { term: "box-shadow", text: "Көлеңке: x, y, бұлыңғырлық, түс.", code: ".box {\n  padding: 20px;\n  box-shadow: 6px 6px 0 black;\n}" },
    { term: "transition, :hover", text: "Жұмсақ өзгеріс пен меңзер үстіндегі күй.", code: ".box {\n  background: gold;\n  transition: 0.3s;\n}\n.box:hover {\n  background: tomato;\n}" },
    { term: "@media", text: "Экран өлшеміне қарай стиль.", code: "@media (max-width: 600px) {\n  body { background: pink; }\n}" },
  ];
})();
