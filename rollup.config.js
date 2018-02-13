import babel from "rollup-plugin-babel";

export default {
  input: "./src/builder.js",
  output: {
    file: "./dist/bundle.js",
    format: "cjs"
  },
  plugins: [
    babel({
      exclude: "**/node_modules"
    })
  ]
};
