"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Globe } from "lucide-react";

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <a href="/" className="text-2xl font-bold text-blue-600 tracking-tight flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">A</span>
              </div>
              {t('app_title')}
            </a>
          </div>
          
          <div className="hidden md:flex items-center space-x-8 space-x-reverse text-sm font-medium text-gray-600">
            <a href="#" className="hover:text-blue-600 transition-colors">{language === 'ar' ? 'الرئيسية' : 'Accueil'}</a>
            <a href="#" className="hover:text-blue-600 transition-colors">{language === 'ar' ? 'الصفقات' : 'Appels d\'offres'}</a>
            <a href="#" className="hover:text-blue-600 transition-colors">{language === 'ar' ? 'الأسعار' : 'Tarifs'}</a>
            <a href="#" className="hover:text-blue-600 transition-colors">{language === 'ar' ? 'اتصل بنا' : 'Contact'}</a>
          </div>
          <div className="flex items-center space-x-4 gap-4">
            <div className="flex items-center space-x-2 text-sm">
              <Globe className="w-4 h-4 text-gray-500" />
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'fr' | 'ar' | 'en')}
                className="border-none bg-transparent text-gray-700 font-medium focus:ring-0 cursor-pointer"
              >
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
