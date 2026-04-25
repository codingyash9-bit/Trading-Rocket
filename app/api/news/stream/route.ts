export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const GNEWS_API_KEY = process.env.GNEWS_API_KEY || '27044fb470fdb59dd0db6ae1c9bbf427';
const GNEWS_BASE_URL = 'https://gnews.io/api/v4';

let lastSeenUrls = new Set<string>();

const classifyImpact = (text: string): { sentiment: string; impact: string } => {
  const lower = text.toLowerCase();
  const positiveKeywords = ['surge', 'soar', 'gain', 'grow', 'rise', 'bullish', 'profit', 'rally', 'boost', 'up'];
  const negativeKeywords = ['drop', 'fall', 'crash', 'bearish', 'loss', 'decline', 'plunge', 'slide', 'down', 'recession'];
  
  const hasPositive = positiveKeywords.some(kw => lower.includes(kw));
  const hasNegative = negativeKeywords.some(kw => lower.includes(kw));
  
  let sentiment = 'neutral';
  if (hasPositive && !hasNegative) sentiment = 'positive';
  else if (hasNegative && !hasPositive) sentiment = 'negative';
  
  let impact = 'low';
  if (lower.includes('breaking') || lower.includes('urgent') || lower.includes('major') || lower.includes(' fed ') || lower.includes('recession')) {
    impact = 'high';
  } else if (lower.includes('report') || lower.includes('quarter') || lower.includes('earnings')) {
    impact = 'medium';
  }
  
  return { sentiment, impact };
};

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const pollForNews = async () => {
        try {
          const url = `${GNEWS_BASE_URL}/top-headlines?category=business&lang=en&country=us&max=20&apikey=${GNEWS_API_KEY}`;
          const response = await fetch(url);
          
          if (!response.ok) return;
          
          const data = await response.json();
          const articles = data.articles || [];
          
          for (const article of articles) {
            if (!lastSeenUrls.has(article.url)) {
              lastSeenUrls.add(article.url);
              
              if (lastSeenUrls.size > 100) {
                const arr = Array.from(lastSeenUrls);
                arr.slice(-50).forEach(u => lastSeenUrls.delete(u));
                arr.slice(0, 50).forEach(u => lastSeenUrls.add(u));
              }
              
              const fullText = `${article.title || ''} ${article.description || ''}`;
              const { sentiment, impact } = classifyImpact(fullText);
              
              if (impact === 'high') {
                sendEvent({
                  type: 'breaking',
                  article: {
                    title: article.title,
                    url: article.url,
                    image: article.image,
                    source: article.source?.name || 'Unknown',
                    description: article.description,
                    published_at: article.publishedAt,
                    sentiment,
                    impact,
                    sector: 'general',
                  }
                });
              }
            }
          }
        } catch (e) {
          console.error('SSE poll error:', e);
        }
      };
      
      await pollForNews();
      
      const interval = setInterval(pollForNews, 15000);
      
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}