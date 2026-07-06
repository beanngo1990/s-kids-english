/**
 * removeBackground.mjs
 *
 * Tách nền xanh lục (chroma key green) khỏi ảnh PNG/JPG.
 * Kết quả là ảnh PNG trong suốt (transparent).
 *
 * Cách dùng:
 *   node scripts/removeBackground.mjs <input_image> [output_image]
 *
 * Ví dụ:
 *   node scripts/removeBackground.mjs acorn_green.png acorn.png
 *   node scripts/removeBackground.mjs acorn_green.png
 *     → Tự động lưu thành acorn_green_nobg.png
 *
 * Tuỳ chọn:
 *   --threshold=<0-255>  Ngưỡng phát hiện xanh (mặc định: 80)
 *   --feather=<0-20>     Độ mềm viền (mặc định: 2)
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// ---------- Argument parsing ----------
const args = process.argv.slice(2);
const flags = {};
const positional = [];

for (const arg of args) {
  if (arg.startsWith('--')) {
    const [key, val] = arg.slice(2).split('=');
    flags[key] = val ?? 'true';
  } else {
    positional.push(arg);
  }
}

const inputPath = positional[0];
if (!inputPath) {
  console.error('❌ Cần chỉ định file ảnh đầu vào.');
  console.error('   Cách dùng: node scripts/removeBackground.mjs <input> [output]');
  process.exit(1);
}

if (!fs.existsSync(inputPath)) {
  console.error(`❌ Không tìm thấy file: ${inputPath}`);
  process.exit(1);
}

const ext = path.extname(inputPath);
const basename = path.basename(inputPath, ext);
const dir = path.dirname(inputPath);
const outputPath = positional[1] || path.join(dir, `${basename}_nobg.png`);

const THRESHOLD = parseInt(flags.threshold || '80', 10);
const FEATHER = parseInt(flags.feather || '2', 10);

// ---------- Ensure sharp is available ----------
let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.log('📦 Đang cài đặt sharp...');
  execSync('npm install --no-save sharp', { stdio: 'inherit' });
  sharp = (await import('sharp')).default;
}

// ---------- Process image ----------
console.log(`🖼️  Đang xử lý: ${inputPath}`);
console.log(`   Threshold: ${THRESHOLD}, Feather: ${FEATHER}`);

const image = sharp(inputPath);
const { width, height, channels } = await image.metadata();

// Get raw pixel data (RGBA)
const rawBuffer = await image.ensureAlpha().raw().toBuffer();
const pixelCount = width * height;
const resultBuffer = Buffer.from(rawBuffer);

// Pass 1: Mark green pixels as transparent
for (let i = 0; i < pixelCount; i++) {
  const offset = i * 4;
  const r = rawBuffer[offset];
  const g = rawBuffer[offset + 1];
  const b = rawBuffer[offset + 2];

  // A pixel is "green screen" if green channel is dominant
  const isGreen =
    g > THRESHOLD &&
    g > r * 1.2 &&
    g > b * 1.2;

  if (isGreen) {
    resultBuffer[offset] = 0;     // R
    resultBuffer[offset + 1] = 0; // G
    resultBuffer[offset + 2] = 0; // B
    resultBuffer[offset + 3] = 0; // A = transparent
  }
}

// Pass 2: Feather edges (soften alpha on border pixels)
if (FEATHER > 0) {
  // Create alpha mask
  const alphaMask = new Uint8Array(pixelCount);
  for (let i = 0; i < pixelCount; i++) {
    alphaMask[i] = resultBuffer[i * 4 + 3];
  }

  for (let pass = 0; pass < FEATHER; pass++) {
    const tempAlpha = new Uint8Array(alphaMask);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        if (alphaMask[idx] > 0) {
          // Check if any neighbor is transparent
          const neighbors = [
            alphaMask[idx - 1],
            alphaMask[idx + 1],
            alphaMask[idx - width],
            alphaMask[idx + width],
          ];
          const hasTransparentNeighbor = neighbors.some(n => n === 0);
          if (hasTransparentNeighbor) {
            // Reduce alpha for edge pixels
            tempAlpha[idx] = Math.floor(alphaMask[idx] * 0.5);
          }
        }
      }
    }
    // Apply
    for (let i = 0; i < pixelCount; i++) {
      alphaMask[i] = tempAlpha[i];
      resultBuffer[i * 4 + 3] = tempAlpha[i];
    }
  }

  // Pass 3: Remove green spill from semi-transparent edge pixels
  for (let i = 0; i < pixelCount; i++) {
    const offset = i * 4;
    const a = resultBuffer[offset + 3];
    if (a > 0 && a < 255) {
      let r = resultBuffer[offset];
      let g = resultBuffer[offset + 1];
      let b = resultBuffer[offset + 2];
      // Desaturate green channel on edges
      if (g > r && g > b) {
        const avg = Math.floor((r + b) / 2);
        resultBuffer[offset + 1] = Math.floor((g + avg) / 2);
      }
    }
  }
}

// Save result
await sharp(resultBuffer, { raw: { width, height, channels: 4 } })
  .png()
  .toFile(outputPath);

const inputSize = fs.statSync(inputPath).size;
const outputSize = fs.statSync(outputPath).size;

console.log(`✅ Hoàn thành! Đã lưu: ${outputPath}`);
console.log(`   Kích thước: ${(inputSize / 1024).toFixed(1)}KB → ${(outputSize / 1024).toFixed(1)}KB`);
console.log(`   Kích thước ảnh: ${width} x ${height}px`);
