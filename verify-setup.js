// Quick verification script to check if handlers are set up correctly
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying POS System Setup...\n');

// Check main.js
const mainPath = path.join(__dirname, 'electron', 'main.js');
if (fs.existsSync(mainPath)) {
  const mainContent = fs.readFileSync(mainPath, 'utf8');
  const hasImageSelect = mainContent.includes("ipcMain.handle('image:select'");
  const hasImageGetPath = mainContent.includes("ipcMain.handle('image:getPath'");
  const hasImageSave = mainContent.includes("ipcMain.handle('image:save'");
  const hasImageDelete = mainContent.includes("ipcMain.handle('image:delete'");
  
  console.log('✅ electron/main.js exists');
  console.log(`   - image:select handler: ${hasImageSelect ? '✅' : '❌'}`);
  console.log(`   - image:getPath handler: ${hasImageGetPath ? '✅' : '❌'}`);
  console.log(`   - image:save handler: ${hasImageSave ? '✅' : '❌'}`);
  console.log(`   - image:delete handler: ${hasImageDelete ? '✅' : '❌'}`);
} else {
  console.log('❌ electron/main.js NOT FOUND');
}

// Check preload.js
const preloadPath = path.join(__dirname, 'electron', 'preload.js');
if (fs.existsSync(preloadPath)) {
  const preloadContent = fs.readFileSync(preloadPath, 'utf8');
  const hasSelectImage = preloadContent.includes('selectImage:');
  const hasGetImagePath = preloadContent.includes('getImagePath:');
  
  console.log('\n✅ electron/preload.js exists');
  console.log(`   - selectImage exposed: ${hasSelectImage ? '✅' : '❌'}`);
  console.log(`   - getImagePath exposed: ${hasGetImagePath ? '✅' : '❌'}`);
} else {
  console.log('\n❌ electron/preload.js NOT FOUND');
}

// Check imageService.js
const imageServicePath = path.join(__dirname, 'frontend', 'src', 'services', 'imageService.js');
if (fs.existsSync(imageServicePath)) {
  console.log('\n✅ frontend/src/services/imageService.js exists');
} else {
  console.log('\n❌ frontend/src/services/imageService.js NOT FOUND');
}

console.log('\n📝 Next Steps:');
console.log('1. Stop the current dev server (Ctrl+C)');
console.log('2. Wait 3 seconds');
console.log('3. Run: npm run dev');
console.log('4. Try uploading an image');

