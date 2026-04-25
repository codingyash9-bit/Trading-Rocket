import { NextRequest, NextResponse } from 'next/server';

const GNEWS_API_KEY = process.env.GNEWS_API_KEY || '27044fb470fdb59dd0db6ae1c9bbf427';
const GNEWS_BASE_URL = 'https://gnews.io/api/v4';

let cachedData: { articles: any[]; timestamp: number } | null = null;
const CACHE_TTL = 60 * 1000;

const fetchGNews = async (url: string) => {
  const now = Date.now();
  if (cachedData && now - cachedData.timestamp < CACHE_TTL) {
    return cachedData.articles;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`GNews API error: ${response.status}`);
  }

  const data = await response.json();
  cachedData = { articles: data.articles || [], timestamp: now };
  return cachedData.articles;
};

const analyzeSentiment = (articles: any[]) => {
  const positiveKeywords = ['surge', 'soar', 'gain', 'grow', 'rise', 'bullish', 'profit', 'rally', 'boost', 'up'];
  const negativeKeywords = ['drop', 'fall', 'crash', 'bearish', 'loss', 'decline', 'plunge', 'slide', 'down', 'recession'];

  let positive = 0, negative = 0, neutral = 0, highImpact = 0;

  for (const article of articles) {
    const text = `${article.title || ''} ${article.description || ''}`.toLowerCase();
    const hasPositive = positiveKeywords.some(kw => text.includes(kw));
    const hasNegative = negativeKeywords.some(kw => text.includes(kw));

    if (hasPositive && !hasNegative) positive++;
    else if (hasNegative && !hasPositive) negative++;
    else neutral++;

    if (text.includes('breaking') || text.includes('urgent') || text.includes('major') || text.includes(' Fed ') || text.includes('recession')) {
      highImpact++;
    }
  }

  let overall = 'neutral';
  if (positive > negative + 5) overall = 'positive';
  else if (negative > positive + 5) overall = 'negative';

  return { overall, positive, negative, neutral, high_impact: highImpact };
};

export async function GET(request: NextRequest, { params }: { params: { path?: string[] } }) {
  const { searchParams } = new URL(request.url);
  const pathSegment = params.path?.[0] || 'top-headlines';
  const q = searchParams.get('q') || 'stock market';
  const lang = searchParams.get('lang') || 'en';
  const country = searchParams.get('country') || 'us';
  const max = searchParams.get('max') || '10';
  const category = searchParams.get('category') || 'business';

  try {
    let url: string;
    if (pathSegment === 'top-headlines' || pathSegment === 'market') {
      url = `${GNEWS_BASE_URL}/top-headlines?category=${category}&lang=${lang}&country=${country}&max=${max}&apikey=${GNEWS_API_KEY}`;
    } else if (pathSegment.startsWith('stock/')) {
      const symbol = pathSegment.replace('stock/', '');
      url = `${GNEWS_BASE_URL}/search?q=${symbol}%20stock&lang=${lang}&max=${max}&apikey=${GNEWS_API_KEY}`;
    } else {
      url = `${GNEWS_BASE_URL}/search?q=${encodeURIComponent(q)}&lang=${lang}&max=${max}&apikey=${GNEWS_API_KEY}`;
    }

    const articles = await fetchGNews(url);

    const transformed = articles.map((article: any) => {
      const text = `${article.title || ''} ${article.description || ''}`.toLowerCase();
      const hasPositive = ['surge', 'soar', 'gain', 'grow', 'rise', 'bullish', 'profit', 'rally', 'boost', 'up'].some(kw => text.includes(kw));
      const hasNegative = ['drop', 'fall', 'crash', 'bearish', 'loss', 'decline', 'plunge', 'slide', 'down', 'recession'].some(kw => text.includes(kw));

      let sentiment = 'neutral';
      if (hasPositive && !hasNegative) sentiment = 'positive';
      else if (hasNegative && !hasPositive) sentiment = 'negative';

      let impact = 'low';
      if (text.includes('breaking') || text.includes('urgent') || text.includes('major') || text.includes(' Fed ') || text.includes('recession')) {
        impact = 'high';
      } else if (text.includes('report') || text.includes('quarter') || text.includes('earnings')) {
        impact = 'medium';
      }

      return {
        title: article.title,
        url: article.url,
        image: article.image,
        source: article.source?.name || 'Unknown',
        description: article.description,
        published_at: article.publishedAt,
        sentiment,
        impact,
        sector: 'general',
      };
    });

    return NextResponse.json({ success: true, data: transformed });
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch news', data: [] }, { status: 500 });
  }
}