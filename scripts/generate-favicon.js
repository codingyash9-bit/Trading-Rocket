const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateFavicons() {
  const publicDir = path.join(__dirname, '..', 'public');
  const inputPath = path.join(publicDir, 'logo.svg');
  
  // Check if input exists
  if (!fs.existsSync(inputPath)) {
    console.log('No logo.svg found');
    return;
  }

  // Generate 32x32 favicon from SVG
  await sharp(inputPath, { density: 100 })
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32.png'));

  // Generate 192x192 for PWA
  await sharp(inputPath, { density: 100 })
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));

  // Generate 512x512 for PWA
  await sharp(inputPath, { density: 100 })
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));
  
  console.log('Generated all favicon sizes from SVG');
}

generateFavicons().catch(console.error);