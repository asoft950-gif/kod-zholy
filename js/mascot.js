/* Bitlings: Loop Python — дайын 2D анимациялы кейіпкер (кадрлар img/mascot/*.webp, әр кадр 288px, бір қатарда).
   Кадр көрінісі: бастапқы 512px кадрдың (62,80)-(450,468) аймағы, яғни 388x388 бірлік. */
(() => {
  "use strict";
  const CELL = 388; // SVG бірлігі
  const rep = (n, ms) => Array(n).fill(ms);
  const A = {
    idle: { n: 48, d: rep(48, 60) },
    blink: { n: 6, d: [1500, 70, 90, 90, 70, 800] },
    wave: { n: 48, d: rep(48, 50) },
    "walk-down": { n: 24, d: rep(24, 40) },
    "walk-up": { n: 24, d: rep(24, 40) },
    "walk-left": { n: 24, d: rep(24, 40) },
    "walk-right": { n: 24, d: rep(24, 40) },
  };
  Object.values(A).forEach((a) => (a.total = a.d.reduce((x, y) => x + y, 0)));
  const url = (k) => "img/mascot/" + k + ".webp";
  const LIVE = ["idle", "blink", "wave", "walk-down"];
  const reduce = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  const X0 = 62; // кадр аймағының сол жақ шеті SVG координатында
  const Y0 = 80;
  /* SVG ішіне салынатын кадр қабаттары. live=false: тек бірінші кадр (аватар, карта). u — бірегей id */
  function layers(live, embed, u) {
    const img = (k, vis) => `<image class="mz-l" data-a="${k}" href="${k === "idle" && embed ? embed : url(k)}" x="${X0}" y="${Y0}" width="${A[k].n * CELL}" height="${CELL}" preserveAspectRatio="none"${vis ? "" : ' style="display:none"'}/>`;
    return `<clipPath id="${u}mz"><rect x="${X0}" y="${Y0}" width="${CELL}" height="${CELL}"/></clipPath><g clip-path="url(#${u}mz)"${live ? ' data-mz="1"' : ""}>${live ? LIVE.map((k) => img(k, k === "idle")).join("") : img("idle", true)}</g>`;
  }

  /* ---------- кадр қозғалтқышы ---------- */
  const ST = new WeakMap();
  function frameAt(a, t) {
    t %= a.total;
    for (let i = 0; i < a.n; i++) {
      if (t < a.d[i]) return i;
      t -= a.d[i];
    }
    return a.n - 1;
  }
  function tick(now) {
    document.querySelectorAll("[data-mz]").forEach((sv) => {
      const fig = sv.closest(".hero-fig") || sv.ownerSVGElement.parentNode;
      let st = ST.get(sv);
      if (!st) {
        st = { mode: "idle", t0: now, nextBlink: now + 1800 + Math.random() * 2500, nextWave: now + 9000 + Math.random() * 8000, imgs: {} };
        sv.querySelectorAll(".mz-l").forEach((i) => (st.imgs[i.dataset.a] = i));
        ST.set(sv, st);
      }
      const cl = fig.classList;
      let want = cl.contains("walking") ? "walk-down" : cl.contains("waving") || cl.contains("cheer") ? "wave" : null;
      const set = (m) => {
        st.mode = m;
        st.t0 = now;
        Object.keys(st.imgs).forEach((k) => (st.imgs[k].style.display = k === m ? "" : "none"));
      };
      if (cl.contains("calm")) {
        /* тыныш режим: тек көз жыпылықтайды, қол қозғалмайды */
        if (st.mode !== "blink") set("blink");
      } else if (want && st.mode !== want) set(want);
      else if (!want && st.mode !== "idle") {
        const a = A[st.mode];
        if (st.mode.startsWith("walk") || now - st.t0 >= a.total) set("idle");
      } else if (!want && st.mode === "idle") {
        if (now >= st.nextWave && !fig.closest(".no-wave")) {
          set("wave");
          st.nextWave = now + 14000 + Math.random() * 10000;
          st.nextBlink = now + 5000;
        } else if (now >= st.nextBlink) {
          set("blink");
          st.nextBlink = now + 3500 + Math.random() * 3500;
        }
      }
      const a = A[st.mode];
      const f = frameAt(a, now - st.t0);
      if (st.f !== f || st.m !== st.mode) {
        st.f = f;
        st.m = st.mode;
        st.imgs[st.mode].setAttribute("x", String(X0 - f * CELL));
      }
    });
  }
  let timer = null;
  function start() {
    if (timer || reduce()) return;
    timer = setInterval(() => {
      if (!document.hidden) tick(performance.now());
    }, 60);
  }
  start();

  /* ---------- canvas үшін (ойын) ---------- */
  const sheets = {};
  function sheet(k) {
    if (!sheets[k]) {
      const im = new Image();
      sheets[k] = { im, ok: false };
      im.onload = () => (sheets[k].ok = true);
      im.src = url(k);
    }
    return sheets[k];
  }
  /* ctx-ке кадрды сызу: аяқ нүктесі (fx,fy), биіктігі h */
  function draw(ctx, k, t, fx, fy, h) {
    const s = sheet(k);
    if (!s.ok) return false;
    const a = A[k];
    const i = Math.floor(t) % a.n;
    const cs = s.im.naturalWidth / a.n;
    const w = h; // кадр шаршы
    ctx.drawImage(s.im, i * cs, 0, cs, s.im.naturalHeight, fx - w / 2, fy - h * 0.979, w, h);
    return true;
  }
  /* SVG-ны data-URI суретіне айналдыру үшін (куәлік, бөлісу картасы): idle парақты base64 етіп аламыз */
  let embedP = null;
  function embed() {
    if (!embedP)
      embedP = fetch(url("idle"))
        .then((r) => r.blob())
        .then((b) => new Promise((res, rej) => {
          const fr = new FileReader();
          fr.onload = () => res(fr.result);
          fr.onerror = rej;
          fr.readAsDataURL(b);
        }));
    return embedP;
  }

  KZ.mascot = { A, CELL, layers, draw, sheet, embed, url, preload: () => LIVE.concat(["walk-up", "walk-left", "walk-right"]).forEach(sheet) };
})();
