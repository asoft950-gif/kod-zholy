/* Курс JavaScript: задания, бонус, лекции, справочник */
(() => {
  const c = KZ.getCourse("javascript");
  c.status = "ready";

  const num = (res, name) => {
    const v = res.vars[name];
    return v && v.t === "number" ? Number(v.s) : null;
  };

  c.levels = [
    /* ---------- 1. Переменные ---------- */
    {
      id: "1.1", title: "Две коробки",
      task: "<p>Положи в коробку <b>a</b> число <code>7</code>, а в коробку <b>b</b> число <code>3</code>. Выведи на экран их сумму с помощью <code>console.log</code>.</p>" +
        "<p class='tip'>Как создать коробку: <code>let a = 7;</code> — справа появится коробка «a». В конце строки ставится точка с запятой <code>;</code>.</p>",
      hint: "Создай каждую коробку через let и положи значение знаком =. Затем в console.log запиши обе коробки, соединив их знаком +.",
      starter: "// создай коробки a и b\n// выведи сумму через console.log\n",
      solution: "let a = 7;\nlet b = 3;\nconsole.log(a + b);\n",
      par: 3,
      check: { output: "10", vars: { a: "7", b: "3" } },
    },
    {
      id: "1.2", title: "Приветствие",
      task: "<p>Запиши своё имя в коробку <code>const name</code> (в кавычках). Потом выведи на экран приветствие вроде <code>Привет, Алия!</code>, только вместо Алии — твоё имя.</p>" +
        "<p class='tip'>Строки можно склеивать: <code>\"Привет, \" + name + \"!\"</code></p>",
      hint: "Сначала положи текст в коробку через const (текст в кавычках). Потом в console.log склей части текста знаком +.",
      starter: "// запиши своё имя в name\n// выведи приветствие\n",
      solution: 'const name = "Алия";\nconsole.log("Привет, " + name + "!");\n',
      par: 2,
      check: {
        fn(res) {
          const v = res.vars.name;
          if (!v) return "Коробка «name» не создана.";
          if (v.t !== "string") return "В коробке name должна лежать строка (возьми её в кавычки).";
          if (res.output.trim() !== "Привет, " + v.s + "!") return "На экран должно выводиться «Привет, " + v.s + "!».";
          return null;
        },
      },
    },

    /* ---------- 2. Условия ---------- */
    {
      id: "2.1", title: "Чётное или нечётное",
      task: "<p>Если число в коробке <code>x</code> <b>чётное</b>, выведи на экран <code>чётное</code>, а иначе — <code>нечётное</code>. Твой код должен работать правильно и при другом значении <code>x</code>.</p>" +
        "<p class='tip'><code>x % 2 === 0</code> — остаток от деления x на 2 равен 0? Три знака равенства <code>===</code> спрашивают «равно ли?».</p>",
      hint: "Используй операцию % для остатка и сравни результат с 0 через ===. Два варианта разделит конструкция if (…) { … } else { … }.",
      starter: "let x = 10;\n// напиши if / else\n",
      solution: 'let x = 10;\nif (x % 2 === 0) {\n  console.log("чётное");\n} else {\n  console.log("нечётное");\n}\n',
      par: 6,
      check: {
        requireIf: true,
        fn(res) {
          const x = num(res, "x");
          if (x === null) return "В коробке «x» должно лежать число.";
          const want = x % 2 === 0 ? "чётное" : "нечётное";
          return res.output.trim() === want ? null : "Для x = " + x + " на экран должно выводиться «" + want + "».";
        },
      },
    },
    {
      id: "2.2", title: "Оценка",
      task: "<p>В зависимости от коробки <code>score</code> выведи на экран: если <b>90 или больше</b> — <code>Отлично</code>, если <b>50 или больше</b> — <code>Хорошо</code>, иначе — <code>Попробуй ещё</code>.</p>" +
        "<p class='tip'>Условия можно выстраивать цепочкой: <code>if … else if … else …</code></p>",
      hint: "Начни с самого строгого условия: if (…) { … }, затем else if (…) { … }, в конце else { … } без условия. Для сравнения нужен знак >=.",
      starter: "let score = 75;\n// напиши условия\n",
      solution: 'let score = 75;\nif (score >= 90) {\n  console.log("Отлично");\n} else if (score >= 50) {\n  console.log("Хорошо");\n} else {\n  console.log("Попробуй ещё");\n}\n',
      par: 9,
      check: {
        requireIf: true,
        fn(res) {
          const b = num(res, "score");
          if (b === null) return "В коробке «score» должно лежать число.";
          const want = b >= 90 ? "Отлично" : b >= 50 ? "Хорошо" : "Попробуй ещё";
          return res.output.trim() === want ? null : "Для score = " + b + " на экран должно выводиться «" + want + "».";
        },
      },
    },

    /* ---------- 3. Циклы ---------- */
    {
      id: "3.1", title: "От одного до пяти",
      task: "<p>Выведи на экран числа <code>1, 2, 3, 4, 5</code>, каждое с новой строки. Используй цикл <code>for</code>.</p>" +
        "<p class='tip'><code>for (let i = 1; i &lt;= 5; i++) { … }</code> — i начинается с 1 и растёт по одному до 5.</p>",
      hint: "У цикла три части: for (let i = …; …; …). Подумай о начале, условии остановки и шаге, а в теле выведи i через console.log.",
      starter: "// напиши цикл for\n",
      solution: "for (let i = 1; i <= 5; i++) {\n  console.log(i);\n}\n",
      par: 3,
      check: { output: "1\n2\n3\n4\n5", requireFor: true },
    },
    {
      id: "3.2", title: "Сумма",
      task: "<p>Найди сумму чисел от 1 до 10: собери её в коробке <code>s</code> и в конце выведи на экран (должно получиться 55). Смотри, как на каждом шаге цикла растёт коробка <b>s</b> справа!</p>",
      hint: "Внутри цикла добавляй каждое значение i в коробку s (поможет знак +=). console.log напиши после цикла, снаружи.",
      starter: "let s = 0;\n// складывай в цикле\n",
      solution: "let s = 0;\nfor (let i = 1; i <= 10; i++) {\n  s += i;\n}\nconsole.log(s);\n",
      par: 5,
      check: { output: "55", vars: { s: "55" }, requireFor: true },
    },
    {
      id: "3.3", title: "Удвоение",
      task: "<p>Пусть <code>n = 1</code>. Пока <code>n</code> меньше 100, умножай его на 2 (<code>while</code>). В конце выведи n на экран.</p>" +
        "<p class='tip'><code>while (условие) { … }</code> повторяет, пока условие истинно. <code>n *= 2</code> — удвоить n.</p>",
      hint: "В while (…) { … } запиши условие про n: пока оно истинно, увеличивай n. console.log вызови только после окончания цикла.",
      starter: "let n = 1;\n// напиши цикл while\n",
      solution: "let n = 1;\nwhile (n < 100) {\n  n *= 2;\n}\nconsole.log(n);\n",
      par: 5,
      check: { output: "128", vars: { n: "128" }, requireWhile: true },
    },

    /* ---------- 4. Функции ---------- */
    {
      id: "4.1", title: "Функция сложения",
      task: "<p>Создай функцию <code>add</code>: она берёт два числа и возвращает их сумму через <code>return</code>. Потом выведи на экран результат <code>add(4, 5)</code>.</p>" +
        "<p class='tip'><code>function имя(а, б) { return …; }</code> — функцию пишешь один раз, а вызывать можно сколько угодно.</p>",
      hint: "После слова function напиши имя и два параметра в скобках. В теле верни через return результат действия над ними, затем вызови функцию внутри console.log.",
      starter: "// напиши функцию add\n",
      solution: "function add(a, b) {\n  return a + b;\n}\nconsole.log(add(4, 5));\n",
      par: 4,
      check: {
        output: "9", requireDef: true,
        fn: (res) => (/add\s*\(\s*4\s*,\s*5\s*\)/.test(res.code) ? null : "Нужно вызвать функцию так: add(4, 5)."),
      },
    },
    {
      id: "4.2", title: "Функция приветствия",
      task: "<p>Создай функцию <code>greet</code>: она берёт параметр <code>name</code> и <b>возвращает</b> строку <code>Привет, …!</code>. Вызови её два раза и выведи на экран <code>Привет, Алия!</code> и <code>Привет, Бота!</code> (каждое с новой строки).</p>",
      hint: "Функция должна вернуть текст через return, а не печатать его: склей части текста знаком +. Потом вызови функцию с двумя разными именами.",
      starter: "// функция greet\n",
      solution: 'function greet(name) {\n  return "Привет, " + name + "!";\n}\nconsole.log(greet("Алия"));\nconsole.log(greet("Бота"));\n',
      par: 5,
      check: {
        output: "Привет, Алия!\nПривет, Бота!", requireDef: true,
        fn: (res) => ((res.code.match(/greet\s*\(/g) || []).length >= 3 ? null : "Вызови функцию два раза: один раз для Алии, один раз для Боты."),
      },
    },

    /* ---------- 5. Массивы ---------- */
    {
      id: "5.1", title: "Массив фруктов",
      task: "<p>Создай массив <code>fruits</code>: <code>\"яблоко\"</code>, <code>\"груша\"</code>. Потом добавь через <code>push</code> элемент <code>\"вишня\"</code>. Выведи на экран длину массива (<code>fruits.length</code>).</p>" +
        "<p class='tip'>Массив — это коробки в один ряд: <code>[\"а\", \"б\"]</code>. Посмотри справа: номера начинаются с 0!</p>",
      hint: "Массив пишется в квадратных скобках [ … ] через запятую. Добавить элемент можно через массив.push(…), а количество узнать через массив.length.",
      starter: "// создай массив fruits\n",
      solution: 'let fruits = ["яблоко", "груша"];\nfruits.push("вишня");\nconsole.log(fruits.length);\n',
      par: 3,
      check: { output: "3", vars: { fruits: '["яблоко", "груша", "вишня"]' }, requireList: true },
    },
    {
      id: "5.2", title: "Сумма чисел",
      task: "<p>Найди в цикле сумму всех чисел массива <code>numbers</code> и выведи её на экран. Код должен работать и с другим массивом.</p>" +
        "<p class='tip'><code>for (const x of numbers) { … }</code> — по очереди отдаёт каждый элемент массива.</p>",
      hint: "Коробка для суммы уже есть до цикла. Внутри for (const x of …) { … } прибавляй к ней каждый x, а console.log вызови после цикла.",
      starter: "const numbers = [3, 8, 5, 2];\nlet total = 0;\n// складывай в цикле\n",
      solution: "const numbers = [3, 8, 5, 2];\nlet total = 0;\nfor (const x of numbers) {\n  total += x;\n}\nconsole.log(total);\n",
      par: 6,
      check: {
        requireFor: true,
        fn(res) {
          const v = res.vars.numbers;
          if (!v || v.t !== "array") return "Массив «numbers» не найден.";
          let want;
          try { want = JSON.parse(v.r).reduce((a, b) => a + b, 0); } catch (e) { return "В «numbers» должны быть только числа."; }
          return res.output.trim() === String(want) ? null : "На экран должна выводиться сумма (" + want + ").";
        },
      },
    },

    /* ---------- 6. DOM ---------- */
    {
      id: "6.1", title: "Замена текста",
      html: '<h1 id="title">Привет</h1>\n<p id="text">Обычный текст</p>',
      task: "<p>Справа настоящая страница. Измени текст заголовка с <code>id=\"title\"</code> на <b>Привет, JavaScript!</b></p>" +
        "<p class='tip'><code>document.getElementById(\"title\")</code> находит элемент, а <code>.textContent = \"…\"</code> заменяет его текст.</p>",
      hint: "Сначала найди элемент через getElementById, затем присвой его свойству textContent новый текст знаком =.",
      starter: "// измени текст заголовка\n",
      solution: 'document.getElementById("title").textContent = "Привет, JavaScript!";\n',
      par: 2,
      check: {
        fn(res) {
          const t = res.dom && res.dom.doc.getElementById("title");
          if (!t) return "На странице нет элемента «title».";
          return t.textContent.trim() === "Привет, JavaScript!" ? null : "Текст заголовка должен быть «Привет, JavaScript!», а сейчас: «" + t.textContent.trim() + "».";
        },
      },
    },
    {
      id: "6.2", title: "Покраска",
      html: '<h1 id="title">Привет</h1>\n<p id="text">Обычный текст</p>',
      task: "<p>Покрась абзац с <code>id=\"text\"</code> в <b>красный</b> цвет (<code>red</code>) и сделай размер шрифта <code>24px</code>.</p>" +
        "<p class='tip'><code>элемент.style.color = \"red\"</code>. Свойство <code>font-size</code> из CSS здесь пишется как <code>fontSize</code>.</p>",
      hint: "Найди элемент через getElementById и сохрани в коробку. Затем у его свойства style измени color и fontSize отдельными строками.",
      starter: "// покрась абзац\n",
      solution: 'const p = document.getElementById("text");\np.style.color = "red";\np.style.fontSize = "24px";\n',
      par: 3,
      check: {
        fn(res) {
          const p = res.dom && res.dom.doc.getElementById("text");
          if (!p) return "На странице нет элемента «text».";
          const cs = res.dom.win.getComputedStyle(p);
          const msgs = [];
          if (cs.color !== "rgb(255, 0, 0)") msgs.push("Цвет текста должен быть красным.");
          if (cs.fontSize !== "24px") msgs.push("Размер шрифта должен быть 24px.");
          return msgs.length ? msgs.join(" ") : null;
        },
      },
    },

    /* ---------- 7. События ---------- */
    {
      id: "7.1", title: "Счётчик",
      html: '<button id="btn">Нажми</button>\n<p>Нажато: <b id="out">0</b></p>',
      task: "<p>Пусть при каждом нажатии на кнопку число в <code>out</code> <b>увеличивается на 1</b>. Нажми на кнопку на странице сам: на последнем шаге страница работает по-настоящему!</p>" +
        "<p class='tip'><code>кнопка.addEventListener(\"click\", () => { … })</code> — «когда нажмут, сделай вот это».</p>",
      hint: "Коробка со счётом должна быть вне обработчика. Повесь на кнопку addEventListener: при каждом нажатии увеличивай коробку и записывай её в текст out.",
      starter: "let count = 0;\n// слушай кнопку\n",
      solution: 'let count = 0;\nconst btn = document.getElementById("btn");\nbtn.addEventListener("click", () => {\n  count++;\n  document.getElementById("out").textContent = count;\n});\n',
      par: 6,
      check: {
        fn(res) {
          const d = res.dom.doc;
          const btn = d.getElementById("btn");
          const out = d.getElementById("out");
          if (!btn || !out) return "Нет элемента «btn» или «out».";
          for (let i = 0; i < 3; i++) btn.click();
          return out.textContent.trim() === "3" ? null : "После трёх нажатий на кнопку должно быть «3», а получилось: «" + out.textContent.trim() + "».";
        },
      },
    },
    {
      id: "7.2", title: "Смена цвета",
      html: '<div id="box" style="padding:20px;border:3px solid #1f1d36">Коробка</div>\n<button id="go">Поменять цвет</button>',
      task: "<p>Пусть после нажатия на кнопку <code>go</code> фон коробки <code>box</code> становится <b>gold</b>.</p>",
      hint: "Найди кнопку через getElementById и добавь ей addEventListener. Внутри найди второй элемент и поменяй фон в его свойстве style.",
      starter: "// добавь событие кнопке go\n",
      solution: 'const go = document.getElementById("go");\ngo.addEventListener("click", () => {\n  document.getElementById("box").style.background = "gold";\n});\n',
      par: 6,
      check: {
        fn(res) {
          const d = res.dom.doc;
          const go = d.getElementById("go");
          const box = d.getElementById("box");
          if (!go || !box) return "Нет элемента «go» или «box».";
          const before = res.dom.win.getComputedStyle(box).backgroundColor;
          if (before === "rgb(255, 215, 0)") return "Фон изменился ещё до нажатия на кнопку. Цвет должен меняться только после нажатия.";
          go.click();
          return res.dom.win.getComputedStyle(box).backgroundColor === "rgb(255, 215, 0)" ? null : "После нажатия на кнопку фон коробки должен стать gold.";
        },
      },
    },
  ];

  /* ---------- Бонус ---------- */
  c.bonus = [
    {
      id: "B1", title: "Таблица на семь",
      task: "<p>Выведи таблицу умножения на 7: <code>7 * 1 = 7</code>, <code>7 * 2 = 14</code> … <code>7 * 10 = 70</code>. Каждая строка — с новой строки. Склеивай текст и число через <code>+</code>.</p>",
      hint: "Множитель меняется от 1 до 10, поэтому используй цикл for. На каждом шаге склей части строки и вычисленное число через + и выведи.",
      starter: "// таблица на 7\n",
      solution: 'for (let i = 1; i <= 10; i++) {\n  console.log("7 * " + i + " = " + 7 * i);\n}\n',
      par: 3,
      check: { output: Array.from({ length: 10 }, (_, i) => "7 * " + (i + 1) + " = " + 7 * (i + 1)).join("\n"), requireFor: true },
    },
    {
      id: "B2", title: "Самое большое число",
      task: "<p>Найди в массиве <code>numbers</code> <b>самое большое</b> число. Использовать <code>Math.max</code> нельзя: напиши свой цикл и свой <code>if</code>.</p>",
      hint: "Сначала возьми первый элемент как наибольший. Затем пройди по массиву и с помощью if сравнивай каждый элемент с запомненным, заменяя его, если он больше.",
      starter: "const numbers = [4, 17, 9, 12];\n// найди самое большое\n",
      solution: "const numbers = [4, 17, 9, 12];\nlet biggest = numbers[0];\nfor (const x of numbers) {\n  if (x > biggest) {\n    biggest = x;\n  }\n}\nconsole.log(biggest);\n",
      par: 8,
      check: {
        requireFor: true, requireIf: true,
        forbid: [{ re: /Math\.max/, msg: "Math.max использовать нельзя: напиши свой цикл и своё условие." }],
        fn(res) {
          const v = res.vars.numbers;
          if (!v || v.t !== "array") return "Массив «numbers» не найден.";
          let want;
          try { want = Math.max(...JSON.parse(v.r)); } catch (e) { return "В «numbers» должны быть только числа."; }
          return res.output.trim() === String(want) ? null : "На экран должно выводиться самое большое число (" + want + ").";
        },
      },
    },
    {
      id: "B3", title: "Список в цикле",
      html: '<ul id="list"></ul>',
      task: "<p>Создай массив <code>fruits</code>: <code>\"яблоко\"</code>, <code>\"вишня\"</code>, <code>\"абрикос\"</code>. В цикле для каждого элемента создай <code>li</code> (<code>document.createElement(\"li\")</code>) и добавь его внутрь <code>list</code> (<code>appendChild</code>).</p>",
      hint: "Создай массив и пройди его через for (const … of …). На каждом шаге сделай li через createElement, задай textContent и добавь в list через appendChild.",
      starter: 'const list = document.getElementById("list");\n// массив и цикл\n',
      solution: 'const list = document.getElementById("list");\nconst fruits = ["яблоко", "вишня", "абрикос"];\nfor (const f of fruits) {\n  const li = document.createElement("li");\n  li.textContent = f;\n  list.appendChild(li);\n}\n',
      par: 8,
      check: {
        requireFor: true, requireList: true,
        fn(res) {
          const items = [...res.dom.doc.querySelectorAll("#list li")].map((e) => e.textContent.trim());
          return items.join(",") === "яблоко,вишня,абрикос" ? null : "В списке должно быть три пункта: яблоко, вишня, абрикос. Сейчас: " + (items.join(", ") || "пусто") + ".";
        },
      },
    },
  ];

  /* ---------- Лекции ---------- */
  c.lectures = [
    {
      id: "l1", topic: "1", title: "Переменная и console.log", minutes: 3,
      blocks: [
        { t: "p", html: "JavaScript — язык, который <b>оживляет</b> веб-страницы. HTML задаёт структуру страницы, CSS — красоту, а JavaScript добавляет <b>действия</b>: кнопка нажимается, текст меняется, игра идёт. Он работает прямо в браузере." },
        { t: "p", html: "Компьютер хранит информацию в <b>коробках</b> (переменных). Коробку создают словом <code>let</code>:" },
        { t: "try", code: "let x = 5;\nconsole.log(x);", note: "Запусти и посмотри на коробку «x» справа. console.log выводит значение на экран." },
        { t: "p", html: "Знак равенства <code>=</code> означает не «равно», а «<b>положи</b>». Если положить в коробку новое значение, старое исчезнет:" },
        { t: "try", code: "let x = 5;\nx = 9;\nconsole.log(x);" },
        { t: "h", text: "let и const" },
        { t: "list", items: ["<code>let</code> — коробка, которую можно потом менять", "<code>const</code> — коробка, которая не меняется (попробуешь изменить — будет ошибка)", "Текст пишут в кавычках: <code>\"Алия\"</code>, а число — без кавычек: <code>5</code>"] },
        { t: "try", code: "const name = \"Алия\";\nlet age = 12;\nconsole.log(\"Привет, \" + name + \"! Тебе лет: \" + age);" },
        { t: "tip", html: "В конце каждой строки лучше ставить точку с запятой <code>;</code>. Если случится ошибка, покажутся красная строка и объяснение." },
      ],
    },
    {
      id: "l2", topic: "2", title: "if / else: принимаем решение", minutes: 3,
      blocks: [
        { t: "p", html: "Программа может идти разными путями в зависимости от условия. Это <code>if</code>:" },
        { t: "try", code: "let x = 7;\nif (x > 5) {\n  console.log(\"большое\");\n} else {\n  console.log(\"маленькое\");\n}", note: "⏭ Нажимай «Шаг» и смотри, в какую ветку заходит программа: вторая ветка пропускается." },
        { t: "h", text: "Знаки сравнения" },
        { t: "list", items: ["<code>===</code> равно, <code>!==</code> не равно", "<code>&lt;</code> меньше, <code>&gt;</code> больше, <code>&lt;=</code> и <code>&gt;=</code>", "<code>&amp;&amp;</code> «и», <code>||</code> «или», <code>!</code> «не»", "<code>%</code> остаток от деления: <code>7 % 2</code> = 1"] },
        { t: "warn", html: "Один знак равенства <code>=</code> — «положи», три знака <code>===</code> — «равно ли?». В условии всегда пиши <code>===</code>!" },
        { t: "try", code: "let score = 75;\nif (score >= 90) {\n  console.log(\"Отлично\");\n} else if (score >= 50) {\n  console.log(\"Хорошо\");\n} else {\n  console.log(\"Попробуй ещё\");\n}" },
      ],
    },
    {
      id: "l3", topic: "3", title: "Циклы: повторяем", minutes: 4,
      blocks: [
        { t: "p", html: "Компьютер отлично умеет повторять. Цикл <code>for</code> повторяет действие несколько раз:" },
        { t: "try", code: "for (let i = 1; i <= 5; i++) {\n  console.log(i);\n}", note: "Запусти и посмотри, как растёт коробка i." },
        { t: "p", html: "В скобках три части: <b>начало</b> (<code>let i = 1</code>), <b>условие</b> (<code>i &lt;= 5</code>: продолжай повторять) и <b>шаг</b> (<code>i++</code>: увеличь i на 1)." },
        { t: "h", text: "Собираем сумму" },
        { t: "try", code: "let s = 0;\nfor (let i = 1; i <= 10; i++) {\n  s += i;\n}\nconsole.log(s);", note: "s += i означает s = s + i." },
        { t: "h", text: "while" },
        { t: "p", html: "Если не знаешь, сколько раз повторять, используй <code>while</code>: он продолжает, пока условие истинно." },
        { t: "try", code: "let n = 1;\nwhile (n < 100) {\n  n *= 2;\n}\nconsole.log(n);" },
        { t: "warn", html: "Если условие никогда не станет ложным, цикл будет идти <b>бесконечно</b>. Наша площадка остановит его после 3000 шагов и предупредит тебя." },
      ],
    },
    {
      id: "l4", topic: "4", title: "Функции", minutes: 4,
      blocks: [
        { t: "p", html: "Функция — маленькая программа с именем. Её пишешь один раз, а вызываешь сколько угодно раз." },
        { t: "try", code: "function add(a, b) {\n  return a + b;\n}\nconsole.log(add(4, 5));\nconsole.log(add(10, 20));", note: "Иди по шагам: когда вызывается функция, внутри неё появляются коробки a и b." },
        { t: "list", items: ["<code>a, b</code> — <b>параметры</b>: значения, которые берёт функция", "<code>return</code> — <b>возвращает</b> результат и завершает функцию", "<code>add(4, 5)</code> — <b>вызов</b> функции: 4 и 5 попадают в параметры"] },
        { t: "h", text: "Стрелочная функция" },
        { t: "p", html: "Есть короткая запись: <code>=&gt;</code>. Мы часто используем её в событиях." },
        { t: "try", code: "const twice = (x) => x * 2;\nconsole.log(twice(21));" },
        { t: "tip", html: "Давай функции понятные имена: <code>add</code>, <code>greet</code>. Тогда код сам себя объясняет." },
      ],
    },
    {
      id: "l5", topic: "5", title: "Массивы", minutes: 3,
      blocks: [
        { t: "p", html: "Массив — это коробки в один ряд. У каждой коробки есть номер (<b>индекс</b>), и он начинается <b>с нуля</b>." },
        { t: "try", code: "let fruits = [\"яблоко\", \"груша\", \"вишня\"];\nconsole.log(fruits[0]);\nconsole.log(fruits.length);", note: "Справа под каждой коробкой виден её номер." },
        { t: "list", items: ["<code>arr[0]</code> — первый элемент", "<code>arr.length</code> — длина", "<code>arr.push(x)</code> — добавляет в конец", "<code>arr.pop()</code> — убирает последний"] },
        { t: "h", text: "Обходим массив" },
        { t: "try", code: "const numbers = [3, 8, 5];\nlet total = 0;\nfor (const x of numbers) {\n  total += x;\n}\nconsole.log(total);" },
        { t: "tip", html: "<code>for (const x of массив)</code> по очереди отдаёт каждый элемент массива как x. Индекс не нужен!" },
      ],
    },
    {
      id: "l6", topic: "6", title: "DOM: управляем страницей", minutes: 4,
      blocks: [
        { t: "p", html: "Браузер превращает HTML в <b>дерево</b>: оно называется <b>DOM</b>. JavaScript может найти в этом дереве любой элемент и изменить его. Чаще всего элемент ищут по <code>id</code>." },
        { t: "try", code: "const t = document.getElementById(\"title\");\nt.textContent = \"JavaScript оживил страницу!\";", note: "Запусти: страница справа изменится. Если пойдёшь по шагам, увидишь страницу на каждом шаге." },
        { t: "list", items: ["<code>document.getElementById(\"id\")</code> — найти элемент", "<code>.textContent = \"…\"</code> — изменить текст", "<code>.style.color = \"red\"</code> — изменить стиль", "<code>document.createElement(\"li\")</code> — создать новый элемент", "<code>parent.appendChild(el)</code> — добавить его на страницу"] },
        { t: "try", code: "const t = document.getElementById(\"title\");\nt.style.color = \"tomato\";\nt.style.fontSize = \"40px\";" },
        { t: "tip", html: "На свободной площадке всегда есть три элемента: <code>title</code>, <code>btn</code> и <code>out</code>." },
      ],
    },
    {
      id: "l7", topic: "7", title: "События: страница отвечает", minutes: 3,
      blocks: [
        { t: "p", html: "Событие — это то, что происходит на странице: нажатие, ввод текста, наведение курсора. Мы говорим: «когда случится это событие, выполни вот эту функцию»." },
        { t: "try", code: "const btn = document.getElementById(\"btn\");\nlet count = 0;\nbtn.addEventListener(\"click\", () => {\n  count++;\n  document.getElementById(\"out\").textContent = \"Нажато: \" + count;\n});", note: "Запусти, дойди до самого последнего шага, а потом нажми на кнопку на странице!" },
        { t: "p", html: "Новое здесь вот что: функция <b>не выполняется сразу</b>, она запускается только тогда, когда нажмут на кнопку. Поэтому на площадке она сработает позже." },
        { t: "warn", html: "Шаги внутри события не видны в списке «Шаг»: они выполняются уже после конца программы, когда нажимаешь на кнопку." },
      ],
    },
  ];

  /* ---------- Справочник ---------- */
  c.reference = [
    { term: "console.log()", text: "Выводит значение на экран.", code: 'console.log("Привет");\nconsole.log(2 + 3);' },
    { term: "Комментарий (//)", text: "Всё, что написано после //, компьютер пропускает. Для нескольких строк: /* … */", code: "// это комментарий\nconsole.log(1);" },
    { term: "let и const", text: "let — коробка, которую можно менять, const — коробка, которая не меняется.", code: "let x = 5;\nx = 6;\nconst pi = 3.14;\nconsole.log(x, pi);" },
    { term: "Типы", text: "number (число), string (строка), boolean (true/false), undefined, null. typeof показывает название типа.", code: 'console.log(typeof 5);\nconsole.log(typeof "привет");\nconsole.log(typeof true);' },
    { term: "Арифметика", text: "+ сложение, - вычитание, * умножение, / деление, ** степень, % остаток.", code: "console.log(7 + 2);\nconsole.log(7 % 2);\nconsole.log(2 ** 3);" },
    { term: "Сравнение", text: "=== равно, !== не равно, <, >, <=, >=. Результат — true или false.", code: "console.log(5 > 3);\nconsole.log(5 === 6);" },
    { term: "if / else if / else", text: "Идти разными путями в зависимости от условия.", code: "let x = 3;\nif (x > 5) {\n  console.log(\"большое\");\n} else if (x > 1) {\n  console.log(\"среднее\");\n} else {\n  console.log(\"маленькое\");\n}" },
    { term: "&&, ||, !", text: "«и», «или», «не»: объединение условий.", code: "let a = 7;\nconsole.log(a > 5 && a < 10);\nconsole.log(a < 5 || a === 7);\nconsole.log(!(a > 5));" },
    { term: "for", text: "Повторение известное число раз.", code: "for (let i = 0; i < 3; i++) {\n  console.log(i);\n}" },
    { term: "while", text: "Повторение, пока условие истинно.", code: "let n = 3;\nwhile (n > 0) {\n  console.log(n);\n  n--;\n}" },
    { term: "function", text: "Создание своей функции. return возвращает результат.", code: "function square(x) {\n  return x * x;\n}\nconsole.log(square(6));" },
    { term: "Стрелочная функция =>", text: "Короткая запись функции.", code: "const twice = (x) => x * 2;\nconsole.log(twice(8));" },
    { term: "Массив, push, length", text: "Список: [ ]. Индекс начинается с 0.", code: "let a = [10, 20];\na.push(30);\nconsole.log(a[0], a.length);" },
    { term: "for … of", text: "Обход каждого элемента массива.", code: "for (const x of [4, 5, 6]) {\n  console.log(x * 2);\n}" },
    { term: "Math", text: "Math.max, Math.min, Math.round, Math.random() — готовые математические инструменты.", code: "console.log(Math.max(3, 9, 5));\nconsole.log(Math.round(2.6));" },
    { term: "document.getElementById", text: "Находит на странице элемент по id.", code: 'const t = document.getElementById("title");\nconsole.log(t.textContent);' },
    { term: "textContent, style", text: "Изменение текста и стиля элемента.", code: 'const t = document.getElementById("title");\nt.textContent = "Новый текст";\nt.style.color = "tomato";' },
    { term: "createElement, appendChild", text: "Создать новый элемент и добавить его на страницу.", code: 'const p = document.createElement("p");\np.textContent = "Я новенький";\ndocument.body.appendChild(p);' },
    { term: "addEventListener", text: "Выполнить функцию, когда случится событие.", code: 'document.getElementById("btn").addEventListener("click", () => {\n  document.getElementById("out").textContent = "Нажато!";\n});' },
  ];
})();
