import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { dts } from "rollup-plugin-dts";

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'build/jsonpad-realtime.js',
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
  {
    input: './build/index.d.ts',
    output: [{
      file: 'build/jsonpad-realtime.d.ts',
      format: 'es',
    }],
    plugins: [dts()],
  },
];
