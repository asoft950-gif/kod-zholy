/* Код Жолы: HTML/CSS үшін алдын ала көру құжатын құру */
globalThis.KZ = globalThis.KZ || {};

KZ.WEB_BASE =
  "body{font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;margin:12px;line-height:1.4;color:#1f1d36}" +
  "[data-kz-hl]{outline:3px dashed #6c5ce7!important;outline-offset:2px}" +
  "[data-kz-sel]{outline:3px solid #ff6b6b!important;outline-offset:2px}";

/* Әр тегке бастапқы код жолының нөмірін жазады: data-kzl="3" */
KZ.annotateHtml = function (src) {
  const re = /<!--[\s\S]*?-->|<([a-zA-Z][a-zA-Z0-9-]*)/g;
  const skip = new Set(["html", "head", "title", "meta", "link", "style", "script", "base"]);
  let out = "";
  let last = 0;
  let m;
  while ((m = re.exec(src))) {
    if (!m[1] || skip.has(m[1].toLowerCase())) continue;
    const line = src.slice(0, m.index).split("\n").length;
    const end = m.index + m[0].length;
    out += src.slice(last, end) + ' data-kzl="' + line + '"';
    last = end;
  }
  return out + src.slice(last);
};

/* kind: "html" (code = HTML) не "css" (html = берілген HTML, code = CSS) */
KZ.buildWebDoc = function (kind, code, html, annotate) {
  const ann = annotate !== false;
  const base = '<style id="kz-base">' + KZ.WEB_BASE + "</style>";
  if (kind === "css") {
    const body = ann ? KZ.annotateHtml(html || "") : html || "";
    return (
      '<!doctype html><html><head><meta charset="utf-8">' + base +
      '<style id="kz-user">' + code + "</style></head><body>" + body + "</body></html>"
    );
  }
  const src = ann ? KZ.annotateHtml(code) : code;
  if (/<html[\s>]/i.test(src)) {
    if (/<head[\s>]/i.test(src)) return src.replace(/<head([^>]*)>/i, "<head$1>" + base);
    return src.replace(/<html([^>]*)>/i, "<html$1><head>" + base + "</head>");
  }
  return (
    '<!doctype html><html><head><meta charset="utf-8">' + base +
    "</head><body>" + src + "</body></html>"
  );
};
