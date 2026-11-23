import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

function makePNG(width, height, drawFn) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type);
    const body = Buffer.concat([typeBuf, data]);
    const crc = Buffer.alloc(4);
    let c = 0xffffffff;
    for (let i = 0; i < body.length; i++) {
      c ^= body[i];
      for (let j = 0; j < 8; j++) {
        c = (c >>> 1) ^ (-(c & 1) & 0xedb88320);
      }
    }
    crc.writeInt32BE(~c, 0);
    return Buffer.concat([len, body, crc]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bit per channel
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rowLength = 1 + width * 4;
  const rawData = Buffer.alloc(rowLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const px = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[px] = r;
      rawData[px + 1] = g;
      rawData[px + 2] = b;
      rawData[px + 3] = a;
    }
  }

  const idatData = zlib.deflateSync(rawData, { level: 9 });
  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idatData),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

// Icon drawer: Cheerful golden amber child emblem with star center
function drawAppIcon(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxRadius = w * 0.46;

  // Background gradient: Warm Amber #F59E0B to Orange #EA580C
  const t = (x + y) / (w + h);
  const bgR = Math.round(245 * (1 - t) + 234 * t);
  const bgG = Math.round(158 * (1 - t) + 88 * t);
  const bgB = Math.round(11 * (1 - t) + 12 * t);

  // If maskable, fill whole canvas with background
  if (isMaskable) {
    // Star inner radius
    const starRadius = w * 0.28;
    const angle = Math.atan2(dy, dx);
    const points = 5;
    const starFactor = 0.5 + 0.5 * Math.cos(points * angle);
    const currentStarR = starRadius * (0.65 + 0.35 * starFactor);
    if (dist < currentStarR) {
      // Star color (bright yellow)
      return [254, 240, 138, 255];
    }
    // Subtle star outline
    if (dist < currentStarR + (w * 0.02)) {
      return [202, 138, 4, 255];
    }
    return [bgR, bgG, bgB, 255];
  }

  // Rounded icon for standard display
  const cornerR = w * 0.22;
  const inBox = Math.abs(dx) <= (cx - cornerR) || Math.abs(dy) <= (cy - cornerR) ||
    Math.hypot(Math.max(0, Math.abs(dx) - (cx - cornerR)), Math.max(0, Math.abs(dy) - (cy - cornerR))) <= cornerR;

  if (!inBox) {
    return [0, 0, 0, 0]; // Transparent outside
  }

  // Inside star shape
  const starRadius = w * 0.30;
  const angle = Math.atan2(dy, dx);
  const points = 5;
  const starFactor = 0.5 + 0.5 * Math.cos(points * angle);
  const currentStarR = starRadius * (0.65 + 0.35 * starFactor);
  if (dist < currentStarR) {
    return [254, 240, 138, 255]; // Cheerful star
  }
  if (dist < currentStarR + (w * 0.025)) {
    return [202, 138, 4, 255]; // Star stroke
  }

  return [bgR, bgG, bgB, 255];
}

// Generate PWA icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), makePNG(192, 192, (x, y, w, h) => drawAppIcon(x, y, w, h, false)));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), makePNG(512, 512, (x, y, w, h) => drawAppIcon(x, y, w, h, false)));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), makePNG(512, 512, (x, y, w, h) => drawAppIcon(x, y, w, h, true)));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), makePNG(180, 180, (x, y, w, h) => drawAppIcon(x, y, w, h, false)));

console.log('✅ Generated PWA icons successfully in public directory!');
