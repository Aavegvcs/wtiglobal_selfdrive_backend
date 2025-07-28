// cities.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cities } from './schemas/cities.schema';
import { CreateCityDto } from './dto/create-city.dto';
import { Countries } from './schemas/countries.schema';
import { CreateCountryDto } from './dto/create-country.dto';
import { standardResponse } from 'src/common/helpers/response.helper';

@Injectable()
export class SearchLocationsService {
  constructor(
    @InjectModel(Cities.name) private readonly cityModel: Model<Cities>,
    @InjectModel(Countries.name) private readonly countryModel: Model<Cities>,
  ) {}

  async createCity(createCityDto: CreateCityDto): Promise<any> {
    try {
      const createdCity = new this.cityModel({
        ...createCityDto,
        countryId: new Types.ObjectId(createCityDto.countryId)
      });
      await createdCity.save();
      return standardResponse(
        true,
        'Successfully created data',
        201,
        null,
        null,
        '/search-locations/createCity',
      );
    } catch (error: any) {
      return standardResponse(
        false,
        'Internal Server Error',
        500,
        null,
        error,
        '/search-locations/createCity',
      );
    }
  }

  async createCountry(createCountryDto: CreateCountryDto): Promise<any> {
    try {
      const createdCountry = new this.countryModel(createCountryDto);
      await createdCountry.save();
      return standardResponse(
        true,
        'Successfully created data',
        201,
        null,
        null,
        '/search-locations/createCountry',
      );
    } catch (error: any) {
      return standardResponse(
        false,
        'Internal Server Error',
        500,
        null,
        error,
        '/search-locations/createCountry',
      );
    }
  }

  async getCitiesOnCountryCode(countryCode: string): Promise<any> {
  try {
    const cities = await this.cityModel
      .find({countryCode: countryCode, isActive: true})
      .select("-_id -countryId -__v -updatedAt -createdAt -isActive")
      .exec();

    return standardResponse(
      true,
      'Cities fetched successfully',
      200,
      cities,
      null,
      '/search-locations/getCitiesOnCountryCode',
    );
  } catch (error: any) {
    return standardResponse(
      false,
      'Internal Server Error',
      500,
      null,
      error,
      '/search-locations/getCitiesOnCountryCode',
    );
  }
}
}
