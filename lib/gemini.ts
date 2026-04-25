const GEMINI_API_KEYS = [
  'AIzaSyBGOv8b2mAluxf5DY9aMzDGraSvnqaBq0Y',
  'AIzaSyCZWKPPM3k3-9Hli9hu84cnDGHC24uc-V4',
  'AIzaSyCgt-TkEUDH6kmtdhXEOfKtReD9cViSUB8',
];

const OPENROUTER_API_KEYS = [
  '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',
  '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',
  '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',
];

let geminiKeyIndex = 0;
let openrouterKeyIndex = 0;

function getNextGeminiKey() {
  const key = GEMINI_API_KEYS[geminiKeyIndex % GEMINI_API_KEYS.length];
  geminiKeyIndex++;
  return key;
}

function getNextOpenRouterKey() {
  const key = OPENROUTER_API_KEYS[openrouterKeyIndex % OPENROUTER_API_KEYS.length];
  openrouterKeyIndex++;
  return key;
}

export async function getAIResponse(prompt: string): Promise<string> {
  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    const apiKey = getNextGeminiKey();
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!res.ok) {
        console.warn(`Gemini API error ${res.status}`);
        continue;
      }

      const data = await res.json();

      if (data.error) {
        if (data.error.code === 429) {
          console.warn(`Gemini key quota exceeded, trying next key...`);
          continue;
        }
        throw new Error(data.error.message || 'Gemini API error');
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Empty response from Gemini');
      return text;
    } catch (err: any) {
      if (err.message?.includes('quota') || err.message?.includes('429')) {
        console.warn(`Gemini key failed, trying next...`);
        continue;
      }
      console.warn(`Gemini fetch failed: ${err.message || 'Network error'}`);
      continue;
    }
  }

  for (let i = 0; i < OPENROUTER_API_KEYS.length; i++) {
    const apiKey = getNextOpenRouterKey();
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'TradingRocket',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!res.ok) {
        console.warn(`OpenRouter API error ${res.status}`);
        continue;
      }
      
      const data = await res.json();

      if (data.error) {
        if (data.error.code === 429 || data.error.message?.includes('quota')) {
          console.warn(`OpenRouter key quota exceeded, trying next...`);
          continue;
        }
        throw new Error(data.error.message || 'OpenRouter API error');
      }

      const text = data?.choices?.[0]?.message?.content;
      if (!text) throw new Error('Empty response from OpenRouter');
      return text;
    } catch (err: any) {
      if (err.message?.includes('quota') || err.message?.includes('429')) {
        console.warn(`OpenRouter key failed, trying next...`);
        continue;
      }
      console.warn(`OpenRouter fetch failed, trying next...`);
      continue;
    }
  }

  throw new Error('All API keys failed');
}

export function getMockStockAnalysis(stockName: string): any {
  const stocks: Record<string, any> = {
    'RELIANCE': {
      name: 'Reliance Industries Ltd',
      exchange: 'NSE/BSE',
      sector: 'Conglomerate',
      isin: 'INE002A01018',
      ipoPrice: 256,
      listedYear: 1977,
      cmp: 2980,
      change: 45.20,
      changePct: 1.54,
      kpis: {
        'Market Cap': '₹20.2L Cr',
        'P/E Ratio': '28.5',
        'P/B Ratio': '2.8',
        'ROE': '10.2%',
        'Dividend Yield': '0.35%',
        '52W High': '₹3200',
        '52W Low': '₹2450',
        'Beta': '0.82',
        'EPS': '₹104.5',
        'Book Value': '₹1,065',
        'Debt/Equity': '0.45',
        'OCF': '₹98,500 Cr'
      },
      balanceSheet: { 
        assets: [['Total Assets', '₹21.5L Cr'], ['Current Assets', '₹4.8L Cr'], ['Fixed Assets', '₹12.3L Cr']],
        liabilities: [['Total Liabilities', '₹11.8L Cr'], ['Long Term Debt', '₹3.2L Cr'], ['Current Liabilities', '₹2.1L Cr']],
        incomeStatement: [['Net Profit', '₹74,088 Cr'], ['Revenue', '₹9.16L Cr'], ['EBITDA', '₹1.95L Cr']],
        keyRatios: [['Debt/Equity', '0.45'], ['Current Ratio', '1.8'], ['Quick Ratio', '1.2'], ['Asset Turnover', '0.42']]
      },
      financialSummary: {
        revenue: { q4_2024: '₹2.41L Cr', yoy: '+16.8%', trend: 'up' },
        profit: { q4_2024: '₹19,641 Cr', yoy: '+8.9%', trend: 'up' },
        margin: { operating: '19.2%', net: '8.1%' },
        guidance: 'Targeting green energy expansion with ₹75L Cr investment over 5 years'
      },
      about: 'Reliance Industries is India\'s largest private sector company, with businesses across energy, petrochemicals, textiles, natural resources, retail, and telecommunications. The conglomerate has been instrumental in India\'s digital revolution through Jio and recently announced major green energy initiatives. With a market cap exceeding ₹20 lakh crore, it remains a bellwether of the Indian economy.',
      companyDetails: {
        headquarters: 'Maharashtra, India',
        ceo: 'Mukesh Ambani',
        founded: '1960',
        employees: '2,50,000+',
        website: 'www.reliance.com',
        annualReport: 'https://www.reliance.com/annual-report'
      },
      news: [
        { date: '2024-04-15', headline: 'Reliance announces ₹75L Cr investment in green energy', sentiment: 'bull' },
        { date: '2024-03-28', headline: 'Jio 5G coverage reaches 90% of India', sentiment: 'bull' },
        { date: '2024-02-10', headline: 'Retail arm crosses 20,000 stores milestone', sentiment: 'neutral' }
      ],
      timeline: [['1977', 'IPO at ₹256'], ['2000', 'RIL enters telecom'], ['2010', 'Petrochemicals expansion'], ['2016', 'Jio launch revolutionizes telecom'], ['2020', 'Google invests ₹33,737 Cr in Jio'], ['2022', 'Mission Green Zero announced'], ['2023', 'New Energy subsidiary formed'], ['2024', 'Hydrogen mission launch']],
      futurePlans: ['Green hydrogen manufacturing plant', '5G network pan-India rollout', 'Retail store expansion to 25,000', 'Renewable energy 100GW target', 'AI integration in operations', 'Semiconductor manufacturing', 'Carbon neutrality by 2035'],
      signals: [{ label: 'Trend', value: 'Strong Bullish', type: 'bull' }, { label: 'RSI (14)', value: '62 - Neutral', type: 'neutral' }, { label: 'MACD', value: 'Positive Crossover', type: 'bull' }, { label: 'Support', value: '₹2,850', type: 'neutral' }, { label: 'Resistance', value: '₹3,100', type: 'neutral' }]
    },
    'TCS': {
      name: 'Tata Consultancy Services Ltd',
      exchange: 'NSE/BSE',
      sector: 'IT Services',
      isin: 'INE467B01029',
      ipoPrice: 850,
      listedYear: 2004,
      cmp: 4250,
      change: -28.50,
      changePct: -0.67,
      kpis: {
        'Market Cap': '₹15.6L Cr',
        'P/E Ratio': '26.2',
        'P/B Ratio': '15.2',
        'ROE': '43.2%',
        'Dividend Yield': '1.52%',
        '52W High': '₹4520',
        '52W Low': '₹3650',
        'Beta': '0.78',
        'EPS': '₹162.4',
        'Book Value': '₹279',
        'Debt/Equity': '0.08',
        'OCF': '₹38,200 Cr'
      },
      balanceSheet: { 
        assets: [['Total Assets', '₹1.4L Cr'], ['Cash & Equivalents', '₹52,000 Cr'], ['Receivables', '₹28,000 Cr']],
        liabilities: [['Total Liabilities', '₹48K Cr'], ['Employee Liability', '₹32,000 Cr'], ['Deferred Revenue', '₹8,500 Cr']],
        incomeStatement: [['Net Profit', '₹1.2L Cr'], ['Revenue', '₹2.4L Cr'], ['EBITDA', '₹58,000 Cr']],
        keyRatios: [['Debt/Equity', '0.08'], ['Operating Margin', '24.2%'], ['Attrition Rate', '7.2%'], ['Utilization', '85%']]
      },
      financialSummary: {
        revenue: { q4_2024: '₹65,213 Cr', yoy: '+9.4%', trend: 'up' },
        profit: { q4_2024: '₹12,441 Cr', yoy: '+15.7%', trend: 'up' },
        margin: { operating: '24.2%', net: '19.1%' },
        guidance: 'Expecting double-digit growth in FY25'
      },
      about: 'TCS is a global leader in IT services, consulting, and business solutions, serving clients in 150+ countries. As part of the Tata Group, it has maintained its position as India\'s most valuable company with industry-leading margins and employee retention. The company is aggressively investing in AI and cloud capabilities.',
      companyDetails: {
        headquarters: 'Mumbai, India',
        ceo: 'Krithica Nair (CEO & MD)',
        founded: '1968',
        employees: '6,14,000+',
        website: 'www.tcs.com',
        annualReport: 'www.tcs.com/investor-relations'
      },
      news: [
        { date: '2024-04-10', headline: 'TCS wins $1.2B multi-year deal from UK bank', sentiment: 'bull' },
        { date: '2024-03-25', headline: 'AI platform adoption crosses 1M users', sentiment: 'bull' },
        { date: '2024-02-05', headline: 'Q4 results beat estimates, stock surges', sentiment: 'bull' }
      ],
      timeline: [['2004', 'IPO at ₹850'], ['2009', 'Becomes largest IT exporter'], ['2015', 'Digital services transformation'], ['2020', 'Remote work infrastructure'], ['2022', 'Generative AI practice launch'], ['2024', 'AI Force platform launch']],
      futurePlans: ['AI-powered enterprise solutions', 'Cloud modernization services', 'Data & analytics expansion', 'Cybersecurity services growth', 'Sustainability consulting', 'Talent development 5L+ reskilled'],
      signals: [{ label: 'Trend', value: 'Slight Pullback', type: 'neutral' }, { label: 'RSI (14)', value: '55 - Neutral', type: 'neutral' }, { label: 'MACD', value: 'Negative Divergence', type: 'bear' }, { label: 'Support', value: '₹4,100', type: 'neutral' }, { label: 'Resistance', value: '₹4,350', type: 'neutral' }]
    },
    'HDFCBANK': {
      name: 'HDFC Bank Ltd',
      exchange: 'NSE/BSE',
      sector: 'Banking',
      isin: 'INE040A01034',
      ipoPrice: 750,
      listedYear: 2001,
      cmp: 1720,
      change: 12.30,
      changePct: 0.72,
      kpis: {
        'Market Cap': '₹13.2L Cr',
        'P/E Ratio': '20.5',
        'P/B Ratio': '2.6',
        'ROE': '17.8%',
        'Dividend Yield': '0.82%',
        '52W High': '₹1850',
        '52W Low': '₹1480',
        'Beta': '1.12',
        'EPS': '₹83.9',
        'Book Value': '₹661',
        'CASA Ratio': '84%',
        'CAR': '19.2%'
      },
      balanceSheet: { 
        assets: [['Total Assets', '₹23.3L Cr'], ['Advances', '₹14.8L Cr'], ['Investments', '₹5.2L Cr']],
        liabilities: [['Total Liabilities', '₹21.8L Cr'], ['Deposits', '₹18.5L Cr'], ['Borrowings', '₹1.8L Cr']],
        incomeStatement: [['Net Profit', '₹63,286 Cr'], ['Net Interest Income', '₹89,500 Cr'], ['Fee Income', '₹28,000 Cr']],
        keyRatios: [['CASA Ratio', '84%'], ['NNPA', '0.32%'], ['CRR', '4.5%'], ['SLR', '18%']]
      },
      financialSummary: {
        revenue: { q4_2024: '₹83,521 Cr', yoy: '+24.2%', trend: 'up' },
        profit: { q4_2024: '₹14,552 Cr', yoy: '+18.5%', trend: 'up' },
        margin: { npa: '3.2%', netInterest: '3.4%' },
        guidance: 'HDFC merger synergies on track'
      },
      about: 'HDFC Bank is India\'s largest private sector bank by assets and market capitalization, serving over 95 million customers. Post-merger with HDFC Ltd, it has become the world\'s third largest bank by assets. The bank is known for its strong retail franchise, digital innovation, and healthy asset quality.',
      companyDetails: {
        headquarters: 'Mumbai, India',
        ceo: 'Sashidhar Jagdishan (MD & CEO)',
        founded: '1994',
        employees: '2,20,000+',
        website: 'www.hdfcbank.com',
        annualReport: 'www.hdfcbank.com/annual-report'
      },
      news: [
        { date: '2024-04-18', headline: 'HDFC merger completed, branches rationalized', sentiment: 'neutral' },
        { date: '2024-04-05', headline: 'Digital transactions hit record high', sentiment: 'bull' },
        { date: '2024-03-15', headline: 'Q4 profit rises 18.5% YoY', sentiment: 'bull' }
      ],
      timeline: [['2001', 'IPO at ₹750'], ['2006', 'HDIL acquisition (reversed)'], ['2015', 'PayZapp digital launch'], ['2020', 'Pandemic resilience'], ['2023', 'HDFC merger approved'], ['2024', 'Post-merger integration complete']],
      futurePlans: ['Digital banking transformation', 'Rural branch expansion', 'Credit card growth 2X', 'Tech investment ₹12,000 Cr', 'Sustainable finance initiative'],
      signals: [{ label: 'Trend', value: 'Bullish', type: 'bull' }, { label: 'RSI (14)', value: '58 - Neutral', type: 'neutral' }, { label: 'MACD', value: 'Positive', type: 'bull' }, { label: 'Support', value: '₹1,680', type: 'neutral' }, { label: 'Resistance', value: '₹1,800', type: 'neutral' }]
    },
    'INFY': {
      name: 'Infosys Ltd',
      exchange: 'NSE/BSE',
      sector: 'IT Services',
      isin: 'INE009A01021',
      ipoPrice: 350,
      listedYear: 1999,
      cmp: 1880,
      change: -15.40,
      changePct: -0.81,
      kpis: {
        'Market Cap': '₹7.8L Cr',
        'P/E Ratio': '25.8',
        'P/B Ratio': '6.8',
        'ROE': '30.2%',
        'Dividend Yield': '2.12%',
        '52W High': '₹2050',
        '52W Low': '₹1580',
        'Beta': '0.85',
        'EPS': '₹72.8',
        'Book Value': '₹276',
        'Debt/Equity': '0.12',
        'OCF': '₹32,500 Cr'
      },
      balanceSheet: { 
        assets: [['Total Assets', '₹2.1L Cr'], ['Cash & Investments', '₹42,000 Cr'], ['Receivables', '₹24,000 Cr']],
        liabilities: [['Total Liabilities', '₹62K Cr'], ['Employee Liability', '₹42,000 Cr'], ['Deferred Revenue', '₹12,000 Cr']],
        incomeStatement: [['Net Profit', '₹63,286 Cr'], ['Revenue', '₹1.6L Cr'], ['EBITDA', '₹38,000 Cr']],
        keyRatios: [['Debt/Equity', '0.12'], ['Operating Margin', '21.2%'], ['Attrition Rate', '8.6%'], ['Utilization', '83%']]
      },
      financialSummary: {
        revenue: { q4_2024: '₹38,938 Cr', yoy: '+7.2%', trend: 'up' },
        profit: { q4_2024: '₹6,130 Cr', yoy: '+11.8%', trend: 'up' },
        margin: { operating: '21.2%', net: '15.7%' },
        guidance: 'Maintaining 2-4% constant currency growth guidance'
      },
      about: 'Infosys is a global leader in next-generation digital services and consulting, helping clients in 56 countries navigate their digital transformation. The company has been at the forefront of AI adoption with its Infosys Topaz platform and maintains strong relations with Fortune 500 clients.',
      companyDetails: {
        headquarters: 'Bengaluru, India',
        ceo: 'Salil Parekh (CEO)',
        founded: '1981',
        employees: '3,43,000+',
        website: 'www.infosys.com',
        annualReport: 'www.infosys.com/annual-report'
      },
      news: [
        { date: '2024-04-12', headline: 'Infosys Topaz gains 200+ enterprise clients', sentiment: 'bull' },
        { date: '2024-03-30', headline: 'Q4 revenue below expectations', sentiment: 'bear' },
        { date: '2024-02-20', headline: 'Strategic partnership with Microsoft', sentiment: 'bull' }
      ],
      timeline: [['1999', 'IPO at ₹350'], ['2002', 'First Fortune 500 client'], ['2011', 'Infosys 3.0 transformation'], ['2019', 'Microsoft Azure partnership'], ['2023', 'Top employer India'], ['2024', 'Generative AI labs launch']],
      futurePlans: ['AI solutions platform expansion', 'Cloud modernization services', 'Data analytics growth', 'Sustainability consulting', 'Talent development 1M+ trained'],
      signals: [{ label: 'Trend', value: 'Consolidating', type: 'bear' }, { label: 'RSI (14)', value: '42 - Bearish', type: 'bear' }, { label: 'MACD', value: 'Negative', type: 'bear' }, { label: 'Support', value: '₹1,720', type: 'neutral' }, { label: 'Resistance', value: '₹1,950', type: 'neutral' }]
    },
    'NIFTY': {
      name: 'Nifty 50 Index',
      exchange: 'NSE',
      sector: 'Index',
      isin: 'INF0IS200138',
      ipoPrice: 1000,
      listedYear: 1995,
      cmp: 22950,
      change: 125.30,
      changePct: 0.55,
      kpis: {
        'Market Cap': '₹410L Cr',
        'P/E Ratio': '22.5',
        'P/B Ratio': '3.8',
        'Div Yield': '1.32%',
        '52W High': '₹23500',
        '52W Low': '₹18950',
        'Beta': '1.0',
        'Volatility': '12.5%',
        'Turnover': '₹1.2L Cr/day',
        'Components': '50 stocks'
      },
      balanceSheet: { 
        assets: [['Total MCap', '₹410L Cr'], ['Float MCap', '₹220L Cr'], ['Ave Daily Vol', '₹85,000 Cr']],
        liabilities: [['Bear/Bull', 'Market Weight'], ['FII Holdings', '38.5%'], ['DII Holdings', '22.8%']],
        incomeStatement: [['Top Sectors', 'Financial Services'], ['Technology', '16.8%'], ['Energy', '14.2%']],
        keyRatios: [['PE 30', '23.5'], ['PB 30', '3.2'], ['VIX', '13.5'], ['PCR', '0.95']]
      },
      financialSummary: {
        performance: { ytd: '+6.2%', trend: 'up' },
        sector: { top: 'IT +2.1%', laggard: 'Metal -1.2%' },
        outlook: 'Rally supported by FII inflows and strong earnings'
      },
      about: 'The Nifty 50 is the flagship index of the National Stock Exchange of India, comprising 50 of the largest and most liquid Indian companies. It serves as a benchmark for the Indian equity market and is used by investors worldwide to track the Indian economy.',
      companyDetails: {
        base: 'NSE, Mumbai',
        calculator: 'Free Float Market Cap',
        rebalance: 'Quarterly',
        website: 'www.nseindia.com',
        methodology: 'Top 50 by float-adjusted mcap'
      },
      news: [
        { date: '2024-04-20', headline: 'Nifty hits new all-time high', sentiment: 'bull' },
        { date: '2024-04-15', headline: 'FII inflows cross ₹50,000 Cr in April', sentiment: 'bull' },
        { date: '2024-04-10', headline: 'RBI maintains status quo, markets rally', sentiment: 'bull' }
      ],
      timeline: [['1995', 'Index launched at 1000'], ['2000', 'Online trading begins'], ['2010', 'Crosses 6000'], ['2020', 'Pandemic low 7600'], ['2023', 'Crosses 22000'], ['2024', 'New highs']],
      futurePlans: ['Strong Q4 earnings support rally', 'FII momentum continues', 'Domestic flows robust', 'Global tailwinds positive', 'Technical breakout above 23000'],
      signals: [{ label: 'Trend', value: 'Strong Bullish', type: 'bull' }, { label: 'RSI (14)', value: '68 - Overbought', type: 'neutral' }, { label: 'MACD', value: 'Strong Positive', type: 'bull' }, { label: 'Support', value: '₹22,500', type: 'neutral' }, { label: 'Target', value: '₹23,500', type: 'bull' }]
    },
    'GOLD': {
      name: 'Gold (MCX)',
      exchange: 'MCX',
      sector: 'Commodity',
      isin: 'INE00B4B4HN70',
      ipoPrice: 32000,
      listedYear: 2000,
      cmp: 72500,
      change: 450.00,
      changePct: 0.62,
      kpis: {
        'Spot Price': '₹72,500/10g',
        '52W High': '₹74,800',
        '52W Low': '₹58,500',
        'USD/oz': '$2,385',
        'INR/USD': '₹83.2',
        'Beta': 'Hedge',
        'Volatility': '14.2%',
        'Returns YTD': '+11.2%',
        'Returns 1Y': '+18.5%'
      },
      balanceSheet: { 
        assets: [['Global Reserves', '36,000 tonnes'], ['India Reserves', '800 tonnes'], ['Central Banks', 'Net Buyers']],
        liabilities: [['Supply Constraint', 'Mining output'], ['Demand', 'Festive + Investment']], 
        incomeStatement: [['Global Demand', '4,800 tonnes'], ['India Demand', '800 tonnes'], ['Investment Demand', '+24%']],
        keyRatios: [['Gold/USD', 'Inverse correlation'], ['Gold/INR', '+16% YTD'], ['Gold/Sensex', 'Outperforming']]
      },
      financialSummary: {
        price: { current: '₹72,500', trend: 'up' },
        drivers: { dollar: 'Weak', inflation: 'Elevated', uncertainty: 'High' },
        outlook: 'Safe haven demand remains strong'
      },
      about: 'Gold is a precious metal that serves as a hedge against inflation and currency fluctuations. In India, gold holds cultural significance and is traditionally purchased during festivals and weddings. MCX Gold futures allow investors to trade gold with standardized contracts.',
      companyDetails: {
        exchange: 'MCX, India',
        contract: '100g (24K)',
        tick: '₹1/10g',
        margin: '5%',
        website: 'www.mcxindia.com'
      },
      news: [
        { date: '2024-04-19', headline: 'Gold hits record ₹72,500 on global cues', sentiment: 'bull' },
        { date: '2024-04-12', headline: 'Central banks continue gold buying spree', sentiment: 'bull' },
        { date: '2024-04-05', headline: 'Dhanteras sales cross ₹50,000 Cr', sentiment: 'neutral' }
      ],
      timeline: [['2000', 'MCX launch'], ['2011', 'Peak $1,900/oz'], ['2020', 'COVID surge ₹55,000'], ['2022', 'Fed rate hikes'], ['2024', 'Record ₹72,500']],
      futurePlans: ['Fed rate cut expectations', 'Geopolitical tensions', 'Central bank buying', 'INR depreciation', 'Investment demand'],
      signals: [{ label: 'Trend', value: 'Very Bullish', type: 'bull' }, { label: 'RSI (14)', value: '72 - Overbought', type: 'neutral' }, { label: 'MACD', value: 'Strong Positive', type: 'bull' }, { label: 'Support', value: '₹71,000', type: 'neutral' }, { label: 'Target', value: '₹75,000', type: 'bull' }]
    }
  };
  return stocks[stockName.toUpperCase()] || stocks['RELIANCE'];
}