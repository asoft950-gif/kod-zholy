/* Ботакод: мұғалімнің тапсырмалары (құру, беру, тексеру көмекшілері) */
(() => {
  "use strict";

  const { el, h } = KZ;

  /* Нәтижені салыстыру алдында: жол соңындағы бос орындар мен шеткі бос жолдар ескерілмейді */
  function normalize(s) {
    return String(s == null ? "" : s)
      .replace(/\r/g, "")
      .split("\n")
      .map((l) => l.replace(/\s+$/, ""))
      .join("\n")
      .trim();
  }

  async function sha256(text) {
    const c = globalThis.crypto;
    if (!c || !c.subtle) throw new Error("Бұл браузерде тексеру жұмыс істемейді. Сайтты https арқылы аш.");
    const buf = await c.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* Мәтінді абзацқа бөлу (HTML-ға қауіпсіз) */
  function bodyHtml(a) {
    const paras = String(a.body || "")
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => "<p>" + esc(p).replace(/\n/g, "<br>") + "</p>");
    const meta = [];
    if (a.class) meta.push("Сынып: " + esc(a.class));
    if (a.due) meta.push("Мерзімі: " + esc(a.due));
    return (paras.length ? paras.join("") : "<p>Тапсырма мәтіні берілмеген.</p>") + (meta.length ? "<p class='tip'>" + meta.join(" · ") + "</p>" : "");
  }

  const LANG = { python: "Python", javascript: "JavaScript" };

  KZ.assign = {
    normalize,
    hash: (text) => sha256(normalize(text)),
    bodyHtml,
    LANG,
    get: (id) => KZ.auth.rpc("get_assignment", { aid: id }),
    submit: (id, stars) => KZ.auth.rpc("submit_assignment", { aid: id, stars_in: stars }),
    mine: () => KZ.auth.rpc("my_assignments"),

    /* Мерзімі өтті ме (күн бойынша) */
    overdue(due) {
      return !!due && due < KZ.activity.today();
    },
  };

  /* Басты бетте: оқушыға берілген, әлі орындалмаған тапсырмалар туралы */
  KZ.assignNotice = function (host) {
    const A = KZ.auth;
    if (!A || !A.enabled) return;
    const run = async () => {
      await A.ready;
      if (!A.isActive() || A.profile.role !== "student") return;
      const [list, lv] = await Promise.all([A.rpc("my_assignments"), A.rpc("my_levels")]);
      const openLv = lv.filter((x) => !Math.max(x.stars || 0, KZ.progress.stars(x.course, x.level_id)));
      const open = list.filter((a) => !a.stars).concat(openLv);
      if (!open.length) return;
      const late = open.filter((a) => KZ.assign.overdue(a.due)).length;
      const card = el("section", "card assign-note");
      card.appendChild(h("div", "an-e", "📝"));
      card.appendChild(h("div", "an-t", h("b", null, "Мұғалім " + open.length + " тапсырма берді"), h("small", null, late ? late + " тапсырманың мерзімі өтіп кеткен" : "Орындап, жұлдыз жина")));
      const a = h("a", "btn primary small", "Ашу");
      a.href = open.length === 1 ? (open[0].level_id ? "#/" + open[0].course + "/play/" + open[0].level_id + "/open" : "#/task/" + open[0].id) : "#/account";
      card.appendChild(a);
      host.appendChild(card);
    };
    run().catch(() => {});
  };
})();
