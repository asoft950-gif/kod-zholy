/* Курс Python: основные данные и задания */
KZ.registerCourse({
  id: "python",
  name: "Python",
  emoji: "🐍",
  color: "#6c5ce7",
  status: "ready",
  engine: "python",
  tagline: "Учись наглядно: с роботом и коробками",
  commands: [
  { code: "vpered()", help: "вперёд на 1 шаг (vpered(3) — 3 шага)" },
  { code: "napravo()", help: "повернуть направо" },
  { code: "nalevo()", help: "повернуть налево" },
  { code: "sobrat()", help: "собрать звезду, на которой стоишь" },
],
  topics: [
    { id: "1", emoji: "📦", title: "Переменные", blurb: "Коробки, в которых хранятся числа и текст" },
    { id: "2", emoji: "🤖", title: "Команды робота", blurb: "Команды выполняются по одной" },
    { id: "3", emoji: "🔁", title: "Цикл for", blurb: "Поручи повторение компьютеру" },
    { id: "4", emoji: "❓", title: "if / else", blurb: "Принимаем решение по условию" },
    { id: "5", emoji: "♾️", title: "Цикл while", blurb: "Когда не знаешь, сколько повторять" },
    { id: "6", emoji: "🧩", title: "Функции", blurb: "Создай свою команду" },
    { id: "7", emoji: "📚", title: "Списки", blurb: "Коробки, стоящие в ряд" },
  ],
  levels: [
  /* ---------- 1. Переменные ---------- */
  {
    id: "1.1",
    topic: "1 · Айнымалылар: сан сақтайтын қораптар",
    title: "Две коробки",
    task:
      "<p>Положи в коробку <b>a</b> число <code>7</code>, а в коробку <b>b</b> число <code>3</code>. " +
      "Потом выведи на экран их сумму с помощью <code>print</code>.</p>" +
      "<p class='tip'>Как создать коробку: <code>a = 7</code> — справа появится коробка «a».</p>",
    hint: "Сначала напиши a = 7 и b = 3. Потом напиши print(a + b). Смотри на коробки справа: числа попадают туда.",
    starter: "# создай коробки a и b\n# выведи сумму через print\n",
    solution: "a = 7\nb = 3\nprint(a + b)\n",
    par: 3,
    robot: null,
    check: { output: "10", vars: { a: "7", b: "3" } },
  },
  {
    id: "1.2",
    topic: "1 · Айнымалылар: сан сақтайтын қораптар",
    title: "Приветствие",
    task:
      "<p>Запиши в коробку <b>name</b> своё имя (в кавычках: <code>\"Алия\"</code>). " +
      "Потом выведи на экран приветствие вроде <code>Привет, Алия!</code>. Вместо Алии должно стоять твоё имя.</p>" +
      "<p class='tip'>Строки можно складывать: <code>\"Привет, \" + name + \"!\"</code></p>",
    hint: "Напиши name = \"Алия\", потом print(\"Привет, \" + name + \"!\"). Не забудь пробел после запятой.",
    starter: "# запиши своё имя в коробку name\n# выведи приветствие через print\n",
    solution: 'name = "Алия"\nprint("Привет, " + name + "!")\n',
    par: 2,
    robot: null,
    check: {
      fn(res) {
        const v = res.vars.name;
        if (!v) return "Коробка «name» не создана.";
        if (v.t !== "str") return "В коробке name должна лежать строка (возьми её в кавычки).";
        const want = "Привет, " + v.s + "!";
        if (res.output.trim() !== want) {
          return "На экране должно быть «" + want + "», а сейчас: «" + res.output.trim() + "»";
        }
        return null;
      },
    },
  },

  /* ---------- 2. Команды робота ---------- */
  {
    id: "2.1",
    topic: "2 · Робот: командалар бір-бірден орындалады",
    title: "Первый шаг",
    task:
      "<p>Робот 🤖 должен дойти до звезды ⭐ и собрать её. Треугольник на роботе " +
      "показывает, куда он смотрит.</p>",
    hint: "vpered(4) — робот идёт вперёд на 4 шага. Когда дойдёшь до звезды, напиши sobrat().",
    starter: "# приведи робота к звезде\n",
    solution: "vpered(4)\nsobrat()\n",
    par: 2,
    robot: { cols: 5, rows: 3, start: { x: 0, y: 1, d: 1 }, stars: [[4, 1]] },
    check: { collectAll: true },
  },
  {
    id: "2.2",
    topic: "2 · Робот: командалар бір-бірден орындалады",
    title: "Поворот",
    task:
      "<p>Звезда стоит в углу. Роботу нужно пройти вправо, а потом повернуть вниз.</p>" +
      "<p class='tip'><code>napravo()</code> — робот поворачивает направо: если он смотрит вправо, то станет смотреть вниз.</p>",
    hint: "Сначала vpered(3), потом napravo(), потом ещё vpered(3). В самом конце sobrat().",
    starter: "# приведи робота к звезде с поворотом\n",
    solution: "vpered(3)\nnapravo()\nvpered(3)\nsobrat()\n",
    par: 4,
    robot: { cols: 5, rows: 5, start: { x: 0, y: 0, d: 1 }, stars: [[3, 3]] },
    check: { collectAll: true },
  },
  {
    id: "2.3",
    topic: "2 · Робот: командалар бір-бірден орындалады",
    title: "Две звезды",
    task:
      "<p>Собери обе звезды. Не забывай писать <code>sobrat()</code> у каждой звезды.</p>",
    hint: "vpered(3), sobrat(), napravo(), vpered(2), sobrat() — попробуй написать в таком порядке.",
    starter: "# собери обе звезды\n",
    solution: "vpered(3)\nsobrat()\nnapravo()\nvpered(2)\nsobrat()\n",
    par: 5,
    robot: { cols: 6, rows: 4, start: { x: 0, y: 0, d: 1 }, stars: [[3, 0], [3, 2]] },
    check: { collectAll: true },
  },

  /* ---------- 3. Цикл for ---------- */
  {
    id: "3.1",
    topic: "3 · for циклі: қайталауды компьютерге тапсыр",
    title: "Звёзды на дорожке",
    task:
      "<p>На дорожке стоят 6 звёзд. Не пиши <code>vpered()</code> и <code>sobrat()</code> вручную 6 раз, " +
      "а используй цикл <code>for</code>.</p>" +
      "<p class='tip'><code>for i in range(6):</code> — повторяет строки с отступом ниже 6 раз. " +
      "Отступ — 4 пробела. Смотри на коробку «i» справа: на каждом витке она меняется.</p>",
    hint: "Напиши for i in range(6): и в следующих строках с отступом в 4 пробела напиши vpered() и sobrat().",
    starter: "# собери все звёзды циклом for\n",
    solution: "for i in range(6):\n    vpered()\n    sobrat()\n",
    par: 3,
    robot: {
      cols: 7, rows: 3, start: { x: 0, y: 1, d: 1 },
      stars: [[1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1]],
    },
    check: { collectAll: true, requireFor: true },
  },
  {
    id: "3.2",
    topic: "3 · for циклі: қайталауды компьютерге тапсыр",
    title: "Квадрат",
    task:
      "<p>Звёзды стоят в четырёх углах квадрата. Пусть робот пройдёт по квадрату и соберёт все четыре.</p>" +
      "<p class='tip'>Одна сторона квадрата: иди вперёд, собери звезду, поверни направо. Сторон четыре, поэтому цикл повторяется 4 раза.</p>",
    hint: "Внутри for i in range(4): напиши vpered(4), sobrat(), napravo().",
    starter: "# пройди по квадрату\n",
    solution: "for i in range(4):\n    vpered(4)\n    sobrat()\n    napravo()\n",
    par: 4,
    robot: {
      cols: 5, rows: 5, start: { x: 0, y: 0, d: 1 },
      stars: [[4, 0], [4, 4], [0, 4], [0, 0]],
    },
    check: { collectAll: true, requireFor: true },
  },
  {
    id: "3.3",
    topic: "3 · for циклі: қайталауды компьютерге тапсыр",
    title: "Лесенка",
    task:
      "<p>Звёзды стоят на ступеньках лесенки. Найди, как подняться на одну ступеньку, а потом пусть цикл её повторит.</p>" +
      "<p class='tip'>Одна ступенька: вперёд, налево, вперёд, направо, собрать звезду.</p>",
    hint: "Внутри for i in range(5): напиши 5 команд: vpered(), nalevo(), vpered(), napravo(), sobrat().",
    starter: "# поднимись по лесенке\n",
    solution:
      "for i in range(5):\n    vpered()\n    nalevo()\n    vpered()\n    napravo()\n    sobrat()\n",
    par: 6,
    robot: {
      cols: 6, rows: 6, start: { x: 0, y: 5, d: 1 },
      stars: [[1, 4], [2, 3], [3, 2], [4, 1], [5, 0]],
    },
    check: { collectAll: true, requireFor: true },
  },

  /* ---------- 4. if / else ---------- */
  {
    id: "4.1",
    topic: "4 · if / else: шешім қабылдау",
    title: "Чётное или нечётное?",
    task:
      `<p>Дано число <b>x</b>. Если оно чётное, выведи на экран <code>чётное</code>, иначе выведи <code>нечётное</code>. ` +
      `Попробуй поменять значение x: код должен работать правильно.</p>` +
      `<p class='tip'><code>x % 2 == 0</code> значит: остаток от деления x на 2 равен 0, то есть число чётное. ` +
      `Условие пишется так: <code>if условие:</code> и <code>else:</code>. В строках внутри обоих ставь отступ в 4 пробела.</p>`,
    hint: `Напиши if x % 2 == 0:, на следующей строке (с отступом в 4 пробела) print("чётное"). Затем else: и print("нечётное").`,
    starter: "x = 7\n# с помощью if / else выведи, чётное число или нечётное\n",
    solution: 'x = 7\nif x % 2 == 0:\n    print("чётное")\nelse:\n    print("нечётное")\n',
    par: 5,
    robot: null,
    check: {
      requireIf: true,
      fn(res) {
        const v = res.vars.x;
        if (!v || v.t !== "int") return "В коробке «x» должно лежать целое число.";
        const want = parseInt(v.s, 10) % 2 === 0 ? "чётное" : "нечётное";
        if (res.output.trim() !== want) {
          return "Для x = " + v.s + " на экране должно быть «" + want + "», а у тебя: «" + res.output.trim() + "».";
        }
        return null;
      },
    },
  },
  {
    id: "4.2",
    topic: "4 · if / else: шешім қабылдау",
    title: "Есть ли звезда?",
    task:
      `<p>На дорожке звёзды стоят вразброс. Если там, где нет звезды, вызвать <code>sobrat()</code>, будет ошибка! ` +
      `Поэтому сначала проверь, а потом собирай.</p>` +
      `<p class='tip'><code>zvezda_est()</code> отвечает «да», если на клетке, где стоит робот, есть звезда. ` +
      `Напиши <code>if zvezda_est():</code> и поставь внутрь <code>sobrat()</code>.</p>`,
    hint: "Внутри for i in range(6): напиши vpered(), потом проверь if zvezda_est(): и внутри напиши sobrat().",
    starter: "# иди по дорожке и собирай звезду только там, где она есть\n",
    solution: "for i in range(6):\n    vpered()\n    if zvezda_est():\n        sobrat()\n",
    par: 4,
    robot: {
      cols: 7, rows: 3, start: { x: 0, y: 1, d: 1 },
      stars: [[2, 1], [3, 1], [5, 1]], strict: true,
    },
    check: { collectAll: true, requireIf: true },
  },
  {
    id: "4.3",
    topic: "4 · if / else: шешім қабылдау",
    title: "Упёрся в стену — поверни",
    task:
      `<p>Пусть робот идёт вперёд, а когда упрётся в стену, поворачивает направо. Собери звезду в конце пути.</p>` +
      `<p class='tip'><code>vperedi_svobodno()</code> отвечает «да», если впереди свободно. ` +
      `Посчитай, сколько раз нужно повторить «один шаг + один поворот + один шаг».</p>`,
    hint: "Внутри for i in range(9): if vperedi_svobodno(): vpered() else: napravo(). После цикла sobrat().",
    starter: "# упёрся в стену — поверни, в конце собери звезду\n",
    solution: "for i in range(9):\n    if vperedi_svobodno():\n        vpered()\n    else:\n        napravo()\nsobrat()\n",
    par: 6,
    robot: { cols: 5, rows: 5, start: { x: 0, y: 0, d: 1 }, stars: [[4, 4]] },
    check: { collectAll: true, requireIf: true, requireFor: true },
  },

  /* ---------- 5. while ---------- */
  {
    id: "5.1",
    topic: "5 · while: қанша қайталарын білмесең",
    title: "До стены",
    task:
      `<p>Не считая длину дорожки, дойди до стены и собери звезду в конце.</p>` +
      `<p class='tip'><code>while vperedi_svobodno():</code> — пока впереди свободно, строки ниже повторяются снова и снова.</p>`,
    hint: "Напиши while vperedi_svobodno():, а внутрь vpered(). После цикла sobrat().",
    starter: "# иди до стены\n",
    solution: "while vperedi_svobodno():\n    vpered()\nsobrat()\n",
    par: 3,
    robot: { cols: 8, rows: 3, start: { x: 0, y: 1, d: 1 }, stars: [[7, 1]] },
    check: { collectAll: true, requireWhile: true },
  },
  {
    id: "5.2",
    topic: "5 · while: қанша қайталарын білмесең",
    title: "Две стены",
    task:
      `<p>Сначала дойди до правой стены, потом поверни и дойди до нижней стены. В углу стоит звезда.</p>`,
    hint: "while vperedi_svobodno(): vpered(), потом napravo(), потом ещё один цикл while. В конце sobrat().",
    starter: "# пройди два пути с помощью while\n",
    solution: "while vperedi_svobodno():\n    vpered()\nnapravo()\nwhile vperedi_svobodno():\n    vpered()\nsobrat()\n",
    par: 6,
    robot: { cols: 6, rows: 6, start: { x: 0, y: 0, d: 1 }, stars: [[5, 5]] },
    check: { collectAll: true, requireWhile: true },
  },
  {
    id: "5.3",
    topic: "5 · while: қанша қайталарын білмесең",
    title: "Счёт",
    task:
      `<p>Выведи на экран числа от 1 до 5 по одному.</p>` +
      `<p class='tip'><code>while i &lt;= 5:</code> — повторяет, пока условие верно. ` +
      `На каждом витке i должна увеличиваться на 1 (<code>i = i + 1</code>), иначе цикл никогда не остановится! ` +
      `Смотри на коробку «i» справа.</p>`,
    hint: "Начни с i = 1. Внутри while i <= 5: напиши print(i) и i = i + 1.",
    starter: "# посчитай от 1 до 5\n",
    solution: "i = 1\nwhile i <= 5:\n    print(i)\n    i = i + 1\n",
    par: 4,
    robot: null,
    check: { output: "1\n2\n3\n4\n5", requireWhile: true },
  },

  /* ---------- 6. Функции ---------- */
  {
    id: "6.1",
    topic: "6 · Функциялар: өз командаңды жаса",
    title: "Своя команда",
    task:
      `<p>Робот идёт на два шага вперёд и собирает звезду. Сделай из этих двух команд свою <b>функцию</b> ` +
      `и вызови её 3 раза.</p>` +
      `<p class='tip'>Создание: <code>def two_steps():</code> и строки внутри с отступом в 4 пробела. ` +
      `Вызов: <code>two_steps()</code>. Сначала создай функцию, а потом вызывай!</p>`,
    hint: "Внутри def two_steps(): напиши vpered(2) и sobrat(). Ниже вызови two_steps() 3 раза (или через for).",
    starter: "# создай свою функцию через def\n",
    solution: "def two_steps():\n    vpered(2)\n    sobrat()\ntwo_steps()\ntwo_steps()\ntwo_steps()\n",
    par: 6,
    robot: { cols: 7, rows: 3, start: { x: 0, y: 1, d: 1 }, stars: [[2, 1], [4, 1], [6, 1]] },
    check: { collectAll: true, requireDef: true },
  },
  {
    id: "6.2",
    topic: "6 · Функциялар: өз командаңды жаса",
    title: "Функция сложения",
    task:
      `<p>Создай функцию <b>add(a, b)</b>: она складывает два числа и возвращает результат через <code>return</code>. ` +
      `Потом выведи <code>print(add(3, 4))</code> и <code>print(add(10, 20))</code>.</p>` +
      `<p class='tip'>Пока функция работает, справа появляются её внутренние коробки (a и b).</p>`,
    hint: "Внутри def add(a, b): напиши return a + b. Потом напиши два print.",
    starter: "# создай функцию add\n",
    solution: "def add(a, b):\n    return a + b\nprint(add(3, 4))\nprint(add(10, 20))\n",
    par: 4,
    robot: null,
    check: {
      output: "7\n30",
      requireDef: true,
      fn(res) {
        const used = res.frames.some(
          (f) => (f.vars || []).some((v) => v.n === "a") && (f.vars || []).some((v) => v.n === "b")
        );
        return used ? null : "Вызови функцию add(a, b) и используй параметры a и b.";
      },
    },
  },

  /* ---------- 7. Списки ---------- */
  {
    id: "7.1",
    topic: "7 · Тізімдер: қатар тұрған қораптар",
    title: "Список фруктов",
    task:
      `<p>Создай список <b>fruits</b>: внутри пусть лежат <code>"яблоко"</code>, <code>"груша"</code>, <code>"вишня"</code>. ` +
      `Потом добавь через <code>append</code> элемент <code>"виноград"</code> и выведи длину списка.</p>` +
      `<p class='tip'>Список: <code>[1, 2, 3]</code>. Добавление: <code>fruits.append("виноград")</code>. ` +
      `Длина: <code>len(fruits)</code>. Справа список выглядит как коробки в ряд, у каждой есть номер.</p>`,
    hint: `fruits = ["яблоко", "груша", "вишня"], потом fruits.append("виноград"), потом print(len(fruits)).`,
    starter: "# создай список фруктов\n",
    solution: 'fruits = ["яблоко", "груша", "вишня"]\nfruits.append("виноград")\nprint(len(fruits))\n',
    par: 3,
    robot: null,
    check: {
      output: "4",
      requireList: true,
      fn(res) {
        const v = res.vars.fruits;
        if (!v) return "Список «fruits» не создан.";
        if (v.t !== "list" || !v.i) return "fruits должен быть списком: возьми элементы в квадратные скобки [ ].";
        if (v.i.length !== 4) return "В списке должно быть 4 фрукта, а сейчас " + v.i.length + ".";
        return null;
      },
    },
  },
  {
    id: "7.2",
    topic: "7 · Тізімдер: қатар тұрған қораптар",
    title: "Сумма списка",
    task:
      `<p>Найди сумму всех чисел в списке и выведи её на экран.</p>` +
      `<p class='tip'><code>for x in numbers:</code> — по очереди кладёт каждый элемент списка в коробку x. ` +
      `Создай отдельную коробку для суммы (сначала 0) и прибавляй к ней каждое число.</p>`,
    hint: "Начни с total = 0. Внутри for x in numbers: напиши total = total + x. В конце print(total).",
    starter: "numbers = [3, 8, 5, 2]\n# найди сумму циклом for\n",
    solution: "numbers = [3, 8, 5, 2]\ntotal = 0\nfor x in numbers:\n    total = total + x\nprint(total)\n",
    par: 5,
    robot: null,
    check: {
      requireFor: true,
      requireList: true,
      fn(res) {
        const v = res.vars.numbers;
        if (!v || !v.i) return "Не удаляй список «numbers».";
        const want = String(v.i.reduce((a, s) => a + parseInt(s, 10), 0));
        if (res.output.trim() !== want) {
          return "Сумма должна быть " + want + ", а на экране: «" + res.output.trim() + "».";
        }
        return null;
      },
    },
  },
],
  bonus: [],
  lectures: [],
  reference: [],
});
