import { Body, Controller, Delete, Get, Param, Post, Put, Res } from '@nestjs/common';
import { Response } from 'express';
import { CreateCarRentalLocationDto } from './dto/create-car-rental-locations.dto';
import { CarRentalLocationsService } from './car-rental-locations.service';

@Controller('car-rental-locations')
export class CarRentalLocationController {
  constructor(private readonly carRentalLocationsService: CarRentalLocationsService) {}

  @Post("createOrUpdateCarRentalLocation")
  async createOrUpdateCarRentalLocation(@Body() dto: Partial<CreateCarRentalLocationDto>, @Res() res: Response) {
    const response = await this.carRentalLocationsService.createOrUpdateCarRentalLocation(dto);
    return res.status(response.statusCode).json(response);
  }

  @Get("getAllCarRentalLocationsOnCountry/:countryCode")
  async getAllCarRentalLocationsOnCountry(@Param('countryCode') countryCode: string, @Res() res: Response) {
    const response = await this.carRentalLocationsService.getAllCarRentalLocationsOnCountry(countryCode);
    return res.status(response.statusCode).json(response);
  }


  @Delete('deleteCarRentalLocation/:id')
  async deleteCarRentalLocation(@Param('id') id: string, @Res() res: Response) {
    const response = await this.carRentalLocationsService.deleteCarRentalLocation(id);
    return res.status(response.statusCode).json(response);
  }
}
