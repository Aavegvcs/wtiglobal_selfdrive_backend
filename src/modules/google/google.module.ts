// src/modules/places/places.module.ts
import { Module } from '@nestjs/common';
import { GoogleApiController } from './google.controller';
import { GoogleApiService } from './google.service';

@Module({
  controllers: [GoogleApiController],
  providers: [GoogleApiService],
})
export class GoogleApiModule {}
