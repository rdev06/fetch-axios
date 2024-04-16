await Bun.build({
    entrypoints: ['src/index.ts', 'src/fetchAxios.ts'],
    outdir: 'dist',
    target: 'node',
    format: 'esm',
    splitting: true,
    minify: false
  });
  