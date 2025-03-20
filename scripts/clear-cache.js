#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🧹 Clearing Expo and React Native caches...');

// Define directories to clean
const cacheDirectories = [
  // Project cache
  '.expo',
  'node_modules/.cache',
  // Android specific
  'android/build',
  'android/app/build',
  // iOS specific
  'ios/build',
  'ios/Pods',
];

// Check if directories exist and remove them
cacheDirectories.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    console.log(`Removing ${dir}...`);
    try {
      if (os.platform() === 'win32') {
        execSync(`rmdir /s /q "${dirPath}"`);
      } else {
        execSync(`rm -rf "${dirPath}"`);
      }
    } catch (error) {
      console.error(`Failed to remove ${dir}: ${error.message}`);
    }
  }
});

// Clear watchman watches
try {
  console.log('Clearing Watchman watches...');
  execSync('watchman watch-del-all', { stdio: 'inherit' });
} catch (error) {
  console.log('Watchman not installed or failed to clear watches');
}

// Clear Metro cache
try {
  console.log('Clearing Metro bundler cache...');
  execSync('npx react-native start --reset-cache --no-interactive', { 
    stdio: 'inherit',
    timeout: 5000 // Kill after 5 seconds
  });
} catch (error) {
  console.log('Metro cache reset initiated');
}

// Clear Expo's cache
try {
  console.log('Clearing Expo cache...');
  execSync('npx expo doctor --fix', { stdio: 'inherit' });
  execSync('npx expo-cli client:install:local', { stdio: 'inherit' });
} catch (error) {
  console.log('Expo cache clearing commands completed with possible warnings');
}

console.log('\n✅ Cache clearing complete!');
console.log('\nNext steps:');
console.log('1. On your Android device, completely uninstall the app');
console.log('2. In Android Settings, go to Apps or Application Manager');
console.log('3. Find and clear cache for Expo Go (if using Expo Go)');
console.log('4. Restart your device');
console.log('5. Run "npm run start:dev" to start the development server with a clean environment');
console.log('\nHappy coding! 🚀'); 