import { createPlugin } from './core';

export const ArrayRecordPlugin = createPlugin({
  name: 'ArrayRecord',
  keyFound(key, input, parameter, _, recKey) {
    // Process an array record (["Some text", "translation-key"])
    if (Array.isArray(key)) {
      const result = key.reduce((arr, refK) => {
        if (typeof refK !== 'string') {
          const refParamK = Object.keys(refK)[0];

          if (refParamK.startsWith('input:')) {
            const key = refParamK.replace('input:', '');
            const value = (input as Record<string, typeof input>)?.[key];

            return [
              ...arr,
              // TOOD: add a way to get a stringifier for a processors input
              String(value)
            ];
          }

          if (refK.__ignore) {
            return arr;
          }

          return [...arr, this.translate(
            refParamK,
            (input as Record<string, typeof input>)?.[refParamK],
            (parameter as Record<string, typeof parameter>)?.[refParamK]
          )];
        }

        if (!refK.startsWith('input:')) {
          return [...arr, this.translate(
            refK,
            (input as Record<string, typeof input>)?.[refK],
            (parameter as Record<string, typeof parameter>)?.[refK]
          )];
        }

        const _input = input as Record<string, typeof input>;
        const inputKey = refK.replace('input:', '');

        return [...arr, _input[inputKey] as string];
      }, [] as string[]).join(' ');

      return this.callHook('keyProcessed', result);
    }
  }
})
