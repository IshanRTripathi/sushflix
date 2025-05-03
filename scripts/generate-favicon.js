const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const sourcePath = path.join(__dirname, '../public/logo.svg');
const outputPath = path.join(__dirname, '../public/favicon.ico');

async function generateFavicon() {
  try {
    // Read SVG file
    const svgBuffer = await fs.readFile(sourcePath);

    // Generate favicon
    await sharp(svgBuffer)
      .resize(32, 32)
      .toFile(outputPath);

    console.log('Favicon generated successfully!');
  } catch (error) {
    console.error('Error generating favicon:', error);
    process.exit(1);
  }
}

generateFavicon(); 