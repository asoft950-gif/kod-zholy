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

  /* Тіркелмеген пайдаланушы курсқа/жетістікке кірмек болғанда */
  function gate(root, wanted) {
    KZ.returnTo = wanted && wanted !== "#/" ? wanted : null;
    const page = shell(root, null, ["#/", "← Басты бет"]);
    page.appendChild(
      h("section", "card gate",
        h("div", "gate-emoji", "🔒"),
        h("h1", null, "Алдымен кіру керек"),
        h("p", null, "Лекция оқу, тапсырма орындау және жетістік жинау үшін Ботакодқа тіркел не өз аккаунтыңа кір. Прогресің сақталады, кез келген құрылғыдан жалғастыра аласың."),
        h("div", "gate-btns", link("btn primary big", "#/login/register", "✨ Тіркелу"), link("btn big", "#/login", "🔑 Кіру")))
    );
  }
  const goAfterLogin = () => {
    const to = KZ.returnTo || "#/account";
    KZ.returnTo = null;
    location.hash = to;
  };

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
      f.append(em.wrap, pw.wrap, go, (KZ.config || {}).emailReset ? link("forgot", "#/login/reset", "Құпиясөзді ұмыттым (поштамен)") : null, h("p", "forgot", "Құпиясөзді ұмытсаң, мұғаліміңе айт: ол саған жаңасын береді."), msg);
      f.addEventListener("submit", async (e) => {
        e.preventDefault();
        go.disabled = true;
        show("");
        try {
          await A.signIn(em.input.value, pw.input.value);
          goAfterLogin();
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
          } else goAfterLogin();
        } catch (err) {
          show(err.message, true);
          go.disabled = false;
        }
      });
      body.appendChild(f);
    }

    /* Құпиясөзді қалпына келтіру (тек өз SMTP қосылғанда): 1) email -> поштаға код; 2) код + жаңа құпиясөз */
    function resetForm() {
      body.textContent = "";
      const f = el("form");
      const em = field("Email", "email", "email", { auto: "email" });
      const go = el("button", "btn primary big", "Код жіберу");
      go.type = "submit";
      f.append(h("p", "hint", "Тіркелген email-ді жаз, поштаңа код жібереміз."), em.wrap, go, link("forgot", "#/login", "← Кіру бетіне"), msg);
      f.addEventListener("submit", async (e) => {
        e.preventDefault();
        go.disabled = true;
        show("");
        try {
          await A.requestReset(em.input.value);
          codeForm(em.input.value.trim());
        } catch (err) {
          show(err.message, true);
          go.disabled = false;
        }
      });
      body.appendChild(f);
    }

    function codeForm(email) {
      body.textContent = "";
      const f = el("form");
      const code = field("Поштадағы код", "text", "code", { auto: "one-time-code", ph: "123456" });
      code.input.inputMode = "numeric";
      code.input.maxLength = 12;
      const pw = field("Жаңа құпиясөз (кемінде 6 таңба)", "password", "password", { auto: "new-password" });
      const go = el("button", "btn primary big", "Құпиясөзді жаңарту");
      go.type = "submit";
      const again = btn("btn small ghost", "Кодты қайта жібер", async () => {
        try {
          await A.requestReset(email);
          show("Жаңа код жіберілді.", false);
        } catch (err) {
          show(err.message, true);
        }
      });
      f.append(h("p", "hint", "Егер " + email + " тіркелген болса, поштаға код жіберілді (спам қалтасын да қара). Кодты және жаңа құпиясөзді енгіз."), code.wrap, pw.wrap, go, again, msg);
      f.addEventListener("submit", async (e) => {
        e.preventDefault();
        show("");
        if (pw.input.value.length < 6) return show("Құпиясөз кемінде 6 таңбадан тұруы керек.", true);
        go.disabled = true;
        try {
          await A.resetWithCode(email, code.input.value, pw.input.value);
          goAfterLogin();
        } catch (err) {
          show(err.message, true);
          go.disabled = false;
        }
      });
      body.appendChild(f);
    }

    const t = tab === "register" ? "register" : tab === "reset" && (KZ.config || {}).emailReset ? "reset" : "login";
    renderTabs(t === "reset" ? "login" : t);
    if (t === "login") loginForm();
    else if (t === "reset") resetForm();
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

      if (p.role === "student") {
        await studentTasks(page);
        await studentClasses(page, root);
      }
    }

    if (A.isActive()) {
      const det = el("details", "card pw-change");
      det.appendChild(h("summary", null, "🔑 Құпиясөзді өзгерту"));
      const f = el("form");
      const i = el("input");
      i.type = "password";
      i.autocomplete = "new-password";
      i.placeholder = "Жаңа құпиясөз (кемінде 6 таңба)";
      i.required = true;
      const go = el("button", "btn primary", "Сақтау");
      go.type = "submit";
      const m = el("p", "form-msg");
      m.hidden = true;
      f.append(i, go, m);
      f.addEventListener("submit", async (e) => {
        e.preventDefault();
        m.hidden = false;
        if (i.value.length < 6) {
          m.className = "form-msg bad";
          m.textContent = "Құпиясөз кемінде 6 таңбадан тұруы керек.";
          return;
        }
        try {
          await A.changePassword(i.value);
          i.value = "";
          m.className = "form-msg good";
          m.textContent = "Құпиясөз жаңартылды ✅";
        } catch (err) {
          m.className = "form-msg bad";
          m.textContent = err.message;
        }
      });
      det.appendChild(f);
      page.appendChild(det);
    }

    page.appendChild(btn("btn ghost", "Аккаунттан шығу", async () => {
      await A.signOut();
      location.hash = "#/";
    }));
  }

  /* Мұғалім берген тапсырмалар */
  async function studentTasks(page) {
    let list = [];
    let levels = [];
    try {
      [list, levels] = await Promise.all([A.rpc("my_assignments"), A.rpc("my_levels")]);
    } catch (e) {
      return;
    }
    if (!list.length && !levels.length) return;
    const card = el("section", "card");
    card.appendChild(h("div", "card-title", "📝 Мұғалім тапсырмалары"));
    levels.forEach((x) => {
      const stars = Math.max(x.stars || 0, KZ.progress.stars(x.course, x.level_id));
      const late = !stars && KZ.assign.overdue(x.due);
      card.appendChild(
        link(
          "row-link" + (stars ? " done" : ""),
          "#/" + x.course + "/play/" + x.level_id + "/open",
          h("span", "rl-title", levelTitle(x.course, x.level_id)),
          h("span", "rl-meta", x.class + (x.due ? " · " + x.due : "") + (late ? " · мерзімі өтті" : "")),
          h("span", "rl-check", stars ? "⭐".repeat(stars) : "›")
        )
      );
    });
    list.forEach((a) => {
      const late = !a.stars && KZ.assign.overdue(a.due);
      card.appendChild(
        link(
          "row-link" + (a.stars ? " done" : ""),
          "#/task/" + a.id,
          h("span", "rl-title", a.title),
          h("span", "rl-meta", a.class + (a.due ? " · " + a.due : "") + (late ? " · мерзімі өтті" : "")),
          h("span", "rl-check", a.stars ? "⭐".repeat(a.stars) : "›")
        )
      );
    });
    page.appendChild(card);
  }

  /* Сынып рейтингі: жұлдыз бен күн сериясы бойынша тізім */
  function ratingTable(rows) {
    const wrap = el("div", "rating");
    if (!rows.length) {
      wrap.appendChild(h("p", "empty-note", "Әзірге оқушы жоқ."));
      return wrap;
    }
    const medal = ["🥇", "🥈", "🥉"];
    rows.forEach((r, i) => {
      wrap.appendChild(
        h("div", "rating-row" + (r.me ? " me" : ""),
          h("span", "rating-pos", medal[i] || String(i + 1)),
          h("span", "rating-name", r.name + (r.me ? " (сен)" : "")),
          h("span", "rating-streak", r.streak > 0 ? "🔥 " + r.streak : ""),
          h("span", "rating-stars", "⭐ " + r.stars))
      );
    });
    return wrap;
  }
  async function ratingPanel(cid, box) {
    box.textContent = "Жүктелуде…";
    try {
      const r = await A.rpc("class_rating", { cid });
      box.textContent = "";
      box.appendChild(ratingTable(r.rows));
    } catch (e) {
      box.textContent = "";
      failWith(box, e);
    }
  }

  async function studentClasses(page, root) {
    const card = el("section", "card");
    card.appendChild(h("div", "card-title", "Менің сыныптарым"));
    try {
      const list = await A.rpc("student_classes");
      if (!list.length) card.appendChild(h("p", "empty-note", "Әзірге сыныпқа қосылмағансың. Мұғалімнен код сұра."));
      list.forEach((c) => {
        const rbox = el("div", "cls-body");
        rbox.hidden = true;
        const acts = el("div", "cls-actions");
        if (c.rating) {
          const rb = btn("btn small", "🏆 Рейтинг", async () => {
            rbox.hidden = !rbox.hidden;
            rb.textContent = rbox.hidden ? "🏆 Рейтинг" : "🏆 Жасыру";
            if (!rbox.hidden) await ratingPanel(c.id, rbox);
          });
          acts.appendChild(rb);
        }
        acts.appendChild(
          confirmBtn("btn small ghost", "Сыныптан шығу", "Расымен шығу?", async () => {
            await A.rpc("leave_class", { class_id_in: c.id });
            account(root);
          })
        );
        card.appendChild(h("div", "cls-row", h("div", null, h("b", null, c.name), h("small", null, "Мұғалім: " + c.teacher)), acts));
        card.appendChild(rbox);
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

  /* Құпиясөзді ұмытқан адамға мұғалім/админ жаңа уақытша құпиясөз береді */
  function tempPassword() {
    const abc = "abcdefghjkmnpqrstuvwxyz23456789";
    const a = new Uint32Array(8);
    crypto.getRandomValues(a);
    return Array.from(a, (x) => abc[x % abc.length]).join("");
  }
  function resetPwButton(sid, name) {
    const wrap = el("span", "pw-reset");
    wrap.appendChild(
      confirmBtn("btn small ghost", "🔑 Жаңа құпиясөз", "Растау?", async () => {
        wrap.textContent = "…";
        try {
          const pw = tempPassword();
          await A.rpc("reset_password", { sid, new_pw: pw });
          wrap.textContent = "";
          const code = h("button", "code-box pw-box", pw);
          code.type = "button";
          code.title = "Көшіру";
          code.addEventListener("click", () => {
            if (navigator.clipboard) navigator.clipboard.writeText(pw).catch(() => {});
          });
          wrap.append(h("small", null, name + " үшін жаңа құпиясөз (тек қазір көрінеді, оқушыға айт — кіргеннен кейін кабинетінен өзгертсін): "), code);
        } catch (e) {
          wrap.textContent = "";
          wrap.appendChild(h("small", "bad", e.message));
        }
      })
    );
    return wrap;
  }

  async function studentDetail(box, sid) {
    box.textContent = "Жүктелуде…";
    try {
      const r = await A.rpc("student_progress", { sid });
      box.textContent = "";
      box.appendChild(h("h3", null, r.profile.full_name + " · " + ago(r.profile.last_seen)));
      if (sid !== (A.profile && A.profile.id)) box.appendChild(resetPwButton(sid, r.profile.full_name));
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

  /* ---------- Мұғалім тапсырмалары ---------- */
  const lbl = (text, input) => h("label", "field", h("span", null, text), input);
  const area = (rows, ph, mono) => {
    const t = el("textarea", mono ? "mono" : "");
    t.rows = rows;
    if (ph) t.placeholder = ph;
    t.spellcheck = false;
    return t;
  };

  function assignmentForm(c, onSaved) {
    const f = el("form", "asg-form");
    const title = el("input");
    title.maxLength = 80;
    title.required = true;
    title.placeholder = "Мысалы: Екі санды қос";
    const lang = el("select");
    [["python", "Python"], ["javascript", "JavaScript"]].forEach(([v, l]) => {
      const o = el("option", null, l);
      o.value = v;
      lang.appendChild(o);
    });
    const body = area(4, "Тапсырма шарты: оқушы не істеуі керек, экранға не шығуы керек…");
    body.maxLength = 4000;
    const starter = area(3, "Бастапқы код (міндетті емес)", true);
    const solution = area(4, "Өз шешімің: іске қосқанда күтілетін нәтиже мен жол саны автоматты табылады", true);
    const run = btn("btn small", "▶ Шешімді іске қосу");
    const expected = area(2, "Күтілетін нәтиже: оқушы кодының экранға шығарғаны дәл осындай болуы керек", true);
    expected.required = true;
    const par = el("input");
    par.type = "number";
    par.min = "1";
    par.max = "200";
    par.placeholder = "жол саны";
    const hint = el("input");
    hint.maxLength = 500;
    hint.placeholder = "Кеңес (міндетті емес)";
    const due = el("input");
    due.type = "date";
    const msg = el("p", "form-msg");
    msg.hidden = true;
    const say = (t, bad) => {
      msg.hidden = !t;
      msg.textContent = t || "";
      msg.className = "form-msg" + (bad ? " bad" : " good");
    };

    run.addEventListener("click", async () => {
      if (!solution.value.trim()) return say("Алдымен шешім кодын жаз.", true);
      run.disabled = true;
      say("Іске қосылып жатыр…");
      try {
        const r = await KZ.play.runOnce(lang.value === "javascript" ? "js" : "python", solution.value);
        if (r.error) say("Шешімде қате бар: " + (r.error.msg || "белгісіз қате"), true);
        else {
          expected.value = KZ.assign.normalize(r.output);
          par.value = String(Math.max(1, Math.min(200, r.lines || 1)));
          say(expected.value ? "Дайын: нәтиже мен жол саны толтырылды. Қаласаң, өзгерт." : "Шешім экранға ештеңе шығармады. Тапсырма үшін нәтиже керек.", !expected.value);
        }
      } catch (e) {
        say("Іске қосу сәтсіз: " + e.message, true);
      }
      run.disabled = false;
    });

    const go = el("button", "btn primary", "Жариялау");
    go.type = "submit";
    f.append(
      lbl("Тақырыбы", title),
      lbl("Тілі", lang),
      lbl("Тапсырма шарты", body),
      lbl("Бастапқы код", starter),
      lbl("Күтілетін нәтиже (экранға не шығуы керек)", expected),
      (() => {
        const d = el("details", "asg-auto");
        d.append(h("summary", null, "💡 Нәтижені өзім жазбай, шешім кодын іске қосып алам"), lbl("Шешім (сақталмайды, тек нәтижені есептеу үшін)", solution), run);
        return d;
      })(),
      h("div", "field-row", lbl("Үздік шешім: ең көбі неше жол", par), lbl("Тапсыру мерзімі", due)),
      lbl("Кеңес", hint),
      go,
      msg
    );
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      go.disabled = true;
      try {
        const exp = KZ.assign.normalize(expected.value);
        if (!exp) throw new Error("Күтілетін нәтиже бос болмауы керек.");
        const hash = await KZ.assign.hash(exp);
        await A.rpc("create_assignment", {
          cid: c.id,
          title_in: title.value,
          body_in: body.value,
          course_in: lang.value,
          starter_in: starter.value,
          hint_in: hint.value,
          expected_in: exp,
          hash_in: hash,
          par_in: par.value ? Number(par.value) : null,
          due_in: due.value || null,
        });
        f.reset();
        say("");
        await onSaved();
      } catch (err) {
        say(err.message, true);
      }
      go.disabled = false;
    });
    return f;
  }

  function assignmentRow(a, reload) {
    const row = el("div", "asg-row");
    const late = KZ.assign.overdue(a.due);
    const info = h(
      "div",
      "asg-info",
      h("b", null, a.title),
      h("small", null, (KZ.assign.LANG[a.course] || a.course) + (a.due ? " · мерзімі " + a.due + (late ? " (өтті)" : "") : "") + " · ✅ " + a.done + "/" + a.total)
    );
    const detail = el("div", "asg-detail");
    detail.hidden = true;
    let loaded = false;
    const res = btn("btn small", "Нәтижелер", async () => {
      detail.hidden = !detail.hidden;
      if (detail.hidden || loaded) return;
      loaded = true;
      detail.textContent = "Жүктелуде…";
      try {
        const list = await A.rpc("assignment_results", { aid: a.id });
        detail.textContent = "";
        if (!list.length) detail.appendChild(h("p", "empty-note", "Сыныпта оқушы жоқ."));
        list.forEach((s) =>
          detail.appendChild(h("div", "asg-res" + (s.stars ? " ok" : ""), h("span", null, s.full_name), h("b", null, s.stars ? "⭐".repeat(s.stars) : "әлі жоқ")))
        );
      } catch (e) {
        detail.textContent = "";
        failWith(detail, e);
      }
    });
    const actions = el("div", "u-actions");
    actions.append(
      link("btn small ghost", "#/task/" + a.id, "👁 Көру"),
      res,
      confirmBtn("btn small ghost", "🗑", "Өшіру?", async () => {
        await A.rpc("delete_assignment", { aid: a.id });
        await reload();
      })
    );
    row.append(h("div", "asg-top", info, actions), detail);
    return row;
  }

  /* Дайын тапсырма: курс пен деңгейді таңдау жеткілікті, ештеңе жазудың қажеті жоқ */
  function levelTitle(course, id) {
    const c = KZ.getCourse(course);
    const f = c && KZ.findLevel(c, id);
    return f ? id + " · " + f.level.title : id;
  }

  function levelPicker(c, onSaved) {
    const f = el("form", "asg-form");
    const course = el("select");
    KZ.courses
      .filter((x) => x.status === "ready")
      .forEach((x) => {
        const o = el("option", null, x.emoji + " " + x.name);
        o.value = x.id;
        course.appendChild(o);
      });
    const level = el("select");
    const fill = () => {
      level.textContent = "";
      const cr = KZ.getCourse(course.value);
      const add = (label, list) => {
        if (!list.length) return;
        const g = el("optgroup");
        g.label = label;
        list.forEach((l) => {
          const o = el("option", null, l.id + " · " + l.title);
          o.value = l.id;
          g.appendChild(o);
        });
        level.appendChild(g);
      };
      (cr.topics || []).forEach((t) => add(t.emoji + " " + t.title, (cr.levels || []).filter((l) => KZ.topicOf(l) === t.id)));
      add("🏆 Қосымша", (cr.bonus || []).filter((l) => !l.debug));
      add("🐞 Қате тап", (cr.bonus || []).filter((l) => l.debug));
    };
    course.addEventListener("change", fill);
    fill();
    const due = el("input");
    due.type = "date";
    const msg = el("p", "form-msg");
    msg.hidden = true;
    const go = el("button", "btn primary", "Сыныпқа беру");
    go.type = "submit";
    f.append(
      h("p", "muted", "Сайттағы дайын тапсырманы таңда: оқушы оны өз прогресінде орындайды, нәтижесін осы жерден көресің."),
      lbl("Курс", course),
      lbl("Тапсырма", level),
      lbl("Тапсыру мерзімі (міндетті емес)", due),
      go,
      msg
    );
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      go.disabled = true;
      try {
        await A.rpc("assign_level", { cid: c.id, course_in: course.value, level_in: level.value, due_in: due.value || null });
        await onSaved();
      } catch (err) {
        msg.hidden = false;
        msg.className = "form-msg bad";
        msg.textContent = err.message;
      }
      go.disabled = false;
    });
    return f;
  }

  function levelRow(x, reload) {
    const row = el("div", "asg-row");
    const late = KZ.assign.overdue(x.due);
    const cr = KZ.getCourse(x.course);
    const info = h(
      "div",
      "asg-info",
      h("b", null, levelTitle(x.course, x.level_id)),
      h("small", null, (cr ? cr.name : x.course) + " · дайын тапсырма" + (x.due ? " · мерзімі " + x.due + (late ? " (өтті)" : "") : "") + " · ✅ " + x.done + "/" + x.total)
    );
    const detail = el("div", "asg-detail");
    detail.hidden = true;
    let loaded = false;
    const res = btn("btn small", "Нәтижелер", async () => {
      detail.hidden = !detail.hidden;
      if (detail.hidden || loaded) return;
      loaded = true;
      detail.textContent = "Жүктелуде…";
      try {
        const list = await A.rpc("level_results", { lid: x.id });
        detail.textContent = "";
        if (!list.length) detail.appendChild(h("p", "empty-note", "Сыныпта оқушы жоқ."));
        list.forEach((s) =>
          detail.appendChild(h("div", "asg-res" + (s.stars ? " ok" : ""), h("span", null, s.full_name), h("b", null, s.stars ? "⭐".repeat(s.stars) : "әлі жоқ")))
        );
      } catch (e) {
        detail.textContent = "";
        failWith(detail, e);
      }
    });
    const actions = el("div", "u-actions");
    actions.append(
      link("btn small ghost", "#/" + x.course + "/play/" + x.level_id + "/open", "👁 Көру"),
      res,
      confirmBtn("btn small ghost", "🗑", "Өшіру?", async () => {
        await A.rpc("remove_level", { lid: x.id });
        await reload();
      })
    );
    row.append(h("div", "asg-top", info, actions), detail);
    return row;
  }

  function assignmentsPanel(c) {
    const wrap = el("div", "asg");
    const list = el("div", "asg-list");
    let form;
    let pick;
    async function reload() {
      list.textContent = "Жүктелуде…";
      try {
        const [items, levels] = await Promise.all([A.rpc("class_assignments", { cid: c.id }), A.rpc("class_levels_list", { cid: c.id })]);
        list.textContent = "";
        if (!items.length && !levels.length) list.appendChild(h("p", "empty-note", "Әзірге тапсырма жоқ. «Дайын тапсырма» түймесі ең оңай жол."));
        levels.forEach((x) => list.appendChild(levelRow(x, reload)));
        items.forEach((a) => list.appendChild(assignmentRow(a, reload)));
      } catch (e) {
        list.textContent = "";
        failWith(list, e);
      }
      if (form) form.hidden = true;
      if (pick) pick.hidden = true;
    }
    form = assignmentForm(c, reload);
    form.hidden = true;
    pick = levelPicker(c, reload);
    pick.hidden = true;
    const addLv = btn("btn small primary", "＋ Дайын тапсырма", () => {
      pick.hidden = !pick.hidden;
      form.hidden = true;
    });
    const add = btn("btn small", "✍ Өз тапсырмам", () => {
      form.hidden = !form.hidden;
      pick.hidden = true;
    });
    wrap.append(h("div", "asg-head", h("b", null, "📝 Тапсырмалар"), h("span", "asg-btns", addLv, add)), pick, form, list);
    reload();
    return wrap;
  }

  /* ---------- Сынып статистикасы ---------- */
  const STATUS = { stuck: ["🧱", "тұрып қалған"], idle: ["💤", "кірмей кеткен"], new: ["🌱", "әлі бастамаған"], done: ["🏁", "бітірген"], ok: ["✅", "жақсы"] };

  async function statsPanel(c, box) {
    box.textContent = "Жүктелуде…";
    try {
      const data = await A.rpc("class_stats", { cid: c.id });
      const courses = KZ.courses.filter((x) => x.status === "ready");
      const r = KZ.classStats.compute(data, courses);
      box.textContent = "";
      if (!r.n) {
        box.appendChild(h("p", "empty-note", "Әзірге оқушы жоқ."));
        return;
      }
      const chips = el("div", "chips-row");
      [["👥 " + r.n + " оқушы"], ["🔥 Осы аптада кірген: " + r.active7 + "/" + r.n], ["⭐ Барлығы: " + r.totalStars], ["⚠ Назар керек: " + r.attention.length]].forEach(([t]) => chips.appendChild(h("span", "mini has", t)));
      box.appendChild(chips);

      box.appendChild(h("h4", "st-h", "⚠ Назар аудару керек"));
      if (!r.attention.length) box.appendChild(h("p", "empty-note", "Бәрі жақсы: тұрып қалған не кірмей кеткен оқушы жоқ 🎉"));
      r.attention.forEach((p) => {
        const [emo] = STATUS[p.status];
        const where = p.cur ? " · қазір: " + KZ.getCourse(p.cur.c).emoji + " " + levelTitle(p.cur.c, p.cur.l) : "";
        box.appendChild(h("div", "st-row " + p.status, h("b", null, emo + " " + p.name), h("small", null, p.note + where)));
      });

      box.appendChild(h("h4", "st-h", "🧗 Қиын тапсырмалар"));
      if (!r.hard.length) box.appendChild(h("p", "empty-note", "Әзірге қиын болған тапсырма байқалмайды."));
      r.hard.forEach((x) => {
        const course = KZ.getCourse(x.c);
        const parts = [x.done + " оқушы өткен", "орташа ⭐ " + x.avg];
        if (x.stuck.length) parts.push("тұрып қалғандар: " + x.stuck.join(", "));
        box.appendChild(h("div", "st-row", h("b", null, course.emoji + " " + levelTitle(x.c, x.l)), h("small", null, parts.join(" · "))));
      });

      box.appendChild(h("h4", "st-h", "📅 Белсенділік (соңғы 7 күн)"));
      r.people.forEach((p) => {
        const dots = el("span", "st-dots");
        for (let i = 0; i < 7; i++) dots.appendChild(h("i", i < p.days7 ? "on" : ""));
        box.appendChild(h("div", "st-act", h("span", null, p.name), dots, h("small", null, p.days7 + "/7 · ⭐ " + p.stars)));
      });
      box.appendChild(h("small", "st-note", "«Тұрып қалған» — соңғы күндері кіріп жүр, бірақ 3 күннен бері жаңа жұлдыз алмаған оқушы. «Қиын тапсырма» — орташа жұлдызы төмен не оқушылар қазір тұрған тапсырма."));
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
    const statsBox = el("div", "cls-body stats-box");
    statsBox.hidden = true;
    const statsBtn = btn("btn small", "📊 Статистика", async () => {
      statsBox.hidden = !statsBox.hidden;
      statsBtn.textContent = statsBox.hidden ? "📊 Статистика" : "📊 Жасыру";
      if (!statsBox.hidden) await statsPanel(c, statsBox);
    });
    const ratingBox = el("div", "cls-body");
    ratingBox.hidden = true;
    const ratingBtn = btn("btn small", "🏆 Рейтинг", async () => {
      ratingBox.hidden = !ratingBox.hidden;
      ratingBtn.textContent = ratingBox.hidden ? "🏆 Рейтинг" : "🏆 Жасыру";
      if (ratingBox.hidden) return;
      ratingBox.textContent = "";
      const sw = el("label", "rating-switch");
      const cb = el("input");
      cb.type = "checkbox";
      cb.checked = !!c.rating;
      const note = h("small", null, "");
      const setNote = () => (note.textContent = c.rating ? "Оқушылар рейтингті көреді." : "Қазір рейтинг тек саған көрінеді, оқушыларға жасырын.");
      setNote();
      cb.addEventListener("change", async () => {
        cb.disabled = true;
        try {
          await A.rpc("set_class_rating", { cid: c.id, on_in: cb.checked });
          c.rating = cb.checked;
        } catch (e) {
          cb.checked = !cb.checked;
        }
        cb.disabled = false;
        setNote();
      });
      sw.append(cb, h("span", null, " Оқушыларға көрсету"));
      const list = el("div");
      ratingBox.append(sw, note, list);
      await ratingPanel(c.id, list);
    });
    const actions = el("div", "cls-actions");
    actions.appendChild(open);
    actions.appendChild(statsBtn);
    actions.appendChild(ratingBtn);
    actions.appendChild(confirmBtn("btn small ghost", "Сыныпты өшіру", "Расымен өшіру?", async () => {
      await A.rpc("delete_class", { cid: c.id });
      teacher(root);
    }));
    card.append(actions, statsBox, ratingBox, body, assignmentsPanel(c));
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
              if (isOwner || u.role === "student" || u.role === "teacher") actions.appendChild(resetPwButton(u.id, u.full_name));
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

  KZ.cabinet = { login, account, teacher, admin, gate };
})();
