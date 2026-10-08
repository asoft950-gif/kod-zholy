/* sw.js ішіндегі VERSION-ды сайт файлдарының мазмұнынан жасалған хэшпен жаңартады.
   Файл өзгерсе, нұсқа да өзгереді, сонда ашық тұрған беттер жаңа нұсқаны өздері табып, жаңарады.
   Қолдану: node tools/stamp-sw.mjs  (pre-commit hook өзі шақырады) */
import fs from "fs";
import crypto from "crypto";
import path from "path";
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const swPath = path.join(root, "sw.js");
const sw = fs.readFileSync(swPath, "utf8");
const shell = JSON.parse("[" + sw.match(/const SHELL = \[([\s\S]*?)\];/)[1].replace(/,\s*$/, "") + "]");
const h = crypto.createHash("sha1");
for (const f of shell) {
  const p = path.join(root, f === "./" ? "index.html" : f);
  if (fs.existsSync(p)) h.update(f + "\0" + fs.readFileSync(p));
}
h.update(sw.replace(/const VERSION = "[^"]*";/, ""));
const v = "bitlings-" + h.digest("hex").slice(0, 10);
const out = sw.replace(/const VERSION = "[^"]*";/, `const VERSION = "${v}";`);
if (out !== sw) fs.writeFileSync(swPath, out);
console.log(v);
