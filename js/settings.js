/* Ботакод: баптаулар (қараңғы режим, қаріп өлшемі, дыбыс) және дыбыстар.
   <head>-те жүктеледі, сондықтан тақырып пен өлшем бет салынбай тұрып қолданылады. */
(() => {
  "use strict";

  const K = { theme: "kodzholy.theme", fs: "kodzholy.fs", sound: "kodzholy.sound" };
  const read = (k, d) => {
    try {
      const v = localStorage.getItem(k);
      return v == null ? d : v;
    } catch (e) {
      return d;
    }
  };
  const write = (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch (e) {}
  };

  const FS = [0.9, 1, 1.12, 1.25];
  const mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  const S = (window.KZS = {});

  S.theme = () => read(K.theme, "auto"); // auto | light | dark
  S.fs = () => {
    const i = parseInt(read(K.fs, "1"), 10);
    return i >= 0 && i < FS.length ? i : 1;
  };
  S.sound = () => read(K.sound, "on") !== "off";
  S.dark = () => (S.theme() === "dark" ? true : S.theme() === "light" ? false : !!(mq && mq.matches));

  S.apply = () => {
    const root = document.documentElement;
    const dark = S.dark();
    root.dataset.theme = dark ? "dark" : "light";
    root.style.setProperty("--fs", String(FS[S.fs()]));
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#2a2540" : "#ffd23f");
    S.onChange.forEach((f) => {
      try {
        f();
      } catch (e) {}
    });
  };
  S.onChange = [];
  S.setTheme = (v) => (write(K.theme, v), S.apply());
  S.setFs = (i) => (write(K.fs, String(Math.max(0, Math.min(FS.length - 1, i)))), S.apply());
  S.setSound = (on) => {
    write(K.sound, on ? "on" : "off");
    if (on) S.beep("click");
  };
  S.apply();
  if (mq && mq.addEventListener) mq.addEventListener("change", () => S.theme() === "auto" && S.apply());

  /* ---------- Дыбыстар (WebAudio, файлсыз) ---------- */
  let ctx = null;
  function audio() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
    } catch (e) {
      return null;
    }
    return ctx;
  }
  function tone(c, t0, freq, dur, type, vol, slideTo) {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }
  const SOUNDS = {
    click: (c, t) => tone(c, t, 660, 0.06, "triangle", 0.08),
    move: (c, t) => tone(c, t, 300, 0.07, "square", 0.05, 380),
    turn: (c, t) => tone(c, t, 480, 0.08, "triangle", 0.07, 620),
    star: (c, t) => {
      tone(c, t, 784, 0.1, "sine", 0.12);
      tone(c, t + 0.09, 1175, 0.16, "sine", 0.12);
    },
    crash: (c, t) => tone(c, t, 180, 0.28, "sawtooth", 0.12, 60),
    win: (c, t) => [523, 659, 784, 1047].forEach((f, i) => tone(c, t + i * 0.1, f, 0.18, "triangle", 0.12)),
    error: (c, t) => {
      tone(c, t, 220, 0.14, "square", 0.07);
      tone(c, t + 0.14, 165, 0.2, "square", 0.07);
    },
    swap: (c, t) => tone(c, t, 420, 0.07, "triangle", 0.08, 560),
    tick: (c, t) => tone(c, t, 900, 0.03, "square", 0.04),
  };
  S.beep = (name) => {
    if (!S.sound() || !SOUNDS[name]) return;
    const c = audio();
    if (!c) return;
    try {
      if (c.state === "suspended") c.resume();
      SOUNDS[name](c, c.currentTime + 0.001);
    } catch (e) {}
  };

  /* ---------- Баптау терезесі ---------- */
  function buildUi() {
    const top = document.querySelector(".top");
    if (!top || document.getElementById("setBtn")) return;
    const btn = document.createElement("button");
    btn.id = "setBtn";
    btn.type = "button";
    btn.className = "btn small set-btn";
    btn.title = "Баптаулар";
    btn.setAttribute("aria-label", "Баптаулар");
    btn.textContent = "⚙";
    top.insertBefore(btn, document.getElementById("streakBtn"));

    const dlg = document.createElement("dialog");
    dlg.id = "setDlg";
    dlg.className = "menu set-dlg";
    dlg.innerHTML =
      '<div class="menu-head"><b>Баптаулар</b><button class="btn small ghost" type="button" data-close>✕</button></div>' +
      '<div class="set-body">' +
      '<div class="set-row"><span>Көрініс</span><div class="seg" data-k="theme">' +
      '<button type="button" data-v="auto">Авто</button><button type="button" data-v="light">☀ Жарық</button><button type="button" data-v="dark">🌙 Қараңғы</button></div></div>' +
      '<div class="set-row"><span>Мәтін өлшемі</span><div class="seg" data-k="fs">' +
      '<button type="button" data-v="0">A−</button><button type="button" data-v="1">A</button><button type="button" data-v="2">A+</button><button type="button" data-v="3">A++</button></div></div>' +
      '<div class="set-row"><span>Дыбыс</span><div class="seg" data-k="sound">' +
      '<button type="button" data-v="on">🔊 Қосулы</button><button type="button" data-v="off">🔇 Өшірулі</button></div></div>' +
      '<div class="set-row off-row" hidden><span>Офлайн</span><div class="off-box"><button type="button" class="btn small" id="offBtn">⬇ Интернетсіз жұмысқа жүктеу</button><small id="offMsg"></small></div></div>' +
      "</div>";
    document.body.appendChild(dlg);

    const mark = () => {
      const cur = { theme: S.theme(), fs: String(S.fs()), sound: S.sound() ? "on" : "off" };
      dlg.querySelectorAll(".seg").forEach((seg) => {
        seg.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.v === cur[seg.dataset.k]));
      });
    };
    dlg.addEventListener("click", (e) => {
      if (e.target === dlg || e.target.closest("[data-close]")) return dlg.close();
      const b = e.target.closest(".seg button");
      if (!b) return;
      const k = b.parentNode.dataset.k;
      if (k === "theme") S.setTheme(b.dataset.v);
      else if (k === "fs") S.setFs(parseInt(b.dataset.v, 10));
      else if (k === "sound") S.setSound(b.dataset.v === "on");
      mark();
    });
    /* Офлайн жүктеу (js/offline.js) */
    const offRow = dlg.querySelector(".off-row");
    const offBtn = dlg.querySelector("#offBtn");
    const offMsg = dlg.querySelector("#offMsg");
    const offShow = async () => {
      const O = window.KZ && KZ.offline;
      if (!O || !O.supported()) return;
      offRow.hidden = false;
      let g = [];
      try {
        g = await O.check();
      } catch (e) {}
      const all = g.length && g.every((x) => x.ok);
      offMsg.textContent = all ? "✔ Python, JavaScript және SQL дайын: интернетсіз де жұмыс істейді." : "Python, JavaScript және SQL файлдарын алдын ала сақтайды (шамамен 15 МБ). Wi-Fi-да басқан жөн.";
      offBtn.textContent = all ? "↻ Қайта жүктеу" : "⬇ Интернетсіз жұмысқа жүктеу";
    };
    offBtn.addEventListener("click", async () => {
      offBtn.disabled = true;
      try {
        const r = await KZ.offline.prepare((d, t) => (offMsg.textContent = "Жүктелуде… " + d + "/" + t));
        offMsg.textContent = r.ok ? "✔ Дайын! Енді интернетсіз де жұмыс істейді." : "Кейбір файл жүктелмеді: " + r.groups.filter((x) => !x.ok).map((x) => x.name).join(", ") + ". Желіні тексеріп қайталап көр.";
      } catch (e) {
        offMsg.textContent = e.message;
      }
      offBtn.disabled = false;
    });
    btn.addEventListener("click", () => {
      offShow();
      mark();
      if (dlg.showModal) dlg.showModal();
      else dlg.setAttribute("open", "");
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", buildUi);
  else buildUi();
})();
