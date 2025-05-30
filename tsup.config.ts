import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: true,
  external: ['react'],
  globalName: 'ReactRefStore',
  target: 'es2020',
  outExtension({ format }) {
    return {
      js: `.${format}.js`,
    };
  },
}); 