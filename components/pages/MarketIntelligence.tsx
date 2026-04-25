'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NewsArticle {
  id: string;
  title: string;
  url: string;
  image: string | null;
  source: string;
  sourceLogo?: string;
  description: string;
  published_at: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  impact: 'high' | 'medium' | 'low';
  impactDirection: 'positive' | 'negative' | 'mixed';
  sector: string;
  impactedSectors?: string[];
  affectedStocks?: string[];
}

interface SentimentSummary {
  overall: 'positive' | 'negative' | 'neutral';
  positive: number;
  negative: number;
  neutral: number;
  high_impact: number;
}

interface ImpactSource {
  name: string;
  logo: string;
  reliability: number;
  bias: 'positive' | 'negative' | 'neutral';
}

const sentimentConfig = {
  positive: { color: 'bg-emerald-500/20 text-emerald-400', border: 'border-emerald-500/30' },
  negative: { color: 'bg-rose-500/20 text-rose-400', border: 'border-rose-500/30' },
  neutral: { color: 'bg-yellow-500/20 text-yellow-400', border: 'border-yellow-500/30' },
};

const impactConfig = {
  high: { label: 'HIGH IMPACT', color: 'ring-2 ring-rose-400/50' },
  medium: { label: 'MEDIUM', color: '' },
  low: { label: 'LOW', color: '' },
};

const impactDirectionConfig = {
  positive: { label: 'Bullish', color: 'text-emerald-400', arrow: '↑' },
  negative: { label: 'Bearish', color: 'text-rose-400', arrow: '↓' },
  mixed: { label: 'Mixed', color: 'text-yellow-400', arrow: '↔' },
};

const sourcesList: ImpactSource[] = [
  { name: 'Economic Times', logo: '/sources/et.png', reliability: 95, bias: 'neutral' },
  { name: 'MoneyControl', logo: '/sources/mc.png', reliability: 90, bias: 'neutral' },
  { name: 'Business Standard', logo: '/sources/bs.png', reliability: 92, bias: 'neutral' },
  { name: 'The Hindu Business Line', logo: '/sources/hbl.png', reliability: 88, bias: 'neutral' },
  { name: 'Financial Express', logo: '/sources/fe.png', reliability: 85, bias: 'neutral' },
  { name: 'Mint', logo: '/sources/mint.png', reliability: 90, bias: 'neutral' },
  { name: 'CNC', logo: '/sources/cnc.png', reliability: 75, bias: 'positive' },
  { name: 'Zee Business', logo: '/sources/zeb.png', reliability: 70, bias: 'neutral' },
  { name: 'NDTV Profit', logo: '/sources/ndtv.png', reliability: 80, bias: 'neutral' },
  { name: 'CNBC TV18', logo: '/sources/cnbc.png', reliability: 85, bias: 'neutral' },
];

const MarketIntelligence: React.FC = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [sentimentSummary, setSentimentSummary] = useState<SentimentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toISOString());
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');

  const fallbackNews: NewsArticle[] = [
    { id: '1', title: 'RBI MPC Meeting: Repo Rate Unchanged at 6.5%, Maintains "Withdrawal of Accommodation" Stance', url: 'https://economictimes.indiatimes.com/markets', image: null, source: 'Economic Times', sourceLogo: '/sources/et.png', description: 'Reserve Bank of India\'s Monetary Policy Committee kept the repo rate steady at 6.5% for the 10th consecutive time, signaling continued focus on inflation targeting while supporting growth.', published_at: new Date(Date.now() - 3600000).toISOString(), sentiment: 'neutral', sentimentScore: 0, impact: 'high', impactDirection: 'mixed', sector: 'Banking & Finance', impactedSectors: ['Banking', 'NBFCs', 'Real Estate'], affectedStocks: ['HDFCBANK', 'ICICIBANK', 'SBIN', 'KOTAKBANK'] },
    { id: '2', title: 'FII Net Buying Continues for 5th Straight Session: ₹3,500 Crore Inflow in Current Month', url: 'https://www.moneycontrol.com/news/business/markets/', image: null, source: 'MoneyControl', sourceLogo: '/sources/mc.png', description: 'Foreign Institutional Investors continued their buying streak in Indian equities with net inflow of ₹3,500 crore so far this month, primarily in Banking, IT, and Auto sectors.', published_at: new Date(Date.now() - 7200000).toISOString(), sentiment: 'positive', sentimentScore: 0.78, impact: 'high', impactDirection: 'positive', sector: 'Market Flow', impactedSectors: ['Banking', 'IT', 'Auto'], affectedStocks: ['HDFCBANK', 'TCS', 'INFY', 'MARUTI'] },
    { id: '3', title: 'IT Sector Q3 Results Beat Expectations: TCS, INFY Report Strong Growth', url: 'https://www.business-standard.com/markets', image: null, source: 'Business Standard', sourceLogo: '/sources/bs.png', description: 'Major IT companies reported better-than-expected Q3 results with revenue growth of 5-8% YoY. Strong deal pipeline and digital transformation spending driving momentum.', published_at: new Date(Date.now() - 10800000).toISOString(), sentiment: 'positive', sentimentScore: 0.65, impact: 'medium', impactDirection: 'positive', sector: 'Technology', impactedSectors: ['IT Services'], affectedStocks: ['TCS', 'INFY', 'WIPRO', 'HCLTECH'] },
    { id: '4', title: 'Crude Oil Prices Decline: Brent Drops Below $75 Amid Global Oversupply Concerns', url: 'https://www.livemint.com/market/commodities', image: null, source: 'Commodity Watch', sourceLogo: '/sources/cnc.png', description: 'International crude oil prices softened by 5% this week, easing input cost inflation concerns for India which imports 80% of its oil requirements.', published_at: new Date(Date.now() - 14400000).toISOString(), sentiment: 'positive', sentimentScore: 0.55, impact: 'medium', impactDirection: 'positive', sector: 'Commodities', impactedSectors: ['Oil & Gas', 'Aviation', 'Fertilizers'], affectedStocks: ['RELIANCE', 'BPCL', 'IOC'] },
    { id: '5', title: 'Auto Sales Slowdown: PV Registrations Down 8% in January', url: 'https://www.thehindubusinessline.com/markets/', image: null, source: 'The Hindu Business Line', sourceLogo: '/sources/hbl.png', description: 'Passenger vehicle registrations declined by 8% YoY in January, indicating headwinds for the auto sector amid higher interest rates and inflation pressures on consumers.', published_at: new Date(Date.now() - 18000000).toISOString(), sentiment: 'negative', sentimentScore: -0.45, impact: 'medium', impactDirection: 'negative', sector: 'Automobile', impactedSectors: ['Automobiles', 'Auto Components'], affectedStocks: ['MARUTI', 'M&M', 'TATAMOTORS', 'BAJAJ-AUTO'] },
    { id: '6', title: 'Bank NPA Worries: RBI Flags Concerns on Unsecured Personal Loans', url: 'https://www.financialexpress.com/market/', image: null, source: 'Financial Express', sourceLogo: '/sources/fe.png', description: 'RBI expressed concerns over rapid growth in unsecured personal loans, warning banks about potential asset quality deterioration in future quarters.', published_at: new Date(Date.now() - 21600000).toISOString(), sentiment: 'negative', sentimentScore: -0.35, impact: 'high', impactDirection: 'negative', sector: 'Banking & Finance', impactedSectors: ['Banking', 'NBFCs'], affectedStocks: ['HDFCBANK', 'ICICIBANK', 'BAJAJFINSV'] },
    { id: '7', title: 'GST Collections Cross ₹1.8 Lakh Crore in January', url: 'https://www.livemint.com/economy', image: null, source: 'Mint', sourceLogo: '/sources/mint.png', description: 'GST collections exceeded ₹1.8 lakh crore in January, showing robust indirect tax revenue and healthy economic activity across sectors.', published_at: new Date(Date.now() - 25200000).toISOString(), sentiment: 'positive', sentimentScore: 0.62, impact: 'high', impactDirection: 'positive', sector: 'Economy', impactedSectors: ['General'], affectedStocks: [] },
    { id: '8', title: 'India\'s GDP Grows 7.3% in Q3 FY26', url: 'https://www.ndtvprofit.com/economy', image: null, source: 'CNC', sourceLogo: '/sources/cnc.png', description: 'India\'s GDP growth for Q3 FY26 came in at 7.3%, beating market expectations of 6.8%, driven by strong manufacturing and services sector performance.', published_at: new Date(Date.now() - 28800000).toISOString(), sentiment: 'positive', sentimentScore: 0.72, impact: 'high', impactDirection: 'positive', sector: 'Economy', impactedSectors: ['Banking', 'Real Estate', 'Consumer'], affectedStocks: ['HDFCBANK', 'DLF', 'PIDILITIND'] },
  ];

  const fetchNews = useCallback(async () => {
    try {
      setIsError(false);
      const response = await fetch('/api/news/market');
      const data = await response.json();
      
      if (data.success && data.data && data.data.length > 0) {
        setNews(data.data);
        setLastUpdate(new Date().toISOString());
      } else if (!isLoading) {
        setNews(fallbackNews);
      }
    } catch (error) {
      console.error('Failed to fetch news:', error);
      setIsError(true);
      if (!isLoading) {
        setNews(fallbackNews);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch('/api/news/summary');
      const data = await response.json();
      
      if (data.success && data.sentiment_summary) {
        setSentimentSummary(data.sentiment_summary);
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  }, []);

  useEffect(() => {
    fetchNews();
    fetchSummary();
    
    const interval = setInterval(() => {
      fetchNews();
      fetchSummary();
    }, 30000);

    const eventSource = new EventSource('/api/news/stream');
    
    eventSource.onmessage = (event) => {
      try {
        const { type, article } = JSON.parse(event.data);
        if (type === 'breaking' && article) {
          setNews(prev => [article, ...prev].slice(0, 20));
          setLastUpdate(new Date().toISOString());
        }
      } catch (e) {
        console.error('SSE parse error:', e);
      }
    };
    
    eventSource.onerror = () => {
      eventSource.close();
    };
    
    return () => {
      clearInterval(interval);
      eventSource.close();
    };
  }, [fetchNews, fetchSummary]);

  const filteredNews = filter === 'all' 
    ? news 
    : selectedSource === 'all' 
      ? news.filter(n => n.sentiment === filter)
      : news.filter(n => n.sentiment === filter && n.source === selectedSource);

  const getTimeAgo = (dateStr: string) => {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 font-inter">Loading market intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-montserrat font-bold gradient-text-cyano">
            Market Intelligence
          </h1>
          <p className="text-sm text-white/50 mt-1 font-inter">
            Real-time news with AI impact analysis · Updated: {new Date(lastUpdate).toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm text-emerald-400 font-mono">LIVE</span>
        </div>
      </motion.div>

      {/* Sentiment Overview */}
      {sentimentSummary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className={`bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 backdrop-blur-xl rounded-2xl border ${sentimentSummary.overall === 'positive' ? 'border-emerald-500/30' : 'border-white/10'} p-4`}>
            <p className="text-white/50 text-xs mb-1">Overall Sentiment</p>
            <p className={`text-xl font-mono font-bold ${
              sentimentSummary.overall === 'positive' ? 'text-emerald-400' :
              sentimentSummary.overall === 'negative' ? 'text-rose-400' : 'text-yellow-400'
            }`}>
              {sentimentSummary.overall.toUpperCase()}
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <p className="text-white/50 text-xs mb-1">Positive</p>
            <p className="text-xl font-mono font-bold text-emerald-400">{sentimentSummary.positive}</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <p className="text-white/50 text-xs mb-1">Negative</p>
            <p className="text-xl font-mono font-bold text-rose-400">{sentimentSummary.negative}</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <p className="text-white/50 text-xs mb-1">High Impact</p>
            <p className="text-xl font-mono font-bold text-amber-400">{sentimentSummary.high_impact}</p>
          </div>
        </motion.div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 p-1 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
          {(['all', 'positive', 'negative', 'neutral'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-inter font-semibold transition-all duration-300 ${
                filter === tab
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-white/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Source Filter */}
        <select
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
          className="px-4 py-2 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 text-white text-sm font-inter focus:outline-none focus:border-cyan-500/50"
        >
          <option value="all">All Sources</option>
          {sourcesList.map((source) => (
            <option key={source.name} value={source.name}>
              {source.name} ({source.reliability}% reliable)
            </option>
          ))}
        </select>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredNews.map((article, index) => {
            const sentiment = sentimentConfig[article.sentiment] || sentimentConfig.neutral;
            const impact = impactConfig[article.impact] || impactConfig.low;
            const impactDirection = impactDirectionConfig[article.impactDirection] || impactDirectionConfig.mixed;
            const sourceInfo = sourcesList.find(s => s.name === article.source);
            
            return (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01, y: -2 }}
                className={`relative bg-slate-900/60 backdrop-blur-xl rounded-2xl border ${article.impact === 'high' ? impact.color : 'border-white/10'} overflow-hidden group`}
              >
                <div className="p-5">
                  {/* Main Row: Sentiment + Impact Direction + Source */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${sentiment.color} border ${sentiment.border}`}>
                        {article.sentiment.toUpperCase()}
                      </span>
                      <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 text-white/80 border border-white/10">
                        {impact.label}
                      </span>
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${impactDirection.color} flex items-center gap-1`}>
                        <span>{impactDirection.arrow}</span>
                        {impactDirection.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {sourceInfo && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/10">
                          <span className="text-xs text-white/50">{sourceInfo.name}</span>
                          <span className={`text-xs font-mono ${sourceInfo.reliability >= 90 ? 'text-emerald-400' : sourceInfo.reliability >= 80 ? 'text-yellow-400' : 'text-rose-400'}`}>
                            {sourceInfo.reliability}%
                          </span>
                        </div>
                      )}
                      <span className="text-xs text-white/40">{getTimeAgo(article.published_at)}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-white font-inter font-semibold text-base mb-3 line-clamp-2">
                    {article.url && article.url !== '#' ? (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-cyan-400 transition-colors duration-150 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {article.title}
                      </a>
                    ) : (
                      <span className="group-hover:text-cyan-400 transition-colors">{article.title}</span>
                    )}
                  </h3>
                  
                  {/* Description */}
                  {article.description && (
                    <p className="text-white/60 text-sm mb-4 line-clamp-2">
                      {article.description}
                    </p>
                  )}

                  {/* Impact Details: Sector */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0v5m0-16v7m-5 7h14" />
                      </svg>
                      <span className="text-xs text-white/50">Impacted Sectors</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {article.impactedSectors?.map((sector) => (
                        <span key={sector} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-white/70">
                          {sector}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Affected Stocks */}
                  {article.affectedStocks && article.affectedStocks.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-xs text-white/50">Affected Stocks</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {article.affectedStocks?.slice(0, 6).map((stock) => (
                          <span key={stock} className="px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-400 font-mono">
                            {stock}
                          </span>
                        ))}
                        {article.affectedStocks && article.affectedStocks.length > 6 && (
                          <span className="px-2 py-1 rounded bg-white/5 text-xs text-white/50">
                            +{article.affectedStocks.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Read more link */}
                {article.url && article.url !== '#' && (
                  <div className="px-5 pb-4">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors group/link"
                    >
                      Read Full Story
                      <svg
                        className="w-3 h-3 translate-x-0 group-hover/link:translate-x-0.5 transition-transform"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}

                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredNews.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/50">No news articles found</p>
        </div>
      )}
    </div>
  );
};

export default MarketIntelligence;