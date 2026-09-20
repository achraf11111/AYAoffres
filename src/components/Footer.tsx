"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-2xl font-bold text-white mb-4">AYAoffres</h2>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              {isAr 
                ? 'منصتك الذكية الأولى في المغرب لتتبع الصفقات العمومية وتحليلها باستخدام الذكاء الاصطناعي.' 
                : 'Votre première plateforme intelligente au Maroc pour suivre et analyser les marchés publics grâce à l\'IA.'}
            </p>
            <div className="flex space-x-4 space-x-reverse">
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">{isAr ? 'روابط سريعة' : 'Liens Rapides'}</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">{isAr ? 'الرئيسية' : 'Accueil'}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{isAr ? 'جميع الصفقات' : 'Tous les Appels d\'Offres'}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{isAr ? 'كيف يعمل الموقع' : 'Comment ça marche'}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{isAr ? 'الأسعار' : 'Tarifs'}</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">{isAr ? 'قانوني' : 'Légal'}</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">{isAr ? 'شروط الاستخدام' : 'Conditions d\'utilisation'}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{isAr ? 'سياسة الخصوصية' : 'Politique de confidentialité'}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{isAr ? 'اتصل بنا' : 'Contactez-nous'}</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">{isAr ? 'تواصل معنا' : 'Contact'}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                <span>{isAr ? 'الرباط، المغرب' : 'Rabat, Maroc'}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-500 shrink-0" />
                <span dir="ltr">+212 5 00 00 00 00</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500 shrink-0" />
                <span>contact@ayaoffres.ma</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} AYAoffres. {isAr ? 'جميع الحقوق محفوظة.' : 'Tous droits réservés.'}</p>
          <p className="mt-2 md:mt-0">
            {isAr ? 'صنع بكل ❤️ في المغرب' : 'Fait avec ❤️ au Maroc'}
          </p>
        </div>
      </div>
    </footer>
  );
}
