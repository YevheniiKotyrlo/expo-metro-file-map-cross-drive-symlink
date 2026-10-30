const fs = require('node:fs');
const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// node_modules/greeting is a link into the store make-store.js wrote, whose node_modules Metro has to watch.
const greeting = fs.realpathSync(path.join(__dirname, 'node_modules', 'greeting'));
config.watchFolders = [...config.watchFolders, path.resolve(greeting, '..', '..', '..', '..')];

module.exports = config;
