import { defineConfig } from 'tsup';
import { copyFileSync } from 'fs';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'three'],
  treeshake: true,
  onSuccess: async () => {
    copyFileSync('src/theme/tokens.css', 'dist/tokens.css');
  },
});
