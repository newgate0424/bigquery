const { resolve } = require('node:path');

/** @type {import('eslint').Linter.Config} */
const config = {
  extends: ['next/core-web-vitals', 'next/typescript'],
  rules: {
    // Disable unused vars warnings (development phase)
    '@typescript-eslint/no-unused-vars': 'warn',
    // Allow explicit any for gradual migration
    '@typescript-eslint/no-explicit-any': 'error',
    // React hooks deps - warn instead of error
    'react-hooks/exhaustive-deps': 'warn',
    // Prefer const
    'prefer-const': 'warn'
  },
}

module.exports = config;