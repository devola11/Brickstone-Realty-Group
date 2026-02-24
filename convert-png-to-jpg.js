const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'images');

const pngFiles = fs.readdirSync(imagesDir).filter(f => f.toLowerCase().endsWith('.png'));

if (pngFiles.length === 0) {
  console.log('No PNG files found in images/');
  process.exit(0);
}

console.log(`Converting ${pngFiles.length} PNG file(s) to JPG...\n`);

(async () => {
  let converted = 0;
  let errors = 0;

  for (const file of pngFiles) {
    const inputPath  = path.join(imagesDir, file);
    const outputName = file.replace(/\.png$/i, '.jpg');
    const outputPath = path.join(imagesDir, outputName);

    try {
      await sharp(inputPath)
        .flatten({ background: { r: 255, g: 255, b: 255 } }) // fill transparency with white
        .jpeg({ quality: 90, mozjpeg: false })
        .toFile(outputPath);

      console.log(`  OK  ${file} → ${outputName}`);
      converted++;
    } catch (err) {
      console.error(`  ERR ${file}: ${err.message}`);
      errors++;
    }
  }

  console.log(`\nDone. ${converted} converted, ${errors} error(s).`);
})();
