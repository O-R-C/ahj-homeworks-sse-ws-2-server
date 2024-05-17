// noinspection JSUnusedGlobalSymbols

import { FlatCompat } from '@eslint/eslintrc'
import pluginJs from '@eslint/js'
import eslintPluginPrettier from 'eslint-plugin-prettier'
import globals from 'globals'

const compat = new FlatCompat({
  recommendedConfig: pluginJs.configs.recommended,
})

export default [
  pluginJs.configs.recommended,
  ...compat.extends('plugin:prettier/recommended'),
  { plugins: { prettier: eslintPluginPrettier } },
  {
    languageOptions: {
      parserOptions: { sourceType: 'module' },
      globals: { ...globals.browser, ...globals.node, ...(globals.jest / globals) },
    },
  },
  {
    rules: {
      'no-unused-vars': 'warn',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
  ...compat
    .config({
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
    })
    .map((config) => ({
      ...config,
      files: ['**/*.test.js'],
      rules: { 'jest/prefer-expect-assertions': 'off' },
    })),
  { ignores: ['dist/*', 'coverage/*', 'doc/*', 'webpack.*.js/*', 'node_modules/*', 'bin/*', 'build/*', '.idea/*'] },
]
