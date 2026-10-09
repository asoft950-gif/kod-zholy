/* JavaScript курсы: тапсырмалар, қосымша, лекциялар, анықтамалық */
(() => {
  const c = KZ.getCourse("javascript");
  c.status = "ready";

  const num = (res, name) => {
    const v = res.vars[name];
    return v && v.t === "number" ? Number(v.s) : null;
  };

  c.levels = [
    /* ---------- 1. Айнымалылар ---------- */
    {
      id: "1.1", title: "Екі қорап",
      task: "<p><b>a</b> қорабына <code>7</code>, <b>b</b> қорабына <code>3</code> сал. Екеуінің қосындысын <code>console.log</code> арқылы экранға шығар.</p>" +
        "<p class='tip'>Қорап жасау: <code>let a = 7;</code> — оң жақта «a» қорабы пайда болады. Жолдың соңында нүктелі үтір <code>;</code> тұрады.</p>",
      hint: "Әр қорапқа let арқылы өз атын бер де, мәндерін = белгісімен сал. Содан кейін console.log ішіне екі қорапты + белгісімен жалғап жаз.",
      starter: "// a және b қораптарын жаса\n// қосындысын console.log-пен шығар\n",
      solution: "let a = 7;\nlet b = 3;\nconsole.log(a + b);\n",
      par: 3,
      check: { output: "10", vars: { a: "7", b: "3" } },
    },
    {
      id: "1.2", title: "Сәлемдесу",
      task: "<p><code>const name</code> қорабына өз атыңды жаз (тырнақшаға алып). Сосын экранға <code>Сәлем, Алия!</code> сияқты сәлемдесу шығар: Алия орнында сенің атың.</p>" +
        "<p class='tip'>Мәтінді қосуға болады: <code>\"Сәлем, \" + name + \"!\"</code></p>",
      hint: "Алдымен const арқылы мәтінді қорапқа сал (мәтін тырнақшада). Сосын console.log ішінде мәтіннің бөліктерін + белгісімен жалғастыр.",
      starter: "// name қорабына атыңды жаз\n// сәлемдесуді шығар\n",
      solution: 'const name = "Алия";\nconsole.log("Сәлем, " + name + "!");\n',
      par: 2,
      check: {
        fn(res) {
          const v = res.vars.name;
          if (!v) return "«name» қорабы жасалмаған.";
          if (v.t !== "string") return "name қорабында мәтін болуы керек (тырнақшаға ал).";
          if (res.output.trim() !== "Сәлем, " + v.s + "!") return "Экранға «Сәлем, " + v.s + "!» шығуы керек.";
          return null;
        },
      },
    },

    /* ---------- 2. Шарттар ---------- */
    {
      id: "2.1", title: "Жұп па, тақ па",
      task: "<p><code>x</code> қорабындағы сан <b>жұп</b> болса, экранға <code>жұп</code>, әйтпесе <code>тақ</code> деп шығар. Кодың <code>x</code> басқа сан болғанда да дұрыс жұмыс істеуі керек.</p>" +
        "<p class='tip'><code>x % 2 === 0</code> — x-ті 2-ге бөлгендегі қалдық 0 ме? Үш тең белгі <code>===</code> «тең бе?» деп салыстырады.</p>",
      hint: "Қалдықты табатын % амалын қолдан да, нәтижені 0-мен === арқылы салыстыр. Екі жолды if (…) { … } else { … } бөледі.",
      starter: "let x = 10;\n// if / else жаз\n",
      solution: 'let x = 10;\nif (x % 2 === 0) {\n  console.log("жұп");\n} else {\n  console.log("тақ");\n}\n',
      par: 6,
      check: {
        requireIf: true,
        fn(res) {
          const x = num(res, "x");
          if (x === null) return "«x» қорабында сан болуы керек.";
          const want = x % 2 === 0 ? "жұп" : "тақ";
          return res.output.trim() === want ? null : "x = " + x + " үшін экранға «" + want + "» шығуы керек.";
        },
      },
    },
    {
      id: "2.2", title: "Баға",
      task: "<p><code>ball</code> қорабына қарай экранға жаз: <b>90 не одан көп</b> болса — <code>Өте жақсы</code>, <b>50 не одан көп</b> болса — <code>Жақсы</code>, әйтпесе — <code>Қайталап көр</code>.</p>" +
        "<p class='tip'>Шарттарды тізбектеуге болады: <code>if … else if … else …</code></p>",
      hint: "Ең қатаң шарттан баста: if (…) { … }, одан кейін else if (…) { … }, ең соңында шарты жоқ else { … }. Салыстыруға >= керек.",
      starter: "let ball = 75;\n// шарттарды жаз\n",
      solution: 'let ball = 75;\nif (ball >= 90) {\n  console.log("Өте жақсы");\n} else if (ball >= 50) {\n  console.log("Жақсы");\n} else {\n  console.log("Қайталап көр");\n}\n',
      par: 9,
      check: {
        requireIf: true,
        fn(res) {
          const b = num(res, "ball");
          if (b === null) return "«ball» қорабында сан болуы керек.";
          const want = b >= 90 ? "Өте жақсы" : b >= 50 ? "Жақсы" : "Қайталап көр";
          return res.output.trim() === want ? null : "ball = " + b + " үшін экранға «" + want + "» шығуы керек.";
        },
      },
    },

    /* ---------- 3. Циклдер ---------- */
    {
      id: "3.1", title: "Бірден беске дейін",
      task: "<p>Экранға <code>1, 2, 3, 4, 5</code> сандарын шығар, әрқайсысы жаңа жолда. <code>for</code> циклін қолдан.</p>" +
        "<p class='tip'><code>for (let i = 1; i &lt;= 5; i++) { … }</code> — i 1-ден басталып, 5-ке дейін бір-бірден өседі.</p>",
      hint: "Цикл үш бөліктен тұрады: for (let i = …; …; …). Бастапқы мәнді, тоқтау шартын және қадамды ойла, дене ішінде i-ді console.log-пен шығар.",
      starter: "// for циклін жаз\n",
      solution: "for (let i = 1; i <= 5; i++) {\n  console.log(i);\n}\n",
      par: 3,
      check: { output: "1\n2\n3\n4\n5", requireFor: true },
    },
    {
      id: "3.2", title: "Қосынды",
      task: "<p>1-ден 10-ға дейінгі сандардың қосындысын тап: <code>s</code> қорабына жина да, соңында экранға шығар (55 болуы керек). Циклдің әр қадамында оң жақтағы <b>s</b> қорабы қалай өсетінін бақыла!</p>",
      hint: "Цикл ішінде i-дің әр мәнін s қорабына қосып отыр (+= белгісі көмектеседі). console.log-ты циклден кейін, тыс жерде жаз.",
      starter: "let s = 0;\n// циклмен қос\n",
      solution: "let s = 0;\nfor (let i = 1; i <= 10; i++) {\n  s += i;\n}\nconsole.log(s);\n",
      par: 5,
      check: { output: "55", vars: { s: "55" }, requireFor: true },
    },
    {
      id: "3.3", title: "Екі еселену",
      task: "<p><code>n = 1</code> болсын. <code>n</code> 100-ден кіші болғанша оны 2-ге көбейте бер (<code>while</code>). Соңында n-ді экранға шығар.</p>" +
        "<p class='tip'><code>while (шарт) { … }</code> шарт ақиқат болғанша қайталайды. <code>n *= 2</code> — n-ді екі еселеу.</p>",
      hint: "while (…) { … } ішіне шартты n-ге қарай жаз: n әлі кіші болса, оны көбейт. Цикл біткен соң ғана console.log шақыр.",
      starter: "let n = 1;\n// while циклін жаз\n",
      solution: "let n = 1;\nwhile (n < 100) {\n  n *= 2;\n}\nconsole.log(n);\n",
      par: 5,
      check: { output: "128", vars: { n: "128" }, requireWhile: true },
    },

    /* ---------- 4. Функциялар ---------- */
    {
      id: "4.1", title: "Қосу функциясы",
      task: "<p><code>qosu</code> деген функция жаса: ол екі санды алып, қосындысын <code>return</code> арқылы қайтарсын. Сосын <code>qosu(4, 5)</code> нәтижесін экранға шығар.</p>" +
        "<p class='tip'><code>function атауы(а, б) { return …; }</code> — функцияны бір рет жазасың, көп рет шақыра аласың.</p>",
      hint: "function сөзінен кейін атын және жақша ішінде екі параметр жаз. Дене ішінде return арқылы екі параметрді біріктіріп қайтар, сосын функцияны шақырып console.log-қа бер.",
      starter: "// qosu функциясын жаз\n",
      solution: "function qosu(a, b) {\n  return a + b;\n}\nconsole.log(qosu(4, 5));\n",
      par: 4,
      check: {
        output: "9", requireDef: true,
        fn: (res) => (/qosu\s*\(\s*4\s*,\s*5\s*\)/.test(res.code) ? null : "Функцияны qosu(4, 5) деп шақыруың керек."),
      },
    },
    {
      id: "4.2", title: "Сәлем функциясы",
      task: "<p><code>salem</code> функциясын жаса: ол <code>name</code> параметрін алып, <code>Сәлем, …!</code> мәтінін <b>қайтарсын</b>. Оны екі рет шақырып, экранға <code>Сәлем, Алия!</code> және <code>Сәлем, Бота!</code> шығар (әрқайсысы жаңа жолда).</p>",
      hint: "Функция мәтінді console.log емес, return арқылы қайтарсын: мәтін бөліктерін + белгісімен жалғастыр. Содан кейін функцияны екі түрлі атпен шақыр.",
      starter: "// salem функциясы\n",
      solution: 'function salem(name) {\n  return "Сәлем, " + name + "!";\n}\nconsole.log(salem("Алия"));\nconsole.log(salem("Бота"));\n',
      par: 5,
      check: {
        output: "Сәлем, Алия!\nСәлем, Бота!", requireDef: true,
        fn: (res) => ((res.code.match(/salem\s*\(/g) || []).length >= 3 ? null : "Функцияны екі рет шақыр: бір рет Алия үшін, бір рет Бота үшін."),
      },
    },

    /* ---------- 5. Массивтер ---------- */
    {
      id: "5.1", title: "Жемістер массиві",
      task: "<p><code>fruits</code> массивін жаса: <code>\"алма\"</code>, <code>\"алмұрт\"</code>. Сосын <code>push</code> арқылы <code>\"шие\"</code> қос. Массив ұзындығын (<code>fruits.length</code>) экранға шығар.</p>" +
        "<p class='tip'>Массив — қатар тұрған қораптар: <code>[\"а\", \"б\"]</code>. Оң жақта нөмірлері 0-ден басталатынын көр!</p>",
      hint: "Массивті квадрат жақшада [ … ] үтірмен бөліп жаз. Элемент қосу үшін массив.push(…), санын білу үшін массив.length бар.",
      starter: "// fruits массивін жаса\n",
      solution: 'let fruits = ["алма", "алмұрт"];\nfruits.push("шие");\nconsole.log(fruits.length);\n',
      par: 3,
      check: { output: "3", vars: { fruits: '["алма", "алмұрт", "шие"]' }, requireList: true },
    },
    {
      id: "5.2", title: "Сандар қосындысы",
      task: "<p><code>sandar</code> массивіндегі барлық сандардың қосындысын циклмен тап та, экранға шығар. Массив басқа болғанда да код жұмыс істеуі керек.</p>" +
        "<p class='tip'><code>for (const x of sandar) { … }</code> — массивтің әр элементін бір-бірден береді.</p>",
      hint: "Цикл алдында қосынды қорабы бар. for (const x of …) { … } ішінде әр x-ті соған қос, ал console.log-ты цикл біткен соң шақыр.",
      starter: "const sandar = [3, 8, 5, 2];\nlet soma = 0;\n// циклмен қос\n",
      solution: "const sandar = [3, 8, 5, 2];\nlet soma = 0;\nfor (const x of sandar) {\n  soma += x;\n}\nconsole.log(soma);\n",
      par: 6,
      check: {
        requireFor: true,
        fn(res) {
          const v = res.vars.sandar;
          if (!v || v.t !== "array") return "«sandar» массиві табылмады.";
          let want;
          try { want = JSON.parse(v.r).reduce((a, b) => a + b, 0); } catch (e) { return "«sandar» тек сандардан тұруы керек."; }
          return res.output.trim() === String(want) ? null : "Экранға қосынды (" + want + ") шығуы керек.";
        },
      },
    },

    /* ---------- 6. DOM ---------- */
    {
      id: "6.1", title: "Мәтінді ауыстыру",
      html: '<h1 id="title">Сәлем</h1>\n<p id="text">Қарапайым мәтін</p>',
      task: "<p>Оң жақта нағыз бет тұр. <code>id=\"title\"</code> тақырыбының мәтінін <b>Сәлем, JavaScript!</b> деп өзгерт.</p>" +
        "<p class='tip'><code>document.getElementById(\"title\")</code> элементті табады, <code>.textContent = \"…\"</code> оның мәтінін ауыстырады.</p>",
      hint: "Алдымен getElementById арқылы элементті тап, содан кейін оның textContent қасиетіне жаңа мәтінді = белгісімен меншіктеп жібер.",
      starter: "// тақырыптың мәтінін өзгерт\n",
      solution: 'document.getElementById("title").textContent = "Сәлем, JavaScript!";\n',
      par: 2,
      check: {
        fn(res) {
          const t = res.dom && res.dom.doc.getElementById("title");
          if (!t) return "Бетте «title» элементі жоқ.";
          return t.textContent.trim() === "Сәлем, JavaScript!" ? null : "Тақырып мәтіні «Сәлем, JavaScript!» болуы керек, қазір: «" + t.textContent.trim() + "».";
        },
      },
    },
    {
      id: "6.2", title: "Бояу",
      html: '<h1 id="title">Сәлем</h1>\n<p id="text">Қарапайым мәтін</p>',
      task: "<p><code>id=\"text\"</code> абзацын <b>қызыл</b> (<code>red</code>) түске бояп, қаріп өлшемін <code>24px</code> жаса.</p>" +
        "<p class='tip'><code>элемент.style.color = \"red\"</code>. CSS-тағы <code>font-size</code> мұнда <code>fontSize</code> болып жазылады.</p>",
      hint: "Элементті getElementById-мен тауып, қорапқа сақта. Сосын оның style қасиетінің ішінен color және fontSize-ты бөлек жолдармен өзгерт.",
      starter: "// абзацты боя\n",
      solution: 'const p = document.getElementById("text");\np.style.color = "red";\np.style.fontSize = "24px";\n',
      par: 3,
      check: {
        fn(res) {
          const p = res.dom && res.dom.doc.getElementById("text");
          if (!p) return "Бетте «text» элементі жоқ.";
          const cs = res.dom.win.getComputedStyle(p);
          const msgs = [];
          if (cs.color !== "rgb(255, 0, 0)") msgs.push("Мәтін түсі қызыл болуы керек.");
          if (cs.fontSize !== "24px") msgs.push("Қаріп өлшемі 24px болуы керек.");
          return msgs.length ? msgs.join(" ") : null;
        },
      },
    },

    /* ---------- 7. Оқиғалар ---------- */
    {
      id: "7.1", title: "Санауыш",
      html: '<button id="btn">Бас</button>\n<p>Басылды: <b id="out">0</b></p>',
      task: "<p>Батырманы басқан сайын <code>out</code> ішіндегі сан <b>1-ге артсын</b>. Бетте батырманы өзің бас: ең соңғы қадамда бет нағыз жұмыс істейді!</p>" +
        "<p class='tip'><code>батырма.addEventListener(\"click\", () => { … })</code> — «басқанда осыны істе».</p>",
      hint: "Санды сақтайтын қорап бетінен тыс (цикл ішінде емес) тұрсын. Батырмаға addEventListener қос: әр басқанда қорапты арттырып, оны out мәтініне жаз.",
      starter: "let count = 0;\n// батырманы тыңда\n",
      solution: 'let count = 0;\nconst btn = document.getElementById("btn");\nbtn.addEventListener("click", () => {\n  count++;\n  document.getElementById("out").textContent = count;\n});\n',
      par: 6,
      check: {
        fn(res) {
          const d = res.dom.doc;
          const btn = d.getElementById("btn");
          const out = d.getElementById("out");
          if (!btn || !out) return "«btn» не «out» элементі жоқ.";
          for (let i = 0; i < 3; i++) btn.click();
          return out.textContent.trim() === "3" ? null : "Батырманы 3 рет басқанда «3» шығуы керек, ал шыққаны: «" + out.textContent.trim() + "».";
        },
      },
    },
    {
      id: "7.2", title: "Түс ауыстыру",
      html: '<div id="box" style="padding:20px;border:3px solid #1f1d36">Қорап</div>\n<button id="go">Түсін ауыстыр</button>',
      task: "<p><code>go</code> батырмасын бастағанда <code>box</code> қорабының фоны <b>gold</b> болсын.</p>",
      hint: "Батырманы getElementById-мен тауып, оған addEventListener қос. Ішінде екінші элементті тауып, оның style қасиетінен фонды өзгерт.",
      starter: "// go батырмасына оқиға қос\n",
      solution: 'const go = document.getElementById("go");\ngo.addEventListener("click", () => {\n  document.getElementById("box").style.background = "gold";\n});\n',
      par: 6,
      check: {
        fn(res) {
          const d = res.dom.doc;
          const go = d.getElementById("go");
          const box = d.getElementById("box");
          if (!go || !box) return "«go» не «box» элементі жоқ.";
          const before = res.dom.win.getComputedStyle(box).backgroundColor;
          if (before === "rgb(255, 215, 0)") return "Фон батырма баспай жатып өзгеріп қойған. Түс тек басқанда өзгеруі керек.";
          go.click();
          return res.dom.win.getComputedStyle(box).backgroundColor === "rgb(255, 215, 0)" ? null : "Батырманы басқанда қорап фоны gold болуы керек.";
        },
      },
    },
  ];

  /* ---------- Қосымша ---------- */
  c.bonus = [
    {
      id: "B1", title: "Жетінің кестесі",
      task: "<p>7-нің көбейту кестесін шығар: <code>7 * 1 = 7</code>, <code>7 * 2 = 14</code> … <code>7 * 10 = 70</code>. Әр жол жаңа жолда. Мәтін мен санды <code>+</code> арқылы қос.</p>",
      hint: "Көбейткіш 1-ден 10-ға дейін өзгереді, сондықтан for циклін қолдан. Әр қадамда мәтін бөліктерін және есептелген санды + арқылы жалғап шығар.",
      starter: "// 7-нің кестесі\n",
      solution: 'for (let i = 1; i <= 10; i++) {\n  console.log("7 * " + i + " = " + 7 * i);\n}\n',
      par: 3,
      check: { output: Array.from({ length: 10 }, (_, i) => "7 * " + (i + 1) + " = " + 7 * (i + 1)).join("\n"), requireFor: true },
    },
    {
      id: "B2", title: "Ең үлкен сан",
      task: "<p><code>sandar</code> массивіндегі <b>ең үлкен</b> санды тап. <code>Math.max</code> қолдануға болмайды: өз циклің мен <code>if</code>-іңді жаз.</p>",
      hint: "Ең үлкен деп бірінші элементті алып қой. Сосын массивті айналып өтіп, if арқылы әр элементті сол қорапта тұрғанмен салыстыр да, үлкенірек болса ауыстыр.",
      starter: "const sandar = [4, 17, 9, 12];\n// ең үлкенін тап\n",
      solution: "const sandar = [4, 17, 9, 12];\nlet engi = sandar[0];\nfor (const x of sandar) {\n  if (x > engi) {\n    engi = x;\n  }\n}\nconsole.log(engi);\n",
      par: 8,
      check: {
        requireFor: true, requireIf: true,
        forbid: [{ re: /Math\.max/, msg: "Math.max қолдануға болмайды: өз циклің мен шартыңды жаз." }],
        fn(res) {
          const v = res.vars.sandar;
          if (!v || v.t !== "array") return "«sandar» массиві табылмады.";
          let want;
          try { want = Math.max(...JSON.parse(v.r)); } catch (e) { return "«sandar» тек сандардан тұруы керек."; }
          return res.output.trim() === String(want) ? null : "Экранға ең үлкен сан (" + want + ") шығуы керек.";
        },
      },
    },
    {
      id: "B3", title: "Тізімді циклмен жасау",
      html: '<ul id="list"></ul>',
      task: "<p><code>zhemis</code> массивін жаса: <code>\"алма\"</code>, <code>\"шие\"</code>, <code>\"өрік\"</code>. Цикл арқылы әрқайсысы үшін <code>li</code> элементін жасап (<code>document.createElement(\"li\")</code>), <code>list</code> ішіне қос (<code>appendChild</code>).</p>",
      hint: "Массивті жасап, for (const … of …) айнал. Әр қадамда createElement-пен li жаса, textContent-ке мәтін бер, сосын appendChild-пен list-ке қос.",
      starter: 'const list = document.getElementById("list");\n// массив және цикл\n',
      solution: 'const list = document.getElementById("list");\nconst zhemis = ["алма", "шие", "өрік"];\nfor (const f of zhemis) {\n  const li = document.createElement("li");\n  li.textContent = f;\n  list.appendChild(li);\n}\n',
      par: 8,
      check: {
        requireFor: true, requireList: true,
        fn(res) {
          const items = [...res.dom.doc.querySelectorAll("#list li")].map((e) => e.textContent.trim());
          return items.join(",") === "алма,шие,өрік" ? null : "Тізімде үш пункт болуы керек: алма, шие, өрік. Қазір: " + (items.join(", ") || "бос") + ".";
        },
      },
    },
  ];

  /* ---------- Лекциялар ---------- */
  c.lectures = [
    {
      id: "l1", topic: "1", title: "Айнымалы және console.log", minutes: 3,
      blocks: [
        { t: "p", html: "JavaScript — веб-бетті <b>тірілтетін</b> тіл. HTML бет құрылымын, CSS көркін берсе, JavaScript бетке <b>әрекет</b> береді: батырма басылады, мәтін өзгереді, ойын жүреді. Ол браузердің ішінде жұмыс істейді." },
        { t: "p", html: "Компьютер ақпаратты <b>қораптарда</b> сақтайды. Қорапты <code>let</code> деп жасаймыз:" },
        { t: "try", code: "let x = 5;\nconsole.log(x);", note: "Іске қосып, оң жақтағы «x» қорабын көр. console.log — экранға шығару." },
        { t: "p", html: "Теңдік белгісі <code>=</code> «тең» емес, «<b>сал</b>» деген мағына береді. Қорапқа жаңа мән салсаң, ескісі өшеді:" },
        { t: "try", code: "let x = 5;\nx = 9;\nconsole.log(x);" },
        { t: "h", text: "let және const" },
        { t: "list", items: ["<code>let</code> — кейін өзгертуге болатын қорап", "<code>const</code> — өзгермейтін қорап (өзгертсең, қате шығады)", "Мәтін тырнақшада: <code>\"Алия\"</code>, сан тырнақсыз: <code>5</code>"] },
        { t: "try", code: "const name = \"Алия\";\nlet age = 12;\nconsole.log(\"Сәлем, \" + name + \"! Жасың: \" + age);" },
        { t: "tip", html: "Әр жолдың соңына нүктелі үтір <code>;</code> қойған жөн. Қате шықса, қызыл жол мен түсініктеме көрсетіледі." },
      ],
    },
    {
      id: "l2", topic: "2", title: "if / else: шешім қабылдау", minutes: 3,
      blocks: [
        { t: "p", html: "Бағдарлама шартқа қарап түрлі жолмен жүре алады. Бұл — <code>if</code>:" },
        { t: "try", code: "let x = 7;\nif (x > 5) {\n  console.log(\"үлкен\");\n} else {\n  console.log(\"кіші\");\n}", note: "⏭ «Қадам» арқылы қай бұтаққа кіретінін қара: екінші бұтақ өткізіліп кетеді." },
        { t: "h", text: "Салыстыру белгілері" },
        { t: "list", items: ["<code>===</code> тең, <code>!==</code> тең емес", "<code>&lt;</code> кіші, <code>&gt;</code> үлкен, <code>&lt;=</code> және <code>&gt;=</code>", "<code>&amp;&amp;</code> «және», <code>||</code> «не», <code>!</code> «емес»", "<code>%</code> бөлгендегі қалдық: <code>7 % 2</code> = 1"] },
        { t: "warn", html: "Бір тең белгі <code>=</code> — «сал», үш тең белгі <code>===</code> — «тең бе?». Шартта әрқашан <code>===</code> жаз!" },
        { t: "try", code: "let ball = 75;\nif (ball >= 90) {\n  console.log(\"Өте жақсы\");\n} else if (ball >= 50) {\n  console.log(\"Жақсы\");\n} else {\n  console.log(\"Қайталап көр\");\n}" },
      ],
    },
    {
      id: "l3", topic: "3", title: "Циклдер: қайталау", minutes: 4,
      blocks: [
        { t: "p", html: "Компьютер қайталауға шебер. <code>for</code> циклі әрекетті бірнеше рет қайталайды:" },
        { t: "try", code: "for (let i = 1; i <= 5; i++) {\n  console.log(i);\n}", note: "Ойнатып, i қорабы қалай өскенін көр." },
        { t: "p", html: "Жақша ішінде үш бөлік: <b>бастау</b> (<code>let i = 1</code>), <b>шарт</b> (<code>i &lt;= 5</code>: қайталай бер) және <b>қадам</b> (<code>i++</code>: i-ді 1-ге арттыр)." },
        { t: "h", text: "Қосынды жинау" },
        { t: "try", code: "let s = 0;\nfor (let i = 1; i <= 10; i++) {\n  s += i;\n}\nconsole.log(s);", note: "s += i дегені s = s + i." },
        { t: "h", text: "while" },
        { t: "p", html: "Қанша қайталарын білмесең, <code>while</code> қолдан: шарт ақиқат болғанша жалғасады." },
        { t: "try", code: "let n = 1;\nwhile (n < 100) {\n  n *= 2;\n}\nconsole.log(n);" },
        { t: "warn", html: "Шарт ешқашан жалған болмаса, цикл <b>шексіз</b> жүреді. Біздің алаң 3000 қадамнан кейін тоқтатып, ескертеді." },
      ],
    },
    {
      id: "l4", topic: "4", title: "Функциялар", minutes: 4,
      blocks: [
        { t: "p", html: "Функция — аты бар шағын бағдарлама. Бір рет жазасың, қанша рет керек болса, сонша шақырасың." },
        { t: "try", code: "function qosu(a, b) {\n  return a + b;\n}\nconsole.log(qosu(4, 5));\nconsole.log(qosu(10, 20));", note: "Қадамдап жүр: функция шақырылғанда ішіндегі a және b қораптары пайда болады." },
        { t: "list", items: ["<code>a, b</code> — <b>параметрлер</b>: функция алатын мәндер", "<code>return</code> — нәтижені <b>қайтарады</b> да, функцияны аяқтайды", "<code>qosu(4, 5)</code> — функцияны <b>шақыру</b>: 4 пен 5 параметрлерге түседі"] },
        { t: "h", text: "Көрсеткі функция" },
        { t: "p", html: "Қысқа жазу жолы бар: <code>=&gt;</code>. Оны оқиғаларда жиі қолданамыз." },
        { t: "try", code: "const eki = (x) => x * 2;\nconsole.log(eki(21));" },
        { t: "tip", html: "Функцияға ұғынықты ат бер: <code>qosu</code>, <code>salem</code>. Сонда код өзі-өзін түсіндіреді." },
      ],
    },
    {
      id: "l5", topic: "5", title: "Массивтер", minutes: 3,
      blocks: [
        { t: "p", html: "Массив — қатар тұрған қораптар. Әр қорапта нөмірі (<b>индекс</b>) бар, ол <b>0-ден</b> басталады." },
        { t: "try", code: "let fruits = [\"алма\", \"алмұрт\", \"шие\"];\nconsole.log(fruits[0]);\nconsole.log(fruits.length);", note: "Оң жақта әр қорап астында нөмірі көрінеді." },
        { t: "list", items: ["<code>arr[0]</code> — бірінші элемент", "<code>arr.length</code> — ұзындығы", "<code>arr.push(x)</code> — соңына қосады", "<code>arr.pop()</code> — соңғысын алып тастайды"] },
        { t: "h", text: "Массивті айналып шығу" },
        { t: "try", code: "const sandar = [3, 8, 5];\nlet soma = 0;\nfor (const x of sandar) {\n  soma += x;\n}\nconsole.log(soma);" },
        { t: "tip", html: "<code>for (const x of массив)</code> — массивтің әр элементін x ретінде бір-бірден береді. Индекс керек емес!" },
      ],
    },
    {
      id: "l6", topic: "6", title: "DOM: бетті басқару", minutes: 4,
      blocks: [
        { t: "p", html: "Браузер HTML-ді <b>ағашқа</b> айналдырады: оны <b>DOM</b> дейді. JavaScript сол ағаштағы кез келген элементті тауып, өзгерте алады. Көп жағдайда элементті <code>id</code> арқылы табамыз." },
        { t: "try", code: "const t = document.getElementById(\"title\");\nt.textContent = \"JavaScript тірілтті!\";", note: "Іске қос: бет оң жақта өзгереді. Қадамдап жүрсең, әр қадамдағы бет көрінеді." },
        { t: "list", items: ["<code>document.getElementById(\"id\")</code> — элементті табу", "<code>.textContent = \"…\"</code> — мәтінді өзгерту", "<code>.style.color = \"red\"</code> — стильді өзгерту", "<code>document.createElement(\"li\")</code> — жаңа элемент жасау", "<code>parent.appendChild(el)</code> — оны бетке қосу"] },
        { t: "try", code: "const t = document.getElementById(\"title\");\nt.style.color = \"tomato\";\nt.style.fontSize = \"40px\";" },
        { t: "tip", html: "Еркін алаңда әрқашан <code>title</code>, <code>btn</code> және <code>out</code> деген үш элемент бар." },
      ],
    },
    {
      id: "l7", topic: "7", title: "Оқиғалар: бет жауап береді", minutes: 3,
      blocks: [
        { t: "p", html: "Оқиға — бетте болатын нәрсе: басу, жазу, меңзерді апару. Біз «осы оқиға болғанда мына функцияны орында» деп айтамыз." },
        { t: "try", code: "const btn = document.getElementById(\"btn\");\nlet count = 0;\nbtn.addEventListener(\"click\", () => {\n  count++;\n  document.getElementById(\"out\").textContent = \"Басылды: \" + count;\n});", note: "Іске қос, ең соңғы қадамға жет, сосын бетте батырманы бас!" },
        { t: "p", html: "Мұндағы жаңалық: функция <b>бірден орындалмайды</b>, ол батырма басылғанда ғана іске қосылады. Сондықтан алаңда ол кейін жұмыс істейді." },
        { t: "warn", html: "Оқиға ішіндегі қадамдар «Қадам» тізімінде көрінбейді: олар бағдарлама аяқталғаннан кейін, батырманы басқанда орындалады." },
      ],
    },
  ];

  /* ---------- Анықтамалық ---------- */
  c.reference = [
    { term: "console.log()", text: "Мәнді экранға шығарады.", code: 'console.log("Сәлем");\nconsole.log(2 + 3);' },
    { term: "Комментарий (//)", text: "// белгісінен кейінгі жазуды компьютер өткізіп жібереді. Көп жолға: /* … */", code: "// бұл түсініктеме\nconsole.log(1);" },
    { term: "let және const", text: "let — өзгертуге болатын қорап, const — өзгермейтін қорап.", code: "let x = 5;\nx = 6;\nconst pi = 3.14;\nconsole.log(x, pi);" },
    { term: "Типтер", text: "number (сан), string (мәтін), boolean (true/false), undefined, null. typeof тип атын көрсетеді.", code: 'console.log(typeof 5);\nconsole.log(typeof "сәлем");\nconsole.log(typeof true);' },
    { term: "Арифметика", text: "+ қосу, - алу, * көбейту, / бөлу, ** дәреже, % қалдық.", code: "console.log(7 + 2);\nconsole.log(7 % 2);\nconsole.log(2 ** 3);" },
    { term: "Салыстыру", text: "=== тең, !== тең емес, <, >, <=, >=. Нәтиже true не false.", code: "console.log(5 > 3);\nconsole.log(5 === 6);" },
    { term: "if / else if / else", text: "Шартқа қарай әр түрлі жолмен жүру.", code: "let x = 3;\nif (x > 5) {\n  console.log(\"үлкен\");\n} else if (x > 1) {\n  console.log(\"орташа\");\n} else {\n  console.log(\"кіші\");\n}" },
    { term: "&&, ||, !", text: "«және», «не», «емес»: шарттарды біріктіру.", code: "let a = 7;\nconsole.log(a > 5 && a < 10);\nconsole.log(a < 5 || a === 7);\nconsole.log(!(a > 5));" },
    { term: "for", text: "Белгілі рет қайталау.", code: "for (let i = 0; i < 3; i++) {\n  console.log(i);\n}" },
    { term: "while", text: "Шарт ақиқат болғанша қайталау.", code: "let n = 3;\nwhile (n > 0) {\n  console.log(n);\n  n--;\n}" },
    { term: "function", text: "Өз функцияңды жасау. return нәтиже қайтарады.", code: "function kvadrat(x) {\n  return x * x;\n}\nconsole.log(kvadrat(6));" },
    { term: "Көрсеткі функция =>", text: "Функцияның қысқа жазылуы.", code: "const eki = (x) => x * 2;\nconsole.log(eki(8));" },
    { term: "Массив, push, length", text: "Тізім: [ ]. Индекс 0-ден басталады.", code: "let a = [10, 20];\na.push(30);\nconsole.log(a[0], a.length);" },
    { term: "for … of", text: "Массивтің әр элементін айналып шығу.", code: "for (const x of [4, 5, 6]) {\n  console.log(x * 2);\n}" },
    { term: "Math", text: "Math.max, Math.min, Math.round, Math.random() — дайын математика құралдары.", code: "console.log(Math.max(3, 9, 5));\nconsole.log(Math.round(2.6));" },
    { term: "document.getElementById", text: "Бетте id арқылы элементті табады.", code: 'const t = document.getElementById("title");\nconsole.log(t.textContent);' },
    { term: "textContent, style", text: "Элемент мәтінін және стилін өзгерту.", code: 'const t = document.getElementById("title");\nt.textContent = "Жаңа мәтін";\nt.style.color = "tomato";' },
    { term: "createElement, appendChild", text: "Жаңа элемент жасап, бетке қосу.", code: 'const p = document.createElement("p");\np.textContent = "Мен жаңамын";\ndocument.body.appendChild(p);' },
    { term: "addEventListener", text: "Оқиға болғанда функцияны орындау.", code: 'document.getElementById("btn").addEventListener("click", () => {\n  document.getElementById("out").textContent = "Басылды!";\n});' },
  ];
})();
