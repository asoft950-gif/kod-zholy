/* Bitlings: SQL курсының таза логикасы (деректер қоры, нәтижені салыстыру, қате түсіндіру). DOM-ға тәуелсіз, тестілеуге болады */
globalThis.KZ = globalThis.KZ || {};
KZ.sqlCore = (() => {
  /* Барлық тапсырмаларға ортақ оқу деректер қоры */
  const seed = `
CREATE TABLE oqushylar (id INTEGER PRIMARY KEY, aty TEXT, synyp TEXT, jasy INTEGER, qala TEXT);
INSERT INTO oqushylar VALUES
 (1, 'Алия', '5A', 11, 'Астана'),
 (2, 'Бекзат', '5A', 12, 'Алматы'),
 (3, 'Дана', '5B', 11, 'Астана'),
 (4, 'Ерлан', '5B', 12, 'Шымкент'),
 (5, 'Томирис', '5A', 11, 'Алматы'),
 (6, 'Нұрлан', '6A', 12, 'Астана'),
 (7, 'Айгерім', '6A', 13, 'Қарағанды'),
 (8, 'Санжар', '6B', 13, 'Алматы'),
 (9, 'Мадина', '6B', 12, 'Астана'),
 (10, 'Әлихан', '5A', 12, 'Шымкент');
CREATE TABLE bagalar (id INTEGER PRIMARY KEY, oqushy_id INTEGER, pan TEXT, baga INTEGER);
INSERT INTO bagalar VALUES
 (1, 1, 'Математика', 5), (2, 1, 'Информатика', 5),
 (3, 2, 'Математика', 4), (4, 2, 'Информатика', 5), (5, 2, 'Қазақ тілі', 3),
 (6, 3, 'Математика', 3), (7, 3, 'Информатика', 4),
 (8, 4, 'Математика', 5), (9, 4, 'Қазақ тілі', 4),
 (10, 5, 'Информатика', 5), (11, 5, 'Қазақ тілі', 5),
 (12, 6, 'Математика', 4), (13, 6, 'Информатика', 3),
 (14, 7, 'Математика', 5), (15, 7, 'Информатика', 4), (16, 7, 'Қазақ тілі', 5),
 (17, 8, 'Математика', 3),
 (18, 9, 'Информатика', 4), (19, 9, 'Қазақ тілі', 4);
`;

  /* SQLite қателерін қазақшаға түсіндіру */
  function kzError(msg) {
    msg = String(msg || "");
    let m;
    if ((m = msg.match(/no such table: (.+)/))) return "«" + m[1] + "» деген кесте жоқ. Кесте аттары: oqushylar, bagalar.";
    if ((m = msg.match(/no such column: (.+)/))) return "«" + m[1] + "» деген баған жоқ. Бағандар аттарын «Кестелер» бөлімінен қара.";
    if ((m = msg.match(/ambiguous column name: (.+)/))) return "«" + m[1] + "» бағаны екі кестеде де бар. Кесте атын қос: oqushylar." + m[1];
    if ((m = msg.match(/near "(.*)": syntax error/))) return "Синтаксис қатесі «" + m[1] + "» жанында. Үтірді, тырнақшаны және кілт сөздердің жазылуын тексер.";
    if (/incomplete input/.test(msg)) return "Сұраныс аяқталмаған. Жақша не тырнақша жабылмаған болуы мүмкін.";
    if (/unrecognized token/.test(msg)) return "Танылмайтын таңба. Тырнақшаларды (') тексер.";
    if (/UNIQUE constraint failed/.test(msg)) return "Бұл id бұрыннан бар. Басқа id қолдан.";
    if (/more than one statement|You can only execute one statement/.test(msg)) return "Бір рет бір сұраныс жаз.";
    if (/misuse of aggregate/.test(msg)) return "Агрегат функцияны (COUNT, AVG…) WHERE ішінде қолдануға болмайды. Топтау үшін HAVING қолдан.";
    if (/values for \d+ columns|has \d+ columns but \d+ values/.test(msg)) return "Мәндер саны бағандар санына сәйкес емес.";
    return "Қате: " + msg;
  }

  function open(SQL) {
    const db = new SQL.Database();
    db.run(seed);
    return db;
  }

  /* Кодты жаңа қорда орындау. Қайтарады: { db, sets, last, changed, error } */
  function execute(SQL, code) {
    const db = open(SQL);
    try {
      const sets = db.exec(code);
      return { db, sets, last: sets.length ? sets[sets.length - 1] : null, changed: db.getRowsModified() };
    } catch (e) {
      return { db, error: kzError(e.message) };
    }
  }

  const num = (v) => (typeof v === "number" ? Math.round(v * 10000) / 10000 : v);
  const rowKey = (r) => JSON.stringify(r.map(num));

  /* a — оқушының нәтижесі, b — күтілген. Сәйкес болса null, болмаса хабарлама */
  function compare(a, b, level) {
    if (!a) return "Нәтиже кестесі шықпады. Деректерді қайтаратын SELECT сұранысын жаз.";
    if (a.columns.length !== b.columns.length) return "Бағандар саны сәйкес емес: күтілгені " + b.columns.length + ", ал сенде " + a.columns.length + ".";
    if (level.names) {
      for (let i = 0; i < b.columns.length; i++) {
        if (String(a.columns[i]).toLowerCase() !== String(b.columns[i]).toLowerCase()) return "Баған атауы «" + b.columns[i] + "» болуы керек (AS қолдан), ал сенде «" + a.columns[i] + "».";
      }
    }
    if (a.values.length !== b.values.length) return "Жолдар саны сәйкес емес: күтілгені " + b.values.length + ", ал сенде " + a.values.length + ".";
    const ka = a.values.map(rowKey).sort();
    const kb = b.values.map(rowKey).sort();
    for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i]) return "Жолдар жауапқа сәйкес емес. Шарт пен бағандарды қайта тексер.";
    if (level.ordered) {
      const { col, dir } = level.ordered;
      for (let i = 1; i < a.values.length; i++) {
        const p = a.values[i - 1][col];
        const q = a.values[i][col];
        if (dir === "desc" ? p < q : p > q) return "Жолдардың реті дұрыс емес: " + (dir === "desc" ? "кему" : "өсу") + " ретімен болуы керек.";
      }
    }
    return null;
  }

  /* Қандай кілт сөздер міндетті екенін тексеру (регэксп) */
  function needs(level, code) {
    const miss = [];
    (level.need || []).forEach(([re, msg]) => {
      if (!new RegExp(re, "i").test(code)) miss.push(msg);
    });
    return miss;
  }

  const cache = {};
  /* Күтілген нәтиже (шешімнен) */
  function expected(SQL, level) {
    const k = level.id;
    if (!cache[k]) {
      const r = execute(SQL, level.solution);
      if (r.error) throw new Error("Шешім қате: " + level.id + ": " + r.error);
      let res = r.last;
      if (level.verify) {
        const v = r.db.exec(level.verify);
        res = v.length ? v[v.length - 1] : null;
      }
      cache[k] = res;
      r.db.close();
    }
    return cache[k];
  }

  /* Толық тексеру: { ok, reason, run } — run: оқушы кодының нәтижесі (көрсету үшін) */
  function evaluate(SQL, level, code) {
    const run = execute(SQL, code);
    if (run.error) return { ok: false, error: true, reason: run.error, run };
    if (!String(code).replace(/--.*$/gm, "").trim()) return { ok: false, reason: "Сұраныс жазылмаған.", run };
    const miss = needs(level, code);
    let view = run.last;
    if (level.verify) {
      try {
        const v = run.db.exec(level.verify);
        view = v.length ? v[v.length - 1] : null;
      } catch (e) {
        return { ok: false, reason: kzError(e.message), run };
      }
    }
    run.view = view;
    const bad = compare(view, expected(SQL, level), level);
    if (bad) return { ok: false, reason: bad, run, expected: expected(SQL, level) };
    if (miss.length) return { ok: false, reason: miss.join(" "), run };
    return { ok: true, run };
  }

  /* Жұлдыз: бірінші талпыныста 3, 1–2 қателіктен кейін немесе кеңеспен 2, әйтпесе 1 */
  const starsFor = (fails, usedHint) => (fails === 0 && !usedHint ? 3 : fails <= 2 ? 2 : 1);

  return { seed, kzError, open, execute, compare, evaluate, expected, starsFor };
})();
