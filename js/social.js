/* Bitlings: достар, профиль құпиялылығы, хат жазу рұқсаты, синхрондау күйі (кабинетте) */
(() => {
  "use strict";
  const { el, h } = KZ;
  const A = KZ.auth;
  if (!A) return;
  const t = KZ.t;

  const missing = (e) => /Could not find|schema cache|friends_list|friend_|find_people|update_privacy/i.test(e.message);
  const setupNote = () => h("p", "form-msg bad", t("Бұл мүмкіндік әлі қосылмаған: құрушы Supabase-те patch-sync-social.sql файлын іске қосуы керек."));

  /* Адам жолы: аватар, аты (профильге сілтеме), онлайн күйі + әрекет түймелері */
  function person(p, actions) {
    const r = el("div", "fr-row");
    r.appendChild(KZ.avatar ? KZ.avatar(p) : el("span", "msg-av", "🙂"));
    const info = el("div", "fr-info");
    const a = h("a", "fr-name", p.full_name);
    a.href = "#/u/" + p.id;
    info.append(a, h("small", "fr-sub", A.roleLabel(p.role) + " · ", KZ.presence ? KZ.presence(p.last_seen) : ""));
    r.appendChild(info);
    if (actions) {
      const box = el("div", "fr-acts");
      actions.forEach((x) => box.appendChild(x));
      r.appendChild(box);
    }
    return r;
  }

  const button = (cls, text, fn) => {
    const b = h("button", cls, text);
    b.type = "button";
    b.addEventListener("click", async () => {
      b.disabled = true;
      try {
        await fn();
      } catch (e) {
        b.disabled = false;
        KZ.toast("⚠️", t("Қате"), e.message);
      }
    });
    return b;
  };

  /* Профиль бетіндегі достық түймелері. rel: none | friends | outgoing | incoming | me */
  function relButtons(rel, id, refresh) {
    const wrap = el("span", "rel-btns");
    const call = (name, args) => async () => {
      await A.rpc(name, args);
      refresh();
    };
    if (rel === "friends") {
      wrap.append(h("span", "chip good", t("✅ Дос")), button("btn small ghost", t("Достан шығару"), call("friend_remove", { uid: id })));
    } else if (rel === "outgoing") {
      wrap.append(h("span", "chip", t("⏳ Сұрау жіберілді")), button("btn small ghost", t("Қайтарып алу"), call("friend_remove", { uid: id })));
    } else if (rel === "incoming") {
      wrap.append(button("btn small primary", t("✅ Достықты қабылдау"), call("friend_respond", { uid: id, accept: true })), button("btn small ghost", t("Бас тарту"), call("friend_respond", { uid: id, accept: false })));
    } else if (rel === "none") {
      wrap.append(button("btn small primary", t("➕ Досқа қосу"), call("friend_request", { uid: id })));
    }
    return wrap;
  }

  /* ---------- «Достар» қойындысы ---------- */
  async function friendsView(box) {
    box.textContent = t("Жүктелуде…");
    let data;
    try {
      data = await A.rpc("friends_list");
    } catch (e) {
      box.textContent = "";
      box.appendChild(missing(e) ? setupNote() : h("p", "form-msg bad", e.message));
      return;
    }
    const reload = () => friendsView(box);
    box.textContent = "";
    const wrap = el("div", "fr-wrap");

    /* іздеу */
    const find = el("section", "card");
    find.appendChild(h("div", "card-title", t("🔎 Дос табу")));
    const form = el("form", "fr-search");
    const inp = el("input");
    inp.type = "search";
    inp.placeholder = t("Аты бойынша іздеу (кемі 2 әріп)");
    inp.maxLength = 40;
    inp.setAttribute("aria-label", t("Аты бойынша іздеу"));
    const go = h("button", "btn primary small", t("Іздеу"));
    go.type = "submit";
    form.append(inp, go);
    const res = el("div", "fr-list");
    find.append(form, res, h("small", "hint", t("Тек ашық профильдер, сыныптастар және достар табылады.")));
    let timer = null;
    const search = async () => {
      const q = inp.value.trim();
      res.textContent = "";
      if (q.length < 2) return;
      try {
        const rows = await A.rpc("find_people", { q });
        if (inp.value.trim() !== q) return;
        res.textContent = "";
        if (!rows.length) res.appendChild(h("p", "empty-note", t("Ешкім табылмады.")));
        rows.forEach((p) => res.appendChild(person(p, [relButtons(p.rel, p.id, search)])));
      } catch (e) {
        res.appendChild(h("p", "form-msg bad", e.message));
      }
    };
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      search();
    });
    inp.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(search, 350);
    });
    wrap.appendChild(find);

    if (data.incoming.length) {
      const c = el("section", "card");
      c.appendChild(h("div", "card-title", t("📨 Достық сұраулары: ") + data.incoming.length));
      data.incoming.forEach((p) => c.appendChild(person(p, [button("btn small primary", t("Қабылдау"), async () => (await A.rpc("friend_respond", { uid: p.id, accept: true }), reload())), button("btn small ghost", t("Бас тарту"), async () => (await A.rpc("friend_respond", { uid: p.id, accept: false }), reload()))])));
      wrap.appendChild(c);
    }

    const fr = el("section", "card");
    fr.appendChild(h("div", "card-title", t("👥 Достарым: ") + data.friends.length));
    if (!data.friends.length) fr.appendChild(h("p", "empty-note", t("Әзірге дос жоқ. Жоғарыдан іздеп не рейтингтегі профильден «Досқа қосу» батырмасын бас.")));
    data.friends.forEach((p) => {
      const m = h("a", "btn small", t("💬 Хат"));
      m.href = "#/account/msg/" + p.id;
      fr.appendChild(person(p, [m]));
    });
    wrap.appendChild(fr);

    if (data.outgoing.length) {
      const c = el("section", "card");
      c.appendChild(h("div", "card-title", t("⏳ Жіберілген сұраулар")));
      data.outgoing.forEach((p) => c.appendChild(person(p, [button("btn small ghost", t("Қайтарып алу"), async () => (await A.rpc("friend_remove", { uid: p.id }), reload()))])));
      wrap.appendChild(c);
    }
    box.appendChild(wrap);
  }

  /* ---------- Құпиялылық баптауы ---------- */
  function privacyCard(p, root, rerender) {
    const card = el("section", "card privacy-card");
    card.appendChild(h("div", "card-title", t("🔒 Құпиялылық")));
    const mk = (label, name, opts, cur) => {
      const wrap = el("label", "pv-field");
      wrap.appendChild(h("b", null, label));
      const sel = el("select");
      sel.name = name;
      opts.forEach(([v, text]) => {
        const o = el("option", null, text);
        o.value = v;
        if (v === cur) o.selected = true;
        sel.appendChild(o);
      });
      wrap.appendChild(sel);
      return [wrap, sel];
    };
    const [w1, vis] = mk(
      t("Профильімді кім көре алады?"),
      "vis",
      [
        ["private", t("🔒 Жабық: сыныптастар, мұғалімдер және достар")],
        ["public", t("🌍 Ашық: барлық пайдаланушы")],
      ],
      p.visibility || "private"
    );
    const [w2, pol] = mk(
      t("Маған кім хат жаза алады?"),
      "pol",
      [
        ["everyone", t("💬 Кез келген адам")],
        ["class", t("🏫 Сыныптастар, мұғалімдер және достар")],
        ["friends", t("👥 Тек достарым (мұғалім мен әкімшілік қалады)")],
      ],
      p.msg_policy || "class"
    );
    const save = h("button", "btn primary small", t("Сақтау"));
    save.type = "button";
    const msg = el("small", "form-msg");
    msg.hidden = true;
    save.addEventListener("click", async () => {
      save.disabled = true;
      msg.hidden = false;
      try {
        await A.rpc("update_privacy", { vis: vis.value, pol: pol.value });
        await A.refreshProfile();
        msg.className = "form-msg good";
        msg.textContent = t("Сақталды ✅");
      } catch (e) {
        msg.className = "form-msg bad";
        msg.textContent = missing(e) ? t("Бұл мүмкіндік әлі қосылмаған (patch-sync-social.sql іске қосылмаған).") : e.message;
      }
      save.disabled = false;
    });
    card.append(w1, w2, h("div", "u-actions", save), msg);
    return card;
  }

  /* ---------- Синхрондау күйі ---------- */
  function syncCard() {
    const card = el("section", "card sync-card");
    const line = el("div", "sync-line");
    const btn = h("button", "btn small", t("🔄 Қазір синхрондау"));
    btn.type = "button";
    const hm = (ts) => {
      const d = new Date(ts);
      return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    };
    const paint = (s) => {
      if (!card.isConnected && card.dataset.shown) return;
      card.dataset.shown = "1";
      const pend = KZ.sync ? KZ.sync.pending() : 0;
      line.textContent =
        s.state === "sync"
          ? t("☁️ Синхрондалуда…")
          : s.state === "off"
          ? t("☁️ Синхрондау әлі қосылмаған (Supabase-те patch-sync-social.sql іске қосу керек).")
          : s.state === "err"
          ? t("⚠️ Синхрондау қатесі: ") + s.err
          : s.at
          ? t("☁️ Соңғы синхрондау: ") + hm(s.at) + (pend ? " · " + t("жіберілмегені: ") + pend : "")
          : t("☁️ Деректер бұлтқа сақталады.");
      btn.disabled = s.state === "sync";
    };
    btn.addEventListener("click", () => KZ.sync && KZ.sync.run());
    card.append(line, btn, h("small", "hint", t("Қайталау, қателер, жетістіктер, ойын және кодтың черновиктері барлық құрылғыда бірдей болады.")));
    if (KZ.sync) {
      KZ.sync.onStatus((s) => card.isConnected && paint(s));
      paint(KZ.sync.status());
    }
    return card;
  }


  /* ---------- Push-ескертулер ---------- */
  const VAPID = "BL_ZJCWmWaEGfefj85QA6tC4nKKndqvbEKb6orW77INel9kgxj1Iem6IrsxPChoPbPMQk1LIkBYD16puVaFY1Y0";
  const b64 = (s) => {
    const pad = "=".repeat((4 - (s.length % 4)) % 4);
    const raw = atob((s + pad).replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(raw, (c) => c.charCodeAt(0));
  };
  const pushSupported = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone = () => window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;

  async function currentSub() {
    const reg = await navigator.serviceWorker.ready;
    return reg.pushManager.getSubscription();
  }
  async function enablePush() {
    const perm = await Notification.requestPermission();
    if (perm !== "granted") throw new Error(t("Рұқсат берілмеді. Браузер баптауларынан хабарламаға рұқсат бер."));
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(VAPID) });
    await A.rpc("push_subscribe", { sub: sub.toJSON() });
  }
  async function disablePush() {
    const sub = await currentSub();
    if (sub) {
      try {
        await A.rpc("push_unsubscribe", { ep: sub.endpoint });
      } catch (e) {
        /* үнсіз */
      }
      await sub.unsubscribe();
    }
  }
  /* Рұқсат бұрыннан берілген болса, жазылымды серверге жаңартып қойып отырамыз */
  async function refreshPush() {
    try {
      if (!pushSupported() || Notification.permission !== "granted" || !A.isActive()) return;
      const sub = await currentSub();
      if (sub) await A.rpc("push_subscribe", { sub: sub.toJSON() });
    } catch (e) {
      /* үнсіз */
    }
  }
  A.onChange(() => refreshPush());

  function pushCard() {
    const card = el("section", "card push-card");
    card.appendChild(h("div", "card-title", t("🔔 Ескертулер")));
    const line = el("p", "push-line");
    const msg = el("small", "form-msg");
    msg.hidden = true;
    const btn = h("button", "btn small primary");
    btn.type = "button";
    card.append(line, btn, msg);
    card.appendChild(h("small", "hint", t("Жаңа хат не достық сұрауы келгенде телефонға хабарлама шығады. Хаттың мәтіні көрсетілмейді.")));
    const paint = async () => {
      btn.hidden = false;
      btn.disabled = false;
      if (!pushSupported()) {
        btn.hidden = true;
        line.textContent = isIos && !standalone()
          ? t("iPhone-да ескертулер тек басты экранға қосылған қолданбада жұмыс істейді: Safari → «Бөлісу» → «Басты экранға қосу», сосын қолданбаны сол белгіден ашып, осы жерден қос.")
          : t("Бұл браузер ескертуді қолдамайды.");
        return;
      }
      if (Notification.permission === "denied") {
        btn.hidden = true;
        line.textContent = t("Ескертуге рұқсат жабылған. Телефон/браузер баптауларынан Bitlings үшін хабарламаны қос.");
        return;
      }
      let on = false;
      try {
        on = Notification.permission === "granted" && !!(await currentSub());
      } catch (e) {
        on = false;
      }
      line.textContent = on ? t("✅ Ескертулер қосулы") : t("Ескертулер өшірулі");
      btn.textContent = on ? t("🔕 Өшіру") : t("🔔 Қосу");
      btn.classList.toggle("primary", !on);
      btn.onclick = async () => {
        btn.disabled = true;
        msg.hidden = true;
        try {
          if (on) await disablePush();
          else await enablePush();
        } catch (e) {
          msg.hidden = false;
          msg.className = "form-msg bad";
          msg.textContent = missing(e) || /push_subscribe/.test(e.message) ? t("Бұл мүмкіндік әлі қосылмаған (patch-push.sql іске қосылмаған).") : e.message;
        }
        paint();
      };
    };
    paint();
    return card;
  }

  KZ.social = { friendsView, privacyCard, syncCard, pushCard, relButtons, person };
})();
