import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import axios from "axios";
import { standardResponse } from "src/common/helpers/response.helper";
import { ExceptionCountry, ExceptionCountryDocument } from "../search-locations/schemas/exception-countries.schema";
import { Model } from "mongoose";


@Injectable()
export class GoogleApiService {
  private readonly apiKey: any;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(ExceptionCountry.name)
    private exceptionCountryModel: Model<ExceptionCountryDocument>,
  ) {
    this.apiKey = this.configService.get<string>('GOOGLE_API_KEY');
  }

  private createHashmapFromAddressComponents(components: any) {
    const locationMap = {};

    components.forEach((component: any) => {
      component.types.forEach((type: any) => {
        // Add each type as a key and the corresponding long_name as the value
        locationMap[type] = component.long_name;
      });
    });

    return locationMap;
  }

  private getCityFromHashmap(locationMap: any): string {
    let city = '';

    if (locationMap['locality']) {
      city = locationMap['locality'];
    } else if (
      locationMap['sublocality'] ||
      locationMap['sublocality_level_1']
    ) {
      city = locationMap['sublocality'] || locationMap['sublocality_level_1'];
    } else if (locationMap['administrative_area_level_1']) {
      city = locationMap['administrative_area_level_1'];
    } else if (locationMap['administrative_area_level_2']) {
      city = locationMap['administrative_area_level_2'];
    }

    return city;
  }

  async getPlaces(countryCode: string, place: string): Promise<any> {
    try {
      const endpoint = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${place}&components=country:${countryCode}&key=${this.apiKey}`;

      const response = await axios.get(endpoint);

      let locationArr: any = [];
      for (let i = 0; i < response.data.predictions.length; i++) {
        let primary_text = response.data.predictions[i].description;
        let secondary_text =
          response.data.predictions[i].structured_formatting.secondary_text;
        let place_id = response.data.predictions[i].place_id;
        let types = response.data.predictions[i].types;
        let terms = response.data.predictions[i].terms;
        let city = '';
        let state = '';
        let country = '';
        if (terms.length && terms.length >= 3) {
          city = terms[terms.length - 3].value;
          state = terms[terms.length - 2].value;
          country = terms[terms.length - 1].value;
        } else if (terms.length && terms.length == 2) {
          city = terms[terms.length - 2].value;
          state = terms[terms.length - 2].value;
          country = terms[terms.length - 1].value;
        } else if (terms.length && terms.length == 1) {
          city = terms[terms.length - 1].value;
          state = terms[terms.length - 1].value;
          country = 'null';
        }

        let isAirport = this.checkIfLocationIsAirport(types, primary_text);

        locationArr.push({
          primary_text: primary_text,
          secondary_text: secondary_text,
          place_id: place_id,
          types: types,
          terms: terms,
          city: city,
          state: state,
          country: country,
          isAirport: isAirport,
        });
      }

      return standardResponse(
        true,
        'Successfully fetched results from google api',
        200,
        locationArr,
        null,
        'google/getPlaces',
      );
    } catch (error) {
      return standardResponse(
        false,
        'Internal Server Error',
        500,
        null,
        error.stack,
        'google/getPlaces',
      );
    }
  }

  async getLatLong(placeId: string): Promise<any> {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?place_id=${placeId}&key=${this.apiKey}`;
      const response = await axios.get(url);

      if (!response.data.results.length) {
        return standardResponse(
          false,
          'No results found from google latlng api',
          400,
          null,
          null,
          'google/getLatLong',
        );
      }

      const addressComponents = response.data.results[0]?.address_components;
      const locationMap =
        this.createHashmapFromAddressComponents(addressComponents);

      let country = locationMap['country'];
      let state = locationMap['administrative_area_level_1'];
      let city = this.getCityFromHashmap(locationMap);

      if (city && (!state || !country)) {
        const fetchExceptionCountry = await this.exceptionCountryModel.findOne({
          city: new RegExp(city, 'i'),
        })
          .lean()
          .exec();

        if (!fetchExceptionCountry) {
          await this.exceptionCountryModel.create({ city });
          console.log(
            'New exception country with null data saved from google api - getLatLongChauffeur',
          );
        }

        state = fetchExceptionCountry?.state;
        country = fetchExceptionCountry?.country;
      }
    
      return standardResponse(
        true,
        'Successfully fetched results from google latlng api',
        200,
        {
          latLong: response.data.results[0].geometry.location,
          city,
          state: state ?? city,
          country: country ?? city,
        },
        null,
        'google/getLatLong',
      );
    } catch (error) {
      return standardResponse(
        false,
        'Internal Server Error from google latlng api',
        500,
        null,
        error.stack,
        'google/getLatLong',
      );
    }
  }

  private checkIfLocationIsAirport(
    types: string[],
    primaryText: string,
  ): boolean {
    return (
      types.includes('airport') || primaryText.toLowerCase().includes('airport')
    );
  }
}