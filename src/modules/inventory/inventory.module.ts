import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Pricing, PricingSchema } from '../pricing/schema/pricing.schema';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { SingleInventoryReqRes, SingleInventoryReqResSchema } from './schemas/single-inventory-req-res';



@Module({
  imports: [MongooseModule.forFeature([{ name: Pricing.name, schema: PricingSchema }, { name: SingleInventoryReqRes.name, schema: SingleInventoryReqResSchema }])],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [MongooseModule]
})
export class InventoryModule {}
