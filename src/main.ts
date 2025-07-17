import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import mongoose from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
    // Log successful MongoDB connection
  mongoose.connection.once('open', () => {
    console.log('✅ Connected to MongoDB');
  });

  // Log errors if connection fails
  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
  });

}
bootstrap();
