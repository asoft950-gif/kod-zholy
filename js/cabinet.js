/* Bitlings: кабинеттер (кіру/тіркелу, оқушы, мұғалім, админ) */
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
    if (!ts) return KZ.t("әлі кірмеген");
    const s = Math.max(0, (Date.now() - new Date(ts).getTime()) / 1000);
    if (s < 90) return KZ.t("қазір");
    if (s < 3600) return Math.round(s / 60) + KZ.t(" мин бұрын");
    if (s < 86400) return Math.round(s / 3600) + KZ.t(" сағ бұрын");
    return Math.round(s / 86400) + KZ.t(" күн бұрын");
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
    page.appendChild(h("section", "card notice bad", h("h2", null, KZ.t("🙈 Қате")), h("p", null, e.message || String(e))));
  }

  function disabledPage(root) {
    const page = shell(root, KZ.t("Аккаунттар қосылмаған"), ["#/", KZ.t("← Басты бет")]);
    notice(
      page,
      "info",
      KZ.t("Қонақ режимі"),
      KZ.t("Әзірге аккаунт жүйесі қосылмаған. Сайт бұрынғыдай жұмыс істейді, прогресс осы құрылғыда сақталады. Сайт иесіне: SUPABASE.md файлындағы 5 қадамды орындау керек.")
    );
  }

  /* Тіркелмеген пайдаланушы курсқа/жетістікке кірмек болғанда */
  function gate(root, wanted) {
    KZ.returnTo = wanted && wanted !== "#/" ? wanted : null;
    const page = shell(root, null, ["#/", KZ.t("← Басты бет")]);
    page.appendChild(
      h("section", "card gate",
        h("div", "gate-emoji", "🔒"),
        h("h1", null, KZ.t("Алдымен кіру керек")),
        h("p", null, KZ.t("Лекция оқу, тапсырма орындау және жетістік жинау үшін Bitlings-ке тіркел не өз аккаунтыңа кір. Прогресің сақталады, кез келген құрылғыдан жалғастыра аласың.")),
        h("div", "gate-btns", link("btn primary big", "#/login/register", KZ.t("✨ Тіркелу")), link("btn big", "#/login", KZ.t("🔑 Кіру"))))
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
    const page = shell(root, KZ.t("Bitlings-ке кіру"), ["#/", KZ.t("← Басты бет")]);
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
      [["login", KZ.t("Кіру")], ["register", KZ.t("Тіркелу")]].forEach(([id, label]) => {
        tabs.appendChild(link("tab" + (id === active ? " active" : ""), "#/login/" + id, label));
      });
    }

    function loginForm() {
      body.textContent = "";
      const f = el("form");
      const em = field("Email", "email", "email", { auto: "email" });
      const pw = field(KZ.t("Құпиясөз"), "password", "password", { auto: "current-password" });
      const go = el("button", "btn primary big", KZ.t("Кіру"));
      go.type = "submit";
      f.append(em.wrap, pw.wrap, go, (KZ.config || {}).emailReset ? link("forgot", "#/login/reset", KZ.t("Құпиясөзді ұмыттым (поштамен)")) : null, h("p", "forgot", KZ.t("Құпиясөзді ұмытсаң, мұғаліміңе айт: ол саған жаңасын береді.")), msg);
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
      roles.append(mk("student", "🎒", KZ.t("Оқушы"), KZ.t("үйренемін")), mk("teacher", "👩‍🏫", KZ.t("Мұғалім"), KZ.t("сынып ашамын")));
      const nm = field(KZ.t("Атың"), "text", "name", { auto: "name", ph: KZ.t("Мысалы: Алия Серікова") });
      const em = field("Email", "email", "email", { auto: "email" });
      const pw = field(KZ.t("Құпиясөз (кемінде 6 таңба)"), "password", "password", { auto: "new-password" });
      const codeField = field(KZ.t("Сынып коды (болса)"), "text", "code", { optional: true, ph: KZ.t("Мысалы: A1B2C3") });
      const note = h("p", "hint", KZ.t("Мұғалім аккаунтын құрушы бекіткеннен кейін ғана сынып аша аласың. Тіркелген соң бекітуді күт."));
      note.hidden = true;
      const go = el("button", "btn primary big", KZ.t("Тіркелу"));
      go.type = "submit";
      f.append(roles, nm.wrap, em.wrap, pw.wrap, codeField.wrap, note, go, msg);
      f.addEventListener("submit", async (e) => {
        e.preventDefault();
        go.disabled = true;
        show("");
        try {
          const r = await A.signUp({ email: em.input.value, password: pw.input.value, name: nm.input.value, role, classCode: codeField.input.value });
          if (r.needsConfirm) {
            show(KZ.t("Тіркелдің! Поштаңа хат жіберілді: ондағы сілтемені басып, сосын «Кіру» бетінен кір."), false);
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
      const go = el("button", "btn primary big", KZ.t("Код жіберу"));
      go.type = "submit";
      f.append(h("p", "hint", KZ.t("Тіркелген email-ді жаз, поштаңа код жібереміз.")), em.wrap, go, link("forgot", "#/login", KZ.t("← Кіру бетіне")), msg);
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
      const code = field(KZ.t("Поштадағы код"), "text", "code", { auto: "one-time-code", ph: "123456" });
      code.input.inputMode = "numeric";
      code.input.maxLength = 12;
      const pw = field(KZ.t("Жаңа құпиясөз (кемінде 6 таңба)"), "password", "password", { auto: "new-password" });
      const go = el("button", "btn primary big", KZ.t("Құпиясөзді жаңарту"));
      go.type = "submit";
      const again = btn("btn small ghost", KZ.t("Кодты қайта жібер"), async () => {
        try {
          await A.requestReset(email);
          show(KZ.t("Жаңа код жіберілді."), false);
        } catch (err) {
          show(err.message, true);
        }
      });
      f.append(h("p", "hint", KZ.t("Егер ") + email + KZ.t(" тіркелген болса, поштаға код жіберілді (спам қалтасын да қара). Кодты және жаңа құпиясөзді енгіз.")), code.wrap, pw.wrap, go, again, msg);
      f.addEventListener("submit", async (e) => {
        e.preventDefault();
        show("");
        if (pw.input.value.length < 6) return show(KZ.t("Құпиясөз кемінде 6 таңбадан тұруы керек."), true);
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
    const page = shell(root, null, ["#/", KZ.t("← Басты бет")]);

    const head = el("section", "card profile-head");
    if (p.role === "student" && KZ.hero) {
      const av = h("a", "avatar hero-avatar", KZ.hero.node());
      av.href = "#/hero";
      av.title = KZ.t("Менің кейіпкерім");
      head.appendChild(av);
    } else head.appendChild(h("div", "avatar", ROLE_EMOJI[p.role] || "🙂"));
    const info = el("div", "ph-info");
    const nameRow = el("div", "name-row");
    const nameEl = h("h1", null, p.full_name || p.email);
    nameRow.appendChild(nameEl);
    const edit = btn("btn small ghost", "✏️", () => {
      nameRow.textContent = "";
      const i = el("input");
      i.value = p.full_name;
      i.maxLength = 60;
      const ok = btn("btn small primary", KZ.t("Сақтау"), async () => {
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
    edit.title = KZ.t("Атын өзгерту");
    nameRow.appendChild(edit);
    info.appendChild(nameRow);
    info.appendChild(h("small", null, p.email));
    info.appendChild(h("div", "badges", h("span", "pbadge role-" + p.role, A.roleLabel(p.role)), h("span", "pbadge st-" + p.status, A.statusLabel(p.status))));
    head.appendChild(info);
    page.appendChild(head);

    if (p.status === "pending") {
      notice(page, "info", KZ.t("⏳ Өтінімің қаралуда"), KZ.t("Құрушы мұғалім аккаунтыңды бекіткенде, сынып аша аласың. Бекітілгеннен кейін бетті жаңарт."));
      page.appendChild(btn("btn", KZ.t("↻ Тексеру"), async () => { await A.refreshProfile(); account(root); }));
    } else if (p.status === "blocked") {
      notice(page, "bad", KZ.t("⛔ Аккаунт бұғатталған"), KZ.t("Прогресс сақталмайды. Құрушымен хабарлас."));
    }

    if (A.isActive()) {
      const links = el("div", "cab-links");
      if (A.canTeach()) links.appendChild(link("btn primary big", "#/teacher", KZ.t("👩‍🏫 Сыныптар мен оқушылар")));
      if (A.isStaff()) links.appendChild(link("btn big", "#/admin", KZ.t("🛠️ Басқару панелі")));
      if (links.children.length) page.appendChild(links);

      // Прогресс
      const prog = el("section", "card");
      prog.appendChild(h("div", "card-title", KZ.t("Менің прогресім")));
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
      det.appendChild(h("summary", null, KZ.t("🔑 Құпиясөзді өзгерту")));
      const f = el("form");
      const i = el("input");
      i.type = "password";
      i.autocomplete = "new-password";
      i.placeholder = KZ.t("Жаңа құпиясөз (кемінде 6 таңба)");
      i.required = true;
      const go = el("button", "btn primary", KZ.t("Сақтау"));
      go.type = "submit";
      const m = el("p", "form-msg");
      m.hidden = true;
      f.append(i, go, m);
      f.addEventListener("submit", async (e) => {
        e.preventDefault();
        m.hidden = false;
        if (i.value.length < 6) {
          m.className = "form-msg bad";
          m.textContent = KZ.t("Құпиясөз кемінде 6 таңбадан тұруы керек.");
          return;
        }
        try {
          await A.changePassword(i.value);
          i.value = "";
          m.className = "form-msg good";
          m.textContent = KZ.t("Құпиясөз жаңартылды ✅");
        } catch (err) {
          m.className = "form-msg bad";
          m.textContent = err.message;
        }
      });
      det.appendChild(f);
      page.appendChild(det);
    }

    page.appendChild(btn("btn ghost", KZ.t("Аккаунттан шығу"), async () => {
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
    card.appendChild(h("div", "card-title", KZ.t("📝 Мұғалім тапсырмалары")));
    levels.forEach((x) => {
      const stars = Math.max(x.stars || 0, KZ.progress.stars(x.course, x.level_id));
      const late = !stars && KZ.assign.overdue(x.due);
      card.appendChild(
        link(
          "row-link" + (stars ? " done" : ""),
          "#/" + x.course + "/play/" + x.level_id + "/open",
          h("span", "rl-title", levelTitle(x.course, x.level_id)),
          h("span", "rl-meta", x.class + (x.due ? " · " + x.due : "") + (late ? KZ.t(" · мерзімі өтті") : "")),
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
          h("span", "rl-meta", a.class + (a.due ? " · " + a.due : "") + (late ? KZ.t(" · мерзімі өтті") : "")),
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
      wrap.appendChild(h("p", "empty-note", KZ.t("Әзірге оқушы жоқ.")));
      return wrap;
    }
    const medal = ["🥇", "🥈", "🥉"];
    rows.forEach((r, i) => {
      const bit = el("span", "rating-bit hero-fig");
      if (KZ.hero) {
        const hs = r.hero && r.hero.eq ? r.hero : { color: "#6c5ce7", eq: {} };
        bit.innerHTML = KZ.hero.svg({ color: hs.color, eq: hs.eq, still: true, lg: r.lg || 0, streak: r.streak || 0 });
      } else bit.textContent = "🙂";
      const lgm = r.lg ? ["🥇", "🥈", "🥉"][r.lg - 1] : "";
      wrap.appendChild(
        h("div", "rating-row" + (r.me ? " me" : ""),
          h("span", "rating-pos", medal[i] || String(i + 1)),
          bit,
          h("span", "rating-name", r.name + (r.me ? KZ.t(" (сен)") : "") + (lgm ? " " + lgm : "")),
          h("span", "rating-streak", r.streak > 0 ? "🔥 " + r.streak : ""),
          h("span", "rating-stars", "⭐ " + r.stars))
      );
    });
    return wrap;
  }
  async function ratingPanel(cid, box) {
    box.textContent = KZ.t("Жүктелуде…");
    try {
      const r = await A.rpc("class_rating", { cid });
      box.textContent = "";
      const mine = r.rows.find((x) => x.me);
      if (mine && KZ.hero && KZ.hero.setLeague) KZ.hero.setLeague(mine.lg || null);
      box.appendChild(ratingTable(r.rows));
      box.appendChild(h("p", "hint rating-note", KZ.t("🏅 Апталық лига: өткен аптада сыныпта ең көп ⭐ жинаған топ-3 оқушы осы аптаға арнайы зат киеді (Кейіпкер бетінде).")));
    } catch (e) {
      box.textContent = "";
      failWith(box, e);
    }
  }

  async function studentClasses(page, root) {
    const card = el("section", "card");
    card.appendChild(h("div", "card-title", KZ.t("Менің сыныптарым")));
    try {
      const list = await A.rpc("student_classes");
      if (!list.length) card.appendChild(h("p", "empty-note", KZ.t("Әзірге сыныпқа қосылмағансың. Мұғалімнен код сұра.")));
      list.forEach((c) => {
        const rbox = el("div", "cls-body");
        rbox.hidden = true;
        const acts = el("div", "cls-actions");
        if (c.rating) {
          const rb = btn("btn small", KZ.t("🏆 Рейтинг"), async () => {
            rbox.hidden = !rbox.hidden;
            rb.textContent = rbox.hidden ? KZ.t("🏆 Рейтинг") : KZ.t("🏆 Жасыру");
            if (!rbox.hidden) await ratingPanel(c.id, rbox);
          });
          acts.appendChild(rb);
        }
        acts.appendChild(
          confirmBtn("btn small ghost", KZ.t("Сыныптан шығу"), KZ.t("Расымен шығу?"), async () => {
            await A.rpc("leave_class", { class_id_in: c.id });
            account(root);
          })
        );
        card.appendChild(h("div", "cls-row", h("div", null, h("b", null, c.name), h("small", null, KZ.t("Мұғалім: ") + c.teacher)), acts));
        card.appendChild(rbox);
      });
    } catch (e) {
      failWith(card, e);
    }
    const f = el("form", "inline-form");
    const i = el("input");
    i.placeholder = KZ.t("Сынып коды");
    i.maxLength = 12;
    i.required = true;
    const go = el("button", "btn primary", KZ.t("Қосылу"));
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
      confirmBtn("btn small ghost", KZ.t("🔑 Жаңа құпиясөз"), KZ.t("Растау?"), async () => {
        wrap.textContent = "…";
        try {
          const pw = tempPassword();
          await A.rpc("reset_password", { sid, new_pw: pw });
          wrap.textContent = "";
          const code = h("button", "code-box pw-box", pw);
          code.type = "button";
          code.title = KZ.t("Көшіру");
          code.addEventListener("click", () => {
            if (navigator.clipboard) navigator.clipboard.writeText(pw).catch(() => {});
          });
          wrap.append(h("small", null, name + KZ.t(" үшін жаңа құпиясөз (тек қазір көрінеді, оқушыға айт — кіргеннен кейін кабинетінен өзгертсін): ")), code);
        } catch (e) {
          wrap.textContent = "";
          wrap.appendChild(h("small", "bad", e.message));
        }
      })
    );
    return wrap;
  }

  async function studentDetail(box, sid) {
    box.textContent = KZ.t("Жүктелуде…");
    try {
      const r = await A.rpc("student_progress", { sid });
      box.textContent = "";
      box.appendChild(h("h3", null, r.profile.full_name + " · " + ago(r.profile.last_seen)));
      if (sid !== (A.profile && A.profile.id)) box.appendChild(resetPwButton(sid, r.profile.full_name));
      /* Жиынтық: кейіпкер, жұлдыз, серия, жетістіктер (сервердегі деректерден есептеледі) */
      if (KZ.ach && KZ.ach.evalFor && r.days) {
        const ev = KZ.ach.evalFor(r);
        const sum = el("div", "det-sum");
        if (KZ.hero && r.hero && r.hero.eq) {
          const f = el("span", "hero-fig det-hero");
          f.innerHTML = KZ.hero.svg({ color: r.hero.color || "#6c5ce7", eq: r.hero.eq, still: true, streak: ev.runs.cur, lg: 0 });
          sum.appendChild(f);
        }
        const stars = r.progress.reduce((a, x) => a + (x.s || 0), 0);
        const got = ev.list.filter((x) => x.ok).length;
        const chips = el("div", "det-chips");
        [
          ["⭐", stars, KZ.t("жұлдыз")],
          ["✅", ev.stats.levels, KZ.t("тапсырма")],
          ["💎", ev.stats.perfect, KZ.t("3 жұлдызбен")],
          ["📖", ev.stats.read, KZ.t("лекция оқыды")],
          ["🔥", ev.runs.cur + " / " + ev.runs.best, KZ.t("серия: қазір / ең ұзақ")],
          ["📅", ev.runs.active, KZ.t("белсенді күн")],
          ["🏆", got + " / " + ev.list.length, KZ.t("жетістік")],
        ].forEach(([e, v, t]) => chips.appendChild(h("div", "det-chip", h("span", null, e), h("b", null, String(v)), h("small", null, t))));
        sum.appendChild(chips);
        box.appendChild(sum);
        const al = el("div", "det-ach");
        ev.list.forEach(({ a, ok }) => {
          const it = h("span", "det-a" + (ok ? " on" : ""), a.e + " " + a.t);
          it.title = a.d;
          al.appendChild(it);
        });
        box.appendChild(h("b", null, KZ.t("🏆 Жетістіктер")));
        box.appendChild(al);
        box.appendChild(h("b", null, KZ.t("📚 Курстар бойынша үлгерім")));
      }
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
      box.appendChild(h("small", null, KZ.t("Түс: сұр — өтілмеген, 1–3 — алған жұлдыз саны.")));
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
    title.placeholder = KZ.t("Мысалы: Екі санды қос");
    const lang = el("select");
    [["python", "Python"], ["javascript", "JavaScript"]].forEach(([v, l]) => {
      const o = el("option", null, l);
      o.value = v;
      lang.appendChild(o);
    });
    const body = area(4, KZ.t("Тапсырма шарты: оқушы не істеуі керек, экранға не шығуы керек…"));
    body.maxLength = 4000;
    const starter = area(3, KZ.t("Бастапқы код (міндетті емес)"), true);
    const solution = area(4, KZ.t("Өз шешімің: іске қосқанда күтілетін нәтиже мен жол саны автоматты табылады"), true);
    const run = btn("btn small", KZ.t("▶ Шешімді іске қосу"));
    const expected = area(2, KZ.t("Күтілетін нәтиже: оқушы кодының экранға шығарғаны дәл осындай болуы керек"), true);
    expected.required = true;
    const par = el("input");
    par.type = "number";
    par.min = "1";
    par.max = "200";
    par.placeholder = KZ.t("жол саны");
    const hint = el("input");
    hint.maxLength = 500;
    hint.placeholder = KZ.t("Кеңес (міндетті емес)");
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
      if (!solution.value.trim()) return say(KZ.t("Алдымен шешім кодын жаз."), true);
      run.disabled = true;
      say(KZ.t("Іске қосылып жатыр…"));
      try {
        const r = await KZ.play.runOnce(lang.value === "javascript" ? "js" : "python", solution.value);
        if (r.error) say(KZ.t("Шешімде қате бар: ") + (r.error.msg || KZ.t("белгісіз қате")), true);
        else {
          expected.value = KZ.assign.normalize(r.output);
          par.value = String(Math.max(1, Math.min(200, r.lines || 1)));
          say(expected.value ? KZ.t("Дайын: нәтиже мен жол саны толтырылды. Қаласаң, өзгерт.") : KZ.t("Шешім экранға ештеңе шығармады. Тапсырма үшін нәтиже керек."), !expected.value);
        }
      } catch (e) {
        say(KZ.t("Іске қосу сәтсіз: ") + e.message, true);
      }
      run.disabled = false;
    });

    const go = el("button", "btn primary", KZ.t("Жариялау"));
    go.type = "submit";
    f.append(
      lbl(KZ.t("Тақырыбы"), title),
      lbl(KZ.t("Тілі"), lang),
      lbl(KZ.t("Тапсырма шарты"), body),
      lbl(KZ.t("Бастапқы код"), starter),
      lbl(KZ.t("Күтілетін нәтиже (экранға не шығуы керек)"), expected),
      (() => {
        const d = el("details", "asg-auto");
        d.append(h("summary", null, KZ.t("💡 Нәтижені өзім жазбай, шешім кодын іске қосып алам")), lbl(KZ.t("Шешім (сақталмайды, тек нәтижені есептеу үшін)"), solution), run);
        return d;
      })(),
      h("div", "field-row", lbl(KZ.t("Үздік шешім: ең көбі неше жол"), par), lbl(KZ.t("Тапсыру мерзімі"), due)),
      lbl(KZ.t("Кеңес"), hint),
      go,
      msg
    );
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      go.disabled = true;
      try {
        const exp = KZ.assign.normalize(expected.value);
        if (!exp) throw new Error(KZ.t("Күтілетін нәтиже бос болмауы керек."));
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
      h("small", null, (KZ.assign.LANG[a.course] || a.course) + (a.due ? KZ.t(" · мерзімі ") + a.due + (late ? KZ.t(" (өтті)") : "") : "") + " · ✅ " + a.done + "/" + a.total)
    );
    const detail = el("div", "asg-detail");
    detail.hidden = true;
    let loaded = false;
    const res = btn("btn small", KZ.t("Нәтижелер"), async () => {
      detail.hidden = !detail.hidden;
      if (detail.hidden || loaded) return;
      loaded = true;
      detail.textContent = KZ.t("Жүктелуде…");
      try {
        const list = await A.rpc("assignment_results", { aid: a.id });
        detail.textContent = "";
        if (!list.length) detail.appendChild(h("p", "empty-note", KZ.t("Сыныпта оқушы жоқ.")));
        list.forEach((s) =>
          detail.appendChild(h("div", "asg-res" + (s.stars ? " ok" : ""), h("span", null, s.full_name), h("b", null, s.stars ? "⭐".repeat(s.stars) : KZ.t("әлі жоқ"))))
        );
      } catch (e) {
        detail.textContent = "";
        failWith(detail, e);
      }
    });
    const actions = el("div", "u-actions");
    actions.append(
      link("btn small ghost", "#/task/" + a.id, KZ.t("👁 Көру")),
      res,
      confirmBtn("btn small ghost", "🗑", KZ.t("Өшіру?"), async () => {
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
      add(KZ.t("🏆 Қосымша"), (cr.bonus || []).filter((l) => !l.debug));
      add(KZ.t("🐞 Қате тап"), (cr.bonus || []).filter((l) => l.debug));
    };
    course.addEventListener("change", fill);
    fill();
    const due = el("input");
    due.type = "date";
    const msg = el("p", "form-msg");
    msg.hidden = true;
    const go = el("button", "btn primary", KZ.t("Сыныпқа беру"));
    go.type = "submit";
    f.append(
      h("p", "muted", KZ.t("Сайттағы дайын тапсырманы таңда: оқушы оны өз прогресінде орындайды, нәтижесін осы жерден көресің.")),
      lbl(KZ.t("Курс"), course),
      lbl(KZ.t("Тапсырма"), level),
      lbl(KZ.t("Тапсыру мерзімі (міндетті емес)"), due),
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
      h("small", null, (cr ? cr.name : x.course) + KZ.t(" · дайын тапсырма") + (x.due ? KZ.t(" · мерзімі ") + x.due + (late ? KZ.t(" (өтті)") : "") : "") + " · ✅ " + x.done + "/" + x.total)
    );
    const detail = el("div", "asg-detail");
    detail.hidden = true;
    let loaded = false;
    const res = btn("btn small", KZ.t("Нәтижелер"), async () => {
      detail.hidden = !detail.hidden;
      if (detail.hidden || loaded) return;
      loaded = true;
      detail.textContent = KZ.t("Жүктелуде…");
      try {
        const list = await A.rpc("level_results", { lid: x.id });
        detail.textContent = "";
        if (!list.length) detail.appendChild(h("p", "empty-note", KZ.t("Сыныпта оқушы жоқ.")));
        list.forEach((s) =>
          detail.appendChild(h("div", "asg-res" + (s.stars ? " ok" : ""), h("span", null, s.full_name), h("b", null, s.stars ? "⭐".repeat(s.stars) : KZ.t("әлі жоқ"))))
        );
      } catch (e) {
        detail.textContent = "";
        failWith(detail, e);
      }
    });
    const actions = el("div", "u-actions");
    actions.append(
      link("btn small ghost", "#/" + x.course + "/play/" + x.level_id + "/open", KZ.t("👁 Көру")),
      res,
      confirmBtn("btn small ghost", "🗑", KZ.t("Өшіру?"), async () => {
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
      list.textContent = KZ.t("Жүктелуде…");
      try {
        const [items, levels] = await Promise.all([A.rpc("class_assignments", { cid: c.id }), A.rpc("class_levels_list", { cid: c.id })]);
        list.textContent = "";
        if (!items.length && !levels.length) list.appendChild(h("p", "empty-note", KZ.t("Әзірге тапсырма жоқ. «Дайын тапсырма» түймесі ең оңай жол.")));
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
    const addLv = btn("btn small primary", KZ.t("＋ Дайын тапсырма"), () => {
      pick.hidden = !pick.hidden;
      form.hidden = true;
    });
    const add = btn("btn small", KZ.t("✍ Өз тапсырмам"), () => {
      form.hidden = !form.hidden;
      pick.hidden = true;
    });
    wrap.append(h("div", "asg-head", h("b", null, KZ.t("📝 Тапсырмалар")), h("span", "asg-btns", addLv, add)), pick, form, list);
    reload();
    return wrap;
  }

  /* ---------- Сынып статистикасы ---------- */
  const STATUS = { stuck: ["🧱", KZ.t("тұрып қалған")], idle: ["💤", KZ.t("кірмей кеткен")], new: ["🌱", KZ.t("әлі бастамаған")], done: ["🏁", KZ.t("бітірген")], ok: ["✅", KZ.t("жақсы")] };

  /* Апталық есеп: басып шығаруға (не PDF-ке сақтауға) ыңғайлы бет */
  function reportDialog(cls, r) {
    const old = document.getElementById("reportDlg");
    if (old) old.remove();
    const dlg = el("dialog", "report-dlg");
    dlg.id = "reportDlg";
    const MONTHS = [KZ.t("қаңтар"), KZ.t("ақпан"), KZ.t("наурыз"), KZ.t("сәуір"), KZ.t("мамыр"), KZ.t("маусым"), KZ.t("шілде"), KZ.t("тамыз"), KZ.t("қыркүйек"), KZ.t("қазан"), KZ.t("қараша"), KZ.t("желтоқсан")];
    const fmt = (d) => d.getDate() + " " + MONTHS[d.getMonth()];
    const now = new Date();
    const from = new Date(now.getTime() - 6 * 864e5);
    const bar = el("div", "report-bar");
    const printBtn = btn("btn primary", KZ.t("🖨 Басып шығару / PDF"), () => {
      document.body.classList.add("printing-report");
      const done = () => document.body.classList.remove("printing-report");
      window.addEventListener("afterprint", done, { once: true });
      window.print();
      setTimeout(done, 1500);
    });
    const closeBtn = btn("btn ghost", KZ.t("✕ Жабу"), () => {
      dlg.close();
      dlg.remove();
    });
    bar.append(printBtn, closeBtn);
    const sheet = el("div", "report-sheet");
    sheet.appendChild(h("h2", null, KZ.t("Bitlings · апталық есеп")));
    sheet.appendChild(h("p", "report-sub", cls.name + " · " + fmt(from) + " – " + fmt(now) + " " + now.getFullYear()));
    const sum = el("div", "report-sum");
    [[r.n, KZ.t("оқушы")], [r.active7 + "/" + r.n, KZ.t("осы аптада кірген")], [r.weekLevels, KZ.t("аптада өтілген тапсырма")], [r.weekStars, KZ.t("аптада алынған ⭐")], [r.totalStars, KZ.t("жалпы ⭐")]].forEach(([v, l]) =>
      sum.appendChild(h("div", "report-stat", h("b", null, String(v)), h("small", null, l)))
    );
    sheet.appendChild(sum);
    sheet.appendChild(h("h3", null, KZ.t("Оқушылар")));
    const tbl = el("table", "report-table");
    tbl.appendChild(h("thead", null, h("tr", null, ...[KZ.t("Оқушы"), KZ.t("Кірген күн (7)"), KZ.t("Апта ⭐"), KZ.t("Барлығы ⭐"), KZ.t("Жағдайы")].map((t) => h("th", null, t)))));
    const body = el("tbody");
    r.people
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, "kk"))
      .forEach((p) => {
        const [emo] = STATUS[p.status];
        const where = p.cur && ["stuck", "idle"].includes(p.status) ? KZ.t(" (қазір: ") + levelTitle(p.cur.c, p.cur.l) + ")" : "";
        body.appendChild(h("tr", "st-" + p.status, h("td", null, p.name), h("td", null, p.days7 + "/7"), h("td", null, String(p.weekStars)), h("td", null, String(p.stars)), h("td", null, emo + " " + (p.note || KZ.t("жақсы жүріп жатыр")) + where)));
      });
    tbl.appendChild(body);
    sheet.appendChild(tbl);
    sheet.appendChild(h("h3", null, KZ.t("Назар аудару керек")));
    if (!r.attention.length) sheet.appendChild(h("p", null, KZ.t("Тұрып қалған не кірмей кеткен оқушы жоқ.")));
    else sheet.appendChild(h("p", null, r.attention.map((p) => p.name + ": " + p.note).join("; ") + "."));
    if (r.hard.length) {
      sheet.appendChild(h("h3", null, KZ.t("Қиын болған тапсырмалар")));
      const ul = el("ul");
      r.hard.forEach((x) =>
        ul.appendChild(h("li", null, KZ.getCourse(x.c).emoji + " " + levelTitle(x.c, x.l) + ": " + x.done + KZ.nt(x.done, " оқушы өткен, орташа ⭐ ") + x.avg + (x.stuck.length ? KZ.t(", тұрып қалғандар: ") + x.stuck.join(", ") : "")))
      );
      sheet.appendChild(ul);
    }
    sheet.appendChild(h("small", "report-foot", "Bitlings by AbySoft · botakod.vercel.app"));
    dlg.append(bar, sheet);
    document.body.appendChild(dlg);
    if (dlg.showModal) dlg.showModal();
    else dlg.setAttribute("open", "");
  }

  async function statsPanel(c, box) {
    box.textContent = KZ.t("Жүктелуде…");
    try {
      const data = await A.rpc("class_stats", { cid: c.id });
      const courses = KZ.courses.filter((x) => x.status === "ready");
      const r = KZ.classStats.compute(data, courses);
      box.textContent = "";
      if (!r.n) {
        box.appendChild(h("p", "empty-note", KZ.t("Әзірге оқушы жоқ.")));
        return;
      }
      const chips = el("div", "chips-row");
      [["👥 " + r.n + KZ.nt(r.n, " оқушы")], [KZ.t("🔥 Осы аптада кірген: ") + r.active7 + "/" + r.n], [KZ.t("⭐ Барлығы: ") + r.totalStars], [KZ.t("⚠ Назар керек: ") + r.attention.length]].forEach(([t]) => chips.appendChild(h("span", "mini has", t)));
      box.appendChild(chips);
      box.appendChild(btn("btn small", KZ.t("🖨 Апталық есеп"), () => reportDialog(c, r)));

      box.appendChild(h("h4", "st-h", KZ.t("⚠ Назар аудару керек")));
      if (!r.attention.length) box.appendChild(h("p", "empty-note", KZ.t("Бәрі жақсы: тұрып қалған не кірмей кеткен оқушы жоқ 🎉")));
      r.attention.forEach((p) => {
        const [emo] = STATUS[p.status];
        const where = p.cur ? KZ.t(" · қазір: ") + KZ.getCourse(p.cur.c).emoji + " " + levelTitle(p.cur.c, p.cur.l) : "";
        box.appendChild(h("div", "st-row " + p.status, h("b", null, emo + " " + p.name), h("small", null, p.note + where)));
      });

      box.appendChild(h("h4", "st-h", KZ.t("🧗 Қиын тапсырмалар")));
      if (!r.hard.length) box.appendChild(h("p", "empty-note", KZ.t("Әзірге қиын болған тапсырма байқалмайды.")));
      r.hard.forEach((x) => {
        const course = KZ.getCourse(x.c);
        const parts = [x.done + KZ.nt(x.done, " оқушы өткен"), KZ.t("орташа ⭐ ") + x.avg];
        if (x.stuck.length) parts.push(KZ.t("тұрып қалғандар: ") + x.stuck.join(", "));
        box.appendChild(h("div", "st-row", h("b", null, course.emoji + " " + levelTitle(x.c, x.l)), h("small", null, parts.join(" · "))));
      });

      box.appendChild(h("h4", "st-h", KZ.t("📅 Белсенділік (соңғы 7 күн)")));
      r.people.forEach((p) => {
        const dots = el("span", "st-dots");
        for (let i = 0; i < 7; i++) dots.appendChild(h("i", i < p.days7 ? "on" : ""));
        box.appendChild(h("div", "st-act", h("span", null, p.name), dots, h("small", null, p.days7 + "/7 · ⭐ " + p.stars)));
      });
      box.appendChild(h("small", "st-note", KZ.t("«Тұрып қалған» — соңғы күндері кіріп жүр, бірақ 3 күннен бері жаңа жұлдыз алмаған оқушы. «Қиын тапсырма» — орташа жұлдызы төмен не оқушылар қазір тұрған тапсырма.")));
    } catch (e) {
      box.textContent = "";
      failWith(box, e);
    }
  }

  async function classCard(root, c) {
    const card = el("section", "card cls-card");
    const top = el("div", "cls-top");
    top.appendChild(h("div", null, h("b", "cls-name", c.name), h("small", null, c.students + KZ.nt(c.students, " оқушы") + (c.mine ? "" : " · " + c.teacher))));
    const code = h("button", "code-box", c.code);
    code.type = "button";
    code.title = KZ.t("Көшіру");
    code.addEventListener("click", () => {
      if (navigator.clipboard) navigator.clipboard.writeText(c.code).catch(() => {});
      code.textContent = KZ.t("✔ көшірілді");
      setTimeout(() => (code.textContent = c.code), 1200);
    });
    top.appendChild(code);
    card.appendChild(top);

    const body = el("div", "cls-body");
    body.hidden = true;
    let loaded = false;
    const open = btn("btn small", KZ.t("Оқушыларды көру"), async () => {
      body.hidden = !body.hidden;
      open.textContent = body.hidden ? KZ.t("Оқушыларды көру") : KZ.t("Жасыру");
      if (loaded || body.hidden) return;
      loaded = true;
      await renderStudents();
    });
    async function renderStudents() {
      body.textContent = KZ.t("Жүктелуде…");
      try {
        const list = await A.rpc("class_overview", { cid: c.id });
        body.textContent = "";
        if (!list.length) body.appendChild(h("p", "empty-note", KZ.t("Әзірге оқушы жоқ. Кодты оқушыларға бер: ") + c.code));
        const detail = el("div", "detail");
        list.forEach((s) => {
          const row = el("div", "stu-row");
          const main = h("button", "stu-main", h("b", null, s.full_name), h("small", null, ago(s.last_seen)), courseSummary(s.courses), h("span", "stu-stars", "⭐ " + s.stars));
          main.type = "button";
          main.addEventListener("click", () => studentDetail(detail, s.id));
          row.append(main, confirmBtn("btn small ghost", "✕", KZ.t("Шығару?"), async () => {
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
    const statsBtn = btn("btn small", KZ.t("📊 Статистика"), async () => {
      statsBox.hidden = !statsBox.hidden;
      statsBtn.textContent = statsBox.hidden ? KZ.t("📊 Статистика") : KZ.t("📊 Жасыру");
      if (!statsBox.hidden) await statsPanel(c, statsBox);
    });
    const ratingBox = el("div", "cls-body");
    ratingBox.hidden = true;
    const ratingBtn = btn("btn small", KZ.t("🏆 Рейтинг"), async () => {
      ratingBox.hidden = !ratingBox.hidden;
      ratingBtn.textContent = ratingBox.hidden ? KZ.t("🏆 Рейтинг") : KZ.t("🏆 Жасыру");
      if (ratingBox.hidden) return;
      ratingBox.textContent = "";
      const sw = el("label", "rating-switch");
      const cb = el("input");
      cb.type = "checkbox";
      cb.checked = !!c.rating;
      const note = h("small", null, "");
      const setNote = () => (note.textContent = c.rating ? KZ.t("Оқушылар рейтингті көреді.") : KZ.t("Қазір рейтинг тек саған көрінеді, оқушыларға жасырын."));
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
      sw.append(cb, h("span", null, KZ.t(" Оқушыларға көрсету")));
      const list = el("div");
      ratingBox.append(sw, note, list);
      await ratingPanel(c.id, list);
    });
    const actions = el("div", "cls-actions");
    actions.appendChild(open);
    actions.appendChild(statsBtn);
    actions.appendChild(ratingBtn);
    actions.appendChild(confirmBtn("btn small ghost", KZ.t("Сыныпты өшіру"), KZ.t("Расымен өшіру?"), async () => {
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
    const page = shell(root, KZ.t("Сыныптарым"), ["#/account", KZ.t("← Кабинет")]);
    if (!A.canTeach()) {
      notice(page, "info", KZ.t("Рұқсат жоқ"), A.profile.status === "pending" ? KZ.t("Мұғалім аккаунтың әлі бекітілмеген.") : KZ.t("Бұл бет тек мұғалімдерге арналған."));
      return;
    }
    const f = el("form", "card inline-form");
    const i = el("input");
    i.placeholder = KZ.t("Жаңа сынып атауы, мысалы: 5А");
    i.required = true;
    i.maxLength = 60;
    const go = el("button", "btn primary", KZ.t("＋ Сынып ашу"));
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
    page.appendChild(h("p", "hint", KZ.t("Сынып кодын оқушыларға бер: олар тіркелгенде не кабинетінде кодты енгізіп қосылады.")));
    const box = el("div", "cls-list");
    page.appendChild(box);
    try {
      const list = await A.rpc("teacher_classes");
      if (!list.length) box.appendChild(h("p", "empty-note", KZ.t("Әзірге сынып жоқ. Жоғарыдан біріншісін аш.")));
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
    const page = shell(root, KZ.t("Басқару панелі"), ["#/account", KZ.t("← Кабинет")]);
    if (!A.isStaff()) {
      notice(page, "bad", KZ.t("Рұқсат жоқ"), KZ.t("Бұл бет тек құрушы мен админдерге арналған."));
      return;
    }
    const isOwner = A.profile.role === "owner";
    try {
      const [st, users] = await Promise.all([A.rpc("admin_stats"), A.rpc("admin_users")]);
      const stats = el("div", "stats");
      [["🎒", st.students, KZ.t("оқушы")], ["👩‍🏫", st.teachers, KZ.t("мұғалім")], ["🏫", st.classes, KZ.t("сынып")], ["⭐", st.stars, KZ.t("жұлдыз")], ["⏳", st.pending, KZ.t("күтуде")]].forEach(([e, n, l]) =>
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
        card.appendChild(h("div", "card-title", KZ.t("⏳ Бекітуді күтіп тұрған мұғалімдер")));
        pend.forEach((u) => {
          card.appendChild(
            h("div", "user-row",
              h("div", "u-info", h("b", null, u.full_name), h("small", null, u.email)),
              h("div", "u-actions",
                btn("btn small primary", KZ.t("Бекіту"), act(() => A.rpc("admin_set_status", { uid: u.id, new_status: "active" }))),
                confirmBtn("btn small ghost", KZ.t("Қабылдамау"), KZ.t("Өшіру?"), act(() => A.rpc("admin_delete_user", { uid: u.id })))))
          );
        });
        page.appendChild(card);
      }

      const card = el("section", "card");
      card.appendChild(h("div", "card-title", KZ.t("Барлық пайдаланушылар (") + users.length + ")"));
      const filters = el("div", "filters");
      const q = el("input");
      q.type = "search";
      q.placeholder = KZ.t("🔍 Аты не email");
      const sel = el("select");
      [["", KZ.t("Барлық рөл")], ["student", KZ.t("Оқушылар")], ["teacher", KZ.t("Мұғалімдер")], ["admin", KZ.t("Админдер")], ["owner", KZ.t("Құрушы")]].forEach(([v, l]) => {
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
              if (u.status === "pending") actions.appendChild(btn("btn small primary", KZ.t("Бекіту"), act(() => A.rpc("admin_set_status", { uid: u.id, new_status: "active" }))));
              else if (u.status === "blocked") actions.appendChild(btn("btn small", KZ.t("Ашу"), act(() => A.rpc("admin_set_status", { uid: u.id, new_status: "active" }))));
              else actions.appendChild(confirmBtn("btn small ghost", KZ.t("Бұғаттау"), KZ.t("Бұғаттау?"), act(() => A.rpc("admin_set_status", { uid: u.id, new_status: "blocked" }))));
              if (isOwner) {
                const rs = el("select", "role-sel");
                [["student", KZ.t("Оқушы")], ["teacher", KZ.t("Мұғалім")], ["admin", KZ.t("Админ")]].forEach(([v, l]) => {
                  const o = el("option", null, l);
                  o.value = v;
                  if (v === u.role) o.selected = true;
                  rs.appendChild(o);
                });
                rs.title = KZ.t("Рөлді өзгерту");
                rs.addEventListener("change", act(() => A.rpc("admin_set_role", { uid: u.id, new_role: rs.value })));
                actions.appendChild(rs);
              }
              if (isOwner || u.role === "student" || u.role === "teacher") actions.appendChild(resetPwButton(u.id, u.full_name));
              actions.appendChild(confirmBtn("btn small ghost", "🗑", KZ.t("Өшіру?"), act(() => A.rpc("admin_delete_user", { uid: u.id }))));
            }
            /* толық үлгерім мен жетістіктер (ашылып-жабылады) */
            const det = el("div", "student-detail admin-detail");
            det.hidden = true;
            const more = btn("btn small", KZ.t("📊 Үлгерімі"), () => {
              det.hidden = !det.hidden;
              more.classList.toggle("on", !det.hidden);
              if (!det.hidden && !det.dataset.loaded) {
                det.dataset.loaded = "1";
                studentDetail(det, u.id);
              }
            });
            actions.prepend(more);
            list.appendChild(
              h("div", "user-row",
                h("div", "u-info",
                  h("b", null, (ROLE_EMOJI[u.role] || "") + " " + u.full_name + (me ? KZ.t(" (мен)") : "")),
                  h("small", null, u.email),
                  h("small", null, A.roleLabel(u.role) + " · " + A.statusLabel(u.status) + " · ⭐ " + u.stars + " · " + ago(u.last_seen))),
                actions)
            );
            list.appendChild(det);
          });
        if (!list.children.length) list.appendChild(h("p", "empty-note", KZ.t("Ештеңе табылмады.")));
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
