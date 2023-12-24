import { init } from './init';

if (process.argv[2] === 'init') {
  init(process.argv[3]);
}
