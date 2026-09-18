"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useState } from "react";
import { Building2, MapPin, CalendarDays, Wallet, Sparkles } from "lucide-react";
import axios from "axios";

export default function TenderCard({ tender }: { tender: any }) {
  const { language, t } = useLanguage();
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const title = language === 'ar' ? tender.title_ar : language === 'en' ? tender.title_en : tender.title;
  const buyer = language === 'ar' ? tender.buyer_ar : language === 'en' ? tender.buyer_en : tender.buyer;
  const city = language === 'ar' ? tender.city_ar : language === 'en' ? tender.city_en : tender.city;
  const category = language === 'ar' ? tender.category_ar : language === 'en' ? tender.category_en : tender.category;
  const description = language === 'ar' ? tender.description_ar : language === 'en' ? tender.description_en : tender.description;

  const handleSummarize = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/ai/summarize', {
        text: description,
        lang: language
      });
      setSummary(response.data.summary);
    } catch (error) {
      console.error("AI summarization failed", error);
      setSummary("Failed to generate summary. Did you add the OpenRouter API key?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium mb-3">
            {category}
          </span>
          <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2">
            {title}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 mb-1">{t('deadline')}</p>
          <p className="font-semibold text-red-600 flex items-center justify-end gap-1">
            <CalendarDays className="w-4 h-4" />
            {new Date(tender.deadline).toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-FR')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center text-gray-600">
          <Building2 className="w-4 h-4 mr-2 ml-2 text-gray-400" />
          <span className="text-sm truncate" title={buyer}>{buyer}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <MapPin className="w-4 h-4 mr-2 ml-2 text-gray-400" />
          <span className="text-sm">{city}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Wallet className="w-4 h-4 mr-2 ml-2 text-gray-400" />
          <span className="text-sm font-medium">{tender.estimatedCost.toLocaleString()} MAD</span>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

      {summary && (
        <div className="bg-purple-50 rounded-lg p-4 mb-4 border border-purple-100">
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
