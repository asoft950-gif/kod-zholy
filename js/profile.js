/* Bitlings: пайдаланушы профилі (#/u/<id>). Өз профилің де, сыныптастарыңдікі де осында.
   Кім кімді көре алатынын сервер шешеді (public_profile): өзі, сыныптастар, оқушы мен мұғалім, әкімшілік. */
(() => {
  "use strict";
  const { el, h } = KZ;
  const A = KZ.auth;
  if (!A) return;

  const fmtDate = (ts) => {
    const d = new Date(ts);
    return String(d.getDate()).padStart(2, "0") + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + d.getFullYear();
  };

  async function page(box, id) {
    box.textContent = KZ.t("Жүктелуде…");
    await A.ready;
    if (!A.profile) {
      location.hash = "#/login";
      return;
    }
    if (id === "me") id = A.profile.id;
    const mine = id === A.profile.id;
    const wrap = el("div", "page narrow prof");
    box.textContent = "";
    box.appendChild(wrap);
    const back = h("a", "back", mine ? KZ.t("← Кабинет") : KZ.t("← Артқа"));
    back.href = mine ? "#/account" : "#/account/msg";
    wrap.appendChild(back);

    let r;
    try {
      r = await A.rpc("public_profile", { uid: id });
    } catch (e) {
      wrap.appendChild(h("p", "form-msg bad", e.message));
      return;
    }
    const p = r.profile;
    const again = () => page(box, id);
    if (r.locked) {
      /* жабық профиль: тек аты мен достық түймесі */
      const lk = el("section", "card prof-head");
      lk.appendChild(el("div", "prof-fig", "🔒"));
      const li = el("div", "prof-info");
      li.appendChild(h("h1", null, p.full_name));
      li.appendChild(h("div", "prof-meta", h("span", "chip", A.roleLabel(p.role))));
      li.appendChild(h("p", "hint", KZ.t("Бұл профиль жабық. Дос болсаң, көре аласың.")));
      lk.appendChild(li);
      wrap.appendChild(lk);
      const la = el("div", "prof-acts");
      if (KZ.social) la.appendChild(KZ.social.relButtons(r.rel, id, again));
      if (r.can_msg) {
        const m = h("a", "btn primary", KZ.t("💬 Хат жазу"));
        m.href = "#/account/msg/" + id;
        la.appendChild(m);
      }
      wrap.appendChild(la);
      return;
    }
    const isStudent = p.role === "student";
    const ev = isStudent && KZ.ach && KZ.ach.evalFor ? KZ.ach.evalFor(r) : null;

    /* ---------- Бас карта ---------- */
    const head = el("section", "card prof-head");
    const fig = el("div", "prof-fig");
    if (r.hero && r.hero.eq && KZ.hero) fig.innerHTML = KZ.hero.svg({ color: r.hero.color || "#6c5ce7", eq: r.hero.eq, preview: true, still: false, streak: ev ? ev.runs.cur || 0 : 0 });
    else fig.textContent = { owner: "👑", admin: "🛠️", teacher: "👩‍🏫", student: "🎒" }[p.role] || "🙂";
    head.appendChild(fig);
    const info = el("div", "prof-info");
    info.appendChild(h("h1", null, p.full_name));
    info.appendChild(h("div", "prof-meta", h("span", "chip", A.roleLabel(p.role)), p.grade ? h("span", "chip", "🎓 " + p.grade + KZ.t("-сынып")) : ""));
    info.appendChild(h("div", "prof-pres", KZ.presence ? KZ.presence(p.last_seen) : ""));
    if (p.created_at) info.appendChild(h("small", "hint", KZ.t("Тіркелген: ") + fmtDate(p.created_at)));
    if (r.classes && r.classes.length) info.appendChild(h("small", "hint", (isStudent ? "🏫 " : "🏫 " + KZ.t("Сыныптары: ")) + r.classes.join(", ")));
    head.appendChild(info);
    wrap.appendChild(head);

    const bio = el("section", "card");
    bio.appendChild(h("div", "card-title", KZ.t("📝 Өзі туралы")));
    bio.appendChild(h("p", "about-bio", p.bio ? "“" + p.bio + "”" : mine ? KZ.t("Әзірге ештеңе жазылмаған. Кабинетте өзің туралы жаз.") : KZ.t("Әзірге ештеңе жазылмаған.")));
    wrap.appendChild(bio);

    const acts = el("div", "prof-acts");
    if (mine) {
      const e = h("a", "btn primary", KZ.t("✏️ Профильді өзгерту"));
      e.href = "#/account";
      const hbtn = h("a", "btn", KZ.t("🧥 Гардероб"));
      hbtn.href = "#/account/hero";
      acts.append(e, hbtn);
      acts.appendChild(h("small", "hint", (p.visibility === "public" ? KZ.t("🌍 Профильің ашық: барлығы көреді.") : KZ.t("🔒 Профильің жабық: сыныптастар мен достар көреді.")) + " " + KZ.t("Өзгерту: кабинет → Профиль → Құпиялылық.")));
    } else {
      if (r.can_msg !== false) {
        const m = h("a", "btn primary", KZ.t("💬 Хат жазу"));
        m.href = "#/account/msg/" + id;
        acts.appendChild(m);
      } else acts.appendChild(h("small", "hint", KZ.t("Бұл адам тек достарынан хат қабылдайды.")));
      if (KZ.social) acts.appendChild(KZ.social.relButtons(r.rel, id, again));
    }
    wrap.appendChild(acts);

    if (!ev) return;

    /* ---------- Көрсеткіштер ---------- */
    const stars = (r.progress || []).reduce((a, x) => a + (x.s || 0), 0);
    const got = ev.list.filter((x) => x.ok).length;
    const chips = el("div", "det-chips prof-chips");
    [
      ["⭐", stars, KZ.t("жұлдыз")],
      ["✅", ev.stats.levels, KZ.t("тапсырма")],
      ["💎", ev.stats.perfect, KZ.t("3 жұлдызбен")],
      ["🔥", ev.runs.cur + " / " + ev.runs.best, KZ.t("серия: қазір / ең ұзақ")],
      ["📖", ev.stats.read, KZ.t("лекция оқыды")],
      ["🏆", got + " / " + ev.list.length, KZ.t("жетістік")],
    ].forEach(([e, v, t]) => chips.appendChild(h("div", "det-chip", h("span", null, e), h("b", null, String(v)), h("small", null, t))));
    const stat = el("section", "card");
    stat.appendChild(h("div", "card-title", KZ.t("📊 Үлгерімі")));
    stat.appendChild(chips);

    /* курстар бойынша жолақ */
    const pm = {};
    (r.progress || []).forEach((x) => ((pm[x.c] = pm[x.c] || {})[x.l] = x.s));
    const bars = el("div", "prof-bars");
    KZ.courses.forEach((c) => {
      if (c.status !== "ready") return;
      const all = (c.levels || []).concat(c.bonus || []);
      if (!all.length) return;
      const done = all.filter((l) => pm[c.id] && pm[c.id][l.id] > 0).length;
      if (!done) return;
      const row = el("div", "prof-bar");
      row.appendChild(h("span", null, c.emoji + " " + c.name));
      const tr = el("div", "pb-track");
      const fl = el("i", "pb-fill");
      fl.style.width = Math.round((done / all.length) * 100) + "%";
      tr.appendChild(fl);
      row.append(tr, h("small", null, done + "/" + all.length));
      bars.appendChild(row);
    });
    if (bars.children.length) stat.appendChild(bars);
    wrap.appendChild(stat);

    /* ---------- Жетістіктер ---------- */
    const ach = el("section", "card");
    ach.appendChild(h("div", "card-title", KZ.t("🏆 Жетістіктер")));
    const grid = el("div", "prof-ach");
    const lockedBox = el("div", "prof-ach");
    ev.list.forEach(({ a, ok }) => {
      const c = h("div", "pa" + (ok ? " on" : ""), h("span", "pa-e", ok ? a.e : "🔒"), h("small", null, a.t));
      c.title = a.d;
      (ok ? grid : lockedBox).appendChild(c);
    });
    if (!grid.children.length) grid.appendChild(h("p", "empty-note", KZ.t("Әзірге жетістік жоқ.")));
    ach.appendChild(grid);
    if (lockedBox.children.length) {
      const det = h("details", "prof-locked", h("summary", null, KZ.t("Әлі ашылмағандар: ") + lockedBox.children.length));
      det.appendChild(lockedBox);
      ach.appendChild(det);
    }
    wrap.appendChild(ach);

    /* ---------- Киімі ---------- */
    if (r.hero && r.hero.eq && KZ.hero && KZ.hero.items) {
      const worn = Object.values(r.hero.eq)
        .map((i) => KZ.hero.items.find((x) => x.id === i))
        .filter(Boolean);
      if (worn.length) {
        const w = el("section", "card");
        w.appendChild(h("div", "card-title", KZ.t("🧥 Киіп жүргені")));
        const row = el("div", "prof-worn");
        worn.forEach((it) => row.appendChild(h("span", "chip" + (it.legend ? " legend" : ""), (it.legend ? "✨ " : "") + it.n)));
        w.appendChild(row);
        wrap.appendChild(w);
      }
    }
  }

  KZ.profilePage = page;
  /* Басқа файлдарға көмекші: атына профильге сілтеме */
  KZ.profileLink = (id, text, cls) => {
    const a = h("a", cls || "prof-link", text);
    a.href = "#/u/" + id;
    return a;
  };
})();
