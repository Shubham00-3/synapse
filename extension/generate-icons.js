const fs = require('fs');
const path = require('path');

// Create simple SVG icons and convert to base64 data URIs
const sizes = [16, 48, 128];

const createSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad)"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".35em" font-size="${size * 0.6}" fill="white">🧠</text>
</svg>
`.trim();

sizes.forEach(size => {
  const svg = createSVG(size);
  const filename = path.join(__dirname, 'icons', `icon${size}.svg`);
  fs.writeFileSync(filename, svg);
  console.log(`Created: icon${size}.svg`);
});

console.log('\n⚠️  SVG icons created, but Chrome needs PNG files.');
console.log('Please use one of these methods to convert:');
console.log('\n1. Open extension/create-icons.html in browser and save each canvas as PNG');
console.log('2. Use online converter: https://svgtopng.com/');
console.log('3. Use ImageMagick: convert icon.svg icon.png');
console.log('\nOr use placeholder workaround below...\n');

