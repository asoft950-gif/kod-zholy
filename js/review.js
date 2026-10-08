/* Bitlings: қайталау режимі (Leitner жүйесі). Өтілген тақырыптардан күнде 5 сұрақ, дұрыс жауап берсең, сұрақ сирек қайталанады */
(() => {
  "use strict";
  const { el, h } = KZ;
  const KEY = "kodzholy.review.v1";
  const GAPS = [1, 3, 7, 14, 30]; // қорап → келесі қайталауға дейінгі күн
  const PER_DAY = 5;
  const bank = []; // { id, c, t, q, opts, why }

  const state = () => KZ.store.get(KEY, {});
  const addDays = (d, n) => KZ.activity.addDays(d, n);
  const today = () => KZ.activity.today();

  function learned(course, topic) {
    if ((course.lectures || []).some((l) => String(l.topic) === topic && KZ.read.has(course.id, l.id))) return true;
    return (course.levels || []).some((l) => KZ.topicOf(l) === topic && KZ.progress.stars(course.id, l.id) > 0);
  }

  const R = (KZ.review = {
    bank,
    add(c, t, qs) {
      qs.forEach((x, i) => bank.push({ id: c + "|" + t + "|" + i, c, t, q: x[0], opts: x[1], why: x[2] || "" }));
    },
    /* Қазір қайталауға болатын сұрақтар: өтілген тақырыптардан */
    pool() {
      const open = {};
      return bank.filter((x) => {
        const k = x.c + "|" + x.t;
        if (!(k in open)) {
          const c = KZ.getCourse(x.c);
          open[k] = !!c && learned(c, x.t);
        }
        return open[k];
      });
    },
    /* Бүгінгі сессия: алдымен мерзімі жеткендер (ескісі бірінші), сосын жаңалары */
    session(n) {
      const st = state();
      const t = today();
      const pool = R.pool();
      const due = pool.filter((x) => st[x.id] && st[x.id].d <= t).sort((a, b) => (st[a.id].d < st[b.id].d ? -1 : 1));
      const fresh = pool.filter((x) => !st[x.id]);
      // жаңаларын күнге байлап араластыру (бет жаңартқанда сол күйінде қалу үшін)
      let seed = 0;
      (t + "x").split("").forEach((ch) => (seed = (seed * 31 + ch.charCodeAt(0)) % 100003));
      fresh.sort((a, b) => ((a.id.length * 7919 + seed * a.id.charCodeAt(a.id.length - 1)) % 1009) - ((b.id.length * 7919 + seed * b.id.charCodeAt(b.id.length - 1)) % 1009));
      return due.concat(fresh).slice(0, n || PER_DAY);
    },
    counts() {
      const st = state();
      const t = today();
      const pool = R.pool();
      const avail = pool.filter((x) => !st[x.id] || st[x.id].d <= t).length;
      return { pool: pool.length, avail, next: Math.min(avail, PER_DAY) };
    },
    answer(id, ok) {
      const st = state();
      const cur = st[id] || { b: 0 };
      const b = ok ? Math.min(cur.b + 1, GAPS.length - 1) : 0;
      st[id] = { b, d: addDays(today(), ok ? GAPS[b] : 1) };
      KZ.store.set(KEY, st);
    },
  });

  /* `код` белгісін <code> етіп көрсету */
  function rich(text) {
    const box = el("span");
    text.split("`").forEach((part, i) => box.appendChild(i % 2 ? h("code", null, part) : document.createTextNode(part)));
    return box;
  }
  const shuffle = (a) => {
    const r = a.slice();
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [r[i], r[j]] = [r[j], r[i]];
    }
    return r;
  };

  KZ.reviewPage = function (root) {
    root.textContent = "";
    const page = el("div", "page narrow");
    const back = h("a", "back", "← Басты бет");
    back.href = "#/";
    page.appendChild(back);
    page.appendChild(h("h1", "cab-title", "🔁 Қайталау"));
    const box = el("section", "card review");
    page.appendChild(box);
    root.appendChild(page);

    const qs = R.session(PER_DAY);
    if (!qs.length) {
      const c = R.counts();
      box.appendChild(h("h2", null, c.pool ? "✅ Бүгінгі қайталау бітті" : "Әзірге қайталайтын тақырып жоқ"));
      box.appendChild(h("p", null, c.pool ? "Ертең жаңа сұрақтар шығады. Жаңа тақырып өтсең, сұрақтар көбейеді." : "Лекция оқып не тапсырма шешкен соң, сол тақырыптан сұрақтар осында шығады."));
      return;
    }
    let i = 0;
    let right = 0;
    function ask() {
      box.textContent = "";
      const x = qs[i];
      const course = KZ.getCourse(x.c);
      const topic = (course.topics || []).find((t) => t.id === x.t);
      box.appendChild(h("div", "rv-top", h("small", null, course.emoji + " " + course.name + (topic ? " · " + topic.title : "")), h("small", null, i + 1 + " / " + qs.length)));
      box.appendChild(h("h2", "rv-q", rich(x.q)));
      const list = el("div", "rv-opts");
      const correct = x.opts[0];
      shuffle(x.opts).forEach((o) => {
        const b = el("button", "rv-opt");
        b.type = "button";
        b.appendChild(rich(o));
        b.addEventListener("click", () => {
          const ok = o === correct;
          R.answer(x.id, ok);
          if (ok) right++;
          if (window.KZS) window.KZS.beep(ok ? "star" : "error");
          list.querySelectorAll("button").forEach((bb) => {
            bb.disabled = true;
            if (bb.textContent === rich(correct).textContent) bb.classList.add("good");
          });
          if (!ok) b.classList.add("bad");
          box.appendChild(h("div", "rv-why " + (ok ? "good" : "bad"), h("b", null, ok ? "✅ Дұрыс!" : "❌ Дұрыс жауап: "), ok ? "" : rich(correct), x.why ? h("p", null, rich(x.why)) : null));
          const next = el("button", "btn primary", i + 1 < qs.length ? "Келесі →" : "Аяқтау");
          next.type = "button";
          next.addEventListener("click", () => {
            i++;
            if (i < qs.length) ask();
            else finish();
          });
          box.appendChild(next);
        });
        list.appendChild(b);
      });
      box.appendChild(list);
    }
    function finish() {
      box.textContent = "";
      const r = KZ.activity.mark(false);
      if (r.first) {
        const s = KZ.activity.streak().n;
        if (s >= 2) KZ.toast("🔥", "Серия: " + s + " күн!", "Күн сайын жалғастыра бер.");
      }
      box.appendChild(h("h2", null, right === qs.length ? "🏆 Тамаша! Бәрі дұрыс" : "👍 " + right + " / " + qs.length));
      box.appendChild(h("p", null, "Қателескен сұрақтар ертең қайта шығады, дұрыс жауаптар сирек қайталанады."));
      const home = h("a", "btn primary", "Басты бетке");
      home.href = "#/";
      box.appendChild(home);
    }
    ask();
  };

  /* Басты беттегі карта */
  KZ.reviewCard = function () {
    const c = R.counts();
    if (!c.pool) return null;
    const card = el("section", "card review-card");
    const body = el("div");
    body.appendChild(h("b", null, "🔁 Қайталау"));
    if (c.next) {
      body.appendChild(h("p", null, "Бүгін " + c.next + " сұрақ күтіп тұр: өткен тақырыптарды ұмытпау үшін."));
      const a = h("a", "btn primary small", "▶ Қайталау");
      a.href = "#/review";
      body.appendChild(a);
    } else body.appendChild(h("p", null, "✅ Бүгінгі қайталау бітті. Ертең жаңа сұрақтар шығады."));
    card.appendChild(body);
    return card;
  };
})();
