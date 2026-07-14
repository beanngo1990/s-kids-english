import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const outputDir = path.join(
  process.cwd(),
  'src',
  'assets',
  'icons',
  'app-ui',
);

const palette = {
  teal: '#18B8AE',
  tealDark: '#0E8984',
  tealSoft: '#CFF6F1',
  mint: '#8EE7DB',
  yellow: '#FFD75A',
  yellowDark: '#E6A41B',
  yellowSoft: '#FFF1A8',
  orange: '#FFB45E',
  coral: '#F26955',
  coralDark: '#D94A3E',
  sky: '#9BE2F5',
  skyDark: '#43A9DA',
  skySoft: '#DDF8FF',
  blue: '#6FB8E8',
  cream: '#FFF8E8',
  paper: '#FFFDF5',
  slate: '#334155',
  white: '#FFFFFF',
};

const iconShapes = {
  clock: `
    <g filter="url(#softShadow)">
      <circle cx="64" cy="66" r="38" fill="url(#clockFace)" stroke="${palette.skyDark}" stroke-width="3"/>
      <circle cx="64" cy="66" r="27" fill="${palette.paper}" opacity=".9"/>
      <path d="M64 49v18l15 9" fill="none" stroke="${palette.tealDark}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M41 33l-12 12M87 33l12 12" stroke="${palette.yellowDark}" stroke-width="7" stroke-linecap="round"/>
      <path d="M50 104l-6 10M78 104l6 10" stroke="${palette.tealDark}" stroke-width="7" stroke-linecap="round"/>
      <circle cx="64" cy="66" r="5" fill="${palette.coral}"/>
    </g>
  `,
  custom: `
    <g filter="url(#softShadow)">
      <rect x="24" y="32" width="80" height="70" rx="18" fill="${palette.paper}" stroke="${palette.tealDark}" stroke-width="3"/>
      <path d="M41 52h47M41 68h47M41 84h47" stroke="${palette.tealDark}" stroke-width="5" stroke-linecap="round"/>
      <circle cx="56" cy="52" r="9" fill="url(#yellowBall)" stroke="${palette.yellowDark}" stroke-width="3"/>
      <circle cx="78" cy="68" r="9" fill="url(#coralBall)" stroke="${palette.coralDark}" stroke-width="3"/>
      <circle cx="61" cy="84" r="9" fill="url(#tealBall)" stroke="${palette.tealDark}" stroke-width="3"/>
    </g>
  `,
  daily: `
    <g filter="url(#softShadow)">
      <rect x="27" y="34" width="74" height="68" rx="16" fill="${palette.paper}" stroke="${palette.tealDark}" stroke-width="3"/>
      <path d="M27 52h74" stroke="${palette.skyDark}" stroke-width="8"/>
      <path d="M47 28v16M81 28v16" stroke="${palette.yellowDark}" stroke-width="7" stroke-linecap="round"/>
      <circle cx="64" cy="76" r="16" fill="url(#yellowBall)" stroke="${palette.yellowDark}" stroke-width="3"/>
      <path d="M64 59v5M64 88v5M47 76h5M76 76h5" stroke="${palette.yellowDark}" stroke-width="4" stroke-linecap="round"/>
    </g>
  `,
  difficulty: `
    <g filter="url(#softShadow)">
      <path d="M31 82a33 33 0 0 1 66 0" fill="${palette.skySoft}" stroke="${palette.skyDark}" stroke-width="3"/>
      <path d="M34 82a30 30 0 0 1 60 0" fill="none" stroke="${palette.yellow}" stroke-width="11" stroke-linecap="round"/>
      <path d="M64 82l24-25" stroke="${palette.coralDark}" stroke-width="7" stroke-linecap="round"/>
      <circle cx="64" cy="82" r="10" fill="url(#tealBall)" stroke="${palette.tealDark}" stroke-width="3"/>
      <path d="M37 92h54" stroke="${palette.tealDark}" stroke-width="6" stroke-linecap="round"/>
    </g>
  `,
  journey: `
    <g filter="url(#softShadow)">
      <path d="M29 41c15-11 29 4 45-6 13-8 22-1 25 14 4 20-6 37-24 45-18 8-31-4-46 3-9 4-17-3-14-13 4-13 4-31 14-43z" fill="url(#mapFill)" stroke="${palette.tealDark}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M36 79c14-25 31-7 47-31" fill="none" stroke="${palette.yellowDark}" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 9"/>
      <circle cx="36" cy="79" r="11" fill="url(#yellowBall)" stroke="${palette.yellowDark}" stroke-width="3"/>
      <circle cx="83" cy="48" r="11" fill="url(#coralBall)" stroke="${palette.coralDark}" stroke-width="3"/>
      <circle cx="60" cy="64" r="8" fill="url(#tealBall)" stroke="${palette.tealDark}" stroke-width="3"/>
    </g>
  `,
  language: `
    <g filter="url(#softShadow)">
      <circle cx="60" cy="65" r="35" fill="url(#globeFill)" stroke="${palette.skyDark}" stroke-width="3"/>
      <path d="M28 65h64M60 31c13 15 13 53 0 68M60 31c-13 15-13 53 0 68M35 49h50M35 81h50" fill="none" stroke="${palette.white}" stroke-width="4" stroke-linecap="round" opacity=".9"/>
      <path d="M78 80h24c7 0 12 5 12 12s-5 12-12 12H91l-11 8v-8h-2c-7 0-12-5-12-12s5-12 12-12z" fill="${palette.paper}" stroke="${palette.tealDark}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M82 92h17" stroke="${palette.coral}" stroke-width="5" stroke-linecap="round"/>
    </g>
  `,
  lesson: `
    <g filter="url(#softShadow)">
      <path d="M28 39h34c9 0 16 7 16 16v45H43c-8 0-15-7-15-15V39z" fill="${palette.paper}" stroke="${palette.tealDark}" stroke-width="3"/>
      <path d="M78 42h12c7 0 13 6 13 13v45H78V42z" fill="url(#bookBlue)" stroke="${palette.skyDark}" stroke-width="3"/>
      <path d="M43 59h18M43 75h19" stroke="${palette.coral}" stroke-width="5" stroke-linecap="round"/>
      <path d="M93 31l8 8-27 34-10 3 3-10 26-35z" fill="url(#pencilFill)" stroke="${palette.yellowDark}" stroke-width="2" stroke-linejoin="round"/>
    </g>
  `,
  lessonComplete: `
    <g filter="url(#softShadow)">
      <path d="M30 38h66c8 0 14 6 14 14v48H45c-8 0-15-7-15-15V38z" fill="${palette.paper}" stroke="${palette.tealDark}" stroke-width="3"/>
      <path d="M51 69l14 14 30-34" fill="none" stroke="${palette.teal}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M47 55h22" stroke="${palette.coral}" stroke-width="5" stroke-linecap="round"/>
    </g>
  `,
  reminder: `
    <g filter="url(#softShadow)">
      <path d="M39 80V60c0-16 11-28 25-28s25 12 25 28v20l11 13H28l11-13z" fill="url(#bellFill)" stroke="${palette.yellowDark}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M56 97c2 8 14 8 16 0" fill="none" stroke="${palette.tealDark}" stroke-width="5" stroke-linecap="round"/>
      <path d="M64 25v10" stroke="${palette.tealDark}" stroke-width="6" stroke-linecap="round"/>
      <circle cx="91" cy="42" r="13" fill="url(#coralBall)" stroke="${palette.coralDark}" stroke-width="3"/>
    </g>
  `,
  review: `
    <g filter="url(#softShadow)">
      <rect x="28" y="42" width="42" height="55" rx="10" fill="url(#cardBlue)" stroke="${palette.skyDark}" stroke-width="3" transform="rotate(-8 49 69)"/>
      <rect x="59" y="34" width="43" height="60" rx="10" fill="${palette.paper}" stroke="${palette.tealDark}" stroke-width="3" transform="rotate(8 80 64)"/>
      <path d="M73 59h15M72 74h18" stroke="${palette.coral}" stroke-width="5" stroke-linecap="round"/>
      <circle cx="48" cy="70" r="9" fill="url(#yellowBall)" stroke="${palette.yellowDark}" stroke-width="3"/>
    </g>
  `,
  reward: `
    <g filter="url(#softShadow)">
      <circle cx="64" cy="65" r="39" fill="${palette.tealSoft}" stroke="${palette.tealDark}" stroke-width="3"/>
      <path d="M64 33l9 19 21 3-15 15 4 21-19-10-19 10 4-21-15-15 21-3 9-19z" fill="url(#starFill)" stroke="${palette.yellowDark}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M52 59c5-4 19-4 24 0" stroke="${palette.white}" stroke-width="4" stroke-linecap="round" opacity=".75"/>
    </g>
  `,
  settings: `
    <g filter="url(#softShadow)">
      <circle cx="64" cy="64" r="37" fill="${palette.tealSoft}" stroke="${palette.tealDark}" stroke-width="3"/>
      <path d="M64 34v10M64 84v10M34 64h10M84 64h10M43 43l7 7M78 78l7 7M85 43l-7 7M50 78l-7 7" stroke="${palette.tealDark}" stroke-width="6" stroke-linecap="round"/>
      <circle cx="64" cy="64" r="18" fill="${palette.paper}" stroke="${palette.tealDark}" stroke-width="3"/>
      <circle cx="64" cy="64" r="8" fill="url(#yellowBall)" stroke="${palette.yellowDark}" stroke-width="3"/>
    </g>
  `,
  stats: `
    <g filter="url(#softShadow)">
      <rect x="27" y="35" width="76" height="70" rx="17" fill="${palette.paper}" stroke="${palette.tealDark}" stroke-width="3"/>
      <rect x="42" y="72" width="12" height="20" rx="6" fill="url(#blueBar)"/>
      <rect x="59" y="56" width="12" height="36" rx="6" fill="url(#tealBar)"/>
      <rect x="76" y="45" width="12" height="47" rx="6" fill="url(#coralBar)"/>
      <path d="M40 94h50" stroke="${palette.yellowDark}" stroke-width="4" stroke-linecap="round"/>
    </g>
  `,
  teacher: `
    <g filter="url(#softShadow)">
      <path d="M30 40h68c8 0 14 6 14 14v27c0 8-6 14-14 14H72l-21 15v-15H30c-8 0-14-6-14-14V54c0-8 6-14 14-14z" fill="${palette.paper}" stroke="${palette.tealDark}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="42" cy="66" r="10" fill="url(#yellowBall)" stroke="${palette.yellowDark}" stroke-width="3"/>
      <path d="M59 59h34M59 75h23" stroke="${palette.coral}" stroke-width="5" stroke-linecap="round"/>
    </g>
  `,
  theme: `
    <g filter="url(#softShadow)">
      <path d="M64 30c23 0 41 15 41 35 0 16-13 30-31 33-5 1-8-2-7-7 1-5-2-8-8-8H48c-14 0-24-10-24-23 0-17 18-30 40-30z" fill="${palette.paper}" stroke="${palette.tealDark}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="48" cy="57" r="8" fill="url(#coralBall)"/>
      <circle cx="66" cy="50" r="8" fill="url(#yellowBall)"/>
      <circle cx="82" cy="62" r="8" fill="url(#blueBall)"/>
      <circle cx="58" cy="74" r="8" fill="url(#tealBall)"/>
    </g>
  `,
  visibility: `
    <g filter="url(#softShadow)">
      <path d="M23 64c10-18 25-27 41-27s31 9 41 27c-10 18-25 27-41 27S33 82 23 64z" fill="${palette.paper}" stroke="${palette.tealDark}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="64" cy="64" r="18" fill="url(#globeFill)" stroke="${palette.skyDark}" stroke-width="3"/>
      <circle cx="64" cy="64" r="7" fill="${palette.tealDark}"/>
    </g>
  `,
  words: `
    <g filter="url(#softShadow)">
      <rect x="27" y="39" width="62" height="58" rx="14" fill="${palette.paper}" stroke="${palette.tealDark}" stroke-width="3"/>
      <rect x="57" y="30" width="44" height="58" rx="13" fill="url(#cardBlue)" stroke="${palette.skyDark}" stroke-width="3"/>
      <path d="M45 81l13-31 13 31M51 69h14" fill="none" stroke="${palette.coral}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M74 51h12M74 66h12" stroke="${palette.white}" stroke-width="5" stroke-linecap="round"/>
    </g>
  `,
};

function svgFor(shape) {
  return `
    <svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#0E8984" flood-opacity=".18"/>
        </filter>
        <linearGradient id="clockFace" x1="32" y1="28" x2="98" y2="100" gradientUnits="userSpaceOnUse">
          <stop stop-color="${palette.skySoft}"/>
          <stop offset="1" stop-color="${palette.sky}"/>
        </linearGradient>
        <linearGradient id="mapFill" x1="24" y1="35" x2="100" y2="102" gradientUnits="userSpaceOnUse">
          <stop stop-color="${palette.tealSoft}"/>
          <stop offset="1" stop-color="${palette.mint}"/>
        </linearGradient>
        <linearGradient id="globeFill" x1="30" y1="32" x2="94" y2="98" gradientUnits="userSpaceOnUse">
          <stop stop-color="${palette.skySoft}"/>
          <stop offset="1" stop-color="${palette.blue}"/>
        </linearGradient>
        <linearGradient id="bookBlue" x1="78" y1="42" x2="104" y2="100" gradientUnits="userSpaceOnUse">
          <stop stop-color="${palette.skySoft}"/>
          <stop offset="1" stop-color="${palette.blue}"/>
        </linearGradient>
        <linearGradient id="pencilFill" x1="67" y1="76" x2="101" y2="32" gradientUnits="userSpaceOnUse">
          <stop stop-color="${palette.orange}"/>
          <stop offset="1" stop-color="${palette.yellow}"/>
        </linearGradient>
        <linearGradient id="bellFill" x1="40" y1="31" x2="87" y2="98" gradientUnits="userSpaceOnUse">
          <stop stop-color="${palette.yellowSoft}"/>
          <stop offset="1" stop-color="${palette.yellow}"/>
        </linearGradient>
        <linearGradient id="cardBlue" x1="30" y1="42" x2="99" y2="95" gradientUnits="userSpaceOnUse">
          <stop stop-color="${palette.skySoft}"/>
          <stop offset="1" stop-color="${palette.sky}"/>
        </linearGradient>
        <linearGradient id="starFill" x1="46" y1="34" x2="82" y2="91" gradientUnits="userSpaceOnUse">
          <stop stop-color="${palette.yellowSoft}"/>
          <stop offset="1" stop-color="${palette.yellow}"/>
        </linearGradient>
        <linearGradient id="yellowBall" x1="50" y1="44" x2="74" y2="82" gradientUnits="userSpaceOnUse">
          <stop stop-color="${palette.yellowSoft}"/>
          <stop offset="1" stop-color="${palette.yellow}"/>
        </linearGradient>
        <linearGradient id="coralBall" x1="68" y1="55" x2="92" y2="78" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FF9B82"/>
          <stop offset="1" stop-color="${palette.coral}"/>
        </linearGradient>
        <linearGradient id="tealBall" x1="51" y1="46" x2="82" y2="91" gradientUnits="userSpaceOnUse">
          <stop stop-color="${palette.mint}"/>
          <stop offset="1" stop-color="${palette.teal}"/>
        </linearGradient>
        <linearGradient id="blueBall" x1="72" y1="52" x2="91" y2="72" gradientUnits="userSpaceOnUse">
          <stop stop-color="${palette.skySoft}"/>
          <stop offset="1" stop-color="${palette.blue}"/>
        </linearGradient>
        <linearGradient id="blueBar" x1="42" y1="72" x2="54" y2="92" gradientUnits="userSpaceOnUse">
          <stop stop-color="${palette.sky}"/>
          <stop offset="1" stop-color="${palette.blue}"/>
        </linearGradient>
        <linearGradient id="tealBar" x1="59" y1="56" x2="71" y2="92" gradientUnits="userSpaceOnUse">
          <stop stop-color="${palette.mint}"/>
          <stop offset="1" stop-color="${palette.teal}"/>
        </linearGradient>
        <linearGradient id="coralBar" x1="76" y1="45" x2="88" y2="92" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FF9B82"/>
          <stop offset="1" stop-color="${palette.coral}"/>
        </linearGradient>
      </defs>
      ${shape}
    </svg>
  `;
}

await fs.mkdir(outputDir, { recursive: true });

for (const [name, shape] of Object.entries(iconShapes)) {
  await sharp(Buffer.from(svgFor(shape)))
    .png({ compressionLevel: 9, palette: false })
    .toFile(path.join(outputDir, `${name}.png`));
}
