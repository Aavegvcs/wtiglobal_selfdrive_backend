import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VehicleService } from './vehicle.service';
import { Vehicle, vehicleSchema } from './schemas/vehicle.schema';
import { VehicleController } from './vehicles.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Vehicle.name, schema: vehicleSchema }
    ]),
  ],
  controllers: [VehicleController], //routing
  providers: [VehicleService], //for business logic
  exports: [VehicleService], // Exporting the service for use in other modules
})
export class VehicleModule {}
