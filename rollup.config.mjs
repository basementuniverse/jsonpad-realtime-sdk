import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { dts } from "rollup-plugin-dts";

export default [
  // Browser build: a self-contained UMD bundle for script tags and CDNs, with
  // socket.io-client's browser build bundled in
  {
    input: 'src/index.ts',
    output: {
      file: 'build/jsonpad-realtime-sdk.js',
      format: 'umd',
      name: 'JSONPadRealtime',
    },
    plugins: [
      typescript(),
      nodeResolve({
        preferBuiltins: false,
        mainFields: ['module', 'browser', 'main'],
      }),
      commonjs({
        include: /node_modules/,
        requireReturnsDefault: true,
      }),
      terser(),
    ].filter(Boolean),
  },
  // Node build: CommonJS, with socket.io-client left as a dependency so that
  // Node resolves socket.io-client's own Node build, which connects without
  // XMLHttpRequest
  {
    input: 'src/index.ts',
    output: {
      file: 'build/jsonpad-realtime-sdk.node.js',
      format: 'cjs',
      exports: 'named',
    },
    external: ['socket.io-client'],
    plugins: [
      typescript({
        declaration: false,
      }),
    ],
  },
  {
    input: './build/index.d.ts',
    output: [{
      file: 'build/jsonpad-realtime-sdk.d.ts',
      format: 'es',
    }],
    plugins: [dts()],
  },
];
