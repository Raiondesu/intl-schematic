import { defineConfig } from 'tsup';
import { readdir, readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { blue, bold } from 'colorette';
import { fdir } from 'fdir';
import { join } from 'path/posix';

const entries = new fdir()
  .withBasePath()
  .withPathSeparator('/')
  .onlyDirs()
  .exclude((dirName) => (
    ['.turbo', 'dist', 'src', 'tsconfig', 'tsupconfig'].includes(dirName)
  ))
  .filter((path) => (
    existsSync(join(path, 'package.json'))
  ))
  .withMaxDepth(2)
  .crawl('packages')
  .sync()
  .slice(1)
  .map(p => join(p, 'src'));

const CLI = blue('CLI');
const pathsLog = `${CLI} 📦 ${bold('Export paths')}: {`;

export default defineConfig(entries.map(entry => ({
  entry: [entry],
  outDir: entry.replace('src', 'dist'),
  format: ['cjs', 'esm'],
  metafile: true,
  splitting: false,
  platform: 'neutral',
  tsconfig: entry.replace('src', 'tsconfig.json'),
  external: [/intl-schematic/, 'solid-js', 'rambda'],
  clean: true,

  async onSuccess() {
    const cwd = (p: string) => join(process.cwd(), entry.replace('src', ''), p);

    const outputs = (await readdir(cwd('./dist'), { recursive: true }))
      .map(p => p.replace('\\', '/'))
      .filter(o => /\.js$/.test(o));

    const packageInfo = JSON.parse((await readFile(cwd('./package.json'))).toString());

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

    console.log(pathsLog);
    JSON.stringify(exportPaths, null, 2)
      .split('\n')
      .slice(1)
      .map(line => console.log(`${CLI} ${line}`));

    packageInfo.exports = exportPaths;
    packageInfo.typesVersions = {
      '*': Object.keys(exportPaths).reduce((obj, p) => ({
        ...obj,
        [p.replace('./', '')]: [exportPaths[p].types],
      }), {}),
    };

    await writeFile(cwd('./package.json'), JSON.stringify(packageInfo, null, 2));
  },
  // banner: {
  //   js: `/*\n${readFileSync('./LICENSE').toString('utf-8')}*/`
  // }
})));
