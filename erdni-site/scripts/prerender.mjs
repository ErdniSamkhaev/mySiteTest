// Вшивает пререндер-снимок контента в dist/index.html внутрь #root.
// Запускается после `vite build` и `vite build --ssr` (см. package.json).
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const ssrEntry = resolve("dist-ssr/prerender.js");
const indexPath = resolve("dist/index.html");

const mod = await import(pathToFileURL(ssrEntry).href);
const appHtml = mod.render();

let html = readFileSync(indexPath, "utf8");
if (!html.includes('<div id="root"></div>')) {
  console.warn('[prerender] не нашёл <div id="root"></div> — пропускаю');
} else {
  html = html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
  writeFileSync(indexPath, html);
  console.log(`[prerender] вшито ${appHtml.length} символов контента в dist/index.html`);
}
