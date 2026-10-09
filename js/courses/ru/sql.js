/* Курс SQL: пишем запросы к учебной базе данных (SQLite, прямо в браузере) */
(() => {
  const T1 = "1 · SELECT: деректерді таңдау";
  const T2 = "2 · WHERE: сүзу";
  const T3 = "3 · ORDER BY және LIMIT";
  const T4 = "4 · Агрегат функциялар";
  const T5 = "5 · GROUP BY: топтау";
  const T6 = "6 · JOIN: кестелерді біріктіру";
  const T7 = "7 · INSERT, UPDATE, DELETE";
  const S = "-- напиши свой запрос здесь\n";
  const lv = (o) => Object.assign({ par: 1, robot: null, starter: S }, o);

  KZ.registerCourse({
    id: "sql",
    name: "SQL",
    emoji: "🗄️",
    color: "#00a8a8",
    status: "ready",
    engine: "sql",
    tagline: "Получай ответы из базы данных с помощью запросов",
    topics: [
      { id: "1", emoji: "🔎", title: "SELECT", blurb: "Выбираем столбцы из таблицы" },
      { id: "2", emoji: "🧲", title: "WHERE", blurb: "Отбираем строки по условию" },
      { id: "3", emoji: "↕️", title: "ORDER BY и LIMIT", blurb: "Сортировка и ограничение" },
      { id: "4", emoji: "🧮", title: "Агрегатные функции", blurb: "COUNT, SUM, AVG, MIN, MAX" },
      { id: "5", emoji: "🗂️", title: "GROUP BY", blurb: "Считаем по группам" },
      { id: "6", emoji: "🔗", title: "JOIN", blurb: "Соединяем две таблицы" },
      { id: "7", emoji: "✏️", title: "INSERT, UPDATE, DELETE", blurb: "Меняем данные" },
    ],
    levels: [
      /* ---------- 1. SELECT ---------- */
      lv({
        id: "1.1", topic: T1, title: "Все ученики",
        task: "<p>В школьной базе данных есть таблица <b>oqushylar</b> (ученики). Выведи <b>все</b> её столбцы и строки.</p><p class='tip'>Знак <code>*</code> означает «все столбцы».</p>",
        hint: "SELECT * FROM oqushylar;",
        solution: "SELECT * FROM oqushylar;",
        need: [["\\bSELECT\\b", "Нужно написать SELECT."]],
      }),
      lv({
        id: "1.2", topic: T1, title: "Нужные столбцы",
        task: "<p>Выведи только <b>имя</b> и <b>класс</b> учеников (столбцы: <code>aty</code>, <code>synyp</code>).</p>",
        hint: "Вместо звёздочки напиши нужные столбцы через запятую: SELECT aty, synyp FROM oqushylar;",
        solution: "SELECT aty, synyp FROM oqushylar;",
      }),
      lv({
        id: "1.3", topic: T1, title: "Переименование (AS)",
        task: "<p>Выведи столбец <code>aty</code> под названием <b>esim</b>, а столбец <code>jasy</code> под названием <b>zhas</b>. Название столбца меняют с помощью <code>AS</code>.</p>",
        hint: "SELECT aty AS esim, jasy AS zhas FROM oqushylar;",
        solution: "SELECT aty AS esim, jasy AS zhas FROM oqushylar;",
        names: true,
      }),
      lv({
        id: "1.4", topic: T1, title: "Без повторов",
        task: "<p>Из каких <b>городов</b> ученики? Пусть каждый город выводится только один раз.</p><p class='tip'><code>DISTINCT</code> убирает повторяющиеся строки.</p>",
        hint: "SELECT DISTINCT qala FROM oqushylar;",
        solution: "SELECT DISTINCT qala FROM oqushylar;",
        need: [["\\bDISTINCT\\b", "Нужно использовать DISTINCT."]],
      }),

      /* ---------- 2. WHERE ---------- */
      lv({
        id: "2.1", topic: T2, title: "Один класс",
        task: "<p>Выведи имена только тех учеников, которые учатся в классе <b>5A</b>.</p><p class='tip'>Текст пишется в одинарных кавычках: <code>'5A'</code>. Здесь <code>A</code> — латинская буква.</p>",
        hint: "SELECT aty FROM oqushylar WHERE synyp = '5A';",
        solution: "SELECT aty FROM oqushylar WHERE synyp = '5A';",
        need: [["\\bWHERE\\b", "Нужно использовать WHERE."]],
      }),
      lv({
        id: "2.2", topic: T2, title: "Сравнение",
        task: "<p>Выведи имя и возраст учеников <b>старше</b> 12 лет (<code>aty</code>, <code>jasy</code>).</p>",
        hint: "WHERE jasy > 12. Знаки сравнения: =, >, <, >=, <=, <>.",
        solution: "SELECT aty, jasy FROM oqushylar WHERE jasy > 12;",
        need: [["\\bWHERE\\b", "Нужно использовать WHERE."]],
      }),
      lv({
        id: "2.3", topic: T2, title: "AND и OR",
        task: "<p>Выведи имена учеников из города <b>Астана</b> <b>и</b> в возрасте <b>11</b> лет.</p>",
        hint: "Два условия соединяет AND: WHERE qala = 'Астана' AND jasy = 11.",
        solution: "SELECT aty FROM oqushylar WHERE qala = 'Астана' AND jasy = 11;",
        need: [["\\bAND\\b", "Соедини два условия с помощью AND."]],
      }),
      lv({
        id: "2.4", topic: T2, title: "Поиск по шаблону (LIKE)",
        task: "<p>Найди учеников, имя которых начинается на букву <b>«А»</b> (только <code>aty</code>).</p><p class='tip'><code>LIKE 'А%'</code>: начинается на «А», а <code>%</code> — любое продолжение. Эта буква — кириллица.</p>",
        hint: "SELECT aty FROM oqushylar WHERE aty LIKE 'А%';",
        solution: "SELECT aty FROM oqushylar WHERE aty LIKE 'А%';",
        need: [["\\bLIKE\\b", "Нужно использовать LIKE."]],
      }),

      /* ---------- 3. ORDER BY и LIMIT ---------- */
      lv({
        id: "3.1", topic: T3, title: "По возрасту",
        task: "<p>Выведи имя и возраст учеников в порядке <b>возрастания возраста</b>.</p>",
        hint: "SELECT aty, jasy FROM oqushylar ORDER BY jasy;",
        solution: "SELECT aty, jasy FROM oqushylar ORDER BY jasy;",
        ordered: { col: 1, dir: "asc" },
        need: [["\\bORDER BY\\b", "Нужно использовать ORDER BY."]],
      }),
      lv({
        id: "3.2", topic: T3, title: "Самые высокие оценки",
        task: "<p>Из таблицы <b>bagalar</b> (оценки) выведи номер ученика, предмет и оценку (<code>oqushy_id</code>, <code>pan</code>, <code>baga</code>) в порядке <b>убывания оценки</b>.</p><p class='tip'>Для убывания напиши после столбца <code>DESC</code>.</p>",
        hint: "SELECT oqushy_id, pan, baga FROM bagalar ORDER BY baga DESC;",
        solution: "SELECT oqushy_id, pan, baga FROM bagalar ORDER BY baga DESC;",
        ordered: { col: 2, dir: "desc" },
        need: [["\\bDESC\\b", "Нужно использовать DESC."]],
      }),
      lv({
        id: "3.3", topic: T3, title: "Последние три ученика",
        task: "<p>Выведи столбцы <code>id</code> и <code>aty</code> у <b>трёх</b> учеников с самыми большими <code>id</code> (по убыванию id).</p><p class='tip'><code>LIMIT 3</code> оставляет в результате 3 строки.</p>",
        hint: "SELECT id, aty FROM oqushylar ORDER BY id DESC LIMIT 3;",
        solution: "SELECT id, aty FROM oqushylar ORDER BY id DESC LIMIT 3;",
        ordered: { col: 0, dir: "desc" },
        need: [["\\bLIMIT\\b", "Нужно использовать LIMIT."]],
      }),
      lv({
        id: "3.4", topic: T3, title: "Отбор и сортировка",
        task: "<p>Выведи имя и возраст учеников из города <b>Алматы</b> <b>по алфавиту</b> (по имени).</p>",
        hint: "Пиши WHERE раньше ORDER BY: ... WHERE qala = 'Алматы' ORDER BY aty;",
        solution: "SELECT aty, jasy FROM oqushylar WHERE qala = 'Алматы' ORDER BY aty;",
        ordered: { col: 0, dir: "asc" },
        need: [["\\bWHERE\\b", "Нужно использовать WHERE."], ["\\bORDER BY\\b", "Нужно использовать ORDER BY."]],
      }),

      /* ---------- 4. Агрегаты ---------- */
      lv({
        id: "4.1", topic: T4, title: "Сколько учеников?",
        task: "<p>Сколько всего учеников в таблице? Выведи одно число.</p><p class='tip'><code>COUNT(*)</code> возвращает количество строк.</p>",
        hint: "SELECT COUNT(*) FROM oqushylar;",
        solution: "SELECT COUNT(*) FROM oqushylar;",
        need: [["\\bCOUNT\\b", "Нужно использовать COUNT."]],
      }),
      lv({
        id: "4.2", topic: T4, title: "Средняя оценка",
        task: "<p>Найди среднюю оценку по предмету <b>Математика</b>.</p><p class='tip'><code>AVG(столбец)</code> считает среднее значение.</p>",
        hint: "SELECT AVG(baga) FROM bagalar WHERE pan = 'Математика';",
        solution: "SELECT AVG(baga) FROM bagalar WHERE pan = 'Математика';",
        need: [["\\bAVG\\b", "Нужно использовать AVG."]],
      }),
      lv({
        id: "4.3", topic: T4, title: "Наименьший и наибольший",
        task: "<p>Выведи <b>наименьший</b> и <b>наибольший</b> возраст учеников одним запросом (два столбца).</p>",
        hint: "SELECT MIN(jasy), MAX(jasy) FROM oqushylar;",
        solution: "SELECT MIN(jasy), MAX(jasy) FROM oqushylar;",
        need: [["\\bMIN\\b", "Нужно использовать MIN."], ["\\bMAX\\b", "Нужно использовать MAX."]],
      }),
      lv({
        id: "4.4", topic: T4, title: "Сколько пятёрок?",
        task: "<p>Сколько раз среди всех оценок поставлена оценка <b>5</b>?</p><p class='tip'>Сначала <code>WHERE</code> отбирает строки, потом <code>COUNT</code> их считает.</p>",
        hint: "SELECT COUNT(*) FROM bagalar WHERE baga = 5;",
        solution: "SELECT COUNT(*) FROM bagalar WHERE baga = 5;",
        need: [["\\bCOUNT\\b", "Нужно использовать COUNT."], ["\\bWHERE\\b", "Нужно использовать WHERE."]],
      }),

      /* ---------- 5. GROUP BY ---------- */
      lv({
        id: "5.1", topic: T5, title: "Считаем по классам",
        task: "<p>Сколько учеников в каждом классе? Выведи два столбца: <code>synyp</code> и количество учеников.</p><p class='tip'><code>GROUP BY synyp</code> собирает строки в группы по классу.</p>",
        hint: "SELECT synyp, COUNT(*) FROM oqushylar GROUP BY synyp;",
        solution: "SELECT synyp, COUNT(*) FROM oqushylar GROUP BY synyp;",
        need: [["\\bGROUP BY\\b", "Нужно использовать GROUP BY."]],
      }),
      lv({
        id: "5.2", topic: T5, title: "Среднее по предметам",
        task: "<p>Выведи среднюю оценку по каждому предмету: <code>pan</code> и <code>AVG(baga)</code>.</p>",
        hint: "SELECT pan, AVG(baga) FROM bagalar GROUP BY pan;",
        solution: "SELECT pan, AVG(baga) FROM bagalar GROUP BY pan;",
        need: [["\\bGROUP BY\\b", "Нужно использовать GROUP BY."]],
      }),
      lv({
        id: "5.3", topic: T5, title: "Старший в классе",
        task: "<p>Выведи <b>наибольший возраст</b> в каждом классе: <code>synyp</code> и <code>MAX(jasy)</code>.</p>",
        hint: "SELECT synyp, MAX(jasy) FROM oqushylar GROUP BY synyp;",
        solution: "SELECT synyp, MAX(jasy) FROM oqushylar GROUP BY synyp;",
        need: [["\\bGROUP BY\\b", "Нужно использовать GROUP BY."]],
      }),
      lv({
        id: "5.4", topic: T5, title: "Отбор групп (HAVING)",
        task: "<p>Выведи только те города, где <b>больше 2</b> учеников: <code>qala</code> и количество учеников.</p><p class='tip'>Результат групп отбирает не <code>WHERE</code>, а <code>HAVING</code>.</p>",
        hint: "SELECT qala, COUNT(*) FROM oqushylar GROUP BY qala HAVING COUNT(*) > 2;",
        solution: "SELECT qala, COUNT(*) FROM oqushylar GROUP BY qala HAVING COUNT(*) > 2;",
        need: [["\\bHAVING\\b", "Нужно использовать HAVING."]],
      }),

      /* ---------- 6. JOIN ---------- */
      lv({
        id: "6.1", topic: T6, title: "Соединяем две таблицы",
        task: "<p>Покажи, чья каждая оценка: <code>oqushylar.aty</code>, <code>bagalar.pan</code>, <code>bagalar.baga</code>.</p><p class='tip'>Связь таблиц: <code>oqushylar.id = bagalar.oqushy_id</code>.</p>",
        hint: "SELECT oqushylar.aty, bagalar.pan, bagalar.baga FROM oqushylar JOIN bagalar ON oqushylar.id = bagalar.oqushy_id;",
        solution: "SELECT oqushylar.aty, bagalar.pan, bagalar.baga FROM oqushylar JOIN bagalar ON oqushylar.id = bagalar.oqushy_id;",
        need: [["\\bJOIN\\b", "Нужно использовать JOIN."]],
      }),
      lv({
        id: "6.2", topic: T6, title: "Пятёрки по информатике",
        task: "<p>Выведи имена учеников, которые получили <b>5</b> по информатике.</p>",
        hint: "Добавь к JOIN условие WHERE: ... WHERE bagalar.pan = 'Информатика' AND bagalar.baga = 5;",
        solution: "SELECT oqushylar.aty FROM oqushylar JOIN bagalar ON oqushylar.id = bagalar.oqushy_id WHERE bagalar.pan = 'Информатика' AND bagalar.baga = 5;",
        need: [["\\bJOIN\\b", "Нужно использовать JOIN."], ["\\bWHERE\\b", "Нужно использовать WHERE."]],
      }),
      lv({
        id: "6.3", topic: T6, title: "Среднее каждого ученика",
        task: "<p>Выведи <b>среднюю оценку</b> каждого ученика: <code>oqushylar.aty</code> и <code>AVG(bagalar.baga)</code>. Ученики без оценок не выводятся.</p>",
        hint: "Сделай JOIN и сгруппируй по ученику: ... GROUP BY oqushylar.id;",
        solution: "SELECT oqushylar.aty, AVG(bagalar.baga) FROM oqushylar JOIN bagalar ON oqushylar.id = bagalar.oqushy_id GROUP BY oqushylar.id;",
        need: [["\\bJOIN\\b", "Нужно использовать JOIN."], ["\\bGROUP BY\\b", "Нужно использовать GROUP BY."]],
      }),
      lv({
        id: "6.4", topic: T6, title: "Ученик без оценок",
        task: "<p>Найди ученика, у которого нет ни одной оценки (только <code>aty</code>).</p><p class='tip'><code>LEFT JOIN</code> сохраняет все строки левой таблицы. Если подходящей оценки нет, столбцы справа получают значение <code>NULL</code>: его проверяют с помощью <code>IS NULL</code>.</p>",
        hint: "SELECT oqushylar.aty FROM oqushylar LEFT JOIN bagalar ON oqushylar.id = bagalar.oqushy_id WHERE bagalar.id IS NULL;",
        solution: "SELECT oqushylar.aty FROM oqushylar LEFT JOIN bagalar ON oqushylar.id = bagalar.oqushy_id WHERE bagalar.id IS NULL;",
        need: [["\\bLEFT JOIN\\b", "Нужно использовать LEFT JOIN."], ["IS NULL", "Нужно использовать IS NULL."]],
      }),

      /* ---------- 7. Изменение данных ---------- */
      lv({
        id: "7.1", topic: T7, title: "Новый ученик",
        task: "<p>Добавь нового ученика: <b>id 11, Жанар, 6A, 12 лет, Астана</b>. Порядок столбцов: <code>id, aty, synyp, jasy, qala</code>.</p><p class='tip'><code>INSERT INTO таблица VALUES (значение1, значение2, …);</code> Текст пишется в кавычках, числа без кавычек.</p>",
        hint: "INSERT INTO oqushylar VALUES (11, 'Жанар', '6A', 12, 'Астана');",
        solution: "INSERT INTO oqushylar VALUES (11, 'Жанар', '6A', 12, 'Астана');",
        verify: "SELECT * FROM oqushylar ORDER BY id;",
        need: [["\\bINSERT\\b", "Нужно использовать INSERT."]],
      }),
      lv({
        id: "7.2", topic: T7, title: "Обновить значение",
        task: "<p><b>Дана</b> переехала в Алматы. Измени её город на <code>'Алматы'</code>. Другие ученики не должны измениться!</p><p class='tip'><code>UPDATE таблица SET столбец = значение WHERE условие;</code> UPDATE <b>без WHERE</b> меняет все строки.</p>",
        hint: "UPDATE oqushylar SET qala = 'Алматы' WHERE aty = 'Дана';",
        solution: "UPDATE oqushylar SET qala = 'Алматы' WHERE aty = 'Дана';",
        verify: "SELECT * FROM oqushylar ORDER BY id;",
        need: [["\\bUPDATE\\b", "Нужно использовать UPDATE."], ["\\bWHERE\\b", "Не забудь добавить WHERE!"]],
      }),
      lv({
        id: "7.3", topic: T7, title: "Удалить строку",
        task: "<p>Удали все оценки <b>8-го</b> ученика (<code>oqushy_id = 8</code>) из таблицы <b>bagalar</b>.</p><p class='tip'><code>DELETE FROM таблица WHERE условие;</code> Без WHERE удалятся все строки!</p>",
        hint: "DELETE FROM bagalar WHERE oqushy_id = 8;",
        solution: "DELETE FROM bagalar WHERE oqushy_id = 8;",
        verify: "SELECT * FROM bagalar ORDER BY id;",
        need: [["\\bDELETE\\b", "Нужно использовать DELETE."], ["\\bWHERE\\b", "Не забудь добавить WHERE!"]],
      }),
      lv({
        id: "7.4", topic: T7, title: "Стали на год старше",
        task: "<p>Увеличь возраст всех учеников класса <b>6A</b> <b>на 1</b>.</p><p class='tip'>Новое значение считается из старого: <code>SET jasy = jasy + 1</code>.</p>",
        hint: "UPDATE oqushylar SET jasy = jasy + 1 WHERE synyp = '6A';",
        solution: "UPDATE oqushylar SET jasy = jasy + 1 WHERE synyp = '6A';",
        verify: "SELECT * FROM oqushylar ORDER BY id;",
        need: [["\\bUPDATE\\b", "Нужно использовать UPDATE."], ["\\bWHERE\\b", "Не забудь добавить WHERE!"]],
      }),
    ],
    bonus: [],
    lectures: [],
    reference: [],
  });
})();
