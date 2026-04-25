import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const REPORTS_FILE = join(DATA_DIR, 'portfolio-reports.json');

interface StoredReport {
  id: string;
  ticker: string;
  companyName: string;
  exchange: string;
  sector?: string;
  price: number;
  change: number;
  changePercent: number;
  analysis: {
    fundamental?: string;
    technical?: string;
    sentiment?: string;
    verdict?: string;
  };
  recommendation: string;
  overallScore: number;
  generatedAt: string;
}

function ensureDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadReports(): StoredReport[] {
  ensureDir();
  if (!existsSync(REPORTS_FILE)) {
    return [];
  }
  try {
    const data = readFileSync(REPORTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveReports(reports: StoredReport[]) {
  ensureDir();
  writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2));
}

export async function GET() {
  const reports = loadReports();
  const list = reports.sort((a, b) => 
    new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
  );
  return NextResponse.json({ reports: list, count: list.length });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      ticker, 
      companyName, 
      exchange,
      sector,
      price, 
      change, 
      changePercent,
      analysis,
      recommendation,
      overallScore 
    } = body;

    if (!ticker) {
      return NextResponse.json({ error: 'Ticker required' }, { status: 400 });
    }

    const upperTicker = ticker.toUpperCase();
    const reports = loadReports();
    
    const report: StoredReport = {
      id: `${upperTicker}-${Date.now()}`,
      ticker: upperTicker,
      companyName: companyName || upperTicker,
      exchange: exchange || 'NSE',
      sector: sector || 'Stock',
      price: price || 0,
      change: change || 0,
      changePercent: changePercent || 0,
      analysis: analysis || {},
      recommendation: recommendation || 'HOLD',
      overallScore: overallScore || 50,
      generatedAt: new Date().toISOString(),
    };

    reports.push(report);
    saveReports(reports);

    return NextResponse.json({ 
      success: true, 
      message: `Report for ${upperTicker} saved`,
      report 
    });
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json({ error: 'Failed to save report' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }

  const reports = loadReports();
  const filtered = reports.filter(r => r.id !== id);
  saveReports(filtered);

  return NextResponse.json({ success: true, message: `Deleted ${id}` });
}