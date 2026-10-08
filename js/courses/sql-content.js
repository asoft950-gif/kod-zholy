/* SQL курсы: лекциялар мен анықтамалық */
(() => {
  const c = KZ.getCourse("sql");
  const sq = (code, note) => ({ t: "try", code, note });

  c.lectures = [
    {
      id: "l1", topic: "1", title: "SELECT: кестеден деректер алу", minutes: 4,
      blocks: [
        { t: "p", html: "<b>SQL</b> — деректер қорымен сөйлесетін тіл. Деректер <b>кестелерде</b> сақталады: жолдар (жазбалар) мен бағандар (өрістер). Мектеп қорында <code>oqushylar</code> және <code>bagalar</code> кестелері бар." },
        sq("SELECT * FROM oqushylar;", "* — барлық бағандар. Орындап көр!"),
        { t: "h", text: "Керек бағандарды таңдау" },
        { t: "p", html: "Бағандарды үтірмен жазады. Сұраныстың соңына <code>;</code> қояды." },
        sq("SELECT aty, synyp FROM oqushylar;"),
        { t: "h", text: "AS және DISTINCT" },
        { t: "p", html: "<code>AS</code> нәтижедегі баған атын өзгертеді. <code>DISTINCT</code> қайталанатын мәндерді бір-ақ рет көрсетеді." },
        sq("SELECT aty AS esim, jasy AS zhas FROM oqushylar;"),
        sq("SELECT DISTINCT qala FROM oqushylar;"),
        { t: "tip", html: "SQL кілт сөздері (<code>SELECT</code>, <code>FROM</code>) бас әріппен жазылса оқуға оңай, бірақ кіші әріппен жазсаң да жұмыс істейді." },
      ],
    },
    {
      id: "l2", topic: "2", title: "WHERE: шартқа сай жолдар", minutes: 5,
      blocks: [
        { t: "p", html: "<code>WHERE</code> тек шартқа сай жолдарды қалдырады. Шарт <code>FROM</code> кестесінен кейін жазылады." },
        sq("SELECT * FROM oqushylar WHERE synyp = '5A';", "Мәтін мәндері тырнақшада жазылады: '5A'."),
        { t: "h", text: "Салыстыру белгілері" },
        { t: "p", html: "<code>=</code> тең, <code>!=</code> тең емес, <code>&gt;</code> үлкен, <code>&lt;</code> кіші, <code>&gt;=</code> және <code>&lt;=</code>." },
        sq("SELECT aty, jasy FROM oqushylar WHERE jasy >= 12;"),
        { t: "h", text: "AND, OR, LIKE" },
        { t: "p", html: "<code>AND</code> — екі шарт та орындалсын, <code>OR</code> — біреуі жеткілікті. <code>LIKE</code> үлгі бойынша іздейді: <code>%</code> кез келген әріптер тізбегі." },
        sq("SELECT * FROM oqushylar WHERE synyp = '5A' AND jasy > 11;"),
        sq("SELECT aty FROM oqushylar WHERE aty LIKE 'А%';", "'А%' — А әрпінен басталатын аттар."),
        { t: "warn", html: "SQL-де «тең» белгісі бір ғана: <code>=</code> (екі емес). Мәтінді тырнақшасыз жазба, әйтпесе баған аты деп ойлайды." },
      ],
    },
    {
      id: "l3", topic: "3", title: "ORDER BY және LIMIT", minutes: 4,
      blocks: [
        { t: "p", html: "<code>ORDER BY</code> нәтижені реттейді: <code>ASC</code> — өсу, <code>DESC</code> — кему бойынша. Әдепкі бойынша ASC." },
        sq("SELECT aty, jasy FROM oqushylar ORDER BY jasy DESC;"),
        { t: "h", text: "LIMIT" },
        { t: "p", html: "<code>LIMIT n</code> алғашқы <b>n</b> жолды ғана қалдырады. Реттеумен бірге «ең жақсы 3» сияқты сұраныстар шығады." },
        sq("SELECT * FROM bagalar ORDER BY baga DESC LIMIT 3;"),
        { t: "h", text: "Бәрі бірге" },
        { t: "p", html: "Тәртіп қатаң: <code>SELECT … FROM … WHERE … ORDER BY … LIMIT …</code>." },
        sq("SELECT aty FROM oqushylar WHERE jasy > 10 ORDER BY aty LIMIT 5;"),
        { t: "tip", html: "Реттеусіз <code>LIMIT</code> қай жолдарды алатыны белгісіз. Әрдайым алдымен <code>ORDER BY</code> жаз." },
      ],
    },
    {
      id: "l4", topic: "4", title: "Агрегат функциялар", minutes: 4,
      blocks: [
        { t: "p", html: "Агрегат функция көп жолдан <b>бір мән</b> шығарады: <code>COUNT</code> санайды, <code>SUM</code> қосады, <code>AVG</code> орташасын табады, <code>MIN</code>/<code>MAX</code> ең кіші/үлкенін береді." },
        sq("SELECT COUNT(*) FROM oqushylar;"),
        sq("SELECT AVG(baga) FROM bagalar;"),
        sq("SELECT MIN(jasy), MAX(jasy) FROM oqushylar;"),
        { t: "h", text: "Шартпен біріктіру" },
        { t: "p", html: "<code>WHERE</code> алдымен жолдарды сүзеді, содан кейін функция есептеледі:" },
        sq("SELECT COUNT(*) FROM bagalar WHERE baga = 5;"),
        { t: "warn", html: "<code>COUNT(*)</code> барлық жолды санайды. Ал <code>AVG</code> пен <code>SUM</code> тек сандық бағандарға жарайды." },
      ],
    },
    {
      id: "l5", topic: "5", title: "GROUP BY: топтап есептеу", minutes: 5,
      blocks: [
        { t: "p", html: "<code>GROUP BY</code> жолдарды бағанның мәні бойынша топтарға бөледі, ал агрегат функция әр топқа жеке есептеледі." },
        sq("SELECT synyp, COUNT(*) FROM oqushylar GROUP BY synyp;", "Әр сыныпта қанша оқушы бар."),
        sq("SELECT pan, AVG(baga) FROM bagalar GROUP BY pan;"),
        { t: "h", text: "HAVING: топты сүзу" },
        { t: "p", html: "<code>WHERE</code> топтауға дейін жолдарды сүзеді, ал <code>HAVING</code> топтаудан <b>кейін</b> топтарды сүзеді." },
        sq("SELECT synyp, COUNT(*) FROM oqushylar GROUP BY synyp HAVING COUNT(*) > 2;"),
        { t: "tip", html: "Ереже: <code>SELECT</code>-тегі агрегат емес бағандар міндетті түрде <code>GROUP BY</code>-да болуы керек." },
      ],
    },
    {
      id: "l6", topic: "6", title: "JOIN: кестелерді біріктіру", minutes: 5,
      blocks: [
        { t: "p", html: "Деректер әртүрлі кестелерде болады: аттар <code>oqushylar</code>-да, бағалар <code>bagalar</code>-да. Оларды <code>oqushylar.id = bagalar.oqushy_id</code> арқылы байланыстырамыз." },
        sq("SELECT oqushylar.aty, bagalar.pan, bagalar.baga\nFROM oqushylar\nJOIN bagalar ON oqushylar.id = bagalar.oqushy_id;"),
        { t: "h", text: "Біріктіріп топтау" },
        sq("SELECT oqushylar.aty, AVG(bagalar.baga)\nFROM oqushylar\nJOIN bagalar ON oqushylar.id = bagalar.oqushy_id\nGROUP BY oqushylar.aty;"),
        { t: "h", text: "LEFT JOIN" },
        { t: "p", html: "<code>JOIN</code> тек екі жақта да сәйкес келетін жолдарды береді. <code>LEFT JOIN</code> сол кестенің барлық жолын қалдырады, сәйкесі жоқ жерге <code>NULL</code> қояды. Бағасы жоқ оқушыны осылай табады." },
        sq("SELECT oqushylar.aty\nFROM oqushylar\nLEFT JOIN bagalar ON oqushylar.id = bagalar.oqushy_id\nWHERE bagalar.id IS NULL;"),
        { t: "warn", html: "<code>NULL</code> «мән жоқ» дегенді білдіреді. Оны <code>= NULL</code> емес, <code>IS NULL</code> арқылы тексереді." },
      ],
    },
    {
      id: "l7", topic: "7", title: "INSERT, UPDATE, DELETE", minutes: 4,
      blocks: [
        { t: "p", html: "Деректерді тек оқып қоймай, өзгертуге де болады. Бұл — <b>INSERT</b> (қосу), <b>UPDATE</b> (жаңарту), <b>DELETE</b> (жою)." },
        sq("INSERT INTO oqushylar (aty, synyp, jasy, qala)\nVALUES ('Айдос', '5A', 11, 'Астана');\nSELECT * FROM oqushylar;"),
        sq("UPDATE oqushylar SET jasy = 12 WHERE id = 1;\nSELECT * FROM oqushylar WHERE id = 1;"),
        sq("DELETE FROM oqushylar WHERE id = 1;\nSELECT COUNT(*) FROM oqushylar;"),
        { t: "warn", html: "<code>UPDATE</code> және <code>DELETE</code> қасында <b>міндетті түрде WHERE</b> болсын! Онсыз барлық жолдар өзгереді не жойылады." },
        { t: "tip", html: "Бұл оқу қоры: сұраныс орындалған сайын деректер бастапқы күйіне оралады, сондықтан еркін тәжірибе жаса." },
      ],
    },
  ];

  c.reference = [
    { term: "SELECT … FROM", text: "Кестеден бағандарды таңдайды. * — барлық бағандар.", code: "SELECT aty, synyp FROM oqushylar;" },
    { term: "WHERE", text: "Шартқа сай жолдарды қалдырады.", code: "SELECT * FROM oqushylar WHERE jasy > 11;" },
    { term: "ORDER BY / LIMIT", text: "Реттейді және жолдар санын шектейді.", code: "SELECT * FROM bagalar ORDER BY baga DESC LIMIT 3;" },
    { term: "COUNT, SUM, AVG, MIN, MAX", text: "Көп жолдан бір мән есептейді.", code: "SELECT COUNT(*), AVG(baga) FROM bagalar;" },
    { term: "GROUP BY / HAVING", text: "Топтап есептейді, HAVING топты сүзеді.", code: "SELECT synyp, COUNT(*) FROM oqushylar GROUP BY synyp HAVING COUNT(*) > 2;" },
    { term: "JOIN", text: "Екі кестені ортақ баған бойынша біріктіреді.", code: "SELECT oqushylar.aty, bagalar.baga\nFROM oqushylar JOIN bagalar ON oqushylar.id = bagalar.oqushy_id;" },
    { term: "INSERT / UPDATE / DELETE", text: "Жол қосады, өзгертеді, жояды. UPDATE/DELETE-те WHERE ұмытпа.", code: "UPDATE oqushylar SET jasy = 12 WHERE id = 1;" },
  ];
})();
