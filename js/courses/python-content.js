/* Python курсы: лекциялар, қосымша тапсырмалар, анықтамалық */
(() => {
  const c = KZ.getCourse("python");

  /* ---------- Қосымша (күрделірек) тапсырмалар ---------- */
  c.bonus = [
    {
      id: "B1",
      title: "Үштің кестесі",
      task:
        "<p>3-тің көбейту кестесін шығар: <code>3, 6, 9, 12, 15</code>. Әр сан жаңа жолда тұрсын.</p>" +
        "<p class='tip'><code>range(1, 6)</code> дегені 1, 2, 3, 4, 5 сандарын береді (соңғы сан кірмейді). " +
        "Әр санды 3-ке көбейт: <code>i * 3</code>.</p>",
      hint: "for i in range(1, 6): ішінде print(i * 3).",
      starter: "# 3-тің кестесін for циклімен шығар\n",
      solution: "for i in range(1, 6):\n    print(i * 3)\n",
      par: 2,
      robot: null,
      check: { output: "3\n6\n9\n12\n15", requireFor: true },
    },
    {
      id: "B2",
      title: "Ең үлкен сан",
      task:
        "<p>Тізімдегі ең үлкен санды тап та, экранға шығар. <code>max()</code> мен <code>sort()</code> қолдануға болмайды, өзің тап!</p>" +
        "<p class='tip'>Ой: алдымен бірінші санды «ең үлкен» деп ал. Сосын тізімді аралап, одан үлкен сан кездессе, қорапты жаңарт.</p>",
      hint: "engi = sandar[0] деп баста. for x in sandar: ішінде if x > engi: engi = x. Соңында print(engi).",
      starter: "sandar = [4, 17, 9, 12]\n# max() қолданбай, ең үлкен санды тап\n",
      solution:
        "sandar = [4, 17, 9, 12]\nengi = sandar[0]\nfor x in sandar:\n    if x > engi:\n        engi = x\nprint(engi)\n",
      par: 6,
      robot: null,
      check: {
        requireFor: true,
        requireIf: true,
        requireList: true,
        forbid: [
          { re: /\bmax\s*\(/, msg: "max() қолданба, өзің тап!" },
          { re: /\bsorted\s*\(|\.sort\s*\(/, msg: "sort() қолданба, өзің тап!" },
        ],
        fn(res) {
          const v = res.vars.sandar;
          if (!v || !v.i) return "«sandar» тізімін өшірме.";
          const want = String(Math.max(...v.i.map((s) => parseInt(s, 10))));
          if (res.output.trim() !== want) {
            return "Жауап " + want + " болуы керек, ал экранда: «" + res.output.trim() + "».";
          }
          return null;
        },
      },
    },
    {
      id: "B3",
      title: "Қабырғаны айналып өт",
      task:
        "<p>Ортада қабырға тұр, оның үстінде және астында саңылау бар. Роботты қабырғаны айналдырып, жұлдызға жеткіз.</p>" +
        "<p class='tip'>Алдымен қабырғаға жақындап, жоғары көтеріл, қабырғадан асып өт, сосын төмен түс.</p>",
      hint: "alga(2), solga(), alga(2), onga(), alga(3), onga(), alga(2), zhinau().",
      starter: "# қабырғаны айналып өт\n",
      solution: "alga(2)\nsolga()\nalga(2)\nonga()\nalga(3)\nonga()\nalga(2)\nzhinau()\n",
      par: 8,
      robot: {
        cols: 6, rows: 5, start: { x: 0, y: 2, d: 1 },
        stars: [[5, 2]], walls: [[3, 1], [3, 2], [3, 3]],
      },
      check: { collectAll: true },
    },
  ];

  /* ---------- Лекциялар ---------- */
  c.lectures = [
    {
      id: "l1", topic: "1", title: "Айнымалы дегеніміз не?", minutes: 3,
      blocks: [
        { t: "p", html: "Компьютер ақпаратты <b>қораптарда</b> сақтайды. Әр қорапта <b>аты</b> бар, ішінде <b>мәні</b> тұрады. Бағдарламалауда мұндай қорапты <b>айнымалы</b> дейді." },
        { t: "boxes", items: [{ n: "x", v: "5" }, { n: "name", v: '"Алия"' }, { n: "bala", v: "12" }], caption: "Үш қорап: әрқайсысының аты және мәні бар." },
        { t: "h", text: "Қорап жасау" },
        { t: "p", html: "Теңдік белгісі <code>=</code> мұнда «тең» емес, «<b>сал</b>» дегенді білдіреді. <code>x = 5</code> дегені: 5 санын x қорабына сал." },
        { t: "try", code: "x = 5\nprint(x)", note: "Іске қосып, оң жақтағы қорапты көр." },
        { t: "p", html: "Қорапқа жаңа мән салсаң, ескісі өшеді:" },
        { t: "try", code: "x = 5\nx = 9\nprint(x)" },
        { t: "h", text: "Сан және мәтін" },
        { t: "p", html: "Мәтін міндетті түрде <b>тырнақшада</b> жазылады: <code>\"Алия\"</code>. Сан тырнақсыз: <code>5</code>. Сандарды да, мәтіндерді де қосуға болады:" },
        { t: "try", code: 'a = 5\nb = 3\nprint(a + b)\nprint("Сәлем, " + "Алия")' },
        { t: "warn", html: "<code>\"5\"</code> (тырнақпен) мәтін болады, ал <code>5</code> сан. <code>\"5\" + \"5\"</code> нәтижесі <code>55</code>, ал <code>5 + 5</code> нәтижесі <code>10</code>." },
        { t: "tip", html: "Қорап атында бос орын болмайды және ат санмен басталмайды: <code>my_name</code> дұрыс, <code>1x</code> қате." },
      ],
    },
    {
      id: "l2", topic: "2", title: "Робот және командалар", minutes: 3,
      blocks: [
        { t: "p", html: "Бағдарлама дегеніміз компьютерге берілген <b>нұсқаулар тізімі</b>. Компьютер оларды жоғарыдан төмен қарай, <b>бір-бірден</b> орындайды." },
        { t: "board", cfg: { cols: 5, rows: 3, start: { x: 0, y: 1, d: 1 }, stars: [[4, 1]] }, caption: "Робот жұлдызға жетуі керек. Бетіндегі үшбұрыш оның қай жаққа қарап тұрғанын көрсетеді." },
        { t: "h", text: "Роботтың командалары" },
        { t: "list", items: [
          "<code>alga()</code> алға 1 қадам. <code>alga(3)</code> 3 қадам.",
          "<code>onga()</code> оң жағына бұрылады.",
          "<code>solga()</code> сол жағына бұрылады.",
          "<code>zhinau()</code> тұрған жердегі жұлдызды жинайды.",
        ] },
        { t: "try", code: "alga(3)\nonga()\nalga(1)", note: "Роботтың қалай жүргенін қадамдап көр." },
        { t: "tip", html: "Командалардың <b>реті маңызды</b>: алдымен жүріп, сосын бұрылу мен алдымен бұрылып, сосын жүру әртүрлі нәтиже береді." },
        { t: "warn", html: "Робот қабырғаға соқса, бағдарлама тоқтап, қате шығады. Қателерден қорықпа: олар қайда қателескеніңді көрсетеді." },
      ],
    },
    {
      id: "l3", topic: "3", title: "for циклі: қайталау", minutes: 4,
      blocks: [
        { t: "p", html: "Бір команданы 10 рет қайталау керек болса, оны 10 рет жазудың қажеті жоқ. <b>Циклге</b> қайталауды тапсыр." },
        { t: "code", code: "# циклсіз:\nalga()\nalga()\nalga()\n\n# циклмен:\nfor i in range(3):\n    alga()" },
        { t: "p", html: "<code>range(3)</code> дегені «3 рет» дегенді білдіреді, сонда <code>i</code> қорабы 0, 1, 2 болып өзгереді. Ол санауыш қызметін атқарады." },
        { t: "boxes", items: [{ n: "i", v: "0" }, { n: "i", v: "1" }, { n: "i", v: "2" }], caption: "Цикл айналған сайын i қорабындағы сан өзгереді." },
        { t: "try", code: "for i in range(3):\n    print(i)", note: "Оң жақтағы «i» қорабына қара." },
        { t: "warn", html: "<b>Шегініс</b> өте маңызды! Цикл ішіндегі жолдардың алдында 4 бос орын тұруы керек. Шегініссіз жол циклдің сыртында қалады." },
        { t: "try", code: "for i in range(4):\n    alga()\n    zhinau()", note: "Робот 4 рет қайталайды." },
      ],
    },
    {
      id: "l4", topic: "4", title: "if / else: шешім қабылдау", minutes: 4,
      blocks: [
        { t: "p", html: "Бағдарлама бір нәрсені тексеріп, <b>жағдайға қарай</b> әртүрлі әрекет жасай алады. Ол үшін <code>if</code> (егер) және <code>else</code> (әйтпесе) қолданылады." },
        { t: "try", code: 'x = 7\nif x > 5:\n    print("үлкен")\nelse:\n    print("кіші")' },
        { t: "p", html: "Шарт ақиқат (<code>True</code>) болса, <code>if</code> ішіндегі жолдар орындалады. Болмаса, <code>else</code> ішіндегілері орындалады." },
        { t: "h", text: "Салыстыру белгілері" },
        { t: "list", items: [
          "<code>==</code> тең, <code>!=</code> тең емес",
          "<code>&lt;</code> кіші, <code>&gt;</code> үлкен",
          "<code>&lt;=</code> кіші не тең, <code>&gt;=</code> үлкен не тең",
        ] },
        { t: "warn", html: "<code>=</code> бір рет жазылса, қорапқа мән салады. Екі рет, <code>==</code>, салыстырады. Екеуін шатастырма!" },
        { t: "h", text: "Қалдық: жұп па, тақ па?" },
        { t: "p", html: "<code>%</code> белгісі бөлгендегі қалдықты береді: <code>7 % 2</code> нәтижесі 1. Жұп сан 2-ге қалдықсыз бөлінеді, сондықтан <code>x % 2 == 0</code> жұп сан үшін ақиқат." },
        { t: "try", code: "print(7 % 2)\nprint(8 % 2)" },
        { t: "h", text: "Робот сенсорлары" },
        { t: "list", items: [
          "<code>zhuldyz_bar()</code>: робот тұрған жерде жұлдыз бар ма?",
          "<code>aldy_bos()</code>: алдында бос орын бар ма (қабырға жоқ па)?",
        ] },
        { t: "try", code: "if aldy_bos():\n    alga()\nelse:\n    onga()" },
        { t: "tip", html: "Үш не одан көп жағдай болса, <code>elif</code> (әйтпесе егер) қосуға болады: <code>if … elif … else</code>." },
      ],
    },
    {
      id: "l5", topic: "5", title: "while циклі", minutes: 3,
      blocks: [
        { t: "p", html: "<code>for</code> қанша рет қайталау керегі белгілі болғанда қолданылады. Ал <code>while</code> (<b>болғанша</b>) шарт ақиқат болып тұрғанша қайталай береді." },
        { t: "try", code: "i = 1\nwhile i <= 3:\n    print(i)\n    i = i + 1", note: "i қорабы қалай өзгеретінін көр." },
        { t: "warn", html: "Цикл ішінде шартқа әсер ететін нәрсені өзгертуді ұмытпа (мысалы, <code>i = i + 1</code>). Әйтпесе цикл <b>ешқашан тоқтамайды</b>. Бізде мұндай бағдарлама 3000 қадамнан кейін өздігінен тоқтайды." },
        { t: "h", text: "Роботпен while" },
        { t: "p", html: "Жолдың ұзындығын санамай-ақ, қабырғаға дейін жүруге болады:" },
        { t: "try", code: "while aldy_bos():\n    alga()" },
        { t: "tip", html: "Қайталау санын білсең, <code>for</code> қолдан. Қашан тоқтайтыны белгісіз болса, <code>while</code> қолдан." },
      ],
    },
    {
      id: "l6", topic: "6", title: "Функциялар", minutes: 4,
      blocks: [
        { t: "p", html: "<b>Функция</b> дегеніміз атауы бар командалар тобы. Оны бір рет жазасың, ал көп рет шақыра аласың." },
        { t: "try", code: "def eki_kadam():\n    alga(2)\n    zhinau()\n\neki_kadam()\neki_kadam()", note: "Функцияны екі рет шақырдық." },
        { t: "list", items: [
          "<code>def</code> функцияны жасайды. Ішіндегі жолдар 4 бос орынмен шегінеді.",
          "<code>eki_kadam()</code> оны орындайды (шақырады).",
        ] },
        { t: "warn", html: "Функцияны <b>алдымен жасап</b>, содан кейін шақыру керек. Жасамай тұрып шақырсаң, компьютер оны танымайды." },
        { t: "h", text: "Параметр және return" },
        { t: "p", html: "Функцияға мән беруге болады (<b>параметр</b>), ал ол нәтижені <code>return</code> арқылы қайтарады." },
        { t: "try", code: "def qosu(a, b):\n    return a + b\n\nprint(qosu(3, 4))", note: "Функция жұмыс істеп тұрғанда a және b қораптары пайда болады." },
        { t: "tip", html: "<code>return</code> нәтижені қайтарады, <code>print</code> оны экранға шығарады. Бұл екеуі әртүрлі!" },
      ],
    },
    {
      id: "l7", topic: "7", title: "Тізімдер", minutes: 4,
      blocks: [
        { t: "p", html: "Көп мәнді бір қорапта сақтағың келсе, <b>тізім</b> қолданылады. Ол қатар тұрған қораптар сияқты, әрқайсысының өз нөмірі бар." },
        { t: "arr", name: "zhemister", items: ['"алма"', '"алмұрт"', '"шие"'], caption: "Нөмір 1-ден емес, 0-ден басталады!" },
        { t: "try", code: 'zhemister = ["алма", "алмұрт", "шие"]\nprint(zhemister[0])\nprint(len(zhemister))' },
        { t: "list", items: [
          "<code>zhemister[0]</code> бірінші элемент.",
          "<code>len(zhemister)</code> тізімнің ұзындығы.",
          "<code>zhemister.append(\"жүзім\")</code> соңына жаңа элемент қосады.",
        ] },
        { t: "h", text: "Тізім және for" },
        { t: "p", html: "<code>for x in тізім:</code> тізімнің әр элементін бір-бірден <code>x</code> қорабына салып береді:" },
        { t: "try", code: 'sandar = [3, 8, 5]\nsoma = 0\nfor x in sandar:\n    soma = soma + x\nprint(soma)', note: "soma қорабы қалай өсетінін көр." },
        { t: "tip", html: "Бос тізім: <code>[]</code>. Оған <code>append</code> арқылы элемент қосып, тізімді өзің толтыра аласың." },
      ],
    },
  ];

  /* ---------- Анықтамалық ---------- */
  c.reference = [
    { term: "print()", text: "Мәнді экранға шығарады.", code: 'print("Сәлем")\nprint(2 + 3)' },
    { term: "Комментарий (#)", text: "# белгісінен кейінгі жазу компьютерге керек емес, ол тек адамға арналған түсініктеме.", code: "# бұл түсініктеме\nprint(1)" },
    { term: "Айнымалы", text: "Мән сақталатын, аты бар қорап. Жасау үшін = қолданылады.", code: "x = 5\nname = \"Алия\"\nprint(x, name)" },
    { term: "Типтер: int, float, str, bool", text: "int бүтін сан, float бөлшек сан, str мәтін, bool ақиқат (True) не жалған (False).", code: "print(type(5))\nprint(type(2.5))\nprint(type(\"сәлем\"))\nprint(type(True))" },
    { term: "Арифметика", text: "+ қосу, - алу, * көбейту, / бөлу, ** дәреже, % қалдық, // бүтін бөлу.", code: "print(7 + 2)\nprint(7 % 2)\nprint(2 ** 3)\nprint(7 // 2)" },
    { term: "Салыстыру", text: "== тең, != тең емес, < кіші, > үлкен, <= кіші не тең, >= үлкен не тең. Нәтиже True не False.", code: "print(5 > 3)\nprint(5 == 6)" },
    { term: "if / elif / else", text: "Шартқа қарай әртүрлі әрекет жасайды. Ішіндегі жолдар 4 бос орынмен шегінеді.", code: "x = 7\nif x > 10:\n    print(\"өте үлкен\")\nelif x > 5:\n    print(\"үлкен\")\nelse:\n    print(\"кіші\")" },
    { term: "for және range()", text: "Командаларды белгілі рет қайталайды. range(3) → 0, 1, 2. range(1, 4) → 1, 2, 3.", code: "for i in range(1, 4):\n    print(i)" },
    { term: "while", text: "Шарт ақиқат болғанша қайталайды. Шартқа әсер ететін мәнді өзгертуді ұмытпа!", code: "i = 3\nwhile i > 0:\n    print(i)\n    i = i - 1" },
    { term: "def және return", text: "def функцияны жасайды, return нәтижені қайтарады.", code: "def eseptell(a, b):\n    return a * b\n\nprint(eseptell(4, 5))" },
    { term: "Тізім", text: "Қатар тұрған қораптар. Нөмір 0-ден басталады. append қосады, len ұзындығын береді.", code: "t = [10, 20, 30]\nt.append(40)\nprint(t[0], len(t))" },
    { term: "for x in тізім", text: "Тізімнің әр элементін бір-бірден алады.", code: "for x in [1, 2, 3]:\n    print(x * 10)" },
    { term: "Робот командалары", text: "alga(n) алға, onga() оңға бұрыл, solga() солға бұрыл, zhinau() жұлдыз жина.", code: "alga(3)\nonga()\nalga(2)\nzhinau()" },
    { term: "Робот сенсорлары", text: "zhuldyz_bar(): тұрған жерде жұлдыз бар ма. aldy_bos(): алдында бос орын бар ма.", code: "while aldy_bos():\n    alga()\n    if zhuldyz_bar():\n        zhinau()" },
  ];
})();
