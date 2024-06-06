<script setup lang="ts" generic="
  T extends TranslationFunction<any, any>,
  Key extends TranslationKey<T>
">
import { TranslationFunction, TranslationKey } from 'intl-schematic';
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  t: T;
  k: Key;
  class: string;
  getLines?: (text: string) => string[];
}>(), {
  getLines: (text: string) => text.split(/\\?\n/gm)
});

const slots = defineSlots<{
  default: (props: { line: string; index: number; }) => any;
}>();

const lines = computed(() => props.getLines(props.t(props.k)))
</script>

<template>
  <template v-for="line, index in lines">
    <slot :line="line" :index="index">
      <p :class="props.class">{{ line }}</p>
    </slot>
  </template>
</template>
