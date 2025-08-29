import { Controller, Get, Param, Res } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { Response } from "express";

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('convertCurrency/:currency')
  async convertCurrency(@Param('currency') currency: string, @Res() res: Response) {
    const response = await this.currencyService.convertCurrency(currency);
    return res.status(response.statusCode).json(response);
  }
}
