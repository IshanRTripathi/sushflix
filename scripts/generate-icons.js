const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const sourceIcon = path.join(__dirname, '../public/logo.png');
const outputDir = path.join(__dirname, '../public/icons');

async function generateIcons() {
  try {
    // Create icons directory if it doesn't exist
    await fs.mkdir(outputDir, { recursive: true });

    // Read the source image
    const image = sharp(sourceIcon);

    // Generate icons for each size
    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      await image
        .resize(size, size)
        .toFile(outputPath);
      console.log(`Generated icon: ${outputPath}`);
    }

    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons(); 