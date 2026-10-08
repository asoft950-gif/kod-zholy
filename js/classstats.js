/* Ботакод: сынып статистикасы. Таза есептеу функциясы (серверден келген деректер -> мұғалімге керек қорытынды) */
(() => {
  "use strict";
  const DAY = 864e5;

  /* data: { students:[{id,name,last_seen,last_day,days7,days30}], progress:[{u,c,l,s,at}] }, courses: ready курстар */
  function compute(data, courses, now) {
    now = now || Date.now();
    const rows = data.progress || [];
    const byUser = {};
    rows.forEach((r) => ((byUser[r.u] = byUser[r.u] || []).push(r)));
    const lvKey = (c, l) => c + "|" + l;
    const levelStat = {}; // c|l -> { done, sum, stuck: [] }
    const people = (data.students || []).map((s) => {
      const mine = byUser[s.id] || [];
      const stars = mine.reduce((a, r) => a + r.s, 0);
      const seen = [s.last_seen ? Date.parse(s.last_seen) : 0, s.last_day ? Date.parse(s.last_day + "T00:00:00Z") : 0].reduce((a, b) => Math.max(a, b || 0), 0);
      const idle = seen ? Math.floor((now - seen) / DAY) : null; // күн, ештеңе істемеген
      const lastStar = mine.reduce((a, r) => Math.max(a, Date.parse(r.at) || 0), 0);
      const sinceStar = lastStar ? Math.floor((now - lastStar) / DAY) : null;
      mine.forEach((r) => {
        const st = (levelStat[lvKey(r.c, r.l)] = levelStat[lvKey(r.c, r.l)] || { done: 0, sum: 0, stuck: [] });
        st.done++;
        st.sum += r.s;
      });
      // қазір қай жерде тұр: ең соңғы жұлдыз алған курстағы бірінші өтілмеген тапсырма
      let cur = null;
      let finished = false;
      if (mine.length) {
        const lastRow = mine.slice().sort((a, b) => (Date.parse(b.at) || 0) - (Date.parse(a.at) || 0))[0];
        const course = courses.find((c) => c.id === lastRow.c);
        if (course) {
          const got = {};
          mine.filter((r) => r.c === course.id).forEach((r) => (got[r.l] = r.s));
          const next = (course.levels || []).find((l) => !got[l.id]);
          if (next) cur = { c: course.id, l: next.id };
          else finished = true;
        }
      }
      let status = "ok";
      let note = "";
      if (!mine.length) {
        status = "new";
        note = s.days30 > 0 || idle !== null ? "кірген, бірақ әлі тапсырма өтпеген" : "әлі кірмеген";
      } else if (finished) {
        status = "done";
        note = "курсты бітірген";
      } else if (idle !== null && idle >= 5) {
        status = "idle";
        note = idle + " күн кірмеген";
      } else if (Number(s.days7) > 0 && sinceStar !== null && sinceStar >= 3) {
        status = "stuck";
        note = sinceStar + " күн бойы жаңа жұлдыз жоқ, бірақ кіріп жүр";
      }
      if (cur && (status === "stuck" || status === "idle")) {
        const st = (levelStat[lvKey(cur.c, cur.l)] = levelStat[lvKey(cur.c, cur.l)] || { done: 0, sum: 0, stuck: [] });
        st.stuck.push(s.name);
      }
      return { id: s.id, name: s.name, stars, done: mine.length, days7: Number(s.days7) || 0, days30: Number(s.days30) || 0, idle, sinceStar, cur, status, note };
    });
    const hard = [];
    Object.keys(levelStat).forEach((k) => {
      const [c, l] = k.split("|");
      const st = levelStat[k];
      const course = courses.find((x) => x.id === c);
      if (!course || !(course.levels || []).some((x) => x.id === l)) return;
      const avg = st.done ? st.sum / st.done : 0;
      if (st.stuck.length || (st.done >= 2 && avg < 2.4)) hard.push({ c, l, done: st.done, avg: Math.round(avg * 10) / 10, stuck: st.stuck });
    });
    hard.sort((a, b) => b.stuck.length - a.stuck.length || a.avg - b.avg);
    const n = people.length;
    return {
      n,
      active7: people.filter((p) => p.days7 > 0).length,
      totalStars: people.reduce((a, p) => a + p.stars, 0),
      attention: people.filter((p) => ["stuck", "idle", "new"].includes(p.status)),
      hard: hard.slice(0, 6),
      people: people.slice().sort((a, b) => b.days7 - a.days7 || b.stars - a.stars),
    };
  }

  KZ.classStats = { compute };
})();
