import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import pkg from "./package.json";

export default {
  input: "./src/index.js",
  output: [
    { file: pkg.main, format: "cjs" },
    { file: pkg.module, format: "es" },
    {
      name: "fragmentum",
      file: pkg.browser,
      format: "umd"
    }
  ],
  plugins: [
    babel({
      exclude: "**/node_modules"
    }),
    resolve(),
    commonjs({
      include: "node_modules/**"
    })
  ]
};
