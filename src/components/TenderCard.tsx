"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useState } from "react";
import { Building2, MapPin, CalendarDays, Wallet, Sparkles, Clock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TenderCard({ tender }: { tender: any }) {
  const { language, t } = useLanguage();
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const title = tender.title || tender.reference;
  const buyer = tender.buyer || '---';
  const category = tender.type || '---';
  
  const isAr = language === 'ar';
  
  // Format dates
  const publishDate = tender.publish_date ? new Date(tender.publish_date).toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR') : '---';
  const deadlineDate = tender.deadline_date ? new Date(tender.deadline_date).toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR') : 
                       (tender.deadline ? new Date(tender.deadline).toLocaleDateString(isAr ? 'ar-MA' : 'fr-FR') : '---');

  // Calculate days left
  let daysLeftText = '';
  let isUrgent = false;
  if (tender.deadline_date || tender.deadline) {
    const d = new Date(tender.deadline_date || tender.deadline);
    const diffTime = d.getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 0) {
      isUrgent = diffDays <= 3;
      daysLeftText = isAr ? `باقي ${diffDays} أيام` : `J - ${diffDays}`;
    } else {
      daysLeftText = isAr ? 'انتهى الأجل' : 'Expiré';
    }
  }

  // Create a description fallback since DB doesn't have it explicitly right now
  const description = tender.title || '';

  const handleSummarize = async (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent card click
    setLoading(true);
    try {
      const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
      if (!OPENROUTER_API_KEY) {
        setSummary("API Key not found. Please add NEXT_PUBLIC_OPENROUTER_API_KEY to your environment variables.");
        setLoading(false);
        return;
      }

      let prompt = "";
      if (language === 'ar') {
        prompt = `لخص طلب العروض هذا في جملتين باللغة العربية، مع التركيز على نوع العمل والمكان: "${description}"`;
      } else if (language === 'en') {
        prompt = `Summarize the following tender in 2 sentences in English, focusing on the type of work and location: "${description}"`;
      } else {
        prompt = `Résume l'appel d'offres suivant en 2 phrases en français, en te concentrant sur le type de travaux et le lieu : "${description}"`;
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3-8b-instruct:free",
          messages: [
            { role: "system", content: "You are an assistant that summarizes public tenders clearly and concisely." },
            { role: "user", content: prompt }
          ]
        })
      });

      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        setSummary(data.choices[0].message.content);
      } else {
        throw new Error("Invalid response");
      }
    } catch (error) {
      console.error("AI summarization failed", error);
      setSummary("Failed to generate summary. Please check your OpenRouter API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onClick={() => router.push(`/tender?id=${tender.id}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer overflow-hidden group flex flex-col md:flex-row"
    >
      <div className="w-full md:w-2 bg-blue-600 hidden md:block"></div>
      
      <div className="p-5 md:p-6 flex-grow flex flex-col justify-between">
        
        <div>
          <div className="flex justify-between items-start mb-3 gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-md text-xs font-semibold">
                {category}
              </span>
              <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                  tender.status === 'Ouvert' ? 'bg-green-100 text-green-700 border-green-200' : 
                  tender.status === 'Attribue' ? 'bg-purple-100 text-purple-700 border-purple-200' : 
                  tender.status === 'En cours' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                }`}>
                {tender.status === 'Ouvert' ? (isAr ? 'مفتوح' : 'Ouvert') :
                 tender.status === 'Attribue' ? (isAr ? 'تم التفويت' : 'Attribué') :
                 tender.status === 'En cours' ? (isAr ? 'في طور الإنجاز' : 'En cours') :
                 tender.status}
              </span>
            </div>
            
            {daysLeftText && (
              <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border shrink-0 ${
                isUrgent ? 'bg-red-50 text-red-600 border-red-100' : 'bg-orange-50 text-orange-600 border-orange-100'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{daysLeftText}</span>
              </div>
            )}
          </div>

          <h3 className="text-lg font-bold text-gray-900 leading-snug mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
            {title}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 mb-4">
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <Building2 className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <span className="line-clamp-1" title={buyer}>{buyer}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{tender.city || (isAr ? 'المغرب' : 'Maroc')}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
              <CalendarDays className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{deadlineDate}</span>
            </div>
            
            {tender.initial_estimated_cost && (
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Wallet className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{Number(tender.initial_estimated_cost).toLocaleString('fr-FR')} MAD</span>
              </div>
            )}
          </div>
        </div>

        {tender.winner_name && (
          <div className="mb-4 bg-green-50 px-3 py-2 rounded-lg border border-green-100 inline-flex items-center">
            <span className="text-sm text-green-800 font-medium">🏆 {isAr ? 'الفائز' : 'Attributaire'}: {tender.winner_name}</span>
          </div>
        )}

        {summary && (
          <div className="bg-purple-50 rounded-lg p-4 mb-4 border border-purple-100 mt-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center text-purple-800 font-medium text-sm mb-2">
              <Sparkles className="w-4 h-4 mr-2 ml-2" />
              {t('summary')}
            </div>
            <p className="text-purple-900 text-sm leading-relaxed">{summary}</p>
          </div>
        )}

      </div>

      <div className="bg-gray-50 border-t md:border-t-0 md:border-l border-gray-100 p-5 flex flex-col justify-center items-center md:items-end min-w-[200px] shrink-0 gap-3">
        <p className="text-xs text-gray-500 text-center md:text-right hidden md:block font-mono bg-white px-2 py-1 border border-gray-200 rounded">
          Réf: {tender.reference || tender.id.split('-').slice(0, 2).join('-')}
        </p>
        
        <button 
          onClick={handleSummarize}
          disabled={loading || summary !== null}
          className="w-full flex items-center justify-center px-4 py-2 bg-white border border-purple-200 hover:bg-purple-50 hover:border-purple-300 text-purple-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {loading ? t('summarizing') : t('summarize_ai')}
        </button>

        <button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {t('view_details')}
          <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  );
}
