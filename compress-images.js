const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const DIR = path.join(__dirname, 'images');
const QUALITY = 75;
const THRESHOLD = 80000;

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg'));

(async () => {
  let totalSaved = 0;
  for (const f of files) {
    const fp = path.join(DIR, f);
    const size = fs.statSync(fp).size;
    if (size <= THRESHOLD) { console.log('SKIP ' + f + ' (' + Math.round(size/1024) + 'KB)'); continue; }
    const tmp = fp + '.tmp';
    await sharp(fp).resize(800, null, { withoutEnlargement: true }).jpeg({ quality: QUALITY, mozjpeg: true }).toFile(tmp);
    const newSize = fs.statSync(tmp).size;
    fs.renameSync(tmp, fp);
    const saved = size - newSize;
    totalSaved += saved;
    console.log(f + ': ' + Math.round(size/1024) + 'KB -> ' + Math.round(newSize/1024) + 'KB (saved ' + Math.round(saved/1024) + 'KB, ' + Math.round((1-newSize/size)*100) + '%)');
  }
  console.log('\nTotal saved: ' + Math.round(totalSaved/1024) + 'KB');
})();
