/* Bitlings: тіл (қазақша / орысша).
   Бастапқы тіл — қазақша: бүкіл мәтін код ішінде қазақша жазылған. Орысша режимде
   KZ.t("қазақша мәтін") сөздіктен (js/i18n/ru.js) орысша нұсқасын қайтарады,
   ал курстар мазмұны (js/courses/ru/*) қазақша файлдардың орнына жүктеледі.
   Тіл ауысқанда бет қайта жүктеледі. <head>-те жүктеледі. */
(() => {
  "use strict";
  globalThis.KZ = globalThis.KZ || {};
  const KEY = "kodzholy.lang";
  const LANGS = ["kk", "ru"];
  let lang = "kk";
  try {
    const q = /[?&]lang=(kk|ru)\b/.exec(location.search);
    const v = q ? q[1] : localStorage.getItem(KEY);
    if (LANGS.includes(v)) lang = v;
    if (q) localStorage.setItem(KEY, lang);
  } catch (e) {}
  KZ.lang = lang;
  KZ.langs = LANGS;
  KZ.ru = {}; // сөздік: қазақша мәтін → орысша (js/i18n/ru.js толтырады)
  document.documentElement.lang = lang;

  const fill = (s, args) => (args.length ? s.replace(/\{(\d+)\}/g, (m, i) => (args[i] === undefined ? m : args[i])) : s);
  /* Мәтінді аудару: KZ.t("мәтін") */
  KZ.missing = new Set(); // орысшасы жоқ мәтіндер (тексеру үшін)
  KZ.t =
    lang === "ru"
      ? (s) => {
          if (Object.prototype.hasOwnProperty.call(KZ.ru, s)) return KZ.ru[s];
          if (/[\u0400-\u04FF]/.test(s)) KZ.missing.add(s);
          return s;
        }
      : (s) => s;
  /* Айнымалысы бар мәтін: KZ.tt("{0} / {1} тапсырма", a, b) */
  KZ.tt = (s, ...args) => fill(KZ.t(s), args);
  /* Орыс тіліндегі көпше: KZ.pl(5, ["задание", "задания", "заданий"]) */
  KZ.pl = (n, forms) => {
    const a = Math.abs(n) % 100;
    const b = a % 10;
    if (a > 10 && a < 20) return forms[2];
    if (b > 1 && b < 5) return forms[1];
    if (b === 1) return forms[0];
    return forms[2];
  };
  /* Санға қатысты сөз: орысша мән «форма1|форма2|форма5» түрінде жазылады (бос орындар кілттен алынады).
     Қазақшада сөз өзгермейді. */
  KZ.nt = (n, s) => {
    if (lang !== "ru") return s;
    const r = KZ.t(s);
    if (r.indexOf("|") < 0) return r;
    const lead = /^\s*/.exec(s)[0];
    const trail = /\s*$/.exec(s)[0];
    return lead + KZ.pl(n, r.split("|").map((x) => x.trim())) + trail;
  };
  KZ.setLang = (l) => {
    if (!LANGS.includes(l) || l === lang) return;
    try {
      localStorage.setItem(KEY, l);
    } catch (e) {}
    location.reload();
  };

  /* Орысша сөздік файлын бет салынбай тұрып жүктеу */
  if (lang === "ru") document.write('<script src="js/i18n/ru.js"><\/script>');

  /* Беттегі дайын (HTML-дағы) мәтіндерді аудару */
  const ATTRS = ["title", "aria-label", "placeholder", "alt", "data-ph", "content"];
  KZ.translateDom = (root) => {
    if (lang !== "ru") return;
    const w = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    for (let n = w.currentNode; n; n = w.nextNode()) {
      if (n.nodeType === 3) {
        const raw = n.nodeValue;
        const k = raw.trim();
        if (k && Object.prototype.hasOwnProperty.call(KZ.ru, k)) n.nodeValue = raw.replace(k, KZ.ru[k]);
      } else if (n.nodeType === 1 && n.tagName !== "SCRIPT" && n.tagName !== "STYLE") {
        for (const a of ATTRS) {
          if (a === "content" && n.tagName !== "META") continue;
          const v = n.getAttribute(a);
          if (v && Object.prototype.hasOwnProperty.call(KZ.ru, v)) n.setAttribute(a, KZ.ru[v]);
        }
      }
    }
  };
  document.addEventListener("DOMContentLoaded", () => {
    KZ.translateDom(document.head);
    KZ.translateDom(document.body);
    if (lang === "ru" && KZ.ru[document.title]) document.title = KZ.ru[document.title];
    /* ҚАЗ | РУС ауыстырғышы */
    document.querySelectorAll("[data-lang]").forEach((b) => {
      b.classList.toggle("on", b.dataset.lang === lang);
      b.setAttribute("aria-pressed", b.dataset.lang === lang ? "true" : "false");
      b.addEventListener("click", () => KZ.setLang(b.dataset.lang));
    });
  });
})();
