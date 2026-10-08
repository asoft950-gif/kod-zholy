/* Ботакод: курсты бітіргенде сертификат (сурет ретінде жүктеп алуға / басып шығаруға болады) */
(() => {
  "use strict";

  const { el, h } = KZ;
  const NAME_KEY = "kodzholy.certname";

  /* Курстың негізгі тапсырмалары (қосымша емес) толық орындалса, сертификат ашылады */
  function status(c) {
    const list = c.levels || [];
    const done = list.filter((l) => KZ.progress.stars(c.id, l.id) > 0).length;
    let stars = 0;
    list.forEach((l) => (stars += KZ.progress.stars(c.id, l.id)));
    return { done, total: list.length, stars, max: list.length * 3, ok: list.length > 0 && done === list.length };
  }

  const pad = (n) => String(n).padStart(2, "0");
  function dateStr(d) {
    return pad(d.getDate()) + "." + pad(d.getMonth() + 1) + "." + d.getFullYear();
  }
  /* Қысқа код: аты + курс + күн бойынша */
  function codeOf(text) {
    let x = 5381;
    for (let i = 0; i < text.length; i++) x = ((x << 5) + x + text.charCodeAt(i)) >>> 0;
    return "BK-" + x.toString(36).toUpperCase().padStart(6, "0").slice(0, 6);
  }

  function robotImage() {
    return new Promise((resolve) => {
      const svg = KZ.ROBOT_SVG.indexOf("xmlns") > -1 ? KZ.ROBOT_SVG : KZ.ROBOT_SVG.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    });
  }

  function fit(ctx, text, maxW, size, weight, family) {
    let s = size;
    do {
      ctx.font = weight + " " + s + "px " + family;
      s -= 2;
    } while (ctx.measureText(text).width > maxW && s > 20);
  }

  async function draw(canvas, c, name, st, date) {
    const W = 1600;
    const H = 1130;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    const FAM = '"Nunito", system-ui, -apple-system, "Segoe UI", sans-serif';
    try {
      await document.fonts.load("800 40px Nunito");
    } catch (e) {}
    const INK = "#1f1d36";
    ctx.fillStyle = "#fffaf0";
    ctx.fillRect(0, 0, W, H);
    // нүктелі фон
    ctx.fillStyle = "rgba(31,29,54,0.06)";
    for (let y = 30; y < H; y += 28) for (let x = 30; x < W; x += 28) ctx.fillRect(x, y, 3, 3);
    // жақтау
    ctx.lineWidth = 14;
    ctx.strokeStyle = INK;
    ctx.strokeRect(50, 50, W - 100, H - 100);
    ctx.lineWidth = 5;
    ctx.strokeStyle = c.color || "#6c5ce7";
    ctx.strokeRect(84, 84, W - 168, H - 168);
    // жоғарғы сары жолақ
    ctx.fillStyle = "#ffd23f";
    ctx.fillRect(84, 84, W - 168, 150);
    ctx.fillStyle = INK;
    ctx.fillRect(84, 234, W - 168, 6);

    const robot = await robotImage();
    if (robot) ctx.drawImage(robot, 130, 104, 110, 110);
    ctx.textAlign = "left";
    ctx.fillStyle = INK;
    ctx.font = "800 64px " + FAM;
    ctx.fillText("Ботакод", 262, 170);
    ctx.font = "700 28px " + FAM;
    ctx.fillText("Кодты көзбен көріп үйрен", 264, 208);

    ctx.textAlign = "center";
    ctx.font = "800 96px " + FAM;
    ctx.fillStyle = INK;
    ctx.fillText("СЕРТИФИКАТ", W / 2, 400);
    ctx.font = "700 34px " + FAM;
    ctx.fillStyle = "#6a6784";
    ctx.fillText("Бұл сертификат берілді", W / 2, 475);

    ctx.fillStyle = c.color || "#6c5ce7";
    fit(ctx, name, W - 380, 110, 800, FAM);
    ctx.fillText(name, W / 2, 610);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(300, 640);
    ctx.lineTo(W - 300, 640);
    ctx.stroke();

    ctx.fillStyle = INK;
    ctx.font = "700 40px " + FAM;
    ctx.fillText(c.emoji + " " + c.name + " курсының барлық тапсырмасын орындағаны үшін", W / 2, 730);
    ctx.font = "800 44px " + FAM;
    ctx.fillText(st.done + " тапсырма · ⭐ " + st.stars + " / " + st.max + " жұлдыз", W / 2, 805);

    ctx.font = "700 30px " + FAM;
    ctx.textAlign = "left";
    ctx.fillStyle = "#6a6784";
    ctx.fillText("Күні: " + dateStr(date), 150, H - 150);
    ctx.textAlign = "right";
    ctx.fillText("№ " + codeOf(name + "|" + c.id + "|" + dateStr(date)), W - 150, H - 150);
    ctx.textAlign = "center";
    ctx.fillText("🤖 Жарайсың! Кодтай бер!", W / 2, H - 150);
  }

  /* Бет: #/certificate/<курс> */
  KZ.certPage = function (root, courseId) {
    root.textContent = "";
    const c = KZ.getCourse(courseId);
    const page = el("div", "page narrow");
    page.appendChild(h("a", "back", "← Жетістіктер"));
    page.firstChild.href = "#/achievements";
    root.appendChild(page);
    if (!c || c.status !== "ready") {
      page.appendChild(h("p", "empty-note", "Мұндай курс жоқ."));
      return;
    }
    const st = status(c);
    page.appendChild(h("h1", "section-title", "🎓 Сертификат: " + c.name));
    if (!st.ok) {
      page.appendChild(
        h("section", "card", h("p", null, "Сертификат алу үшін " + c.name + " курсының барлық " + st.total + " тапсырмасын орында. Қазір: " + st.done + " / " + st.total + "."), (() => {
          const a = h("a", "btn primary", "Тапсырмаларға өту →");
          a.href = "#/" + c.id + "/tasks";
          return a;
        })())
      );
      return;
    }

    const stored = (() => {
      try {
        return localStorage.getItem(NAME_KEY) || "";
      } catch (e) {
        return "";
      }
    })();
    const prof = KZ.auth && KZ.auth.profile && KZ.auth.profile.full_name;
    const card = el("section", "card cert-card");
    const label = el("label", "cert-name");
    label.append("Аты-жөніңді жаз: ");
    const input = el("input");
    input.type = "text";
    input.maxLength = 40;
    input.placeholder = "Мысалы: Алия Нұрланқызы";
    input.value = stored || prof || "";
    label.appendChild(input);
    const canvas = el("canvas", "cert-canvas");
    const row = el("div", "row");
    const dl = el("button", "btn primary", "⬇ Суретті жүктеу");
    const pr = el("button", "btn", "🖨 Басып шығару");
    dl.type = pr.type = "button";
    row.append(dl, pr);
    const note = el("small", "muted", "Суретті жүктеп, телефонға сақтап не мұғалімге жібере аласың.");
    card.append(label, canvas, row, note);
    page.appendChild(card);

    const date = new Date();
    let timer = null;
    const render = () => {
      const name = input.value.trim() || "Оқушының аты-жөні";
      draw(canvas, c, name, st, date);
    };
    input.addEventListener("input", () => {
      try {
        localStorage.setItem(NAME_KEY, input.value);
      } catch (e) {}
      clearTimeout(timer);
      timer = setTimeout(render, 150);
    });
    dl.addEventListener("click", () => {
      if (!input.value.trim()) {
        input.focus();
        return;
      }
      canvas.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "botakod-sertifikat-" + c.id + ".png";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          URL.revokeObjectURL(a.href);
          a.remove();
        }, 500);
      }, "image/png");
    });
    pr.addEventListener("click", () => {
      if (!input.value.trim()) {
        input.focus();
        return;
      }
      document.body.classList.add("printing-cert");
      const off = () => {
        document.body.classList.remove("printing-cert");
        window.removeEventListener("afterprint", off);
      };
      window.addEventListener("afterprint", off);
      window.print();
    });
    render();
  };

  /* Жетістіктер бетіндегі бөлім */
  KZ.certSection = function () {
    const box = el("section", "card cert-list");
    box.appendChild(h("h2", "section-title", "🎓 Сертификаттар"));
    KZ.courses
      .filter((c) => c.status === "ready")
      .forEach((c) => {
        const st = status(c);
        const row = el("div", "cert-row" + (st.ok ? " on" : ""));
        row.appendChild(h("span", "cert-e", st.ok ? "🎓" : "🔒"));
        row.appendChild(h("div", "cert-t", h("b", null, c.name), h("small", null, st.ok ? "Курс аяқталды!" : st.done + " / " + st.total + " тапсырма")));
        const a = h("a", "btn small" + (st.ok ? " primary" : ""), st.ok ? "Алу" : "Көру");
        a.href = "#/certificate/" + c.id;
        row.appendChild(a);
        box.appendChild(row);
      });
    return box;
  };

  /* Курс бетіндегі жарнама (аяқталса) */
  KZ.certBanner = function (c) {
    if (!status(c).ok) return null;
    const a = h("a", "card cert-banner", h("span", "cert-e", "🎓"), h("div", null, h("b", null, "Құттықтаймыз! Курс аяқталды"), h("small", null, "Сертификатыңды ал")));
    a.href = "#/certificate/" + c.id;
    return a;
  };

  KZ.cert = { status };
})();
