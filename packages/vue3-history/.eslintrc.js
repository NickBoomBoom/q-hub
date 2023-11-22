/* eslint-env node */
const { resolve } = require('path');
module.exports = {
  extends: [resolve(__dirname, '../../shared/eslint/vue3.js')],
  rules: {
    // 自定义规则
  },
};
