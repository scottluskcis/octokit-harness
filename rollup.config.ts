import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import { defineConfig } from 'rollup';

// Common external dependencies
const external = [
  // External dependencies that shouldn't be bundled
  /^@octokit\//,
  'octokit',
  'winston',
  'undici',
  'dotenv',
  // Add any other dependencies that should be treated as external
];

// Common plugins
const createPlugins = () => [
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
];

export default defineConfig([
  // ESM build (preserving your current config with modules)
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist',
      format: 'es',
      sourcemap: true,
      preserveModules: true,
    },
    external,
    plugins: createPlugins(),
  },
  // CommonJS build (single bundled file)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.cjs',
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
    },
    external,
    plugins: createPlugins(),
  },
]);
