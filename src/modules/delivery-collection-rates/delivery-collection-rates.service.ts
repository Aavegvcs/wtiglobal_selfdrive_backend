import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { DeliveryCollectionRate } from "./schemas/delivery-collection-rates.schema";
import { Model } from "mongoose";
import { standardResponse } from "src/common/helpers/response.helper";
import { CreateDeliveryCollectionRateDto } from "./dto/create-delivery-collection-rates.dto";


@Injectable()
export class DeliveryCollectionRatesService {
  constructor(
    @InjectModel(DeliveryCollectionRate.name)
    private deliveryCollectionRateModel: Model<DeliveryCollectionRate>,
  ) {}

  async createUpdateDeliveryCollectionRates(data: Partial<CreateDeliveryCollectionRateDto>) {
    try {
        // 🔎 Match country + city (case-insensitive)
        const filter = {
        country: { $regex: new RegExp(`^${data.country}$`, 'i') },
        city: { $regex: new RegExp(`^${data.city}$`, 'i') }
        };

        // ⚡ Update if exists, else create
        const updatedOrCreated = await this.deliveryCollectionRateModel.findOneAndUpdate(
        filter,
        { $set: data },
        { new: true, upsert: true } // upsert ensures create if not found
        ).select("-createdAt -updatedAt -__v").exec();

        return standardResponse(
        true,
        `delivery-collection-rates created/updated successfully`,
        200,
        updatedOrCreated,
        null,
        '/delivery-collection-rates/createUpdateDeliveryCollectionRates'
        );

    } catch (error) {
        return standardResponse(
        false,
        'Internal Server Error',
        500,
        null,
        error.stack,
        '/delivery-collection-rates/createUpdateDeliveryCollectionRates'
        );
    }
  }


  async getDeliveryCollectionRatesOnCountry(country: string){
    try {
      const result = await this.deliveryCollectionRateModel.find({country: { $regex: new RegExp(`^${country}$`, 'i') }}).select("-createdAt -updatedAt").exec();
      return standardResponse(true, 'delivery-collection-rates list fetched successfully', 200, result, null, '/delivery-collection-rates/getDeliveryCollectionRatesOnCountry');
    } catch (error) {
      return standardResponse(false, 'Internal Server Error', 500, null, error.stack, '/delivery-collection-rates/getDeliveryCollectionRatesOnCountry');
    }
  }

  async getDeliveryCollectionRatesOnCity(country: string, city: string){
    try {
      const result = await this.deliveryCollectionRateModel
        .findOne({
          country: { $regex: new RegExp(`^${country}$`, 'i') },
          city: { $regex: new RegExp(`^${city}$`, 'i') },
        })
        .exec();
      return standardResponse(true, 'delivery-collection-rates list fetched successfully', 200, result, null, '/delivery-collection-rates/getDeliveryCollectionRatesOnCity');
    } catch (error) {
      return standardResponse(false, 'Internal Server Error', 500, null, error.stack, '/delivery-collection-rates/getDeliveryCollectionRatesOnCity');
    }
  }
}