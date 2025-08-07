import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PricingService } from './pricing.service';
import { PricingController } from './pricing.controller';
import { Pricing, PricingSchema } from './schema/pricing.schema';


@Module({
  imports: [MongooseModule.forFeature([{ name: Pricing.name, schema: PricingSchema }])],
  controllers: [PricingController],
  providers: [PricingService],
  // exports: [PricingService]
})
export class PricingModule {}
