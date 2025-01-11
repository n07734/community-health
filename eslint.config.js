import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import vitest from '@vitest/eslint-plugin';
import globals from 'globals';

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    react.configs.flat.recommended,
    react.configs.flat['jsx-runtime'],
    {
        settings: {
          react: {
            version: 'detect'
          }
        }
    },
    {
        languageOptions: {
            ...react.configs.flat.recommended.languageOptions,
            globals: {
                ...globals.browser,
                window: true,
            }
        }
    },
    {
        rules: {
            'indent': ['error', 4],
            '@typescript-eslint/no-unused-expressions': 'off',
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                  'args': 'all',
                  'argsIgnorePattern': '^_',
                  'varsIgnorePattern': '^_',
                  'caughtErrorsIgnorePattern': '^_',
                }
              ],
            'comma-dangle': ['error', 'always-multiline'],
            'react/jsx-no-target-blank': 'off',
            'react/prop-types': 'off',
            'react/no-unescaped-entities': 'off',
        },
    },
    {
        files: ['**/*.test.ts', '**/*.test.tsx'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
    {
        plugins: {
          'react-hooks': reactHooks,
        },
        rules: { ...reactHooks.configs.recommended.rules },
    },
    {
        files: ['*.test.ts', '*.test.tsx'],
        plugins: {
          vitest
        },
        rules: {
          ...vitest.configs.recommended.rules,
        },
      },
);