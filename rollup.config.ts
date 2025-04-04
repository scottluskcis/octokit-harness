import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import { defineConfig } from 'rollup';

export default defineConfig({
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true,
    preserveModules: true, // This helps maintain the module structure
  },
  external: [
    // External dependencies that shouldn't be bundled
    /^@octokit\//,
    'octokit',
    'winston',
    'undici',
    // Add any other dependencies that should be treated as external
  ],
  plugins: [
    resolve({
      preferBuiltins: true,
      exportConditions: ['node'],
    }),
    commonjs(),
    json(),
    typescript({
      tsconfig: './tsconfig.json',
      // The following options ensure declaration files are generated
      declaration: true,
      declarationDir: './dist',
      rootDir: './src',
    }),
  ],
});
