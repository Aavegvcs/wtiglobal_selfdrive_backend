// cities.controller.ts
import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { SearchLocationsService } from './search-locations.service';
import { CreateCityDto } from './dto/create-city.dto';
import { CreateCountryDto } from './dto/create-country.dto';
import { Response } from 'express';

@Controller('search-locations')
export class SearchLocationsController {
  constructor(private readonly searchLocationsService: SearchLocationsService) {}

  @Post("createCity")
  async createCity(@Body() createCityDto: CreateCityDto, @Res() res: Response): Promise<any> {
    const response = await this.searchLocationsService.createCity(createCityDto);
    return res.status(response.statusCode).json(response)
  }

  @Post("createCountry")
  async createCountry(@Body() createCountryDto: CreateCountryDto, @Res() res: Response): Promise<any> {
    const response = await this.searchLocationsService.createCountry(createCountryDto);
    return res.status(response.statusCode).json(response)
  }

  @Get("getCitiesOnCountryCode/:countryCode")
  async getCitiesOnCountryCode(@Param('countryCode') countryCode:string, @Res() res: Response): Promise<any> {
    const response = await this.searchLocationsService.getCitiesOnCountryCode(countryCode);
    return res.status(response.statusCode).json(response)
  }
}
