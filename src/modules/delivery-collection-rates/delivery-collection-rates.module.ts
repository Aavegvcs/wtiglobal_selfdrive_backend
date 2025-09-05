import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeliveryCollectionRate, DeliveryCollectionRateSchema } from './schemas/delivery-collection-rates.schema';
import { DeliveryCollectionRatesService } from './delivery-collection-rates.service';
import { DeliveryCollectionRatesController } from './delivery-collection-rates.controller';
import { ServiceRegions, ServiceRegionsSchema } from './schemas/service-regions.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeliveryCollectionRate.name, schema: DeliveryCollectionRateSchema },
      { name: ServiceRegions.name, schema: ServiceRegionsSchema },
    ]),
  ],
  providers: [DeliveryCollectionRatesService],
  controllers: [DeliveryCollectionRatesController],
  exports: [DeliveryCollectionRatesService],
})
export class DeliveryCollectionRateModule {}
