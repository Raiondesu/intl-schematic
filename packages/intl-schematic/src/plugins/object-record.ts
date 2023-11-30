import { InputObject } from '../translation.schema';
import { createPlugin } from './core';
import { mergeInputs } from './core/merge-inputs';

/**
 * Process an object record that doesn't specify a processor.
 *
 * Treats object keys as references to other records
 * that should be translated and joined by space.
 */
export const ObjectRecordPlugin = createPlugin({
  name: 'ObjectRecord',
  keyFound(key, input) {
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
