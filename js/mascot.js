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
  const IMG = {}; // "<outfit|base>-<anim>" -> sheet, "acc-<id>-<view>" -> аксессуар
  const ATT = {}; // outfit -> { anim: [ {id: {x,y,w,h,ax,ay,r,b}} ] }
  const P = {}; // жүктеу уәделері
  let MAN = null;
  const loadImg = (key, src) =>
    (P[key] =
      P[key] ||
      new Promise((res) => {
        const im = new Image();
        im.onload = () => ((IMG[key] = im), res(true));
        im.onerror = () => res(false);
        im.src = src;
      }));
  const baseP = () => Promise.all(Object.keys(ANIMS).map((k) => loadImg("base-" + k, BASE + "/" + k + ".webp")));
  const manP = () =>
    (P.man =
      P.man ||
      fetch(BASE + "/wardrobe.json")
        .then((r) => r.json())
        .then((m) => (MAN = m))
        .catch(() => null));
  const outfitOf = (sel) => (sel && sel.outfit && (MAN ? MAN.outfits[sel.outfit] : true) ? sel.outfit : null);
  const accsOf = (sel) => Object.keys(sel || {}).filter((k) => k !== "outfit").map((k) => sel[k]);
  /* киім мен аксессуарларды жүктеу (қажеттісін ғана) */
  function loadSel(sel) {
    return manP().then(() => {
      if (!MAN) return false;
      const o = outfitOf(sel);
      const jobs = [];
      if (o) {
        Object.keys(ANIMS).forEach((k) => jobs.push(loadImg(o + "-" + k, BASE + "/" + o + "-" + k + ".webp")));
        jobs.push((P["att-" + o] = P["att-" + o] || fetch(BASE + "/att-" + o + ".json").then((r) => r.json()).then((j) => ((ATT[o] = j), true)).catch(() => false)));
      } else if (!P["att-street"]) jobs.push((P["att-street"] = fetch(BASE + "/att-street.json").then((r) => r.json()).then((j) => ((ATT.street = j), true)).catch(() => false)));
      accsOf(sel).forEach((id) => ["front", "side", "back"].forEach((v) => jobs.push(loadImg("acc-" + id + "-" + v, BASE + "/acc-" + id + "-" + v + ".webp"))));
      return Promise.all(jobs).then(() => true);
    });
  }
  function ready(sel) {
    return Promise.all([baseP(), loadSel(sel)]).then(() => true);
  }
  const reduce = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const keyOf = (sel) => JSON.stringify(sel || {});

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
  /* қолмен түзету: { id: { front|side|back: [dx (ені үлесі), dy (биіктік үлесі), масштаб] } } */
  const ADJ = {
    cap: { front: [0, 0.2, 1], side: [0.04, 0.25, 1], back: [0, 0.2, 1] },
    beanie: { front: [0, 0.12, 1], side: [0.03, 0.15, 1], back: [0, 0.12, 1] },
    "wizard-hat": { front: [0, 0.12, 1], side: [0.03, 0.12, 1], back: [0, 0.12, 1] },
    crown: { front: [0, 0.22, 1], side: [-0.1, 0.22, 1], back: [0, 0.28, 1] },
    "space-helmet": { side: [-0.1, 0, 1.25] },
    headphones: { front: [0, -0.03, 0.95], side: [0.02, 0.08, 1.1] },
    glasses: { side: [0.2, 0, 1] },
    backpack: { side: [-0.25, -0.05, 1.3] },
    wings: { side: [0.02, -0.05, 1.4] },
    scarf: { front: [0, -0.01, 0.97], side: [0, -0.1, 1.05], back: [0, -0.1, 1.05] },
  };

  /* аксессуар қабаты: слот қайталанбайды, дулыға көз/құлақпен сыймайды */
  function resolve(ids) {
    const sel = [],
      slots = new Set();
    for (const id of ids) {
      const a = MAN && MAN.accessories[id];
      if (!a || slots.has(a.slot) || a.ex.some((x) => slots.has(x)) || sel.some((x) => MAN.accessories[x].ex.includes(a.slot))) continue;
      sel.push(id);
      slots.add(a.slot);
    }
    return sel;
  }
  /* кадр (dx,dy) бұрышынан size×size өлшемде: киім + аксессуарлар */
  function blit(g, sel, anim, f, dx, dy, size) {
    if (!ANIMS[anim]) anim = "idle";
    const o = outfitOf(sel);
    let im = o && IMG[o + "-" + anim];
    const dressed = !!im;
    if (!im) im = IMG["base-" + anim];
    if (!im) return false;
    const fw = im.naturalWidth / COLS,
      k = size / FW;
    const att = ATT[o || "street"];
    const pl = dressed || (att && !o) ? att && att[anim] && att[anim][f] : null;
    const accs = pl ? resolve(accsOf(sel)) : [];
    const view = anim === "walk-up" ? "back" : anim === "walk-right" || anim === "walk-left" ? "side" : "front";
    const paint = (id) => {
      const fit = pl[id],
        ai = IMG["acc-" + id + "-" + view];
      if (!fit || !ai) return;
      g.save();
      if (anim === "walk-left") {
        g.translate(512, 0);
        g.scale(-1, 1);
      }
      const ad = (ADJ[id] && ADJ[id][view]) || [0, 0, 1];
      const w = fit.w * ad[2],
        h = fit.h * ad[2];
      g.translate(fit.x + ad[0] * fit.w, fit.y + ad[1] * fit.h);
      g.rotate(fit.r || 0);
      g.drawImage(ai, -fit.ax * w, -fit.ay * h, w, h);
      g.restore();
    };
    g.save();
    g.translate(dx, dy);
    g.scale(k, k);
    accs.forEach((id) => pl[id] && pl[id].b && paint(id));
    g.drawImage(im, (f % COLS) * fw, Math.floor(f / COLS) * fw, fw, fw, 0, 0, 512, 512);
    accs.forEach((id) => pl[id] && !pl[id].b && paint(id));
    g.restore();
    return true;
  }

  /* HTML белгілеу: <canvas>. sel — { слот: lw-id } */
  function markup(sel, o) {
    const px = (o && o.px) || 300;
    return `<canvas class="mz" width="${px}" height="${px}" data-s='${keyOf(sel)}'${o && o.live ? ' data-live="1"' : ""}${o && o.crop ? ' data-crop="1"' : ""}></canvas>`;
  }

  /* ---------- сызу ---------- */
  const CROP = { x: 140, y: 80, w: 250 }; // бас аймағы 512 кадрда
  function paint(cv, anim, timeMs) {
    const g = cv.getContext("2d");
    const W = cv.width;
    const sel = JSON.parse(cv.dataset.s || "{}");
    const ks = keyOf(sel);
    if (!P["ld" + ks]) {
      P["ld" + ks] = true;
      loadSel(sel).then(() => refresh());
    }
    g.clearRect(0, 0, W, cv.height);
    if (cv.dataset.crop) {
      const k = W / CROP.w;
      blit(g, sel, "idle", 0, -CROP.x * k, -CROP.y * k, 512 * k);
    } else blit(g, sel, anim, frameAt(anim, timeMs), 0, 0, W);
  }
  function refresh() {
    document.querySelectorAll("canvas.mz[data-d]").forEach((c) => delete c.dataset.d);
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
      if (IMG["base-idle"] && !document.hidden) tick(performance.now());
    }, reduce() ? 250 : 33);
  }
  ready().then(start, () => {});
  start();

  /* ---------- ойын үшін: негізгі ctx-ке тікелей. Аяқ нүктесі (fx,fy), size — 512 кадрдың көрінетін өлшемі ---------- */
  function drawAt(ctx, anim, o, fx, fy, size, sel) {
    const k = size / FW;
    return blit(ctx, sel || {}, anim, frameOf(anim, o), fx - AX * k, fy - AY * k, size);
  }
  /* куәлік/бөлісу картасы: жеке canvas */
  function snapshot(sel, px) {
    return ready(sel).then(() => {
      const cv = document.createElement("canvas");
      cv.width = cv.height = px;
      blit(cv.getContext("2d"), sel || {}, "idle", 0, 0, 0, px);
      return cv;
    });
  }

  KZ.mascot = { markup, ready, drawAt, snapshot, refresh, _adj: (id, v, a) => ((ADJ[id] = ADJ[id] || {})[v] = a) };
})();
