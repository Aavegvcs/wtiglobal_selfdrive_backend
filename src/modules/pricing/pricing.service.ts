import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdatePricingDto } from './dto/update-pricing.dto';
import { Pricing, PricingDocument } from './schema/pricing.schema';
import { CreatePricingDto } from './dto/create-pricing.dto';
import { standardResponse } from 'src/common/helpers/response.helper';

@Injectable()
export class PricingService {
  constructor(
    @InjectModel(Pricing.name) private pricingModel: Model<PricingDocument>,
  ) {}

  async createAndUpdateVehiclePricing(dto: CreatePricingDto): Promise<any> {
    try {
      const { vehicle_id, vendor_id } = dto;

      const filter: any = { vehicle_id };
      if (vendor_id) filter.vendor_id = vendor_id;

      const existing = await this.pricingModel.findOne(filter);

      if (existing) {
        const vehicleData = await this.pricingModel.findByIdAndUpdate(
          existing._id,
          dto,
          {
            new: true,
          },
        );
        if (vehicleData) {
          return standardResponse(
            true,
            'vehicle data updated successfully',
            200,
            {
              pricingUpdated: true,
              pricingAdded: false,
            },
            null,
            '/pricing/createAndUpdateVehiclePricing',
          );
        } else {
          return standardResponse(
            false,
            'unable to update vehicle data',
            400,
            {
              pricingUpdated: false,
              pricingAdded: false,
            },
            null,
            '/pricing/createAndUpdateVehiclePricing',
          );
        }
      } else {
        await this.pricingModel.create(dto);
        return standardResponse(
          true,
          'new vehicle data added successfully',
          200,
          {
            pricingUpdated: false,
            pricingAdded: true,
          },
          null,
          '/pricing/createAndUpdateVehiclePricing',
        );
      }
    } catch (error) {
      return standardResponse(
        false,
        'internal server error',
        500,
        {
          pricingUpdated: true,
          pricingAdded: false,
        },
        error.stack,
        '/pricing/createAndUpdateVehiclePricing',
      );
    }
  }

  async getAllVehiclePricing(): Promise<any> {
    try {
      const result = await this.pricingModel.find({ isActive: true }).exec();

      if (!result || result.length === 0) {
        return standardResponse(
          true,
          'No active vehicle pricing data found',
          200,
          { data: [] },
          null,
          '/pricing/getAllVehiclePricing',
        );
      }

      return standardResponse(
        true,
        'Active vehicle pricing data fetched successfully',
        200,
        result,
        null,
        '/pricing/getAllVehiclePricing',
      );
    } catch (error) {
      return standardResponse(
        false,
        'Internal server error',
        500,
        null,
        error,
        '/pricing/getAllVehiclePricing',
      );
    }
  }

  async getSingleVehiclePricing(id: string): Promise<any> {
    try {
      const pricing = await this.pricingModel
        .findOne({ _id: id, isActive: true })
        .exec();

      if (!pricing) {
        return standardResponse(
          false,
          'Active vehicle pricing not found',
          404,
          null,
          null,
          '/pricing/getSingleVehiclePricing',
        );
      }

      return standardResponse(
        true,
        'Active vehicle pricing fetched successfully',
        200,
        { data: pricing },
        null,
        '/pricing/getSingleVehiclePricing',
      );
    } catch (error) {
      return standardResponse(
        false,
        'Internal server error',
        500,
        null,
        error,
        '/pricing/getSingleVehiclePricing',
      );
    }
  }
}
