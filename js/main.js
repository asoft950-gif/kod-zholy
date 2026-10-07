/* Код Жолы: бет аралық өту (hash-роутер) */
(() => {
  "use strict";

  const { $ } = KZ;
  const views = {
    home: $("#homeView"),
    course: $("#courseView"),
    lecture: $("#lectureView"),
    play: $("#playView"),
  };

  function show(name, title) {
    Object.keys(views).forEach((k) => (views[k].hidden = k !== name));
    $("#menuBtn").hidden = name !== "play";
    document.title = (title ? title + " · " : "") + "Код Жолы";
    window.scrollTo(0, 0);
  }

  function route() {
    if (KZ.play) KZ.play.leave();
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
    if (parts[1] === "play" && parts[2]) {
      if (course.engine === "python" && KZ.play.open(course.id, parts[2])) return show("play", course.name);
      location.hash = "#/" + course.id;
      return;
    }
    if (parts[1] === "lecture" && parts[2]) {
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
