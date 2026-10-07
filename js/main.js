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
      const f = parts[2] !== "free" && KZ.findLevel(course, levelId);
      return !f || f.kind === "bonus" || KZ.progress.topicUnlocked(course, KZ.topicOf(f.level));
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
      const staticPage = parts.length === 0 || (KZ.getCourse(parts[0]) && !["play", "lecture"].includes(parts[1]));
      if (staticPage) route();
    });
  }

  window.addEventListener("hashchange", route);
  route();
})();
