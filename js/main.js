/* Bitlings: бет аралық өту (hash-роутер) */
(() => {
  "use strict";

  const { $ } = KZ;
  const views = {
    home: $("#homeView"),
    course: $("#courseView"),
    lecture: $("#lectureView"),
    cab: $("#cabView"),
    play: $("#playView"),
    web: $("#webView"),
    sql: $("#sqlView"),
  };

  function show(name, title) {
    Object.keys(views).forEach((k) => (views[k].hidden = k !== name));
    $("#menuBtn").hidden = name !== "play";
    document.title = (title ? title + " · " : "") + "Bitlings";
    window.scrollTo(0, 0);
  }

  /* Мұғалім тапсырмасы: #/task/<id> */
  async function openTask(id) {
    const mine = location.hash;
    show("cab", KZ.t("Тапсырма"));
    views.cab.textContent = KZ.t("Тапсырма жүктелуде…");
    if (!KZ.auth || !KZ.auth.enabled) {
      location.hash = "#/login";
      return;
    }
    await KZ.auth.ready;
    if (!KZ.auth.profile) {
      location.hash = "#/login";
      return;
    }
    try {
      const a = await KZ.assign.get(id);
      if (location.hash !== mine) return;
      if (KZ.play.openAssignment(a)) {
        show("play", a.title);
        $("#menuBtn").hidden = true;
      } else location.hash = "#/account";
    } catch (e) {
      if (location.hash !== mine) return;
      views.cab.textContent = "";
      const box = KZ.h("div", "page narrow", KZ.h("section", "card notice bad", KZ.h("h2", null, KZ.t("🙈 Тапсырма ашылмады")), KZ.h("p", null, e.message)));
      const back = KZ.h("a", "back", KZ.t("← Кабинет"));
      back.href = "#/account";
      box.prepend(back);
      views.cab.appendChild(box);
    }
  }

  let gated = false;
  function route() {
    if (KZ.play) KZ.play.leave();
    if (KZ.web) KZ.web.leave();
    if (KZ.sql) KZ.sql.leave();
    if (KZ.gameLeave) KZ.gameLeave();
    const parts = decodeURIComponent(location.hash.replace(/^#\/?/, ""))
      .split("/")
      .filter(Boolean);
    KZ.updateTotal();

    const A_ = KZ.auth;
    const accounts = !!(A_ && A_.enabled);
    if (parts[0] === "welcome" || (parts.length === 0 && accounts && !A_.profile)) {
      if (accounts && !A_.settled && parts[0] !== "welcome") {
        views.cab.textContent = KZ.t("Жүктелуде…");
        A_.ready.then(route);
        return show("cab", "Bitlings");
      }
      KZ.landingPage(views.cab);
      return show("cab", KZ.t("Кодты көзбен көр"));
    }
    if (parts.length === 0) {
      KZ.views.home(views.home);
      return show("home");
    }
    if (parts[0] === "task" && parts[1]) {
      openTask(parts[1]);
      return;
    }
    /* Курстар, лекциялар, тапсырмалар және жетістіктер тек тіркелген/кірген пайдаланушыға (аккаунттар қосулы болса) */
    const needLogin = parts[0] === "achievements" || parts[0] === "hero" || parts[0] === "review" || parts[0] === "game" || parts[0] === "u" || parts[0] === "certificate" || !!KZ.getCourse(parts[0]);
    if (needLogin && KZ.auth && KZ.auth.enabled && !KZ.auth.profile) {
      if (!KZ.auth.settled) {
        views.cab.textContent = KZ.t("Жүктелуде…");
        KZ.auth.ready.then(route);
        return show("cab", "Bitlings");
      }
      KZ.cabinet.gate(views.cab, location.hash);
      gated = true;
      return show("cab", KZ.t("Кіру керек"));
    }
    gated = false;
    if (parts[0] === "certificate" && parts[1]) {
      KZ.certPage(views.cab, parts[1]);
      return show("cab", KZ.t("Сертификат"));
    }
    if (parts[0] === "algo") {
      KZ.algoPage(views.cab, parts[1]);
      return show("cab", KZ.t("Алгоритм көрінісі"));
    }
    if (parts[0] === "review") {
      KZ.reviewPage(views.cab, parts[1] === "mistakes" ? { all: true } : parts[1] && parts[2] ? { c: parts[1], t: parts[2] } : null);
      return show("cab", KZ.t("Қайталау"));
    }
    if (parts[0] === "u" && parts[1]) {
      KZ.profilePage(views.cab, parts[1]);
      return show("cab", KZ.t("Профиль"));
    }
    if (parts[0] === "game") {
      KZ.gamePage(views.cab, parts[1]);
      return show("cab", KZ.t("Ойын"));
    }
    if (parts[0] === "hero") {
      KZ.heroPage(views.cab);
      return show("cab", KZ.t("Менің кейіпкерім"));
    }
    if (parts[0] === "achievements") {
      KZ.achievementsPage(views.cab);
      return show("cab", KZ.t("Жетістіктер"));
    }
    if (["login", "account", "teacher", "admin"].includes(parts[0])) {
      const titles = { login: KZ.t("Кіру"), account: KZ.t("Кабинет"), teacher: KZ.t("Сыныптар"), admin: KZ.t("Басқару") };
      show("cab", titles[parts[0]]);
      KZ.cabinet[parts[0]](views.cab, parts[1], parts[2]);
      return;
    }
    const course = KZ.getCourse(parts[0]);
    if (!course) {
      location.hash = "#/";
      return;
    }
    const guard = (levelId) => {
      const f = parts[2] !== "free" && parts[3] !== "open" && KZ.findLevel(course, levelId); // /open: мұғалім берген тапсырма құлыпсыз ашылады
      return !f || f.kind === "bonus" || KZ.progress.tasksUnlocked(course, KZ.topicOf(f.level));
    };
    if (parts[1] === "play" && parts[2] === "free" && parts[3] === "s" && parts[4]) {
      /* бөлісілген код: Еркін алаңға өз кодымен ашылады */
      try {
        const code = decodeURIComponent(escape(atob(parts[4].replace(/-/g, "+").replace(/_/g, "/"))));
        if (code.length <= 3000) KZ.store.setSession("kodzholy.sandbox", { code });
      } catch (e) {
        /* бүлінген сілтеме: бос алаң ашылады */
      }
    }
    if (parts[1] === "play" && parts[2]) {
      if (!guard(parts[2])) {
        location.hash = "#/" + course.id + "/tasks";
        return;
      }
      if ((course.engine === "python" || course.engine === "js" || course.engine === "kt") && KZ.play.open(course.id, parts[2])) return show("play", course.name);
      if (course.engine === "web" && KZ.web && KZ.web.open(course.id, parts[2])) return show("web", course.name);
      if (course.engine === "sql" && KZ.sql && KZ.sql.open(course.id, parts[2])) return show("sql", course.name);
      location.hash = "#/" + course.id;
      return;
    }
    if (parts[1] === "lecture" && parts[2]) {
      const lec = (course.lectures || []).find((l) => l.id === parts[2]);
      if (lec && !KZ.progress.topicUnlocked(course, lec.topic)) {
        location.hash = "#/" + course.id + "/lectures";
        return;
      }
      if (KZ.views.lecture(views.lecture, course, parts[2])) return show("lecture", course.name);
      location.hash = "#/" + course.id + "/lectures";
      return;
    }
    KZ.views.course(views.course, course, parts[1]);
    show("course", course.name);
  }

  /* Аккаунт батырмасы және кіргеннен кейін беттерді жаңарту */
  const accBtn = $("#accountBtn");
  function paintAccount() {
    if (!KZ.auth || !KZ.auth.enabled) {
      accBtn.hidden = true;
      return;
    }
    accBtn.hidden = false;
    const p = KZ.auth.profile;
    accBtn.href = p ? "#/account" : "#/login";
    $("#accountLabel").textContent = p ? (p.full_name || p.email).split(" ")[0] : KZ.t("Кіру");
  }
  if (KZ.auth) {
    paintAccount();
    KZ.auth.onChange(() => {
      paintAccount();
      const h = location.hash.replace(/^#\/?/, "");
      const parts = h.split("/").filter(Boolean);
      const staticPage = gated || parts.length === 0 || (KZ.getCourse(parts[0]) && !["play", "lecture"].includes(parts[1]));
      if (staticPage) route();
    });
  }

  window.addEventListener("hashchange", route);
  /* Басқа құрылғыдан келген деректер түскенде басты бет/кабинет жаңарады (жазып отырған болсаң тиіспейді) */
  window.addEventListener("kz-synced", () => {
    const a = document.activeElement;
    if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return;
    const p = location.hash.replace(/^#\/?/, "").split("/")[0];
    if (p === "" || p === "account") route();
  });
  route();

  /* Офлайн жұмыс және «Телефонға орнату» */
  const standalone = (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
  let swOk = false;
  try {
    swOk = "serviceWorker" in navigator && /^https?:$/.test(location.protocol);
  } catch (e) {}
  if (swOk) {
    window.addEventListener("load", () => {
      try {
        navigator.serviceWorker
          .register("sw.js")
          .then((reg) => {
            /* Жаңа нұсқаны өзі тексереді: ашылғанда, 5 минут сайын және бетке қайта оралғанда */
            const check = () => reg.update().catch(() => {});
            setInterval(check, 5 * 60 * 1000);
            document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && check());
            window.addEventListener("online", check);
          })
          .catch((e) => console.warn("sw:", e.message));
      } catch (e) {
        console.warn("sw:", e.message); // кукиге тыйым салынған не жеке режим
      }
    });
  }
  /* Жаңа нұсқа белсенді болғанда бетті өзі жаңартады. Оқушы код жазып отырса, жұмысы жоғалмасын деп
     келесі бетке өткенде жаңартады және кішкентай хабар көрсетеді. */
  if (swOk) {
    let hadController = !!navigator.serviceWorker.controller;
    let pending = false;
    const editing = () => !!document.querySelector("#playView:not([hidden]), #webView:not([hidden]), #sqlView:not([hidden])");
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!hadController) {
        hadController = true; // алғашқы орнату: жаңартудың қажеті жоқ
        return;
      }
      if (pending) return;
      if (!editing()) return location.reload();
      pending = true;
      if (KZ.toast) KZ.toast("✨", KZ.t("Сайттың жаңа нұсқасы дайын"), KZ.t("Келесі бетке өткенде өзі жаңарады"));
      window.addEventListener("hashchange", () => location.reload(), { once: true });
    });
  }
  let installEvent = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    installEvent = e;
    if (!standalone) $("#installRow").hidden = false;
  });
  window.addEventListener("appinstalled", () => ($("#installRow").hidden = true));
  $("#installBtn").addEventListener("click", async () => {
    if (!installEvent) return;
    installEvent.prompt();
    await installEvent.userChoice.catch(() => {});
    installEvent = null;
    $("#installRow").hidden = true;
  });
  if (!standalone && /iphone|ipad|ipod/i.test(navigator.userAgent)) $("#iosTip").hidden = false;
})();
