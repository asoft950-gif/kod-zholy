/* Курс «Проекты»: три маленьких проекта шаг за шагом (Python) */
(() => {
  const sig = "# --- проверка (не меняй) ---";
  /* Проверка части-драйвера: она не изменена, и функция действительно работает */
  const D = (driver) => (res) => {
    const norm = (s) => s.replace(/[ \t]+$/gm, "").replace(/\r/g, "").trim();
    return norm(res.code).includes(norm(driver)) ? null : "Не меняй строки под «" + sig + "»: они проверяют твою функцию.";
  };
  const noHard = (...outs) => ({ re: new RegExp("return\\s+[\"']?(" + outs.join("|") + ")[\"']?\\s*$", "m"), msg: "Не вписывай ответ прямо в код: функция должна работать с любыми числами." });

  /* ---- Калькулятор: функции (на следующих шагах даются готовыми) ---- */
  const BASE12 =
    "def add(a, b):\n    return a + b\n\n\ndef subtract(a, b):\n    return a - b\n\n\n";
  const BASE_KB =
    "def multiply(a, b):\n    return a * b\n\n\ndef divide(a, b):\n    if b == 0:\n        return \"Делить на ноль нельзя\"\n    return a / b\n\n\n";
  const BASE_ES =
    "def calculate(a, op, b):\n    if op == \"+\":\n        return add(a, b)\n    elif op == \"-\":\n        return subtract(a, b)\n    elif op == \"*\":\n        return multiply(a, b)\n    elif op == \"/\":\n        return divide(a, b)\n    return \"Неизвестная операция\"\n\n\n";

  /* ---- Угадай число: compare, play ---- */
  const SALY = "def compare(secret, guess):\n    if guess < secret:\n        return \"Мало\"\n    elif guess > secret:\n        return \"Много\"\n    return \"Верно!\"\n\n\n";
  const OJNA2 =
    "def play(secret, guesses):\n    attempts = 0\n    for g in guesses:\n        attempts = attempts + 1\n        result = compare(secret, g)\n        print(result)\n        if result == \"Верно!\":\n            return attempts\n\n\n";

  /* ---- Список задач ---- */
  const T_QOS = "def add_task(tasks, title):\n    tasks.append([title, False])\n\n\n";
  const T_KORSET =
    "def show(tasks):\n    for i in range(len(tasks)):\n        mark = \"[ ]\"\n        if tasks[i][1]:\n            mark = \"[x]\"\n        print(str(i + 1) + \". \" + mark + \" \" + tasks[i][0])\n\n\n";
  const T_BELGILE = "def mark_done(tasks, number):\n    tasks[number - 1][1] = True\n\n\n";

  const d11 = sig + "\nprint(add(7, 3))\nprint(subtract(7, 3))\nprint(add(10, 5))\n";
  const d12 = sig + "\nprint(multiply(6, 4))\nprint(divide(10, 4))\nprint(divide(5, 0))\n";
  const d13 = sig + '\nprint(calculate(6, "+", 2))\nprint(calculate(6, "-", 2))\nprint(calculate(6, "*", 2))\nprint(calculate(6, "/", 2))\nprint(calculate(6, "/", 0))\nprint(calculate(6, "%", 2))\n';
  const d21 = sig + "\nprint(compare(42, 30))\nprint(compare(42, 50))\nprint(compare(42, 42))\n";
  const d22 = sig + '\ncount = play(7, [3, 9, 7, 5])\nprint("Попыток:", count)\n';
  const d23 = sig + '\nplay(7, [3, 9, 7, 5], 5)\nprint("---")\nplay(7, [1, 2, 3, 4], 3)\n';
  const d31 = sig + '\nadd_task(tasks, "Купить хлеб")\nadd_task(tasks, "Учить уроки")\nadd_task(tasks, "Спорт")\nprint(tasks)\nprint(len(tasks))\n';
  const d32 = sig + '\ntasks = ["Купить хлеб", "Учить уроки", "Спорт"]\nshow(tasks)\n';
  const d33 = sig + '\ntasks = []\nadd_task(tasks, "Купить хлеб")\nadd_task(tasks, "Учить уроки")\nadd_task(tasks, "Спорт")\nmark_done(tasks, 2)\nshow(tasks)\n';
  const d34 = sig + '\ntasks = []\nadd_task(tasks, "Купить хлеб")\nadd_task(tasks, "Учить уроки")\nadd_task(tasks, "Спорт")\nmark_done(tasks, 1)\nmark_done(tasks, 3)\nshow(tasks)\nprint("Выполнено: " + str(count_done(tasks)) + "/" + str(len(tasks)))\n';

  const T1 = "1 · Калькулятор: функциялар";
  const T2 = "2 · Сан табу ойыны";
  const T3 = "3 · Тапсырмалар тізімі";

  KZ.registerCourse({
    id: "projects",
    name: "Проекты",
    emoji: "🚀",
    color: "#e84393",
    status: "ready",
    engine: "python",
    tagline: "Пиши настоящие маленькие программы шаг за шагом",
    commands: [],
    topics: [
      { id: "1", emoji: "🧮", title: "Калькулятор", blurb: "Функции, условия и цикл" },
      { id: "2", emoji: "🎯", title: "Угадай число", blurb: "Сравнение, цикл и очки" },
      { id: "3", emoji: "📝", title: "Список задач", blurb: "Списки и списки внутри списков" },
    ],
    levels: [
      /* ---------- 1. Калькулятор ---------- */
      {
        id: "1.1", topic: T1, title: "Сложение и вычитание",
        task:
          "<p>Делаем калькулятор! Сначала две функции: <code>add(a, b)</code> складывает два числа, а <code>subtract(a, b)</code> вычитает. Обе должны <b>возвращать</b> результат (<code>return</code>).</p>" +
          "<p class='tip'>Строки под «<code>" + sig + "</code>» проверяют твою функцию, их не меняй.</p>",
        hint: "Внутри функции напиши return a + b. Для вычитания return a - b.",
        starter: "def add(a, b):\n    # верни сумму a и b\n    pass\n\n\ndef subtract(a, b):\n    # верни разность: a минус b\n    pass\n\n\n" + d11,
        solution: "def add(a, b):\n    return a + b\n\n\ndef subtract(a, b):\n    return a - b\n\n\n" + d11,
        par: 8, robot: null,
        check: { output: "10\n4\n15", requireDef: true, fn: D(d11), forbid: [noHard("10", "4", "15")] },
      },
      {
        id: "1.2", topic: T1, title: "Умножение и деление",
        task:
          "<p>Ещё две кнопки: <code>multiply(a, b)</code> умножает, <code>divide(a, b)</code> делит. Но <b>на ноль делить нельзя</b>: если <code>b</code> равно нулю, верни строку <code>\"Делить на ноль нельзя\"</code>.</p>",
        hint: "В divide: if b == 0: return \"Делить на ноль нельзя\", а иначе return a / b.",
        starter: BASE12 + "def multiply(a, b):\n    # умножь и верни\n    pass\n\n\ndef divide(a, b):\n    # если b равно нулю, верни предупреждение\n    # иначе верни a / b\n    pass\n\n\n" + d12,
        solution: BASE12 + BASE_KB + d12,
        par: 14, robot: null,
        check: { output: "24\n2.5\nДелить на ноль нельзя", requireDef: true, requireIf: true, fn: D(d12), forbid: [noHard("24", "2\\.5")] },
      },
      {
        id: "1.3", topic: T1, title: "Одна функция: calculate",
        task:
          "<p>Соберём четыре функции в одном месте. <code>calculate(a, op, b)</code> смотрит на знак операции (<code>\"+\"</code>, <code>\"-\"</code>, <code>\"*\"</code>, <code>\"/\"</code>), вызывает нужную функцию и возвращает результат.</p>" +
          "<p class='tip'>Если знак неизвестный, верни <code>\"Неизвестная операция\"</code>. Результат деления получается вида <code>3.0</code>, это правильно.</p>",
        hint: "if op == \"+\": return add(a, b), потом elif для остальных операций, а в самом конце return \"Неизвестная операция\".",
        starter: BASE12 + BASE_KB + "def calculate(a, op, b):\n    # вызови нужную функцию по знаку операции\n    pass\n\n\n" + d13,
        solution: BASE12 + BASE_KB + BASE_ES + d13,
        par: 27, robot: null,
        check: { output: "8\n4\n12\n3.0\nДелить на ноль нельзя\nНеизвестная операция", requireDef: true, requireIf: true, fn: D(d13) },
      },
      {
        id: "1.4", topic: T1, title: "История вычислений",
        task:
          "<p>Операции, которые посчитал калькулятор, лежат в списке: <code>[число, знак, число]</code>. Выведи каждую операцию одной строкой в виде <code>6 + 2 = 8</code>.</p>" +
          "<p class='tip'><code>print(a, op, b, \"=\", result)</code> сам ставит пробелы. Должно работать и при делении на ноль.</p>",
        hint: "for op in operations: внутри result = calculate(op[0], op[1], op[2]), потом print(op[0], op[1], op[2], \"=\", result).",
        starter: BASE12 + BASE_KB + BASE_ES + 'operations = [[6, "+", 2], [9, "-", 4], [3, "*", 5], [8, "/", 0]]\n\n# выведи каждую операцию в виде "6 + 2 = 8"\n',
        solution: BASE12 + BASE_KB + BASE_ES + 'operations = [[6, "+", 2], [9, "-", 4], [3, "*", 5], [8, "/", 0]]\n\nfor op in operations:\n    result = calculate(op[0], op[1], op[2])\n    print(op[0], op[1], op[2], "=", result)\n',
        par: 25, robot: null,
        check: { output: "6 + 2 = 8\n9 - 4 = 5\n3 * 5 = 15\n8 / 0 = Делить на ноль нельзя", requireFor: true, requireList: true },
      },

      /* ---------- 2. Угадай число ---------- */
      {
        id: "2.1", topic: T2, title: "Сравнение",
        task:
          "<p>Компьютер загадал число (<code>secret</code>), игрок угадывает (<code>guess</code>). Функция <code>compare(secret, guess)</code> должна отвечать так:</p>" +
          "<ul><li>если догадка меньше: <code>\"Мало\"</code></li><li>если больше: <code>\"Много\"</code></li><li>если равна: <code>\"Верно!\"</code></li></ul>",
        hint: "if guess < secret: return \"Мало\", elif guess > secret: return \"Много\", а в конце return \"Верно!\".",
        starter: "def compare(secret, guess):\n    # верни один из трёх ответов\n    pass\n\n\n" + d21,
        solution: SALY + d21,
        par: 10, robot: null,
        check: { output: "Мало\nМного\nВерно!", requireDef: true, requireIf: true, fn: D(d21) },
      },
      {
        id: "2.2", topic: T2, title: "Список догадок",
        task:
          "<p>Игрок делает несколько догадок. <code>play(secret, guesses)</code> проверяет их по одной и выводит каждый ответ на экран. Когда число угадано, <b>остановись</b> и верни, сколько было попыток.</p>" +
          "<p class='tip'>Если написать <code>return</code> внутри цикла, функция сразу закончится.</p>",
        hint: "Начни с attempts = 0. В цикле attempts = attempts + 1, result = compare(secret, g), print(result). Если result == \"Верно!\", то return attempts.",
        starter: SALY + "def play(secret, guesses):\n    # проверяй догадки по одной\n    pass\n\n\n" + d22,
        solution: SALY + OJNA2 + d22,
        par: 17, robot: null,
        check: { output: "Мало\nМного\nВерно!\nПопыток: 3", requireDef: true, requireFor: true, requireIf: true, fn: D(d22) },
      },
      {
        id: "2.3", topic: T2, title: "Победа и проигрыш",
        task:
          "<p>Пусть попыток будет ограниченное число: <code>play(secret, guesses, limit)</code>. Если число найдено не позже чем за <code>limit</code> попыток, выведи <code>Победа! Попыток: 3</code>. Если не найдено, выведи <code>Проигрыш! Число: 7</code>.</p>" +
          "<p class='tip'>Теперь удобен <code>while</code>: повторяй, пока число попыток меньше <code>limit</code> и ещё остались догадки.</p>",
        hint: "while attempts < limit and attempts < len(guesses): внутри возьми guesses[attempts] и проверь. Если победил, сделай print(\"Победа! Попыток:\", attempts) и напиши return. После цикла выведи сообщение о проигрыше.",
        starter: SALY + "def play(secret, guesses, limit):\n    # проверь не больше limit догадок\n    pass\n\n\n" + d23,
        solution:
          SALY +
          "def play(secret, guesses, limit):\n    attempts = 0\n    while attempts < limit and attempts < len(guesses):\n        result = compare(secret, guesses[attempts])\n        attempts = attempts + 1\n        print(result)\n        if result == \"Верно!\":\n            print(\"Победа! Попыток:\", attempts)\n            return\n    print(\"Проигрыш! Число:\", secret)\n\n\n" +
          d23,
        par: 20, robot: null,
        check: { output: "Мало\nМного\nВерно!\nПобеда! Попыток: 3\n---\nМало\nМало\nМало\nПроигрыш! Число: 7", requireDef: true, requireWhile: true, requireIf: true, fn: D(d23) },
      },
      {
        id: "2.4", topic: T2, title: "Лучший результат",
        task:
          "<p>Число попыток после нескольких игр лежит в списке: <code>results</code>. Найди <b>наименьшее</b> число попыток (лучший результат) и посчитай среднее.</p>" +
          "<p class='tip'>Не используй <code>min()</code>, возьми цикл и <code>if</code>. Сумму даёт <code>sum(results)</code>, количество даёт <code>len(results)</code>.</p>",
        hint: "Сначала возьми за лучший результат первый элемент списка, затем сравни с остальными в цикле for: нашёлся меньший — обнови. Среднее — это сумма, делённая на количество.",
        starter: "results = [3, 1, 4, 2]\n\n# найди и выведи лучший результат: Лучший результат: 1\n# выведи среднее: Среднее: 2.5\n",
        solution:
          "results = [3, 1, 4, 2]\n\nbest = results[0]\nfor n in results:\n    if n < best:\n        best = n\nprint(\"Лучший результат:\", best)\nprint(\"Среднее:\", sum(results) / len(results))\n",
        par: 8, robot: null,
        check: {
          output: "Лучший результат: 1\nСреднее: 2.5", requireFor: true, requireIf: true, requireList: true,
          forbid: [{ re: /\bmin\s*\(/, msg: "Не используй min(), найди сам!" }, { re: /\bsorted\s*\(|\.sort\s*\(/, msg: "Не используй sort(), возьми цикл!" }],
        },
      },

      /* ---------- 3. Список задач ---------- */
      {
        id: "3.1", topic: T3, title: "Добавить задачу",
        task:
          "<p>Делаем список повседневных дел. Каждая задача — это <b>список из двух значений</b>: <code>[название, выполнено ли]</code>. Новая задача всегда добавляется как <code>False</code> (ещё не выполнена).</p>" +
          "<p>Напиши функцию <code>add_task(tasks, title)</code>, которая добавляет <code>[title, False]</code> в конец списка.</p>",
        hint: "tasks.append([title, False]): в append можно передать ещё один список.",
        starter: "tasks = []\n\n\ndef add_task(tasks, title):\n    # добавь [title, False] в конец tasks\n    pass\n\n\n" + d31,
        solution: "tasks = []\n\n\ndef add_task(tasks, title):\n    tasks.append([title, False])\n\n\n" + d31,
        par: 9, robot: null,
        check: { output: "[['Купить хлеб', False], ['Учить уроки', False], ['Спорт', False]]\n3", requireDef: true, requireList: true, fn: D(d31) },
      },
      {
        id: "3.2", topic: T3, title: "Показать список",
        task:
          "<p>Пусть <code>show(tasks)</code> выводит каждую задачу с номером: <code>1. Купить хлеб</code>. Название задачи — это <b>0-й</b> элемент каждого вложенного списка.</p>",
        hint: "Номера бери из цикла range(len(…)): он начинается с 0, поэтому при показе прибавь единицу. Название — нулевой элемент вложенного списка; номер превращай в текст через str().",
        starter: "def show(tasks):\n    # выведи каждую задачу в виде \"1. Купить хлеб\"\n    pass\n\n\n" + sig + '\ntasks = [["Купить хлеб", False], ["Учить уроки", False], ["Спорт", False]]\nshow(tasks)\n',
        solution: "def show(tasks):\n    for i in range(len(tasks)):\n        print(str(i + 1) + \". \" + tasks[i][0])\n\n\n" + sig + '\ntasks = [["Купить хлеб", False], ["Учить уроки", False], ["Спорт", False]]\nshow(tasks)\n',
        par: 6, robot: null,
        check: { output: "1. Купить хлеб\n2. Учить уроки\n3. Спорт", requireDef: true, requireFor: true, fn: D(sig + '\ntasks = [["Купить хлеб", False], ["Учить уроки", False], ["Спорт", False]]\nshow(tasks)\n') },
      },
      {
        id: "3.3", topic: T3, title: "Отметить выполненной",
        task:
          "<p>Два изменения: 1) пусть <code>show</code> ставит <code>[x]</code> у выполненной задачи и <code>[ ]</code> у невыполненной; 2) пусть <code>mark_done(tasks, number)</code> отмечает задачу под номером <b>number</b> как выполненную (<code>False</code> → <code>True</code>).</p>" +
          "<p class='tip'>Номер начинается с 1, а номера в списке с 0: <code>tasks[number - 1][1]</code>.</p>",
        hint: "В mark_done: tasks[number - 1][1] = True. В show начни с mark = \"[ ]\", потом if tasks[i][1]: mark = \"[x]\".",
        starter: T_QOS + "def show(tasks):\n    # у выполненной ставь [x], у невыполненной [ ]\n    for i in range(len(tasks)):\n        print(str(i + 1) + \". \" + tasks[i][0])\n\n\ndef mark_done(tasks, number):\n    # отметь задачу под номером number как выполненную\n    pass\n\n\n" + d33,
        solution: T_QOS + T_KORSET + T_BELGILE + d33,
        par: 17, robot: null,
        check: { output: "1. [ ] Купить хлеб\n2. [x] Учить уроки\n3. [ ] Спорт", requireDef: true, requireFor: true, requireIf: true, fn: D(d33) },
      },
      {
        id: "3.4", topic: T3, title: "Сколько я сделал?",
        task:
          "<p>Последний шаг: пусть <code>count_done(tasks)</code> возвращает количество выполненных задач. Завершаем проект: показываем список, а в конце выводится <code>Выполнено: 2/3</code>.</p>",
        hint: "Начни с count = 0, пройди по всем задачам, if t[1]: count = count + 1. В конце return count.",
        starter: T_QOS + T_KORSET + T_BELGILE + "def count_done(tasks):\n    # верни количество выполненных\n    pass\n\n\n" + d34,
        solution: T_QOS + T_KORSET + T_BELGILE + "def count_done(tasks):\n    count = 0\n    for t in tasks:\n        if t[1]:\n            count = count + 1\n    return count\n\n\n" + d34,
        par: 25, robot: null,
        check: { output: "1. [x] Купить хлеб\n2. [ ] Учить уроки\n3. [x] Спорт\nВыполнено: 2/3", requireDef: true, requireFor: true, requireIf: true, fn: D(d34) },
      },
    ],
    bonus: [],
    lectures: [],
    reference: [],
  });
})();
