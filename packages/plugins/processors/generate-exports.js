import { readdirSync } from 'fs';

const paths = readdirSync('./src', { recursive: true })
  .map(p => p.replace('\\', '/'));

const normalExports = paths.reduce((obj, path) => {
  return obj;
}, {});
