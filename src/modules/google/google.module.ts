// src/modules/places/places.module.ts
import { Module } from '@nestjs/common';
import { GoogleApiController } from './google.controller';
import { GoogleApiService } from './google.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ExceptionCountry, ExceptionCountrySchema } from '../search-locations/schemas/exception-countries.schema';

@Module({
  imports: [
      MongooseModule.forFeature([{ name: ExceptionCountry.name, schema: ExceptionCountrySchema }]),
    ],
  controllers: [GoogleApiController],
  providers: [GoogleApiService],
})
export class GoogleApiModule {}
