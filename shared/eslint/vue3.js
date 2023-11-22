/* eslint-env node */
var path = require('path');
module.exports = {
  root: true,
  extends: [
    path.resolve(__dirname, './base.js'),
    'plugin:vue/vue3-essential',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting',
  ],
};
