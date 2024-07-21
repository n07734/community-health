module.exports = {
    root: true,
    env: {
      browser: true,
      es2020: true,
      'vitest-globals/env': true
    },
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:react/jsx-runtime',
      'plugin:react-hooks/recommended',
      'plugin:vitest-globals/recommended',
      'plugin:@typescript-eslint/recommended',
    ],
    ignorePatterns: ['dist', '.eslintrc.cjs', 'build'],
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    parser: '@typescript-eslint/parser',
    settings: { react: { version: '18.2' } },
    plugins: ['react-refresh'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'comma-dangle': ['error', 'always-multiline'],
      'react/jsx-no-target-blank': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  }
