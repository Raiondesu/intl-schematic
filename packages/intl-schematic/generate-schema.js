import { writeFile } from 'fs/promises';

import { compileFromFile } from 'json-schema-to-typescript';

const schema = await compileFromFile('./src/translation.schema.json');

await writeFile('./src/translation.schema.d.ts', schema);
