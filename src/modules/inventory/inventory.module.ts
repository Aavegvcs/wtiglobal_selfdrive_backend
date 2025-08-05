import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Pricing, PricingSchema } from '../pricing/schema/pricing.schema';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';



@Module({
  imports: [MongooseModule.forFeature([{ name: Pricing.name, schema: PricingSchema }])],
  controllers: [InventoryController],
  providers: [InventoryService],

})
export class InventoryModule {}
