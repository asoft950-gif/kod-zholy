/* Код Жолы: тапсырмалар және тексеру логикасы */
globalThis.KZ = globalThis.KZ || {};

KZ.commands = [
  { code: "alga()", help: "алға 1 қадам (alga(3) — 3 қадам)" },
  { code: "onga()", help: "оңға бұрылу" },
  { code: "solga()", help: "солға бұрылу" },
  { code: "zhinau()", help: "тұрған жердегі жұлдызды жинау" },
];

KZ.levels = [
  /* ---------- 1. Айнымалылар ---------- */
  {
    id: "1.1",
    topic: "1 · Айнымалылар: сан сақтайтын қораптар",
    title: "Екі қорап",
    task:
      "<p><b>a</b> қорабына <code>7</code> санын, <b>b</b> қорабына <code>3</code> санын сал. " +
      "Сосын екеуінің қосындысын <code>print</code> арқылы экранға шығар.</p>" +
      "<p class='tip'>Қорап жасау: <code>a = 7</code> — оң жақта «a» қорабы пайда болады.</p>",
    hint: "Алдымен a = 7 және b = 3 деп жаз. Содан кейін print(a + b) деп жаз. Оң жақтағы қораптарға қара: сандар соған түседі.",
    starter: "# a және b қораптарын жаса\n# қосындысын print-пен шығар\n",
    solution: "a = 7\nb = 3\nprint(a + b)\n",
    par: 3,
    robot: null,
    check: { output: "10", vars: { a: "7", b: "3" } },
  },
  {
    id: "1.2",
    topic: "1 · Айнымалылар: сан сақтайтын қораптар",
    title: "Сәлемдесу",
    task:
      "<p><b>name</b> қорабына өз атыңды жаз (тырнақшаға алып: <code>\"Алия\"</code>). " +
      "Сосын экранға <code>Сәлем, Алия!</code> сияқты сәлемдесу шығар. Алия орнында сенің атың тұруы керек.</p>" +
      "<p class='tip'>Мәтінді қосуға болады: <code>\"Сәлем, \" + name + \"!\"</code></p>",
    hint: "name = \"Алия\" деп жаз, сосын print(\"Сәлем, \" + name + \"!\"). Үтірден кейінгі бос орынды ұмытпа.",
    starter: "# name қорабына атыңды жаз\n# сәлемдесуді print-пен шығар\n",
    solution: 'name = "Алия"\nprint("Сәлем, " + name + "!")\n',
    par: 2,
    robot: null,
    check: {
      fn(res) {
        const v = res.vars.name;
        if (!v) return "«name» қорабы жасалмаған.";
        if (v.t !== "str") return "name қорабында мәтін болуы керек (тырнақшаға ал).";
        const want = "Сәлем, " + v.s + "!";
        if (res.output.trim() !== want) {
          return "Экранда «" + want + "» шығуы керек, ал қазір: «" + res.output.trim() + "»";
        }
        return null;
      },
    },
  },

  /* ---------- 2. Робот командалары ---------- */
  {
    id: "2.1",
    topic: "2 · Робот: командалар бір-бірден орындалады",
    title: "Бірінші қадам",
    task:
      "<p>Робот 🤖 жұлдызға ⭐ жетіп, оны жинауы керек. Роботтың бетіндегі үшбұрыш " +
      "оның қай жаққа қарап тұрғанын көрсетеді.</p>",
    hint: "alga(4) — робот 4 қадам алға жүреді. Жұлдызға жеткен соң zhinau() деп жаз.",
    starter: "# роботты жұлдызға жеткіз\n",
    solution: "alga(4)\nzhinau()\n",
    par: 2,
    robot: { cols: 5, rows: 3, start: { x: 0, y: 1, d: 1 }, stars: [[4, 1]] },
    check: { collectAll: true },
  },
  {
    id: "2.2",
    topic: "2 · Робот: командалар бір-бірден орындалады",
    title: "Бұрылыс",
    task:
      "<p>Жұлдыз бұрышта тұр. Робот оңға жүріп, сосын төмен қарай бұрылуы керек.</p>" +
      "<p class='tip'><code>onga()</code> — робот оң жағына бұрылады: оңға қарап тұрса, төмен қарайды.</p>",
    hint: "Алдымен alga(3), сосын onga(), сосын тағы alga(3). Ең соңында zhinau().",
    starter: "# роботты бұрылыспен жұлдызға жеткіз\n",
    solution: "alga(3)\nonga()\nalga(3)\nzhinau()\n",
    par: 4,
    robot: { cols: 5, rows: 5, start: { x: 0, y: 0, d: 1 }, stars: [[3, 3]] },
    check: { collectAll: true },
  },
  {
    id: "2.3",
    topic: "2 · Робот: командалар бір-бірден орындалады",
    title: "Екі жұлдыз",
    task:
      "<p>Екі жұлдыздың екеуін де жина. Әр жұлдызға жеткен сайын <code>zhinau()</code> жазуды ұмытпа.</p>",
    hint: "alga(3), zhinau(), onga(), alga(2), zhinau() — осы ретпен жазып көр.",
    starter: "# екі жұлдызды да жина\n",
    solution: "alga(3)\nzhinau()\nonga()\nalga(2)\nzhinau()\n",
    par: 5,
    robot: { cols: 6, rows: 4, start: { x: 0, y: 0, d: 1 }, stars: [[3, 0], [3, 2]] },
    check: { collectAll: true },
  },

  /* ---------- 3. for циклі ---------- */
  {
    id: "3.1",
    topic: "3 · for циклі: қайталауды компьютерге тапсыр",
    title: "Жолдағы жұлдыздар",
    task:
      "<p>Жолда 6 жұлдыз тұр. <code>alga()</code> мен <code>zhinau()</code> командасын 6 рет қолмен жазбай, " +
      "<code>for</code> циклін қолдан.</p>" +
      "<p class='tip'><code>for i in range(6):</code> — төмендегі шегінген жолдарды 6 рет қайталайды. " +
      "Шегініс — 4 бос орын. Оң жақтағы «i» қорабына қара: ол әр айналымда өзгереді.</p>",
    hint: "for i in range(6): деп жаз, келесі жолдарға 4 бос орын қойып, alga() және zhinau() жаз.",
    starter: "# for циклімен барлық жұлдызды жина\n",
    solution: "for i in range(6):\n    alga()\n    zhinau()\n",
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
    title: "Шаршы",
    task:
      "<p>Жұлдыздар шаршының төрт бұрышында тұр. Робот шаршы бойымен жүріп, төртеуін де жинасын.</p>" +
      "<p class='tip'>Шаршының бір қабырғасы: алға жүр, жұлдызды жина, оңға бұрыл. Төрт қабырға болғандықтан, цикл 4 рет қайталансын.</p>",
    hint: "for i in range(4): ішінде alga(4), zhinau(), onga() деп жаз.",
    starter: "# шаршы бойымен жүр\n",
    solution: "for i in range(4):\n    alga(4)\n    zhinau()\n    onga()\n",
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
    title: "Баспалдақ",
    task:
      "<p>Жұлдыздар баспалдақтың сатыларында тұр. Бір сатыны шығуды тап, сосын цикл оны қайталасын.</p>" +
      "<p class='tip'>Бір саты: алға, солға бұрыл, алға, оңға бұрыл, жұлдыз жина.</p>",
    hint: "for i in range(5): ішіне 5 команда жаз: alga(), solga(), alga(), onga(), zhinau().",
    starter: "# баспалдақпен жоғары көтеріл\n",
    solution:
      "for i in range(5):\n    alga()\n    solga()\n    alga()\n    onga()\n    zhinau()\n",
    par: 6,
    robot: {
      cols: 6, rows: 6, start: { x: 0, y: 5, d: 1 },
      stars: [[1, 4], [2, 3], [3, 2], [4, 1], [5, 0]],
    },
    check: { collectAll: true, requireFor: true },
  },
];

/* Жұлдыз саны: код неғұрлым қысқа болса, соғұрлым көп */
KZ.starsFor = function (level, lines) {
  if (lines <= level.par) return 3;
  if (lines <= level.par + 2) return 2;
  return 1;
};

/* Орындау нәтижесін тексеру. res: runner.py қайтарған нәтиже (vars қосылған) */
KZ.evaluate = function (level, res) {
  const c = level.check;
  const fails = [];

  if (c.output !== undefined && res.output.trim() !== c.output) {
    fails.push("Экранға «" + c.output + "» шығуы керек, ал сенде: «" + res.output.trim() + "».");
  }
  if (c.vars) {
    for (const name of Object.keys(c.vars)) {
      const v = res.vars[name];
      if (!v) fails.push("«" + name + "» қорабы жасалмаған.");
      else if (v.r !== c.vars[name]) {
        fails.push("«" + name + "» қорабында " + c.vars[name] + " болуы керек, ал қазір " + v.r + ".");
      }
    }
  }
  if (c.collectAll && res.robot && res.robot.stars.length > 0) {
    fails.push(
      "Жұлдыздар: " + res.robot.got + "/" + res.robot.total + " жиналды. Қалғандарына да бар!"
    );
  }
  if (c.requireFor && !res.features.has_for) {
    fails.push("Бұл тапсырмада for циклін қолдану керек.");
  }
  if (c.fn) {
    const m = c.fn(res);
    if (m) fails.push(m);
  }

  if (fails.length) return { ok: false, reason: fails.join(" ") };
  return { ok: true, stars: KZ.starsFor(level, res.lines) };
};
