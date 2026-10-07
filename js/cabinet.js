/* Ботакод: кабинеттер (кіру/тіркелу, оқушы, мұғалім, админ) */
(() => {
  "use strict";

  const { el, h } = KZ;
  const A = KZ.auth;
  const link = (cls, href, ...kids) => {
    const a = h("a", cls, ...kids);
    a.href = href;
    return a;
  };
  const btn = (cls, text, fn) => {
    const b = el("button", cls, text);
    b.type = "button";
    if (fn) b.addEventListener("click", fn);
    return b;
  };
  /* Екі басумен растау: бірінші басқанда жазуы өзгереді */
  function confirmBtn(cls, text, sure, fn) {
    const b = btn(cls, text);
    let armed = false;
    let t;
    b.addEventListener("click", async () => {
      if (!armed) {
        armed = true;
        b.textContent = sure;
        b.classList.add("danger");
        t = setTimeout(() => {
          armed = false;
          b.textContent = text;
          b.classList.remove("danger");
        }, 4000);
        return;
      }
      clearTimeout(t);
      b.disabled = true;
      await fn();
    });
    return b;
  }

  function ago(ts) {
    if (!ts) return "әлі кірмеген";
    const s = Math.max(0, (Date.now() - new Date(ts).getTime()) / 1000);
    if (s < 90) return "қазір";
    if (s < 3600) return Math.round(s / 60) + " мин бұрын";
    if (s < 86400) return Math.round(s / 3600) + " сағ бұрын";
    return Math.round(s / 86400) + " күн бұрын";
  }

  const ROLE_EMOJI = { owner: "👑", admin: "🛠️", teacher: "👩‍🏫", student: "🎒" };

  function shell(root, title, back) {
    root.textContent = "";
    const page = el("div", "page narrow");
    if (back) page.appendChild(link("back", back[0], back[1]));
    if (title) page.appendChild(h("h1", "cab-title", title));
    root.appendChild(page);
    return page;
  }

  function notice(page, kind, title, text) {
    page.appendChild(h("section", "card notice " + kind, h("h2", null, title), text ? h("p", null, text) : null));
  }

  function failWith(page, e) {
    page.appendChild(h("section", "card notice bad", h("h2", null, "🙈 Қате"), h("p", null, e.message || String(e))));
  }

  function disabledPage(root) {
    const page = shell(root, "Аккаунттар қосылмаған", ["#/", "← Басты бет"]);
    notice(
      page,
      "info",
      "Қонақ режимі",
      "Әзірге аккаунт жүйесі қосылмаған. Сайт бұрынғыдай жұмыс істейді, прогресс осы құрылғыда сақталады. Сайт иесіне: SUPABASE.md файлындағы 5 қадамды орындау керек."
    );
  }

  /* ================= Кіру / тіркелу ================= */
  async function login(root, tab) {
    if (!A.enabled) return disabledPage(root);
    await A.ready;
    if (A.profile) {
      location.hash = "#/account";
      return;
    }
    const page = shell(root, "Ботакодқа кіру", ["#/", "← Басты бет"]);
    const card = el("section", "card auth");
    const tabs = el("nav", "tabs");
    const body = el("div", "auth-body");
    card.appendChild(tabs);
    card.appendChild(body);
    page.appendChild(card);

    const field = (label, type, name, extra) => {
      const i = el("input");
      i.type = type;
      i.name = name;
      i.required = true;
      i.autocomplete = extra && extra.auto ? extra.auto : "off";
      if (extra && extra.ph) i.placeholder = extra.ph;
      if (extra && extra.optional) i.required = false;
      return { wrap: h("label", "field", h("span", null, label), i), input: i };
    };
    const msg = el("p", "form-msg");
    msg.hidden = true;
    const show = (text, bad) => {
      msg.hidden = !text;
      msg.textContent = text || "";
      msg.className = "form-msg" + (bad ? " bad" : " good");
    };

    function renderTabs(active) {
      tabs.textContent = "";
      [["login", "Кіру"], ["register", "Тіркелу"]].forEach(([id, label]) => {
        tabs.appendChild(link("tab" + (id === active ? " active" : ""), "#/login/" + id, label));
      });
    }

    function loginForm() {
      body.textContent = "";
      const f = el("form");
      const em = field("Email", "email", "email", { auto: "email" });
      const pw = field("Құпиясөз", "password", "password", { auto: "current-password" });
      const go = el("button", "btn primary big", "Кіру");
      go.type = "submit";
      f.append(em.wrap, pw.wrap, go, msg);
      f.addEventListener("submit", async (e) => {
        e.preventDefault();
        go.disabled = true;
        show("");
        try {
          await A.signIn(em.input.value, pw.input.value);
          location.hash = "#/account";
        } catch (err) {
          show(err.message, true);
          go.disabled = false;
        }
      });
      body.appendChild(f);
    }

    function registerForm() {
      body.textContent = "";
      let role = "student";
      const f = el("form");
      const roles = el("div", "role-pick");
      const mk = (id, emoji, label, sub) => {
        const b = el("button", "role-chip" + (id === role ? " on" : ""));
        b.type = "button";
        b.dataset.role = id;
        b.append(h("span", "re", emoji), h("b", null, label), h("small", null, sub));
        b.addEventListener("click", () => {
          role = id;
          roles.querySelectorAll(".role-chip").forEach((x) => x.classList.toggle("on", x.dataset.role === id));
          codeField.wrap.hidden = id !== "student";
          note.hidden = id !== "teacher";
        });
        return b;
      };
      roles.append(mk("student", "🎒", "Оқушы", "үйренемін"), mk("teacher", "👩‍🏫", "Мұғалім", "сынып ашамын"));
      const nm = field("Атың", "text", "name", { auto: "name", ph: "Мысалы: Алия Серікова" });
      const em = field("Email", "email", "email", { auto: "email" });
      const pw = field("Құпиясөз (кемінде 6 таңба)", "password", "password", { auto: "new-password" });
      const codeField = field("Сынып коды (болса)", "text", "code", { optional: true, ph: "Мысалы: A1B2C3" });
      const note = h("p", "hint", "Мұғалім аккаунтын құрушы бекіткеннен кейін ғана сынып аша аласың. Тіркелген соң бекітуді күт.");
      note.hidden = true;
      const go = el("button", "btn primary big", "Тіркелу");
      go.type = "submit";
      f.append(roles, nm.wrap, em.wrap, pw.wrap, codeField.wrap, note, go, msg);
      f.addEventListener("submit", async (e) => {
        e.preventDefault();
        go.disabled = true;
        show("");
        try {
          const r = await A.signUp({ email: em.input.value, password: pw.input.value, name: nm.input.value, role, classCode: codeField.input.value });
          if (r.needsConfirm) {
            show("Тіркелдің! Поштаңа хат жіберілді: ондағы сілтемені басып, сосын «Кіру» бетінен кір.", false);
            go.disabled = false;
          } else location.hash = "#/account";
        } catch (err) {
          show(err.message, true);
          go.disabled = false;
        }
      });
      body.appendChild(f);
    }

    const t = tab === "register" ? "register" : "login";
    renderTabs(t);
    if (t === "login") loginForm();
    else registerForm();
  }

  /* ================= Жеке кабинет ================= */
  async function account(root) {
    if (!A.enabled) return disabledPage(root);
    await A.ready;
    if (!A.profile) {
      location.hash = "#/login";
      return;
    }
    const p = A.profile;
    const page = shell(root, null, ["#/", "← Басты бет"]);

    const head = el("section", "card profile-head");
    head.appendChild(h("div", "avatar", ROLE_EMOJI[p.role] || "🙂"));
    const info = el("div", "ph-info");
    const nameRow = el("div", "name-row");
    const nameEl = h("h1", null, p.full_name || p.email);
    nameRow.appendChild(nameEl);
    const edit = btn("btn small ghost", "✏️", () => {
      nameRow.textContent = "";
      const i = el("input");
      i.value = p.full_name;
      i.maxLength = 60;
      const ok = btn("btn small primary", "Сақтау", async () => {
        try {
          await A.rpc("update_name", { new_name: i.value });
          await A.refreshProfile();
          account(root);
        } catch (e) {
          i.setCustomValidity(e.message);
          i.reportValidity();
        }
      });
      nameRow.append(i, ok);
      i.focus();
    });
    edit.title = "Атын өзгерту";
    nameRow.appendChild(edit);
    info.appendChild(nameRow);
    info.appendChild(h("small", null, p.email));
    info.appendChild(h("div", "badges", h("span", "pbadge role-" + p.role, A.roleLabel(p.role)), h("span", "pbadge st-" + p.status, A.statusLabel(p.status))));
    head.appendChild(info);
    page.appendChild(head);

    if (p.status === "pending") {
      notice(page, "info", "⏳ Өтінімің қаралуда", "Құрушы мұғалім аккаунтыңды бекіткенде, сынып аша аласың. Бекітілгеннен кейін бетті жаңарт.");
      page.appendChild(btn("btn", "↻ Тексеру", async () => { await A.refreshProfile(); account(root); }));
    } else if (p.status === "blocked") {
      notice(page, "bad", "⛔ Аккаунт бұғатталған", "Прогресс сақталмайды. Құрушымен хабарлас.");
    }

    if (A.isActive()) {
      const links = el("div", "cab-links");
      if (A.canTeach()) links.appendChild(link("btn primary big", "#/teacher", "👩‍🏫 Сыныптар мен оқушылар"));
      if (A.isStaff()) links.appendChild(link("btn big", "#/admin", "🛠️ Басқару панелі"));
      if (links.children.length) page.appendChild(links);

      // Прогресс
      const prog = el("section", "card");
      prog.appendChild(h("div", "card-title", "Менің прогресім"));
      KZ.courses.filter((c) => c.status === "ready").forEach((c) => {
        const total = KZ.allLevels(c).length;
        const done = KZ.progress.done(c);
        const bar = h("div", "bar", Object.assign(el("div", "bar-fill"), {}));
        bar.firstChild.style.width = (total ? (done / total) * 100 : 0) + "%";
        prog.appendChild(
          h("div", "prog-row",
            h("span", "pr-name", c.emoji + " " + c.name),
            bar,
            h("small", null, done + "/" + total + " · ⭐ " + KZ.progress.courseStars(c.id)))
        );
      });
      page.appendChild(prog);

      if (p.role === "student") await studentClasses(page, root);
    }

    page.appendChild(btn("btn ghost", "Аккаунттан шығу", async () => {
      await A.signOut();
      location.hash = "#/";
    }));
  }

  async function studentClasses(page, root) {
    const card = el("section", "card");
    card.appendChild(h("div", "card-title", "Менің сыныптарым"));
    try {
      const list = await A.rpc("student_classes");
      if (!list.length) card.appendChild(h("p", "empty-note", "Әзірге сыныпқа қосылмағансың. Мұғалімнен код сұра."));
      list.forEach((c) => {
        card.appendChild(
          h("div", "cls-row", h("div", null, h("b", null, c.name), h("small", null, "Мұғалім: " + c.teacher)),
            confirmBtn("btn small ghost", "Сыныптан шығу", "Расымен шығу?", async () => {
              await A.rpc("leave_class", { class_id_in: c.id });
              account(root);
            }))
        );
      });
    } catch (e) {
      failWith(card, e);
    }
    const f = el("form", "inline-form");
    const i = el("input");
    i.placeholder = "Сынып коды";
    i.maxLength = 12;
    i.required = true;
    const go = el("button", "btn primary", "Қосылу");
    go.type = "submit";
    const msg = el("p", "form-msg");
    msg.hidden = true;
    f.append(i, go);
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        await A.rpc("join_class", { code_in: i.value });
        account(root);
      } catch (err) {
        msg.hidden = false;
        msg.className = "form-msg bad";
        msg.textContent = err.message;
      }
    });
    card.append(f, msg);
    page.appendChild(card);
  }

  /* ================= Мұғалім ================= */
  function courseSummary(courses) {
    const wrap = el("div", "chips-row");
    KZ.courses.filter((c) => c.status === "ready").forEach((c) => {
      const d = (courses && courses[c.id]) || { done: 0, stars: 0 };
      wrap.appendChild(h("span", "mini" + (d.done ? " has" : ""), c.emoji + " " + d.done + "/" + KZ.allLevels(c).length));
    });
    return wrap;
  }

  async function studentDetail(box, sid) {
    box.textContent = "Жүктелуде…";
    try {
      const r = await A.rpc("student_progress", { sid });
      box.textContent = "";
      box.appendChild(h("h3", null, r.profile.full_name + " · " + ago(r.profile.last_seen)));
      const map = {};
      r.progress.forEach((x) => ((map[x.c] = map[x.c] || {})[x.l] = x.s));
      KZ.courses.filter((c) => c.status === "ready").forEach((c) => {
        const got = map[c.id] || {};
        const row = el("div", "det-course");
        row.appendChild(h("b", null, c.emoji + " " + c.name));
        const pills = el("div", "det-pills");
        KZ.allLevels(c).forEach((l) => {
          const s = got[l.id] || 0;
          pills.appendChild(h("span", "dp s" + s, l.id));
        });
        row.appendChild(pills);
        box.appendChild(row);
      });
      box.appendChild(h("small", null, "Түс: сұр — өтілмеген, 1–3 — алған жұлдыз саны."));
    } catch (e) {
      box.textContent = "";
      failWith(box, e);
    }
  }

  async function classCard(root, c) {
    const card = el("section", "card cls-card");
    const top = el("div", "cls-top");
    top.appendChild(h("div", null, h("b", "cls-name", c.name), h("small", null, c.students + " оқушы" + (c.mine ? "" : " · " + c.teacher))));
    const code = h("button", "code-box", c.code);
    code.type = "button";
    code.title = "Көшіру";
    code.addEventListener("click", () => {
      if (navigator.clipboard) navigator.clipboard.writeText(c.code).catch(() => {});
      code.textContent = "✔ көшірілді";
      setTimeout(() => (code.textContent = c.code), 1200);
    });
    top.appendChild(code);
    card.appendChild(top);

    const body = el("div", "cls-body");
    body.hidden = true;
    let loaded = false;
    const open = btn("btn small", "Оқушыларды көру", async () => {
      body.hidden = !body.hidden;
      open.textContent = body.hidden ? "Оқушыларды көру" : "Жасыру";
      if (loaded || body.hidden) return;
      loaded = true;
      await renderStudents();
    });
    async function renderStudents() {
      body.textContent = "Жүктелуде…";
      try {
        const list = await A.rpc("class_overview", { cid: c.id });
        body.textContent = "";
        if (!list.length) body.appendChild(h("p", "empty-note", "Әзірге оқушы жоқ. Кодты оқушыларға бер: " + c.code));
        const detail = el("div", "detail");
        list.forEach((s) => {
          const row = el("div", "stu-row");
          const main = h("button", "stu-main", h("b", null, s.full_name), h("small", null, ago(s.last_seen)), courseSummary(s.courses), h("span", "stu-stars", "⭐ " + s.stars));
          main.type = "button";
          main.addEventListener("click", () => studentDetail(detail, s.id));
          row.append(main, confirmBtn("btn small ghost", "✕", "Шығару?", async () => {
            await A.rpc("remove_student", { cid: c.id, sid: s.id });
            c.students--;
            await renderStudents();
          }));
          body.appendChild(row);
        });
        body.appendChild(detail);
      } catch (e) {
        body.textContent = "";
        failWith(body, e);
      }
    }
    const actions = el("div", "cls-actions");
    actions.appendChild(open);
    actions.appendChild(confirmBtn("btn small ghost", "Сыныпты өшіру", "Расымен өшіру?", async () => {
      await A.rpc("delete_class", { cid: c.id });
      teacher(root);
    }));
    card.append(actions, body);
    return card;
  }

  async function teacher(root) {
    if (!A.enabled) return disabledPage(root);
    await A.ready;
    if (!A.profile) {
      location.hash = "#/login";
      return;
    }
    const page = shell(root, "Сыныптарым", ["#/account", "← Кабинет"]);
    if (!A.canTeach()) {
      notice(page, "info", "Рұқсат жоқ", A.profile.status === "pending" ? "Мұғалім аккаунтың әлі бекітілмеген." : "Бұл бет тек мұғалімдерге арналған.");
      return;
    }
    const f = el("form", "card inline-form");
    const i = el("input");
    i.placeholder = "Жаңа сынып атауы, мысалы: 5А";
    i.required = true;
    i.maxLength = 60;
    const go = el("button", "btn primary", "＋ Сынып ашу");
    go.type = "submit";
    f.append(i, go);
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      go.disabled = true;
      try {
        await A.rpc("create_class", { name_in: i.value });
        teacher(root);
      } catch (err) {
        failWith(page, err);
        go.disabled = false;
      }
    });
    page.appendChild(f);
    page.appendChild(h("p", "hint", "Сынып кодын оқушыларға бер: олар тіркелгенде не кабинетінде кодты енгізіп қосылады."));
    const box = el("div", "cls-list");
    page.appendChild(box);
    try {
      const list = await A.rpc("teacher_classes");
      if (!list.length) box.appendChild(h("p", "empty-note", "Әзірге сынып жоқ. Жоғарыдан біріншісін аш."));
      for (const c of list) box.appendChild(await classCard(root, c));
    } catch (e) {
      failWith(page, e);
    }
  }

  /* ================= Админ ================= */
  async function admin(root) {
    if (!A.enabled) return disabledPage(root);
    await A.ready;
    if (!A.profile) {
      location.hash = "#/login";
      return;
    }
    const page = shell(root, "Басқару панелі", ["#/account", "← Кабинет"]);
    if (!A.isStaff()) {
      notice(page, "bad", "Рұқсат жоқ", "Бұл бет тек құрушы мен админдерге арналған.");
      return;
    }
    const isOwner = A.profile.role === "owner";
    try {
      const [st, users] = await Promise.all([A.rpc("admin_stats"), A.rpc("admin_users")]);
      const stats = el("div", "stats");
      [["🎒", st.students, "оқушы"], ["👩‍🏫", st.teachers, "мұғалім"], ["🏫", st.classes, "сынып"], ["⭐", st.stars, "жұлдыз"], ["⏳", st.pending, "күтуде"]].forEach(([e, n, l]) =>
        stats.appendChild(h("div", "stat", h("span", "se", e), h("b", null, String(n)), h("small", null, l)))
      );
      page.appendChild(stats);

      const reload = () => admin(root);
      const act = (fn) => async () => {
        try {
          await fn();
          await reload();
        } catch (e) {
          failWith(page, e);
        }
      };

      const pend = users.filter((u) => u.status === "pending");
      if (pend.length) {
        const card = el("section", "card");
        card.appendChild(h("div", "card-title", "⏳ Бекітуді күтіп тұрған мұғалімдер"));
        pend.forEach((u) => {
          card.appendChild(
            h("div", "user-row",
              h("div", "u-info", h("b", null, u.full_name), h("small", null, u.email)),
              h("div", "u-actions",
                btn("btn small primary", "Бекіту", act(() => A.rpc("admin_set_status", { uid: u.id, new_status: "active" }))),
                confirmBtn("btn small ghost", "Қабылдамау", "Өшіру?", act(() => A.rpc("admin_delete_user", { uid: u.id })))))
          );
        });
        page.appendChild(card);
      }

      const card = el("section", "card");
      card.appendChild(h("div", "card-title", "Барлық пайдаланушылар (" + users.length + ")"));
      const filters = el("div", "filters");
      const q = el("input");
      q.type = "search";
      q.placeholder = "🔍 Аты не email";
      const sel = el("select");
      [["", "Барлық рөл"], ["student", "Оқушылар"], ["teacher", "Мұғалімдер"], ["admin", "Админдер"], ["owner", "Құрушы"]].forEach(([v, l]) => {
        const o = el("option", null, l);
        o.value = v;
        sel.appendChild(o);
      });
      filters.append(q, sel);
      card.appendChild(filters);
      const list = el("div", "user-list");
      card.appendChild(list);

      function renderList() {
        list.textContent = "";
        const term = q.value.trim().toLowerCase();
        users
          .filter((u) => (!sel.value || u.role === sel.value) && (!term || (u.full_name + " " + u.email).toLowerCase().includes(term)))
          .forEach((u) => {
            const me = u.id === A.profile.id;
            const canTouch = !me && u.role !== "owner" && (isOwner || u.role !== "admin");
            const actions = el("div", "u-actions");
            if (canTouch) {
              if (u.status === "pending") actions.appendChild(btn("btn small primary", "Бекіту", act(() => A.rpc("admin_set_status", { uid: u.id, new_status: "active" }))));
              else if (u.status === "blocked") actions.appendChild(btn("btn small", "Ашу", act(() => A.rpc("admin_set_status", { uid: u.id, new_status: "active" }))));
              else actions.appendChild(confirmBtn("btn small ghost", "Бұғаттау", "Бұғаттау?", act(() => A.rpc("admin_set_status", { uid: u.id, new_status: "blocked" }))));
              if (isOwner) {
                const rs = el("select", "role-sel");
                [["student", "Оқушы"], ["teacher", "Мұғалім"], ["admin", "Админ"]].forEach(([v, l]) => {
                  const o = el("option", null, l);
                  o.value = v;
                  if (v === u.role) o.selected = true;
                  rs.appendChild(o);
                });
                rs.title = "Рөлді өзгерту";
                rs.addEventListener("change", act(() => A.rpc("admin_set_role", { uid: u.id, new_role: rs.value })));
                actions.appendChild(rs);
              }
              actions.appendChild(confirmBtn("btn small ghost", "🗑", "Өшіру?", act(() => A.rpc("admin_delete_user", { uid: u.id }))));
            }
            list.appendChild(
              h("div", "user-row",
                h("div", "u-info",
                  h("b", null, (ROLE_EMOJI[u.role] || "") + " " + u.full_name + (me ? " (мен)" : "")),
                  h("small", null, u.email),
                  h("small", null, A.roleLabel(u.role) + " · " + A.statusLabel(u.status) + " · ⭐ " + u.stars + " · " + ago(u.last_seen))),
                actions)
            );
          });
        if (!list.children.length) list.appendChild(h("p", "empty-note", "Ештеңе табылмады."));
      }
      q.addEventListener("input", renderList);
      sel.addEventListener("change", renderList);
      renderList();
      page.appendChild(card);
    } catch (e) {
      failWith(page, e);
    }
  }

  KZ.cabinet = { login, account, teacher, admin };
})();
