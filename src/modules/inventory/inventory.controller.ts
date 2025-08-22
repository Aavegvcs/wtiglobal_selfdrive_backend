import { Body, Controller, Get, Param, Post, Query, Req, Res, UsePipes, ValidationPipe } from '@nestjs/common';
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
  async getAllInventoryByCountry(@Param('country_id') country_id:string, @Res() res: Response) {
    const response = await this.inventoryService.getAllInventoryByCountry(country_id);
    return res.status(response.statusCode).json(response)
  }
  // @Post('getSingleInventory')
  // async getSingleInventoryWithPricing(@Body() dto: SearchSinglePricingDto, @Res() res: Response) {
  //   const response = await this.inventoryService.getSingleInventoryWithPricing(dto);
  //   return res.status(response.statusCode).json(response)
  // }

  @Get('getSingleInventory')
  @UsePipes(new ValidationPipe({
  transform: true,
  whitelist: true,
  transformOptions: { enableImplicitConversion: true },
}))

  async getSingleInventoryWithPricing(
    @Req() req,
    @Query() q: SearchSinglePricingDto,
    @Res() res: Response,
  ) {
    console.log('RAW query:', req.query);
     console.log('DTO after pipe:', q);
    // normalize defaults
    const dto: SearchSinglePricingDto = {
      ...q,
      source:JSON.parse(req.query.source),
      pickup:JSON.parse(req.query.pickup),
      drop:JSON.parse(req.query.drop),
      // plan_type: 1 = daily/weekly, 2 = monthly (adjust if your mapping differs)
      duration_months: q.plan_type === 2 ? (q.duration_months ?? 1) : (q.duration_months ?? 0),
      collection_charges: q.collection_charges ?? 0,
      delivery_charges:   q.delivery_charges   ?? 0,
      extra_charges:      q.extra_charges      ?? 0,
      is_home_page:       q.is_home_page       ?? false,
    };

    const response = await this.inventoryService.getSingleInventoryWithPricing(dto);
    return res.status(response.statusCode).json(response);
  }
}
