import { LocaleKey, TranslationDocument, TranslationFunction } from 'intl-schematic';
import { For, children, JSX } from 'solid-js';

export function useIntl<
  LocaleDoc extends TranslationDocument,
  T extends TranslationFunction<LocaleDoc, any>
>(t: T): {
  <
    Key extends LocaleKey<LocaleDoc>,
    Parts extends PropertyKey =
      LocaleDoc[Key] extends { dictionary: infer _Parts } ? keyof _Parts : keyof LocaleDoc[Key]
  >(props: {
    k: Key;
    children: Record<Parts, (part: string) => JSX.Element>;
  }): JSX.Element;
};

export function useIntl<
  LocaleDoc extends TranslationDocument,
  T extends TranslationFunction<LocaleDoc, any>,
  Key extends LocaleKey<LocaleDoc>,
  Parts extends PropertyKey =
    LocaleDoc[Key] extends { dictionary: infer _Parts } ? keyof _Parts : keyof LocaleDoc[Key]
>(t: T, k: () => Key): {
  (props: {
    children: Record<Parts, (part: string) => JSX.Element>;
  }): JSX.Element;
};

export function useIntl(t: TranslationFunction<any, any>, key?: () => string) {
  return (props: {
    k: string;
    children: Record<string, (part: string) => JSX.Element>;
  }) => (
    <Intl t={t} k={key?.() ?? props.k}>
      {props.children}
    </Intl>
  );
}

export default function Intl<
  LocaleDoc extends TranslationDocument,
  T extends TranslationFunction<LocaleDoc, any>,
  Key extends LocaleKey<LocaleDoc>,
  Parts extends PropertyKey =
    LocaleDoc[Key] extends { dictionary: infer _Parts } ? keyof _Parts : keyof LocaleDoc[Key]
>(props: {
  t: T;
  k: Key;
  children: Record<Parts, (part: string) => JSX.Element>;
}) {
  return children(() => (
    <For each={Object.entries<(part: string) => JSX.Element>(props.children)}>
      {([part, h]) => h(props.t(props.k, part))}
    </For>
  )) as unknown as JSX.Element;
}
