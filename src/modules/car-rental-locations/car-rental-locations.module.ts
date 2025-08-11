import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarRentalLocation, CarRentalLocationSchema } from './schemas/car-rental-locations.schema';
import { CarRentalLocationsService } from './car-rental-locations.service';
import { CarRentalLocationController } from './car-rental-locations.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CarRentalLocation.name, schema: CarRentalLocationSchema }]),
  ],
  controllers: [CarRentalLocationController],
  providers: [CarRentalLocationsService],
})
export class CarRentalLocationsModule {}
