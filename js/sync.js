/* Bitlings: барлық жергілікті күйді (қайталау, қателер, жетістіктер, ойын, черновиктер…) Supabase-пен синхрондау.
   Принцип: әр кілттің өз «жаңалау уақыты» бар. Серверден тартып, біріктіреміз, өзгергенін қайта жібереміз.
   Біріктіру: көбіне «соңғы өзгерген жеңеді», ал өсетін деректер (жетістік, ойын жұлдызы) бірігеді.
   Прогресс, лекция, белсенді күндер, кейіпкер — auth.js ішіндегі ескі арнамен синхрондалады. */
(() => {
  "use strict";
  const A = KZ.auth;
  if (!A || !A.enabled) return;

  const META = "kodzholy.sync.meta"; // { кілт: соңғы өзгерген уақыт (мс) }
  const DIRTY = "kodzholy.sync.dirty"; // серверге әлі жіберілмеген кілттер
  const SINCE = "kodzholy.sync.since"; // сервер уақыты: осыдан кейінгі өзгерістерді ғана тартамыз
  const LAST = "kodzholy.sync.last";
  const EXACT = new Set([
    "kodzholy.review.v1",
    "kodzholy.review.v1.done",
    "kodzholy.mistakes.v1",
    "kodzholy.penalty.v1",
    "kodzholy.daily.v1",
    "kodzholy.ach.v1",
    "kodzholy.game.v1",
    "kodzholy.chest.v1",
    "kodzholy.shield.start",
    "kodzholy.certname",
    "kodzholy.helper",
    "kodzholy.last",
  ]);
  const syncable = (k) => EXACT.has(k) || k.startsWith("kodzholy.code.");
  const MAX_LEN = 50000;

  /* ---------- көмекшілер ---------- */
  const rawGet = (k) => {
    try {
      return localStorage.getItem(k);
    } catch (e) {
      return null;
    }
  };
  const rawSet = (k, s) => {
    try {
      localStorage.setItem(k, s);
    } catch (e) {
      /* үнсіз */
    }
  };
  const jget = (k, d) => {
    try {
      const s = rawGet(k);
      return s == null ? d : JSON.parse(s);
    } catch (e) {
      return d;
    }
  };
  const stable = (v) => {
    if (Array.isArray(v)) return "[" + v.map(stable).join(",") + "]";
    if (v && typeof v === "object")
      return (
        "{" +
        Object.keys(v)
          .sort()
          .map((k) => JSON.stringify(k) + ":" + stable(v[k]))
          .join(",") +
        "}"
      );
    return JSON.stringify(v === undefined ? null : v);
  };
  const eq = (a, b) => stable(a) === stable(b);
  const isObj = (x) => x && typeof x === "object" && !Array.isArray(x);
  const getMeta = () => jget(META, {});
  const getDirty = () => new Set(jget(DIRTY, []));
  const saveMeta = (m) => rawSet(META, JSON.stringify(m));
  const saveDirty = (d) => rawSet(DIRTY, JSON.stringify([...d]));

  /* ---------- біріктіру ережелері ---------- */
  const perKey = (L, R, pick) => {
    const out = {};
    new Set([...Object.keys(L || {}), ...Object.keys(R || {})]).forEach((k) => {
      out[k] = !L || !(k in L) ? R[k] : !R || !(k in R) ? L[k] : pick(L[k], R[k]);
    });
    return out;
  };
  const MERGE = {
    /* қайталау: әр сұрақ бойынша кейінірек жауап берілгені */
    "kodzholy.review.v1"(L, R) {
      if (!isObj(L) || !isObj(R)) return null;
      return perKey(L, R, (a, b) => {
        const x = String((a && a.a) || "");
        const y = String((b && b.a) || "");
        if (x !== y) return x > y ? a : b;
        return String((a && a.d) || "") >= String((b && b.d) || "") ? a : b;
      });
    },
    "kodzholy.review.v1.done": (L, R) => (String(L || "") >= String(R || "") ? L : R),
    /* жетістік: ашылған күні ертерегі */
    "kodzholy.ach.v1"(L, R) {
      if (!isObj(L) || !isObj(R)) return null;
      return perKey(L, R, (a, b) => (String(a) <= String(b) ? a : b));
    },
    "kodzholy.chest.v1": (L, R) => (String((L && L.week) || "") >= String((R && R.week) || "") ? L : R),
    "kodzholy.shield.start": (L, R) => (String(L || "9") <= String(R || "9") ? L : R),
    /* ойын: жұлдыз/тиын — үлкені, сақталған код — жаңасы (tl >= tr болса жергілікті) */
    "kodzholy.game.v1"(L, R, tl, tr) {
      if (!isObj(L) || !isObj(R)) return null;
      const mx = (a, b) => perKey(a, b, (x, y) => Math.max(x || 0, y || 0));
      const newer = tl >= tr ? L : R;
      const older = tl >= tr ? R : L;
      const out = Object.assign({}, older, newer);
      out.s = mx(L.s || {}, R.s || {});
      out.b = mx(L.b || {}, R.b || {});
      out.code = Object.assign({}, older.code || {}, newer.code || {});
      return out;
    },
  };
  function merge(k, L, R, tl, tr) {
    const f = MERGE[k];
    if (f) {
      const m = f(L, R, tl, tr);
      if (m !== null && m !== undefined) return m;
    }
    return tl >= tr ? L : R; // соңғы өзгерген жеңеді
  }

  /* ---------- күй ---------- */
  const listeners = [];
  const S = { state: "idle", at: +rawGet(LAST) || 0, err: "" };
  const setState = (state, err) => {
    S.state = state;
    S.err = err || "";
    if (state === "ok") {
      S.at = Date.now();
      rawSet(LAST, String(S.at));
    }
    listeners.forEach((f) => {
      try {
        f(S);
      } catch (e) {
        /* үнсіз */
      }
    });
  };

  let running = null;
  let again = false;
  let missing = false; // сервер жағында SQL орнатылмаған
  let lastDone = 0;
  let timer = null;

  function changedLocally() {
    try {
      if (KZ.ach && KZ.ach.check) KZ.ach.check(true);
      if (KZ.updateTotal) KZ.updateTotal();
    } catch (e) {
      /* үнсіз */
    }
    window.dispatchEvent(new CustomEvent("kz-synced"));
  }

  async function cycle() {
    const since = rawGet(SINCE) || null;
    const res = await A.rpc("state_pull", { since });
    const rows = (res && res.rows) || [];
    const meta = getMeta();
    const dirty = getDirty();
    let changed = false;
    const seen = new Set();

    /* 1. Серверден келгенді біріктіру (синхронды, арада бөгет жоқ) */
    rows.forEach((row) => {
      const k = row && row.k;
      if (!k || !syncable(k)) return;
      seen.add(k);
      const rv = row.v;
      const tr = +row.t || 0;
      const s = rawGet(k);
      if (s == null) {
        rawSet(k, JSON.stringify(rv));
        meta[k] = tr;
        dirty.delete(k);
        changed = true;
        return;
      }
      let L;
      try {
        L = JSON.parse(s);
      } catch (e) {
        L = null;
      }
      const tl = +meta[k] || 0;
      const M = merge(k, L, rv, tl, tr);
      if (!eq(M, L)) {
        rawSet(k, JSON.stringify(M));
        changed = true;
      }
      if (eq(M, rv)) {
        meta[k] = tr;
        dirty.delete(k);
      } else {
        meta[k] = eq(M, L) && tl > 0 ? tl : Date.now();
        dirty.add(k);
      }
    });

    /* 2. Толық тартқанда серверде жоқ жергілікті кілттер — жіберілетін */
    if (!since) {
      try {
        Object.keys(localStorage).forEach((k) => {
          if (syncable(k) && !seen.has(k)) {
            if (!meta[k]) meta[k] = Date.now();
            dirty.add(k);
          }
        });
      } catch (e) {
        /* үнсіз */
      }
    }
    saveMeta(meta);
    saveDirty(dirty);

    /* 3. Жіберу */
    const items = [];
    [...dirty].forEach((k) => {
      const s = rawGet(k);
      if (s == null || s.length > MAX_LEN) {
        dirty.delete(k);
        return;
      }
      items.push({ k, v: JSON.parse(s), t: +meta[k] || Date.now() });
    });
    for (let i = 0; i < items.length; i += 150) await A.rpc("state_push", { items: items.slice(i, i + 150) });

    /* 4. Жіберілгенді «таза» деп белгілеу (жіберу кезінде өзгерген кілтті қалдырамыз) */
    const m2 = getMeta();
    const d2 = getDirty();
    items.forEach((it) => {
      if ((+m2[it.k] || 0) === it.t || !m2[it.k]) d2.delete(it.k);
      if (!m2[it.k]) m2[it.k] = it.t;
    });
    saveMeta(m2);
    saveDirty(d2);
    if (res && res.now) rawSet(SINCE, String(res.now));
    if (changed) changedLocally();
  }

  function run(force) {
    if (!A.isActive() || missing) return Promise.resolve();
    if (running) {
      again = true;
      return running;
    }
    if (!force && Date.now() - lastDone < 2500 && !getDirty().size) return Promise.resolve();
    setState("sync");
    running = (async () => {
      try {
        await cycle();
        setState("ok");
      } catch (e) {
        if (/state_pull|state_push|Could not find|schema cache/i.test(e.message)) {
          missing = true;
          setState("off", "sql");
        } else setState("err", e.message);
      } finally {
        lastDone = Date.now();
        running = null;
        if (again) {
          again = false;
          queue();
        }
      }
    })();
    return running;
  }

  function queue(ms) {
    clearTimeout(timer);
    timer = setTimeout(() => run(true), ms == null ? 1500 : ms);
  }

  /* ---------- KZ.store.set арқылы жазылған әр өзгеріс белгіленеді ---------- */
  const origSet = KZ.store.set;
  KZ.store.set = function (k, v) {
    origSet.call(KZ.store, k, v);
    if (syncable(k)) {
      const meta = getMeta();
      meta[k] = Date.now();
      saveMeta(meta);
      const d = getDirty();
      d.add(k);
      saveDirty(d);
      if (A.isActive()) queue();
    }
  };

  KZ.sync = {
    run: () => run(true),
    flush: () => (A.isActive() && !missing ? run(true) : Promise.resolve()),
    status: () => S,
    onStatus: (f) => listeners.push(f),
    pending: () => getDirty().size,
  };

  /* ---------- қашан синхрондаймыз ---------- */
  A.onChange(() => {
    if (A.isActive()) queue(300);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") queue(200);
    else if (getDirty().size) run(true);
  });
  window.addEventListener("online", () => queue(500));
  window.addEventListener("focus", () => queue(500));
  window.addEventListener("pagehide", () => {
    if (getDirty().size) run(true);
  });
  setInterval(() => {
    if (document.visibilityState === "visible") run(true);
  }, 30000);
})();
