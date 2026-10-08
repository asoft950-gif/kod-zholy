/* Ботакод: басты мәзір, курс беті, лекциялар */
(() => {
  "use strict";

  const { el, h } = KZ;
  const A = (cls, href, ...kids) => {
    const a = h("a", cls, ...kids);
    a.href = href;
    return a;
  };
  const starsText = (n) => "⭐".repeat(n) + "☆".repeat(3 - n);

  /* Басты беттегі кейіпкер: басса, гардероб ашылады */
  function heroBot() {
    if (!KZ.hero) return h("div", "hero-bot", "🤖");
    const a = h("a", "hero-bot hero-link", KZ.hero.node());
    a.href = "#/hero";
    a.title = "Менің кейіпкерім";
    a.setAttribute("aria-label", "Менің кейіпкерім");
    return a;
  }

  function bar(pct) {
    const b = el("div", "bar");
    const f = el("div", "bar-fill");
    f.style.width = Math.max(0, Math.min(100, pct)) + "%";
    b.appendChild(f);
    return b;
  }

  /* ---------- Басты мәзір ---------- */
  function courseCard(c) {
    const ready = c.status === "ready";
    const total = KZ.allLevels(c).length;
    const done = KZ.progress.done(c);
    const a = A("course-card" + (ready ? "" : " soon"), "#/" + c.id);
    a.style.setProperty("--c", c.color);
    a.appendChild(h("div", "cc-icon", c.emoji));
    a.appendChild(h("div", "cc-name", c.name));
    a.appendChild(h("div", "cc-tag", c.tagline));
    if (ready) {
      a.appendChild(bar(total ? (done / total) * 100 : 0));
      a.appendChild(h("div", "cc-meta", done + " / " + total + " тапсырма · ⭐ " + KZ.progress.courseStars(c.id)));
    } else {
      a.appendChild(h("span", "soon-badge", "Жақында"));
    }
    return a;
  }

  function home(root) {
    root.textContent = "";
    const page = el("div", "page");

    let target = null;
    const last = KZ.last.get();
    if (last) {
      const c = KZ.getCourse(last.course);
      const f = c && KZ.findLevel(c, last.level);
      if (f) target = { course: c, level: f.level };
    }
    const started = !!target;
    if (!target) {
      const c = KZ.getCourse("python");
      target = { course: c, level: c.levels[0] };
    }

    if (KZ.auth && KZ.auth.enabled && !KZ.auth.profile) {
      page.appendChild(
        h("section", "card guest-note",
          h("b", null, "🔒 Курстарды бастау үшін тіркел не аккаунтыңа кір"),
          h("span", "row", A("btn primary small", "#/login/register", "Тіркелу"), A("btn small", "#/login", "Кіру")))
      );
    }
    page.appendChild(
      h(
        "section",
        "card hero",
        heroBot(),
        h(
          "div",
          "hero-text",
          h("h1", null, "Сәлем! Бүгін не үйренеміз?"),
          h("p", null, "Код жазып, ол қалай жұмыс істейтінін көзбен көр: робот, қораптар және тірі нәтиже."),
          A(
            "btn primary big",
            "#/" + target.course.id + "/play/" + target.level.id,
            (started ? "▶ Жалғастыру: " : "▶ Бастау: ") + target.course.name + " · " + target.level.title
          )
        )
      )
    );

    page.appendChild(KZ.dailyCard());
    const rc = KZ.reviewCard && KZ.reviewCard();
    if (rc) page.appendChild(rc);
    if (KZ.assignNotice) {
      const slot = el("div", "slot"); // мұғалім тапсырмалары кейін жүктелгенде осы жерге түседі
      page.appendChild(slot);
      KZ.assignNotice(slot);
    }

    page.appendChild(h("h2", "section-title", "Курстар"));
    const grid = el("div", "course-grid");
    KZ.courses.forEach((c) => grid.appendChild(courseCard(c)));
    page.appendChild(grid);

    const tile = A("card algo-tile", "#/algo");
    tile.appendChild(h("div", "e", "🎬"));
    tile.appendChild(h("div", null, h("b", null, "Алгоритм көрінісі"), h("small", null, "Сұрыптау, іздеу және рекурсияны қадам-қадамымен көр")));
    page.appendChild(tile);

    page.appendChild(
      h(
        "section",
        "card how",
        h("h2", "section-title", "Қалай жұмыс істейді?"),
        h(
          "div",
          "how-grid",
          h("div", "how-item", h("b", null, "📖 Оқы"), h("span", null, "Қысқа, суретті лекциялар")),
          h("div", "how-item", h("b", null, "🎮 Жаса"), h("span", null, "Тапсырмалар және тірі нәтиже")),
          h("div", "how-item", h("b", null, "🏆 Жеңіс"), h("span", null, "Жұлдыз жина, қосымша тапсырмалар шеш")),
          h("div", "how-item", h("b", null, "📚 Тап"), h("span", null, "Анықтамалықтан керегін тез тап"))
        )
      )
    );
    root.appendChild(page);
  }

  /* ---------- Курс беті ---------- */
  const TABS = [
    ["lectures", "📖 Лекциялар"],
    ["tasks", "🎮 Тапсырмалар"],
    ["bonus", "🏆 Қосымша"],
    ["reference", "📚 Анықтамалық"],
  ];

  function lecturesTab(c, box) {
    if (!c.lectures.length) return box.appendChild(h("p", "empty-note", "Лекциялар әзірге жоқ."));
    c.topics.forEach((t) => {
      const items = c.lectures.filter((l) => l.topic === t.id);
      if (!items.length) return;
      const open = KZ.progress.topicUnlocked(c, t.id);
      box.appendChild(h("h3", "topic-h", (open ? "" : "🔒 ") + t.emoji + " " + t.title));
      if (!open) {
        box.appendChild(h("p", "lock-note", "Алдыңғы тақырыптың барлық тапсырмасын өткенде ашылады."));
        return;
      }
      items.forEach((l) => {
        const read = KZ.read.has(c.id, l.id);
        box.appendChild(
          A(
            "row-link" + (read ? " done" : ""),
            "#/" + c.id + "/lecture/" + l.id,
            h("span", "rl-title", l.title),
            h("span", "rl-meta", l.minutes + " мин"),
            h("span", "rl-check", read ? "✅" : "›")
          )
        );
      });
    });
  }

  function pill(c, l) {
    const n = KZ.progress.stars(c.id, l.id);
    return A(
      "pill" + (n ? " done" : ""),
      "#/" + c.id + "/play/" + l.id,
      h("b", null, l.id),
      h("span", "pill-t", l.title),
      h("small", null, starsText(n))
    );
  }

  function tasksTab(c, box) {
    c.topics.forEach((t) => {
      const items = c.levels.filter((l) => KZ.topicOf(l) === t.id);
      if (!items.length) return;
      const got = items.reduce((a, l) => a + KZ.progress.stars(c.id, l.id), 0);
      const topicOpen = KZ.progress.topicUnlocked(c, t.id);
      const open = KZ.progress.tasksUnlocked(c, t.id);
      const card = el("section", "card topic" + (open ? "" : " locked"));
      card.appendChild(
        h(
          "div",
          "topic-head",
          h("span", "topic-emoji", t.emoji),
          h("div", "topic-info", h("b", null, t.id + " · " + t.title), h("small", null, t.blurb)),
          h("span", "topic-stars", open ? "⭐ " + got + "/" + items.length * 3 : "🔒")
        )
      );
      if (!open && topicOpen) {
        const lec = (c.lectures || []).find((l) => String(l.topic) === t.id);
        card.appendChild(h("p", "lock-note", "Алдымен осы тақырыптың лекциясын оқып, «Оқыдым деп белгіле» батырмасын бас."));
        if (lec) card.appendChild(A("btn primary small", "#/" + c.id + "/lecture/" + lec.id, "📖 Лекцияға өту →"));
        box.appendChild(card);
        return;
      }
      if (!open) {
        const prev = KZ.progress.prevTopic(c, t.id);
        card.appendChild(h("p", "lock-note", "«" + (prev ? prev.title : "Алдыңғы тақырып") + "» тақырыбының барлық тапсырмасын өткенде ашылады."));
        box.appendChild(card);
        return;
      }
      const row = el("div", "pills");
      items.forEach((l) => row.appendChild(pill(c, l)));
      card.appendChild(row);
      box.appendChild(card);
    });
    openAllToggle(c, box);
  }

  function openAllToggle(c, box) {
    const b = el("button", "btn small ghost", KZ.progress.openAll() ? "🔒 Құлыптарды қайта қосу" : "🔓 Барлық тақырыпты ашу (мұғалім үшін)");
    b.type = "button";
    b.addEventListener("click", () => {
      KZ.progress.setOpenAll(!KZ.progress.openAll());
      location.reload();
    });
    box.appendChild(b);
  }

  function bonusTab(c, box) {
    if (!c.bonus.length) return box.appendChild(h("p", "empty-note", "Қосымша тапсырмалар әзірге жоқ."));
    const groups = [
      ["🏆", "Қосымша тапсырмалар", "Күрделірек, ойланып шешетін тапсырмалар", c.bonus.filter((l) => !l.debug)],
      ["🐞", "Қате тап", "Кодта қате бар: тауып түзет. Нағыз бағдарламашы осылай үйренеді", c.bonus.filter((l) => l.debug)],
    ];
    groups.forEach(([emoji, title, sub, list]) => {
      if (!list.length) return;
      const card = el("section", "card topic");
      card.appendChild(h("div", "topic-head", h("span", "topic-emoji", emoji), h("div", "topic-info", h("b", null, title), h("small", null, sub))));
      const row = el("div", "pills");
      list.forEach((l) => row.appendChild(pill(c, l)));
      card.appendChild(row);
      box.appendChild(card);
    });
  }

  function referenceTab(c, box) {
    if (!c.reference.length) return box.appendChild(h("p", "empty-note", "Анықтамалық әзірге бос."));
    const search = el("input", "search");
    search.type = "search";
    search.placeholder = "🔍 Іздеу…";
    search.setAttribute("aria-label", "Анықтамалықтан іздеу");
    box.appendChild(search);
    const list = el("div", "ref-list");
    const items = c.reference.map((r) => {
      const d = el("details", "ref");
      d.appendChild(h("summary", null, r.term));
      const body = el("div", "ref-body");
      body.appendChild(h("p", null, r.text));
      if (r.code) {
        body.appendChild(codeBlock(c, { code: r.code }, true));
      }
      d.appendChild(body);
      list.appendChild(d);
      return { d, hay: (r.term + " " + r.text).toLowerCase() };
    });
    search.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      items.forEach((it) => (it.d.hidden = q !== "" && !it.hay.includes(q)));
    });
    box.appendChild(list);
  }

  function roadmap(c, page) {
    page.appendChild(
      h(
        "section",
        "card soon-card",
        h("h2", null, "🚧 Курс жақында ашылады"),
        h("p", null, "Бұл курс әзірленіп жатыр. Ол мынадай тақырыптардан тұрады:")
      )
    );
    const box = el("div", "roadmap");
    c.topics.forEach((t) => {
      box.appendChild(h("div", "rm-item", h("span", "topic-emoji", t.emoji), h("div", null, h("b", null, t.title), h("small", null, t.blurb))));
    });
    page.appendChild(box);
  }

  function course(root, c, tab) {
    root.textContent = "";
    const page = el("div", "page");
    page.style.setProperty("--c", c.color);
    page.appendChild(A("back", "#/", "← Курстар"));

    const ready = c.status === "ready";
    const total = KZ.allLevels(c).length;
    const done = KZ.progress.done(c);
    const head = el("section", "card course-head");
    head.appendChild(h("div", "cc-icon big", c.emoji));
    const info = h("div", "ch-info", h("h1", null, c.name), h("p", null, c.tagline));
    if (ready) {
      info.appendChild(bar(total ? (done / total) * 100 : 0));
      info.appendChild(h("small", null, done + " / " + total + " тапсырма · ⭐ " + KZ.progress.courseStars(c.id)));
      if (c.engine === "python" || c.engine === "web" || c.engine === "js" || c.engine === "sql") info.appendChild(A("btn small", "#/" + c.id + "/play/free", "🧪 Еркін алаң"));
    }
    head.appendChild(info);
    page.appendChild(head);
    const banner = ready && KZ.certBanner ? KZ.certBanner(c) : null;
    if (banner) page.appendChild(banner);

    if (!ready) {
      roadmap(c, page);
      root.appendChild(page);
      return;
    }

    if (!tab || !TABS.some((t) => t[0] === tab)) tab = done > 0 ? "tasks" : "lectures";
    const tabs = el("nav", "tabs");
    TABS.forEach(([id, label]) => {
      tabs.appendChild(A("tab" + (id === tab ? " active" : ""), "#/" + c.id + "/" + id, label));
    });
    page.appendChild(tabs);

    const box = el("div", "tab-body");
    ({ lectures: lecturesTab, tasks: tasksTab, bonus: bonusTab, reference: referenceTab })[tab](c, box);
    page.appendChild(box);
    root.appendChild(page);
  }

  /* ---------- Лекция ---------- */
  function codeBlock(c, b, withTry) {
    const wrap = el("div", "try");
    const pre = el("pre", "code-block");
    const code = el("code", null, b.code);
    pre.appendChild(code);
    wrap.appendChild(pre);
    if (b.note) wrap.appendChild(h("p", "try-note", b.note));
    if (withTry && (c.engine === "web" || c.engine === "sql")) {
      const btn = el("button", "btn small primary", "▶ Өзің көр");
      btn.type = "button";
      btn.addEventListener("click", () => {
        KZ.store.setSession("kodzholy.sandbox", { code: b.code });
        location.hash = "#/" + c.id + "/play/free";
      });
      wrap.appendChild(btn);
    }
    if (withTry && (c.engine === "python" || c.engine === "js")) {
      const btn = el("button", "btn small primary", "▶ Өзің көр");
      btn.type = "button";
      btn.addEventListener("click", () => {
        KZ.store.setSession("kodzholy.sandbox", { code: b.code, robot: b.robot });
        location.hash = "#/" + c.id + "/play/free";
      });
      wrap.appendChild(btn);
    }
    return wrap;
  }

  function renderBlocks(c, blocks, box) {
    blocks.forEach((b) => {
      switch (b.t) {
        case "h":
          box.appendChild(h("h3", null, b.text));
          break;
        case "p": {
          const p = el("p");
          p.innerHTML = b.html;
          box.appendChild(p);
          break;
        }
        case "list": {
          const ul = el("ul");
          b.items.forEach((it) => {
            const li = el("li");
            li.innerHTML = it;
            ul.appendChild(li);
          });
          box.appendChild(ul);
          break;
        }
        case "code":
          box.appendChild(codeBlock(c, b, false));
          break;
        case "try":
          box.appendChild(codeBlock(c, b, true));
          break;
        case "live": {
          const wrap = el("div", "live");
          const ta = el("textarea", "live-code");
          ta.value = b.code;
          ta.spellcheck = false;
          ta.rows = Math.min(10, b.code.split("\n").length + 1);
          const fr = el("iframe", "live-frame");
          fr.setAttribute("sandbox", "");
          const upd = () => (fr.srcdoc = KZ.buildWebDoc(b.kind || "html", ta.value, b.html, false));
          ta.addEventListener("input", upd);
          upd();
          wrap.appendChild(h("div", "live-label", "✏️ Кодты өзгертіп көр, нәтиже оң жақта жаңарады"));
          const row = el("div", "live-row");
          row.appendChild(ta);
          row.appendChild(fr);
          wrap.appendChild(row);
          box.appendChild(wrap);
          break;
        }
        case "tip":
        case "warn": {
          const d = el("div", "callout " + b.t);
          d.appendChild(h("b", null, b.t === "tip" ? "💡 Кеңес" : "⚠️ Назар аудар"));
          const p = el("p");
          p.innerHTML = b.html;
          d.appendChild(p);
          box.appendChild(d);
          break;
        }
        case "boxes": {
          const wrap = el("div", "demo");
          const row = el("div", "memory");
          b.items.forEach((it) => {
            const card = el("div", "var");
            card.style.setProperty("--c", KZ.colorFor(it.n));
            card.appendChild(h("div", "var-name", it.n));
            card.appendChild(h("div", "var-box", it.v));
            row.appendChild(card);
          });
          wrap.appendChild(row);
          if (b.caption) wrap.appendChild(h("p", "caption", b.caption));
          box.appendChild(wrap);
          break;
        }
        case "arr": {
          const wrap = el("div", "demo");
          const card = el("div", "var");
          card.style.setProperty("--c", KZ.colorFor(b.name));
          card.appendChild(h("div", "var-name", b.name, h("small", null, "list")));
          const row = el("div", "var-cells");
          b.items.forEach((it, k) => {
            row.appendChild(h("div", "var-cell", h("div", "v", it), h("div", "i", String(k))));
          });
          card.appendChild(row);
          wrap.appendChild(card);
          if (b.caption) wrap.appendChild(h("p", "caption", b.caption));
          box.appendChild(wrap);
          break;
        }
        case "board": {
          const wrap = el("div", "demo");
          wrap.appendChild(KZ.makeBoard(b.cfg).root);
          if (b.caption) wrap.appendChild(h("p", "caption", b.caption));
          box.appendChild(wrap);
          break;
        }
        default:
          break;
      }
    });
  }

  function lecture(root, c, lid) {
    const l = c.lectures.find((x) => x.id === lid);
    if (!l) return false;
    root.textContent = "";
    const page = el("div", "page narrow");
    page.style.setProperty("--c", c.color);
    page.appendChild(A("back", "#/" + c.id + "/lectures", "← Лекциялар"));
    const topic = c.topics.find((t) => t.id === l.topic);
    page.appendChild(h("div", "lecture-meta", (topic ? topic.emoji + " " + topic.title + " · " : "") + l.minutes + " мин"));
    page.appendChild(h("h1", "lecture-title", l.title));

    const prose = el("article", "prose card");
    renderBlocks(c, l.blocks, prose);
    page.appendChild(prose);

    const foot = el("div", "lecture-foot");
    const readBtn = el("button", "btn");
    readBtn.type = "button";
    const paint = () => {
      const r = KZ.read.has(c.id, l.id);
      readBtn.textContent = r ? "✅ Оқылды" : "☑ Оқыдым деп белгіле";
      readBtn.classList.toggle("primary", !r);
    };
    paint();
    readBtn.addEventListener("click", () => {
      KZ.read.toggle(c.id, l.id);
      paint();
    });
    foot.appendChild(readBtn);

    const firstTask = c.levels.find((x) => KZ.topicOf(x) === l.topic);
    let taskLink = null;
    if (firstTask) {
      taskLink = A("btn primary", "#/" + c.id + "/play/" + firstTask.id, "🎮 Тапсырмаға өту →");
      foot.appendChild(taskLink);
    }
    const hint = h("p", "lock-note", "Тапсырмаға өту үшін алдымен лекцияны оқып, «Оқыдым деп белгіле» батырмасын бас.");
    const gate = () => {
      const ok = KZ.progress.tasksUnlocked(c, l.topic);
      if (taskLink) taskLink.style.display = ok ? "" : "none";
      hint.style.display = ok || !taskLink ? "none" : "";
    };
    readBtn.addEventListener("click", gate);
    gate();
    const i = c.lectures.findIndex((x) => x.id === l.id);
    if (i < c.lectures.length - 1 && KZ.progress.topicUnlocked(c, c.lectures[i + 1].topic)) {
      foot.appendChild(A("btn", "#/" + c.id + "/lecture/" + c.lectures[i + 1].id, "Келесі лекция →"));
    }
    foot.appendChild(hint);
    page.appendChild(foot);
    root.appendChild(page);
    return true;
  }

  KZ.views = { home, course, lecture };
})();
