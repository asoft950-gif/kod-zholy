/* Ботакод: бет аралық өту (hash-роутер) */
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
  };

  function show(name, title) {
    Object.keys(views).forEach((k) => (views[k].hidden = k !== name));
    $("#menuBtn").hidden = name !== "play";
    document.title = (title ? title + " · " : "") + "Ботакод";
    window.scrollTo(0, 0);
  }

  /* Мұғалім тапсырмасы: #/task/<id> */
  async function openTask(id) {
    const mine = location.hash;
    show("cab", "Тапсырма");
    views.cab.textContent = "Тапсырма жүктелуде…";
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
      const box = KZ.h("div", "page narrow", KZ.h("section", "card notice bad", KZ.h("h2", null, "🙈 Тапсырма ашылмады"), KZ.h("p", null, e.message)));
      const back = KZ.h("a", "back", "← Кабинет");
      back.href = "#/account";
      box.prepend(back);
      views.cab.appendChild(box);
    }
  }

  let gated = false;
  function route() {
    if (KZ.play) KZ.play.leave();
    if (KZ.web) KZ.web.leave();
    const parts = decodeURIComponent(location.hash.replace(/^#\/?/, ""))
      .split("/")
      .filter(Boolean);
    KZ.updateTotal();

    if (parts.length === 0) {
      KZ.views.home(views.home);
      return show("home");
    }
    if (parts[0] === "task" && parts[1]) {
      openTask(parts[1]);
      return;
    }
    /* Курстар, лекциялар, тапсырмалар және жетістіктер тек тіркелген/кірген пайдаланушыға (аккаунттар қосулы болса) */
    const needLogin = parts[0] === "achievements" || parts[0] === "certificate" || !!KZ.getCourse(parts[0]);
    if (needLogin && KZ.auth && KZ.auth.enabled && !KZ.auth.profile) {
      if (!KZ.auth.settled) {
        views.cab.textContent = "Жүктелуде…";
        KZ.auth.ready.then(route);
        return show("cab", "Ботакод");
      }
      KZ.cabinet.gate(views.cab, location.hash);
      gated = true;
      return show("cab", "Кіру керек");
    }
    gated = false;
    if (parts[0] === "certificate" && parts[1]) {
      KZ.certPage(views.cab, parts[1]);
      return show("cab", "Сертификат");
    }
    if (parts[0] === "algo") {
      KZ.algoPage(views.cab, parts[1]);
      return show("cab", "Алгоритм көрінісі");
    }
    if (parts[0] === "achievements") {
      KZ.achievementsPage(views.cab);
      return show("cab", "Жетістіктер");
    }
    if (["login", "account", "teacher", "admin"].includes(parts[0])) {
      const titles = { login: "Кіру", account: "Кабинет", teacher: "Сыныптар", admin: "Басқару" };
      show("cab", titles[parts[0]]);
      KZ.cabinet[parts[0]](views.cab, parts[1]);
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
    if (parts[1] === "play" && parts[2]) {
      if (!guard(parts[2])) {
        location.hash = "#/" + course.id + "/tasks";
        return;
      }
      if ((course.engine === "python" || course.engine === "js") && KZ.play.open(course.id, parts[2])) return show("play", course.name);
      if (course.engine === "web" && KZ.web && KZ.web.open(course.id, parts[2])) return show("web", course.name);
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
    $("#accountLabel").textContent = p ? (p.full_name || p.email).split(" ")[0] : "Кіру";
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
        navigator.serviceWorker.register("sw.js").catch((e) => console.warn("sw:", e.message));
      } catch (e) {
        console.warn("sw:", e.message); // кукиге тыйым салынған не жеке режим
      }
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
