/**
 * Generates the original, license-free placeholder assets in /public/demo
 * used by the demo seed: themed SVG illustrations, neutral portrait
 * silhouettes and small labelled PDFs. Every asset says "DEMO".
 *
 *   node scripts/generate-demo-assets.mjs
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "demo");
fs.mkdirSync(OUT, { recursive: true });

const PALETTES = {
  teal: ["#0f5f5a", "#1f8a7d", "#f3c969"],
  maroon: ["#6d1f2b", "#a8404f", "#f2c38b"],
  indigo: ["#2c2f6b", "#4f56a8", "#9fd3c7"],
  forest: ["#1f4d2b", "#3f7d4a", "#e6d38a"],
  ochre: ["#7a4a12", "#c07a26", "#fbe3b0"],
  plum: ["#4a2346", "#7f3f78", "#f4b6a6"],
};

const S = 'fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"';

/** Simple geometric icons, drawn in a 240×240 box. */
const ICONS = {
  learning: `<path ${S} d="M20 70 120 30l100 40-100 40z"/><path ${S} d="M60 90v60c0 20 120 20 120 0V90"/><path ${S} d="M220 70v70"/>`,
  digital: `<rect ${S} x="30" y="40" width="180" height="120" rx="12"/><path ${S} d="M10 190h220M90 100l-20 20 20 20M150 100l20 20-20 20"/>`,
  youth: `<path ${S} d="M40 200 100 130l40 30 60-90"/><path ${S} d="M160 70h40v40"/><circle cx="60" cy="60" r="18" fill="#fff" opacity=".9"/>`,
  women: `<circle ${S} cx="120" cy="70" r="36"/><path ${S} d="M120 106v100M80 160h80M60 230c10-40 110-40 120 0"/>`,
  green: `<path ${S} d="M120 220V110"/><path ${S} d="M120 150c-60 0-80-50-70-100 50 0 80 30 70 100zM120 130c50 0 70-40 60-80-40 0-65 25-60 80z"/>`,
  school: `<path ${S} d="M40 200 170 70l30 30L70 230H40z"/><path ${S} d="M150 90l30 30"/><path ${S} d="M30 40h80"/>`,
  health: `<path ${S} d="M120 210C40 150 20 110 40 75c20-35 65-30 80 5 15-35 60-40 80-5 20 35 0 75-80 135z"/><path ${S} d="M95 120h50M120 95v50"/>`,
  volunteers: `<circle ${S} cx="70" cy="80" r="26"/><circle ${S} cx="170" cy="80" r="26"/><path ${S} d="M20 200c0-45 30-70 50-70s50 25 50 70M120 200c0-45 30-70 50-70s50 25 50 70"/>`,
  reading: `<path ${S} d="M120 70c-30-25-70-25-100-15v140c30-10 70-10 100 15 30-25 70-25 100-15V55c-30-10-70-10-100 15z"/><path ${S} d="M120 70v140"/>`,
  nutrition: `<path ${S} d="M30 120h180c0 55-40 90-90 90s-90-35-90-90z"/><path ${S} d="M90 90c0-30 20-40 30-60M140 95c5-25 25-35 45-35"/>`,
  meeting: `<circle ${S} cx="120" cy="120" r="50"/><circle cx="120" cy="30" r="16" fill="#fff"/><circle cx="210" cy="120" r="16" fill="#fff"/><circle cx="120" cy="210" r="16" fill="#fff"/><circle cx="30" cy="120" r="16" fill="#fff"/>`,
  cleanliness: `<path ${S} d="M70 60h100l-10 150H80z"/><path ${S} d="M50 60h140M100 60V35h40v25M105 100v80M135 100v80"/>`,
  community: `<path ${S} d="M20 210V120l60-50 60 50v90M140 210v-60l40-35 40 35v60"/><path ${S} d="M10 210h220M65 210v-45h30v45"/>`,
  report: `<path ${S} d="M60 20h90l40 40v160H60z"/><path ${S} d="M150 20v40h40M90 110h70M90 145h70M90 180h45"/>`,
};

function kolam(color) {
  // A quiet dot-and-loop motif inspired by kolam floor drawings.
  return `<pattern id="k" width="60" height="60" patternUnits="userSpaceOnUse">
    <circle cx="30" cy="30" r="2.5" fill="${color}" opacity=".35"/>
    <path d="M30 12a18 18 0 0 1 18 18M30 48a18 18 0 0 1-18-18" fill="none" stroke="${color}" stroke-opacity=".18" stroke-width="2"/>
  </pattern>`;
}

function demoChip(x, y) {
  return `<g transform="translate(${x} ${y})"><rect width="118" height="34" rx="17" fill="#000" fill-opacity=".28"/><text x="59" y="23" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" letter-spacing="3" fill="#fff">DEMO</text></g>`;
}

function illustration(icon, palette, variant = 0) {
  const [dark, mid, accent] = PALETTES[palette];
  const cx = [800, 600, 380][variant % 3];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675" role="img" aria-label="Demo illustration">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${dark}"/><stop offset="1" stop-color="${mid}"/></linearGradient>
    ${kolam("#fff")}
  </defs>
  <rect width="1200" height="675" fill="url(#g)"/>
  <rect width="1200" height="675" fill="url(#k)"/>
  <circle cx="${cx}" cy="338" r="250" fill="${accent}" opacity=".16"/>
  <circle cx="${cx}" cy="338" r="170" fill="${accent}" opacity=".22"/>
  <path d="M0 560c200-60 400-60 600 0s400 60 600 0v115H0z" fill="#000" opacity=".12"/>
  <g transform="translate(${cx - 120} 218)">${ICONS[icon]}</g>
  ${demoChip(40, 40)}
</svg>
`;
}

function portrait(palette) {
  const [dark, mid, accent] = PALETTES[palette];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480" width="400" height="480" role="img" aria-label="Demo portrait placeholder">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/></linearGradient>${kolam("#fff")}</defs>
  <rect width="400" height="480" fill="url(#g)"/>
  <rect width="400" height="480" fill="url(#k)"/>
  <circle cx="200" cy="190" r="78" fill="${accent}" opacity=".9"/>
  <path d="M60 480c10-110 70-170 140-170s130 60 140 170z" fill="${accent}" opacity=".9"/>
  ${demoChip(141, 24)}
</svg>
`;
}

function certificate() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 640" width="900" height="640" role="img" aria-label="Demo certificate example">
  <rect width="900" height="640" fill="#fbf7ee"/>
  <rect x="24" y="24" width="852" height="592" fill="none" stroke="#b08a3e" stroke-width="6"/>
  <rect x="44" y="44" width="812" height="552" fill="none" stroke="#b08a3e" stroke-width="1.5"/>
  <text x="450" y="150" text-anchor="middle" font-family="Georgia, serif" font-size="46" fill="#3c2f1a">Certificate Example</text>
  <text x="450" y="205" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" letter-spacing="4" fill="#8a6d33">DEMO — NOT A REAL CERTIFICATE</text>
  <path d="M250 300h400M250 360h400M320 420h260" stroke="#d9c8a3" stroke-width="3"/>
  <circle cx="450" cy="510" r="46" fill="none" stroke="#b08a3e" stroke-width="4"/>
  <text x="450" y="517" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#b08a3e">DEMO</text>
</svg>
`;
}

/** Minimal valid single-page PDF (Helvetica, ASCII text). */
function pdf(title, lines) {
  const esc = (t) => t.replace(/[\\()]/g, (m) => `\\${m}`);
  const text = [
    "BT /F1 22 Tf 60 760 Td",
    `(${esc(title)}) Tj`,
    "/F1 12 Tf 0 -34 Td (DEMO DOCUMENT - FICTIONAL CONTENT FOR TRUSTFOLIO) Tj",
    ...lines.map((l) => `0 -22 Td (${esc(l)}) Tj`),
    "ET",
    "0.8 0.2 0.2 RG 4 w 40 40 515 762 re S",
  ].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(text)} >>\nstream\n${text}\nendstream`,
  ];
  let body = "%PDF-1.4\n";
  const offsets = [];
  objects.forEach((obj, i) => {
    offsets.push(Buffer.byteLength(body));
    body += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xref = Buffer.byteLength(body);
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`;
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return body;
}

const ILLUSTRATIONS = [
  ["learning-hub", "learning", "teal", 0],
  ["digital-literacy", "digital", "indigo", 0],
  ["youth-skills", "youth", "ochre", 0],
  ["women-digital", "women", "plum", 0],
  ["green-community", "green", "forest", 0],
  ["school-support", "school", "maroon", 0],
  ["health-awareness", "health", "maroon", 1],
  ["volunteer-network", "volunteers", "teal", 1],
  ["reading-program", "reading", "indigo", 1],
  ["nutrition", "nutrition", "ochre", 1],
  ["consultation", "meeting", "plum", 1],
  ["cleanliness", "cleanliness", "forest", 1],
  ["community", "community", "teal", 2],
  ["tree-plantation", "green", "forest", 2],
  ["career-awareness", "youth", "indigo", 2],
  ["supplies", "school", "ochre", 2],
  ["workshop", "digital", "teal", 2],
  ["orientation", "volunteers", "plum", 2],
  ["report", "report", "indigo", 1],
  ["trust", "community", "maroon", 0],
];

for (const [name, icon, palette, variant] of ILLUSTRATIONS) {
  fs.writeFileSync(path.join(OUT, `${name}.svg`), illustration(icon, palette, variant));
}

const PORTRAITS = ["teal", "maroon", "indigo", "forest", "ochre", "plum", "teal", "indigo", "maroon", "forest", "ochre"];
PORTRAITS.forEach((palette, i) => fs.writeFileSync(path.join(OUT, `person-${i + 1}.svg`), portrait(palette)));

fs.writeFileSync(path.join(OUT, "certificate.svg"), certificate());

const NOTE = [
  "Aram Community Trust is a fictional organisation created to demonstrate",
  "the Trustfolio platform. This file is not an official, registered,",
  "audited or government-approved record of any organisation.",
  "",
  "Remove all demo content before launch:  npm run db:demo:clear",
];
const PDFS = [
  ["trust-profile-sample", "Trust Profile Sample"],
  ["activity-report", "Demo Activity Report"],
  ["annual-report", "Demo Annual Report"],
  ["project-report", "Demo Project Report"],
  ["policy-document", "Demo Policy Document"],
  ["certificate-example", "Demo Certificate Example"],
];
for (const [name, title] of PDFS) fs.writeFileSync(path.join(OUT, `${name}.pdf`), pdf(title, NOTE));

console.log(`Wrote ${ILLUSTRATIONS.length} illustrations, ${PORTRAITS.length} portraits, 1 certificate and ${PDFS.length} PDFs to public/demo`);
