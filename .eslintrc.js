module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  extends: [
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'plugin:unicorn/recommended',
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    quotes: ['single'],
  },
  settings: {
    'import/extensions': ['.ts'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts'],
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/explicit-member-accessibility': 0,
    '@typescript-eslint/interface-name-prefix': 0,
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/no-object-literal-type-assertion': 0,
    '@typescript-eslint/no-parameter-properties': 0,
    '@typescript-eslint/no-unused-vars': 0,
    '@typescript-eslint/no-var-requires': 0,
    'no-console': 2,
    'no-throw-literal': 'error',
    'no-var': 'error',
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    'unicorn/filename-case': [
      'error',
      {
        cases: {
          camelCase: true,
          kebabCase: true,
        },
      },
    ],
    'unicorn/import-style': 0,
    'unicorn/no-array-callback-reference': 0,
    'unicorn/no-null': 0,
    'unicorn/no-process-exit': 0,
    'unicorn/no-useless-undefined': 0,
    'unicorn/prefer-module': 0,
    'unicorn/prefer-top-level-await': 0,
    'unicorn/prevent-abbreviations': 0,
  },
};
