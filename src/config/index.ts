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
  const required = ['JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM', 'COOKIE_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Configuration error: Missing required environment variables: ${missing.join(', ')}`
    );
  }
}


validateConfig();


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
  },
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
  },
  pendingUser:{
    ttl:120
  }
};
