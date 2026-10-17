import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Master SVG (512x512)
const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a2540" />
      <stop offset="50%" stop-color="#0d3b66" />
      <stop offset="100%" stop-color="#144272" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="40%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.02" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.35" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="512" height="512" rx="108" fill="url(#bgGrad)" />

  <!-- Outer Decorative Ring -->
  <circle cx="256" cy="256" r="224" fill="none" stroke="url(#goldGrad)" stroke-width="6" stroke-opacity="0.6" stroke-dasharray="14 8" />
  <circle cx="256" cy="256" r="208" fill="none" stroke="#ffffff" stroke-width="2" stroke-opacity="0.25" />

  <!-- Shield Shape in Center -->
  <path d="M256 90 C340 90 380 130 380 220 C380 320 256 390 256 390 C256 390 132 320 132 220 C132 130 172 90 256 90 Z" 
        fill="url(#shieldGrad)" stroke="url(#goldGrad)" stroke-width="5" filter="url(#shadow)" />

  <!-- Graduation Cap (Mortarboard) -->
  <g transform="translate(256, 185)">
    <!-- Cap top diamond -->
    <polygon points="0,-45 95,0 0,45 -95,0" fill="url(#goldGrad)" filter="url(#shadow)" />
    <!-- Cap skull cap underside -->
    <path d="M-55,15 C-55,42 55,42 55,15 Z" fill="#b45309" opacity="0.9" />
    <!-- Tassel button & cord -->
    <circle cx="0" cy="0" r="6" fill="#fef08a" />
    <path d="M0,0 Q60,10 75,45" fill="none" stroke="#fef08a" stroke-width="4" stroke-linecap="round" />
    <polygon points="70,45 80,45 77,75 73,75" fill="#fef08a" />
  </g>

  <!-- Open Book of Knowledge -->
  <g transform="translate(256, 280)">
    <!-- Left page -->
    <path d="M-8,-10 C-35,-25 -85,-20 -105,-8 L-105,48 C-85,38 -35,32 -8,46 Z" fill="#ffffff" opacity="0.95" />
    <!-- Right page -->
    <path d="M8,-10 C35,-25 85,-20 105,-8 L105,48 C85,38 35,32 8,46 Z" fill="#ffffff" opacity="0.95" />
    <!-- Book Spine & Ribbon -->
    <path d="M-8,-8 L0,12 L8,-8 L8,48 L0,58 L-8,48 Z" fill="url(#goldGrad)" />
    <!-- Page text lines -->
    <line x1="-90" y1="5" x2="-25" y2="-2" stroke="#94a3b8" stroke-width="3" stroke-linecap="round" />
    <line x1="-90" y1="18" x2="-25" y2="12" stroke="#94a3b8" stroke-width="3" stroke-linecap="round" />
    <line x1="-90" y1="31" x2="-35" y2="26" stroke="#94a3b8" stroke-width="3" stroke-linecap="round" />
    <line x1="25" y1="-2" x2="90" y2="5" stroke="#94a3b8" stroke-width="3" stroke-linecap="round" />
    <line x1="25" y1="12" x2="90" y2="18" stroke="#94a3b8" stroke-width="3" stroke-linecap="round" />
    <line x1="35" y1="26" x2="90" y2="31" stroke="#94a3b8" stroke-width="3" stroke-linecap="round" />
  </g>

  <!-- Laurel Branches below -->
  <path d="M165,340 Q210,380 256,380 Q302,380 347,340" fill="none" stroke="url(#goldGrad)" stroke-width="3" stroke-linecap="round" opacity="0.8" />

  <!-- Arabic Monogram Text: السمودي -->
  <text x="256" y="440" font-family="system-ui, -apple-system, 'Tajawal', 'Cairo', sans-serif" 
        font-size="34" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1">
    مدرسة السمودي
  </text>
  <text x="256" y="470" font-family="system-ui, -apple-system, 'Tajawal', 'Cairo', sans-serif" 
        font-size="16" font-weight="600" fill="#93c5fd" text-anchor="middle" letter-spacing="2">
    الأساسية للبنين
  </text>
</svg>`;

// Maskable SVG with safe margin (15% all sides, canvas 512x512, contents within central circle)
const maskableSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a2540" />
      <stop offset="50%" stop-color="#0d3b66" />
      <stop offset="100%" stop-color="#144272" />
    </linearGradient>
    <linearGradient id="goldGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="40%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
  </defs>

  <!-- Full-bleed background for maskable cropping -->
  <rect width="512" height="512" fill="url(#bgGradM)" />

  <!-- Scaled down to safe zone (80% circle) -->
  <g transform="translate(51.2, 51.2) scale(0.8)">
    <!-- Outer Decorative Ring -->
    <circle cx="256" cy="256" r="220" fill="none" stroke="url(#goldGradM)" stroke-width="8" stroke-opacity="0.7" stroke-dasharray="14 8" />
    
    <!-- Shield -->
    <path d="M256 90 C340 90 380 130 380 220 C380 320 256 390 256 390 C256 390 132 320 132 220 C132 130 172 90 256 90 Z" 
          fill="#0a2540" stroke="url(#goldGradM)" stroke-width="6" />

    <!-- Cap -->
    <g transform="translate(256, 185)">
      <polygon points="0,-45 95,0 0,45 -95,0" fill="url(#goldGradM)" />
      <circle cx="0" cy="0" r="6" fill="#fef08a" />
      <path d="M0,0 Q60,10 75,45" fill="none" stroke="#fef08a" stroke-width="4" stroke-linecap="round" />
    </g>

    <!-- Book -->
    <g transform="translate(256, 280)">
      <path d="M-8,-10 C-35,-25 -85,-20 -105,-8 L-105,48 C-85,38 -35,32 -8,46 Z" fill="#ffffff" />
      <path d="M8,-10 C35,-25 85,-20 105,-8 L105,48 C85,38 35,32 8,46 Z" fill="#ffffff" />
      <path d="M-8,-8 L0,12 L8,-8 L8,48 L0,58 L-8,48 Z" fill="url(#goldGradM)" />
    </g>

    <!-- Text -->
    <text x="256" y="440" font-family="system-ui, -apple-system, sans-serif" 
          font-size="36" font-weight="800" fill="#ffffff" text-anchor="middle">
      مدرسة السمودي
    </text>
  </g>
</svg>`;

async function generate() {
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf8');
  console.log('Saved public/icon.svg');

  const svgBuffer = Buffer.from(svgContent);
  const maskableBuffer = Buffer.from(maskableSvg);

  // 1. pwa-192x192.png
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Generated pwa-192x192.png');

  // 2. pwa-512x512.png
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Generated pwa-512x512.png');

  // 3. pwa-maskable-512x512.png
  await sharp(maskableBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Generated pwa-maskable-512x512.png');

  // 4. apple-touch-icon.png (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // 5. favicon.ico / favicon-32x32.png
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('Generated favicon.png');
}

generate().catch(console.error);
