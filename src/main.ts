import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import mongoose from 'mongoose';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

   // ✅ Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'], // Allow and specify domains
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: false, // don't convert types
      // whitelist: true,  // remove extra fields not in DTO
      // forbidNonWhitelisted: true, // throw error on extra fields
    }),
  );
  
  // ✅ Get ConfigService from the app
  const configService = app.get(ConfigService);

  // ✅ Set global prefix here
  app.setGlobalPrefix('/selfdrive/v1');

  await app.listen(configService.get<string>('PORT') ?? 3000);
    // Log successful MongoDB connection
  mongoose.connection.once('open', () => {
    console.log('✅ Connected to MongoDB');
  });

  // Log errors if connection fails
  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
  });

  console.log(`🚀 Running in ${process.env.NODE_ENV} mode ...!`);

}
bootstrap();
