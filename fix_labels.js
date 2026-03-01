const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(filePath, 'utf8');

// Normalize line endings
html = html.replace(/\r\n/g, '\n');

// Correct labels keyed by image src path (as it appears in index.html)
const labels = {
  // Card 1 – Harlem
  'images/image.jpg':   'Living Room',
  'images/image1.jpg':  'Kitchen',
  'images/image2.jpg':  'Kitchen',
  'images/image4.jpg':  'Kitchen',
  'images/image5.jpg':  'Kitchen',
  'images/image6.jpg':  'Kitchen',
  'images/image7.jpg':  'Kitchen',
  'images/image8.jpg':  'Bathroom',
  'images/image9.jpg':  'Bathroom',
  'images/image10.jpg': 'Kitchen',
  'images/image11.jpg': 'Living Room',
  'images/image12.jpg': 'Kitchen',
  'images/image13.jpg': 'Bedroom',
  // Card 2 – Bed-Stuy
  'images/image14.jpg': 'Bedroom',
  'images/image15.jpg': 'Kitchen',
  'images/image16.jpg': 'Kitchen',
  'images/image17.jpg': 'Bathroom',
  'images/image18.jpg': 'Living Room',
  'images/image19.jpg': 'Bedroom',
  'images/image20.jpg': 'Bedroom',
  'images/image21.jpg': 'Kitchen',
  'images/image22.jpg': 'Kitchen',
  'images/image23.jpg': 'Bathroom',
  'images/image24.jpg': 'Kitchen',
  'images/image25.jpg': 'Bedroom',
  'images/image26.jpg': 'Bathroom',
  // Card 3 – High-rise
  'images/image27.jpg': 'Living Room',
  'images/image28.jpg': 'Kitchen',
  'images/image29.jpg': 'Bedroom',
  'images/image30.jpg': 'Bedroom',
  'images/image31.jpg': 'Kitchen',
  'images/image32.jpg': 'Bathroom',
  'images/image33.jpg': 'Living Room',
  'images/image34.jpg': 'Living Room',
  'images/image35.jpg': 'Bedroom',
  'images/image36.jpg': 'Bedroom',
  'images/image37.jpg': 'Bedroom',
  'images/image38.jpg': 'Bathroom',
  'images/image39.jpg': 'Bedroom',
  // Card 4 – Suburban/green
  'images/image40.jpg': 'Kitchen',
  'images/image41.jpg': 'Bedroom',
  'images/image42.jpg': 'Living Room',
  'images/image43.jpg': 'Kitchen',
  'images/image44.jpg': 'Bedroom',
  'images/image45.jpg': 'Living Room',
  'images/image46.jpg': 'Bedroom',
  'images/image47.jpg': 'Kitchen',
  'images/image48.jpg': 'Living Room',
  'images/image49.jpg': 'Kitchen',
  'images/image50.jpg': 'Kitchen',
  'images/image51.jpg': 'Living Room',
  'images/image52.jpg': 'Living Room',
  // Card 5 – Suburban with yard
  'images/image53.jpg': 'Bedroom',
  'images/image54.jpg': 'Bathroom',
  'images/image55.jpg': 'Living Room',
  'images/image56.jpg': 'Bedroom',
  'images/image57.jpg': 'Bathroom',
  'images/image58.jpg': 'Living Room',
  'images/image59.jpg': 'Living Room',
  'images/image60.jpg': 'Kitchen',
  'images/image61.jpg': 'Living Room',
  'images/image62.jpg': 'Bedroom',
  'images/image63.jpg': 'Bathroom',
  'images/image64.jpg': 'Bedroom',
  'images/image65.jpg': 'Bedroom',
  // Card 6 – NYC brownstone/co-living
  'images/image66.jpg': 'Living Room',
  'images/image67.jpg': 'Living Room',
  'images/image68.jpg': 'Living Room',
  'images/image69.jpg': 'Kitchen',
  'images/image70.jpg': 'Bedroom',
  'images/image71.jpg': 'Living Room',
  'images/image72.jpg': 'Kitchen',
  'images/image73.jpg': 'Bedroom',
  'images/image75.jpg': 'Bedroom',
  'images/image76.jpg': 'Bedroom',
  'images/image77.jpg': 'Bathroom',
  'images/image78.jpg': 'Bedroom',
  'images/image79.jpg': 'Bedroom',
  // Card 7 – California bungalow
  'images/image80.jpg': 'Bathroom',
  'images/image81.jpg': 'Kitchen',
  'images/image82.jpg': 'Bedroom',
  'images/image83.jpg': 'Bedroom',
  'images/image84.jpg': 'Living Room',
  'images/image85.jpg': 'Living Room',
  'images/image86.jpg': 'Bedroom',
  'images/image87.jpg': 'Kitchen',
  'images/image88.jpg': 'Kitchen',
  'images/image89.jpg': 'Living Room',
  'images/image90.jpg': 'Living Room',
  'images/image91.jpg': 'Kitchen',
  'images/image92.jpg': 'Kitchen',
  // Card 8 – California bungalow (continued)
  'images/image93.jpg':  'Living Room',
  'images/image94.jpg':  'Bedroom',
  'images/image95.jpg':  'Bedroom',
  'images/image96.jpg':  'Bathroom',
  'images/image97.jpg':  'Bedroom',
  'images/image98.jpg':  'Bedroom',
  'images/image99.jpg':  'Living Room',
  'images/image100.jpg': 'Bedroom',
  'images/image101.jpg': 'Living Room',
  'images/image102.jpg': 'Kitchen',
  'images/image103.jpg': 'Living Room',
  'images/image104.jpg': 'Bedroom',
  'images/image105.jpg': 'Bathroom',
  // Card 9 – Fordham 2-Bedroom
  'images/image106.jpg': 'Living Room',
  'images/image107.jpg': 'Kitchen',
  'images/image108.jpg': 'Living Room',
  'images/image109.jpg': 'Living Room',
  'images/image110.jpg': 'Bedroom',
  'images/image111.jpg': 'Kitchen',
  'images/image112.jpg': 'Kitchen',
  'images/image113.jpg': 'Bathroom',
  'images/image114.jpg': 'Bedroom',
  'images/image115.jpg': 'Bathroom',
  'images/image116.jpg': 'Bedroom',
  'images/image117.jpg': 'Bathroom',
  'images/image118.jpg': 'Bedroom',
  // Card 10 – Tottenville Studio
  'images/image119.jpg': 'Bedroom',
  'images/image120.jpg': 'Bathroom',
  'images/image121.jpg': 'Living Room',
  'images/image122.jpg': 'Living Room',
  'images/image123.jpg': 'Kitchen',
  'images/image124.jpg': 'Bedroom',
  'images/image125.jpg': 'Bedroom',
  'images/image126.jpg': 'Living Room',
  'images/image127.jpg': 'Bedroom',
  'images/image128.jpg': 'Kitchen',
  'images/image129.jpg': 'Bathroom',
  'images/image130.jpg': 'Bathroom',
  'images/image131.jpg': 'Kitchen',
  // Card 11 – Inwood 1-Bedroom
  'images/image133.jpg': 'Living Room',
  'images/image134.jpg': 'Bedroom',
  'images/image136.jpg': 'Bathroom',
  'images/image137.jpg': 'Kitchen',
  'images/image138.jpg': 'Living Room',
  'images/image139.jpg': 'Kitchen',
  'images/image140.jpg': 'Laundry',
  'images/image142.jpg': 'Bedroom',
  'images/image143.jpg': 'Bedroom',
  'images/image144.jpg': 'Bathroom',
  'images/image145.jpg': 'Bathroom',
  'images/image146.jpg': 'Kitchen',
  // Card 12 – Flushing 3-Bedroom
  'images/image147.jpg': 'Kitchen',
  'images/image148.jpg': 'Living Room',
  'images/image149.jpg': 'Living Room',
  'images/image150.jpg': 'Living Room',
  'images/image151.jpg': 'Bathroom',
  'images/image152.jpg': 'Bedroom',
  'images/image153.jpg': 'Bedroom',
  'images/image154.jpg': 'Living Room',
  'images/image155.jpg': 'Bedroom',
  'images/image156.jpg': 'Kitchen',
  'images/image157.jpg': 'Bathroom',
  'images/image158.jpg': 'Living Room',
};

let count = 0;

for (const [src, label] of Object.entries(labels)) {
  // Escape special regex characters in the src string
  const escapedSrc = src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const labelLower = label.toLowerCase();

  // Matches the img src + alt (up to and including "— ") + old-label + closing attrs + span label
  // Works across multiple lines because \s matches \n
  const re = new RegExp(
    `(src="${escapedSrc}"\\s+alt="[^"\\u2014]*\\u2014\\s*)` + // group1: everything up to old alt-label
    `([^"]+)` +                                               // group2: old label in alt (discarded)
    `("\\s+class="w-full h-full object-cover"\\s+loading="lazy"\\s+\\/>\\s+<span class="card-slide-label">)` + // group3: between alt and span
    `([^<]*)` +                                               // group4: old label in span (discarded)
    `(<\\/span>)`,                                            // group5: closing span tag
    'g'
  );

  html = html.replace(re, (_match, p1, _oldAlt, p3, _oldSpan, p5) => {
    count++;
    return `${p1}${labelLower}${p3}${label}${p5}`;
  });
}

console.log(`\nUpdated ${count} slides.`);

// Write back preserving Windows CRLF line endings
fs.writeFileSync(filePath, html.replace(/\n/g, '\r\n'), 'utf8');
console.log('Saved index.html successfully.');
