import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Currency } from './schemas/currency.schema';
import { standardResponse } from 'src/common/helpers/response.helper';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectModel(Currency.name) private currencyModel: Model<Currency>,
  ) {}

  async convertCurrency(currencyCode: string) {
    try {
      
      const currency = currencyCode.toUpperCase();
  
      const response = await this.currencyModel.find({}).exec();
      if (!response || !response[0]) {
        throw new HttpException(
          'Currency data not found',
          HttpStatus.NOT_FOUND,
        );
      }
  
      const currencies = response[0].currencies;
  
      if (!currencies["AED"] || !currencies[currency]) {
        throw new HttpException(
          `Conversion rate for ${currency} not found`,
          HttpStatus.BAD_REQUEST,
        );
      }
  
      const oneEuroInBase = currencies["AED"];
      const convertedCurrencyInEuro = currencies[currency];
  
      // simple conversion logic (same as your converter fn)
      const result = oneEuroInBase / convertedCurrencyInEuro;
  
      return standardResponse(
        true,
        'Successfully converted currency',
        200,
        Number(result.toFixed(3)),
        null,
        '/currency/convertCurrency',
      );
    } catch (error) {
      throw new HttpException(
        'Error converting currency',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
