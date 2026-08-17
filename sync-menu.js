// Sync prices from index.html (source of truth) into menu.html.
// Run: node sync-menu.js
//
// Positional sync: menu.html mirrors index.html structurally, so we walk
// each item type in order and copy the price value across. This handles
// duplicate dish names (e.g. Sauvignon Blanc appears in White AND Alcohol Free).

const fs = require('fs');
const path = require('path');

const root = __dirname;
const srcFile = path.join(root, 'index.html');
const dstFile = path.join(root, 'menu.html');

const src = fs.readFileSync(srcFile, 'utf8');
let dst = fs.readFileSync(dstFile, 'utf8');

// Each pattern has 3 groups: prefix / PRICE / suffix. Group 2 = price to copy.
const PATTERNS = [
  { name: 'food', re: /(<span class="fi-name">[^<]+<\/span><span class="fi-price">)([^<]*)(<\/span>)/ },
  { name: 'wine', re: /(<span class="wname">[^<]+<\/span>\s*<div class="wprices">)([\s\S]*?)(<\/div>)/ },
  { name: 'spirits/soft', re: /(<span class="sg-name">[^<]+<\/span><span class="sg-price">)([^<]*)(<\/span>)/ },
  { name: 'beer', re: /(<div class="beer-name">[^<]+<\/div>[\s\S]*?<div class="beer-price"[^>]*>)([^<]*)(<\/div>)/ },
  { name: 'olives', re: /(<div class="olives-title">Olives <span class="til">)([^<]*)(<\/span><\/div>)/ },
];

function syncType(srcHtml, dstHtml, re) {
  const srcPrices = [];
  let m;
  const re1 = new RegExp(re.source, 'g');
  while ((m = re1.exec(srcHtml)) !== null) srcPrices.push(m[2]);

  if (srcPrices.length === 0) return { out: dstHtml, count: 0 };

  let i = 0;
  let count = 0;
  const re2 = new RegExp(re.source, 'g');
  const out = dstHtml.replace(re2, (match, p1, p2, p3) => {
    const val = srcPrices[i] !== undefined ? srcPrices[i] : p2;
    if (val !== p2) count++;
    i++;
    return p1 + val + p3;
  });
  return { out, count };
}

let changes = 0;
for (const p of PATTERNS) {
  const r = syncType(src, dst, p.re);
  dst = r.out;
  changes += r.count;
}

fs.writeFileSync(dstFile, dst, 'utf8');
console.log(`Synced ${changes} price item(s) from index.html → menu.html`);
