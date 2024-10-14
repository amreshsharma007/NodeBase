module.exports = {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 120,
  endOfLine: 'auto',
  bracketSpacing: true,
  jsxBracketSameLine: false,
  arrowParens: false,
  tabWidth: 2,
  overrides: [
    {
      files: ['**/*.css', '**/*.scss', '**/*.html'],
      options: {
        singleQuote: false
      }
    }
  ]
};
