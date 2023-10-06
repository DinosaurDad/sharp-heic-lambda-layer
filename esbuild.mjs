import esbuild from 'esbuild'

/*

After successfully building with SAM, we will bundle the *sharp* JS code
with *esbuild*. At this time it does not support bundling .node files,
but we need `sharp-linux-x64.node`.

Evan Wallace provided the following to make provide support. This, by
default, would place the .node file in the same directory as the index.js
output file. Unfortunately, that won't work because the .node file is
looking for *libvips* with a relative path (already built into the binary)
like this:

   ../../vendor/#.##.#/linux-x64/lib/libvips-cpp.so.42

So we use `assetNames` to force the .node file to be written to the correct
location. Then the bundle script copies the `vendor` directory to the
matching relative location.

*/


// https://github.com/evanw/esbuild/issues/1051

const nativeNodeModulesPlugin = {
  name: 'native-node-modules',
  setup(build) {
    // If a ".node" file is imported within a module in the "file" namespace, resolve
    // it to an absolute path and put it into the "node-file" virtual namespace.
    build.onResolve({filter: /\.node$/, namespace: 'file'}, args => ({
      path: require.resolve(args.path, {paths: [args.resolveDir]}),
      namespace: 'node-file',
    }))

    // Files in the "node-file" virtual namespace call "require()" on the
    // path from esbuild of the ".node" file in the output directory.
    build.onLoad({filter: /.*/, namespace: 'node-file'}, args => ({
      contents: `
        import path from ${JSON.stringify(args.path)}
        try { module.exports = require(path) }
        catch {}
      `,
    }))

    // If a ".node" file is imported within a module in the "node-file" namespace, put
    // it in the "file" namespace where esbuild's default loading behavior will handle
    // it. It is already an absolute path since we resolved it to one above.
    build.onResolve({filter: /\.node$/, namespace: 'node-file'}, args => ({
      path: args.path,
      namespace: 'file',
    }))

    // Tell esbuild's default loading behavior to use the "file" loader for
    // these ".node" files.
    let opts = build.initialOptions
    opts.loader = opts.loader || {}
    opts.loader['.node'] = 'file'
  },
}

await esbuild.build({
  entryPoints: ['.aws-sam/build/SharpHEICLayer/nodejs/node_modules/sharp/lib/index.js'],
  bundle: true,
  minify: true,
  //outfile: 'dist/nodejs/node_modules/sharp/index.js',
  //outfile: 'index.js',
  plugins: [nativeNodeModulesPlugin],
  platform: "node",
  format: "cjs",
  target: ["node16"],
  logLevel: "info",
  outdir: 'dist/nodejs/node_modules/sharp',
  assetNames: "build/Release/[name]"
})
