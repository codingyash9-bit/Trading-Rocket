import { z } from 'zod';

export const ChatMessageSchema = z.object({
  message: z.string().min(1, 'Message is required').max(4000, 'Message too long'),
});

export const AnalyzeRequestSchema = z.object({
  symbol: z.string().min(1, 'Symbol required').max(10, 'Invalid symbol'),
  type: z.enum(['overview', 'fundamentals', 'technical', 'verdict']).optional(),
});

export const PortfolioItemSchema = z.object({
  ticker: z.string().min(1).max(10),
  companyName: z.string().min(1).max(100),
  exchange: z.enum(['NSE', 'BSE']),
  quantity: z.number().int().positive(),
  avgPrice: z.number().positive(),
  currentPrice: z.number().positive().optional(),
});

export const PortfolioUpdateSchema = z.object({
  items: z.array(PortfolioItemSchema).min(0).max(100),
  action: z.enum(['add', 'remove', 'update']).optional(),
});

export const StockQuerySchema = z.object({
  type: z.enum(['all', 'gainers', 'losers', ' Volume', 'active', 'ipo', 'etfs', 'forex', 'elements']).optional(),
  exchange: z.enum(['NSE', 'BSE', 'ALL']).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const MarketQuerySchema = z.object({
  symbol: z.string().min(1).max(10),
});

export const ReportRequestSchema = z.object({
  symbol: z.string().min(1).max(10),
  type: z.enum(['detailed', 'quick', 'summary']).optional(),
});

export const NewsQuerySchema = z.object({
  query: z.string().max(200).optional(),
  symbols: z.array(z.string()).max(10).optional(),
  limit: z.number().int().min(1).max(50).optional(),
  sentiment: z.enum(['positive', 'negative', 'neutral']).optional(),
});

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
  return { success: false, error: errors };
}

export function withValidation<T>(schema: z.ZodSchema<T>, handler: (data: T) => Promise<Response>) {
  return async (request: Request): Promise<Response> => {
    try {
      const body = await request.json();
      const validation = validateRequest(schema, body);
      if (!validation.success) {
        return Response.json({ error: validation.error }, { status: 400 });
      }
      return handler(validation.data);
    } catch (error) {
      return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }
  };
}