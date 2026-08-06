export default () => ({
  port: parseInt(process.env.PORT, 10) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },

  search: {
    tavily: { apiKey: process.env.TAVILY_API_KEY },
    exa: { apiKey: process.env.EXA_API_KEY },
    firecrawl: { apiKey: process.env.FIRECRAWL_API_KEY },
    serpapi: { apiKey: process.env.SERPAPI_API_KEY },
  },

  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },

  storage: {
    bucket: process.env.STORAGE_BUCKET || 'mindcanvas-exports',
  },
});
