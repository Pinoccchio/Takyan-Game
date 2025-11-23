const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_LOGO = path.join(__dirname, '../public/icons/takyan.png');
const OUTPUT_DIR = path.join(__dirname, '../app');
const PUBLIC_DIR = path.join(__dirname, '../public');

async function generateIcons() {
  console.log('🎨 Starting icon generation from takyan.png...\n');

  try {
    // Ensure directories exist
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // 1. Generate favicon.ico (multi-resolution: 16x16, 32x32, 48x48)
    console.log('📦 Generating favicon.ico...');
    await sharp(INPUT_LOGO)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toFile(path.join(OUTPUT_DIR, 'favicon.ico'));
    console.log('✅ Created: app/favicon.ico (32x32)\n');

    // 2. Generate icon.png for Next.js metadata (default 512x512)
    console.log('📦 Generating icon.png...');
    await sharp(INPUT_LOGO)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toFile(path.join(OUTPUT_DIR, 'icon.png'));
    console.log('✅ Created: app/icon.png (512x512)\n');

    // 3. Generate Apple Touch Icon (180x180)
    console.log('📦 Generating apple-touch-icon.png...');
    await sharp(INPUT_LOGO)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toFile(path.join(OUTPUT_DIR, 'apple-icon.png'));
    console.log('✅ Created: app/apple-icon.png (180x180)\n');

    // 4. Generate PWA icons (192x192 and 512x512)
    console.log('📦 Generating PWA icons...');

    // 192x192 (for Android)
    await sharp(INPUT_LOGO)
      .resize(192, 192, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toFile(path.join(PUBLIC_DIR, 'icon-192.png'));
    console.log('✅ Created: public/icon-192.png (192x192)');

    // 512x512 (for Android splash)
    await sharp(INPUT_LOGO)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toFile(path.join(PUBLIC_DIR, 'icon-512.png'));
    console.log('✅ Created: public/icon-512.png (512x512)\n');

    // 5. Generate Open Graph image (1200x630)
    console.log('📦 Generating Open Graph image...');
    await sharp(INPUT_LOGO)
      .resize(1200, 630, {
        fit: 'contain',
        background: { r: 15, g: 23, b: 42, alpha: 1 } // Dark blue background
      })
      .toFile(path.join(OUTPUT_DIR, 'opengraph-image.png'));
    console.log('✅ Created: app/opengraph-image.png (1200x630)\n');

    console.log('🎉 All icons generated successfully!');
    console.log('\n📋 Generated files:');
    console.log('   - app/favicon.ico');
    console.log('   - app/icon.png');
    console.log('   - app/apple-icon.png');
    console.log('   - app/opengraph-image.png');
    console.log('   - public/icon-192.png');
    console.log('   - public/icon-512.png');
    console.log('\n✨ Your Takyan branding is now complete!');

  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
