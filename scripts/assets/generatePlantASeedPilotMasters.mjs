import {
  copyFileSync,
  existsSync,
  mkdirSync,
} from 'node:fs';
import { dirname, join } from 'node:path';

import sharp from 'sharp';

import { repoRoot, toMasterPath } from './config.mjs';

const force = process.argv.includes('--force');
const lessonId = 'plant-a-seed';
const imageRoot = `lessons/${lessonId}`;
const approvedPotMaster = join(
  repoRoot,
  'src/assets/source/master/lessons/plant-a-seed/shared/images/pot-empty.png',
);

if (!existsSync(approvedPotMaster)) {
  throw new Error(
    `Missing approved empty-pot master: ${approvedPotMaster}. Generate or restore it before running this script.`,
  );
}

let created = 0;
let skipped = 0;

const scenePalettes = {
  'prepare-the-pot': ['#F5F0DC', '#8BCB85', '#E9A15B'],
  'plant-the-seed': ['#F6F1DF', '#78BF77', '#D58B4B'],
  'first-watering': ['#EDF5E4', '#68B98A', '#6FB7D8'],
};

for (const [sceneId, palette] of Object.entries(scenePalettes)) {
  await writeSvgMaster(
    `${imageRoot}/${sceneId}/images/background.webp`,
    makeBackgroundSvg(sceneId, palette),
    false,
  );
}

await copyPotMaster('prepare-the-pot', 'plant-pot-empty');
await writePotVariant('prepare-the-pot', 'plant-pot-soil-low', 'soil-low');
await writePotVariant('prepare-the-pot', 'plant-pot-soil-ready', 'soil-ready');
await writePotVariant('plant-the-seed', 'pot-soil-flat', 'soil-ready');
await writePotVariant('plant-the-seed', 'pot-hole-open', 'hole-open');
await writePotVariant('plant-the-seed', 'pot-seed-visible', 'seed-visible');
await writePotVariant('plant-the-seed', 'pot-seed-covered', 'covered');
await writePotVariant('first-watering', 'pot-dry', 'covered');
await writePotVariant('first-watering', 'pot-damp', 'damp');

const objectSpecs = [
  ['prepare-the-pot', 'soil', 'soil'],
  ['prepare-the-pot', 'scoop-empty', 'scoop'],
  ['prepare-the-pot', 'scoop-filled', 'scoop-filled'],
  ['prepare-the-pot', 'drainage-hole', 'drainage'],
  ['prepare-the-pot', 'potting-mix', 'soil-bag'],
  ['prepare-the-pot', 'fill-pot-soil', 'fill-pot'],
  ['prepare-the-pot', 'leave-space', 'leave-space'],
  ['plant-the-seed', 'seed-packet', 'seed-packet'],
  ['plant-the-seed', 'seed', 'seed'],
  ['plant-the-seed', 'hole', 'hole'],
  ['plant-the-seed', 'finger', 'finger'],
  ['plant-the-seed', 'cover-soil', 'cover-soil'],
  ['plant-the-seed', 'plant-label', 'label'],
  ['plant-the-seed', 'planted-label', 'planted-label'],
  ['plant-the-seed', 'plant-seed', 'plant-seed'],
  ['plant-the-seed', 'cover-seed', 'cover-seed'],
  ['first-watering', 'water', 'water'],
  ['first-watering', 'watering-can', 'watering-can'],
  ['first-watering', 'damp', 'damp'],
  ['first-watering', 'sprout', 'sprout'],
  ['first-watering', 'time-cue', 'time'],
  ['first-watering', 'spout', 'spout'],
  ['first-watering', 'puddle-card', 'puddle-card'],
  ['first-watering', 'puddle', 'puddle'],
  ['first-watering', 'water-gently', 'water-gently'],
  ['first-watering', 'wait-sprout', 'wait-sprout'],
];

for (const [sceneId, assetName, kind] of objectSpecs) {
  await writeSvgMaster(
    `${imageRoot}/${sceneId}/images/${assetName}.webp`,
    makeObjectSvg(kind),
    true,
  );
}

await generateMapIcons();

console.log(`Plant-a-seed pilot master PNGs created: ${created}`);
console.log(`Skipped existing master PNGs         : ${skipped}`);

async function copyPotMaster(sceneId, assetName) {
  const target = toMasterPath(
    `${imageRoot}/${sceneId}/images/${assetName}.webp`,
  );
  if (existsSync(target) && !force) {
    skipped += 1;
    return;
  }
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(approvedPotMaster, target);
  created += 1;
}

async function writePotVariant(sceneId, assetName, state) {
  const target = toMasterPath(
    `${imageRoot}/${sceneId}/images/${assetName}.webp`,
  );
  if (existsSync(target) && !force) {
    skipped += 1;
    return;
  }
  mkdirSync(dirname(target), { recursive: true });
  const overlay = Buffer.from(makePotOverlaySvg(state));
  await sharp(approvedPotMaster, { limitInputPixels: false })
    .composite([{ input: overlay, left: 0, top: 0 }])
    .png()
    .toFile(target);
  created += 1;
}

async function writeSvgMaster(source, svg, transparent) {
  const target = toMasterPath(source);
  if (existsSync(target) && !force) {
    skipped += 1;
    return;
  }
  mkdirSync(dirname(target), { recursive: true });
  let image = sharp(Buffer.from(svg));
  if (!transparent) {
    image = image.flatten({ background: '#FFFFFF' }).removeAlpha();
  }
  await image.png().toFile(target);
  created += 1;
}

function makePotOverlaySvg(state) {
  const soilColor = state === 'damp' ? '#5B3829' : '#7B4D34';
  const lowSoil = state === 'soil-low';
  const soilY = lowSoil ? 435 : 439;
  const soilRx = lowSoil ? 230 : 278;
  const soilRy = lowSoil ? 34 : 64;
  const stateDetail =
    state === 'hole-open'
      ? '<ellipse cx="627" cy="448" rx="68" ry="25" fill="#3B251D"/><path d="M574 447Q627 420 680 447" fill="none" stroke="#9B6845" stroke-width="10" stroke-linecap="round" opacity=".75"/>'
      : state === 'seed-visible'
        ? '<ellipse cx="627" cy="448" rx="68" ry="25" fill="#3B251D"/><ellipse cx="627" cy="444" rx="20" ry="28" fill="#C69856" transform="rotate(-22 627 444)"/><path d="M620 425Q636 443 630 465" fill="none" stroke="#8A6439" stroke-width="5" stroke-linecap="round"/>'
        : state === 'covered' || state === 'damp'
          ? `<path d="M496 452Q626 396 758 452" fill="none" stroke="${state === 'damp' ? '#74503A' : '#9B6845'}" stroke-width="14" stroke-linecap="round" opacity=".78"/>`
          : '';
  const dampDetail =
    state === 'damp'
      ? '<path d="M480 430Q516 410 548 430M705 426Q738 407 770 426" fill="none" stroke="#A67A57" stroke-width="8" stroke-linecap="round" opacity=".5"/>'
      : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1254" height="1254" viewBox="0 0 1254 1254">
    <ellipse cx="627" cy="${soilY}" rx="${soilRx}" ry="${soilRy}" fill="${soilColor}"/>
    <ellipse cx="627" cy="${soilY - 9}" rx="${soilRx - 18}" ry="${Math.max(20, soilRy - 18)}" fill="#A06B47" opacity=".42"/>
    ${stateDetail}${dampDetail}
  </svg>`;
}

function makeBackgroundSvg(sceneId, [base, green, accent]) {
  const sceneDetail =
    sceneId === 'prepare-the-pot'
      ? '<path d="M85 520H275V930H85Z" fill="#FFFFFF" opacity=".42"/><path d="M115 560H245M115 650H245M115 740H245" stroke="#6AA069" stroke-width="14" stroke-linecap="round" opacity=".28"/>'
      : sceneId === 'plant-the-seed'
        ? '<rect x="680" y="470" width="165" height="255" rx="26" fill="#FFFFFF" opacity=".36"/><path d="M720 520H805M720 585H805M720 650H785" stroke="#6AA069" stroke-width="13" stroke-linecap="round" opacity=".25"/>'
        : '<circle cx="760" cy="310" r="112" fill="#F6CD64" opacity=".48"/><path d="M610 370Q760 260 910 370" fill="none" stroke="#FFFFFF" stroke-width="25" stroke-linecap="round" opacity=".48"/>';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="941" height="1672" viewBox="0 0 941 1672">
    <defs>
      <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${base}"/><stop offset="1" stop-color="#FBF8EC"/></linearGradient>
      <linearGradient id="table" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#D99B62"/><stop offset="1" stop-color="#B97445"/></linearGradient>
    </defs>
    <rect width="941" height="1672" fill="url(#wall)"/>
    <rect x="55" y="120" width="831" height="790" rx="48" fill="#DDF2D5" stroke="${green}" stroke-width="14" opacity=".9"/>
    <path d="M470 128V905M62 635H880" stroke="#FFFFFF" stroke-width="18" opacity=".72"/>
    <path d="M62 760Q190 650 310 760T558 760T875 755V910H62Z" fill="${green}" opacity=".62"/>
    <circle cx="185" cy="285" r="78" fill="#F7D469" opacity=".82"/>
    ${sceneDetail}
    <path d="M0 925H941V1672H0Z" fill="url(#table)"/>
    <path d="M0 1002H941" stroke="#F0C08C" stroke-width="22" opacity=".7"/>
    <path d="M85 1315H856" stroke="${accent}" stroke-width="11" stroke-linecap="round" opacity=".16"/>
  </svg>`;
}

function makeObjectSvg(kind) {
  const phraseKinds = new Set([
    'cover-seed',
    'fill-pot',
    'leave-space',
    'plant-seed',
    'wait-sprout',
    'water-gently',
  ]);
  if (phraseKinds.has(kind)) {
    return makeActionIllustrationSvg(kind);
  }

  const motif = makeObjectMotif(kind);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <defs><filter id="shadow" x="-25%" y="-25%" width="150%" height="160%"><feDropShadow dx="0" dy="22" stdDeviation="17" flood-color="#314A3D" flood-opacity=".18"/></filter></defs>
    <g filter="url(#shadow)">${motif}</g>
  </svg>`;
}

function makeObjectMotif(kind) {
  switch (kind) {
    case 'soil':
      return '<path d="M180 690Q210 510 350 525Q430 380 535 520Q660 420 730 550Q840 560 855 710Z" fill="#805139"/><path d="M265 620Q360 560 450 625M535 575Q630 515 735 600" fill="none" stroke="#A97852" stroke-width="28" stroke-linecap="round"/>';
    case 'cover-soil':
      return '<path d="M245 690Q285 525 420 570Q520 430 620 565Q755 515 815 700Z" fill="#805139"/><path d="M335 625Q420 565 500 625M555 590Q640 535 725 615" fill="none" stroke="#A97852" stroke-width="25" stroke-linecap="round"/><circle cx="430" cy="520" r="22" fill="#6B422F"/>';
    case 'scoop':
    case 'scoop-filled':
      return `<path d="M250 720L690 280" stroke="#D98C45" stroke-width="86" stroke-linecap="round"/><path d="M178 756Q250 640 365 710L462 810Q290 915 178 756Z" fill="#6EB1C8" stroke="#39798E" stroke-width="22"/>${kind === 'scoop-filled' ? '<path d="M215 747Q286 690 370 742L421 796Q295 852 215 747Z" fill="#805139"/>' : ''}`;
    case 'drainage':
      return '<ellipse cx="512" cy="540" rx="300" ry="245" fill="#D77D45" stroke="#8D5135" stroke-width="28"/><ellipse cx="512" cy="540" rx="95" ry="70" fill="#3D2A24"/><path d="M310 470Q512 330 714 470" fill="none" stroke="#F0A16B" stroke-width="30" stroke-linecap="round" opacity=".75"/>';
    case 'hole':
      return '<ellipse cx="512" cy="535" rx="265" ry="132" fill="#4B3028"/><ellipse cx="512" cy="504" rx="205" ry="82" fill="#241915"/><path d="M324 493Q510 392 700 493" fill="none" stroke="#875943" stroke-width="25" stroke-linecap="round"/>';
    case 'soil-bag':
      return '<path d="M265 175H760L820 842Q520 930 205 842Z" fill="#F4E2B8" stroke="#8A6646" stroke-width="24"/><rect x="282" y="333" width="460" height="325" rx="42" fill="#79B873"/><path d="M385 620Q512 398 640 620Z" fill="#805139"/><path d="M512 524V414M512 460Q450 426 420 362M512 460Q575 426 605 362" stroke="#E9F5D8" stroke-width="30" stroke-linecap="round"/>';
    case 'seed-packet':
      return '<path d="M250 168H774L818 862H206Z" fill="#F5D17B" stroke="#A86A43" stroke-width="25"/><rect x="285" y="310" width="454" height="370" rx="38" fill="#FFF7DC"/><path d="M512 610V435M512 505Q430 472 394 390M512 505Q594 472 630 390" stroke="#72AF6B" stroke-width="34" stroke-linecap="round"/><ellipse cx="512" cy="628" rx="128" ry="50" fill="#805139"/>';
    case 'seed':
      return '<ellipse cx="512" cy="512" rx="170" ry="235" fill="#C99B55" transform="rotate(-22 512 512)"/><path d="M455 310Q570 488 545 720" fill="none" stroke="#8D663A" stroke-width="25" stroke-linecap="round"/>';
    case 'finger':
      return '<path d="M370 800V410Q370 325 444 325Q512 325 512 405V525V252Q512 170 586 170Q660 170 660 252V590L730 520Q785 466 840 515Q895 568 845 630L670 842Q610 910 510 900Q370 884 370 800Z" fill="#F2B894" stroke="#B87358" stroke-width="24"/><path d="M548 248Q586 215 624 248" fill="none" stroke="#D38C72" stroke-width="15" stroke-linecap="round"/>';
    case 'label':
      return '<path d="M478 440H546V910H478Z" fill="#98704D"/><rect x="245" y="150" width="534" height="420" rx="46" fill="#F6E7A6" stroke="#8EA866" stroke-width="24"/><path d="M350 330H675M350 412H610" stroke="#71915A" stroke-width="28" stroke-linecap="round"/>';
    case 'planted-label':
      return '<path d="M478 355H546V930H478Z" fill="#98704D"/><rect x="260" y="120" width="504" height="360" rx="42" fill="#F6E7A6" stroke="#8EA866" stroke-width="24"/><path d="M355 290H670M355 370H610" stroke="#71915A" stroke-width="27" stroke-linecap="round"/>';
    case 'water':
      return '<path d="M512 105Q755 405 755 610Q755 855 512 900Q269 855 269 610Q269 405 512 105Z" fill="#70BDE3" stroke="#3B89B4" stroke-width="28"/><path d="M405 630Q455 730 565 752" fill="none" stroke="#DDF5FF" stroke-width="34" stroke-linecap="round" opacity=".8"/>';
    case 'watering-can':
      return '<path d="M245 400H675Q745 400 745 480V765H260Q205 765 205 710V455Q205 400 245 400Z" fill="#78B88A" stroke="#397653" stroke-width="25"/><path d="M675 470L900 290L942 350L730 565" fill="#78B88A" stroke="#397653" stroke-width="25"/><path d="M285 400Q310 205 505 205Q665 205 700 400" fill="none" stroke="#397653" stroke-width="44" stroke-linecap="round"/><circle cx="350" cy="580" r="72" fill="#A8D4A7"/>';
    case 'damp':
      return '<path d="M180 690Q235 495 380 530Q475 410 565 535Q700 450 844 690Z" fill="#5A3B2C"/><path d="M305 624Q390 548 480 620M555 585Q645 525 738 604" fill="none" stroke="#9B755B" stroke-width="24" stroke-linecap="round"/><path d="M515 160Q650 330 650 438Q650 565 515 595Q380 565 380 438Q380 330 515 160Z" fill="#74BDE0"/>';
    case 'sprout':
      return '<path d="M510 835V410" stroke="#4E9B59" stroke-width="54" stroke-linecap="round"/><path d="M500 515Q350 300 180 385Q245 585 500 590Z" fill="#76BD68" stroke="#438D4C" stroke-width="24"/><path d="M525 430Q650 220 845 315Q775 535 525 520Z" fill="#8BCF72" stroke="#438D4C" stroke-width="24"/><ellipse cx="512" cy="842" rx="250" ry="70" fill="#805139"/>';
    case 'time':
      return '<circle cx="512" cy="512" r="340" fill="#EAF3FB" stroke="#668DB7" stroke-width="28"/><path d="M512 172A340 340 0 0 1 512 852Z" fill="#31567F"/><circle cx="403" cy="410" r="98" fill="#F4C95D"/><path d="M640 385Q745 345 790 435Q665 470 640 385Z" fill="#F4E8B0"/><path d="M512 245V340M512 685V780M245 512H340M685 512H780" stroke="#FFFFFF" stroke-width="24" stroke-linecap="round" opacity=".75"/>';
    case 'spout':
      return '<path d="M155 655L680 250Q770 180 855 270L900 320L330 790Z" fill="#78B88A" stroke="#397653" stroke-width="26"/><path d="M130 620Q240 600 310 720Q215 825 115 755Z" fill="#9FD0AA" stroke="#397653" stroke-width="24"/><circle cx="168" cy="684" r="15" fill="#397653"/><circle cx="220" cy="700" r="15" fill="#397653"/>';
    case 'puddle-card':
      return '<path d="M235 650Q305 485 425 575Q510 420 620 570Q760 500 820 675Q650 810 285 765Z" fill="#73BFE3" stroke="#3B89B4" stroke-width="24"/><path d="M272 290L752 770M752 290L272 770" stroke="#E46E61" stroke-width="58" stroke-linecap="round"/>';
    case 'puddle':
      return '<path d="M120 620Q185 420 360 520Q475 350 600 530Q790 425 905 635Q780 820 250 790Q135 770 120 620Z" fill="#70BDE3" stroke="#3B89B4" stroke-width="25"/><ellipse cx="420" cy="610" rx="160" ry="62" fill="#B9E8F7" opacity=".7"/>';
    default:
      return '<circle cx="512" cy="512" r="270" fill="#8BCB85"/><path d="M390 535L475 620L650 410" fill="none" stroke="#FFFFFF" stroke-width="52" stroke-linecap="round" stroke-linejoin="round"/>';
  }
}

function makeActionIllustrationSvg(kind) {
  const icon =
    kind === 'water-gently'
      ? '<path d="M220 420H535V690H250Q220 690 220 660Z" fill="#78B88A" stroke="#397653" stroke-width="24"/><path d="M505 455L765 255" fill="none" stroke="#397653" stroke-width="70" stroke-linecap="round"/><path d="M720 465Q790 555 790 615Q790 695 720 715Q650 695 650 615Q650 555 720 465Z" fill="#70BDE3"/>'
      : kind === 'wait-sprout'
        ? '<circle cx="310" cy="420" r="165" fill="#EAF3FB" stroke="#668DB7" stroke-width="22"/><path d="M310 255A165 165 0 0 1 310 585Z" fill="#31567F"/><circle cx="255" cy="385" r="52" fill="#F4C95D"/><path d="M605 745V420M595 520Q495 390 395 448Q455 580 595 575ZM620 465Q710 350 830 415Q770 545 620 535Z" fill="#76BD68" stroke="#438D4C" stroke-width="20"/><ellipse cx="615" cy="755" rx="190" ry="55" fill="#805139"/><path d="M468 530H540" stroke="#72AD58" stroke-width="36" stroke-linecap="round"/><path d="M525 488L570 530L525 572" fill="none" stroke="#72AD58" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>'
        : kind === 'leave-space'
          ? '<path d="M310 315H714L665 830H360Z" fill="#D77D45" stroke="#8D5135" stroke-width="25"/><ellipse cx="512" cy="315" rx="220" ry="72" fill="#F0A16B"/><ellipse cx="512" cy="360" rx="170" ry="42" fill="#805139"/><path d="M290 220H735" stroke="#72AD58" stroke-width="24" stroke-dasharray="32 24"/>'
          : '<path d="M310 315H714L665 830H360Z" fill="#D77D45" stroke="#8D5135" stroke-width="25"/><ellipse cx="512" cy="315" rx="220" ry="72" fill="#F0A16B"/><ellipse cx="512" cy="330" rx="175" ry="48" fill="#805139"/><ellipse cx="512" cy="285" rx="48" ry="28" fill="#3D2A24"/><ellipse cx="512" cy="180" rx="32" ry="48" fill="#C99B55"/>';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    ${icon}
  </svg>`;
}

async function generateMapIcons() {
  const iconDir = join(repoRoot, 'src/assets/icons/skids');
  const specs = [
    ['theme-little-garden.png', 'theme'],
    ['prepare-the-pot.png', 'prepare'],
    ['plant-the-seed.png', 'plant'],
    ['first-watering.png', 'water'],
    ['milestone-plant-a-seed.png', 'milestone'],
  ];
  mkdirSync(iconDir, { recursive: true });
  for (const [fileName, kind] of specs) {
    const target = join(iconDir, fileName);
    if (existsSync(target) && !force) {
      skipped += 1;
      continue;
    }
    await sharp(Buffer.from(makeMapIconSvg(kind)))
      .resize({ fit: 'inside', height: 320, width: 320 })
      .png({
        colors: 256,
        compressionLevel: 9,
        effort: 10,
        palette: true,
        quality: 92,
      })
      .toFile(target);
    created += 1;
  }
}

function makeMapIconSvg(kind) {
  const center =
    kind === 'prepare'
      ? '<path d="M290 520H734L675 830H350Z" fill="#DC8649" stroke="#8D5537" stroke-width="26"/><path d="M235 515H790" stroke="#E9A06B" stroke-width="72" stroke-linecap="round"/><path d="M725 330L850 205" stroke="#70AECB" stroke-width="55" stroke-linecap="round"/><path d="M635 420Q715 315 815 400L870 465Q735 525 635 420Z" fill="#79B9D2"/>'
      : kind === 'plant'
        ? '<path d="M290 555H734L675 850H350Z" fill="#DC8649" stroke="#8D5537" stroke-width="26"/><ellipse cx="512" cy="552" rx="220" ry="70" fill="#805139"/><ellipse cx="512" cy="350" rx="60" ry="88" fill="#C99B55" transform="rotate(-20 512 350)"/><path d="M512 430V490" stroke="#6A9D56" stroke-width="24" stroke-linecap="round"/>'
        : kind === 'water'
          ? '<path d="M215 535H620V785H245Q215 785 215 755Z" fill="#73B889" stroke="#397653" stroke-width="25"/><path d="M590 560L825 365" fill="none" stroke="#397653" stroke-width="76" stroke-linecap="round"/><path d="M800 510Q900 635 900 708Q900 810 800 835Q700 810 700 708Q700 635 800 510Z" fill="#70BDE3"/>'
          : kind === 'milestone'
            ? '<path d="M280 610H744L690 850H334Z" fill="#DC8649" stroke="#8D5537" stroke-width="26"/><ellipse cx="512" cy="605" rx="228" ry="65" fill="#805139"/><path d="M512 610V300" stroke="#4D9857" stroke-width="42" stroke-linecap="round"/><path d="M500 420Q365 270 250 350Q330 500 500 500ZM525 360Q650 225 790 310Q710 465 525 445Z" fill="#79BF6B" stroke="#438D4C" stroke-width="20"/><path d="M780 170L820 250L910 263L845 327L860 417L780 375L700 417L715 327L650 263L740 250Z" fill="#F3C85B"/>'
            : '<path d="M205 680Q260 450 405 520Q510 335 625 520Q790 425 870 690Q700 855 310 825Z" fill="#7AB86D"/><path d="M512 700V365" stroke="#F1E1BA" stroke-width="45" stroke-linecap="round"/><path d="M500 500Q365 345 250 425Q325 585 500 575ZM525 430Q655 280 810 375Q730 540 525 520Z" fill="#A9D87E" stroke="#4D8750" stroke-width="22"/>';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#F4F0D8"/><stop offset="1" stop-color="#CDE8BC"/></linearGradient><filter id="shadow"><feDropShadow dx="0" dy="26" stdDeviation="20" flood-color="#2F5138" flood-opacity=".22"/></filter></defs>
    <rect x="55" y="55" width="914" height="914" rx="220" fill="url(#bg)"/>
    <circle cx="230" cy="220" r="78" fill="#F4CF61" opacity=".9"/>
    <g filter="url(#shadow)">${center}</g>
  </svg>`;
}
