/* Bitlings: Битлинг (Loop Python) — модульді 2D кейіпкер. Суреттер img/wardrobe/*.webp, қозғалыс js/loopwardrobe.js (Canvas 2D).
   Сурет <canvas class="mz"> ретінде орналасады; бір ортақ қозғалтқыш барлық көрінетін canvas-ты сызады. */
(() => {
  "use strict";
  const BASE = "img/wardrobe";
  let LW = null;
  let readyP = null;
  function ready() {
    if (!readyP)
      readyP = fetch(BASE + "/wardrobe.json")
        .then((r) => r.json())
        .then((m) => LoopWardrobe.load(BASE, m))
        .then((l) => ((LW = l), l));
    return readyP;
  }
  const reduce = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* sel: { слот: lw-id } -> LoopWardrobe параметрлері */
  function opts(sel) {
    const o = { outfit: sel.outfit || "base", accessories: [] };
    Object.keys(sel).forEach((k) => {
      if (k !== "outfit") o.accessories.push(sel[k]);
    });
    return o;
  }

  /* HTML белгілеу: <canvas> */
  function markup(sel, o) {
    const px = (o && o.px) || 300;
    return `<canvas class="mz" width="${px}" height="${px}" data-s='${JSON.stringify(sel || {})}'${o && o.live ? ' data-live="1"' : ""}${o && o.crop ? ' data-crop="1"' : ""}></canvas>`;
  }

  /* ---------- сызу ---------- */
  const CROP = { x: 140, y: 40, w: 234 }; // бас аймағы 512 кадрда
  function paint(cv, anim, timeMs) {
    const g = cv.getContext("2d");
    const W = cv.width;
    const base = opts(JSON.parse(cv.dataset.s || "{}"));
    if (cv.dataset.crop) {
      const k = W / CROP.w;
      LW.draw(g, Object.assign(base, { animation: "idle", phase: 0, size: 512 * k, x: -CROP.x * k, y: -CROP.y * k }));
    } else LW.draw(g, Object.assign(base, { animation: anim, timeMs, size: W, x: 0, y: 0 }));
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
      else if (anim === "blinkloop") (anim = "blink"), (t = el);
      paint(cv, anim, t);
    });
  }
  let timer = null;
  function start() {
    if (timer) return;
    timer = setInterval(() => {
      if (LW && !document.hidden) tick(performance.now());
    }, reduce() ? 250 : 33);
  }
  ready().then(start, () => {});
  start();

  /* ---------- ойын үшін: негізгі ctx-ке тікелей. Аяқ нүктесі (fx,fy), size — 512 кадрдың көрінетін өлшемі ---------- */
  function drawAt(ctx, anim, o, fx, fy, size, sel) {
    if (!LW) return false;
    const k = size / 512;
    try {
      LW.draw(ctx, Object.assign(opts(sel || {}), o, { animation: anim, size, x: fx - 256 * k, y: fy - 460 * k, clear: false }));
    } catch (e) {
      return false;
    }
    return true;
  }
  /* куәлік/бөлісу картасы: жеке canvas */
  function snapshot(sel, px) {
    return ready().then(() => {
      const cv = document.createElement("canvas");
      cv.width = cv.height = px;
      LW.draw(cv.getContext("2d"), Object.assign(opts(sel || {}), { animation: "idle", phase: 0, size: px, x: 0, y: 0 }));
      return cv;
    });
  }

  KZ.mascot = { markup, ready, drawAt, snapshot, refresh: () => document.querySelectorAll("canvas.mz[data-d]").forEach((c) => delete c.dataset.d) };
})();
