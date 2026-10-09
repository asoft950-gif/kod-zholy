/* Курс «Проекты»: лекции и справочник */
(() => {
  const c = KZ.getCourse("projects");

  c.lectures = [
    {
      id: "l1", topic: "1", title: "Калькулятор: думаем функциями", minutes: 4,
      blocks: [
        { t: "p", html: "Большую программу не пишут сразу целиком. Её делят на <b>маленькие функции</b>, каждую пишут отдельно и проверяют. Калькулятор сделаем так же: одна функция — одна операция." },
        { t: "try", code: "def add(a, b):\n    return a + b\n\nprint(add(2, 3))\nprint(add(10, 5))", note: "Одну функцию можно вызывать с разными числами." },
        { t: "h", text: "Часть-проверка" },
        { t: "p", html: "В каждом задании есть строка «<code># --- проверка (не меняй) ---</code>». Строки после неё вызывают твою функцию и выводят результат. Их не меняй: программа выполнит их и проверит твой ответ." },
        { t: "h", text: "Деление на ноль" },
        { t: "p", html: "Настоящая программа учитывает ошибочные случаи. На ноль делить нельзя, поэтому сначала проверяем:" },
        { t: "try", code: "def divide(a, b):\n    if b == 0:\n        return \"Делить на ноль нельзя\"\n    return a / b\n\nprint(divide(10, 4))\nprint(divide(5, 0))" },
        { t: "tip", html: "<code>return</code> сразу завершает функцию. Поэтому если внутри <code>if</code> есть <code>return</code>, после него <code>else</code> писать не нужно." },
        { t: "h", text: "Функция вызывает функцию" },
        { t: "p", html: "Большая функция может пользоваться маленькими. <code>calculate</code> смотрит на знак операции и вызывает <code>add</code>, <code>subtract</code> и другие: всё собирается в одном месте." },
        { t: "warn", html: "При делении результат всегда <code>float</code>: <code>6 / 2</code> даёт <code>3.0</code>. Это не ошибка." },
      ],
    },
    {
      id: "l2", topic: "2", title: "Угадай число: циклы и ограничения", minutes: 5,
      blocks: [
        { t: "p", html: "Правила игры: компьютер загадывает число, игрок угадывает, а компьютер отвечает «мало», «много» или «верно»." },
        { t: "try", code: "def compare(secret, guess):\n    if guess < secret:\n        return \"Мало\"\n    elif guess > secret:\n        return \"Много\"\n    return \"Верно!\"\n\nprint(compare(7, 3))\nprint(compare(7, 9))\nprint(compare(7, 7))" },
        { t: "h", text: "return внутри цикла" },
        { t: "p", html: "Когда ты перебираешь список догадок и находишь верный ответ, дальше крутиться незачем. <code>return</code> сразу завершает функцию (а значит, и цикл)." },
        { t: "try", code: "def search(items, target):\n    for x in items:\n        if x == target:\n            return \"найдено\"\n    return \"нет\"\n\nprint(search([4, 8, 15], 8))\nprint(search([4, 8, 15], 9))" },
        { t: "h", text: "Ограничение: while и and" },
        { t: "p", html: "Если число попыток ограничено, удобен <code>while</code>. Слово <code>and</code> («и») соединяет два условия: цикл идёт, пока верны оба." },
        { t: "try", code: "i = 0\nwhile i < 5 and i < 3:\n    print(i)\n    i = i + 1" },
        { t: "tip", html: "К элементу списка обращаются по номеру: <code>guesses[0]</code> — первая догадка, <code>guesses[attempts]</code> — следующая." },
      ],
    },
    {
      id: "l3", topic: "3", title: "Список задач: список внутри списка", minutes: 5,
      blocks: [
        { t: "p", html: "Элементом списка тоже может быть список. Каждую задачу мы храним как список из двух значений: <code>[название, выполнено ли]</code>." },
        { t: "try", code: "tasks = [[\"Купить хлеб\", False], [\"Спорт\", True]]\nprint(tasks[0])\nprint(tasks[0][0])\nprint(tasks[1][1])", note: "tasks[0][0]: сначала задача номер 0, потом её значение номер 0." },
        { t: "h", text: "Функция меняет список" },
        { t: "p", html: "Если передать функции список, она может изменить сам этот список. <code>append</code> добавляет в конец, а <code>[номер] = значение</code> заменяет элемент на своём месте:" },
        { t: "try", code: "def add_task(tasks, title):\n    tasks.append([title, False])\n\ndef mark_done(tasks, number):\n    tasks[number - 1][1] = True\n\nt = []\nadd_task(t, \"Купить хлеб\")\nadd_task(t, \"Спорт\")\nmark_done(t, 2)\nprint(t)" },
        { t: "warn", html: "Люди считают с 1, а список — с 0. Поэтому если пользователь говорит «задача 2», то в списке это <code>tasks[1]</code>. Всегда пиши <code>number - 1</code>." },
        { t: "h", text: "Число в строку" },
        { t: "p", html: "Чтобы приклеить число к строке, его нужно превратить в строку через <code>str()</code>: <code>\"Номер: \" + str(3)</code>." },
        { t: "tip", html: "Это скелет настоящей программы: данные лежат в списке, а функции добавляют их, меняют и показывают. Всё остальное строится на этом." },
      ],
    },
  ];

  c.reference = [
    { term: "def и return", text: "def создаёт функцию, return возвращает результат и сразу завершает функцию.", code: "def product(a, b):\n    return a * b\n\nprint(product(4, 5))" },
    { term: "and / or", text: "and — должны быть верны оба условия, or — достаточно одного.", code: "x = 5\nprint(x > 3 and x < 10)\nprint(x < 3 or x > 4)" },
    { term: "str()", text: "Превращает число в строку, и её можно склеивать со строками.", code: "print(\"Количество: \" + str(3))" },
    { term: "Список внутри списка", text: "tasks[i][j]: j-е значение i-го элемента.", code: "t = [[\"а\", 1], [\"б\", 2]]\nprint(t[1][0])" },
    { term: "len() и sum()", text: "len даёт количество элементов, sum — сумму чисел.", code: "t = [3, 1, 4]\nprint(len(t), sum(t))" },
  ];
})();
