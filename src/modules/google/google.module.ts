// src/modules/places/places.module.ts
import { Module } from '@nestjs/common';
import { GoogleApiController } from './google.controller';
import { GoogleApiService } from './google.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ExceptionCountry, ExceptionCountrySchema } from '../search-locations/schemas/exception-countries.schema';
import { DeliveryCollectionRateModule } from '../delivery-collection-rates/delivery-collection-rates.module';

@Module({
  imports: [
      MongooseModule.forFeature([{ name: ExceptionCountry.name, schema: ExceptionCountrySchema }]),
      DeliveryCollectionRateModule
    ],
  controllers: [GoogleApiController],
  providers: [GoogleApiService],
})
export class GoogleApiModule {}
