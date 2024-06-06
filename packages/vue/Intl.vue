<script setup lang="ts" generic="
  T extends TranslationFunction<any, any>,
  Key extends TranslationKey<T>,
  LocaleDoc extends TranslationDocument = T extends TranslationFunction<infer D, any> ? D : never,
  Parts extends PropertyKey =
    LocaleDoc[Key] extends { dictionary: infer _Parts } ? keyof _Parts : keyof LocaleDoc[Key]
">
import { TranslationFunction, LocaleKey, TranslationDocument, TranslationKey } from 'intl-schematic';

const props = defineProps<{
  t: T;
  k: Key;
  class: string;
}>();

const slots = defineSlots<{
  [key in Parts]: (props: { part: string }) => any;
}>();
</script>

<template>
  <template v-for="(slot, part) in slots">
    <slot :name="part" :part="props.t(props.k, part)">
      <p :class="props.class">{{ props.t(props.k, part) }}</p>
    </slot>
  </template>
</template>
