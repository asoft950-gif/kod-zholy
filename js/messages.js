/* Bitlings: жеке хабарламалар. Кім кімге жаза алады — серверде (can_message): сыныптастар,
   оқушы мен оның мұғалімі, құрушы/админ барлығымен. Балағат сөздер серверде *** болып жасырылады. */
(() => {
  "use strict";
  const { el, h } = KZ;
  const A = KZ.auth;
  if (!A) return;

  const ROLE = { owner: "👑", admin: "🛠️", teacher: "👩‍🏫", student: "🎒" };
  const fmtTime = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const hm = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    if (d.toDateString() === now.toDateString()) return hm;
    return String(d.getDate()).padStart(2, "0") + "." + String(d.getMonth() + 1).padStart(2, "0") + " " + hm;
  };
  /* кішкентай аватар: кейіпкер (бар болса) не рөл белгісі */
  function avatar(p, cls) {
    const a = el("span", "msg-av" + (cls ? " " + cls : ""));
    if (KZ.hero && p.hero && p.hero.eq) a.innerHTML = KZ.hero.svg({ color: p.hero.color || "#6c5ce7", eq: p.hero.eq, preview: true, still: true, lite: true, lg: 0, streak: 0 });
    else a.textContent = ROLE[p.role] || "🙂";
    if (p.last_seen !== undefined) {
      const on = !!p.last_seen && Date.now() - new Date(p.last_seen).getTime() < 180000;
      a.appendChild(el("i", "pres-dot corner " + (on ? "on" : "off")));
    }
    return a;
  }

  KZ.avatar = avatar;

  /* ---------- Оқылмаған хаттар белгісі (жоғарғы жолақ пен қойынды) ---------- */
  let unread = 0;
  function paintBadge() {
    const acc = document.getElementById("accountBtn");
    if (acc) {
      let b = acc.querySelector(".msg-badge");
      if (!b) {
        b = el("span", "msg-badge");
        acc.appendChild(b);
      }
      b.hidden = !unread;
      b.textContent = unread > 9 ? "9+" : String(unread);
    }
    document.querySelectorAll("[data-msg-badge]").forEach((x) => {
      x.hidden = !unread;
      x.textContent = String(unread);
    });
  }
  async function poll() {
    if (!A.isActive || !A.isActive() || document.hidden) return;
    try {
      const n = await A.rpc("msg_unread");
      if (n > unread && unread >= 0 && KZ.toast && !location.hash.startsWith("#/account/msg")) KZ.toast("💬", KZ.t("Жаңа хабарлама"), KZ.t("Кабинеттегі «Хабарламалар» бөлімін аш."));
      unread = n || 0;
      paintBadge();
    } catch (e) {
      /* офлайн не кестесі әлі жоқ: үнсіз */
    }
  }
  setInterval(poll, 45000);
  document.addEventListener("visibilitychange", () => !document.hidden && poll());
  A.onChange(() => {
    unread = 0;
    paintBadge();
    setTimeout(poll, 1500);
  });

  /* ---------- Хабарламалар бөлімі ---------- */
  let threadTimer = null;
  const stopThread = () => {
    clearInterval(threadTimer);
    threadTimer = null;
  };
  window.addEventListener("hashchange", stopThread);

  async function contacts(box) {
    stopThread();
    box.textContent = KZ.t("Жүктелуде…");
    let list;
    try {
      list = await A.rpc("msg_contacts");
    } catch (e) {
      box.textContent = "";
      box.appendChild(h("p", "form-msg bad", e.message));
      return;
    }
    box.textContent = "";
    const head = el("div", "msg-head");
    head.appendChild(h("p", "hint", KZ.t("Сыныптастарыңа, мұғаліміңе және әкімшілікке жаза аласың. Әдепті бол: мұғалім сыныптағы хаттарды көре алады.") + " " + KZ.t("Аватарды бассаң — профилі ашылады.")));
    box.appendChild(head);
    if (!list.length) {
      box.appendChild(h("p", "empty-note", KZ.t("Әзірге жазатын адам жоқ. Сыныпқа қосылсаң, сыныптастарың осында шығады.")));
      return;
    }
    const q = el("input", "msg-search");
    q.type = "search";
    q.id = "msgSearch";
    q.placeholder = KZ.t("🔍 Атын іздеу");
    box.appendChild(q);
    const ul = el("div", "msg-list");
    box.appendChild(ul);
    const render = () => {
      ul.textContent = "";
      const term = q.value.trim().toLowerCase();
      list
        .filter((p) => !term || (p.full_name || "").toLowerCase().includes(term))
        .forEach((p) => {
          const a = h("a", "msg-row" + (p.unread ? " unread" : ""));
          a.href = "#/account/msg/" + p.id;
          const mid = h("div", "msg-mid", h("b", null, p.full_name + " ", h("small", null, A.roleLabel(p.role))), h("small", "msg-pres", KZ.presence(p.last_seen)), h("small", "msg-last", p.last || KZ.t("Хат жоқ — бірінші болып жаз!")));
          const av = avatar(p);
          av.title = KZ.t("Профилі");
          av.addEventListener("click", (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            location.hash = "#/u/" + p.id;
          });
          a.append(av, mid);
          const right = el("div", "msg-right");
          if (p.last_at) right.appendChild(h("small", null, fmtTime(p.last_at)));
          if (p.unread) right.appendChild(h("span", "msg-dot", String(p.unread)));
          a.appendChild(right);
          ul.appendChild(a);
        });
      if (!ul.children.length) ul.appendChild(h("p", "empty-note", KZ.t("Ешкім табылмады.")));
    };
    q.addEventListener("input", render);
    render();
    /* онлайн белгілері мен жаңа хаттар 30 секунд сайын жаңарады */
    const route = location.hash;
    threadTimer = setInterval(async () => {
      if (location.hash !== route || !box.isConnected) return stopThread();
      if (document.hidden) return;
      try {
        list = await A.rpc("msg_contacts");
        render();
      } catch (e) {
        /* үнсіз */
      }
    }, 30000);
  }

  async function thread(box, uid) {
    stopThread();
    box.textContent = KZ.t("Жүктелуде…");
    let r;
    try {
      r = await A.rpc("msg_thread", { other: uid });
    } catch (e) {
      box.textContent = "";
      box.appendChild(h("p", "form-msg bad", e.message));
      const b = h("a", "btn small", KZ.t("← Барлық хаттар"));
      b.href = "#/account/msg";
      box.appendChild(b);
      return;
    }
    box.textContent = "";
    const o = r.other;
    const top = el("div", "msg-top");
    const back = h("a", "btn small ghost", "←");
    back.href = "#/account/msg";
    back.setAttribute("aria-label", KZ.t("Барлық хаттар"));
    let pres = KZ.presence(o.last_seen);
    const who = h("div", "msg-who", KZ.profileLink(o.id, o.full_name, "prof-link b"), h("small", null, (ROLE[o.role] || "") + " " + A.roleLabel(o.role) + (o.grade ? " · " + o.grade + KZ.t("-сынып") : "")), pres);
    if (o.bio) who.appendChild(h("small", "msg-bio", "“" + o.bio + "”"));
    const bigAv = avatar(o, "big");
    bigAv.style.cursor = "pointer";
    bigAv.addEventListener("click", () => (location.hash = "#/u/" + o.id));
    top.append(back, bigAv, who);
    box.appendChild(top);
    const feed = el("div", "msg-feed");
    feed.setAttribute("aria-live", "polite");
    box.appendChild(feed);
    let lastId = 0;
    const ticks = {};
    const tickText = (r) => (r ? "✓✓ " + KZ.t("көрілді") : "✓ " + KZ.t("жіберілді"));
    const add = (m) => {
      if (m.id <= lastId) return;
      lastId = m.id;
      const tk = m.me ? h("span", "tick" + (m.r ? " seen" : ""), tickText(m.r)) : null;
      if (tk) ticks[m.id] = tk;
      const b = h("div", "bubble " + (m.me ? "me" : "them"), h("span", "bb-text", m.b), h("small", null, fmtTime(m.at) + (tk ? " · " : ""), tk || ""));
      feed.appendChild(b);
    };
    const refreshTicks = (items) =>
      items.forEach((m) => {
        const tk = ticks[m.id];
        if (tk && m.r && !tk.classList.contains("seen")) {
          tk.classList.add("seen");
          tk.textContent = tickText(true);
        }
      });
    const paint = (items) => {
      const atBottom = feed.scrollHeight - feed.scrollTop - feed.clientHeight < 40;
      items.forEach(add);
      if (atBottom || items.some((m) => m.me)) feed.scrollTop = feed.scrollHeight;
    };
    if (!r.items.length) feed.appendChild(h("p", "empty-note", KZ.t("Әлі хат жоқ. Сәлем жазып көр 👋")));
    paint(r.items);
    feed.scrollTop = feed.scrollHeight;
    poll();

    if (!r.can) {
      box.appendChild(h("p", "hint", KZ.t("Бұл адамға жаза алмайсың: ол тек достарынан хат қабылдайды не сыныптан шыққан. Достықты профилінен сұра.")));
      return;
    }
    const f = el("form", "msg-form");
    const ta = el("textarea");
    ta.id = "msgText";
    ta.rows = 2;
    ta.maxLength = 1000;
    ta.placeholder = KZ.t("Хабарлама жаз…");
    const send = el("button", "btn primary", KZ.t("Жіберу"));
    send.type = "submit";
    const err = el("small", "form-msg bad");
    err.hidden = true;
    f.append(ta, send, err);
    box.appendChild(f);
    ta.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        f.requestSubmit();
      }
    });
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const t = ta.value.trim();
      if (!t) return;
      send.disabled = true;
      err.hidden = true;
      try {
        const m = await A.rpc("msg_send", { to_id: uid, body_in: t });
        ta.value = "";
        const empty = feed.querySelector(".empty-note");
        if (empty) empty.remove();
        paint([m]);
      } catch (ex) {
        err.hidden = false;
        err.textContent = ex.message;
      } finally {
        send.disabled = false;
        ta.focus();
      }
    });
    /* жаңа хаттарды 8 секунд сайын тексеру (бет ашық тұрғанда) */
    const route = location.hash;
    threadTimer = setInterval(async () => {
      if (location.hash !== route || !box.isConnected) return stopThread();
      if (document.hidden) return;
      try {
        const n = await A.rpc("msg_thread", { other: uid });
        paint(n.items.filter((m) => m.id > lastId));
        refreshTicks(n.items);
        const np = KZ.presence(n.other.last_seen);
        pres.replaceWith(np);
        pres = np;
      } catch (ex) {
        /* үнсіз */
      }
    }, 8000);
  }

  /* Мұғалім: сыныптағы оқушылардың бір-біріне жазған хаттары */
  async function classLog(box, cid) {
    box.textContent = KZ.t("Жүктелуде…");
    try {
      const list = await A.rpc("class_messages", { cid });
      box.textContent = "";
      box.appendChild(h("p", "hint", KZ.t("Сыныптағы оқушылардың бір-біріне жазған соңғы 200 хаты. Балағат сөздер автоматты түрде *** болып жасырылады.")));
      if (!list.length) box.appendChild(h("p", "empty-note", KZ.t("Әзірге хат жоқ.")));
      list.forEach((m) => box.appendChild(h("div", "cm-row", h("small", null, fmtTime(m.at) + " · " + m.from + " → " + m.to), h("span", null, m.b))));
    } catch (e) {
      box.textContent = "";
      box.appendChild(h("p", "form-msg bad", e.message));
    }
  }

  KZ.msg = {
    view(box, uid) {
      return uid ? thread(box, uid) : contacts(box);
    },
    classLog,
    poll,
    unread: () => unread,
  };
})();
