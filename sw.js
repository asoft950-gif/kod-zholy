/* Bitlings: офлайн жұмыс (service worker).
   - Сайттың өз файлдары: алдымен желіден (жаңа нұсқа), желі жоқ болса, кэштен.
   - CDN файлдары (Pyodide, CodeMirror, қаріптер): кэштен, жоқ болса, желіден алып сақтайды.
   - Supabase сұраулары (аккаунт, прогресс) ешқашан кэштелмейді. */
const VERSION = "bitlings-3ae26a5c4e";
const SHELL = [
  "./", "index.html", "style.css", "manifest.webmanifest", "py/runner.py",
  "assets/logo.svg", "assets/favicon.svg", "assets/robot.svg", "assets/cat.svg", "assets/star.svg",
  "assets/icon-192.png", "assets/icon-512.png", "assets/apple-touch-icon.png",
  "js/core.js", "js/vendor/show-hint.js", "js/hints.js", "js/main.js", "js/views.js", "js/play.js", "js/tryinline.js", "js/jsrunner.js", "js/ktrunner.js", "js/web.js", "js/webdoc.js",
  "js/streak.js", "js/offline.js", "js/hero.js", "js/landing.js", "js/algo.js", "js/review.js", "js/review-content.js", "js/cert.js", "js/classstats.js", "js/settings.js", "js/config.js", "js/auth.js", "js/assign.js", "js/cabinet.js",
  "js/courses/python.js", "js/courses/python-content.js", "js/courses/html.js", "js/courses/html-content.js",
  "js/courses/css.js", "js/courses/css-content.js", "js/courses/debug-content.js", "js/sqlcore.js", "js/sql.js", "js/courses/sql.js", "js/courses/sql-content.js", "js/courses/projects.js", "js/courses/projects-content.js", "js/courses/javascript.js", "js/courses/javascript-content.js", "js/courses/kotlin.js", "js/courses/kotlin-content.js",
  "js/i18n.js", "js/i18n/ru.js", "js/courses/ru/css-content.js", "js/courses/ru/css.js", "js/courses/ru/debug-content.js", "js/courses/ru/html-content.js", "js/courses/ru/html.js", "js/courses/ru/javascript-content.js", "js/courses/ru/javascript.js", "js/courses/ru/kotlin-content.js", "js/courses/ru/kotlin.js", "js/courses/ru/projects-content.js", "js/courses/ru/projects.js", "js/courses/ru/python-content.js", "js/courses/ru/python.js", "js/courses/ru/review-content.js", "js/courses/ru/sql-content.js", "js/courses/ru/sql.js",
];
const CDN = /^https:\/\/(cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//;

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(VERSION).then((c) => Promise.allSettled(SHELL.map((u) => c.add(new Request(u, { cache: "reload" })))))
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(req) {
  const cache = await caches.open(VERSION);
  try {
    const res = await fetch(req, { cache: "no-cache" }); // браузердің HTTP кэшін айналып өтіп, әрқашан соңғы нұсқа
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = (await cache.match(req)) || (req.mode === "navigate" ? await cache.match("index.html") : null);
    if (hit) return hit;
    throw err;
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(VERSION);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
  return res;
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (/\.supabase\.(co|in)$/.test(url.hostname)) return;
  if (url.origin === self.location.origin) {
    if (url.search.includes("code=")) return; // кіру сілтемесі (PKCE) кэштелмейді
    e.respondWith(networkFirst(req));
  } else if (CDN.test(req.url)) {
    e.respondWith(cacheFirst(req));
  }
});
