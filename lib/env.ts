const requiredEnvVars = [
  'NEXT_PUBLIC_GEMINI_API_KEY',
];

const optionalEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

export function validateEnv(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];
  
  for (const key of requiredEnvVars) {
    const value = process.env[key];
    if (!value || value === '' || value.startsWith('your_')) {
      missing.push(key);
    }
  }

  const firebaseKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!firebaseKey || firebaseKey === 'your_firebase_api_key' || firebaseKey.startsWith('your_')) {
    warnings.push('Firebase not configured - running in mock mode');
  }

  return { valid: missing.length === 0, missing, warnings };
}

export function getEnvWarnings(): string[] {
  const warnings: string[] = [];
  const validation = validateEnv();
  warnings.push(...validation.warnings);
  
  if (process.env.NODE_ENV === 'production') {
    if (process.env.NEXT_PUBLIC_GEMINI_API_KEY?.startsWith('AIzaSy')) {
      const keyLength = process.env.NEXT_PUBLIC_GEMINI_API_KEY.length;
      if (keyLength < 30) {
        warnings.push('GEMINI_API_KEY appears invalid');
      }
    }
  }
  
  return warnings;
}

if (typeof require !== 'undefined') {
  const validation = validateEnv();
  if (!validation.valid) {
    console.error('Missing required environment variables:', validation.missing.join(', '));
  }
  if (validation.warnings.length > 0) {
    console.warn('Environment warnings:', validation.warnings.join(', '));
  }
}