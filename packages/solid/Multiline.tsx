import { TranslationFunction, TranslationKey } from 'intl-schematic';
import { For, JSX } from 'solid-js';

export function useMultiline<
  T extends TranslationFunction<any, any>
>(t: T): {
  <
    Key extends TranslationKey<T>
  >(props: {
    k: Key;
    children: (line: string) => JSX.Element;
  }): JSX.Element;
};

export function useMultiline<
  T extends TranslationFunction<any, any>,
  Key extends TranslationKey<T>
>(t: T, k: () => Key): {
  (props: {
    children: (line: string) => JSX.Element;
  }): JSX.Element;
};

export function useMultiline(t: TranslationFunction<any, any>, key?: () => string) {
  return (props: {
    k: string;
    children: (line: string) => JSX.Element;
  }) => (
    <Multiline t={t} k={key?.() ?? props.k}>
      {props.children}
    </Multiline>
  );
}

export function MultilineRaw(props: {
  lines: string;
  class?: string;
  children?: (line: string, lineNumber: () => number) => JSX.Element;
  getLines?: (text: string) => string[];
}) {
  return <For each={props.lines.split(/\\?\n/gm)}>
    {(line, index) => props.children?.(line, index) ?? <p class={props.class}>{line}</p>}
  </For>;
}

export default function Multiline<
  T extends TranslationFunction<any, any>,
  Key extends TranslationKey<T>
>(props: {
  t: T;
  k: Key;
  class?: string;
  children?: (line: string, lineNumber: () => number) => JSX.Element;
  getLines?: (text: string) => string[];
}) {
  return <MultilineRaw lines={props.t(props.k)} class={props.class} children={props.children} />;
}
