import { NextRequest, NextResponse } from 'next/server';

const GNEWS_API_KEY = process.env.GNEWS_API_KEY || '27044fb470fdb59dd0db6ae1c9bbf427';
const GNEWS_BASE_URL = 'https://gnews.io/api/v4';

let cachedData: { articles: any[]; timestamp: number } | null = null;
const CACHE_TTL = 60 * 1000;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang') || 'en';
  const country = searchParams.get('country') || 'us';
  const max = searchParams.get('max') || '50';
  const category = searchParams.get('category') || 'business';

  try {
    const now = Date.now();
    let articles: any[] = [];

    if (cachedData && now - cachedData.timestamp < CACHE_TTL) {
      articles = cachedData.articles;
    } else {
      const url = `${GNEWS_BASE_URL}/top-headlines?category=${category}&lang=${lang}&country=${country}&max=${max}&apikey=${GNEWS_API_KEY}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`GNews API error: ${response.status}`);
      }
      const data = await response.json();
      articles = data.articles || [];
      cachedData = { articles, timestamp: now };
    }

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

    return NextResponse.json({
      success: true,
      sentiment_summary: { overall, positive, negative, neutral, high_impact: highImpact },
    });
  } catch (error) {
    console.error('Summary API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch summary', sentiment_summary: null }, { status: 500 });
  }
}