/* SQL курсы: оқу деректер қорында сұраныс жазу (SQLite, браузерде) */
(() => {
  const T1 = "1 · SELECT: деректерді таңдау";
  const T2 = "2 · WHERE: сүзу";
  const T3 = "3 · ORDER BY және LIMIT";
  const T4 = "4 · Агрегат функциялар";
  const T5 = "5 · GROUP BY: топтау";
  const T6 = "6 · JOIN: кестелерді біріктіру";
  const T7 = "7 · INSERT, UPDATE, DELETE";
  const S = "-- сұранысыңды осы жерге жаз\n";
  const lv = (o) => Object.assign({ par: 1, robot: null, starter: S }, o);

  KZ.registerCourse({
    id: "sql",
    name: "SQL",
    emoji: "🗄️",
    color: "#00a8a8",
    status: "ready",
    engine: "sql",
    tagline: "Деректер қорынан сұраныспен жауап ал",
    topics: [
      { id: "1", emoji: "🔎", title: "SELECT", blurb: "Кестеден бағандарды таңдау" },
      { id: "2", emoji: "🧲", title: "WHERE", blurb: "Шартқа сай жолдарды сүзу" },
      { id: "3", emoji: "↕️", title: "ORDER BY және LIMIT", blurb: "Реттеу және шектеу" },
      { id: "4", emoji: "🧮", title: "Агрегат функциялар", blurb: "COUNT, SUM, AVG, MIN, MAX" },
      { id: "5", emoji: "🗂️", title: "GROUP BY", blurb: "Топтап санау" },
      { id: "6", emoji: "🔗", title: "JOIN", blurb: "Екі кестені біріктіру" },
      { id: "7", emoji: "✏️", title: "INSERT, UPDATE, DELETE", blurb: "Деректерді өзгерту" },
    ],
    levels: [
      /* ---------- 1. SELECT ---------- */
      lv({
        id: "1.1", topic: T1, title: "Барлық оқушылар",
        task: "<p>Мектеп деректер қорында <b>oqushylar</b> кестесі бар. Оның <b>барлық</b> бағандары мен жолдарын шығар.</p><p class='tip'><code>*</code> белгісі «барлық бағандар» дегенді білдіреді.</p>",
        hint: "SELECT * FROM oqushylar;",
        solution: "SELECT * FROM oqushylar;",
        need: [["\\bSELECT\\b", "SELECT жазу керек."]],
      }),
      lv({
        id: "1.2", topic: T1, title: "Керек бағандар",
        task: "<p>Тек оқушылардың <b>аты</b> мен <b>сыныбын</b> шығар (бағандар: <code>aty</code>, <code>synyp</code>).</p>",
        hint: "Жұлдызша орнына керек бағандарды үтірмен жаз: SELECT aty, synyp FROM oqushylar;",
        solution: "SELECT aty, synyp FROM oqushylar;",
      }),
      lv({
        id: "1.3", topic: T1, title: "Атауын өзгерту (AS)",
        task: "<p><code>aty</code> бағанын <b>esim</b>, <code>jasy</code> бағанын <b>zhas</b> деген атпен шығар. Баған атауын <code>AS</code> арқылы өзгертеді.</p>",
        hint: "SELECT aty AS esim, jasy AS zhas FROM oqushylar;",
        solution: "SELECT aty AS esim, jasy AS zhas FROM oqushylar;",
        names: true,
      }),
      lv({
        id: "1.4", topic: T1, title: "Қайталанбайтын мәндер",
        task: "<p>Оқушылар қандай <b>қалалардан</b>? Әр қала бір-ақ рет шықсын.</p><p class='tip'><code>DISTINCT</code> қайталанатын жолдарды алып тастайды.</p>",
        hint: "SELECT DISTINCT qala FROM oqushylar;",
        solution: "SELECT DISTINCT qala FROM oqushylar;",
        need: [["\\bDISTINCT\\b", "DISTINCT қолдану керек."]],
      }),

      /* ---------- 2. WHERE ---------- */
      lv({
        id: "2.1", topic: T2, title: "Бір сынып",
        task: "<p>Тек <b>5A</b> сыныбының оқушыларының аттарын шығар.</p><p class='tip'>Мәтін жалғыз тырнақшада жазылады: <code>'5A'</code>. Мұндағы <code>A</code> — латын әрпі.</p>",
        hint: "SELECT aty FROM oqushylar WHERE synyp = '5A';",
        solution: "SELECT aty FROM oqushylar WHERE synyp = '5A';",
        need: [["\\bWHERE\\b", "WHERE қолдану керек."]],
      }),
      lv({
        id: "2.2", topic: T2, title: "Салыстыру",
        task: "<p>12 жастан <b>үлкен</b> оқушылардың аты мен жасын шығар (<code>aty</code>, <code>jasy</code>).</p>",
        hint: "WHERE jasy > 12. Салыстыру белгілері: =, >, <, >=, <=, <>.",
        solution: "SELECT aty, jasy FROM oqushylar WHERE jasy > 12;",
        need: [["\\bWHERE\\b", "WHERE қолдану керек."]],
      }),
      lv({
        id: "2.3", topic: T2, title: "AND және OR",
        task: "<p><b>Астана</b> қаласынан <b>және</b> жасы <b>11</b> болатын оқушылардың аттарын шығар.</p>",
        hint: "Екі шартты AND біріктіреді: WHERE qala = 'Астана' AND jasy = 11.",
        solution: "SELECT aty FROM oqushylar WHERE qala = 'Астана' AND jasy = 11;",
        need: [["\\bAND\\b", "Екі шартты AND арқылы біріктір."]],
      }),
      lv({
        id: "2.4", topic: T2, title: "Үлгі бойынша іздеу (LIKE)",
        task: "<p>Аты <b>«А»</b> әрпінен басталатын оқушыларды тап (тек <code>aty</code>).</p><p class='tip'><code>LIKE 'А%'</code>: «А» әрпінен басталады, ал <code>%</code> кез келген жалғасу. Бұл әріп — кириллица.</p>",
        hint: "SELECT aty FROM oqushylar WHERE aty LIKE 'А%';",
        solution: "SELECT aty FROM oqushylar WHERE aty LIKE 'А%';",
        need: [["\\bLIKE\\b", "LIKE қолдану керек."]],
      }),

      /* ---------- 3. ORDER BY және LIMIT ---------- */
      lv({
        id: "3.1", topic: T3, title: "Жасы бойынша",
        task: "<p>Оқушылардың аты мен жасын <b>жасы өсу</b> ретімен шығар.</p>",
        hint: "SELECT aty, jasy FROM oqushylar ORDER BY jasy;",
        solution: "SELECT aty, jasy FROM oqushylar ORDER BY jasy;",
        ordered: { col: 1, dir: "asc" },
        need: [["\\bORDER BY\\b", "ORDER BY қолдану керек."]],
      }),
      lv({
        id: "3.2", topic: T3, title: "Ең жоғары баға",
        task: "<p><b>bagalar</b> кестесінен оқушы нөмірі, пән және бағаны (<code>oqushy_id</code>, <code>pan</code>, <code>baga</code>) <b>бағасы кему</b> ретімен шығар.</p><p class='tip'>Кему үшін бағаннан кейін <code>DESC</code> жаз.</p>",
        hint: "SELECT oqushy_id, pan, baga FROM bagalar ORDER BY baga DESC;",
        solution: "SELECT oqushy_id, pan, baga FROM bagalar ORDER BY baga DESC;",
        ordered: { col: 2, dir: "desc" },
        need: [["\\bDESC\\b", "DESC қолдану керек."]],
      }),
      lv({
        id: "3.3", topic: T3, title: "Соңғы үш оқушы",
        task: "<p>Ең үлкен <code>id</code>-і бар <b>үш</b> оқушының <code>id</code> және <code>aty</code> бағандарын шығар (id кему ретімен).</p><p class='tip'><code>LIMIT 3</code> нәтижені 3 жолмен шектейді.</p>",
        hint: "SELECT id, aty FROM oqushylar ORDER BY id DESC LIMIT 3;",
        solution: "SELECT id, aty FROM oqushylar ORDER BY id DESC LIMIT 3;",
        ordered: { col: 0, dir: "desc" },
        need: [["\\bLIMIT\\b", "LIMIT қолдану керек."]],
      }),
      lv({
        id: "3.4", topic: T3, title: "Сүзу және реттеу",
        task: "<p><b>Алматы</b> қаласының оқушыларының аты мен жасын, <b>аты бойынша әліпби</b> ретімен шығар.</p>",
        hint: "WHERE-ді ORDER BY-дан бұрын жаз: ... WHERE qala = 'Алматы' ORDER BY aty;",
        solution: "SELECT aty, jasy FROM oqushylar WHERE qala = 'Алматы' ORDER BY aty;",
        ordered: { col: 0, dir: "asc" },
        need: [["\\bWHERE\\b", "WHERE қолдану керек."], ["\\bORDER BY\\b", "ORDER BY қолдану керек."]],
      }),

      /* ---------- 4. Агрегаттар ---------- */
      lv({
        id: "4.1", topic: T4, title: "Қанша оқушы?",
        task: "<p>Кестеде барлығы неше оқушы бар? Бір сан шығар.</p><p class='tip'><code>COUNT(*)</code> жолдар санын береді.</p>",
        hint: "SELECT COUNT(*) FROM oqushylar;",
        solution: "SELECT COUNT(*) FROM oqushylar;",
        need: [["\\bCOUNT\\b", "COUNT қолдану керек."]],
      }),
      lv({
        id: "4.2", topic: T4, title: "Орташа баға",
        task: "<p><b>Математика</b> пәнінен орташа бағаны тап.</p><p class='tip'><code>AVG(баған)</code> орташа мәнді есептейді.</p>",
        hint: "SELECT AVG(baga) FROM bagalar WHERE pan = 'Математика';",
        solution: "SELECT AVG(baga) FROM bagalar WHERE pan = 'Математика';",
        need: [["\\bAVG\\b", "AVG қолдану керек."]],
      }),
      lv({
        id: "4.3", topic: T4, title: "Ең кіші және ең үлкен",
        task: "<p>Оқушылардың <b>ең кіші</b> және <b>ең үлкен</b> жасын бір сұраныспен шығар (екі баған).</p>",
        hint: "SELECT MIN(jasy), MAX(jasy) FROM oqushylar;",
        solution: "SELECT MIN(jasy), MAX(jasy) FROM oqushylar;",
        need: [["\\bMIN\\b", "MIN қолдану керек."], ["\\bMAX\\b", "MAX қолдану керек."]],
      }),
      lv({
        id: "4.4", topic: T4, title: "Қанша бестік?",
        task: "<p>Барлық бағалар ішінде <b>5</b> бағасы неше рет қойылған?</p><p class='tip'>Алдымен <code>WHERE</code> сүзеді, сосын <code>COUNT</code> санайды.</p>",
        hint: "SELECT COUNT(*) FROM bagalar WHERE baga = 5;",
        solution: "SELECT COUNT(*) FROM bagalar WHERE baga = 5;",
        need: [["\\bCOUNT\\b", "COUNT қолдану керек."], ["\\bWHERE\\b", "WHERE қолдану керек."]],
      }),

      /* ---------- 5. GROUP BY ---------- */
      lv({
        id: "5.1", topic: T5, title: "Сынып бойынша санау",
        task: "<p>Әр сыныпта неше оқушы бар? Екі баған шығар: <code>synyp</code> және оқушылар саны.</p><p class='tip'><code>GROUP BY synyp</code> жолдарды сыныпқа қарай топтайды.</p>",
        hint: "SELECT synyp, COUNT(*) FROM oqushylar GROUP BY synyp;",
        solution: "SELECT synyp, COUNT(*) FROM oqushylar GROUP BY synyp;",
        need: [["\\bGROUP BY\\b", "GROUP BY қолдану керек."]],
      }),
      lv({
        id: "5.2", topic: T5, title: "Пән бойынша орташа",
        task: "<p>Әр пән бойынша орташа бағаны шығар: <code>pan</code> және <code>AVG(baga)</code>.</p>",
        hint: "SELECT pan, AVG(baga) FROM bagalar GROUP BY pan;",
        solution: "SELECT pan, AVG(baga) FROM bagalar GROUP BY pan;",
        need: [["\\bGROUP BY\\b", "GROUP BY қолдану керек."]],
      }),
      lv({
        id: "5.3", topic: T5, title: "Сыныптағы ең үлкені",
        task: "<p>Әр сыныптағы <b>ең үлкен жасты</b> шығар: <code>synyp</code> және <code>MAX(jasy)</code>.</p>",
        hint: "SELECT synyp, MAX(jasy) FROM oqushylar GROUP BY synyp;",
        solution: "SELECT synyp, MAX(jasy) FROM oqushylar GROUP BY synyp;",
        need: [["\\bGROUP BY\\b", "GROUP BY қолдану керек."]],
      }),
      lv({
        id: "5.4", topic: T5, title: "Топты сүзу (HAVING)",
        task: "<p>Тек <b>2-ден көп</b> оқушысы бар қалаларды шығар: <code>qala</code> және оқушылар саны.</p><p class='tip'>Топтардың нәтижесін <code>WHERE</code> емес, <code>HAVING</code> сүзеді.</p>",
        hint: "SELECT qala, COUNT(*) FROM oqushylar GROUP BY qala HAVING COUNT(*) > 2;",
        solution: "SELECT qala, COUNT(*) FROM oqushylar GROUP BY qala HAVING COUNT(*) > 2;",
        need: [["\\bHAVING\\b", "HAVING қолдану керек."]],
      }),

      /* ---------- 6. JOIN ---------- */
      lv({
        id: "6.1", topic: T6, title: "Екі кестені біріктіру",
        task: "<p>Әр баға қай оқушыныкі екенін көрсет: <code>oqushylar.aty</code>, <code>bagalar.pan</code>, <code>bagalar.baga</code>.</p><p class='tip'>Кестелер байланысы: <code>oqushylar.id = bagalar.oqushy_id</code>.</p>",
        hint: "SELECT oqushylar.aty, bagalar.pan, bagalar.baga FROM oqushylar JOIN bagalar ON oqushylar.id = bagalar.oqushy_id;",
        solution: "SELECT oqushylar.aty, bagalar.pan, bagalar.baga FROM oqushylar JOIN bagalar ON oqushylar.id = bagalar.oqushy_id;",
        need: [["\\bJOIN\\b", "JOIN қолдану керек."]],
      }),
      lv({
        id: "6.2", topic: T6, title: "Информатикадан бестік",
        task: "<p>Информатикадан <b>5</b> алған оқушылардың аттарын шығар.</p>",
        hint: "JOIN-ға WHERE қос: ... WHERE bagalar.pan = 'Информатика' AND bagalar.baga = 5;",
        solution: "SELECT oqushylar.aty FROM oqushylar JOIN bagalar ON oqushylar.id = bagalar.oqushy_id WHERE bagalar.pan = 'Информатика' AND bagalar.baga = 5;",
        need: [["\\bJOIN\\b", "JOIN қолдану керек."], ["\\bWHERE\\b", "WHERE қолдану керек."]],
      }),
      lv({
        id: "6.3", topic: T6, title: "Әр оқушының орташасы",
        task: "<p>Әр оқушының <b>орташа бағасын</b> шығар: <code>oqushylar.aty</code> және <code>AVG(bagalar.baga)</code>. Бағасы жоқ оқушылар шықпайды.</p>",
        hint: "JOIN жасап, оқушы бойынша топта: ... GROUP BY oqushylar.id;",
        solution: "SELECT oqushylar.aty, AVG(bagalar.baga) FROM oqushylar JOIN bagalar ON oqushylar.id = bagalar.oqushy_id GROUP BY oqushylar.id;",
        need: [["\\bJOIN\\b", "JOIN қолдану керек."], ["\\bGROUP BY\\b", "GROUP BY қолдану керек."]],
      }),
      lv({
        id: "6.4", topic: T6, title: "Бағасы жоқ оқушы",
        task: "<p>Бірде-бір бағасы жоқ оқушыны тап (тек <code>aty</code>).</p><p class='tip'><code>LEFT JOIN</code> сол жақ кестенің барлық жолын қалдырады. Сәйкес баға табылмаса, оң жақ бағандар <code>NULL</code> болады: оны <code>IS NULL</code> тексереді.</p>",
        hint: "SELECT oqushylar.aty FROM oqushylar LEFT JOIN bagalar ON oqushylar.id = bagalar.oqushy_id WHERE bagalar.id IS NULL;",
        solution: "SELECT oqushylar.aty FROM oqushylar LEFT JOIN bagalar ON oqushylar.id = bagalar.oqushy_id WHERE bagalar.id IS NULL;",
        need: [["\\bLEFT JOIN\\b", "LEFT JOIN қолдану керек."], ["IS NULL", "IS NULL қолдану керек."]],
      }),

      /* ---------- 7. Деректерді өзгерту ---------- */
      lv({
        id: "7.1", topic: T7, title: "Жаңа оқушы қосу",
        task: "<p>Жаңа оқушы қос: <b>id 11, Жанар, 6A, 12 жас, Астана</b>. Бағандар реті: <code>id, aty, synyp, jasy, qala</code>.</p><p class='tip'><code>INSERT INTO кесте VALUES (мән1, мән2, …);</code> Мәтін тырнақшада, сан тырнақшасыз.</p>",
        hint: "INSERT INTO oqushylar VALUES (11, 'Жанар', '6A', 12, 'Астана');",
        solution: "INSERT INTO oqushylar VALUES (11, 'Жанар', '6A', 12, 'Астана');",
        verify: "SELECT * FROM oqushylar ORDER BY id;",
        need: [["\\bINSERT\\b", "INSERT қолдану керек."]],
      }),
      lv({
        id: "7.2", topic: T7, title: "Мәнді жаңарту",
        task: "<p><b>Дана</b> Алматыға көшті. Оның қаласын <code>'Алматы'</code> деп өзгерт. Басқа оқушылар өзгермесін!</p><p class='tip'><code>UPDATE кесте SET баған = мән WHERE шарт;</code> <b>WHERE-сіз</b> UPDATE барлық жолды өзгертеді.</p>",
        hint: "UPDATE oqushylar SET qala = 'Алматы' WHERE aty = 'Дана';",
        solution: "UPDATE oqushylar SET qala = 'Алматы' WHERE aty = 'Дана';",
        verify: "SELECT * FROM oqushylar ORDER BY id;",
        need: [["\\bUPDATE\\b", "UPDATE қолдану керек."], ["\\bWHERE\\b", "WHERE қосуды ұмытпа!"]],
      }),
      lv({
        id: "7.3", topic: T7, title: "Жолды жою",
        task: "<p><b>8-ші</b> оқушының (<code>oqushy_id = 8</code>) барлық бағасын <b>bagalar</b> кестесінен жой.</p><p class='tip'><code>DELETE FROM кесте WHERE шарт;</code> WHERE-сіз барлық жол жойылады!</p>",
        hint: "DELETE FROM bagalar WHERE oqushy_id = 8;",
        solution: "DELETE FROM bagalar WHERE oqushy_id = 8;",
        verify: "SELECT * FROM bagalar ORDER BY id;",
        need: [["\\bDELETE\\b", "DELETE қолдану керек."], ["\\bWHERE\\b", "WHERE қосуды ұмытпа!"]],
      }),
      lv({
        id: "7.4", topic: T7, title: "Бір жылға ержетті",
        task: "<p><b>6A</b> сыныбының барлық оқушысының жасын <b>1-ге арттыр</b>.</p><p class='tip'>Жаңа мән ескі мәннен есептеледі: <code>SET jasy = jasy + 1</code>.</p>",
        hint: "UPDATE oqushylar SET jasy = jasy + 1 WHERE synyp = '6A';",
        solution: "UPDATE oqushylar SET jasy = jasy + 1 WHERE synyp = '6A';",
        verify: "SELECT * FROM oqushylar ORDER BY id;",
        need: [["\\bUPDATE\\b", "UPDATE қолдану керек."], ["\\bWHERE\\b", "WHERE қосуды ұмытпа!"]],
      }),
    ],
    bonus: [],
    lectures: [],
    reference: [],
  });
})();
