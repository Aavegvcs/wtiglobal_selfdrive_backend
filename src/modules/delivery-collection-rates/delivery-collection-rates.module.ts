import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeliveryCollectionRate, DeliveryCollectionRateSchema } from './schemas/delivery-collection-rates.schema';
import { DeliveryCollectionRatesService } from './delivery-collection-rates.service';
import { DeliveryCollectionRatesController } from './delivery-collection-rates.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeliveryCollectionRate.name, schema: DeliveryCollectionRateSchema },
    ]),
  ],
  providers: [DeliveryCollectionRatesService],
  controllers: [DeliveryCollectionRatesController]
})
export class DeliveryCollectionRateModule {}
