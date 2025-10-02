// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow importing .wasm
config.resolver.assetExts = [...config.resolver.assetExts, 'wasm'];

module.exports = config;
