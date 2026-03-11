import { createContext, useContext, useState } from "react";
import { translations, type Lang } from "../i18n/translations";

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LangContext = createContext<LangContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

function detectDefaultLang(): Lang {
  const stored = localStorage.getItem("dg_lang") as Lang | null;
  if (stored === "ko" || stored === "en") return stored;
  return "en";
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectDefaultLang);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("dg_lang", l);
  };

  const t = (key: string): string =>
    translations[lang][key] ?? translations["en"][key] ?? key;

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
