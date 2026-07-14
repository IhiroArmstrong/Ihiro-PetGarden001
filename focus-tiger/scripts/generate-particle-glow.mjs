/**
 * 生成 particle-glow.png 到 public/textures/
 * 运行：node scripts/generate-particle-glow.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const size = 64;
const png = new PNG({ width: size, height: size });

for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    const dx = x - size / 2;
    const dy = y - size / 2;
    const dist = Math.sqrt(dx * dx + dy * dy) / (size / 2);
    const alpha = Math.max(0, 1 - dist);
    const idx = (size * y + x) << 2;
    png.data[idx] = 255;
    png.data[idx + 1] = 240;
    png.data[idx + 2] = 210;
    png.data[idx + 3] = Math.round(alpha * alpha * 255);
  }
}

const outPath = path.join(__dirname, '../public/textures/particle-glow.png');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, PNG.sync.write(png));
console.log(`Saved ${outPath}`);
