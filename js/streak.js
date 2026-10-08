/* Bitlings: күн сериясы (streak), күнделікті тапсырма, жетістіктер */
(() => {
  "use strict";

  const { el, h } = KZ;
  const DAYS_KEY = "kodzholy.days.v1"; // { "2026-10-08": 1 (белсенді) | 3 (белсенді + күннің тапсырмасы) }
  const DAILY_KEY = "kodzholy.daily.v1"; // { date, course, level }
  const ACH_KEY = "kodzholy.ach.v1"; // { id: күні }
  const ACH_INIT = "kodzholy.ach.init";

  const pad = (n) => String(n).padStart(2, "0");
  const ymd = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  function addDays(s, n) {
    const [y, m, d] = s.split("-").map(Number);
    return ymd(new Date(y, m - 1, d + n));
  }
  const isDay = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s));

  /* ---------- Белсенді күндер ---------- */
  const act = (KZ.activity = {
    today: () => ymd(new Date()),
    addDays,
    all: () => KZ.store.get(DAYS_KEY, {}),

    /* Бүгін белсенді болды деп белгілеу; daily=true болса, күннің тапсырмасы да орындалды */
    mark(daily) {
      const all = act.all();
      const t = act.today();
      const cur = all[t] || 0;
      const nv = cur | (daily ? 3 : 1);
      if (nv === cur) return { first: false, daily: false };
      all[t] = nv;
      KZ.store.set(DAYS_KEY, all);
      KZ.updateStreak();
      return { first: cur === 0, daily: !!daily && !(cur & 2) };
    },

    /* Қазіргі серия: бүгін не кеше белсенді болса, тірі */
    streak() {
      const all = act.all();
      const t = act.today();
      let day = all[t] ? t : addDays(t, -1);
      let n = 0;
      while (all[day]) {
        n++;
        day = addDays(day, -1);
      }
      return { n, doneToday: !!all[t] };
    },
    best() {
      const keys = Object.keys(act.all())
        .filter(isDay)
        .sort();
      let best = 0;
      let run = 0;
      let prev = null;
      keys.forEach((k) => {
        run = prev && addDays(prev, 1) === k ? run + 1 : 1;
        if (run > best) best = run;
        prev = k;
      });
      return best;
    },
    dailyCount() {
      return Object.values(act.all()).filter((v) => v & 2).length;
    },
    dailyDoneToday() {
      return !!((act.all()[act.today()] || 0) & 2);
    },

    /* Бұлтпен біріктіру */
    toCloud() {
      const all = act.all();
      return Object.keys(all)
        .filter(isDay)
        .map((d) => ({ d, y: all[d] & 2 ? 1 : 0 }));
    },
    fromCloud(list) {
      const all = act.all();
      (list || []).forEach((x) => {
        if (isDay(x.d)) all[x.d] = (all[x.d] || 0) | (x.y ? 3 : 1);
      });
      KZ.store.set(DAYS_KEY, all);
      KZ.updateStreak();
    },

    /* ---------- Күннің тапсырмасы ---------- */
    _pick() {
      const t = act.today();
      const pools = [[], [], []];
      KZ.courses.forEach((c) => {
        if (c.status !== "ready") return;
        (c.levels || []).forEach((l) => {
          if (l.sandbox) return;
          const s = KZ.progress.stars(c.id, l.id);
          const open = KZ.progress.tasksUnlocked(c, KZ.topicOf(l));
          if (open && s === 0) pools[0].push([c.id, l.id]);
          else if (open && s < 3) pools[1].push([c.id, l.id]);
          else if (open) pools[2].push([c.id, l.id]);
        });
      });
      /* Соңғы оқып жүрген курсты бірінші таңдаймыз, болмаса бәрінен */
      const last = KZ.last.get();
      let pool = null;
      for (const p of pools) {
        const mine = last ? p.filter((x) => x[0] === last.course) : [];
        if (mine.length) {
          pool = mine;
          break;
        }
        if (!last && p.length) {
          pool = p;
          break;
        }
      }
      if (!pool) pool = pools.find((p) => p.length);
      if (!pool) return null;
      let hash = 0;
      for (const ch of t) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
      const [course, level] = pool[hash % pool.length];
      return { date: t, course, level };
    },
    /* Бүгінгі тапсырма (күн ішінде өзгермейді) */
    daily() {
      const t = act.today();
      let d = KZ.store.get(DAILY_KEY, null);
      if (d && d.date === t) {
        const c = KZ.getCourse(d.course);
        if (c && KZ.findLevel(c, d.level)) return d;
      }
      d = act._pick();
      if (d) KZ.store.set(DAILY_KEY, d);
      return d;
    },
    dailyTarget() {
      const d = act.daily();
      if (!d) return null;
      const course = KZ.getCourse(d.course);
      const f = course && KZ.findLevel(course, d.level);
      return f ? { course, level: f.level, done: act.dailyDoneToday() } : null;
    },

    /* ---------- Басқа модульдер шақыратын ілгектер ---------- */
    onLevel(cid, lid, stars, dl) {
      if (!(stars > 0)) return;
      const isDaily = !!(dl && dl.date === act.today() && dl.course === cid && dl.level === lid);
      const r = act.mark(isDaily);
      if (r.daily) KZ.toast("📅", "Күннің тапсырмасы орындалды!", "Тамаша, бүгінгі міндет өтелді.");
      if (r.first) {
        const s = act.streak().n;
        if (s >= 2) KZ.toast("🔥", "Серия: " + s + " күн!", "Күн сайын жалғастыра бер.");
      }
      ach.check();
    },
    onRead() {
      const r = act.mark(false);
      if (r.first) {
        const s = act.streak().n;
        if (s >= 2) KZ.toast("🔥", "Серия: " + s + " күн!", "Күн сайын жалғастыра бер.");
      }
      ach.check();
    },
  });

  /* ---------- Хабарлама (toast) ---------- */
  KZ.toast = function (emoji, title, text) {
    let box = document.getElementById("toasts");
    if (!box) {
      box = el("div", "toasts");
      box.id = "toasts";
      box.setAttribute("aria-live", "polite");
      document.body.appendChild(box);
    }
    const t = h("div", "toast", h("span", "toast-emoji", emoji), h("div", "toast-text", h("b", null, title), text ? h("small", null, text) : null));
    box.appendChild(t);
    setTimeout(() => t.classList.add("out"), 4200);
    setTimeout(() => t.remove(), 4700);
  };

  /* Жоғарғы жолақтағы 🔥 */
  KZ.updateStreak = function () {
    const b = document.getElementById("streakBtn");
    if (!b) return;
    const s = act.streak();
    document.getElementById("streakCount").textContent = String(s.n);
    b.classList.toggle("hot", s.doneToday);
    b.title = s.doneToday ? "Серия: " + s.n + " күн" : s.n ? "Серия: " + s.n + " күн. Бүгін бір тапсырма шеш, үзілмесін!" : "Бүгін бір тапсырма шешіп, серияны баста";
  };

  /* ---------- Жетістіктер ---------- */
  function stats() {
    const st = { levels: 0, perfect: 0, bonus: 0, bugs: 0, courses: 0, read: 0, complete: {} };
    KZ.courses.forEach((c) => {
      if (c.status !== "ready") return;
      let any = false;
      let all = (c.levels || []).length > 0;
      (c.levels || []).forEach((l) => {
        const s = KZ.progress.stars(c.id, l.id);
        if (s > 0) {
          st.levels++;
          any = true;
        } else all = false;
        if (s === 3) st.perfect++;
      });
      (c.bonus || []).forEach((l) => {
        const s = KZ.progress.stars(c.id, l.id);
        if (s > 0) {
          st.levels++;
          st.bonus++;
          if (l.debug) st.bugs++;
          any = true;
        }
        if (s === 3) st.perfect++;
      });
      if (any) st.courses++;
      st.complete[c.id] = all;
      st.read += KZ.read.count(c.id);
    });
    return st;
  }

  function defs() {
    const list = [
      { id: "first", e: "🌱", t: "Алғашқы қадам", d: "Бірінші тапсырманы шеш", ok: (s) => s.levels >= 1 },
      { id: "lv10", e: "🧩", t: "Он тапсырма", d: "10 тапсырма шеш", ok: (s) => s.levels >= 10 },
      { id: "lv30", e: "🚀", t: "Отыз тапсырма", d: "30 тапсырма шеш", ok: (s) => s.levels >= 30 },
      { id: "lv60", e: "🏔️", t: "Алпыс тапсырма", d: "60 тапсырма шеш", ok: (s) => s.levels >= 60 },
      { id: "perfect10", e: "💎", t: "Мінсіз он", d: "10 тапсырманы 3 жұлдызбен өт", ok: (s) => s.perfect >= 10 },
      { id: "perfect30", e: "👑", t: "Қысқа код шебері", d: "30 тапсырманы 3 жұлдызбен өт", ok: (s) => s.perfect >= 30 },
      { id: "bonus1", e: "🏆", t: "Қосымша жеңіс", d: "Қосымша тапсырманы шеш", ok: (s) => s.bonus >= 1 },
      { id: "bug1", e: "🐞", t: "Қате аулаушы", d: "«Қате тап» тапсырмасын шеш", ok: (s) => s.bugs >= 1 },
      { id: "bug10", e: "🕵️", t: "Бас детектив", d: "10 қате тауып түзет", ok: (s) => s.bugs >= 10 },
      { id: "poly", e: "🌍", t: "Көп тілді", d: "3 түрлі курстан тапсырма шеш", ok: (s) => s.courses >= 3 },
      { id: "reader", e: "📖", t: "Оқымысты", d: "10 лекцияны оқыдым деп белгіле", ok: (s) => s.read >= 10 },
      { id: "streak3", e: "🔥", t: "3 күн қатарынан", d: "3 күн қатарынан тапсырма шеш", ok: () => act.best() >= 3 },
      { id: "streak7", e: "⚡", t: "Бір апта", d: "7 күн қатарынан тапсырма шеш", ok: () => act.best() >= 7 },
      { id: "streak30", e: "☄️", t: "Бір ай", d: "30 күн қатарынан тапсырма шеш", ok: () => act.best() >= 30 },
      { id: "daily1", e: "📅", t: "Күннің тапсырмасы", d: "Күннің тапсырмасын орында", ok: () => act.dailyCount() >= 1 },
      { id: "daily7", e: "🗓️", t: "Тұрақты оқушы", d: "Күннің тапсырмасын 7 рет орында", ok: () => act.dailyCount() >= 7 },
    ];
    KZ.courses.forEach((c) => {
      if (c.status !== "ready") return;
      list.push({
        id: "done_" + c.id,
        e: c.emoji,
        t: c.name + ": курс бітті",
        d: c.name + " курсының барлық негізгі тапсырмасын өт",
        ok: (s) => !!s.complete[c.id],
      });
    });
    return list;
  }

  const ach = (KZ.ach = {
    defs,
    unlocked: () => KZ.store.get(ACH_KEY, {}),
    /* Жаңа ашылғандарды тіркеу. silent: хабарламасыз (алғашқы жүктеу, синхрондаудан кейін) */
    check(silent) {
      const have = ach.unlocked();
      const s = stats();
      const fresh = [];
      defs().forEach((a) => {
        if (!have[a.id] && a.ok(s)) {
          have[a.id] = act.today();
          fresh.push(a);
        }
      });
      if (fresh.length) {
        KZ.store.set(ACH_KEY, have);
        if (!silent) fresh.forEach((a) => KZ.toast(a.e, "Жетістік: " + a.t, a.d));
      }
      return fresh;
    },
  });

  /* ---------- Беттер ---------- */
  const A = (cls, href, ...kids) => {
    const a = h("a", cls, ...kids);
    a.href = href;
    return a;
  };

  /* Басты беттегі карта */
  KZ.dailyCard = function () {
    const s = act.streak();
    const tg = act.dailyTarget();
    const card = el("section", "card daily");
    const left = h("div", "daily-streak", h("div", "ds-num", "🔥 " + s.n), h("small", null, "күн қатарынан"));
    const mid = el("div", "daily-body");
    mid.appendChild(h("b", null, "📅 Күннің тапсырмасы"));
    if (!tg) {
      mid.appendChild(h("p", null, "Курстарды бастасаң, мұнда күн сайын жаңа тапсырма шығады."));
    } else if (tg.done) {
      mid.appendChild(h("p", null, "✅ Бүгінгі тапсырма орындалды! Ертең жаңасы шығады."));
    } else {
      mid.appendChild(h("p", null, tg.course.emoji + " " + tg.course.name + " · " + tg.level.id + " " + tg.level.title));
      if (!s.doneToday && s.n > 0) mid.appendChild(h("small", null, "Бүгін бір тапсырма шешсең, серия үзілмейді."));
      mid.appendChild(A("btn primary small", "#/" + tg.course.id + "/play/" + tg.level.id, "▶ Шешу"));
    }
    const right = A("btn small", "#/achievements", "🏆 Жетістіктер");
    card.appendChild(left);
    card.appendChild(mid);
    card.appendChild(right);
    return card;
  };

  const WEEK = ["Дс", "Сс", "Ср", "Бс", "Жм", "Сб", "Жс"];

  function calendar() {
    const all = act.all();
    const now = new Date();
    const t = ymd(now);
    const monday = addDays(t, -((now.getDay() + 6) % 7));
    const start = addDays(monday, -28);
    const wrap = el("div", "cal");
    WEEK.forEach((w) => wrap.appendChild(h("span", "cal-h", w)));
    for (let i = 0; i < 35; i++) {
      const d = addDays(start, i);
      const v = all[d] || 0;
      const c = el("span", "cal-d" + (v ? " on" : "") + (v & 2 ? " daily" : "") + (d === t ? " today" : "") + (d > t ? " future" : ""));
      c.title = d + (v & 2 ? " · күннің тапсырмасы орындалды" : v ? " · белсенді" : "");
      c.textContent = v & 2 ? "⭐" : "";
      wrap.appendChild(c);
    }
    return wrap;
  }

  KZ.achievementsPage = function (root) {
    root.textContent = "";
    ach.check(true);
    const page = el("div", "page");
    page.appendChild(A("back", "#/", "← Басты бет"));
    const s = act.streak();
    if (KZ.hero) page.appendChild(A("card hero-banner", "#/hero", KZ.hero.node("sm"), h("div", null, h("b", null, "🎽 Менің кейіпкерім"), h("small", null, "Жетістіктер мен серия арқылы ашылған киімдерді киіп көр"))));

    page.appendChild(
      h(
        "section",
        "card streak-card",
        h("div", "streak-big", h("span", "sb-fire", "🔥"), h("div", null, h("b", null, s.n + " күн"), h("small", null, s.doneToday ? "Бүгін белсенді болдың!" : "Бүгін тапсырма шешсең, серия жалғасады"))),
        h(
          "div",
          "streak-facts",
          h("div", null, h("b", null, String(act.best())), h("small", null, "ең ұзақ серия")),
          h("div", null, h("b", null, String(act.dailyCount())), h("small", null, "күннің тапсырмасы")),
          h("div", null, h("b", null, String(KZ.progress.total())), h("small", null, "⭐ жұлдыз"))
        ),
        calendar()
      )
    );

    const list = defs();
    const have = ach.unlocked();
    const got = list.filter((a) => have[a.id]).length;
    page.appendChild(h("h2", "section-title", "Жетістіктер · " + got + " / " + list.length));
    const grid = el("div", "ach-grid");
    list.forEach((a) => {
      const on = !!have[a.id];
      grid.appendChild(
        h("div", "badge-card" + (on ? " on" : ""), h("div", "bc-e", on ? a.e : "🔒"), h("b", null, a.t), h("small", null, a.d), on ? h("small", "bc-date", have[a.id]) : null)
      );
    });
    page.appendChild(grid);
    if (KZ.certSection) page.appendChild(KZ.certSection());
    root.appendChild(page);
  };

  /* Алғашқы жүктеу: бұрыннан бар прогрестің жетістіктерін хабарламасыз тіркеу */
  if (!KZ.store.get(ACH_INIT, false)) {
    KZ.store.set(ACH_INIT, true);
    ach.check(true);
  }
  KZ.updateStreak();
})();
