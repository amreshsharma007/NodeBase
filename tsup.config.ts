import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  // format: ['cjs', 'esm'], // Build for commonJS and ES modules
  format: ['cjs'], // Build for commonJS and ES modules
  dts: true, // Generate declaration file (.d.ts)
  splitting: false,
  sourcemap: true,
  clean: false,
  treeshake: true,
});
