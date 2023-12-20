import { defineConfig, Options } from 'tsup';
import { readdir, readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { cyan, bold, yellow, green } from 'colorette';
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
  .map(p => join(p, 'src'));

const CFG = cyan('CFG');

export default defineConfig(() => Promise.all(entries.map(async entry => {
  const cwd = (p: string) => join(process.cwd(), entry.replace('src', ''), p);

  const packageInfo = JSON.parse((await readFile(cwd('./package.json'))).toString());

  const dependencies = [
    ...Object.keys(packageInfo.dependencies ?? {}),
    ...Object.keys(packageInfo.peerDependencies ?? {}),
    ...Object.keys(packageInfo.devDependencies ?? {}),
    ...Object.keys(packageInfo.optionalDependencies ?? {}),
  ];

  const dependenciesLogs = '[\n'.concat(
    ...dependencies.map((d, i, arr) => green(`${CFG}\t'${d}'${i === arr.length - 1 ? '' : ','}\n`)),
    `${CFG} ]`
  );

  console.log(`${CFG} 📥 ${yellow(packageInfo.name)} ${bold('dependencies')} to be marked as external:`, dependenciesLogs);

  const pathsLog = `${CFG} 📦 ${bold('Export paths')} of ${yellow(packageInfo.name)}: {`;

  return ({
    entry: [entry],
    clean: true,
    outDir: entry.replace('src', 'dist'),
    format: ['cjs' as const, 'esm' as const],
    metafile: true,
    splitting: false,
    target: 'es2020',
    platform: 'neutral' as const,
    tsconfig: entry.replace('src', 'tsconfig.json'),

    skipNodeModulesBundle: true,
    // external: dependencies,

    async onSuccess() {
      const outputs = (await readdir(cwd('./dist'), { recursive: true }))
        .map(p => p.replace('\\', '/'))
        .filter(o => /\.js$/.test(o));

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
      }), {} as Record<string, Record<string, string>>);

      console.log(pathsLog);
      JSON.stringify(exportPaths, null, 2)
        .split('\n')
        .slice(1)
        .map(line => console.log(`${CFG} ${line}`));

      packageInfo.exports = exportPaths;
      packageInfo.typesVersions = {
        '*': Object.keys(exportPaths).reduce((obj, p) => ({
          ...obj,
          [p.replace('./', '')]: [exportPaths[p].types],
        }), {} as Record<string, string[]>),
      };

      await writeFile(cwd('./package.json'), JSON.stringify(packageInfo, null, 2) + '\n');
    },
  } satisfies Options);
})));
