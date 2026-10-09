/* Найди ошибку: готовый код, в котором спрятана ошибка. Ученик находит её и исправляет.
   Уровни добавляются в конец списка «дополнительно» (debug: true). */
(() => {
  const TIP_RUN = "<p class='tip'>Запусти код: сообщение об ошибке покажет, в какой строке проблема. Пройди по шагам и понаблюдай за коробками.</p>";
  const D = (o) => Object.assign({ debug: true }, o);

  const py = [
    D({
      id: "D1", title: "Незакрытая кавычка",
      task: "<p>Этот код должен вывести на экран <code>Привет, мир!</code>, но выдаёт ошибку. Найди ошибку и исправь её.</p>" + TIP_RUN,
      hint: "В начале текста кавычка есть, а в конце нет. Закрой кавычку перед скобкой.",
      starter: 'print("Привет, мир!)\n', solution: 'print("Привет, мир!")\n', par: 1, robot: null,
      check: { output: "Привет, мир!" },
    }),
    D({
      id: "D2", title: "Нет двоеточия",
      task: "<p>Код должен вывести числа <code>0, 1, 2</code> (каждое с новой строки). Исправь ошибку.</p>" + TIP_RUN,
      hint: "В конце строки с for нужно поставить двоеточие «:».",
      starter: "for i in range(3)\n    print(i)\n", solution: "for i in range(3):\n    print(i)\n", par: 2, robot: null,
      check: { output: "0\n1\n2", requireFor: true },
    }),
    D({
      id: "D3", title: "Ошибка в имени",
      task: "<p>Число из коробки <b>number</b> нужно умножить на два и вывести: <code>10</code>. Но код выдаёт ошибку.</p>" + TIP_RUN,
      hint: "Сравни имя коробки внутри print с именем коробки number: буквы совпадают?",
      starter: "number = 5\nprint(numbr * 2)\n", solution: "number = 5\nprint(number * 2)\n", par: 2, robot: null,
      check: { output: "10", vars: { number: "5" } },
    }),
    D({
      id: "D4", title: "Одного равно мало",
      task: "<p>Если <code>x</code> равен восьми, на экран должно выводиться <code>восемь</code>. Код выдаёт ошибку.</p>" + TIP_RUN,
      hint: "Для сравнения в условии нужно два знака равенства: ==. Один знак (=) присваивает значение.",
      starter: 'x = 8\nif x = 8:\n    print("восемь")\n', solution: 'x = 8\nif x == 8:\n    print("восемь")\n', par: 3, robot: null,
      check: { output: "восемь", requireIf: true },
    }),
    D({
      id: "D5", title: "Нет отступа",
      task: "<p>Цикл должен вывести числа <code>0, 2, 4</code>. Исправь ошибку.</p>" + TIP_RUN,
      hint: "Строка после for должна быть сдвинута вправо: поставь перед ней 4 пробела.",
      starter: "for i in range(3):\nprint(i * 2)\n", solution: "for i in range(3):\n    print(i * 2)\n", par: 2, robot: null,
      check: { output: "0\n2\n4", requireFor: true },
    }),
    D({
      id: "D6", title: "Строка и число",
      task: "<p>На экран должно вывестись <code>Мне лет: 12</code>. Код выдаёт ошибку, потому что строку нельзя сложить с числом.</p>" + TIP_RUN,
      hint: "Преврати число в строку: str(age).",
      starter: 'age = 12\nprint("Мне лет: " + age)\n', solution: 'age = 12\nprint("Мне лет: " + str(age))\n', par: 2, robot: null,
      check: { output: "Мне лет: 12", vars: { age: "12" } },
    }),
    D({
      id: "D7", title: "Сумма не сходится",
      task: "<p>Сумма <code>1 + 2 + 3 + 4 + 5</code> должна быть равна <code>15</code>. Код не выдаёт ошибку, но ответ неверный. Пройди по шагам и понаблюдай за коробкой <b>total</b>.</p>",
      hint: "range(1, 5) не включает последнее число (5). Увеличь границу на единицу.",
      starter: "total = 0\nfor i in range(1, 5):\n    total = total + i\nprint(total)\n",
      solution: "total = 0\nfor i in range(1, 6):\n    total = total + i\nprint(total)\n", par: 4, robot: null,
      check: { output: "15", requireFor: true },
    }),
    D({
      id: "D8", title: "Выход за пределы списка",
      task: "<p>Нужно вывести <b>последний</b> элемент списка (<code>15</code>). Код выдаёт ошибку.</p>" + TIP_RUN,
      hint: "В списке 3 элемента: номера 0, 1, 2. Номера 3 нет.",
      starter: "a = [4, 8, 15]\nprint(a[3])\n", solution: "a = [4, 8, 15]\nprint(a[2])\n", par: 2, robot: null,
      check: { output: "15", requireList: true },
    }),
    D({
      id: "D9", title: "Бесконечный цикл",
      task: "<p>Обратный отсчёт: <code>3, 2, 1</code>. Но программа не останавливается. Найди причину: меняется ли значение коробки? Пройди по шагам.</p>",
      hint: "Условие while: n > 0. Внутри цикла нужно уменьшать n: n = n - 1.",
      starter: "n = 3\nwhile n > 0:\n    print(n)\n", solution: "n = 3\nwhile n > 0:\n    print(n)\n    n = n - 1\n", par: 4, robot: null,
      check: { output: "3\n2\n1", requireWhile: true },
    }),
    D({
      id: "D10", title: "Две ошибки в одном коде",
      task: "<p>Функция должна удвоить число и вывести <code>8</code>. В коде <b>две</b> ошибки: исправишь одну, появится другая.</p>" + TIP_RUN,
      hint: "В конце строки с def нет «:». В последней строке не закрыта скобка.",
      starter: "def double(x)\n    return x * 2\nprint(double(4)\n", solution: "def double(x):\n    return x * 2\nprint(double(4))\n", par: 3, robot: null,
      check: { output: "8", requireDef: true },
    }),
    D({
      id: "D11", title: "Забыли return",
      task: "<p>Результат <code>add(2, 3)</code> должен быть <code>5</code>, но на экране выводится <code>None</code>. Возвращает ли функция ответ?</p>",
      hint: "Внутри функции результат нужно вернуть через return: return a + b.",
      starter: "def add(a, b):\n    a + b\nprint(add(2, 3))\n", solution: "def add(a, b):\n    return a + b\nprint(add(2, 3))\n", par: 3, robot: null,
      check: { output: "5", requireDef: true },
    }),
    D({
      id: "D12", title: "Условие написано наоборот",
      task: "<p>Если возраст <code>15</code>, на экран должно вывестись <code>Ребёнок</code> (младше 18 — ребёнок, иначе взрослый). Но код отвечает наоборот.</p>",
      hint: "Верен ли знак сравнения? 15 > 18 — ложь, а нам нужно «меньше»: <.",
      starter: 'age = 15\nif age > 18:\n    print("Ребёнок")\nelse:\n    print("Взрослый")\n',
      solution: 'age = 15\nif age < 18:\n    print("Ребёнок")\nelse:\n    print("Взрослый")\n', par: 5, robot: null,
      check: { output: "Ребёнок", requireIf: true },
    }),
  ];

  const js = [
    D({
      id: "D1", title: "Незакрытая скобка",
      task: "<p>На экран должно вывестись <code>Привет</code>, но код выдаёт ошибку.</p>" + TIP_RUN,
      hint: "Скобка console.log( не закрыта. Поставь ) в конце.",
      starter: 'console.log("Привет";\n', solution: 'console.log("Привет");\n', par: 1,
      check: { output: "Привет" },
    }),
    D({
      id: "D2", title: "const не меняется",
      task: "<p>Коробка <b>a</b> равнялась 1, нужно увеличить её на 1 и вывести <code>2</code>. Код выдаёт ошибку.</p>" + TIP_RUN,
      hint: "Значение коробки const менять нельзя. Для изменяемого значения используй let.",
      starter: "const a = 1;\na = a + 1;\nconsole.log(a);\n", solution: "let a = 1;\na = a + 1;\nconsole.log(a);\n", par: 3,
      check: { output: "2", vars: { a: "2" } },
    }),
    D({
      id: "D3", title: "Ошибка в имени",
      task: "<p>На экран должно вывестись <code>8</code> (коробка <b>num</b> умножается на два). Код выдаёт ошибку.</p>" + TIP_RUN,
      hint: "Проверь имя коробки внутри console.log: она создана как let num = 4;",
      starter: "let num = 4;\nconsole.log(nun * 2);\n", solution: "let num = 4;\nconsole.log(num * 2);\n", par: 2,
      check: { output: "8", vars: { num: "4" } },
    }),
    D({
      id: "D4", title: "Одного равно мало",
      task: "<p><b>x</b> равен трём, поэтому на экран должно вывестись <code>не пять</code>. Но код говорит <code>пять</code>. Где ошибка?</p>",
      hint: "В условии = присваивает значение (x теперь становится 5). Для сравнения пиши ===.",
      starter: 'let x = 3;\nif (x = 5) {\n  console.log("пять");\n} else {\n  console.log("не пять");\n}\n',
      solution: 'let x = 3;\nif (x === 5) {\n  console.log("пять");\n} else {\n  console.log("не пять");\n}\n', par: 6,
      check: { output: "не пять", requireIf: true },
    }),
    D({
      id: "D5", title: "Выход за пределы массива",
      task: "<p>Должны вывестись три числа массива: <code>1, 2, 3</code>. Но на экране появляется лишняя строка. Пройди по шагам и понаблюдай за коробкой <b>i</b>.</p>",
      hint: "Номера в массиве: 0, 1, 2. Нужно i < a.length, а не i <= a.length.",
      starter: "const a = [1, 2, 3];\nfor (let i = 0; i <= a.length; i++) {\n  console.log(a[i]);\n}\n",
      solution: "const a = [1, 2, 3];\nfor (let i = 0; i < a.length; i++) {\n  console.log(a[i]);\n}\n", par: 4,
      check: { output: "1\n2\n3", requireFor: true, requireList: true },
    }),
    D({
      id: "D6", title: "Забыли return",
      task: "<p>Результат <code>add(2, 3)</code> должен быть <code>5</code>, но на экране выводится <code>undefined</code>.</p>",
      hint: "Функция должна вернуть ответ через return.",
      starter: "function add(a, b) {\n  a + b;\n}\nconsole.log(add(2, 3));\n",
      solution: "function add(a, b) {\n  return a + b;\n}\nconsole.log(add(2, 3));\n", par: 4,
      check: { output: "5", requireDef: true },
    }),
    D({
      id: "D7", title: "Бесконечный цикл",
      task: "<p>Должны вывестись <code>0, 1, 2</code>, но программа не останавливается. Условие никак не становится ложным. Почему?</p>",
      hint: "Внутри while значение i не увеличивается. Добавь i++.",
      starter: "let i = 0;\nwhile (i < 3) {\n  console.log(i);\n}\n", solution: "let i = 0;\nwhile (i < 3) {\n  console.log(i);\n  i++;\n}\n", par: 5,
      check: { output: "0\n1\n2", requireWhile: true },
    }),
    D({
      id: "D8", title: "Элемент не найден",
      html: '<h1 id="title">Привет</h1>',
      task: "<p>Заголовок страницы должен быть <b>Привет, мир!</b>, но код выдаёт ошибку. Находится ли элемент?</p>" + TIP_RUN,
      hint: "В HTML написано id=\"title\". В коде буквы id должны быть точно такими же.",
      starter: 'document.getElementById("titel").textContent = "Привет, мир!";\n',
      solution: 'document.getElementById("title").textContent = "Привет, мир!";\n', par: 1,
      check: {
        fn(res) {
          const t = res.dom && res.dom.doc.getElementById("title");
          if (!t) return "На странице нет элемента «title».";
          return t.textContent.trim() === "Привет, мир!" ? null : "Заголовок должен быть «Привет, мир!», а сейчас: «" + t.textContent.trim() + "».";
        },
      },
    }),
  ];

  const html = [
    D({
      id: "D1", kind: "html", title: "Незакрытый тег",
      task: "<p>На странице должен быть один заголовок (<code>&lt;h1&gt;Привет&lt;/h1&gt;</code>) и один абзац. Но закрывающий тег заголовка написан неверно, поэтому появилось два заголовка. Исправь.</p>",
      hint: "В закрывающем теге есть косая черта: &lt;/h1&gt;.",
      starter: "<h1>Привет<h1>\n<p>Это абзац</p>\n", solution: "<h1>Привет</h1>\n<p>Это абзац</p>\n", par: 2,
      check: { rules: [
        { sel: "h1", count: 1, label: "Есть ровно один <h1>" },
        { sel: "h1", text: /^Привет$/, label: "Текст заголовка «Привет»" },
        { sel: "h1 p", not: true, label: "Абзац не внутри заголовка" },
        { sel: "p", count: 1, text: /абзац/, label: "Есть один абзац <p>" },
      ] },
    }),
    D({
      id: "D2", kind: "html", title: "Картинка не видна",
      task: "<p>Картинка со звездой не видна. В названии атрибута есть ошибка: найди атрибут, который указывает путь к картинке.</p>",
      hint: "Путь к картинке задаётся атрибутом src (а не scr).",
      starter: '<img scr="assets/star.svg" alt="Звезда">\n', solution: '<img src="assets/star.svg" alt="Звезда">\n', par: 1,
      check: { rules: [{ sel: "img[src]", attr: { alt: /Звезда/ }, label: "<img> с атрибутом src" }] },
    }),
    D({
      id: "D3", kind: "html", title: "Ссылка не работает",
      task: "<p>Ссылка «Википедия» никуда не ведёт при нажатии. Исправь название атрибута.</p>",
      hint: "Адрес ссылки находится в атрибуте href.",
      starter: '<a hre="https://ru.wikipedia.org">Википедия</a>\n', solution: '<a href="https://ru.wikipedia.org">Википедия</a>\n', par: 1,
      check: { rules: [{ sel: "a[href]", text: /Википедия/, label: "<a> с атрибутом href" }] },
    }),
  ];

  const css = [
    D({
      id: "D1", kind: "css", title: "Нет точки с запятой",
      html: '<p class="a">Привет</p>',
      task: "<p>Текст должен быть красным размером <code>24px</code>, но ни то ни другое не применяется. В одной строке не хватает точки с запятой.</p>",
      hint: "В конце каждого свойства нужно ставить «;»: color: red;",
      starter: ".a {\n  color: red\n  font-size: 24px;\n}\n", solution: ".a {\n  color: red;\n  font-size: 24px;\n}\n", par: 4,
      check: { rules: [{ sel: ".a", style: { color: "rgb(255, 0, 0)", fontSize: "24px" }, label: "Текст красный, 24px" }] },
    }),
    D({
      id: "D2", kind: "css", title: "Ошибка в селекторе",
      html: '<p class="note">Текст</p>',
      task: "<p>Фон абзаца с классом <code>note</code> должен быть жёлтым, но ничего не меняется.</p>",
      hint: "Перед селектором класса нужно поставить точку: .note",
      starter: "note {\n  background: yellow;\n}\n", solution: ".note {\n  background: yellow;\n}\n", par: 3,
      check: { rules: [{ sel: ".note", style: { backgroundColor: "rgb(255, 255, 0)" }, label: "Фон .note жёлтый" }] },
    }),
    D({
      id: "D3", kind: "css", title: "Ошибка в названии свойства",
      html: '<div class="box"></div>',
      task: "<p>Коробка должна быть размером <code>100px × 100px</code> и синей, но цвет не появляется. Посмотри на название свойства.</p>",
      hint: "Пишется background (а не backround).",
      starter: ".box {\n  width: 100px;\n  height: 100px;\n  backround: blue;\n}\n", solution: ".box {\n  width: 100px;\n  height: 100px;\n  background: blue;\n}\n", par: 5,
      check: { rules: [{ sel: ".box", style: { width: "100px", height: "100px", backgroundColor: "rgb(0, 0, 255)" }, label: "Коробка 100×100, синяя" }] },
    }),
    D({
      id: "D4", kind: "css", title: "Нет единицы измерения",
      html: '<div class="box"></div>',
      task: "<p>Ширина коробки должна быть <code>120px</code>, высота <code>60px</code>, но размеры не применяются.</p>",
      hint: "Допиши единицу измерения после числа: 120px.",
      starter: ".box {\n  width: 120;\n  height: 60;\n  background: orange;\n}\n", solution: ".box {\n  width: 120px;\n  height: 60px;\n  background: orange;\n}\n", par: 5,
      check: { rules: [{ sel: ".box", style: { width: "120px", height: "60px" }, label: "Коробка 120px × 60px" }] },
    }),
  ];

  const add = (id, list) => {
    const c = KZ.getCourse(id);
    if (c) c.bonus = (c.bonus || []).concat(list);
  };
  add("python", py);
  add("javascript", js);
  add("html", html);
  add("css", css);
})();
