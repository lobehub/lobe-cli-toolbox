const displayNames = new Intl.DisplayNames(['en'], { fallback: 'none', type: 'language' });

/**
 * `zh_CN` → `Chinese (China) (zh_CN)`. Models follow a language name more reliably than a bare
 * locale code, the code is kept to disambiguate variants.
 */
export const getLocaleName = (locale: string): string => {
  try {
    const name = displayNames.of(locale.replaceAll('_', '-'));
    return name && name !== locale ? `${name} (${locale})` : locale;
  } catch {
    return locale;
  }
};
