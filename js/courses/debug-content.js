/* Қате тап: ішінде қатесі бар дайын код. Оқушы қатені тауып, түзетеді.
   Деңгейлер «қосымша» тізімінің соңына қосылады (debug: true). */
(() => {
  const TIP_RUN = "<p class='tip'>Кодты іске қос: қате хабары қай жолда ақау барын көрсетеді. Қадамдап өтіп, қораптарды да бақыла.</p>";
  const D = (o) => Object.assign({ debug: true }, o);

  const py = [
    D({
      id: "D1", title: "Жабылмаған тырнақша",
      task: "<p>Бұл код экранға <code>Сәлем, әлем!</code> шығаруы керек, бірақ қате береді. Қатені тауып түзет.</p>" + TIP_RUN,
      hint: "Мәтіннің басында тырнақша бар, ал соңында жоқ. Жақшаның алдынан тырнақшаны жап.",
      starter: 'print("Сәлем, әлем!)\n', solution: 'print("Сәлем, әлем!")\n', par: 1, robot: null,
      check: { output: "Сәлем, әлем!" },
    }),
    D({
      id: "D2", title: "Қос нүкте жоқ",
      task: "<p>Код <code>0, 1, 2</code> сандарын шығаруы керек (әрқайсысы жаңа жолда). Қатені түзет.</p>" + TIP_RUN,
      hint: "for жолының соңына қос нүкте «:» қою керек.",
      starter: "for i in range(3)\n    print(i)\n", solution: "for i in range(3):\n    print(i)\n", par: 2, robot: null,
      check: { output: "0\n1\n2", requireFor: true },
    }),
    D({
      id: "D3", title: "Қате жазылған ат",
      task: "<p><b>sandar</b> қорабындағы санды екіге көбейтіп шығару керек: <code>10</code>. Бірақ код қате береді.</p>" + TIP_RUN,
      hint: "print ішіндегі қорап атын sandar қорабының атымен салыстыр: әріптері бірдей ме?",
      starter: "sandar = 5\nprint(sanar * 2)\n", solution: "sandar = 5\nprint(sandar * 2)\n", par: 2, robot: null,
      check: { output: "10", vars: { sandar: "5" } },
    }),
    D({
      id: "D4", title: "Бір теңдік жеткіліксіз",
      task: "<p>Егер <code>x</code> сегізге тең болса, экранға <code>сегіз</code> шығуы керек. Код қате береді.</p>" + TIP_RUN,
      hint: "Шартта салыстыру үшін екі теңдік белгісі керек: ==. Бір теңдік (=) мән береді.",
      starter: 'x = 8\nif x = 8:\n    print("сегіз")\n', solution: 'x = 8\nif x == 8:\n    print("сегіз")\n', par: 3, robot: null,
      check: { output: "сегіз", requireIf: true },
    }),
    D({
      id: "D5", title: "Шегініс жоқ",
      task: "<p>Цикл <code>0, 2, 4</code> сандарын шығаруы керек. Қатені түзет.</p>" + TIP_RUN,
      hint: "for жолынан кейінгі жол ішке кіруі керек: алдына 4 бос орын қой.",
      starter: "for i in range(3):\nprint(i * 2)\n", solution: "for i in range(3):\n    print(i * 2)\n", par: 2, robot: null,
      check: { output: "0\n2\n4", requireFor: true },
    }),
    D({
      id: "D6", title: "Мәтін мен сан",
      task: "<p>Экранға <code>Жасым: 12</code> шығуы керек. Код қате береді, себебі мәтінді санмен қосуға болмайды.</p>" + TIP_RUN,
      hint: "Санды мәтінге айналдыр: str(age).",
      starter: 'age = 12\nprint("Жасым: " + age)\n', solution: 'age = 12\nprint("Жасым: " + str(age))\n', par: 2, robot: null,
      check: { output: "Жасым: 12", vars: { age: "12" } },
    }),
    D({
      id: "D7", title: "Қосынды сәйкес емес",
      task: "<p><code>1 + 2 + 3 + 4 + 5</code> қосындысы <code>15</code> болуы керек. Код қате хабарын бермейді, бірақ жауабы дұрыс емес. Қадамдап өтіп, <b>total</b> қорабын бақыла.</p>",
      hint: "range(1, 5) соңғы санды (5) қоспайды. Шекті бір санға үлкейт.",
      starter: "total = 0\nfor i in range(1, 5):\n    total = total + i\nprint(total)\n",
      solution: "total = 0\nfor i in range(1, 6):\n    total = total + i\nprint(total)\n", par: 4, robot: null,
      check: { output: "15", requireFor: true },
    }),
    D({
      id: "D8", title: "Тізім шегінен шықты",
      task: "<p>Тізімнің <b>соңғы</b> элементін (<code>15</code>) шығару керек. Код қате береді.</p>" + TIP_RUN,
      hint: "Тізімде 3 элемент: нөмірлері 0, 1, 2. Нөмір 3 жоқ.",
      starter: "a = [4, 8, 15]\nprint(a[3])\n", solution: "a = [4, 8, 15]\nprint(a[2])\n", par: 2, robot: null,
      check: { output: "15", requireList: true },
    }),
    D({
      id: "D9", title: "Шексіз цикл",
      task: "<p>Кері санау: <code>3, 2, 1</code>. Бірақ бағдарлама тоқтамайды. Себебін тап: қорап мәні өзгеріп тұр ма? Қадамдап өтіп көр.</p>",
      hint: "while шарты n > 0. Цикл ішінде n мәнін азайту керек: n = n - 1.",
      starter: "n = 3\nwhile n > 0:\n    print(n)\n", solution: "n = 3\nwhile n > 0:\n    print(n)\n    n = n - 1\n", par: 4, robot: null,
      check: { output: "3\n2\n1", requireWhile: true },
    }),
    D({
      id: "D10", title: "Екі қате бір кодта",
      task: "<p>Функция санды екі есе арттырып, <code>8</code> шығаруы керек. Кодта <b>екі</b> қате бар: біреуін түзетсең, екіншісі шығады.</p>" + TIP_RUN,
      hint: "def жолының соңында «:» жоқ. Соңғы жолда жақша жабылмаған.",
      starter: "def eki(x)\n    return x * 2\nprint(eki(4)\n", solution: "def eki(x):\n    return x * 2\nprint(eki(4))\n", par: 3, robot: null,
      check: { output: "8", requireDef: true },
    }),
    D({
      id: "D11", title: "Return ұмытылған",
      task: "<p><code>qos(2, 3)</code> нәтижесі <code>5</code> болуы керек, бірақ экранда <code>None</code> шығады. Функция жауабын қайтарып тұр ма?</p>",
      hint: "Функция ішінде нәтижені return арқылы қайтару керек: return a + b.",
      starter: "def qos(a, b):\n    a + b\nprint(qos(2, 3))\n", solution: "def qos(a, b):\n    return a + b\nprint(qos(2, 3))\n", par: 3, robot: null,
      check: { output: "5", requireDef: true },
    }),
    D({
      id: "D12", title: "Шарт теріс жазылған",
      task: "<p>Жасы <code>15</code> болса, экранға <code>Бала</code> шығуы керек (18-ден кіші болса бала, әйтпесе ересек). Бірақ код керісінше жауап береді.</p>",
      hint: "Салыстыру белгісі дұрыс па? 15 > 18 жалған, ал бізге «кіші» керек: <.",
      starter: 'age = 15\nif age > 18:\n    print("Бала")\nelse:\n    print("Ересек")\n',
      solution: 'age = 15\nif age < 18:\n    print("Бала")\nelse:\n    print("Ересек")\n', par: 5, robot: null,
      check: { output: "Бала", requireIf: true },
    }),
  ];

  const js = [
    D({
      id: "D1", title: "Жабылмаған жақша",
      task: "<p>Экранға <code>Сәлем</code> шығуы керек, бірақ код қате береді.</p>" + TIP_RUN,
      hint: "console.log( жақшасы жабылмаған. Соңына ) қой.",
      starter: 'console.log("Сәлем";\n', solution: 'console.log("Сәлем");\n', par: 1,
      check: { output: "Сәлем" },
    }),
    D({
      id: "D2", title: "const өзгермейді",
      task: "<p><b>a</b> қорабы 1 еді, оны 1-ге арттырып <code>2</code> шығару керек. Код қате береді.</p>" + TIP_RUN,
      hint: "const қорабының мәнін өзгертуге болмайды. Өзгеретін мәнге let қолдан.",
      starter: "const a = 1;\na = a + 1;\nconsole.log(a);\n", solution: "let a = 1;\na = a + 1;\nconsole.log(a);\n", par: 3,
      check: { output: "2", vars: { a: "2" } },
    }),
    D({
      id: "D3", title: "Қате жазылған ат",
      task: "<p>Экранға <code>8</code> шығуы керек (<b>sany</b> қорабы екіге көбейтіледі). Код қате береді.</p>" + TIP_RUN,
      hint: "console.log ішіндегі қорап атын тексер: let sany = 4; деп жасалған.",
      starter: "let sany = 4;\nconsole.log(san * 2);\n", solution: "let sany = 4;\nconsole.log(sany * 2);\n", par: 2,
      check: { output: "8", vars: { sany: "4" } },
    }),
    D({
      id: "D4", title: "Бір теңдік жеткіліксіз",
      task: "<p><b>x</b> үшке тең, сондықтан экранға <code>бес емес</code> шығуы керек. Бірақ код <code>бес</code> дейді. Қателік қайда?</p>",
      hint: "Шартта = мән береді (x енді 5 болып қалады). Салыстыру үшін === жаз.",
      starter: 'let x = 3;\nif (x = 5) {\n  console.log("бес");\n} else {\n  console.log("бес емес");\n}\n',
      solution: 'let x = 3;\nif (x === 5) {\n  console.log("бес");\n} else {\n  console.log("бес емес");\n}\n', par: 6,
      check: { output: "бес емес", requireIf: true },
    }),
    D({
      id: "D5", title: "Массив шегінен шықты",
      task: "<p>Массивтің үш саны шығуы керек: <code>1, 2, 3</code>. Бірақ экранда артық жол шығады. Қадамдап өтіп, <b>i</b> қорабын бақыла.</p>",
      hint: "Массивтің нөмірлері 0, 1, 2. i < a.length болуы керек, i <= a.length емес.",
      starter: "const a = [1, 2, 3];\nfor (let i = 0; i <= a.length; i++) {\n  console.log(a[i]);\n}\n",
      solution: "const a = [1, 2, 3];\nfor (let i = 0; i < a.length; i++) {\n  console.log(a[i]);\n}\n", par: 4,
      check: { output: "1\n2\n3", requireFor: true, requireList: true },
    }),
    D({
      id: "D6", title: "Return ұмытылған",
      task: "<p><code>qos(2, 3)</code> нәтижесі <code>5</code> болуы керек, бірақ экранда <code>undefined</code> шығады.</p>",
      hint: "Функция жауапты return арқылы қайтаруы керек.",
      starter: "function qos(a, b) {\n  a + b;\n}\nconsole.log(qos(2, 3));\n",
      solution: "function qos(a, b) {\n  return a + b;\n}\nconsole.log(qos(2, 3));\n", par: 4,
      check: { output: "5", requireDef: true },
    }),
    D({
      id: "D7", title: "Шексіз цикл",
      task: "<p><code>0, 1, 2</code> шығуы керек, бірақ бағдарлама тоқтамайды. Шарт ешқашан жалған болмай тұр. Неге?</p>",
      hint: "while ішінде i мәні артпайды. i++ қос.",
      starter: "let i = 0;\nwhile (i < 3) {\n  console.log(i);\n}\n", solution: "let i = 0;\nwhile (i < 3) {\n  console.log(i);\n  i++;\n}\n", par: 5,
      check: { output: "0\n1\n2", requireWhile: true },
    }),
    D({
      id: "D8", title: "Табылмаған элемент",
      html: '<h1 id="title">Сәлем</h1>',
      task: "<p>Бет тақырыбы <b>Сәлем, әлем!</b> болуы керек, бірақ код қате береді. Элемент табылып жатыр ма?</p>" + TIP_RUN,
      hint: "HTML-да id=\"title\" деп жазылған. Кодта id әріптері дәл сондай болуы керек.",
      starter: 'document.getElementById("titel").textContent = "Сәлем, әлем!";\n',
      solution: 'document.getElementById("title").textContent = "Сәлем, әлем!";\n', par: 1,
      check: {
        fn(res) {
          const t = res.dom && res.dom.doc.getElementById("title");
          if (!t) return "Бетте «title» элементі жоқ.";
          return t.textContent.trim() === "Сәлем, әлем!" ? null : "Тақырып «Сәлем, әлем!» болуы керек, қазір: «" + t.textContent.trim() + "».";
        },
      },
    }),
  ];

  const html = [
    D({
      id: "D1", kind: "html", title: "Жабылмаған тег",
      task: "<p>Бетте бір ғана тақырып (<code>&lt;h1&gt;Сәлем&lt;/h1&gt;</code>) және бір абзац болуы керек. Бірақ тақырыптың жабатын тегі қате жазылған, сондықтан екі тақырып пайда болды. Түзет.</p>",
      hint: "Жабатын тегте қиғаш сызық болады: &lt;/h1&gt;.",
      starter: "<h1>Сәлем<h1>\n<p>Бұл абзац</p>\n", solution: "<h1>Сәлем</h1>\n<p>Бұл абзац</p>\n", par: 2,
      check: { rules: [
        { sel: "h1", count: 1, label: "Бір ғана <h1> тұр" },
        { sel: "h1", text: /^Сәлем$/, label: "Тақырып мәтіні «Сәлем»" },
        { sel: "h1 p", not: true, label: "Абзац тақырыптың ішінде емес" },
        { sel: "p", count: 1, text: /абзац/, label: "Бір <p> абзацы тұр" },
      ] },
    }),
    D({
      id: "D2", kind: "html", title: "Сурет көрінбейді",
      task: "<p>Жұлдыз суреті көрінбейді. Атрибуттың атында қате бар: суретке жол көрсететін атрибутты тап.</p>",
      hint: "Сурет жолы src атрибутымен беріледі (scr емес).",
      starter: '<img scr="assets/star.svg" alt="Жұлдыз">\n', solution: '<img src="assets/star.svg" alt="Жұлдыз">\n', par: 1,
      check: { rules: [{ sel: "img[src]", attr: { alt: /Жұлдыз/ }, label: "<img> src атрибутымен тұр" }] },
    }),
    D({
      id: "D3", kind: "html", title: "Сілтеме жұмыс істемейді",
      task: "<p>«Уикипедия» сілтемесі басқанда ешқайда апармайды. Атрибут атын түзет.</p>",
      hint: "Сілтеменің мекенжайы href атрибутында тұрады.",
      starter: '<a hre="https://kk.wikipedia.org">Уикипедия</a>\n', solution: '<a href="https://kk.wikipedia.org">Уикипедия</a>\n', par: 1,
      check: { rules: [{ sel: "a[href]", text: /Уикипедия/, label: "<a> href атрибутымен тұр" }] },
    }),
  ];

  const css = [
    D({
      id: "D1", kind: "css", title: "Нүктелі үтір жоқ",
      html: '<p class="a">Сәлем</p>',
      task: "<p>Мәтін қызыл болып, өлшемі <code>24px</code> болуы керек, бірақ екеуі де қолданылмай тұр. Бір жолда нүктелі үтір жетіспейді.</p>",
      hint: "Әр қасиеттің соңына «;» қою керек: color: red;",
      starter: ".a {\n  color: red\n  font-size: 24px;\n}\n", solution: ".a {\n  color: red;\n  font-size: 24px;\n}\n", par: 4,
      check: { rules: [{ sel: ".a", style: { color: "rgb(255, 0, 0)", fontSize: "24px" }, label: "Мәтін қызыл, 24px" }] },
    }),
    D({
      id: "D2", kind: "css", title: "Селектор қатесі",
      html: '<p class="note">Мәтін</p>',
      task: "<p><code>note</code> класындағы абзацтың фоны сары болуы керек, бірақ ешнәрсе өзгермейді.</p>",
      hint: "Класс селекторының алдына нүкте қою керек: .note",
      starter: "note {\n  background: yellow;\n}\n", solution: ".note {\n  background: yellow;\n}\n", par: 3,
      check: { rules: [{ sel: ".note", style: { backgroundColor: "rgb(255, 255, 0)" }, label: ".note фоны сары" }] },
    }),
    D({
      id: "D3", kind: "css", title: "Қасиет аты қате",
      html: '<div class="box"></div>',
      task: "<p>Қорап <code>100px × 100px</code> және көк болуы керек, бірақ түсі шықпай тұр. Қасиет атын қара.</p>",
      hint: "background деп жазылады (backround емес).",
      starter: ".box {\n  width: 100px;\n  height: 100px;\n  backround: blue;\n}\n", solution: ".box {\n  width: 100px;\n  height: 100px;\n  background: blue;\n}\n", par: 5,
      check: { rules: [{ sel: ".box", style: { width: "100px", height: "100px", backgroundColor: "rgb(0, 0, 255)" }, label: "Қорап 100×100, көк" }] },
    }),
    D({
      id: "D4", kind: "css", title: "Өлшем бірлігі жоқ",
      html: '<div class="box"></div>',
      task: "<p>Қораптың ені <code>120px</code>, биіктігі <code>60px</code> болуы керек, бірақ өлшемдері қолданылмай тұр.</p>",
      hint: "Санның соңына бірлік жаз: 120px.",
      starter: ".box {\n  width: 120;\n  height: 60;\n  background: orange;\n}\n", solution: ".box {\n  width: 120px;\n  height: 60px;\n  background: orange;\n}\n", par: 5,
      check: { rules: [{ sel: ".box", style: { width: "120px", height: "60px" }, label: "Қорап 120px × 60px" }] },
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
