/* eslint-env node */
const { resolve } = require('path');
module.exports = {
  extends: [resolve(__dirname, '../../shared/eslint/vue3.cjs')],
  rules: {
    // 自定义规则
  },
};
