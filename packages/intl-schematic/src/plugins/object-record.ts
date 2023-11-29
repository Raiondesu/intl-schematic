import { InputObject, ParametrizedTranslationRecord } from '../translation.schema';
import { LocaleInputParameter } from '../ts.schema';
import { createPlugin } from './core';
import { mergeInputs } from './merge-inputs';

export const ObjectRecordPlugin = createPlugin({
  name: 'ObjectRecord',
  keyFound(key, input) {
    // Process an object record that doesn't specify a processor
    if (typeof key === 'object' && key != null) {
      return this.callHook(
        'keyProcessed',
        Object.keys(key).map((refKey) => {
          const recordKey = key as Record<string, InputObject>;
          const inputForKey = typeof input === 'object' && input ? input[refKey as keyof typeof input] : {};
          const translated = this.translate(
            refKey,
            (
              typeof input === 'object' && input
                ? mergeInputs(
                    recordKey[refKey],
                    inputForKey ?? null
                  )
                : recordKey[refKey]
            )
          );

          return translated;
        }).join(' ').replace(/\s+/, ' ')
      );
    }
  }
})
