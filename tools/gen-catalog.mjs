/* Деңгейлер каталогын (supabase/catalog.sql) курс файлдарынан жасайды.
   Іске қосу: node tools/gen-catalog.mjs   (курс қосқан/өзгерткен сайын; нәтижені Supabase SQL Editor-ге қою керек) */
import fs from "fs";
import vm from "vm";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(ROOT + "/index.html", "utf8");
const scripts = [...html.matchAll(/<script src="(js\/core\.js|js\/courses\/[^"]+)"/g)].map((m) => m[1]);
globalThis.window = globalThis;
for (const f of scripts) vm.runInThisContext(fs.readFileSync(ROOT + "/" + f, "utf8"), { filename: f });

const cat = {};
for (const c of KZ.courses) {
  const ids = KZ.allLevels(c).map((l) => l.id);
  if (ids.length) cat[c.id] = ids;
}
const sql =
  "-- Автоматты жасалған (node tools/gen-catalog.mjs). Қолмен өзгертпе.\n" +
  "delete from public.level_catalog;\n" +
  "insert into public.level_catalog (course_id, level_id)\n" +
  "select k, jsonb_array_elements_text(v) from jsonb_each('" +
  JSON.stringify(cat) +
  "'::jsonb) as t(k, v);\n";
fs.writeFileSync(ROOT + "/supabase/catalog.sql", sql);
console.log("catalog:", Object.entries(cat).map(([k, v]) => k + "=" + v.length).join(" "));
