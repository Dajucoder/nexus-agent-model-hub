'use client';

import type { Locale } from '../lib/dictionary';

export function LanguageSwitcher(props: {
  locale: Locale;
  onChange: (locale: Locale) => void;
}) {
  return (
    <div className="pill-row">
      {(['zh-CN', 'en-US'] as const).map((locale) => (
        <button
          key={locale}
          className={props.locale === locale ? 'btn' : 'ghost'}
          onClick={() => props.onChange(locale)}
          type="button"
        >
          {locale}
        </button>
      ))}
    </div>
  );
}
