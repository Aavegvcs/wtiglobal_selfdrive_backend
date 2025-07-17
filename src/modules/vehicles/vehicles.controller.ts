import { Controller, Post, Body } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  createOrUpdate(@Body() dto: CreateVehicleDto) {
    return this.vehicleService.createOrUpdateVehicle(dto);
  }
}
