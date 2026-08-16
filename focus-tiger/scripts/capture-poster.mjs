/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * 导出 poster-idle.png（需先启动 npm run dev）
 *
 * 推荐方式（支持 KTX2+Draco 压缩 GLB）：
 *   1. npm run dev
 *   2. node scripts/capture-poster.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outPath = path.join(root, 'public/textures/poster-idle.png');
const devUrl = process.env.POSTER_CAPTURE_URL || 'http://127.0.0.1:5173/?capturePoster=1';

const res = await fetch(devUrl);
if (!res.ok) {
  console.error(`无法访问 ${devUrl}，请先运行 npm run dev`);
  process.exit(1);
}

const html = await res.text();
const base = devUrl.replace(/\?.*$/, '');
const posterPage = `${base}/?capturePoster=1`;

console.log('请在已启动 npm run dev 的环境下，通过浏览器截取。');
console.log('正在尝试用 puppeteer 自动截取...');

let puppeteer;
try {
  puppeteer = await import('puppeteer');
} catch {
  puppeteer = null;
}

if (!puppeteer) {
  console.error('未安装 puppeteer。请手动：');
  console.error(`  1. 打开 ${posterPage}`);
  console.error('  2. 在控制台执行 copy(__posterDataUrl) 并保存为 PNG');
  process.exit(1);
}

const browser = await puppeteer.default.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
await page.goto(posterPage, { waitUntil: 'networkidle0', timeout: 120000 });
await page.waitForFunction('window.__posterCaptureReady === true', { timeout: 120000 });

const dataUrl = await page.evaluate(() => window.__posterDataUrl);
const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, Buffer.from(base64, 'base64'));

const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
console.log(`Saved ${outPath} (${kb} KB, 1280x720)`);
await browser.close();
