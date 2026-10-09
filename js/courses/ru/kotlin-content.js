/* Курс Kotlin: задания, бонус, лекции, справочник.
   В примерах кода знак доллара пишется как « € » (чтобы не путать с шаблонами JS), при загрузке он становится « $ ». */
(() => {
  const c = KZ.getCourse("kotlin");
  c.status = "ready";

  const cnt = (s) => s.split("\n").filter((l) => l.trim() && !l.trim().startsWith("//")).length;
  const lv = (o) => Object.assign(o, { par: cnt(o.solution) });
  const num = (res, name) => {
    const v = res.vars[name];
    return v && /^-?\d+$/.test(v.r) ? Number(v.r) : null;
  };
  const MAIN = (body) => "fun main() {\n" + body + "}\n";

  c.levels = [
    /* ---------- 1. Коробки ---------- */
    lv({
      id: "1.1", title: "Две коробки",
      task: "<p>Положи в коробку <b>a</b> число <code>7</code>, а в коробку <b>b</b> число <code>3</code> (с помощью <code>val</code>). Выведи на экран их сумму через <code>println</code>.</p>" +
        "<p class='tip'>В Kotlin программа работает внутри <code>fun main() { … }</code>. Как создать коробку: <code>val a = 7</code> — справа появится коробка «a». Точка с запятой не нужна.</p>",
      hint: "Объяви каждую коробку через val и положи в неё число знаком =. Потом в println(…) сложи две коробки знаком +.",
      starter: MAIN("    // создай коробки a и b\n    // выведи сумму через println\n"),
      solution: MAIN("    val a = 7\n    val b = 3\n    println(a + b)\n"),
      check: { output: "10", vars: { a: "7", b: "3" } },
    }),
    lv({
      id: "1.2", title: "Приветствие",
      task: "<p>Запиши своё имя в коробку <code>val name</code> (в двойных кавычках). Потом выведи на экран приветствие вроде <code>Привет, Алия!</code>, только вместо Алии — твоё имя.</p>" +
        "<p class='tip'>Строки можно склеивать: <code>\"Привет, \" + name + \"!\"</code></p>",
      hint: "Запиши своё имя в двойных кавычках: val name = …. Затем в println(…) склей три части знаком +: приветствие, name и восклицательный знак.",
      starter: MAIN("    // запиши своё имя в name\n    // выведи приветствие\n"),
      solution: MAIN('    val name = "Алия"\n    println("Привет, " + name + "!")\n'),
      check: {
        fn(res) {
          const v = res.vars.name;
          if (!v) return "Коробка «name» не создана.";
          if (v.t !== "String") return "В коробке name должна лежать строка (возьми её в двойные кавычки).";
          if (res.output.trim() !== "Привет, " + v.s + "!") return "На экран должно выводиться «Привет, " + v.s + "!».";
          return null;
        },
      },
    }),
    lv({
      id: "1.3", title: "var: коробка, которая меняется",
      task: "<p>В коробке <code>coins</code> лежит <code>10</code>. Прибавь к ней <code>5</code> и выведи результат: <code>15</code>.</p>" +
        "<p class='tip'>Коробку <code>val</code> потом менять нельзя. Меняющаяся коробка создаётся через <code>var</code>. <code>coins += 5</code> — «прибавь к coins 5».</p>",
      hint: "+= прибавляет число и записывает результат обратно в ту же коробку. Вызывай println после прибавления, иначе выведется старое значение.",
      starter: MAIN("    var coins = 10\n    // прибавь 5\n    // выведи\n"),
      solution: MAIN("    var coins = 10\n    coins += 5\n    println(coins)\n"),
      check: { output: "15", vars: { coins: "15" } },
    }),
    lv({
      id: "1.4", title: "Шаблон строки",
      task: "<p>Выведи на экран ровно такую строку: <code>4 + 6 = 10</code>. Числа лежат в коробках <code>a</code> и <code>b</code>. Вставь коробки внутрь строки с помощью <b>шаблона</b>.</p>" +
        "<p class='tip'>Внутри строки <code>€a</code> — значение коробки, <code>€{a + b}</code> — результат выражения. Например: <code>\"Тебе лет: €age\"</code>.</p>",
      hint: 'println("€a + €b = €{a + b}")',
      starter: MAIN("    val a = 4\n    val b = 6\n    // выведи с помощью шаблона\n"),
      solution: MAIN('    val a = 4\n    val b = 6\n    println("€a + €b = €{a + b}")\n'),
      check: {
        output: "4 + 6 = 10",
        fn(res) {
          return /\$/.test(res.code) ? null : "Используй шаблон строки: внутри кавычек €a и €{a + b}.".replace(/€/g, "$");
        },
      },
    }),

    /* ---------- 2. Типы и null ---------- */
    lv({
      id: "2.1", title: "Целое и дробное",
      task: "<p>Пусть <code>a = 7</code> и <code>b = 2</code>. Сначала выведи <code>a / b</code>, а потом, чтобы получить точное (дробное) частное, выведи <code>a.toDouble() / b</code>.</p>" +
        "<p class='tip'>В Kotlin <code>Int / Int</code> даёт целое число: <code>7 / 2</code> = <b>3</b>. Чтобы получить дробный результат, превратите одно из чисел в <code>Double</code>.</p>",
      hint: "Нужны два println. В первом дели Int на Int, получится целое число. Во втором перед делением примени .toDouble() к одному из чисел.",
      starter: MAIN("    val a = 7\n    val b = 2\n    // выведи оба результата\n"),
      solution: MAIN("    val a = 7\n    val b = 2\n    println(a / b)\n    println(a.toDouble() / b)\n"),
      check: { output: "3\n3.5" },
    }),
    lv({
      id: "2.2", title: "Методы строки",
      task: "<p>В коробке <code>word</code> лежит <code>\"Kotlin\"</code>. Сначала выведи её длину (<code>length</code>), потом её же, но заглавными буквами (<code>uppercase()</code>).</p>",
      hint: "После коробки ставится точка: для длины .length без скобок, для заглавных букв .uppercase() со скобками. Каждое выводи своим println.",
      starter: MAIN('    val word = "Kotlin"\n    // длина\n    // заглавными буквами\n'),
      solution: MAIN('    val word = "Kotlin"\n    println(word.length)\n    println(word.uppercase())\n'),
      check: { output: "6\nKOTLIN" },
    }),
    lv({
      id: "2.3", title: "Из строки в число",
      task: "<p>В коробке <code>text</code> лежит строка <code>\"42\"</code>. Преврати её в число, прибавь <code>8</code> и выведи результат: <code>50</code>.</p>" +
        "<p class='tip'><code>\"42\".toInt()</code> превращает строку в число. Строку и число напрямую складывать нельзя — Kotlin выдаст ошибку.</p>",
      hint: "Текст превращает в число .toInt(). Складывай только после превращения, иначе Kotlin выдаст ошибку. Результат отдай в println.",
      starter: MAIN('    val text = "42"\n    // преврати в число и прибавь 8\n'),
      solution: MAIN('    val text = "42"\n    println(text.toInt() + 8)\n'),
      check: { output: "50" },
    }),
    lv({
      id: "2.4", title: "null и «?»",
      task: "<p>Коробка <code>city</code> сначала пустая (<code>null</code>). 1) Выведи на экран <code>city ?: \"неизвестно\"</code>. 2) Положи в город <code>\"Астана\"</code>. 3) Выведи длину названия города через <code>city?.length</code>. Ожидаемый результат: <code>неизвестно</code> и <code>6</code>.</p>" +
        "<p class='tip'>Знак <code>?</code> в конце типа («<code>String?</code>») разрешает класть в коробку <code>null</code>. <code>?:</code> — «если пусто, возьми вот это». <code>?.</code> — «используй, только если не пусто».</p>",
      hint: "Три шага: в println поставь ?: и текст на случай пустоты; положи в var-коробку новое значение; в конце выведи длину через ?..",
      starter: MAIN("    var city: String? = null\n    // 1) выведи через ?:\n    // 2) city = \"Астана\"\n    // 3) выведи city?.length\n"),
      solution: MAIN('    var city: String? = null\n    println(city ?: "неизвестно")\n    city = "Астана"\n    println(city?.length)\n'),
      check: { output: "неизвестно\n6" },
    }),

    /* ---------- 3. Условия ---------- */
    lv({
      id: "3.1", title: "Взрослый или ребёнок",
      task: "<p>Если возраст в коробке <code>age</code> равен <code>18</code> или больше, выведи на экран <code>взрослый</code>, а иначе — <code>ребёнок</code>. Твой код должен работать правильно и при другом значении <code>age</code>.</p>" +
        "<p class='tip'>В Kotlin <code>if</code> может и возвращать значение: <code>val s = if (x &gt; 5) \"а\" else \"б\"</code>.</p>",
      hint: "Используй конструкцию if (…) { … } else { … }. В условии сравни возраст с границей знаком «больше или равно» (>=), в каждой ветке свой println.",
      starter: MAIN("    val age = 15\n    // напиши if / else\n"),
      solution: MAIN('    val age = 15\n    if (age >= 18) {\n        println("взрослый")\n    } else {\n        println("ребёнок")\n    }\n'),
      check: {
        requireIf: true,
        fn(res) {
          const a = num(res, "age");
          if (a === null) return "В коробке «age» должно лежать целое число.";
          const want = a >= 18 ? "взрослый" : "ребёнок";
          if (res.output.trim() !== want) return "Для age = " + a + " на экран должно выводиться «" + want + "».";
          return null;
        },
      },
    }),
    lv({
      id: "3.2", title: "Выставляем оценку",
      task: "<p>По баллам в коробке <code>score</code> выведи оценку: <code>90</code> и выше — <code>5</code>, от <code>70</code> — <code>4</code>, от <code>50</code> — <code>3</code>, остальное — <code>2</code>.</p>" +
        "<p class='tip'>Несколько условий: <code>if … else if … else</code>. Проверяй сверху вниз.</p>",
      hint: "if (score >= 90) … else if (score >= 70) … else if (score >= 50) … else …",
      starter: MAIN("    val score = 75\n    // выведи оценку\n"),
      solution: MAIN('    val score = 75\n    if (score >= 90) {\n        println(5)\n    } else if (score >= 70) {\n        println(4)\n    } else if (score >= 50) {\n        println(3)\n    } else {\n        println(2)\n    }\n'),
      check: {
        requireIf: true,
        fn(res) {
          const b = num(res, "score");
          if (b === null) return "В коробке «score» должно лежать целое число.";
          const want = b >= 90 ? "5" : b >= 70 ? "4" : b >= 50 ? "3" : "2";
          if (res.output.trim() !== want) return "Для score = " + b + " оценка должна быть " + want + ".";
          return null;
        },
      },
    }),
    lv({
      id: "3.3", title: "when: день недели",
      task: "<p>В коробке <code>day</code> лежит номер дня недели (1–7). С помощью <code>when</code> выведи название дня: 1 — <code>понедельник</code>, 2 — <code>вторник</code>, 3 — <code>среда</code>, 4 — <code>четверг</code>, 5 — <code>пятница</code>, 6 — <code>суббота</code>, 7 — <code>воскресенье</code>. Если число другое — <code>неизвестно</code>.</p>" +
        "<p class='tip'><code>when (x) { 1 -&gt; … ; 2 -&gt; … ; else -&gt; … }</code> — выбор из многих вариантов. Он намного короче цепочки <code>if/else if</code>.</p>",
      hint: 'when (day) { 1 -> println("понедельник") … else -> println("неизвестно") }',
      starter: MAIN("    val day = 3\n    // выведи название дня через when\n"),
      solution: MAIN('    val day = 3\n    when (day) {\n        1 -> println("понедельник")\n        2 -> println("вторник")\n        3 -> println("среда")\n        4 -> println("четверг")\n        5 -> println("пятница")\n        6 -> println("суббота")\n        7 -> println("воскресенье")\n        else -> println("неизвестно")\n    }\n'),
      check: {
        fn(res) {
          const d = num(res, "day");
          if (d === null) return "В коробке «day» должно лежать целое число.";
          if (!/when\s*[({]/.test(res.code)) return "В этом задании нужно использовать when.";
          const names = ["понедельник", "вторник", "среда", "четверг", "пятница", "суббота", "воскресенье"];
          const want = names[d - 1] || "неизвестно";
          if (res.output.trim() !== want) return "Для day = " + d + " на экран должно выводиться «" + want + "».";
          return null;
        },
      },
    }),
    lv({
      id: "3.4", title: "В диапазоне ли",
      task: "<p>Если число <code>n</code> от <code>10</code> до <code>20</code> (включая оба края), выведи на экран <code>внутри</code>, а иначе — <code>снаружи</code>. Твой код должен работать и при другом значении <code>n</code>.</p>" +
        "<p class='tip'><code>10..20</code> — числа от 10 до 20. <code>n in 10..20</code> — «n входит в этот диапазон?». Это короче, чем <code>n &gt;= 10 &amp;&amp; n &lt;= 20</code>.</p>",
      hint: "Поставь проверку in в скобки if: если число в диапазоне, выводится одно слово, иначе в ветке else другое. .. включает оба края.",
      starter: MAIN("    val n = 15\n    // используй in 10..20\n"),
      solution: MAIN('    val n = 15\n    if (n in 10..20) {\n        println("внутри")\n    } else {\n        println("снаружи")\n    }\n'),
      check: {
        requireIf: true,
        fn(res) {
          const n = num(res, "n");
          if (n === null) return "В коробке «n» должно лежать целое число.";
          const want = n >= 10 && n <= 20 ? "внутри" : "снаружи";
          if (res.output.trim() !== want) return "Для n = " + n + " на экран должно выводиться «" + want + "».";
          return null;
        },
      },
    }),

    /* ---------- 4. Циклы ---------- */
    lv({
      id: "4.1", title: "От одного до пяти",
      task: "<p>С помощью цикла <code>for</code> выведи числа от <code>1</code> до <code>5</code> (каждое с новой строки).</p>" +
        "<p class='tip'><code>for (i in 1..5) { … }</code> — коробка <code>i</code> по очереди принимает значения 1, 2, 3, 4, 5. Посмотри на панель цикла справа!</p>",
      hint: "В теле цикла хватит одной команды, которая выводит i: на каждом круге он получает новое значение. Диапазон задай через .. из первого и последнего числа.",
      starter: MAIN("    // напиши цикл for\n"),
      solution: MAIN("    for (i in 1..5) {\n        println(i)\n    }\n"),
      check: { output: "1\n2\n3\n4\n5", requireFor: true },
    }),
    lv({
      id: "4.2", title: "Сумма до ста",
      task: "<p>Найди сумму всех чисел от 1 до 100: собери её в коробке <code>total</code> и в конце выведи. Ответ: <code>5050</code>.</p>" +
        "<p class='tip'>Сначала <code>var total = 0</code>, а внутри цикла <code>total += i</code>.</p>",
      hint: "total — копилка: цикл на каждом круге добавляет в неё i. Поставь println после цикла, вне скобок, один раз, иначе выведется много строк.",
      starter: MAIN("    var total = 0\n    // складывай в цикле\n    // выведи\n"),
      solution: MAIN("    var total = 0\n    for (i in 1..100) {\n        total += i\n    }\n    println(total)\n"),
      check: { output: "5050", vars: { total: "5050" }, requireFor: true },
    }),
    lv({
      id: "4.3", title: "Обратный отсчёт",
      task: "<p>Выведи такие числа: <code>10</code>, <code>8</code>, <code>6</code>, <code>4</code>, <code>2</code> (каждое с новой строки). Цикл должен идти в обратную сторону и прыгать через одно.</p>" +
        "<p class='tip'><code>10 downTo 2</code> — обратный отсчёт, <code>step 2</code> — шаг 2. Вместе: <code>for (i in 10 downTo 2 step 2)</code>.</p>",
      hint: "downTo и step — два слова, которые дописываются к диапазону. Большее число пиши первым, а после step укажи размер прыжка.",
      starter: MAIN("    // downTo и step\n"),
      solution: MAIN("    for (i in 10 downTo 2 step 2) {\n        println(i)\n    }\n"),
      check: { output: "10\n8\n6\n4\n2", requireFor: true },
    }),
    lv({
      id: "4.4", title: "Удвоение",
      task: "<p>Коробка <code>n</code> начинается с <code>1</code>. В цикле <code>while</code> умножай <code>n</code> на два, пока <code>n</code> не достигнет <b>100</b> или не станет больше. В конце выведи <code>n</code>: <code>128</code>.</p>" +
        "<p class='tip'><code>while (условие) { … }</code> повторяет, пока условие истинно. <code>n *= 2</code> — умножить n на два.</p>",
      hint: "Условие while значит «повторяй, пока…», поэтому оно должно быть истинно, пока n ещё не дорос до границы (<). После цикла выведи n один раз.",
      starter: MAIN("    var n = 1\n    // напиши цикл while\n    // выведи n\n"),
      solution: MAIN("    var n = 1\n    while (n < 100) {\n        n *= 2\n    }\n    println(n)\n"),
      check: { output: "128", vars: { n: "128" }, requireWhile: true },
    }),

    /* ---------- 5. Функции ---------- */
    lv({
      id: "5.1", title: "Функция квадрата",
      task: "<p>Напиши функцию <code>square</code>: она берёт число <code>Int</code> и возвращает его квадрат. В <code>main</code> уже вызывается <code>square(7)</code> — на экране должно быть <code>49</code>.</p>" +
        "<p class='tip'>Функция: <code>fun имя(параметр: Тип): ТипРезультата { return … }</code>. Версия в одну строку: <code>fun square(x: Int): Int = x * x</code>.</p>",
      hint: "В функции укажи имя параметра и его тип, а после скобок тип результата. В теле через return верни число, умноженное само на себя.",
      starter: "// напиши функцию square здесь\n\nfun main() {\n    println(square(7))\n}\n",
      solution: "fun square(x: Int): Int {\n    return x * x\n}\n\nfun main() {\n    println(square(7))\n}\n",
      check: { output: "49", requireDef: true },
    }),
    lv({
      id: "5.2", title: "Значение по умолчанию",
      task: "<p>Напиши функцию <code>greet</code> с двумя параметрами — <code>name</code> и <code>greeting</code> (значение по умолчанию <code>\"Привет\"</code>). Она возвращает строку вида <code>Привет, Аян!</code>. <code>main</code> вызывает её два раза.</p>" +
        "<p class='tip'>Значение по умолчанию: <code>fun f(a: Int, b: Int = 10)</code>. Если при вызове не написать второй аргумент, возьмётся 10.</p>",
      hint: "После типа второго параметра поставь = и значение по умолчанию. Значение коробки внутрь текста вставляется знаком $. Функция возвращает String.",
      starter: "// напиши функцию greet\n\nfun main() {\n    println(greet(\"Аян\"))\n    println(greet(\"Дана\", \"Доброе утро\"))\n}\n",
      solution: 'fun greet(name: String, greeting: String = "Привет"): String {\n    return "€greeting, €name!"\n}\n\nfun main() {\n    println(greet("Аян"))\n    println(greet("Дана", "Доброе утро"))\n}\n',
      check: { output: "Привет, Аян!\nДоброе утро, Дана!", requireDef: true },
    }),
    lv({
      id: "5.3", title: "Факториал",
      task: "<p>Напиши функцию <code>fact(n)</code>: она возвращает факториал числа <code>n</code> (1 · 2 · … · n). Функция может <b>вызывать сама себя</b> (рекурсия). <code>fact(1)</code> = 1. <code>main</code> выводит два результата: <code>120</code> и <code>720</code>.</p>" +
        "<p class='tip'>Формула: <code>fact(n) = n * fact(n - 1)</code>, а когда <code>n</code> равно 1, остановись.</p>",
      hint: "if (n <= 1) return 1 else return n * fact(n - 1)",
      starter: "// напиши функцию fact\n\nfun main() {\n    println(fact(5))\n    println(fact(6))\n}\n",
      solution: "fun fact(n: Int): Int {\n    if (n <= 1) {\n        return 1\n    }\n    return n * fact(n - 1)\n}\n\nfun main() {\n    println(fact(5))\n    println(fact(6))\n}\n",
      check: { output: "120\n720", requireDef: true },
    }),
    lv({
      id: "5.4", title: "Чётные числа",
      task: "<p>Напиши функцию <code>isEven(n)</code>: если число чётное, она возвращает <code>true</code>. Потом в <code>main</code> выведи из чисел от <code>1</code> до <code>6</code> только чётные: <code>2</code>, <code>4</code>, <code>6</code>.</p>" +
        "<p class='tip'>Чётность: <code>n % 2 == 0</code>. Функция возвращает <code>Boolean</code>.</p>",
      hint: "Два отдельных дела: функция, возвращающая Boolean (проверь остаток через %), и цикл for. Внутри цикла вызови функцию в if и выводи только подходящие числа.",
      starter: "// напиши функцию isEven\n\nfun main() {\n    // выведи чётные числа из 1..6\n}\n",
      solution: "fun isEven(n: Int): Boolean {\n    return n % 2 == 0\n}\n\nfun main() {\n    for (i in 1..6) {\n        if (isEven(i)) {\n            println(i)\n        }\n    }\n}\n",
      check: { output: "2\n4\n6", requireDef: true, requireFor: true },
    }),

    /* ---------- 6. Коллекции ---------- */
    lv({
      id: "6.1", title: "Список фруктов",
      task: "<p>Создай список <code>fruits</code>: <code>\"яблоко\"</code>, <code>\"груша\"</code>, <code>\"абрикос\"</code>. Выведи размер списка (<code>size</code>) и его второй элемент (индекс <b>1</b>). Ожидаемый результат: <code>3</code> и <code>груша</code>.</p>" +
        "<p class='tip'><code>listOf(…)</code> — неизменяемый список. Номера элементов начинаются с 0: <code>fruits[0]</code> — первый.</p>",
      hint: "Перечисли элементы в listOf(…) через запятую (тексты в кавычках). Размер даёт .size, а элемент берётся номером в [ ]; нумерация идёт с 0.",
      starter: MAIN("    // создай список fruits\n    // выведи size и fruits[1]\n"),
      solution: MAIN('    val fruits = listOf("яблоко", "груша", "абрикос")\n    println(fruits.size)\n    println(fruits[1])\n'),
      check: { output: "3\nгруша", vars: { fruits: '["яблоко", "груша", "абрикос"]' }, requireList: true },
    }),
    lv({
      id: "6.2", title: "Добавляем в список",
      task: "<p><code>nums</code> — изменяемый список (<code>mutableListOf</code>), в котором сначала лежат <code>1, 2, 3</code>. Добавь в него <code>4</code> и <code>5</code>, а потом выведи сумму всех чисел (<code>sum()</code>): <code>15</code>.</p>" +
        "<p class='tip'>Список <code>listOf</code> изменить нельзя, а в <code>mutableListOf</code> можно добавлять через <code>add(…)</code>.</p>",
      hint: ".add(…) добавляет в mutableListOf по одному элементу, так что вызови его дважды. В конце отдай результат .sum() в println.",
      starter: MAIN("    val nums = mutableListOf(1, 2, 3)\n    // добавь 4 и 5\n    // выведи сумму\n"),
      solution: MAIN("    val nums = mutableListOf(1, 2, 3)\n    nums.add(4)\n    nums.add(5)\n    println(nums.sum())\n"),
      check: { output: "15", vars: { nums: "[1, 2, 3, 4, 5]" } },
    }),
    lv({
      id: "6.3", title: "filter и map",
      task: "<p>В списке <code>nums</code> лежат числа от <code>1</code> до <code>6</code>. Создай новый список <code>result</code>: оставь только <b>чётные</b> числа (<code>filter</code>) и <b>возведи каждое в квадрат</b> (<code>map</code>). Выведи результат: <code>[4, 16, 36]</code>.</p>" +
        "<p class='tip'><b>Лямбда</b> — короткая безымянная функция: <code>{ it % 2 == 0 }</code>, где <code>it</code> — текущий элемент. <code>list.filter { … }.map { … }</code> можно выстраивать цепочкой.</p>",
      hint: "val result = nums.filter { it % 2 == 0 }.map { it * it }",
      starter: MAIN("    val nums = listOf(1, 2, 3, 4, 5, 6)\n    // создай список result\n    // выведи\n"),
      solution: MAIN("    val nums = listOf(1, 2, 3, 4, 5, 6)\n    val result = nums.filter { it % 2 == 0 }.map { it * it }\n    println(result)\n"),
      check: { output: "[4, 16, 36]", vars: { result: "[4, 16, 36]" } },
    }),
    lv({
      id: "6.4", title: "Таблица возрастов (Map)",
      task: "<p><code>ages</code> — это Map: <code>\"Аян\"</code> → <code>12</code>, <code>\"Дана\"</code> → <code>11</code>. В цикле выведи каждую пару в виде <code>Аян: 12</code>.</p>" +
        "<p class='tip'><code>mapOf(\"а\" to 1, \"б\" to 2)</code> — пары «ключ — значение». В цикле пару можно разобрать на части: <code>for ((name, age) in ages)</code>.</p>",
      hint: "В скобках цикла раздели пару на два имени: for ((…, …) in ages). В теле собери обе части в одну строку с помощью шаблона $ внутри текста.",
      starter: MAIN('    val ages = mapOf("Аян" to 12, "Дана" to 11)\n    // выведи в цикле\n'),
      solution: MAIN('    val ages = mapOf("Аян" to 12, "Дана" to 11)\n    for ((name, age) in ages) {\n        println("€name: €age")\n    }\n'),
      check: { output: "Аян: 12\nДана: 11", requireFor: true },
    }),

    /* ---------- 7. Классы ---------- */
    lv({
      id: "7.1", title: "Класс кошки",
      task: "<p>Создай класс <code>Cat</code>: у него есть свойство <code>name</code> (строка) и функция <code>meow()</code>, которая выводит <code>Мурка: Мяу!</code> (имя и «Мяу!»). <code>main</code> уже готов.</p>" +
        "<p class='tip'>Класс — шаблон объекта: <code>class Dog(val name: String) { fun bark() { println(\"Гав\") } }</code>. Создать объект: <code>Dog(\"Шарик\")</code>.</p>",
      hint: "В скобках class Cat(…) объяви имя через val, а внутри { } напиши fun meow(). Шаблон $name в тексте подставит значение свойства.",
      starter: '// напиши класс Cat здесь\n\nfun main() {\n    val cat = Cat("Мурка")\n    cat.meow()\n}\n',
      solution: 'class Cat(val name: String) {\n    fun meow() {\n        println("€name: Мяу!")\n    }\n}\n\nfun main() {\n    val cat = Cat("Мурка")\n    cat.meow()\n}\n',
      check: { output: "Мурка: Мяу!" },
    }),
    lv({
      id: "7.2", title: "Счётчик",
      task: "<p>Создай класс <code>Counter</code>: внутри него свойство <code>var count = 0</code> и функция <code>inc()</code>, которая увеличивает число на 1. <code>main</code> вызывает её три раза, а потом выводится <code>count</code>: <code>3</code>.</p>" +
        "<p class='tip'>Класс запоминает свои свойства. Внутри функции свойство пишется напрямую: <code>count++</code>.</p>",
      hint: "В теле класса объяви var-свойство с начальным значением, а в inc() увеличь его через ++. Объект запоминает число между вызовами.",
      starter: "// напиши класс Counter\n\nfun main() {\n    val c = Counter()\n    c.inc()\n    c.inc()\n    c.inc()\n    println(c.count)\n}\n",
      solution: "class Counter {\n    var count = 0\n    fun inc() {\n        count++\n    }\n}\n\nfun main() {\n    val c = Counter()\n    c.inc()\n    c.inc()\n    c.inc()\n    println(c.count)\n}\n",
      check: { output: "3" },
    }),
    lv({
      id: "7.3", title: "data class",
      task: "<p>Создай класс данных <code>Point</code>: два целых числа — <code>x</code> и <code>y</code>. В <code>main</code> создай <code>p = Point(1, 2)</code>, сделай его копию с заменой <code>y</code> на 5 (<code>copy</code>) и выведи обе. Ожидаемый результат: <code>Point(x=1, y=2)</code> и <code>Point(x=1, y=5)</code>.</p>" +
        "<p class='tip'><code>data class</code> сам превращается в красивый текст (<code>toString</code>), сравнивается и копируется: <code>p.copy(y = 5)</code>.</p>",
      hint: "В скобках data class опиши два свойства с val и типом, тело не нужно. В copy(…) назови только то свойство, которое меняешь, остальные сохранятся.",
      starter: "// напиши класс Point\n\nfun main() {\n    // создай p, q = p.copy(y = 5)\n    // выведи обе\n}\n",
      solution: "data class Point(val x: Int, val y: Int)\n\nfun main() {\n    val p = Point(1, 2)\n    val q = p.copy(y = 5)\n    println(p)\n    println(q)\n}\n",
      check: {
        output: "Point(x=1, y=2)\nPoint(x=1, y=5)",
        fn(res) {
          return /data\s+class/.test(res.code) ? null : "В этом задании нужно использовать data class.";
        },
      },
    }),
    lv({
      id: "7.4", title: "Светофор (enum)",
      task: "<p>Enum <code>Light</code> уже готов. Напиши функцию <code>action(l: Light)</code>: для <code>RED</code> она возвращает строку <code>стой</code>, для <code>YELLOW</code> — <code>жди</code>, для <code>GREEN</code> — <code>иди</code>. Используй <code>when</code>.</p>" +
        "<p class='tip'><code>enum class</code> — заранее заданный список значений. <code>when</code> отлично с ним работает: <code>Light.RED -&gt; \"стой\"</code>.</p>",
      hint: 'fun action(l: Light): String = when (l) { Light.RED -> "стой"; … }',
      starter: "enum class Light { RED, YELLOW, GREEN }\n\n// напиши функцию action\n\nfun main() {\n    println(action(Light.RED))\n    println(action(Light.YELLOW))\n    println(action(Light.GREEN))\n}\n",
      solution: 'enum class Light { RED, YELLOW, GREEN }\n\nfun action(l: Light): String {\n    return when (l) {\n        Light.RED -> "стой"\n        Light.YELLOW -> "жди"\n        Light.GREEN -> "иди"\n    }\n}\n\nfun main() {\n    println(action(Light.RED))\n    println(action(Light.YELLOW))\n    println(action(Light.GREEN))\n}\n',
      check: { output: "стой\nжди\nиди", requireDef: true },
    }),
    lv({
      id: "7.5", title: "Наследование: животные",
      task: "<p>Класс <code>Animal</code> и его потомок <code>Dog</code> уже готовы (у них есть функция звука <code>sound()</code>). Переопредели (<code>override</code>) функцию <code>sound()</code> у <code>Dog</code> так, чтобы она возвращала <code>Гав!</code>. Звук у <code>Animal</code> — <code>...</code>. <code>main</code> выводит оба.</p>" +
        "<p class='tip'>В Kotlin классы по умолчанию закрыты. Класс, от которого можно наследоваться, пишется с <code>open</code>, и функция, которую можно менять, тоже <code>open</code>. Дочерний класс переопределяет её через <code>override</code>.</p>",
      hint: 'class Dog(name: String) : Animal(name) { override fun sound() = "Гав!" }',
      starter: 'open class Animal(val name: String) {\n    open fun sound(): String = "..."\n}\n\n// напиши класс Dog: он наследуется от Animal\n\nfun main() {\n    val a = Animal("Неизвестный")\n    val d = Dog("Шарик")\n    println(a.sound())\n    println(d.name + ": " + d.sound())\n}\n',
      solution: 'open class Animal(val name: String) {\n    open fun sound(): String = "..."\n}\n\nclass Dog(name: String) : Animal(name) {\n    override fun sound(): String = "Гав!"\n}\n\nfun main() {\n    val a = Animal("Неизвестный")\n    val d = Dog("Шарик")\n    println(a.sound())\n    println(d.name + ": " + d.sound())\n}\n',
      check: { output: "...\nШарик: Гав!" },
    }),
  ];

  /* ---------- Бонус ---------- */
  c.bonus = [
    lv({
      id: "B1", title: "FizzBuzz",
      task: "<p>Сосчитай от 1 до 15. Вместо чисел, которые делятся на 3, выведи <code>Fizz</code>, вместо делящихся на 5 — <code>Buzz</code>, а вместо делящихся на оба числа — <code>FizzBuzz</code>. Остальные числа выведи как есть.</p>",
      hint: "Сначала проверь деление на 15 (FizzBuzz), потом на 3, потом на 5. Удобно использовать when { … }.",
      starter: MAIN("    // 1..15\n"),
      solution: MAIN('    for (i in 1..15) {\n        when {\n            i % 15 == 0 -> println("FizzBuzz")\n            i % 3 == 0 -> println("Fizz")\n            i % 5 == 0 -> println("Buzz")\n            else -> println(i)\n        }\n    }\n'),
      check: { output: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz", requireFor: true },
    }),
    lv({
      id: "B2", title: "Палиндром",
      task: "<p>Напиши функцию <code>isPalindrome(s: String): Boolean</code>: если слово читается одинаково с обеих сторон (например, <code>\"level\"</code>), она возвращает <code>true</code>. <code>main</code> проверяет два слова: должны вывестись <code>true</code> и <code>false</code>.</p>" +
        "<p class='tip'><code>s.reversed()</code> переворачивает строку.</p>",
      hint: "return s == s.reversed()",
      starter: "// напиши функцию isPalindrome\n\nfun main() {\n    println(isPalindrome(\"level\"))\n    println(isPalindrome(\"kotlin\"))\n}\n",
      solution: "fun isPalindrome(s: String): Boolean {\n    return s == s.reversed()\n}\n\nfun main() {\n    println(isPalindrome(\"level\"))\n    println(isPalindrome(\"kotlin\"))\n}\n",
      check: { output: "true\nfalse", requireDef: true },
    }),
    lv({
      id: "B3", title: "Статистика списка",
      task: "<p>Выведи из списка <code>scores</code> наибольшее, наименьшее и среднее значения (три строки). Список: <code>8, 5, 9, 6</code>. Ожидаемый результат: <code>9</code>, <code>5</code>, <code>7.0</code>.</p>" +
        "<p class='tip'><code>max()</code>, <code>min()</code>, <code>average()</code> — готовые методы списка.</p>",
      hint: "Вызови у списка через точку три готовых метода: для наибольшего, наименьшего и среднего (названия в задании). Каждый выводи своим println.",
      starter: MAIN("    val scores = listOf(8, 5, 9, 6)\n    // max, min, average\n"),
      solution: MAIN("    val scores = listOf(8, 5, 9, 6)\n    println(scores.max())\n    println(scores.min())\n    println(scores.average())\n"),
      check: { output: "9\n5\n7.0" },
    }),
  ];

  /* ---------- Лекции ---------- */
  c.lectures = [
    {
      id: "l1", topic: "1", title: "Первая программа", minutes: 3,
      blocks: [
        { t: "p", html: "Kotlin — основной язык для создания Android-приложений, но его используют и на серверах. Его создала компания <b>JetBrains</b>. Язык короткий, понятный и ловит ошибки пораньше." },
        { t: "p", html: "Каждая программа на Kotlin начинается с функции <code>main</code>. Вывести на экран можно через <code>println</code>:" },
        { t: "try", code: 'fun main() {\n    println("Привет, мир!")\n}', note: "Запусти. Кнопкой «⏭ Шаг» выполняй строки по одной." },
        { t: "p", html: "Информацию мы храним в <b>коробках</b> (переменных). Они бывают двух видов:" },
        { t: "list", items: ["<code>val</code> — неизменяемая коробка (значение задаётся один раз)", "<code>var</code> — изменяемая коробка", "Текст пишут в двойных кавычках: <code>\"Алия\"</code>, а число — без кавычек: <code>5</code>"] },
        { t: "try", code: "fun main() {\n    val name = \"Алия\"\n    var age = 12\n    age = age + 1\n    println(name)\n    println(age)\n}" },
        { t: "warn", html: "В коробку <code>val</code> нельзя положить значение второй раз — Kotlin покажет ошибку. По возможности используй <code>val</code>: программа будет надёжнее." },
        { t: "h", text: "Шаблон строки" },
        { t: "p", html: "Коробку можно вставить прямо в строку с помощью знака <code>€</code>. Выражение пиши внутри <code>€{ … }</code>:" },
        { t: "try", code: 'fun main() {\n    val a = 4\n    val b = 6\n    println("€a + €b = €{a + b}")\n}' },
        { t: "tip", html: "В Kotlin точку с запятой <code>;</code> в конце строки ставить необязательно. Отступ (пробелы) нужен для удобства чтения, обычно берут 4 пробела." },
      ],
    },
    {
      id: "l2", topic: "2", title: "Типы и null", minutes: 4,
      blocks: [
        { t: "p", html: "В Kotlin у каждой коробки есть определённый <b>тип</b>. Тип показывает, что лежит в коробке. Основные типы:" },
        { t: "list", items: ["<code>Int</code> — целое число (5, -3)", "<code>Double</code> — дробное число (3.14)", "<code>String</code> — строка (\"привет\")", "<code>Boolean</code> — <code>true</code> или <code>false</code>", "<code>Char</code> — один символ ('a')"] },
        { t: "try", code: 'fun main() {\n    val a: Int = 7\n    val b: Double = 2.5\n    val s: String = "Kotlin"\n    println(a)\n    println(b)\n    println(s)\n}', note: "У коробок справа показан тип." },
        { t: "p", html: "Тип обычно определяется сам, его можно не писать. Но тип строгий: в коробку <code>Int</code> нельзя положить строку." },
        { t: "warn", html: "Результат <code>7 / 2</code> равен <b>3</b> (целочисленное деление). Для дробного результата: <code>7.0 / 2</code> или <code>7.toDouble() / 2</code>." },
        { t: "try", code: "fun main() {\n    println(7 / 2)\n    println(7.0 / 2)\n    println(7 % 2)\n}" },
        { t: "h", text: "Методы строки" },
        { t: "try", code: 'fun main() {\n    val s = "Kotlin"\n    println(s.length)\n    println(s.uppercase())\n    println(s.reversed())\n    println(s[0])\n}' },
        { t: "h", text: "null: «значения нет»" },
        { t: "p", html: "Во многих языках пустое значение (<code>null</code>) роняет программу. Kotlin защищает от этого: если коробка может принимать <code>null</code>, к её типу нужно добавить <code>?</code>." },
        { t: "try", code: 'fun main() {\n    var city: String? = null\n    println(city ?: "неизвестно")\n    city = "Астана"\n    println(city?.length)\n}', note: "<code>?:</code> — если пусто, возьми вот это. <code>?.</code> — используй, только если не пусто." },
      ],
    },
    {
      id: "l3", topic: "3", title: "if и when", minutes: 4,
      blocks: [
        { t: "p", html: "В зависимости от условия программа может идти разными путями:" },
        { t: "try", code: 'fun main() {\n    val x = 7\n    if (x > 5) {\n        println("большое")\n    } else {\n        println("маленькое")\n    }\n}', note: "⏭ «Шаг»: смотри, в какую ветку заходит программа." },
        { t: "h", text: "Знаки сравнения" },
        { t: "list", items: ["<code>==</code> равно, <code>!=</code> не равно", "<code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>, <code>&gt;=</code>", "<code>&amp;&amp;</code> «и», <code>||</code> «или», <code>!</code> «не»", "<code>x in 1..10</code> — входит ли x в этот диапазон"] },
        { t: "warn", html: "Один знак равенства <code>=</code> — «положи», два знака <code>==</code> — «равно ли?»." },
        { t: "h", text: "if возвращает значение" },
        { t: "try", code: 'fun main() {\n    val age = 20\n    val status = if (age >= 18) "взрослый" else "ребёнок"\n    println(status)\n}' },
        { t: "h", text: "when — выбор из многих вариантов" },
        { t: "p", html: "Когда вариантов несколько, удобен <code>when</code> (как <code>switch</code> в других языках, но мощнее):" },
        { t: "try", code: 'fun main() {\n    val score = 75\n    when {\n        score >= 90 -> println("Отлично")\n        score >= 50 -> println("Хорошо")\n        else -> println("Попробуй ещё")\n    }\n}' },
        { t: "tip", html: "Можно писать и с конкретными значениями: <code>when (x) { 1 -&gt; … ; in 2..5 -&gt; … ; else -&gt; … }</code>." },
      ],
    },
    {
      id: "l4", topic: "4", title: "Циклы", minutes: 4,
      blocks: [
        { t: "p", html: "Чтобы повторить действие много раз, используют цикл. Чаще всего встречается <code>for</code>:" },
        { t: "try", code: "fun main() {\n    for (i in 1..5) {\n        println(i)\n    }\n}", note: "Справа появится панель цикла: она показывает, какой сейчас круг." },
        { t: "h", text: "Диапазоны" },
        { t: "list", items: ["<code>1..5</code> — 1, 2, 3, 4, 5", "<code>1 until 5</code> — 1, 2, 3, 4 (5 не входит)", "<code>5 downTo 1</code> — обратный отсчёт", "<code>1..10 step 3</code> — 1, 4, 7, 10"] },
        { t: "try", code: "fun main() {\n    for (i in 10 downTo 2 step 2) {\n        println(i)\n    }\n}" },
        { t: "h", text: "Собираем сумму" },
        { t: "try", code: "fun main() {\n    var total = 0\n    for (i in 1..10) {\n        total += i\n    }\n    println(total)\n}", note: "⏭ С помощью «Шаг» смотри, как растёт коробка total." },
        { t: "h", text: "while" },
        { t: "p", html: "Если неизвестно, сколько раз нужно повторять, используем <code>while</code>: он идёт, пока условие истинно." },
        { t: "try", code: "fun main() {\n    var n = 1\n    while (n < 100) {\n        n *= 2\n    }\n    println(n)\n}" },
        { t: "warn", html: "Если условие никогда не станет ложным, цикл будет идти бесконечно. Не забывай менять коробку!" },
        { t: "tip", html: "<code>break</code> — выйти из цикла, <code>continue</code> — перейти к следующему кругу." },
      ],
    },
    {
      id: "l5", topic: "5", title: "Функции", minutes: 4,
      blocks: [
        { t: "p", html: "Функция — часть кода, у которой есть имя. Её можно написать один раз и вызывать много раз." },
        { t: "try", code: "fun square(x: Int): Int {\n    return x * x\n}\n\nfun main() {\n    println(square(5))\n    println(square(9))\n}", note: "⏭ «Шаг» покажет, как программа заходит внутрь функции и возвращается обратно." },
        { t: "list", items: ["<code>fun</code> — создать функцию", "<code>(x: Int)</code> — параметр: имя и тип", "<code>: Int</code> — тип возвращаемого значения", "<code>return</code> — возвращает результат"] },
        { t: "h", text: "Короткая запись" },
        { t: "try", code: "fun add(a: Int, b: Int) = a + b\n\nfun main() {\n    println(add(2, 3))\n}" },
        { t: "h", text: "Значение по умолчанию и именованные аргументы" },
        { t: "try", code: 'fun greet(name: String, greeting: String = "Привет") = "€greeting, €name!"\n\nfun main() {\n    println(greet("Аян"))\n    println(greet(name = "Дана", greeting = "Доброе утро"))\n}' },
        { t: "h", text: "Рекурсия" },
        { t: "p", html: "Функция может вызывать сама себя. Только должен быть случай, когда она останавливается (<b>база</b>):" },
        { t: "try", code: "fun fact(n: Int): Int {\n    if (n <= 1) return 1\n    return n * fact(n - 1)\n}\n\nfun main() {\n    println(fact(5))\n}" },
        { t: "warn", html: "Рекурсия без условия остановки уходит в бесконечность и вызывает ошибку <code>StackOverflowError</code>." },
      ],
    },
    {
      id: "l6", topic: "6", title: "Списки, Map, лямбда", minutes: 5,
      blocks: [
        { t: "p", html: "Чтобы хранить много значений в одном месте, нужны <b>коллекции</b>. Чаще всего используют список (<code>List</code>)." },
        { t: "try", code: 'fun main() {\n    val fruits = listOf("яблоко", "груша", "абрикос")\n    println(fruits.size)\n    println(fruits[0])\n    for (f in fruits) {\n        println(f)\n    }\n}', note: "Номера элементов начинаются с 0." },
        { t: "list", items: ["<code>listOf(…)</code> — неизменяемый список", "<code>mutableListOf(…)</code> — меняется через <code>add</code>, <code>remove</code>", "<code>mapOf(\"а\" to 1)</code> — пары «ключ → значение»", "<code>setOf(…)</code> — значения без повторов"] },
        { t: "try", code: "fun main() {\n    val nums = mutableListOf(1, 2, 3)\n    nums.add(4)\n    println(nums)\n    println(nums.sum())\n}" },
        { t: "h", text: "Лямбда: короткая функция" },
        { t: "p", html: "Для обработки списков есть мощные методы. Им передают <b>лямбду</b> — короткую функцию внутри <code>{ … }</code>. Текущий элемент называется <code>it</code>:" },
        { t: "try", code: "fun main() {\n    val nums = listOf(1, 2, 3, 4, 5, 6)\n    println(nums.filter { it % 2 == 0 })\n    println(nums.map { it * it })\n    println(nums.filter { it > 2 }.map { it * 10 })\n}" },
        { t: "list", items: ["<code>filter { … }</code> — оставляет только подходящие под условие", "<code>map { … }</code> — меняет каждый элемент и создаёт новый список", "<code>sum()</code>, <code>max()</code>, <code>min()</code>, <code>average()</code>", "<code>any { … }</code>, <code>all { … }</code>, <code>count { … }</code>"] },
        { t: "h", text: "Map" },
        { t: "try", code: 'fun main() {\n    val ages = mapOf("Аян" to 12, "Дана" to 11)\n    println(ages["Аян"])\n    for ((name, age) in ages) {\n        println("€name: €age")\n    }\n}' },
      ],
    },
    {
      id: "l7", topic: "7", title: "Классы", minutes: 5,
      blocks: [
        { t: "p", html: "Класс — шаблон объекта. Он собирает данные (<b>свойства</b>) и действия (<b>функции</b>) в одном месте." },
        { t: "try", code: 'class Dog(val name: String) {\n    fun bark() {\n        println("€name: Гав!")\n    }\n}\n\nfun main() {\n    val d = Dog("Шарик")\n    d.bark()\n    println(d.name)\n}', note: "Посмотри на коробку «d» справа: внутри неё лежит объект." },
        { t: "h", text: "data class" },
        { t: "p", html: "Если класс только хранит данные, добавь к нему <code>data</code>: он сам превращается в красивый текст, сравнивается и копируется." },
        { t: "try", code: "data class Point(val x: Int, val y: Int)\n\nfun main() {\n    val p = Point(1, 2)\n    println(p)\n    println(p.copy(y = 9))\n    println(p == Point(1, 2))\n}" },
        { t: "h", text: "enum class" },
        { t: "p", html: "Список значений, известных заранее:" },
        { t: "try", code: 'enum class Light { RED, YELLOW, GREEN }\n\nfun main() {\n    val l = Light.GREEN\n    val s = when (l) {\n        Light.RED -> "стой"\n        Light.YELLOW -> "жди"\n        Light.GREEN -> "иди"\n    }\n    println(s)\n}' },
        { t: "h", text: "Наследование" },
        { t: "p", html: "Один класс может унаследовать свойства другого. В Kotlin, чтобы разрешить наследование, нужно написать <code>open</code>:" },
        { t: "try", code: 'open class Animal(val name: String) {\n    open fun sound(): String = "..."\n}\n\nclass Cat(name: String) : Animal(name) {\n    override fun sound(): String = "Мяу"\n}\n\nfun main() {\n    val a: Animal = Cat("Мурка")\n    println(a.name + ": " + a.sound())\n}' },
        { t: "tip", html: "В этом курсе — основная часть Kotlin. С такими частыми вещами, как <code>companion object</code>, второй конструктор и вложенные классы, ты познакомишься позже." },
      ],
    },
  ];

  /* ---------- Справочник ---------- */
  c.reference = [
    { term: "fun main()", text: "Программа начинается с этой функции.", code: 'fun main() {\n    println("Привет")\n}' },
    { term: "println()", text: "Выводит значение на экран и переходит на новую строку. print() не переходит на новую строку.", code: 'fun main() {\n    println("Привет")\n    println(2 + 3)\n}' },
    { term: "Комментарий (//)", text: "Всё, что написано после //, компьютер пропускает. Для нескольких строк: /* … */", code: "fun main() {\n    // это комментарий\n    println(1)\n}" },
    { term: "val и var", text: "val — неизменяемая коробка, var — изменяемая коробка.", code: "fun main() {\n    val pi = 3.14\n    var x = 5\n    x = 6\n    println(x)\n}" },
    { term: "Типы", text: "Int (целое), Double (дробное), String (строка), Boolean (true/false), Char (символ).", code: "fun main() {\n    val a: Int = 5\n    val b: Double = 2.5\n    val c = \"текст\"\n    println(a)\n}" },
    { term: "Арифметика", text: "+ − * / и % (остаток). Int / Int — целочисленное деление.", code: "fun main() {\n    println(7 / 2)\n    println(7 % 2)\n    println(7.0 / 2)\n}" },
    { term: "Шаблон строки", text: "Внутри строки €коробка или €{выражение}.", code: 'fun main() {\n    val n = 3\n    println("n = €n, вдвое больше = €{n * 2}")\n}' },
    { term: "null и ?", text: "Тип?: принимает null. ?. — безопасный вызов, ?: — значение по умолчанию, !! — заявить «я не пустой» (опасно).", code: 'fun main() {\n    var s: String? = null\n    println(s?.length)\n    println(s ?: "пусто")\n}' },
    { term: "if / else", text: "Идти по-разному в зависимости от условия. Как выражение возвращает значение.", code: 'fun main() {\n    val x = 3\n    val r = if (x > 5) "большое" else "маленькое"\n    println(r)\n}' },
    { term: "when", text: "Выбор из многих вариантов: значения, диапазоны (in), типы (is), условия.", code: 'fun main() {\n    val x = 7\n    when {\n        x < 5 -> println("мало")\n        x < 10 -> println("средне")\n        else -> println("много")\n    }\n}' },
    { term: "for и диапазон", text: "1..5, 1 until 5, 5 downTo 1, step.", code: "fun main() {\n    for (i in 1..9 step 4) {\n        println(i)\n    }\n}" },
    { term: "while", text: "Повторяет, пока условие истинно.", code: "fun main() {\n    var n = 3\n    while (n > 0) {\n        println(n)\n        n--\n    }\n}" },
    { term: "Функция", text: "fun имя(параметр: Тип): ТипРезультата. Значение по умолчанию: b: Int = 10.", code: "fun add(a: Int, b: Int = 10): Int {\n    return a + b\n}\n\nfun main() {\n    println(add(1))\n    println(add(1, 2))\n}" },
    { term: "listOf, mutableListOf", text: "Список. add, remove, size, [индекс], contains, sorted.", code: "fun main() {\n    val a = mutableListOf(3, 1, 2)\n    a.add(0)\n    println(a.sorted())\n    println(a.size)\n}" },
    { term: "filter, map, лямбда", text: "{ … } — короткая функция, it — текущий элемент.", code: "fun main() {\n    val a = listOf(1, 2, 3, 4)\n    println(a.filter { it > 2 })\n    println(a.map { it * 3 })\n}" },
    { term: "mapOf", text: "Пары «ключ → значение». Читается через m[ключ].", code: 'fun main() {\n    val m = mapOf("а" to 1, "б" to 2)\n    println(m["б"])\n}' },
    { term: "class", text: "Шаблон со свойствами и функциями.", code: 'class Dog(val name: String) {\n    fun bark() = println("€name: Гав!")\n}\n\nfun main() {\n    Dog("Шарик").bark()\n}' },
    { term: "data class", text: "Класс данных: toString, ==, copy уже есть.", code: "data class P(val x: Int, val y: Int)\n\nfun main() {\n    println(P(1, 2).copy(y = 7))\n}" },
    { term: "enum class", text: "Значения, известные заранее.", code: "enum class Color { RED, GREEN }\n\nfun main() {\n    println(Color.GREEN)\n}" },
    { term: "open, override", text: "Наследование: дочерний класс переопределяет (override) open-класс или open-функцию.", code: 'open class A { open fun f() = "A" }\nclass B : A() { override fun f() = "B" }\n\nfun main() {\n    println(B().f())\n}' },
    { term: "try / catch", text: "Ловить ошибку.", code: 'fun main() {\n    try {\n        println(10 / 0)\n    } catch (e: ArithmeticException) {\n        println("На ноль делить нельзя")\n    }\n}' },
  ];

  /* Заменяем знак « € » на « $ » (чтобы не путать с шаблонами JS) */
  const fix = (v) => {
    if (typeof v === "string") return v.replace(/€/g, "$");
    if (Array.isArray(v)) return v.map(fix);
    if (v && typeof v === "object") {
      Object.keys(v).forEach((k) => {
        if (typeof v[k] !== "function") v[k] = fix(v[k]);
      });
    }
    return v;
  };
  fix(c.levels);
  fix(c.bonus);
  fix(c.lectures);
  fix(c.reference);
})();
