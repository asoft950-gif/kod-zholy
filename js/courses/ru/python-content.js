/* Курс Python: лекции, дополнительные задания, справочник */
(() => {
  const c = KZ.getCourse("python");

  /* ---------- Дополнительные (посложнее) задания ---------- */
  c.bonus = [
    {
      id: "B1",
      title: "Таблица на три",
      task:
        "<p>Выведи таблицу умножения на 3: <code>3, 6, 9, 12, 15</code>. Каждое число на новой строке.</p>" +
        "<p class='tip'><code>range(1, 6)</code> даёт числа 1, 2, 3, 4, 5 (последнее число не входит). " +
        "Умножай каждое число на 3: <code>i * 3</code>.</p>",
      hint: "Внутри for i in range(1, 6): напиши print(i * 3).",
      starter: "# выведи таблицу на 3 циклом for\n",
      solution: "for i in range(1, 6):\n    print(i * 3)\n",
      par: 2,
      robot: null,
      check: { output: "3\n6\n9\n12\n15", requireFor: true },
    },
    {
      id: "B2",
      title: "Самое большое число",
      task:
        "<p>Найди в списке самое большое число и выведи его на экран. Нельзя использовать <code>max()</code> и <code>sort()</code>, найди сам!</p>" +
        "<p class='tip'>Идея: сначала возьми первое число как «самое большое». Потом пройди по списку, и если встретится число больше, обнови коробку.</p>",
      hint: "Начни с biggest = numbers[0]. Внутри for x in numbers: напиши if x > biggest: biggest = x. В конце print(biggest).",
      starter: "numbers = [4, 17, 9, 12]\n# найди самое большое число без max()\n",
      solution:
        "numbers = [4, 17, 9, 12]\nbiggest = numbers[0]\nfor x in numbers:\n    if x > biggest:\n        biggest = x\nprint(biggest)\n",
      par: 6,
      robot: null,
      check: {
        requireFor: true,
        requireIf: true,
        requireList: true,
        forbid: [
          { re: /\bmax\s*\(/, msg: "Не используй max(), найди сам!" },
          { re: /\bsorted\s*\(|\.sort\s*\(/, msg: "Не используй sort(), найди сам!" },
        ],
        fn(res) {
          const v = res.vars.numbers;
          if (!v || !v.i) return "Не удаляй список «numbers».";
          const want = String(Math.max(...v.i.map((s) => parseInt(s, 10))));
          if (res.output.trim() !== want) {
            return "Ответ должен быть " + want + ", а на экране: «" + res.output.trim() + "».";
          }
          return null;
        },
      },
    },
    {
      id: "B3",
      title: "Обойди стену",
      task:
        "<p>Посередине стоит стена, а над ней и под ней есть проходы. Обведи робота вокруг стены и приведи к звезде.</p>" +
        "<p class='tip'>Сначала подойди к стене, поднимись вверх, обойди стену, а потом спустись вниз.</p>",
      hint: "vpered(2), nalevo(), vpered(2), napravo(), vpered(3), napravo(), vpered(2), sobrat().",
      starter: "# обойди стену\n",
      solution: "vpered(2)\nnalevo()\nvpered(2)\nnapravo()\nvpered(3)\nnapravo()\nvpered(2)\nsobrat()\n",
      par: 8,
      robot: {
        cols: 6, rows: 5, start: { x: 0, y: 2, d: 1 },
        stars: [[5, 2]], walls: [[3, 1], [3, 2], [3, 3]],
      },
      check: { collectAll: true },
    },
  ];

  /* ---------- Лекции ---------- */
  c.lectures = [
    {
      id: "l1", topic: "1", title: "Что такое переменная?", minutes: 3,
      blocks: [
        { t: "p", html: "Компьютер хранит информацию в <b>коробках</b>. У каждой коробки есть <b>имя</b>, а внутри лежит <b>значение</b>. В программировании такую коробку называют <b>переменной</b>." },
        { t: "boxes", items: [{ n: "x", v: "5" }, { n: "name", v: '"Алия"' }, { n: "age", v: "12" }], caption: "Три коробки: у каждой есть имя и значение." },
        { t: "h", text: "Создаём коробку" },
        { t: "p", html: "Знак равенства <code>=</code> здесь означает не «равно», а «<b>положи</b>». <code>x = 5</code> значит: положи число 5 в коробку x." },
        { t: "try", code: "x = 5\nprint(x)", note: "Запусти и посмотри на коробку справа." },
        { t: "p", html: "Если положить в коробку новое значение, старое исчезнет:" },
        { t: "try", code: "x = 5\nx = 9\nprint(x)" },
        { t: "h", text: "Число и строка" },
        { t: "p", html: "Текст обязательно пишется <b>в кавычках</b>: <code>\"Алия\"</code>. Число пишется без кавычек: <code>5</code>. И числа, и строки можно складывать:" },
        { t: "try", code: 'a = 5\nb = 3\nprint(a + b)\nprint("Привет, " + "Алия")' },
        { t: "warn", html: "<code>\"5\"</code> (в кавычках) — это строка, а <code>5</code> — число. Результат <code>\"5\" + \"5\"</code> — <code>55</code>, а результат <code>5 + 5</code> — <code>10</code>." },
        { t: "tip", html: "В имени коробки не бывает пробелов, и оно не начинается с цифры: <code>my_name</code> правильно, <code>1x</code> ошибка." },
      ],
    },
    {
      id: "l2", topic: "2", title: "Робот и команды", minutes: 3,
      blocks: [
        { t: "p", html: "Программа — это <b>список инструкций</b> для компьютера. Компьютер выполняет их сверху вниз, <b>по одной</b>." },
        { t: "board", cfg: { cols: 5, rows: 3, start: { x: 0, y: 1, d: 1 }, stars: [[4, 1]] }, caption: "Робот должен дойти до звезды. Треугольник на нём показывает, куда он смотрит." },
        { t: "h", text: "Команды робота" },
        { t: "list", items: [
          "<code>vpered()</code> — вперёд на 1 шаг. <code>vpered(3)</code> — на 3 шага.",
          "<code>napravo()</code> — поворот направо.",
          "<code>nalevo()</code> — поворот налево.",
          "<code>sobrat()</code> — собрать звезду, на которой стоит робот.",
        ] },
        { t: "try", code: "vpered(3)\nnapravo()\nvpered(1)", note: "Посмотри по шагам, как идёт робот." },
        { t: "tip", html: "<b>Порядок команд важен</b>: если сначала пройти, а потом повернуть, получится не то же самое, что сначала повернуть, а потом пройти." },
        { t: "warn", html: "Если робот врежется в стену, программа остановится и покажет ошибку. Не бойся ошибок: они показывают, где ты ошибся." },
      ],
    },
    {
      id: "l3", topic: "3", title: "Цикл for: повторение", minutes: 4,
      blocks: [
        { t: "p", html: "Если команду нужно повторить 10 раз, писать её 10 раз не надо. Поручи повторение <b>циклу</b>." },
        { t: "code", code: "# без цикла:\nvpered()\nvpered()\nvpered()\n\n# с циклом:\nfor i in range(3):\n    vpered()" },
        { t: "p", html: "<code>range(3)</code> значит «3 раза», а коробка <code>i</code> при этом принимает значения 0, 1, 2. Она работает как счётчик." },
        { t: "boxes", items: [{ n: "i", v: "0" }, { n: "i", v: "1" }, { n: "i", v: "2" }], caption: "С каждым витком цикла число в коробке i меняется." },
        { t: "try", code: "for i in range(3):\n    print(i)", note: "Смотри на коробку «i» справа." },
        { t: "warn", html: "<b>Отступ</b> очень важен! Перед строками внутри цикла должно стоять 4 пробела. Строка без отступа остаётся за пределами цикла." },
        { t: "try", code: "for i in range(4):\n    vpered()\n    sobrat()", note: "Робот повторит это 4 раза." },
      ],
    },
    {
      id: "l4", topic: "4", title: "if / else: принимаем решение", minutes: 4,
      blocks: [
        { t: "p", html: "Программа может что-то проверить и <b>в зависимости от ситуации</b> действовать по-разному. Для этого есть <code>if</code> (если) и <code>else</code> (иначе)." },
        { t: "try", code: 'x = 7\nif x > 5:\n    print("большое")\nelse:\n    print("маленькое")' },
        { t: "p", html: "Если условие истинно (<code>True</code>), выполняются строки внутри <code>if</code>. Если нет, выполняются строки внутри <code>else</code>." },
        { t: "h", text: "Знаки сравнения" },
        { t: "list", items: [
          "<code>==</code> равно, <code>!=</code> не равно",
          "<code>&lt;</code> меньше, <code>&gt;</code> больше",
          "<code>&lt;=</code> меньше или равно, <code>&gt;=</code> больше или равно",
        ] },
        { t: "warn", html: "Один знак <code>=</code> кладёт значение в коробку. Два знака, <code>==</code>, сравнивают. Не путай их!" },
        { t: "h", text: "Остаток: чётное или нечётное?" },
        { t: "p", html: "Знак <code>%</code> даёт остаток от деления: результат <code>7 % 2</code> — 1. Чётное число делится на 2 без остатка, поэтому <code>x % 2 == 0</code> истинно для чётного числа." },
        { t: "try", code: "print(7 % 2)\nprint(8 % 2)" },
        { t: "h", text: "Датчики робота" },
        { t: "list", items: [
          "<code>zvezda_est()</code>: есть ли звезда там, где стоит робот?",
          "<code>vperedi_svobodno()</code>: свободно ли впереди (нет ли стены)?",
        ] },
        { t: "try", code: "if vperedi_svobodno():\n    vpered()\nelse:\n    napravo()" },
        { t: "tip", html: "Если вариантов три или больше, можно добавить <code>elif</code> (иначе если): <code>if … elif … else</code>." },
      ],
    },
    {
      id: "l5", topic: "5", title: "Цикл while", minutes: 3,
      blocks: [
        { t: "p", html: "<code>for</code> используют, когда известно, сколько раз повторять. А <code>while</code> (<b>пока</b>) повторяет снова и снова, пока условие истинно." },
        { t: "try", code: "i = 1\nwhile i <= 3:\n    print(i)\n    i = i + 1", note: "Посмотри, как меняется коробка i." },
        { t: "warn", html: "Не забывай внутри цикла менять то, что влияет на условие (например, <code>i = i + 1</code>). Иначе цикл <b>никогда не остановится</b>. У нас такая программа сама остановится через 3000 шагов." },
        { t: "h", text: "while с роботом" },
        { t: "p", html: "Можно дойти до стены, не считая длину дорожки:" },
        { t: "try", code: "while vperedi_svobodno():\n    vpered()" },
        { t: "tip", html: "Если знаешь, сколько раз повторять, используй <code>for</code>. Если неизвестно, когда остановиться, используй <code>while</code>." },
      ],
    },
    {
      id: "l6", topic: "6", title: "Функции", minutes: 4,
      blocks: [
        { t: "p", html: "<b>Функция</b> — это группа команд, у которой есть имя. Пишешь её один раз, а вызывать можешь много раз." },
        { t: "try", code: "def two_steps():\n    vpered(2)\n    sobrat()\n\ntwo_steps()\ntwo_steps()", note: "Мы вызвали функцию два раза." },
        { t: "list", items: [
          "<code>def</code> создаёт функцию. Строки внутри идут с отступом в 4 пробела.",
          "<code>two_steps()</code> выполняет её (вызывает).",
        ] },
        { t: "warn", html: "Функцию нужно <b>сначала создать</b>, а потом вызывать. Если вызвать до создания, компьютер её не узнает." },
        { t: "h", text: "Параметр и return" },
        { t: "p", html: "Функции можно передать значения (<b>параметры</b>), а она вернёт результат через <code>return</code>." },
        { t: "try", code: "def add(a, b):\n    return a + b\n\nprint(add(3, 4))", note: "Пока функция работает, появляются коробки a и b." },
        { t: "tip", html: "<code>return</code> возвращает результат, а <code>print</code> выводит его на экран. Это разные вещи!" },
      ],
    },
    {
      id: "l7", topic: "7", title: "Списки", minutes: 4,
      blocks: [
        { t: "p", html: "Если хочешь хранить много значений в одной коробке, используют <b>список</b>. Он как коробки, стоящие в ряд: у каждой есть свой номер." },
        { t: "arr", name: "fruits", items: ['"яблоко"', '"груша"', '"вишня"'], caption: "Номера начинаются не с 1, а с 0!" },
        { t: "try", code: 'fruits = ["яблоко", "груша", "вишня"]\nprint(fruits[0])\nprint(len(fruits))' },
        { t: "list", items: [
          "<code>fruits[0]</code> — первый элемент.",
          "<code>len(fruits)</code> — длина списка.",
          "<code>fruits.append(\"виноград\")</code> добавляет новый элемент в конец.",
        ] },
        { t: "h", text: "Список и for" },
        { t: "p", html: "<code>for x in список:</code> по очереди кладёт каждый элемент списка в коробку <code>x</code>:" },
        { t: "try", code: 'numbers = [3, 8, 5]\ntotal = 0\nfor x in numbers:\n    total = total + x\nprint(total)', note: "Посмотри, как растёт коробка total." },
        { t: "tip", html: "Пустой список: <code>[]</code>. Через <code>append</code> можно добавлять в него элементы и заполнить список самому." },
      ],
    },
  ];

  /* ---------- Справочник ---------- */
  c.reference = [
    { term: "print()", text: "Выводит значение на экран.", code: 'print("Привет")\nprint(2 + 3)' },
    { term: "Комментарий (#)", text: "Всё, что написано после знака #, компьютеру не нужно: это пояснение только для человека.", code: "# это пояснение\nprint(1)" },
    { term: "Переменная", text: "Коробка с именем, в которой хранится значение. Чтобы создать её, используют =.", code: "x = 5\nname = \"Алия\"\nprint(x, name)" },
    { term: "Типы: int, float, str, bool", text: "int — целое число, float — дробное число, str — строка, bool — истина (True) или ложь (False).", code: "print(type(5))\nprint(type(2.5))\nprint(type(\"привет\"))\nprint(type(True))" },
    { term: "Арифметика", text: "+ сложение, - вычитание, * умножение, / деление, ** степень, % остаток, // целочисленное деление.", code: "print(7 + 2)\nprint(7 % 2)\nprint(2 ** 3)\nprint(7 // 2)" },
    { term: "Сравнение", text: "== равно, != не равно, < меньше, > больше, <= меньше или равно, >= больше или равно. Результат: True или False.", code: "print(5 > 3)\nprint(5 == 6)" },
    { term: "if / elif / else", text: "Действует по-разному в зависимости от условия. Строки внутри идут с отступом в 4 пробела.", code: "x = 7\nif x > 10:\n    print(\"очень большое\")\nelif x > 5:\n    print(\"большое\")\nelse:\n    print(\"маленькое\")" },
    { term: "for и range()", text: "Повторяет команды заданное число раз. range(3) → 0, 1, 2. range(1, 4) → 1, 2, 3.", code: "for i in range(1, 4):\n    print(i)" },
    { term: "while", text: "Повторяет, пока условие истинно. Не забывай менять значение, от которого зависит условие!", code: "i = 3\nwhile i > 0:\n    print(i)\n    i = i - 1" },
    { term: "def и return", text: "def создаёт функцию, return возвращает результат.", code: "def multiply(a, b):\n    return a * b\n\nprint(multiply(4, 5))" },
    { term: "Список", text: "Коробки, стоящие в ряд. Номера начинаются с 0. append добавляет элемент, len даёт длину.", code: "t = [10, 20, 30]\nt.append(40)\nprint(t[0], len(t))" },
    { term: "for x in список", text: "По очереди берёт каждый элемент списка.", code: "for x in [1, 2, 3]:\n    print(x * 10)" },
    { term: "Команды робота", text: "vpered(n) — вперёд, napravo() — поверни направо, nalevo() — поверни налево, sobrat() — собери звезду.", code: "vpered(3)\nnapravo()\nvpered(2)\nsobrat()" },
    { term: "Датчики робота", text: "zvezda_est(): есть ли звезда там, где стоит робот. vperedi_svobodno(): свободно ли впереди.", code: "while vperedi_svobodno():\n    vpered()\n    if zvezda_est():\n        sobrat()" },
  ];
})();
