import { Controller, Post, Body, Get } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post('createOrUpdateVehicle')
  async createOrUpdateVehicle(@Body() dto: CreateVehicleDto) {
    return this.vehicleService.createOrUpdateVehicle(dto);
  }

  @Get('findAllVehicles')
  async findAllVehicles() {
    return this.vehicleService.findAllVehicles();
  }
}
