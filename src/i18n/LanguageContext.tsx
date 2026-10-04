import { createContext, useContext, useState, type ReactNode } from 'react'
import { translations, type Lang } from './translations'

const STORAGE_KEY = 'sasiedzko.lang'

function readLang(): Lang {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'pl'
  } catch {
    return 'pl'
  }
}

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  // Tłumaczy klucz; opcjonalne pola podstawia w miejsce {nazwa}.
  t: (key: string, vars?: Record<string, string | number>) => string
  // Nazwy danych (grupy/kategorie/rodzaje) po „prefix.slug"; bez tłumaczenia zwraca fallback (polski).
  td: (prefix: string, slug: string, fallback: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readLang)

  const setLang = (next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // brak dostępu do localStorage — język działa tylko do odświeżenia strony
    }
    document.documentElement.lang = next
  }

  const t = (key: string, vars?: Record<string, string | number>) => {
    let text = translations[lang][key] ?? translations.pl[key] ?? key
    if (vars) {
      for (const name of Object.keys(vars)) {
        text = text.replace(`{${name}}`, String(vars[name]))
      }
    }
    return text
  }

  const td = (prefix: string, slug: string, fallback: string) => {
    const key = `${prefix}.${slug}`
    return translations[lang][key] ?? translations.pl[key] ?? fallback
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, td }}>{children}</LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}
