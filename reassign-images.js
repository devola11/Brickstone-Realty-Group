// Image reassignment script — replaces images at exact line numbers
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'index.html');
const lines = fs.readFileSync(FILE, 'utf8').split('\n');

// Map: line number (1-based) → new image filename
// src= lines
const SRC_REPLACEMENTS = {
  // Card 1 — Harlem 1-Bed
  905:  'images/image66.jpg',          // Living Room
  917:  'images/image61.jpg',          // Bedroom
  929:  'images/image63.jpg',          // Kitchen
  941:  'images/image-toilet1.jpg',    // Bathroom ← toilet

  // Card 2 — Bed-Stuy 2-Bed
  1131: 'images/image72.jpg',          // Living Room
  1142: 'images/image65.jpg',          // Bedroom
  1153: 'images/image64.jpg',          // Kitchen
  1164: 'images/image-toilet2.jpg',    // Bathroom ← toilet

  // Card 3 — Astoria Studio
  1331: 'images/image76.jpg',          // Living Space
  1342: 'images/image69.jpg',          // Sleeping Area
  1353: 'images/image67.jpg',          // Kitchen
  1364: 'images/image-toilet3.jpg',    // Bathroom ← toilet

  // Card 4 — Riverdale 3-Bed
  1523: 'images/image73.jpg',          // Master Bedroom
  1534: 'images/image68.jpg',          // Kitchen
  1545: 'images/image-toilet4.jpg',    // Bathroom ← toilet

  // Card 5 — Crown Heights 2-Bed
  1704: 'images/image74.jpg',          // Bedroom
  1715: 'images/image70.jpg',          // Kitchen
  1726: 'images/image-toilet5.jpg',    // Bathroom ← toilet

  // Card 6 — Washington Heights 1-Bed
  1885: 'images/image75.jpg',          // Bedroom
  1896: 'images/image71.jpg',          // Kitchen
  1907: 'images/image-toilet6.jpg',    // Bathroom ← toilet

  // Card 7 — Jackson Heights 2-Bed
  2066: 'images/image79.jpg',          // Bedroom
  2077: 'images/image78.jpg',          // Kitchen
  2088: 'images/image-toilet7.jpg',    // Bathroom ← toilet

  // Card 8 — St. George 1-Bed
  2248: 'images/image80.jpg',          // Bedroom
  2270: 'images/image-toilet8.jpg',    // Bathroom ← toilet

  // Card 9 — Fordham 2-Bed
  2452: 'images/image-toilet9.jpg',    // Bathroom ← toilet

  // Card 10 — Tottenville Studio
  2633: 'images/image-toilet10.jpg',   // Bathroom ← toilet

  // Card 11 — Inwood 1-Bed
  2834: 'images/image-toilet11.jpg',   // Bathroom ← toilet

  // Card 12 — Flushing 3-Bed
  3035: 'images/image-toilet12.jpg',   // Bathroom ← toilet
};

let changed = 0;
for (const [lineNo, newImage] of Object.entries(SRC_REPLACEMENTS)) {
  const idx = Number(lineNo) - 1;
  const original = lines[idx];
  // Replace src="images/..." preserving surrounding whitespace/quotes
  const updated = original.replace(/src="images\/[^"]*"/, `src="${newImage}"`);
  if (updated !== original) {
    lines[idx] = updated;
    console.log(`Line ${lineNo}: ${original.trim()} → ${updated.trim()}`);
    changed++;
  } else {
    console.warn(`Line ${lineNo}: NO MATCH — ${original.trim()}`);
  }
}

fs.writeFileSync(FILE, lines.join('\n'), 'utf8');
console.log(`\nDone — ${changed} lines updated.`);
