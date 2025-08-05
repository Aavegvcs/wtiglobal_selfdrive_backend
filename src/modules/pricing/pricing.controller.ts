import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Res
} from '@nestjs/common';
import { PricingService } from './pricing.service';
import { CreatePricingDto } from './dto/create-pricing.dto';
import { Response } from 'express';


@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  // ✅ Create or Update Pricing (Upsert)
  @Post('createAndUpdateVehiclePricing')
  async createAndUpdateVehiclePricing(@Body() dto: CreatePricingDto, @Res() res: Response) {
    const response = await this.pricingService.createAndUpdateVehiclePricing(dto);
    return res.status(response.statusCode).json(response)
  }

  // ✅ Get All Active Vehicle Pricing
  @Get('getAllVehiclePricing')
  async getAllActivePricing(@Res() res: Response) {
    const response = await this.pricingService.getAllVehiclePricing();
    return res.status(response.statusCode).json(response)
  }

  // ✅ Get One Active Vehicle Pricing by ID
  @Get('getSingleVehiclePricing/:id')
  async getSingleActivePricing(@Param('id') id: string, @Res() res: Response) {
    const response = await this.pricingService.getSingleVehiclePricing(id);
    return res.status(response.statusCode).json(response)
  }
}
