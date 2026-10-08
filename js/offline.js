/* Ботакод: интернетсіз жұмысқа алдын ала жүктеу.
   Қозғалтқыштар (Python, JS, SQL) бірінші қажет болғанда жүктеліп, service worker кэшіне түседі.
   Бұл бөлік сол файлдарды алдын ала, бір батырмамен жүктейді (мысалы, мектептің Wi-Fi-ында). */
(() => {
  "use strict";
  const PY = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
  const FILES = [
    { name: "Python", urls: [PY + "pyodide.js", PY + "pyodide.asm.js", PY + "pyodide.asm.wasm", PY + "python_stdlib.zip", PY + "pyodide-lock.json"], need: 5 },
    { name: "JavaScript", urls: ["https://cdn.jsdelivr.net/npm/acorn@8.12.1/dist/acorn.min.js"], need: 1 },
    { name: "SQL", urls: ["https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js", "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.wasm"], need: 2 },
  ];
  const KEY = "kodzholy.offline";
  const O = (KZ.offline = { files: FILES });

  O.supported = () => "serviceWorker" in navigator && "caches" in window;
  O.state = () => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "null");
    } catch (e) {
      return null;
    }
  };
  const save = (v) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(v));
    } catch (e) {}
  };

  /* Қай файлдар кэште бар екенін тексереді: [{name, have, need}] */
  O.check = async () => {
    const out = [];
    for (const g of FILES) {
      let have = 0;
      for (const u of g.urls) {
        try {
          if (await caches.match(u)) have++;
        } catch (e) {}
      }
      out.push({ name: g.name, have, need: g.need, ok: have >= g.need });
    }
    return out;
  };

  /* Жүктейді. onProgress(done, total). Қайтарады: {ok, groups} */
  O.prepare = async (onProgress) => {
    if (!O.supported()) throw new Error("Бұл браузер офлайн режимді қолдамайды.");
    if (navigator.onLine === false) throw new Error("Интернет жоқ. Желіге қосылып қайталап көр.");
    try {
      if (navigator.serviceWorker.ready) await navigator.serviceWorker.ready; // кэшке жазатын service worker дайын болсын
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {}); // браузер кэшті өшіріп жібермесін
    } catch (e) {}
    const all = FILES.flatMap((g) => g.urls);
    let done = 0;
    if (onProgress) onProgress(0, all.length);
    for (const u of all) {
      try {
        const r = await fetch(u);
        if (r.ok) await r.arrayBuffer(); // толық жүктелсін (қысқа үзілістен кейін де кэшке түсу үшін)
      } catch (e) {
        /* кейін check() көрсетеді */
      }
      done++;
      if (onProgress) onProgress(done, all.length);
    }
    const groups = await O.check();
    const ok = groups.every((g) => g.ok);
    save({ ok, at: Date.now(), groups });
    return { ok, groups };
  };
})();
