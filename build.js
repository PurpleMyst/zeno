const fs = require("fs");

const esbuild = require("esbuild");

/**
 * Minify CSS files and import them as text
 * @type {esbuild.Plugin} */
const minifyTextualCssPlugin = {
  name: "minified-css-text",
  setup(build) {
    build.onLoad({ filter: /.css$/ }, async (args) => {
      const src = await fs.promises.readFile(args.path, "utf8");
      const { code: contents, warnings } = await esbuild.transform(src, {
        loader: "css",
        minify: true,
      });

      return {
        loader: "text",
        contents: contents.trim(),
        warnings,
      };
    });
  },
};

esbuild
  .build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    minify: true,
    target: ["firefox87"],
    outfile: "dist/main.js",
    plugins: [minifyTextualCssPlugin],
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
