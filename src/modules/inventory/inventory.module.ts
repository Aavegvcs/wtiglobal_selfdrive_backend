import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Pricing, PricingSchema } from '../pricing/schema/pricing.schema';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { SingleInventoryReqRes, SingleInventoryReqResSchema } from './schemas/single-inventory-req-res';
import { Search, SearchRequestSchema } from './schemas/search-schema';
import { VehicleClass, VehicleClassSchema } from './schemas/vehicle-class.schema';



@Module({
  imports: [MongooseModule.forFeature([{ name: Pricing.name, schema: PricingSchema }, { name: SingleInventoryReqRes.name, schema: SingleInventoryReqResSchema }, { name: Search.name, schema: SearchRequestSchema }, { name: VehicleClass.name, schema: VehicleClassSchema }])],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [MongooseModule]
})
export class InventoryModule {}
