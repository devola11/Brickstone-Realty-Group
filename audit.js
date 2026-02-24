const fs   = require('fs');
const path = require('path');
const html = fs.readFileSync('index.html', 'utf8');

const inFolder = fs.readdirSync('images').filter(f => /\.(jpg|jpeg|png|webp|svg)$/i.test(f));
const used     = inFolder.filter(f => html.includes('images/' + f));
const unused   = inFolder.filter(f => !html.includes('images/' + f));

console.log('USED (' + used.length + '):');
used.forEach(f => console.log('  ' + f));
console.log('\nUNUSED (' + unused.length + '):');
unused.forEach(f => console.log('  ' + f));

// Sizes
let unusedBytes = 0;
unused.forEach(f => { unusedBytes += fs.statSync(path.join('images', f)).size; });
console.log('\nUnused images total size: ' + (unusedBytes / 1024 / 1024).toFixed(2) + ' MB');
