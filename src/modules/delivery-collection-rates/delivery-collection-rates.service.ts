import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { DeliveryCollectionRate } from "./schemas/delivery-collection-rates.schema";
import { Model } from "mongoose";
import { standardResponse } from "src/common/helpers/response.helper";
import { CreateDeliveryCollectionRateDto } from "./dto/create-delivery-collection-rates.dto";
import { ServiceRegions } from "./schemas/service-regions.schema";
import { ServiceHub } from "./schemas/service-hub.schema";
import { GeofenceLatLngDto } from "./schemas/geofence-latlng.dto";


@Injectable()
export class DeliveryCollectionRatesService {
  constructor(
    @InjectModel(DeliveryCollectionRate.name)
    private deliveryCollectionRateModel: Model<DeliveryCollectionRate>,
    @InjectModel(ServiceRegions.name)
    private serviceRegionsModel: Model<ServiceRegions>,
    @InjectModel(ServiceHub.name)
    private serviceHubModel: Model<ServiceHub>,
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

  async getDeliveryCollectionRates(latlng: GeofenceLatLngDto) {
    try {

      const checkAvailability: any = await this.checkPointInCity(latlng);

      console.log("checkAvailability", checkAvailability);

      if (!checkAvailability.inside) {
        return standardResponse(false, 'Location is outside service area', 404, null, null, '/delivery-collection-rates/getDeliveryCollectionRates');
      }

      const result = await this.deliveryCollectionRateModel
        .findOne({
          country: { $regex: new RegExp(`^${checkAvailability.city.country}$`, 'i') },
          city: { $regex: new RegExp(`^${checkAvailability.city.cityName}$`, 'i') },
        }).select("-createdAt -updatedAt -__v")
        .exec();
      return standardResponse(true, 'delivery-collection-rates list fetched successfully', 200, result, null, '/delivery-collection-rates/getDeliveryCollectionRates');
    } catch (error) {
      return standardResponse(false, 'Internal Server Error', 500, null, error.stack, '/delivery-collection-rates/getDeliveryCollectionRates');
    }
  }

  async getServiceHubByCountryAndCity(countryCode: string, city: string) {
    try {
      if (!countryCode || !city) {
        throw new BadRequestException('Missing required country or city');
      }

      const hub = await this.serviceHubModel
        .find({
          country: { $regex: new RegExp(`^${countryCode}$`, 'i') }, // case-insensitive
          city: { $regex: new RegExp(`^${city}$`, 'i') },
        }).select("-createdAt -updatedAt -__v -serviceRegion")
        .exec();

      if (!hub) throw new NotFoundException('Service hub not found');

      return standardResponse(
        true,
        'Successfully fetched service hub',
        200,
        hub,
        null,
        '/service-hub/getServiceHubByCountryAndCity',
      );
    } catch (error) {
      return standardResponse(
        false,
        'Internal Server Error',
        500,
        null,
        error.stack,
        '/service-hub/getServiceHubByCountryAndCity',
      );
    }
  }

  async checkPointInCity(latlng: GeofenceLatLngDto) {
    const { lat, lng } = latlng;


    const point = {
      type: 'Point',
      coordinates: [lng, lat], // GeoJSON requires [lng, lat]
    };

    console.log(point);
    console.log(await this.serviceRegionsModel.find().exec());

    const city = await this.serviceRegionsModel.findOne({
      isActive: true,
      cityCoordinates: {
          $geoIntersects: {
            $geometry: point,
          },
      },
    });

    console.log("city", city);

    if (city) {
      return {
        inside: true,
        city: {
          id: city._id,
          cityName: city.cityName,
          country: city.country,
          parentCity: city.parentCity,
        },
      };
    }

    return {
      inside: false,
      city: null,
    };
  }
}