import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { SearchPricingDto } from './dto/search-all-inventory.dto';
import { InventoryService } from './inventory.service';
import { response, Response } from 'express';
import { SearchSinglePricingDto } from './dto/search-single-inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('getAllInventory')
  async getAllInventoryWithPricing(@Body() dto: SearchPricingDto , @Res() res: Response) {
    const response = await this.inventoryService.getAllInventoryWithPricing(dto);
    return res.status(response.statusCode).json(response)
  }
  @Get('getAllInventoryByCountry/:country_id')
  async getAllInventoryByCountry(@Param('country_id') country_id:String, @Res() res: Response) {
    const response = await this.inventoryService.getAllInventoryByCountry(country_id);
    return res.status(response.statusCode).json(response)
  }
  @Post('getSingleInventory')
  async getSingleInventoryWithPricing(@Body() dto: SearchSinglePricingDto, @Res() res: Response) {
    const response = await this.inventoryService.getSingleInventoryWithPricing(dto);
    return res.status(response.statusCode).json(response)
  }
}
