// src/modules/places/places.controller.ts
import { Controller, Get, Param, Res } from '@nestjs/common';
import { GoogleApiService } from './google.service';
import { Response } from 'express';

@Controller('google')
export class GoogleApiController {
  constructor(private readonly googleApiService: GoogleApiService) {}

  @Get('getPlaces/:countryCode/:place')
  async getPlaces(@Param('countryCode') countryCode: string, @Param('place') place: string, @Res() res: Response) {
    const response = await this.googleApiService.getPlaces(countryCode, place);
    return res.status(response.statusCode).json(response)
  }

  @Get('getLatLong/:placeId')
  async getLatLong(@Param('placeId') placeId: string, @Res() res: Response) {
    const response = await this.googleApiService.getLatLong(placeId);
    return res.status(response.statusCode).json(response)
  }
}
