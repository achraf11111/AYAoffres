"use client";

import { useEffect, useState, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import TenderCard from "@/components/TenderCard";
import { Search, SlidersHorizontal, TrendingUp, Building, Clock, ChevronDown } from "lucide-react";
import { supabase } from '@/lib/supabase';

export default function HomeClient() {
  const { t, language } = useLanguage();
  const [tenders, setTenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;
  
  // Track if it's the first render to avoid double fetching
  const isFirstRender = useRef(true);

  const fetchTenders = async (currentPage = 1, isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);
    
    try {
      let query = supabase
        .from('tenders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });
        
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,buyer.ilike.%${searchQuery}%,reference.ilike.%${searchQuery}%`);
      }
      
      if (selectedCategories.length > 0) {
        query = query.in('type', selectedCategories);
      }

      // Pagination
      const from = (currentPage - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;
        
      if (error) throw error;
      
      const newTenders = data || [];
      if (newTenders.length < limit) setHasMore(false);
      else setHasMore(true);

      if (count !== null) setTotalCount(count);

      if (isLoadMore) {
        setTenders(prev => [...prev, ...newTenders]);
      } else {
        setTenders(newTenders);
      }
    } catch (error) {
      console.error("Failed to fetch tenders", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Reset pagination when search or filters change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchTenders(1, false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchTenders(1, false);
    }, 300);
    
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedCategories]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTenders(nextPage, true);
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
            {language === 'ar' ? 'اكتشف أفضل الصفقات العمومية في المغرب' : language === 'en' ? 'Discover Top Public Tenders in Morocco' : 'Découvrez les Meilleurs Appels d\'Offres au Maroc'}
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            {language === 'ar' ? 'منصة ذكية تتيح لك إيجاد وتتبع الصفقات المناسبة لشركتك بسهولة باستخدام الذكاء الاصطناعي.' : language === 'en' ? 'A smart platform to easily find and track the right tenders for your business using AI.' : 'Une plateforme intelligente pour trouver et suivre facilement les appels d\'offres adaptés à votre entreprise.'}
          </p>
          
          <div className="max-w-3xl mx-auto bg-white rounded-full p-2 flex shadow-lg">
            <div className="flex-grow flex items-center pl-6">
              <Search className="w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_placeholder')}
                className="w-full py-3 px-4 text-gray-900 outline-none bg-transparent"
              />
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-colors">
              {language === 'ar' ? 'ابحث' : 'Rechercher'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><TrendingUp className="w-6 h-6"/></div>
            <div>
              <p className="text-sm text-gray-500">{language === 'ar' ? 'صفقات اليوم' : 'Nouveaux aujourd\'hui'}</p>
              <p className="text-2xl font-bold text-gray-900">142</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 space-x-reverse border-l md:border-gray-100 md:pl-6">
            <div className="bg-green-100 p-3 rounded-lg text-green-600"><Building className="w-6 h-6"/></div>
            <div>
              <p className="text-sm text-gray-500">{language === 'ar' ? 'المؤسسات العمومية' : 'Acheteurs publics'}</p>
              <p className="text-2xl font-bold text-gray-900">85</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 space-x-reverse border-l md:border-gray-100 md:pl-6">
            <div className="bg-purple-100 p-3 rounded-lg text-purple-600"><Clock className="w-6 h-6"/></div>
            <div>
              <p className="text-sm text-gray-500">{language === 'ar' ? 'تنتهي قريباً' : 'Expire bientôt'}</p>
              <p className="text-2xl font-bold text-gray-900">38</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <div className="w-full md:w-1/4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900">{language === 'ar' ? 'تصفية النتائج' : 'Filtres'}</h3>
              <SlidersHorizontal className="w-4 h-4 text-gray-500" />
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{language === 'ar' ? 'القطاع' : 'Catégorie'}</label>
                <div className="space-y-2">
                  {['Travaux', 'Services', 'Fournitures'].map((cat) => (
                    <label key={cat} className="flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4" 
                      />
                      <span className="ml-2 text-sm text-gray-600">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('city')}</label>
                <select className="w-full border-gray-300 rounded-lg text-sm p-2 bg-gray-50 outline-none">
                  <option>Tous / الكل</option>
                  <option>Casablanca</option>
                  <option>Rabat</option>
                  <option>Tanger</option>
                  <option>Marrakech</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tenders List */}
        <div className="w-full md:w-3/4">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">{t('latest_tenders')}</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
              {totalCount > 0 ? `${totalCount} ${language === 'ar' ? 'نتائج' : 'résultats'}` : ''}
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {tenders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                  <p className="text-gray-500">{language === 'ar' ? 'لا توجد نتائج تطابق بحثك' : 'Aucun résultat trouvé'}</p>
                </div>
              ) : (
                <>
                  {tenders.map((tender) => (
                    <TenderCard key={tender.id} tender={tender} />
                  ))}
                  
                  {hasMore && (
                    <div className="pt-6 pb-12 flex justify-center">
                      <button 
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-8 rounded-full transition-colors disabled:opacity-50"
                      >
                        {loadingMore ? (
                           <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700"></div>
                        ) : (
                          <>
                            <ChevronDown className="w-5 h-5" />
                            {language === 'ar' ? 'عرض المزيد' : 'Voir plus'}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
