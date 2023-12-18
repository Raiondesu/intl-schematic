import { defineConfig } from 'tsup';
import { readdir, readFile, writeFile } from 'fs/promises';

export default defineConfig({
  clean: true,
  format: ['cjs', 'esm'],
  metafile: true,
  splitting: false,
  minify: false,

  async onSuccess() {
    const outputs = (await readdir('./dist', { recursive: true }))
      .map(p => p.replace('\\', '/'))
      .filter(o => /\.js$/.test(o));
    const packageInfo = JSON.parse((await readFile('./package.json')).toString());

    const exportPaths = outputs.reduce((obj, path) => ({
      ...(path.startsWith('index') ? { ['.']: {
        import: './dist/' + path,
        require: './dist/' + path.replace('.js', '.cjs'),
        types: './src/' + path.replace('.js', '.ts')
      } } : {}),
      ...obj,
      ['./' + path.replace('.js', '')]: {
        import: './dist/' + path,
        require: './dist/' + path.replace('.js', '.cjs'),
        types: './src/' + path.replace('.js', '.ts')
      }
    }), {});

    console.log(exportPaths);

    packageInfo.exports = exportPaths;
    packageInfo.typesVersions = {
      '*': Object.keys(exportPaths).reduce((obj, p) => ({
        ...obj,
        [p.replace('./', '')]: [exportPaths[p].types],
      }), {}),
    };

    await writeFile('./package.json', JSON.stringify(packageInfo, null, 2));
  },
  // banner: {
  //   js: `/*\n${readFileSync('./LICENSE').toString('utf-8')}*/`
  // }
})
