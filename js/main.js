/* Ботакод: бет аралық өту (hash-роутер) */
(() => {
  "use strict";

  const { $ } = KZ;
  const views = {
    home: $("#homeView"),
    course: $("#courseView"),
    lecture: $("#lectureView"),
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

  window.addEventListener("hashchange", route);
  route();
})();
