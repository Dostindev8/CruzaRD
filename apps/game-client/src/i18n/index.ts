import { useSyncExternalStore } from 'react';
import es from '../i18n/es-DO.json';
import en from '../i18n/en.json';

export type Locale = 'es-DO' | 'en';
export type Dict = typeof es;

const catalogs: Record<Locale, Dict> = {
  'es-DO': es,
  en,
};

let locale: Locale = (localStorage.getItem('cruza.locale') as Locale) || 'es-DO';
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function getLocale() {
  return locale;
}

export function setLocale(next: Locale) {
  locale = next;
  localStorage.setItem('cruza.locale', next);
  emit();
}

export function t(): Dict {
  return catalogs[locale] ?? catalogs['es-DO'];
}

export function subscribeLocale(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useI18n() {
  const loc = useSyncExternalStore(
    subscribeLocale,
    () => locale,
    () => 'es-DO' as Locale,
  );
  return { ...catalogs[loc], locale: loc, setLocale };
}
