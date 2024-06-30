/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['universe/node', 'universe/shared/typescript-analysis'],

  rules: {
    'prettier/prettier': 'error',

    quotes: ['error', 'single'],

    'import/order': [
      'error',
      {
        groups: [
          'type',
          ['builtin', 'external'],
          ['internal', 'parent', 'sibling', 'index'],
          'object',
        ],
      },
    ],
  },

  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.d.ts'],

      parserOptions: {
        project: './tsconfig.eslint.json',
      },
    },
  ],
};
