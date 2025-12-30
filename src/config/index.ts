import dotenv from 'dotenv';
dotenv.config();


function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}


function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}


function validateConfig() {
  const required = ['JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM', 'COOKIE_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Configuration error: Missing required environment variables: ${missing.join(', ')}`
    );
  }
}


validateConfig()


export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(getOptionalEnv('PORT', '4000')),
  host: getOptionalEnv('HOST', '0.0.0.0'),
  env: {
    isProduction: process.env.NODE_ENV === 'production',
  },
  mongodb: {
    uri: getOptionalEnv('MONGODB_URI', 'mongodb://localhost:27017/devcruit'),
    dbName: 'devcruit',
  },
  redis: {
    url: getOptionalEnv('REDIS_URL', 'redis://localhost:6379'),
  },
  cors: {
    origin: getOptionalEnv('CORS_ORIGIN', 'http://localhost:3000'),
  },
  cookie: {
    secret: getRequiredEnv('COOKIE_SECRET'),
  },
  jwt: {
    secret: getRequiredEnv('JWT_SECRET'),
    accessTokenExpiry: '2m',
    refreshTokenExpiry: 7 * 24 * 60 * 60,
  } as const,
  email: {
    host: getOptionalEnv('EMAIL_HOST', 'smtp.gmail.com'),
    port: parseInt(getOptionalEnv('EMAIL_PORT', '587')),
    user: getRequiredEnv('EMAIL_USER'),
    pass: getRequiredEnv('EMAIL_PASS'),
    from: getRequiredEnv('EMAIL_FROM'),
  },
  google: {
    clientId: getRequiredEnv('GOOGLE_CLIENT_ID'),
    clientSecret: getRequiredEnv('GOOGLE_CLIENT_SECRET'),
    redirectUri: getRequiredEnv('GOOGLE_REDIRECT_URI'),
  },
  otp: {
    ttl: 60,
    length: parseInt(getOptionalEnv('OTP_LENGTH', '6')),
    maxAttempts: parseInt(getOptionalEnv('OTP_MAX_ATTEMPTS', '3')),
  },
  pendingUser: {
    ttl: 120
  },
  cloudinary: {
    cloudName: getRequiredEnv('CLOUDINARY_CLOUD_NAME'),
    apiKey: getRequiredEnv('CLOUDINARY_API_KEY'),
    apiSecret: getRequiredEnv('CLOUDINARY_API_SECRET'),
  },
  stripe: {
    secretKey: getRequiredEnv('STRIPE_SECRET_KEY'),
    webhookSecret: getRequiredEnv('STRIPE_WEBHOOK_SECRET'),
    currency: 'inr' as const
  },
  security: {
    refreshTokenMaxAgeMs: parseInt(
      getOptionalEnv('AUTH_REFRESH_TOKEN_MAX_AGE_MS', String(7 * 24 * 60 * 60 * 1000)),
      10
    ),
    signatureTimestampMaxAgeSeconds: parseInt(
      getOptionalEnv('SIGNATURE_TIMESTAMP_MAX_AGE_SECONDS', '3600'),
      10
    )
  },
  webApp: {
    url: getOptionalEnv('WEB_APP_URL', 'http://localhost:3000')
  },
  gemini: {
    apiKey: getOptionalEnv('GEMINI_API_KEY', ''),
  }
};
