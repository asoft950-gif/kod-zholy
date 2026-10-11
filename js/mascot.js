/* Bitlings: Битлинг (Loop Python v3) — тұтас кадрлы 2D кейіпкер. Суреттер img/bitling/<анимация>.webp (sprite-sheet, 4 баған, 512×512 кадр).
   Сурет <canvas class="mz"> ретінде орналасады; бір ортақ қозғалтқыш барлық көрінетін canvas-ты сызады. */
(() => {
  "use strict";
  const BASE = "img/bitling";
  const ANIMS = {
    "walk-right": { n: 8, d: 110, loop: true },
    "walk-left": { n: 8, d: 110, loop: true },
    "walk-down": { n: 8, d: 110, loop: true },
    "walk-up": { n: 8, d: 110, loop: true },
    idle: { n: 12, d: 200, loop: true },
    wave: { n: 12, d: 140, loop: false },
    blink: { n: 6, d: [1500, 70, 90, 90, 70, 800], loop: true },
  };
  const FW = 512,
    COLS = 4,
    AX = 256,
    AY = 452;
  const IMG = {};
  let readyP = null;
  function ready() {
    if (!readyP)
      readyP = Promise.all(
        Object.keys(ANIMS).map(
          (k) =>
            new Promise((res, rej) => {
              const im = new Image();
              im.onload = () => ((IMG[k] = im), res());
              im.onerror = rej;
              im.src = BASE + "/" + k + ".webp";
            }),
        ),
      ).then(() => true);
    return readyP;
  }
  const reduce = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function frameAt(anim, t) {
    const a = ANIMS[anim] || ANIMS.idle;
    if (Array.isArray(a.d)) {
      const tot = a.d.reduce((s, x) => s + x, 0);
      let m = a.loop ? ((t % tot) + tot) % tot : Math.min(Math.max(t, 0), tot - 1);
      for (let i = 0; i < a.n; i++) {
        if (m < a.d[i]) return i;
        m -= a.d[i];
      }
      return a.n - 1;
    }
    const i = Math.floor(Math.max(t, 0) / a.d);
    return a.loop ? i % a.n : Math.min(i, a.n - 1);
  }
  /* o: {timeMs} | {phase 0..1} */
  function frameOf(anim, o) {
    const a = ANIMS[anim] || ANIMS.idle;
    if (o && o.phase != null) return Math.min(a.n - 1, Math.floor((((o.phase % 1) + 1) % 1) * a.n));
    return frameAt(anim, (o && o.timeMs) || 0);
  }
  /* кадрды (dx,dy) бұрышынан size×size өлшемде сызу */
  function blit(g, anim, f, dx, dy, size) {
    const im = IMG[ANIMS[anim] ? anim : "idle"];
    if (!im) return false;
    g.drawImage(im, (f % COLS) * FW, Math.floor(f / COLS) * FW, FW, FW, dx, dy, size, size);
    return true;
  }

  /* HTML белгілеу: <canvas>. sel — ескі гардероб үшін, қолданылмайды */
  function markup(sel, o) {
    const px = (o && o.px) || 300;
    return `<canvas class="mz" width="${px}" height="${px}"${o && o.live ? ' data-live="1"' : ""}${o && o.crop ? ' data-crop="1"' : ""}></canvas>`;
  }

  /* ---------- сызу ---------- */
  const CROP = { x: 140, y: 80, w: 250 }; // бас аймағы 512 кадрда
  function paint(cv, anim, timeMs) {
    const g = cv.getContext("2d");
    const W = cv.width;
    g.clearRect(0, 0, W, cv.height);
    if (cv.dataset.crop) {
      const k = W / CROP.w;
      blit(g, "idle", 0, -CROP.x * k, -CROP.y * k, 512 * k);
    } else blit(g, anim, frameAt(anim, timeMs), 0, 0, W);
  }
  const ST = new WeakMap();
  const visible = (cv) => {
    const r = cv.getBoundingClientRect();
    return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && r.width > 0;
  };
  function tick(now) {
    document.querySelectorAll("canvas.mz").forEach((cv) => {
      if (!cv.dataset.live) {
        if (!cv.dataset.d) {
          paint(cv, "idle", 0);
          cv.dataset.d = "1";
        }
        return;
      }
      if (!visible(cv)) return;
      const fig = cv.closest(".hero-fig") || cv.parentNode;
      const cl = fig.classList;
      let st = ST.get(cv);
      if (!st) {
        st = { mode: "idle", t0: now, nextBlink: now + 1800 + Math.random() * 2500, nextWave: now + 9000 + Math.random() * 8000 };
        ST.set(cv, st);
      }
      const set = (m) => ((st.mode = m), (st.t0 = now));
      const want = cl.contains("calm") ? "blinkloop" : cl.contains("walking") ? "walk-down" : cl.contains("waving") || cl.contains("cheer") ? "wave" : null;
      if (want) {
        if (st.mode !== want) set(want);
      } else if (st.mode === "wave" && now - st.t0 >= 2400) set("idle");
      else if (st.mode === "blink" && now - st.t0 >= 330) set("idle");
      else if (st.mode === "blinkloop" || st.mode === "walk-down") set("idle");
      else if (st.mode === "idle") {
        if (now >= st.nextWave && !cl.contains("no-wave")) {
          set("wave");
          st.nextWave = now + 14000 + Math.random() * 10000;
          st.nextBlink = now + 5000;
        } else if (now >= st.nextBlink) {
          set("blink");
          st.nextBlink = now + 3500 + Math.random() * 3500;
        }
      }
      const el = now - st.t0;
      let anim = st.mode;
      let t = el;
      if (anim === "idle") t = now;
      else if (anim === "blink") t = 1500 + el; // тек жұму кадрлары (1500мс ұстап тұру жоқ)
      else if (anim === "walk-down" || anim === "wave") t = el;
      else if (anim === "blinkloop") (anim = "blink"), (t = el);
      paint(cv, anim, t);
    });
  }
  let timer = null;
  function start() {
    if (timer) return;
    timer = setInterval(() => {
      if (IMG.idle && !document.hidden) tick(performance.now());
    }, reduce() ? 250 : 33);
  }
  ready().then(start, () => {});
  start();

  /* ---------- ойын үшін: негізгі ctx-ке тікелей. Аяқ нүктесі (fx,fy), size — 512 кадрдың көрінетін өлшемі ---------- */
  function drawAt(ctx, anim, o, fx, fy, size) {
    const k = size / FW;
    return blit(ctx, anim, frameOf(anim, o), fx - AX * k, fy - AY * k, size);
  }
  /* куәлік/бөлісу картасы: жеке canvas */
  function snapshot(sel, px) {
    return ready().then(() => {
      const cv = document.createElement("canvas");
      cv.width = cv.height = px;
      blit(cv.getContext("2d"), "idle", 0, 0, 0, px);
      return cv;
    });
  }

  KZ.mascot = { markup, ready, drawAt, snapshot, refresh: () => document.querySelectorAll("canvas.mz[data-d]").forEach((c) => delete c.dataset.d) };
})();
