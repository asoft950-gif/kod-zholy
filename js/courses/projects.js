/* Жобалар курсы: үш шағын жобаны қадамдап жазу (Python) */
(() => {
  const sig = "# --- тексеру (өзгертпе) ---";
  /* Тексеру бөлігі (драйвер) өзгертілмегенін және функцияның нағыз жұмыс істейтінін тексеру */
  const D = (driver) => (res) => {
    const norm = (s) => s.replace(/[ \t]+$/gm, "").replace(/\r/g, "").trim();
    return norm(res.code).includes(norm(driver)) ? null : "«" + sig + "» астындағы жолдарды өзгертпе: олар сенің функцияңды тексереді.";
  };
  const noHard = (...outs) => ({ re: new RegExp("return\\s+[\"']?(" + outs.join("|") + ")[\"']?\\s*$", "m"), msg: "Жауапты қатты жазба: функция кез келген санмен дұрыс істеуі керек." });

  /* ---- Калькулятор: функциялар (кейінгі қадамдарда дайын күйінде беріледі) ---- */
  const BASE12 =
    "def qosu(a, b):\n    return a + b\n\n\ndef azayt(a, b):\n    return a - b\n\n\n";
  const BASE_KB =
    "def kobeyt(a, b):\n    return a * b\n\n\ndef bolu(a, b):\n    if b == 0:\n        return \"Нөлге бөлуге болмайды\"\n    return a / b\n\n\n";
  const BASE_ES =
    "def esepte(a, amal, b):\n    if amal == \"+\":\n        return qosu(a, b)\n    elif amal == \"-\":\n        return azayt(a, b)\n    elif amal == \"*\":\n        return kobeyt(a, b)\n    elif amal == \"/\":\n        return bolu(a, b)\n    return \"Белгісіз амал\"\n\n\n";

  /* ---- Сан табу: salystyr, ojna ---- */
  const SALY = "def salystyr(sir, boljam):\n    if boljam < sir:\n        return \"Тым аз\"\n    elif boljam > sir:\n        return \"Тым көп\"\n    return \"Дұрыс!\"\n\n\n";
  const OJNA2 =
    "def ojna(sir, boljamdar):\n    talpynys = 0\n    for b in boljamdar:\n        talpynys = talpynys + 1\n        natije = salystyr(sir, b)\n        print(natije)\n        if natije == \"Дұрыс!\":\n            return talpynys\n\n\n";

  /* ---- Тапсырмалар тізімі ---- */
  const T_QOS = "def qos(tizim, atau):\n    tizim.append([atau, False])\n\n\n";
  const T_KORSET =
    "def korset(tizim):\n    for i in range(len(tizim)):\n        tanba = \"[ ]\"\n        if tizim[i][1]:\n            tanba = \"[x]\"\n        print(str(i + 1) + \". \" + tanba + \" \" + tizim[i][0])\n\n\n";
  const T_BELGILE = "def belgile(tizim, nomir):\n    tizim[nomir - 1][1] = True\n\n\n";

  const d11 = sig + "\nprint(qosu(7, 3))\nprint(azayt(7, 3))\nprint(qosu(10, 5))\n";
  const d12 = sig + "\nprint(kobeyt(6, 4))\nprint(bolu(10, 4))\nprint(bolu(5, 0))\n";
  const d13 = sig + '\nprint(esepte(6, "+", 2))\nprint(esepte(6, "-", 2))\nprint(esepte(6, "*", 2))\nprint(esepte(6, "/", 2))\nprint(esepte(6, "/", 0))\nprint(esepte(6, "%", 2))\n';
  const d21 = sig + "\nprint(salystyr(42, 30))\nprint(salystyr(42, 50))\nprint(salystyr(42, 42))\n";
  const d22 = sig + '\nsany = ojna(7, [3, 9, 7, 5])\nprint("Талпыныс:", sany)\n';
  const d23 = sig + '\nojna(7, [3, 9, 7, 5], 5)\nprint("---")\nojna(7, [1, 2, 3, 4], 3)\n';
  const d31 = sig + '\nqos(tizim, "Нан алу")\nqos(tizim, "Сабақ оқу")\nqos(tizim, "Спорт")\nprint(tizim)\nprint(len(tizim))\n';
  const d32 = sig + '\ntizim = ["Нан алу", "Сабақ оқу", "Спорт"]\nkorset(tizim)\n';
  const d33 = sig + '\ntizim = []\nqos(tizim, "Нан алу")\nqos(tizim, "Сабақ оқу")\nqos(tizim, "Спорт")\nbelgile(tizim, 2)\nkorset(tizim)\n';
  const d34 = sig + '\ntizim = []\nqos(tizim, "Нан алу")\nqos(tizim, "Сабақ оқу")\nqos(tizim, "Спорт")\nbelgile(tizim, 1)\nbelgile(tizim, 3)\nkorset(tizim)\nprint("Орындалды: " + str(qansha(tizim)) + "/" + str(len(tizim)))\n';

  const T1 = "1 · Калькулятор: функциялар";
  const T2 = "2 · Сан табу ойыны";
  const T3 = "3 · Тапсырмалар тізімі";

  KZ.registerCourse({
    id: "projects",
    name: "Жобалар",
    emoji: "🚀",
    color: "#e84393",
    status: "ready",
    engine: "python",
    tagline: "Нағыз шағын бағдарламаларды қадамдап жаз",
    commands: [],
    topics: [
      { id: "1", emoji: "🧮", title: "Калькулятор", blurb: "Функциялар, шарттар және цикл" },
      { id: "2", emoji: "🎯", title: "Сан табу ойыны", blurb: "Салыстыру, цикл және ұпай" },
      { id: "3", emoji: "📝", title: "Тапсырмалар тізімі", blurb: "Тізімдер және тізімдегі тізімдер" },
    ],
    levels: [
      /* ---------- 1. Калькулятор ---------- */
      {
        id: "1.1", topic: T1, title: "Қосу және азайту",
        task:
          "<p>Калькулятор жасаймыз! Алдымен екі функция: <code>qosu(a, b)</code> екі санды қосып, <code>azayt(a, b)</code> азайтып <b>қайтаруы</b> керек (<code>return</code>).</p>" +
          "<p class='tip'>«<code>" + sig + "</code>» астындағы жолдар сенің функцияңды тексереді, оларды өзгертпе.</p>",
        hint: "Функция ішіне return a + b деп жаз. Азайтуға return a - b.",
        starter: "def qosu(a, b):\n    # a мен b-ны қосып қайтар\n    pass\n\n\ndef azayt(a, b):\n    # a-дан b-ны азайтып қайтар\n    pass\n\n\n" + d11,
        solution: "def qosu(a, b):\n    return a + b\n\n\ndef azayt(a, b):\n    return a - b\n\n\n" + d11,
        par: 8, robot: null,
        check: { output: "10\n4\n15", requireDef: true, fn: D(d11), forbid: [noHard("10", "4", "15")] },
      },
      {
        id: "1.2", topic: T1, title: "Көбейту және бөлу",
        task:
          "<p>Тағы екі батырма: <code>kobeyt(a, b)</code> көбейтеді, <code>bolu(a, b)</code> бөледі. Бірақ <b>нөлге бөлуге болмайды</b>: <code>b</code> нөл болса, <code>\"Нөлге бөлуге болмайды\"</code> мәтінін қайтар.</p>",
        hint: "bolu ішінде: if b == 0: return \"Нөлге бөлуге болмайды\", ал әйтпесе return a / b.",
        starter: BASE12 + "def kobeyt(a, b):\n    # көбейтіп қайтар\n    pass\n\n\ndef bolu(a, b):\n    # b нөл болса, ескерту мәтінін қайтар\n    # әйтпесе a / b қайтар\n    pass\n\n\n" + d12,
        solution: BASE12 + BASE_KB + d12,
        par: 14, robot: null,
        check: { output: "24\n2.5\nНөлге бөлуге болмайды", requireDef: true, requireIf: true, fn: D(d12), forbid: [noHard("24", "2\\.5")] },
      },
      {
        id: "1.3", topic: T1, title: "Бір функция: esepte",
        task:
          "<p>Төрт функцияны бір жерге жинаймыз. <code>esepte(a, amal, b)</code> амал белгісіне қарап (<code>\"+\"</code>, <code>\"-\"</code>, <code>\"*\"</code>, <code>\"/\"</code>) сәйкес функцияны шақырып, нәтижені қайтарсын.</p>" +
          "<p class='tip'>Белгісіз белгі келсе, <code>\"Белгісіз амал\"</code> қайтар. Бөлу нәтижесі <code>3.0</code> сияқты шығады, бұл дұрыс.</p>",
        hint: "if amal == \"+\": return qosu(a, b), одан кейін elif амалдары, ең соңында return \"Белгісіз амал\".",
        starter: BASE12 + BASE_KB + "def esepte(a, amal, b):\n    # амал белгісіне қарай дұрыс функцияны шақыр\n    pass\n\n\n" + d13,
        solution: BASE12 + BASE_KB + BASE_ES + d13,
        par: 27, robot: null,
        check: { output: "8\n4\n12\n3.0\nНөлге бөлуге болмайды\nБелгісіз амал", requireDef: true, requireIf: true, fn: D(d13) },
      },
      {
        id: "1.4", topic: T1, title: "Есептеу тарихы",
        task:
          "<p>Калькулятор есептеген амалдарды тізіммен берілген: <code>[сан, белгі, сан]</code>. Әр амалды <code>6 + 2 = 8</code> түрінде бір жолға шығар.</p>" +
          "<p class='tip'><code>print(a, amal, b, \"=\", natije)</code> бос орынды өзі қояды. Нөлге бөлгенде де жұмыс істеуі керек.</p>",
        hint: "for amal in amaldar: ішінде natije = esepte(amal[0], amal[1], amal[2]), сосын print(amal[0], amal[1], amal[2], \"=\", natije).",
        starter: BASE12 + BASE_KB + BASE_ES + 'amaldar = [[6, "+", 2], [9, "-", 4], [3, "*", 5], [8, "/", 0]]\n\n# әр амалды "6 + 2 = 8" түрінде шығар\n',
        solution: BASE12 + BASE_KB + BASE_ES + 'amaldar = [[6, "+", 2], [9, "-", 4], [3, "*", 5], [8, "/", 0]]\n\nfor amal in amaldar:\n    natije = esepte(amal[0], amal[1], amal[2])\n    print(amal[0], amal[1], amal[2], "=", natije)\n',
        par: 25, robot: null,
        check: { output: "6 + 2 = 8\n9 - 4 = 5\n3 * 5 = 15\n8 / 0 = Нөлге бөлуге болмайды", requireFor: true, requireList: true },
      },

      /* ---------- 2. Сан табу ойыны ---------- */
      {
        id: "2.1", topic: T2, title: "Салыстыру",
        task:
          "<p>Компьютер сан ойлады (<code>sir</code>), ойыншы болжайды (<code>boljam</code>). <code>salystyr(sir, boljam)</code> функциясы былай жауап қайтарсын:</p>" +
          "<ul><li>болжам аз болса: <code>\"Тым аз\"</code></li><li>көп болса: <code>\"Тым көп\"</code></li><li>тең болса: <code>\"Дұрыс!\"</code></li></ul>",
        hint: "if boljam < sir: return \"Тым аз\", elif boljam > sir: return \"Тым көп\", ал соңында return \"Дұрыс!\".",
        starter: "def salystyr(sir, boljam):\n    # үш жауаптың бірін қайтар\n    pass\n\n\n" + d21,
        solution: SALY + d21,
        par: 10, robot: null,
        check: { output: "Тым аз\nТым көп\nДұрыс!", requireDef: true, requireIf: true, fn: D(d21) },
      },
      {
        id: "2.2", topic: T2, title: "Болжамдар тізімі",
        task:
          "<p>Ойыншы бірнеше болжам жасайды. <code>ojna(sir, boljamdar)</code> болжамдарды бір-бірден тексеріп, әр жауапты экранға шығарсын. Сан табылғанда <b>тоқтап</b>, неше талпыныс болғанын қайтарсын.</p>" +
          "<p class='tip'>Циклдің ішінде <code>return</code> жазсаң, функция бірден аяқталады.</p>",
        hint: "talpynys = 0 деп баста. Цикл ішінде talpynys = talpynys + 1, natije = salystyr(sir, b), print(natije). Егер natije == \"Дұрыс!\" болса, return talpynys.",
        starter: SALY + "def ojna(sir, boljamdar):\n    # болжамдарды бір-бірден тексер\n    pass\n\n\n" + d22,
        solution: SALY + OJNA2 + d22,
        par: 17, robot: null,
        check: { output: "Тым аз\nТым көп\nДұрыс!\nТалпыныс: 3", requireDef: true, requireFor: true, requireIf: true, fn: D(d22) },
      },
      {
        id: "2.3", topic: T2, title: "Жеңіс пен жеңіліс",
        task:
          "<p>Талпыныс шектеулі болсын: <code>ojna(sir, boljamdar, shek)</code>. Сан <code>shek</code> талпынысқа дейін табылса, <code>Жеңдің! Талпыныс: 3</code> деп шығар. Табылмаса, <code>Ұтылдың! Сан: 7</code> деп шығар.</p>" +
          "<p class='tip'>Енді <code>while</code> ыңғайлы: талпыныс саны <code>shek</code>-тен кіші және болжам әлі бар болғанша қайтала.</p>",
        hint: "while talpynys < shek and talpynys < len(boljamdar): ішінде boljamdar[talpynys] алып тексер. Жеңсең, print(\"Жеңдің! Талпыныс:\", talpynys) жасап, return жаз. Цикл біткен соң ұтылу хабарын шығар.",
        starter: SALY + "def ojna(sir, boljamdar, shek):\n    # ең көбі shek болжам тексер\n    pass\n\n\n" + d23,
        solution:
          SALY +
          "def ojna(sir, boljamdar, shek):\n    talpynys = 0\n    while talpynys < shek and talpynys < len(boljamdar):\n        natije = salystyr(sir, boljamdar[talpynys])\n        talpynys = talpynys + 1\n        print(natije)\n        if natije == \"Дұрыс!\":\n            print(\"Жеңдің! Талпыныс:\", talpynys)\n            return\n    print(\"Ұтылдың! Сан:\", sir)\n\n\n" +
          d23,
        par: 20, robot: null,
        check: { output: "Тым аз\nТым көп\nДұрыс!\nЖеңдің! Талпыныс: 3\n---\nТым аз\nТым аз\nТым аз\nҰтылдың! Сан: 7", requireDef: true, requireWhile: true, requireIf: true, fn: D(d23) },
      },
      {
        id: "2.4", topic: T2, title: "Ең жақсы нәтиже",
        task:
          "<p>Бірнеше ойыннан кейінгі талпыныс саны тізімде: <code>natijeler</code>. Ең <b>аз</b> талпынысты (ең жақсы нәтижені) тауып, орташа санды есепте.</p>" +
          "<p class='tip'><code>min()</code> қолданба, цикл және <code>if</code> қолдан. Қосындыны <code>sum(natijeler)</code> береді, санын <code>len(natijeler)</code>.</p>",
        hint: "eng = natijeler[0] деп баста, for n in natijeler: ішінде if n < eng: eng = n. Орташа: sum(natijeler) / len(natijeler).",
        starter: "natijeler = [3, 1, 4, 2]\n\n# ең жақсы нәтижені тап және шығар: Ең жақсы: 1\n# орташасын шығар: Орташа: 2.5\n",
        solution:
          "natijeler = [3, 1, 4, 2]\n\neng = natijeler[0]\nfor n in natijeler:\n    if n < eng:\n        eng = n\nprint(\"Ең жақсы:\", eng)\nprint(\"Орташа:\", sum(natijeler) / len(natijeler))\n",
        par: 8, robot: null,
        check: {
          output: "Ең жақсы: 1\nОрташа: 2.5", requireFor: true, requireIf: true, requireList: true,
          forbid: [{ re: /\bmin\s*\(/, msg: "min() қолданба, өзің тап!" }, { re: /\bsorted\s*\(|\.sort\s*\(/, msg: "sort() қолданба, цикл қолдан!" }],
        },
      },

      /* ---------- 3. Тапсырмалар тізімі ---------- */
      {
        id: "3.1", topic: T3, title: "Тапсырма қосу",
        task:
          "<p>Күнделікті істер тізімін жасаймыз. Әр тапсырма — <b>екі мәнді тізім</b>: <code>[атауы, орындалды ма]</code>. Жаңа тапсырма әрқашан <code>False</code> (әлі орындалмаған) болып қосылады.</p>" +
          "<p><code>qos(tizim, atau)</code> тізімнің соңына <code>[atau, False]</code> қосатын функция жаз.</p>",
        hint: "tizim.append([atau, False]) — append ішіне тағы бір тізім беруге болады.",
        starter: "tizim = []\n\n\ndef qos(tizim, atau):\n    # tizim-нің соңына [atau, False] қос\n    pass\n\n\n" + d31,
        solution: "tizim = []\n\n\ndef qos(tizim, atau):\n    tizim.append([atau, False])\n\n\n" + d31,
        par: 9, robot: null,
        check: { output: "[['Нан алу', False], ['Сабақ оқу', False], ['Спорт', False]]\n3", requireDef: true, requireList: true, fn: D(d31) },
      },
      {
        id: "3.2", topic: T3, title: "Тізімді көрсету",
        task:
          "<p><code>korset(tizim)</code> әр тапсырманы нөмірімен шығарсын: <code>1. Нан алу</code>. Тапсырма атауы — әр ішкі тізімнің <b>0-ші</b> элементі.</p>",
        hint: "for i in range(len(tizim)): ішінде print(str(i + 1) + \". \" + tizim[i][0]). Нөмірді мәтінге айналдыру үшін str() керек.",
        starter: "def korset(tizim):\n    # әр тапсырманы \"1. Нан алу\" түрінде шығар\n    pass\n\n\n" + sig + '\ntizim = [["Нан алу", False], ["Сабақ оқу", False], ["Спорт", False]]\nkorset(tizim)\n',
        solution: "def korset(tizim):\n    for i in range(len(tizim)):\n        print(str(i + 1) + \". \" + tizim[i][0])\n\n\n" + sig + '\ntizim = [["Нан алу", False], ["Сабақ оқу", False], ["Спорт", False]]\nkorset(tizim)\n',
        par: 6, robot: null,
        check: { output: "1. Нан алу\n2. Сабақ оқу\n3. Спорт", requireDef: true, requireFor: true, fn: D(sig + '\ntizim = [["Нан алу", False], ["Сабақ оқу", False], ["Спорт", False]]\nkorset(tizim)\n') },
      },
      {
        id: "3.3", topic: T3, title: "Орындалды деп белгілеу",
        task:
          "<p>Екі өзгеріс: 1) <code>korset</code> орындалған тапсырмаға <code>[x]</code>, орындалмағанға <code>[ ]</code> қойсын; 2) <code>belgile(tizim, nomir)</code> <b>nomir</b>-ші тапсырманы орындалды деп белгілесін (<code>False</code> → <code>True</code>).</p>" +
          "<p class='tip'>Нөмір 1-ден басталады, ал тізім нөмірі 0-ден: <code>tizim[nomir - 1][1]</code>.</p>",
        hint: "belgile ішінде tizim[nomir - 1][1] = True. korset ішінде tanba = \"[ ]\" деп бастап, if tizim[i][1]: tanba = \"[x]\".",
        starter: T_QOS + "def korset(tizim):\n    # орындалғанына [x], орындалмағанына [ ] қой\n    for i in range(len(tizim)):\n        print(str(i + 1) + \". \" + tizim[i][0])\n\n\ndef belgile(tizim, nomir):\n    # nomir-ші тапсырманы орындалды деп белгіле\n    pass\n\n\n" + d33,
        solution: T_QOS + T_KORSET + T_BELGILE + d33,
        par: 17, robot: null,
        check: { output: "1. [ ] Нан алу\n2. [x] Сабақ оқу\n3. [ ] Спорт", requireDef: true, requireFor: true, requireIf: true, fn: D(d33) },
      },
      {
        id: "3.4", topic: T3, title: "Қанша істедім?",
        task:
          "<p>Соңғы қадам: <code>qansha(tizim)</code> орындалған тапсырмалар санын қайтарсын. Жобаны аяқтаймыз: тізімді көрсетіп, соңында <code>Орындалды: 2/3</code> шығады.</p>",
        hint: "sany = 0 деп баста, әр тапсырманы аралап, if t[1]: sany = sany + 1. Соңында return sany.",
        starter: T_QOS + T_KORSET + T_BELGILE + "def qansha(tizim):\n    # орындалғандар санын қайтар\n    pass\n\n\n" + d34,
        solution: T_QOS + T_KORSET + T_BELGILE + "def qansha(tizim):\n    sany = 0\n    for t in tizim:\n        if t[1]:\n            sany = sany + 1\n    return sany\n\n\n" + d34,
        par: 25, robot: null,
        check: { output: "1. [x] Нан алу\n2. [ ] Сабақ оқу\n3. [x] Спорт\nОрындалды: 2/3", requireDef: true, requireFor: true, requireIf: true, fn: D(d34) },
      },
    ],
    bonus: [],
    lectures: [],
    reference: [],
  });
})();
