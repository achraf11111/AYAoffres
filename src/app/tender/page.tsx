"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Building, Calendar, FileText, CheckCircle, Tag, DollarSign } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";

function TenderDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const { t, language } = useLanguage();
  
  const [tender, setTender] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchTender = async () => {
      try {
        const { data, error } = await supabase
          .from('tenders')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        setTender(data);
      } catch (error) {
        console.error("Failed to fetch tender", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTender();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col">
        <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{language === 'ar' ? 'لم يتم العثور على الصفقة' : 'Appel d\'offres non trouvé'}</h1>
          <button onClick={() => router.push('/')} className="text-blue-600 hover:underline">
            {language === 'ar' ? 'العودة للصفحة الرئيسية' : 'Retour à l\'accueil'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      
      
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className={`w-5 h-5 ${language === 'ar' ? 'ml-2 rotate-180' : 'mr-2'}`} />
          <span>{language === 'ar' ? 'رجوع' : 'Retour'}</span>
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Header */}
          <div className="bg-blue-50 border-b border-blue-100 p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                tender.status === 'Ouvert' ? 'bg-green-100 text-green-700' : 
                tender.status === 'Attribue' ? 'bg-purple-100 text-purple-700' : 
                tender.status === 'En cours' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {tender.status === 'Ouvert' ? (language === 'ar' ? 'مفتوح' : 'Ouvert') :
                 tender.status === 'Attribue' ? (language === 'ar' ? 'تم التفويت' : 'Attribué') :
                 tender.status === 'En cours' ? (language === 'ar' ? 'في طور الإنجاز' : 'En cours') :
                 tender.status}
              </span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Tag className="w-4 h-4" />
                {tender.type}
              </span>
              <span className="text-gray-500 text-sm font-mono bg-white px-2 py-1 rounded border">
                {tender.reference}
              </span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
              {tender.title}
            </h1>
          </div>

          {/* Content Body */}
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Main Info */}
            <div className="md:col-span-2 space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Building className="w-5 h-5 text-gray-400" />
                  {language === 'ar' ? 'صاحب المشروع' : 'Acheteur public'}
                </h3>
                <p className="text-gray-700 text-lg bg-gray-50 p-4 rounded-lg border border-gray-100">{tender.buyer}</p>
              </div>

              {tender.winner_name && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    {language === 'ar' ? 'الشركة الفائزة' : 'Attributaire'}
                  </h3>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <p className="text-green-800 font-bold text-lg mb-1">{tender.winner_name}</p>
                    {tender.winning_amount && (
                      <p className="text-green-700 font-semibold flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {tender.winning_amount.toLocaleString('fr-FR')} MAD
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Details */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">{language === 'ar' ? 'تواريخ مهمة' : 'Dates importantes'}</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4" />
                      {language === 'ar' ? 'تاريخ النشر' : 'Date de publication'}
                    </p>
                    <p className="font-medium text-gray-900">
                      {tender.publish_date ? new Date(tender.publish_date).toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-FR') : '---'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4" />
                      {language === 'ar' ? 'آخر أجل' : 'Date limite'}
                    </p>
                    <p className="font-bold text-red-600">
                      {tender.deadline_date ? (
                        <>
                          {new Date(tender.deadline_date).toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-FR')}
                          {" "}
                          {new Date(tender.deadline_date).toLocaleTimeString(language === 'ar' ? 'ar-MA' : 'fr-FR', {hour: '2-digit', minute:'2-digit'})}
                        </>
                      ) : (
                        tender.deadline ? new Date(tender.deadline).toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-FR') : '---'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {tender.initial_estimated_cost && (
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                  <p className="text-sm text-blue-600 font-medium mb-1">{language === 'ar' ? 'المبلغ التقديري' : 'Estimation'}</p>
                  <p className="font-bold text-xl text-blue-900">
                    {tender.initial_estimated_cost.toLocaleString('fr-FR')} MAD
                  </p>
                </div>
              )}

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />
                {language === 'ar' ? 'تحميل الوثائق (DCE)' : 'Télécharger le DCE'}
              </button>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function TenderDetail() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TenderDetailContent />
    </Suspense>
  );
}
