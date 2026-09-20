"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useState } from "react";
import { Building2, MapPin, CalendarDays, Wallet, Sparkles } from "lucide-react";
import axios from "axios";

export default function TenderCard({ tender }: { tender: any }) {
  const { language, t } = useLanguage();
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const title = tender.title || tender.reference;
  const buyer = tender.buyer || '---';
  const category = tender.type || '---';
  
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
      onClick={() => window.location.href = `/tender?id=${tender.id}`}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium mb-3">
            {category}
          </span>
          <span className={`inline-block px-3 py-1 ml-2 mr-2 rounded-full text-xs font-medium mb-3 ${
                tender.status === 'Ouvert' ? 'bg-green-100 text-green-700' : 
                tender.status === 'Attribue' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
              }`}>
            {tender.status === 'Ouvert' ? (language === 'ar' ? 'مفتوح' : 'Ouvert') :
                 tender.status === 'Attribue' ? (language === 'ar' ? 'تم التفويت' : 'Attribué') :
                 tender.status}
          </span>
          <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2 line-clamp-2">
            {title}
          </h3>
        </div>
        <div className="text-right flex-shrink-0 ml-4 rtl:mr-4 rtl:ml-0">
          <p className="text-sm text-gray-500 mb-1">{t('deadline')}</p>
          <p className="font-semibold text-red-600 flex items-center justify-end gap-1">
            <CalendarDays className="w-4 h-4" />
            {tender.deadline_date ? new Date(tender.deadline_date).toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-FR') : '---'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center text-gray-600">
          <Building2 className="w-4 h-4 mr-2 ml-2 text-gray-400 flex-shrink-0" />
          <span className="text-sm truncate" title={buyer}>{buyer}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Wallet className="w-4 h-4 mr-2 ml-2 text-gray-400 flex-shrink-0" />
          <span className="text-sm font-medium">{tender.initial_estimated_cost ? Number(tender.initial_estimated_cost).toLocaleString('fr-FR') : '---'} MAD</span>
        </div>
      </div>

      {tender.winner_name && (
        <div className="mb-4 bg-green-50 p-3 rounded-lg border border-green-100 flex items-center justify-between">
          <span className="text-sm text-green-800 font-medium">🏆 {language === 'ar' ? 'الفائز' : 'Attributaire'}: {tender.winner_name}</span>
        </div>
      )}

      {summary && (
        <div className="bg-purple-50 rounded-lg p-4 mb-4 border border-purple-100" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center text-purple-800 font-medium text-sm mb-2">
            <Sparkles className="w-4 h-4 mr-2 ml-2" />
            {t('summary')}
          </div>
          <p className="text-purple-900 text-sm leading-relaxed">{summary}</p>
        </div>
      )}

      <div className="pt-4 border-t border-gray-100 flex justify-end">
        <button 
          onClick={handleSummarize}
          disabled={loading || summary !== null}
          className="flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-4 h-4 mr-2 ml-2" />
          {loading ? t('summarizing') : t('summarize_ai')}
        </button>
      </div>
    </div>
  );
}
