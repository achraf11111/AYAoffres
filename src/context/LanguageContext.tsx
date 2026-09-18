"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'fr' | 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
    app_title: "AYAoffres",
    search_placeholder: "Rechercher un appel d'offres...",
    latest_tenders: "Derniers Appels d'Offres",
    deadline: "Date limite",
    estimated_cost: "Coût estimé",
    category: "Catégorie",
    summarize_ai: "Résumer avec l'IA",
    summarizing: "Résumé en cours...",
    summary: "Résumé IA",
    buyer: "Acheteur",
    city: "Ville"
  },
  ar: {
    app_title: "أيا عروض",
    search_placeholder: "ابحث عن صفقة...",
    latest_tenders: "أحدث طلبات العروض",
    deadline: "آخر أجل",
    estimated_cost: "التكلفة التقديرية",
    category: "الفئة",
    summarize_ai: "تلخيص بالذكاء الاصطناعي",
    summarizing: "جاري التلخيص...",
    summary: "ملخص الذكاء الاصطناعي",
    buyer: "المشتري",
    city: "المدينة"
  },
  en: {
    app_title: "AYAoffres",
    search_placeholder: "Search for a tender...",
    latest_tenders: "Latest Tenders",
    deadline: "Deadline",
    estimated_cost: "Estimated Cost",
    category: "Category",
    summarize_ai: "Summarize with AI",
    summarizing: "Summarizing...",
    summary: "AI Summary",
    buyer: "Buyer",
    city: "City"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('fr');
  
  // To avoid hydration mismatch, we wait for mount before setting from localStorage if we had it,
  // but for simplicity we'll just default to 'fr'.
  
  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['fr']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
