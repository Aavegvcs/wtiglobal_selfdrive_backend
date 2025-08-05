import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { SearchPricingDto } from './dto/search-all-inventory.dto';
import { InventoryService } from './inventory.service';
import { Response } from 'express';

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
}
