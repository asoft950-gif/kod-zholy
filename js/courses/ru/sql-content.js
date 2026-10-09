/* Курс SQL: лекции и справочник */
(() => {
  const c = KZ.getCourse("sql");
  const sq = (code, note) => ({ t: "try", code, note });

  c.lectures = [
    {
      id: "l1", topic: "1", title: "SELECT: берём данные из таблицы", minutes: 4,
      blocks: [
        { t: "p", html: "<b>SQL</b> — язык, на котором говорят с базой данных. Данные хранятся в <b>таблицах</b>: это строки (записи) и столбцы (поля). В школьной базе есть таблицы <code>oqushylar</code> (ученики) и <code>bagalar</code> (оценки)." },
        sq("SELECT * FROM oqushylar;", "* — все столбцы. Попробуй выполнить!"),
        { t: "h", text: "Выбираем нужные столбцы" },
        { t: "p", html: "Столбцы пишут через запятую. В конце запроса ставят <code>;</code>." },
        sq("SELECT aty, synyp FROM oqushylar;"),
        { t: "h", text: "AS и DISTINCT" },
        { t: "p", html: "<code>AS</code> меняет название столбца в результате. <code>DISTINCT</code> показывает повторяющиеся значения только один раз." },
        sq("SELECT aty AS esim, jasy AS zhas FROM oqushylar;"),
        sq("SELECT DISTINCT qala FROM oqushylar;"),
        { t: "tip", html: "Ключевые слова SQL (<code>SELECT</code>, <code>FROM</code>) удобнее читать, когда они написаны большими буквами, но с маленькими буквами всё тоже работает." },
      ],
    },
    {
      id: "l2", topic: "2", title: "WHERE: строки по условию", minutes: 5,
      blocks: [
        { t: "p", html: "<code>WHERE</code> оставляет только строки, подходящие под условие. Условие пишут после таблицы в <code>FROM</code>." },
        sq("SELECT * FROM oqushylar WHERE synyp = '5A';", "Текстовые значения пишутся в кавычках: '5A'."),
        { t: "h", text: "Знаки сравнения" },
        { t: "p", html: "<code>=</code> равно, <code>!=</code> не равно, <code>&gt;</code> больше, <code>&lt;</code> меньше, <code>&gt;=</code> и <code>&lt;=</code>." },
        sq("SELECT aty, jasy FROM oqushylar WHERE jasy >= 12;"),
        { t: "h", text: "AND, OR, LIKE" },
        { t: "p", html: "<code>AND</code> — должны выполняться оба условия, <code>OR</code> — достаточно одного. <code>LIKE</code> ищет по шаблону: <code>%</code> заменяет любую последовательность букв." },
        sq("SELECT * FROM oqushylar WHERE synyp = '5A' AND jasy > 11;"),
        sq("SELECT aty FROM oqushylar WHERE aty LIKE 'А%';", "'А%' — имена, которые начинаются на А."),
        { t: "warn", html: "В SQL знак «равно» только один: <code>=</code> (не два). Не пиши текст без кавычек, иначе SQL решит, что это название столбца." },
      ],
    },
    {
      id: "l3", topic: "3", title: "ORDER BY и LIMIT", minutes: 4,
      blocks: [
        { t: "p", html: "<code>ORDER BY</code> сортирует результат: <code>ASC</code> — по возрастанию, <code>DESC</code> — по убыванию. По умолчанию действует ASC." },
        sq("SELECT aty, jasy FROM oqushylar ORDER BY jasy DESC;"),
        { t: "h", text: "LIMIT" },
        { t: "p", html: "<code>LIMIT n</code> оставляет только первые <b>n</b> строк. Вместе с сортировкой получаются запросы вроде «3 лучших»." },
        sq("SELECT * FROM bagalar ORDER BY baga DESC LIMIT 3;"),
        { t: "h", text: "Всё вместе" },
        { t: "p", html: "Порядок строгий: <code>SELECT … FROM … WHERE … ORDER BY … LIMIT …</code>." },
        sq("SELECT aty FROM oqushylar WHERE jasy > 10 ORDER BY aty LIMIT 5;"),
        { t: "tip", html: "Без сортировки неизвестно, какие строки возьмёт <code>LIMIT</code>. Всегда сначала пиши <code>ORDER BY</code>." },
      ],
    },
    {
      id: "l4", topic: "4", title: "Агрегатные функции", minutes: 4,
      blocks: [
        { t: "p", html: "Агрегатная функция превращает много строк в <b>одно значение</b>: <code>COUNT</code> считает, <code>SUM</code> складывает, <code>AVG</code> находит среднее, <code>MIN</code>/<code>MAX</code> дают наименьшее и наибольшее." },
        sq("SELECT COUNT(*) FROM oqushylar;"),
        sq("SELECT AVG(baga) FROM bagalar;"),
        sq("SELECT MIN(jasy), MAX(jasy) FROM oqushylar;"),
        { t: "h", text: "Вместе с условием" },
        { t: "p", html: "Сначала <code>WHERE</code> отбирает строки, потом считается функция:" },
        sq("SELECT COUNT(*) FROM bagalar WHERE baga = 5;"),
        { t: "warn", html: "<code>COUNT(*)</code> считает все строки. А <code>AVG</code> и <code>SUM</code> подходят только для числовых столбцов." },
      ],
    },
    {
      id: "l5", topic: "5", title: "GROUP BY: считаем по группам", minutes: 5,
      blocks: [
        { t: "p", html: "<code>GROUP BY</code> делит строки на группы по значению столбца, а агрегатная функция считается отдельно для каждой группы." },
        sq("SELECT synyp, COUNT(*) FROM oqushylar GROUP BY synyp;", "Сколько учеников в каждом классе."),
        sq("SELECT pan, AVG(baga) FROM bagalar GROUP BY pan;"),
        { t: "h", text: "HAVING: отбор групп" },
        { t: "p", html: "<code>WHERE</code> отбирает строки до группировки, а <code>HAVING</code> отбирает группы <b>после</b> группировки." },
        sq("SELECT synyp, COUNT(*) FROM oqushylar GROUP BY synyp HAVING COUNT(*) > 2;"),
        { t: "tip", html: "Правило: столбцы в <code>SELECT</code>, которые не агрегаты, обязательно должны быть в <code>GROUP BY</code>." },
      ],
    },
    {
      id: "l6", topic: "6", title: "JOIN: соединяем таблицы", minutes: 5,
      blocks: [
        { t: "p", html: "Данные лежат в разных таблицах: имена в <code>oqushylar</code>, оценки в <code>bagalar</code>. Мы связываем их через <code>oqushylar.id = bagalar.oqushy_id</code>." },
        sq("SELECT oqushylar.aty, bagalar.pan, bagalar.baga\nFROM oqushylar\nJOIN bagalar ON oqushylar.id = bagalar.oqushy_id;"),
        { t: "h", text: "Соединяем и группируем" },
        sq("SELECT oqushylar.aty, AVG(bagalar.baga)\nFROM oqushylar\nJOIN bagalar ON oqushylar.id = bagalar.oqushy_id\nGROUP BY oqushylar.aty;"),
        { t: "h", text: "LEFT JOIN" },
        { t: "p", html: "<code>JOIN</code> возвращает только строки, у которых есть пара с обеих сторон. <code>LEFT JOIN</code> сохраняет все строки левой таблицы, а там, где пары нет, ставит <code>NULL</code>. Так находят ученика без оценок." },
        sq("SELECT oqushylar.aty\nFROM oqushylar\nLEFT JOIN bagalar ON oqushylar.id = bagalar.oqushy_id\nWHERE bagalar.id IS NULL;"),
        { t: "warn", html: "<code>NULL</code> означает «значения нет». Его проверяют не через <code>= NULL</code>, а через <code>IS NULL</code>." },
      ],
    },
    {
      id: "l7", topic: "7", title: "INSERT, UPDATE, DELETE", minutes: 4,
      blocks: [
        { t: "p", html: "Данные можно не только читать, но и менять. Для этого есть <b>INSERT</b> (добавить), <b>UPDATE</b> (обновить), <b>DELETE</b> (удалить)." },
        sq("INSERT INTO oqushylar (aty, synyp, jasy, qala)\nVALUES ('Айдос', '5A', 11, 'Астана');\nSELECT * FROM oqushylar;"),
        sq("UPDATE oqushylar SET jasy = 12 WHERE id = 1;\nSELECT * FROM oqushylar WHERE id = 1;"),
        sq("DELETE FROM oqushylar WHERE id = 1;\nSELECT COUNT(*) FROM oqushylar;"),
        { t: "warn", html: "У <code>UPDATE</code> и <code>DELETE</code> <b>обязательно должен быть WHERE</b>! Без него изменятся или удалятся все строки." },
        { t: "tip", html: "Это учебная база: после каждого запроса данные возвращаются в исходное состояние, поэтому смело экспериментируй." },
      ],
    },
  ];

  c.reference = [
    { term: "SELECT … FROM", text: "Выбирает столбцы из таблицы. * — все столбцы.", code: "SELECT aty, synyp FROM oqushylar;" },
    { term: "WHERE", text: "Оставляет строки, подходящие под условие.", code: "SELECT * FROM oqushylar WHERE jasy > 11;" },
    { term: "ORDER BY / LIMIT", text: "Сортирует и ограничивает количество строк.", code: "SELECT * FROM bagalar ORDER BY baga DESC LIMIT 3;" },
    { term: "COUNT, SUM, AVG, MIN, MAX", text: "Считают одно значение по многим строкам.", code: "SELECT COUNT(*), AVG(baga) FROM bagalar;" },
    { term: "GROUP BY / HAVING", text: "Считает по группам, HAVING отбирает группы.", code: "SELECT synyp, COUNT(*) FROM oqushylar GROUP BY synyp HAVING COUNT(*) > 2;" },
    { term: "JOIN", text: "Соединяет две таблицы по общему столбцу.", code: "SELECT oqushylar.aty, bagalar.baga\nFROM oqushylar JOIN bagalar ON oqushylar.id = bagalar.oqushy_id;" },
    { term: "INSERT / UPDATE / DELETE", text: "Добавляют, меняют, удаляют строки. В UPDATE/DELETE не забывай WHERE.", code: "UPDATE oqushylar SET jasy = 12 WHERE id = 1;" },
  ];
})();
