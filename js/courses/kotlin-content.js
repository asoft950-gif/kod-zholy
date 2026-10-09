/* Kotlin курсы: тапсырмалар, қосымша, лекциялар, анықтамалық.
   Код үлгілерінде доллар белгісі « € » деп жазылады (JS шаблонымен шатаспау үшін), жүктелгенде « $ » болады. */
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
    /* ---------- 1. Қораптар ---------- */
    lv({
      id: "1.1", title: "Екі қорап",
      task: "<p><b>a</b> қорабына <code>7</code>, <b>b</b> қорабына <code>3</code> сал (<code>val</code> арқылы). Екеуінің қосындысын <code>println</code> арқылы экранға шығар.</p>" +
        "<p class='tip'>Kotlin-де бағдарлама <code>fun main() { … }</code> ішінде жұмыс істейді. Қорап жасау: <code>val a = 7</code> — оң жақта «a» қорабы пайда болады. Нүктелі үтір керек емес.</p>",
      hint: "val a = 7, val b = 3, содан кейін println(a + b)",
      starter: MAIN("    // a және b қораптарын жаса\n    // қосындысын println-мен шығар\n"),
      solution: MAIN("    val a = 7\n    val b = 3\n    println(a + b)\n"),
      check: { output: "10", vars: { a: "7", b: "3" } },
    }),
    lv({
      id: "1.2", title: "Сәлемдесу",
      task: "<p><code>val name</code> қорабына өз атыңды жаз (қос тырнақшада). Сосын экранға <code>Сәлем, Алия!</code> сияқты сәлемдесу шығар: Алия орнында сенің атың.</p>" +
        "<p class='tip'>Мәтінді қосуға болады: <code>\"Сәлем, \" + name + \"!\"</code></p>",
      hint: 'val name = "Алия"; println("Сәлем, " + name + "!")',
      starter: MAIN("    // name қорабына атыңды жаз\n    // сәлемдесуді шығар\n"),
      solution: MAIN('    val name = "Алия"\n    println("Сәлем, " + name + "!")\n'),
      check: {
        fn(res) {
          const v = res.vars.name;
          if (!v) return "«name» қорабы жасалмаған.";
          if (v.t !== "String") return "name қорабында мәтін болуы керек (қос тырнақшаға ал).";
          if (res.output.trim() !== "Сәлем, " + v.s + "!") return "Экранға «Сәлем, " + v.s + "!» шығуы керек.";
          return null;
        },
      },
    }),
    lv({
      id: "1.3", title: "var: өзгеретін қорап",
      task: "<p><code>coins</code> қорабында <code>10</code> бар. Оған <code>5</code> қос да, нәтижені шығар: <code>15</code>.</p>" +
        "<p class='tip'><code>val</code> қорабын кейін өзгертуге болмайды. Өзгеретін қорап <code>var</code> деп жасалады. <code>coins += 5</code> — «coins-ке 5 қос».</p>",
      hint: "coins += 5 жазып, одан кейін println(coins)",
      starter: MAIN("    var coins = 10\n    // 5 қос\n    // шығар\n"),
      solution: MAIN("    var coins = 10\n    coins += 5\n    println(coins)\n"),
      check: { output: "15", vars: { coins: "15" } },
    }),
    lv({
      id: "1.4", title: "Мәтін шаблоны",
      task: "<p>Экранға дәл осылай шығар: <code>4 + 6 = 10</code>. Сандар <code>a</code> және <code>b</code> қораптарында тұр. Мәтіннің ішіне қорапты <b>шаблон</b> арқылы кірістір.</p>" +
        "<p class='tip'>Мәтіннің ішінде <code>€a</code> — қорап мәні, <code>€{a + b}</code> — өрнектің нәтижесі. Мысалы: <code>\"Жасың: €age\"</code>.</p>",
      hint: 'println("€a + €b = €{a + b}")',
      starter: MAIN("    val a = 4\n    val b = 6\n    // шаблонмен шығар\n"),
      solution: MAIN('    val a = 4\n    val b = 6\n    println("€a + €b = €{a + b}")\n'),
      check: {
        output: "4 + 6 = 10",
        fn(res) {
          return /\$/.test(res.code) ? null : "Мәтін шаблонын қолдан: тырнақша ішінде €a және €{a + b}.".replace(/€/g, "$");
        },
      },
    }),

    /* ---------- 2. Типтер және null ---------- */
    lv({
      id: "2.1", title: "Бүтін және ондық",
      task: "<p><code>a = 7</code> және <code>b = 2</code>. Алдымен <code>a / b</code> шығар, сосын нақты (ондық) бөлінді шығару үшін <code>a.toDouble() / b</code>.</p>" +
        "<p class='tip'>Kotlin-де <code>Int / Int</code> бүтін сан береді: <code>7 / 2</code> = <b>3</b>. Ондық нәтиже алу үшін бір санды <code>Double</code>-ға айналдыр.</p>",
      hint: "println(a / b) және println(a.toDouble() / b)",
      starter: MAIN("    val a = 7\n    val b = 2\n    // екі нәтижені шығар\n"),
      solution: MAIN("    val a = 7\n    val b = 2\n    println(a / b)\n    println(a.toDouble() / b)\n"),
      check: { output: "3\n3.5" },
    }),
    lv({
      id: "2.2", title: "Мәтін әдістері",
      task: "<p><code>word</code> қорабында <code>\"Kotlin\"</code> бар. Алдымен оның ұзындығын (<code>length</code>), сосын бас әріппен жазылған нұсқасын (<code>uppercase()</code>) шығар.</p>",
      hint: "println(word.length) және println(word.uppercase())",
      starter: MAIN('    val word = "Kotlin"\n    // ұзындығы\n    // бас әріптермен\n'),
      solution: MAIN('    val word = "Kotlin"\n    println(word.length)\n    println(word.uppercase())\n'),
      check: { output: "6\nKOTLIN" },
    }),
    lv({
      id: "2.3", title: "Мәтіннен санға",
      task: "<p><code>text</code> қорабында мәтін түрінде <code>\"42\"</code> тұр. Оны санға айналдырып, <code>8</code> қосып, нәтижені шығар: <code>50</code>.</p>" +
        "<p class='tip'><code>\"42\".toInt()</code> мәтінді санға айналдырады. Мәтін мен санды тікелей қосуға болмайды — Kotlin қате береді.</p>",
      hint: "println(text.toInt() + 8)",
      starter: MAIN('    val text = "42"\n    // санға айналдырып 8 қос\n'),
      solution: MAIN('    val text = "42"\n    println(text.toInt() + 8)\n'),
      check: { output: "50" },
    }),
    lv({
      id: "2.4", title: "null және «?»",
      task: "<p><code>city</code> қорабы алдымен бос (<code>null</code>). 1) Экранға <code>city ?: \"белгісіз\"</code> шығар. 2) Қалаға <code>\"Астана\"</code> сал. 3) Қала атының ұзындығын <code>city?.length</code> арқылы шығар. Күтілетін нәтиже: <code>белгісіз</code> және <code>6</code>.</p>" +
        "<p class='tip'>Тип соңындағы <code>?</code> («<code>String?</code>») қорапқа <code>null</code> салуға рұқсат береді. <code>?:</code> — «егер бос болса, мынаны ал». <code>?.</code> — «бос болмаса ғана қолдан».</p>",
      hint: 'println(city ?: "белгісіз"); city = "Астана"; println(city?.length)',
      starter: MAIN("    var city: String? = null\n    // 1) ?: арқылы шығар\n    // 2) city = \"Астана\"\n    // 3) city?.length шығар\n"),
      solution: MAIN('    var city: String? = null\n    println(city ?: "белгісіз")\n    city = "Астана"\n    println(city?.length)\n'),
      check: { output: "белгісіз\n6" },
    }),

    /* ---------- 3. Шарттар ---------- */
    lv({
      id: "3.1", title: "Ересек пе, бала ма",
      task: "<p><code>age</code> қорабындағы жас <code>18</code> немесе одан үлкен болса, экранға <code>ересек</code>, әйтпесе <code>бала</code> деп шығар. Кодың <code>age</code> басқа сан болғанда да дұрыс жұмыс істеуі керек.</p>" +
        "<p class='tip'>Kotlin-де <code>if</code> мән де қайтара алады: <code>val s = if (x &gt; 5) \"а\" else \"б\"</code>.</p>",
      hint: 'if (age >= 18) { println("ересек") } else { println("бала") }',
      starter: MAIN("    val age = 15\n    // if / else жаз\n"),
      solution: MAIN('    val age = 15\n    if (age >= 18) {\n        println("ересек")\n    } else {\n        println("бала")\n    }\n'),
      check: {
        requireIf: true,
        fn(res) {
          const a = num(res, "age");
          if (a === null) return "«age» қорабында бүтін сан болуы керек.";
          const want = a >= 18 ? "ересек" : "бала";
          if (res.output.trim() !== want) return "age = " + a + " болғанда экранға «" + want + "» шығуы керек.";
          return null;
        },
      },
    }),
    lv({
      id: "3.2", title: "Баға қою",
      task: "<p><code>ball</code> қорабындағы баллға қарай баға шығар: <code>90</code> және одан жоғары — <code>5</code>, <code>70</code>-тен бастап — <code>4</code>, <code>50</code>-ден бастап — <code>3</code>, қалғаны — <code>2</code>.</p>" +
        "<p class='tip'>Бірнеше шарт: <code>if … else if … else</code>. Жоғарыдан төмен қарай тексер.</p>",
      hint: "if (ball >= 90) … else if (ball >= 70) … else if (ball >= 50) … else …",
      starter: MAIN("    val ball = 75\n    // бағаны шығар\n"),
      solution: MAIN('    val ball = 75\n    if (ball >= 90) {\n        println(5)\n    } else if (ball >= 70) {\n        println(4)\n    } else if (ball >= 50) {\n        println(3)\n    } else {\n        println(2)\n    }\n'),
      check: {
        requireIf: true,
        fn(res) {
          const b = num(res, "ball");
          if (b === null) return "«ball» қорабында бүтін сан болуы керек.";
          const want = b >= 90 ? "5" : b >= 70 ? "4" : b >= 50 ? "3" : "2";
          if (res.output.trim() !== want) return "ball = " + b + " болғанда баға " + want + " болуы керек.";
          return null;
        },
      },
    }),
    lv({
      id: "3.3", title: "when: апта күні",
      task: "<p><code>day</code> қорабында апта күнінің нөмірі (1–7). <code>when</code> арқылы күннің атын шығар: 1 — <code>дүйсенбі</code>, 2 — <code>сейсенбі</code>, 3 — <code>сәрсенбі</code>, 4 — <code>бейсенбі</code>, 5 — <code>жұма</code>, 6 — <code>сенбі</code>, 7 — <code>жексенбі</code>. Басқа сан болса — <code>белгісіз</code>.</p>" +
        "<p class='tip'><code>when (x) { 1 -&gt; … ; 2 -&gt; … ; else -&gt; … }</code> — көп таңдау. Ол <code>if/else if</code> тізбегінен әлдеқайда ықшам.</p>",
      hint: 'when (day) { 1 -> println("дүйсенбі") … else -> println("белгісіз") }',
      starter: MAIN("    val day = 3\n    // when арқылы күн атын шығар\n"),
      solution: MAIN('    val day = 3\n    when (day) {\n        1 -> println("дүйсенбі")\n        2 -> println("сейсенбі")\n        3 -> println("сәрсенбі")\n        4 -> println("бейсенбі")\n        5 -> println("жұма")\n        6 -> println("сенбі")\n        7 -> println("жексенбі")\n        else -> println("белгісіз")\n    }\n'),
      check: {
        fn(res) {
          const d = num(res, "day");
          if (d === null) return "«day» қорабында бүтін сан болуы керек.";
          if (!/when\s*[({]/.test(res.code)) return "Бұл тапсырмада when қолдану керек.";
          const names = ["дүйсенбі", "сейсенбі", "сәрсенбі", "бейсенбі", "жұма", "сенбі", "жексенбі"];
          const want = names[d - 1] || "белгісіз";
          if (res.output.trim() !== want) return "day = " + d + " болғанда экранға «" + want + "» шығуы керек.";
          return null;
        },
      },
    }),
    lv({
      id: "3.4", title: "Диапазонда ма",
      task: "<p><code>n</code> саны <code>10</code>-нан <code>20</code>-ға дейін (екеуін қоса) болса, экранға <code>ішінде</code>, әйтпесе <code>сыртында</code> деп шығар. Кодың <code>n</code> басқа сан болғанда да дұрыс жұмыс істесін.</p>" +
        "<p class='tip'><code>10..20</code> — 10-дан 20-ға дейінгі сандар. <code>n in 10..20</code> — «n осы диапазонда ма?». Бұл <code>n &gt;= 10 &amp;&amp; n &lt;= 20</code> дегеннен қысқа.</p>",
      hint: 'if (n in 10..20) { println("ішінде") } else { println("сыртында") }',
      starter: MAIN("    val n = 15\n    // in 10..20 пайдалан\n"),
      solution: MAIN('    val n = 15\n    if (n in 10..20) {\n        println("ішінде")\n    } else {\n        println("сыртында")\n    }\n'),
      check: {
        requireIf: true,
        fn(res) {
          const n = num(res, "n");
          if (n === null) return "«n» қорабында бүтін сан болуы керек.";
          const want = n >= 10 && n <= 20 ? "ішінде" : "сыртында";
          if (res.output.trim() !== want) return "n = " + n + " болғанда экранға «" + want + "» шығуы керек.";
          return null;
        },
      },
    }),

    /* ---------- 4. Циклдер ---------- */
    lv({
      id: "4.1", title: "Бірден беске дейін",
      task: "<p><code>for</code> циклімен <code>1</code>-ден <code>5</code>-ке дейінгі сандарды шығар (әрқайсысы жаңа жолда).</p>" +
        "<p class='tip'><code>for (i in 1..5) { … }</code> — <code>i</code> қорабы 1, 2, 3, 4, 5 мәндерін ретімен қабылдайды. Оң жақтағы циклдің панеліне қара!</p>",
      hint: "for (i in 1..5) { println(i) }",
      starter: MAIN("    // for циклін жаз\n"),
      solution: MAIN("    for (i in 1..5) {\n        println(i)\n    }\n"),
      check: { output: "1\n2\n3\n4\n5", requireFor: true },
    }),
    lv({
      id: "4.2", title: "Жүздің қосындысы",
      task: "<p>1-ден 100-ге дейінгі барлық сандардың қосындысын тап: <code>total</code> қорабына жина, соңында шығар. Жауап: <code>5050</code>.</p>" +
        "<p class='tip'>Алдымен <code>var total = 0</code>, цикл ішінде <code>total += i</code>.</p>",
      hint: "var total = 0; for (i in 1..100) { total += i }; println(total)",
      starter: MAIN("    var total = 0\n    // циклмен қос\n    // шығар\n"),
      solution: MAIN("    var total = 0\n    for (i in 1..100) {\n        total += i\n    }\n    println(total)\n"),
      check: { output: "5050", vars: { total: "5050" }, requireFor: true },
    }),
    lv({
      id: "4.3", title: "Кері санақ",
      task: "<p>Мына сандарды шығар: <code>10</code>, <code>8</code>, <code>6</code>, <code>4</code>, <code>2</code> (әрқайсысы жаңа жолда). Цикл керісінше жүріп, екіден секіруі керек.</p>" +
        "<p class='tip'><code>10 downTo 2</code> — кері санақ, <code>step 2</code> — қадамы 2. Бірге: <code>for (i in 10 downTo 2 step 2)</code>.</p>",
      hint: "for (i in 10 downTo 2 step 2) { println(i) }",
      starter: MAIN("    // downTo және step\n"),
      solution: MAIN("    for (i in 10 downTo 2 step 2) {\n        println(i)\n    }\n"),
      check: { output: "10\n8\n6\n4\n2", requireFor: true },
    }),
    lv({
      id: "4.4", title: "Екі еселену",
      task: "<p><code>n</code> қорабы <code>1</code>-ден басталады. <code>while</code> циклімен <code>n</code>-ді екіге көбейте бер, <code>n</code> <b>100</b>-ге жеткенше не асқанша. Соңында <code>n</code>-ді шығар: <code>128</code>.</p>" +
        "<p class='tip'><code>while (шарт) { … }</code> — шарт ақиқат болғанша қайталайды. <code>n *= 2</code> — n-ді екіге көбейт.</p>",
      hint: "while (n < 100) { n *= 2 }  — одан кейін println(n)",
      starter: MAIN("    var n = 1\n    // while циклін жаз\n    // n-ді шығар\n"),
      solution: MAIN("    var n = 1\n    while (n < 100) {\n        n *= 2\n    }\n    println(n)\n"),
      check: { output: "128", vars: { n: "128" }, requireWhile: true },
    }),

    /* ---------- 5. Функциялар ---------- */
    lv({
      id: "5.1", title: "Квадрат функциясы",
      task: "<p><code>square</code> функциясын жаз: ол <code>Int</code> санды алып, оның квадратын қайтарады. <code>main</code> ішінде <code>square(7)</code> шақырылған — экранда <code>49</code> болуы керек.</p>" +
        "<p class='tip'>Функция: <code>fun аты(параметр: Тип): Қайтару_типі { return … }</code>. Бір жолдық нұсқа: <code>fun square(x: Int): Int = x * x</code>.</p>",
      hint: "fun square(x: Int): Int { return x * x }",
      starter: "// square функциясын осы жерге жаз\n\nfun main() {\n    println(square(7))\n}\n",
      solution: "fun square(x: Int): Int {\n    return x * x\n}\n\nfun main() {\n    println(square(7))\n}\n",
      check: { output: "49", requireDef: true },
    }),
    lv({
      id: "5.2", title: "Әдепкі мән",
      task: "<p><code>greet</code> функциясын жаз: екі параметр — <code>name</code> және <code>greeting</code> (әдепкі мәні <code>\"Сәлем\"</code>). Ол <code>Сәлем, Аян!</code> түріндегі мәтінді қайтарады. <code>main</code> екі рет шақырады.</p>" +
        "<p class='tip'>Әдепкі мән: <code>fun f(a: Int, b: Int = 10)</code>. Шақырғанда екінші аргументті жазбасаң, 10 алынады.</p>",
      hint: 'fun greet(name: String, greeting: String = "Сәлем"): String { return "€greeting, €name!" }',
      starter: "// greet функциясын жаз\n\nfun main() {\n    println(greet(\"Аян\"))\n    println(greet(\"Дана\", \"Қайырлы таң\"))\n}\n",
      solution: 'fun greet(name: String, greeting: String = "Сәлем"): String {\n    return "€greeting, €name!"\n}\n\nfun main() {\n    println(greet("Аян"))\n    println(greet("Дана", "Қайырлы таң"))\n}\n',
      check: { output: "Сәлем, Аян!\nҚайырлы таң, Дана!", requireDef: true },
    }),
    lv({
      id: "5.3", title: "Факториал",
      task: "<p><code>fact(n)</code> функциясын жаз: <code>n</code> санының факториалын (1 · 2 · … · n) қайтарады. Функция <b>өзін өзі шақыра алады</b> (рекурсия). <code>fact(1)</code> = 1. <code>main</code> екі нәтиже шығарады: <code>120</code> және <code>720</code>.</p>" +
        "<p class='tip'>Формула: <code>fact(n) = n * fact(n - 1)</code>, ал <code>n</code> 1 болғанда тоқта.</p>",
      hint: "if (n <= 1) return 1 else return n * fact(n - 1)",
      starter: "// fact функциясын жаз\n\nfun main() {\n    println(fact(5))\n    println(fact(6))\n}\n",
      solution: "fun fact(n: Int): Int {\n    if (n <= 1) {\n        return 1\n    }\n    return n * fact(n - 1)\n}\n\nfun main() {\n    println(fact(5))\n    println(fact(6))\n}\n",
      check: { output: "120\n720", requireDef: true },
    }),
    lv({
      id: "5.4", title: "Жұп сандар",
      task: "<p><code>isEven(n)</code> функциясын жаз: сан жұп болса <code>true</code> қайтарады. Сосын <code>main</code> ішінде <code>1</code>-ден <code>6</code>-ға дейінгі сандардан тек жұптарын шығар: <code>2</code>, <code>4</code>, <code>6</code>.</p>" +
        "<p class='tip'>Жұптық: <code>n % 2 == 0</code>. Функция <code>Boolean</code> қайтарады.</p>",
      hint: "fun isEven(n: Int): Boolean = n % 2 == 0   және   for (i in 1..6) { if (isEven(i)) println(i) }",
      starter: "// isEven функциясын жаз\n\nfun main() {\n    // 1..6 ішінен жұптарын шығар\n}\n",
      solution: "fun isEven(n: Int): Boolean {\n    return n % 2 == 0\n}\n\nfun main() {\n    for (i in 1..6) {\n        if (isEven(i)) {\n            println(i)\n        }\n    }\n}\n",
      check: { output: "2\n4\n6", requireDef: true, requireFor: true },
    }),

    /* ---------- 6. Жинақтар ---------- */
    lv({
      id: "6.1", title: "Жемістер тізімі",
      task: "<p><code>fruits</code> тізімін жаса: <code>\"алма\"</code>, <code>\"алмұрт\"</code>, <code>\"өрік\"</code>. Тізімнің өлшемін (<code>size</code>) және екінші элементін (индекс <b>1</b>) шығар. Күтілетін нәтиже: <code>3</code> және <code>алмұрт</code>.</p>" +
        "<p class='tip'><code>listOf(…)</code> — өзгермейтін тізім. Элемент нөмірі 0-ден басталады: <code>fruits[0]</code> — бірінші.</p>",
      hint: 'val fruits = listOf("алма", "алмұрт", "өрік"); println(fruits.size); println(fruits[1])',
      starter: MAIN("    // fruits тізімін жаса\n    // size және fruits[1] шығар\n"),
      solution: MAIN('    val fruits = listOf("алма", "алмұрт", "өрік")\n    println(fruits.size)\n    println(fruits[1])\n'),
      check: { output: "3\nалмұрт", vars: { fruits: '["алма", "алмұрт", "өрік"]' }, requireList: true },
    }),
    lv({
      id: "6.2", title: "Тізімге қосу",
      task: "<p><code>nums</code> — өзгеретін тізім (<code>mutableListOf</code>), басында <code>1, 2, 3</code> бар. Оған <code>4</code> пен <code>5</code> қос, сосын барлық сандардың қосындысын (<code>sum()</code>) шығар: <code>15</code>.</p>" +
        "<p class='tip'><code>listOf</code> тізімін өзгерту мүмкін емес, ал <code>mutableListOf</code> тізіміне <code>add(…)</code> арқылы қосуға болады.</p>",
      hint: "nums.add(4); nums.add(5); println(nums.sum())",
      starter: MAIN("    val nums = mutableListOf(1, 2, 3)\n    // 4 пен 5 қос\n    // қосындысын шығар\n"),
      solution: MAIN("    val nums = mutableListOf(1, 2, 3)\n    nums.add(4)\n    nums.add(5)\n    println(nums.sum())\n"),
      check: { output: "15", vars: { nums: "[1, 2, 3, 4, 5]" } },
    }),
    lv({
      id: "6.3", title: "filter және map",
      task: "<p><code>nums</code> тізімінде <code>1</code>-ден <code>6</code>-ға дейінгі сандар. Жаңа <code>result</code> тізімін жаса: тек <b>жұп</b> сандарды алып (<code>filter</code>), әрқайсысын <b>квадраттап</b> (<code>map</code>). Нәтижені шығар: <code>[4, 16, 36]</code>.</p>" +
        "<p class='tip'><b>Лямбда</b> — қысқа жасырын функция: <code>{ it % 2 == 0 }</code>, мұндағы <code>it</code> — ағымдағы элемент. <code>list.filter { … }.map { … }</code> тізбектеледі.</p>",
      hint: "val result = nums.filter { it % 2 == 0 }.map { it * it }",
      starter: MAIN("    val nums = listOf(1, 2, 3, 4, 5, 6)\n    // result тізімін жаса\n    // шығар\n"),
      solution: MAIN("    val nums = listOf(1, 2, 3, 4, 5, 6)\n    val result = nums.filter { it % 2 == 0 }.map { it * it }\n    println(result)\n"),
      check: { output: "[4, 16, 36]", vars: { result: "[4, 16, 36]" } },
    }),
    lv({
      id: "6.4", title: "Жас кестесі (Map)",
      task: "<p><code>ages</code> — Map: <code>\"Аян\"</code> → <code>12</code>, <code>\"Дана\"</code> → <code>11</code>. Цикл арқылы әр жұпты <code>Аян: 12</code> түрінде шығар.</p>" +
        "<p class='tip'><code>mapOf(\"а\" to 1, \"б\" to 2)</code> — кілт пен мән жұптары. Циклде жұпты бөлуге болады: <code>for ((name, age) in ages)</code>.</p>",
      hint: 'for ((name, age) in ages) { println("€name: €age") }',
      starter: MAIN('    val ages = mapOf("Аян" to 12, "Дана" to 11)\n    // циклмен шығар\n'),
      solution: MAIN('    val ages = mapOf("Аян" to 12, "Дана" to 11)\n    for ((name, age) in ages) {\n        println("€name: €age")\n    }\n'),
      check: { output: "Аян: 12\nДана: 11", requireFor: true },
    }),

    /* ---------- 7. Кластар ---------- */
    lv({
      id: "7.1", title: "Мысық класы",
      task: "<p><code>Cat</code> класын жаса: ол <code>name</code> (мәтін) қасиетін алады және <code>meow()</code> функциясы бар — ол <code>Мурка: Мияу!</code> түрінде (аты және «Мияу!») шығарады. <code>main</code> дайын.</p>" +
        "<p class='tip'>Класс — объектінің қалыбы: <code>class Dog(val name: String) { fun bark() { println(\"Гав\") } }</code>. Объект жасау: <code>Dog(\"Шарик\")</code>.</p>",
      hint: 'class Cat(val name: String) { fun meow() { println("€name: Мияу!") } }',
      starter: '// Cat класын осы жерге жаз\n\nfun main() {\n    val cat = Cat("Мурка")\n    cat.meow()\n}\n',
      solution: 'class Cat(val name: String) {\n    fun meow() {\n        println("€name: Мияу!")\n    }\n}\n\nfun main() {\n    val cat = Cat("Мурка")\n    cat.meow()\n}\n',
      check: { output: "Мурка: Мияу!" },
    }),
    lv({
      id: "7.2", title: "Санауыш",
      task: "<p><code>Counter</code> класын жаса: ішінде <code>var count = 0</code> қасиеті және <code>inc()</code> функциясы бар — ол санды 1-ге арттырады. <code>main</code> оны үш рет шақырады, содан кейін <code>count</code> шығарылады: <code>3</code>.</p>" +
        "<p class='tip'>Класс өз қасиеттерін есте сақтайды. Функцияның ішінде қасиетті тікелей жазасың: <code>count++</code>.</p>",
      hint: "class Counter { var count = 0; fun inc() { count++ } }",
      starter: "// Counter класын жаз\n\nfun main() {\n    val c = Counter()\n    c.inc()\n    c.inc()\n    c.inc()\n    println(c.count)\n}\n",
      solution: "class Counter {\n    var count = 0\n    fun inc() {\n        count++\n    }\n}\n\nfun main() {\n    val c = Counter()\n    c.inc()\n    c.inc()\n    c.inc()\n    println(c.count)\n}\n",
      check: { output: "3" },
    }),
    lv({
      id: "7.3", title: "data class",
      task: "<p><code>Point</code> деректер класын жаса: екі бүтін сан — <code>x</code> және <code>y</code>. <code>main</code> ішінде <code>p = Point(1, 2)</code> жаса, одан <code>y</code>-ін 5-ке ауыстырып көшірме жаса (<code>copy</code>), екеуін де шығар. Күтілетін нәтиже: <code>Point(x=1, y=2)</code> және <code>Point(x=1, y=5)</code>.</p>" +
        "<p class='tip'><code>data class</code> өзі әдемі мәтінге айналады (<code>toString</code>), салыстырылады, көшіріледі: <code>p.copy(y = 5)</code>.</p>",
      hint: "data class Point(val x: Int, val y: Int)  және  val q = p.copy(y = 5)",
      starter: "// Point класын жаз\n\nfun main() {\n    // p жаса, q = p.copy(y = 5)\n    // екеуін шығар\n}\n",
      solution: "data class Point(val x: Int, val y: Int)\n\nfun main() {\n    val p = Point(1, 2)\n    val q = p.copy(y = 5)\n    println(p)\n    println(q)\n}\n",
      check: {
        output: "Point(x=1, y=2)\nPoint(x=1, y=5)",
        fn(res) {
          return /data\s+class/.test(res.code) ? null : "Бұл тапсырмада data class қолдану керек.";
        },
      },
    }),
    lv({
      id: "7.4", title: "Бағдаршам (enum)",
      task: "<p><code>Light</code> enum-ы дайын. <code>action(l: Light)</code> функциясын жаз: <code>RED</code> → <code>тоқта</code>, <code>YELLOW</code> → <code>күт</code>, <code>GREEN</code> → <code>жүр</code> деген мәтін қайтарады. <code>when</code> қолдан.</p>" +
        "<p class='tip'><code>enum class</code> — әзірленген мәндер тізімі. <code>when</code> онымен тамаша жұмыс істейді: <code>Light.RED -&gt; \"тоқта\"</code>.</p>",
      hint: 'fun action(l: Light): String = when (l) { Light.RED -> "тоқта"; … }',
      starter: "enum class Light { RED, YELLOW, GREEN }\n\n// action функциясын жаз\n\nfun main() {\n    println(action(Light.RED))\n    println(action(Light.YELLOW))\n    println(action(Light.GREEN))\n}\n",
      solution: 'enum class Light { RED, YELLOW, GREEN }\n\nfun action(l: Light): String {\n    return when (l) {\n        Light.RED -> "тоқта"\n        Light.YELLOW -> "күт"\n        Light.GREEN -> "жүр"\n    }\n}\n\nfun main() {\n    println(action(Light.RED))\n    println(action(Light.YELLOW))\n    println(action(Light.GREEN))\n}\n',
      check: { output: "тоқта\nкүт\nжүр", requireDef: true },
    }),
    lv({
      id: "7.5", title: "Мұра: жануарлар",
      task: "<p><code>Animal</code> класы мен оның баласы <code>Dog</code> дайын (дыбыс беру функциясы <code>sound()</code>). <code>Dog</code>-тың <code>sound()</code> функциясын <code>override</code> етіп, <code>Гав!</code> қайтар. <code>Animal</code> дыбысы — <code>...</code>. <code>main</code> екеуін шығарады.</p>" +
        "<p class='tip'>Kotlin-де кластар әдепкіде жабық. Мұра алуға болатын класс <code>open</code> деп жазылады, ал өзгертілетін функция да <code>open</code> болады. Бала класс оны <code>override</code> етеді.</p>",
      hint: 'class Dog(name: String) : Animal(name) { override fun sound() = "Гав!" }',
      starter: 'open class Animal(val name: String) {\n    open fun sound(): String = "..."\n}\n\n// Dog класын жаз: Animal-дан мұра алады\n\nfun main() {\n    val a = Animal("Белгісіз")\n    val d = Dog("Шарик")\n    println(a.sound())\n    println(d.name + ": " + d.sound())\n}\n',
      solution: 'open class Animal(val name: String) {\n    open fun sound(): String = "..."\n}\n\nclass Dog(name: String) : Animal(name) {\n    override fun sound(): String = "Гав!"\n}\n\nfun main() {\n    val a = Animal("Белгісіз")\n    val d = Dog("Шарик")\n    println(a.sound())\n    println(d.name + ": " + d.sound())\n}\n',
      check: { output: "...\nШарик: Гав!" },
    }),
  ];

  /* ---------- Қосымша ---------- */
  c.bonus = [
    lv({
      id: "B1", title: "FizzBuzz",
      task: "<p>1-ден 15-ке дейін санап шық. 3-ке бөлінетін сандардың орнына <code>Fizz</code>, 5-ке бөлінетіндердің орнына <code>Buzz</code>, екеуіне де бөлінетіндердің орнына <code>FizzBuzz</code> шығар. Қалғандарын сол күйі.</p>",
      hint: "Алдымен 15-ке бөлінуін тексер (FizzBuzz), сосын 3, сосын 5. when { … } қолдансаң ыңғайлы.",
      starter: MAIN("    // 1..15\n"),
      solution: MAIN('    for (i in 1..15) {\n        when {\n            i % 15 == 0 -> println("FizzBuzz")\n            i % 3 == 0 -> println("Fizz")\n            i % 5 == 0 -> println("Buzz")\n            else -> println(i)\n        }\n    }\n'),
      check: { output: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz", requireFor: true },
    }),
    lv({
      id: "B2", title: "Палиндром",
      task: "<p><code>isPalindrome(s: String): Boolean</code> функциясын жаз: сөз екі жағынан бірдей оқылса (мысалы, <code>\"level\"</code>) — <code>true</code>. <code>main</code> екі сөзді тексереді: <code>true</code> және <code>false</code> шығуы керек.</p>" +
        "<p class='tip'><code>s.reversed()</code> мәтінді айналдырады.</p>",
      hint: "return s == s.reversed()",
      starter: "// isPalindrome функциясын жаз\n\nfun main() {\n    println(isPalindrome(\"level\"))\n    println(isPalindrome(\"kotlin\"))\n}\n",
      solution: "fun isPalindrome(s: String): Boolean {\n    return s == s.reversed()\n}\n\nfun main() {\n    println(isPalindrome(\"level\"))\n    println(isPalindrome(\"kotlin\"))\n}\n",
      check: { output: "true\nfalse", requireDef: true },
    }),
    lv({
      id: "B3", title: "Тізім статистикасы",
      task: "<p><code>scores</code> тізімінен ең үлкен, ең кіші және орташа мәнді шығар (үш жол). Тізім: <code>8, 5, 9, 6</code>. Күтілетін нәтиже: <code>9</code>, <code>5</code>, <code>7.0</code>.</p>" +
        "<p class='tip'><code>max()</code>, <code>min()</code>, <code>average()</code> — тізімнің дайын әдістері.</p>",
      hint: "println(scores.max()); println(scores.min()); println(scores.average())",
      starter: MAIN("    val scores = listOf(8, 5, 9, 6)\n    // max, min, average\n"),
      solution: MAIN("    val scores = listOf(8, 5, 9, 6)\n    println(scores.max())\n    println(scores.min())\n    println(scores.average())\n"),
      check: { output: "9\n5\n7.0" },
    }),
  ];

  /* ---------- Лекциялар ---------- */
  c.lectures = [
    {
      id: "l1", topic: "1", title: "Алғашқы бағдарлама", minutes: 3,
      blocks: [
        { t: "p", html: "Kotlin — Android қосымшаларын жазудың негізгі тілі, сонымен бірге серверде де қолданылады. Оны <b>JetBrains</b> компаниясы жасады. Тіл қысқа, түсінікті және қатені ертерек ұстайды." },
        { t: "p", html: "Әрбір Kotlin бағдарламасы <code>main</code> функциясынан басталады. Экранға шығару — <code>println</code>:" },
        { t: "try", code: 'fun main() {\n    println("Сәлем, әлем!")\n}', note: "Іске қос. «⏭ Қадам» батырмасымен жолдарды бір-бірден орындап көр." },
        { t: "p", html: "Ақпаратты <b>қораптарда</b> сақтаймыз. Екі түрі бар:" },
        { t: "list", items: ["<code>val</code> — өзгермейтін қорап (мән бір рет беріледі)", "<code>var</code> — өзгеретін қорап", "Мәтін қос тырнақшада: <code>\"Алия\"</code>, сан тырнақсыз: <code>5</code>"] },
        { t: "try", code: "fun main() {\n    val name = \"Алия\"\n    var age = 12\n    age = age + 1\n    println(name)\n    println(age)\n}" },
        { t: "warn", html: "<code>val</code> қорабына екінші рет мән беруге болмайды — Kotlin қате көрсетеді. Мүмкіндігінше <code>val</code> қолдан: бағдарлама сенімдірек болады." },
        { t: "h", text: "Мәтін шаблоны" },
        { t: "p", html: "Мәтіннің ішіне қорапты <code>€</code> белгісімен кірістіруге болады. Өрнекті <code>€{ … }</code> ішіне жаз:" },
        { t: "try", code: 'fun main() {\n    val a = 4\n    val b = 6\n    println("€a + €b = €{a + b}")\n}' },
        { t: "tip", html: "Kotlin-де жолдың соңына <code>;</code> қою міндетті емес. Шегініс (бос орын) — оқуға ыңғайлы болу үшін, 4 бос орын қабылданған." },
      ],
    },
    {
      id: "l2", topic: "2", title: "Типтер және null", minutes: 4,
      blocks: [
        { t: "p", html: "Kotlin-де әр қорап белгілі <b>типте</b> болады. Тип — қорапта не жатқанын білдіреді. Негізгілері:" },
        { t: "list", items: ["<code>Int</code> — бүтін сан (5, -3)", "<code>Double</code> — ондық сан (3.14)", "<code>String</code> — мәтін (\"сәлем\")", "<code>Boolean</code> — <code>true</code> не <code>false</code>", "<code>Char</code> — бір таңба ('a')"] },
        { t: "try", code: 'fun main() {\n    val a: Int = 7\n    val b: Double = 2.5\n    val s: String = "Kotlin"\n    println(a)\n    println(b)\n    println(s)\n}', note: "Оң жақтағы қораптарда тип көрсетіледі." },
        { t: "p", html: "Тип әдетте өзі анықталады, оны жазбасаң да болады. Бірақ тип қатаң: <code>Int</code> қорабына мәтін салуға болмайды." },
        { t: "warn", html: "<code>7 / 2</code> нәтижесі <b>3</b> (бүтін бөлу). Ондық нәтиже үшін: <code>7.0 / 2</code> немесе <code>7.toDouble() / 2</code>." },
        { t: "try", code: "fun main() {\n    println(7 / 2)\n    println(7.0 / 2)\n    println(7 % 2)\n}" },
        { t: "h", text: "Мәтін әдістері" },
        { t: "try", code: 'fun main() {\n    val s = "Kotlin"\n    println(s.length)\n    println(s.uppercase())\n    println(s.reversed())\n    println(s[0])\n}' },
        { t: "h", text: "null: «мән жоқ»" },
        { t: "p", html: "Көп тілдерде бос мән (<code>null</code>) бағдарламаны құлатады. Kotlin оған қарсы қорғайды: қорап <code>null</code> қабылдайтын болса, типіне <code>?</code> қосу керек." },
        { t: "try", code: 'fun main() {\n    var city: String? = null\n    println(city ?: "белгісіз")\n    city = "Астана"\n    println(city?.length)\n}', note: "<code>?:</code> — бос болса, мынаны ал. <code>?.</code> — бос болмаса ғана қолдан." },
      ],
    },
    {
      id: "l3", topic: "3", title: "if және when", minutes: 4,
      blocks: [
        { t: "p", html: "Шартқа қарай бағдарлама әр түрлі жолмен жүре алады:" },
        { t: "try", code: 'fun main() {\n    val x = 7\n    if (x > 5) {\n        println("үлкен")\n    } else {\n        println("кіші")\n    }\n}', note: "⏭ «Қадам»: қай бұтаққа кіретінін қара." },
        { t: "h", text: "Салыстыру белгілері" },
        { t: "list", items: ["<code>==</code> тең, <code>!=</code> тең емес", "<code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>, <code>&gt;=</code>", "<code>&amp;&amp;</code> «және», <code>||</code> «не», <code>!</code> «емес»", "<code>x in 1..10</code> — x осы диапазонда ма"] },
        { t: "warn", html: "Бір тең белгі <code>=</code> — «сал», екі тең белгі <code>==</code> — «тең бе?»." },
        { t: "h", text: "if — мән қайтарады" },
        { t: "try", code: 'fun main() {\n    val age = 20\n    val status = if (age >= 18) "ересек" else "бала"\n    println(status)\n}' },
        { t: "h", text: "when — көп таңдау" },
        { t: "p", html: "Бірнеше нұсқа болса, <code>when</code> ыңғайлы (басқа тілдердегі <code>switch</code> сияқты, бірақ күштірек):" },
        { t: "try", code: 'fun main() {\n    val ball = 75\n    when {\n        ball >= 90 -> println("Өте жақсы")\n        ball >= 50 -> println("Жақсы")\n        else -> println("Қайталап көр")\n    }\n}' },
        { t: "tip", html: "<code>when (x) { 1 -&gt; … ; in 2..5 -&gt; … ; else -&gt; … }</code> түрінде нақты мәндермен де жазылады." },
      ],
    },
    {
      id: "l4", topic: "4", title: "Циклдер", minutes: 4,
      blocks: [
        { t: "p", html: "Бір әрекетті көп рет қайталау үшін цикл қолданылады. Ең көп қолданылатыны — <code>for</code>:" },
        { t: "try", code: "fun main() {\n    for (i in 1..5) {\n        println(i)\n    }\n}", note: "Оң жақта циклдің панелі шығады: қай айналым екені көрсетіледі." },
        { t: "h", text: "Диапазондар" },
        { t: "list", items: ["<code>1..5</code> — 1, 2, 3, 4, 5", "<code>1 until 5</code> — 1, 2, 3, 4 (5 кірмейді)", "<code>5 downTo 1</code> — кері санақ", "<code>1..10 step 3</code> — 1, 4, 7, 10"] },
        { t: "try", code: "fun main() {\n    for (i in 10 downTo 2 step 2) {\n        println(i)\n    }\n}" },
        { t: "h", text: "Қосынды жинау" },
        { t: "try", code: "fun main() {\n    var total = 0\n    for (i in 1..10) {\n        total += i\n    }\n    println(total)\n}", note: "⏭ «Қадам» арқылы total қорабының өсуін бақыла." },
        { t: "h", text: "while" },
        { t: "p", html: "Қанша рет қайталанатыны белгісіз болса, <code>while</code> қолданамыз: шарт ақиқат болғанша жүре береді." },
        { t: "try", code: "fun main() {\n    var n = 1\n    while (n < 100) {\n        n *= 2\n    }\n    println(n)\n}" },
        { t: "warn", html: "Шарт ешқашан жалған болмаса, цикл шексіз жүреді. Қорапты өзгертуді ұмытпа!" },
        { t: "tip", html: "<code>break</code> — циклден шығады, <code>continue</code> — келесі айналымға өтеді." },
      ],
    },
    {
      id: "l5", topic: "5", title: "Функциялар", minutes: 4,
      blocks: [
        { t: "p", html: "Функция — атау берілген кодтың бөлігі. Оны бір рет жазып, көп рет шақыруға болады." },
        { t: "try", code: "fun square(x: Int): Int {\n    return x * x\n}\n\nfun main() {\n    println(square(5))\n    println(square(9))\n}", note: "⏭ «Қадам» функцияның ішіне кіріп, қайтып шығуын көрсетеді." },
        { t: "list", items: ["<code>fun</code> — функция жасау", "<code>(x: Int)</code> — параметр: аты және типі", "<code>: Int</code> — қайтаратын мәннің типі", "<code>return</code> — нәтижені қайтарады"] },
        { t: "h", text: "Қысқа жазу" },
        { t: "try", code: "fun add(a: Int, b: Int) = a + b\n\nfun main() {\n    println(add(2, 3))\n}" },
        { t: "h", text: "Әдепкі мән және атаулы аргумент" },
        { t: "try", code: 'fun greet(name: String, greeting: String = "Сәлем") = "€greeting, €name!"\n\nfun main() {\n    println(greet("Аян"))\n    println(greet(name = "Дана", greeting = "Қайырлы таң"))\n}' },
        { t: "h", text: "Рекурсия" },
        { t: "p", html: "Функция өзін өзі шақыра алады. Тек тоқтайтын жағдай (<b>база</b>) болуы керек:" },
        { t: "try", code: "fun fact(n: Int): Int {\n    if (n <= 1) return 1\n    return n * fact(n - 1)\n}\n\nfun main() {\n    println(fact(5))\n}" },
        { t: "warn", html: "Тоқтау шарты жоқ рекурсия шексіз кетіп, <code>StackOverflowError</code> қатесін береді." },
      ],
    },
    {
      id: "l6", topic: "6", title: "Тізімдер, Map, лямбда", minutes: 5,
      blocks: [
        { t: "p", html: "Көп мәнді бір жерде сақтау үшін <b>жинақтар</b> керек. Ең көп қолданылатыны — тізім (<code>List</code>)." },
        { t: "try", code: 'fun main() {\n    val fruits = listOf("алма", "алмұрт", "өрік")\n    println(fruits.size)\n    println(fruits[0])\n    for (f in fruits) {\n        println(f)\n    }\n}', note: "Элемент нөмірі 0-ден басталады." },
        { t: "list", items: ["<code>listOf(…)</code> — өзгермейтін тізім", "<code>mutableListOf(…)</code> — <code>add</code>, <code>remove</code> арқылы өзгереді", "<code>mapOf(\"а\" to 1)</code> — кілт → мән жұптары", "<code>setOf(…)</code> — қайталанбайтын мәндер"] },
        { t: "try", code: "fun main() {\n    val nums = mutableListOf(1, 2, 3)\n    nums.add(4)\n    println(nums)\n    println(nums.sum())\n}" },
        { t: "h", text: "Лямбда: қысқа функция" },
        { t: "p", html: "Тізімді өңдеуге арналған күшті әдістер бар. Оларға <b>лямбда</b> беріледі — <code>{ … }</code> ішіндегі қысқа функция. Ағымдағы элемент <code>it</code> деп аталады:" },
        { t: "try", code: "fun main() {\n    val nums = listOf(1, 2, 3, 4, 5, 6)\n    println(nums.filter { it % 2 == 0 })\n    println(nums.map { it * it })\n    println(nums.filter { it > 2 }.map { it * 10 })\n}" },
        { t: "list", items: ["<code>filter { … }</code> — шартқа сай келетіндерін қалдырады", "<code>map { … }</code> — әр элементті өзгертіп жаңа тізім жасайды", "<code>sum()</code>, <code>max()</code>, <code>min()</code>, <code>average()</code>", "<code>any { … }</code>, <code>all { … }</code>, <code>count { … }</code>"] },
        { t: "h", text: "Map" },
        { t: "try", code: 'fun main() {\n    val ages = mapOf("Аян" to 12, "Дана" to 11)\n    println(ages["Аян"])\n    for ((name, age) in ages) {\n        println("€name: €age")\n    }\n}' },
      ],
    },
    {
      id: "l7", topic: "7", title: "Кластар", minutes: 5,
      blocks: [
        { t: "p", html: "Класс — объектінің қалыбы. Ол деректерді (<b>қасиеттер</b>) және әрекеттерді (<b>функциялар</b>) бір жерге жинайды." },
        { t: "try", code: 'class Dog(val name: String) {\n    fun bark() {\n        println("€name: Гав!")\n    }\n}\n\nfun main() {\n    val d = Dog("Шарик")\n    d.bark()\n    println(d.name)\n}', note: "Оң жақтағы «d» қорабын қара: ішінде объект тұр." },
        { t: "h", text: "data class" },
        { t: "p", html: "Тек деректер сақтайтын класқа <code>data</code> қос: ол өзі әдемі мәтінге айналады, салыстырылады, көшіріледі." },
        { t: "try", code: "data class Point(val x: Int, val y: Int)\n\nfun main() {\n    val p = Point(1, 2)\n    println(p)\n    println(p.copy(y = 9))\n    println(p == Point(1, 2))\n}" },
        { t: "h", text: "enum class" },
        { t: "p", html: "Алдын ала белгілі мәндер тізімі:" },
        { t: "try", code: 'enum class Light { RED, YELLOW, GREEN }\n\nfun main() {\n    val l = Light.GREEN\n    val s = when (l) {\n        Light.RED -> "тоқта"\n        Light.YELLOW -> "күт"\n        Light.GREEN -> "жүр"\n    }\n    println(s)\n}' },
        { t: "h", text: "Мұра" },
        { t: "p", html: "Бір класс екіншісінің қасиеттерін мұра ете алады. Kotlin-де мұрагерлікке рұқсат беру үшін <code>open</code> деп жазу керек:" },
        { t: "try", code: 'open class Animal(val name: String) {\n    open fun sound(): String = "..."\n}\n\nclass Cat(name: String) : Animal(name) {\n    override fun sound(): String = "Мияу"\n}\n\nfun main() {\n    val a: Animal = Cat("Мурка")\n    println(a.name + ": " + a.sound())\n}' },
        { t: "tip", html: "Бұл курста Kotlin-нің негізгі бөлігі бар. Жиі кездесетін <code>companion object</code>, екінші конструктор, ішкі кластар сияқты нәрселер кейінірек үйренерсің." },
      ],
    },
  ];

  /* ---------- Анықтамалық ---------- */
  c.reference = [
    { term: "fun main()", text: "Бағдарлама осы функциядан басталады.", code: 'fun main() {\n    println("Сәлем")\n}' },
    { term: "println()", text: "Мәнді экранға шығарады да, жаңа жолға түседі. print() — жолды ауыстырмайды.", code: 'fun main() {\n    println("Сәлем")\n    println(2 + 3)\n}' },
    { term: "Комментарий (//)", text: "// белгісінен кейінгі жазуды компьютер өткізіп жібереді. Көп жолға: /* … */", code: "fun main() {\n    // бұл түсініктеме\n    println(1)\n}" },
    { term: "val және var", text: "val — өзгермейтін қорап, var — өзгеретін қорап.", code: "fun main() {\n    val pi = 3.14\n    var x = 5\n    x = 6\n    println(x)\n}" },
    { term: "Типтер", text: "Int (бүтін), Double (ондық), String (мәтін), Boolean (true/false), Char (таңба).", code: "fun main() {\n    val a: Int = 5\n    val b: Double = 2.5\n    val c = \"мәтін\"\n    println(a)\n}" },
    { term: "Арифметика", text: "+ − * / және % (қалдық). Int / Int — бүтін бөлу.", code: "fun main() {\n    println(7 / 2)\n    println(7 % 2)\n    println(7.0 / 2)\n}" },
    { term: "Мәтін шаблоны", text: "Мәтін ішінде €қорап не €{өрнек}.", code: 'fun main() {\n    val n = 3\n    println("n = €n, екі есе = €{n * 2}")\n}' },
    { term: "null және ?", text: "Тип?: null қабылдайды. ?. — қауіпсіз шақыру, ?: — әдепкі мән, !! — «бос емеспін» деп жариялау (қауіпті).", code: 'fun main() {\n    var s: String? = null\n    println(s?.length)\n    println(s ?: "бос")\n}' },
    { term: "if / else", text: "Шартқа қарай жүру. Өрнек ретінде мән қайтарады.", code: 'fun main() {\n    val x = 3\n    val r = if (x > 5) "үлкен" else "кіші"\n    println(r)\n}' },
    { term: "when", text: "Көп таңдау: мәндер, диапазондар (in), типтер (is), шарттар.", code: 'fun main() {\n    val x = 7\n    when {\n        x < 5 -> println("аз")\n        x < 10 -> println("орташа")\n        else -> println("көп")\n    }\n}' },
    { term: "for және диапазон", text: "1..5, 1 until 5, 5 downTo 1, step.", code: "fun main() {\n    for (i in 1..9 step 4) {\n        println(i)\n    }\n}" },
    { term: "while", text: "Шарт ақиқат болғанша қайталайды.", code: "fun main() {\n    var n = 3\n    while (n > 0) {\n        println(n)\n        n--\n    }\n}" },
    { term: "Функция", text: "fun аты(параметр: Тип): Қайтару_типі. Әдепкі мән: b: Int = 10.", code: "fun add(a: Int, b: Int = 10): Int {\n    return a + b\n}\n\nfun main() {\n    println(add(1))\n    println(add(1, 2))\n}" },
    { term: "listOf, mutableListOf", text: "Тізім. add, remove, size, [индекс], contains, sorted.", code: "fun main() {\n    val a = mutableListOf(3, 1, 2)\n    a.add(0)\n    println(a.sorted())\n    println(a.size)\n}" },
    { term: "filter, map, лямбда", text: "{ … } — қысқа функция, it — ағымдағы элемент.", code: "fun main() {\n    val a = listOf(1, 2, 3, 4)\n    println(a.filter { it > 2 })\n    println(a.map { it * 3 })\n}" },
    { term: "mapOf", text: "Кілт → мән жұптары. m[кілт] арқылы оқиды.", code: 'fun main() {\n    val m = mapOf("а" to 1, "ә" to 2)\n    println(m["ә"])\n}' },
    { term: "class", text: "Қасиеттер мен функциялары бар қалып.", code: 'class Dog(val name: String) {\n    fun bark() = println("€name: Гав!")\n}\n\nfun main() {\n    Dog("Шарик").bark()\n}' },
    { term: "data class", text: "Деректер класы: toString, ==, copy өзі бар.", code: "data class P(val x: Int, val y: Int)\n\nfun main() {\n    println(P(1, 2).copy(y = 7))\n}" },
    { term: "enum class", text: "Алдын ала белгілі мәндер.", code: "enum class Color { RED, GREEN }\n\nfun main() {\n    println(Color.GREEN)\n}" },
    { term: "open, override", text: "Мұра: open класс/функцияны бала класс override етеді.", code: 'open class A { open fun f() = "A" }\nclass B : A() { override fun f() = "B" }\n\nfun main() {\n    println(B().f())\n}' },
    { term: "try / catch", text: "Қатені ұстау.", code: 'fun main() {\n    try {\n        println(10 / 0)\n    } catch (e: ArithmeticException) {\n        println("Нөлге бөлуге болмайды")\n    }\n}' },
  ];

  /* « € » белгісін « $ » қылып ауыстыру (JS шаблонымен шатаспау үшін) */
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
