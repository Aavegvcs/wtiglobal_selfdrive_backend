import { Controller, Post, Body, Get, Res } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { Response } from 'express';

@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post('createOrUpdateVehicle')
  async createOrUpdateVehicle(@Body() dto: CreateVehicleDto, @Res() res: Response) {
    const response = await this.vehicleService.createOrUpdateVehicle(dto);
    return res.status(response.statusCode).json(response)
  }

  @Get('findAllVehicles')
  async findAllVehicles(@Res() res: Response) {
    const response = await this.vehicleService.findAllVehicles();
    return res.status(response.statusCode).json(response)
  }
}
