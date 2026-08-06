import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Global validation — allow extra fields so third-party clients don't break
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // allow extra fields gracefully
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS — supporting localhost, process.env origins, and production wildcards
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.APP_URL,
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGIN,
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0 || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Allow Vercel preview & production deployments
      if (origin.endsWith('.vercel.app') || origin.includes('localhost')) {
        return callback(null, true);
      }
      callback(null, true); // Fallback: allow request in production
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // WebSocket CORS (Socket.IO)
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`🚀 MindCanvas API running on http://localhost:${port}/api/v1`);
}

bootstrap();
