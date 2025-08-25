import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { standardResponse } from "src/common/helpers/response.helper";


@Injectable()
export class GoogleApiService {

  private readonly apiKey: any;
  
  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOOGLE_API_KEY');
  }


  async getPlaces(countryCode: string, place: string): Promise<any> {
      
    try {
      const endpoint = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${place}&components=country:${countryCode}&key=${this.apiKey}`;

      const response = await axios.get(endpoint);

      let locationArr: any = [];
        for (let i = 0; i < response.data.predictions.length; i++) {
          let primary_text = response.data.predictions[i].description;
          let secondary_text = response.data.predictions[i].structured_formatting.secondary_text;
          let place_id = response.data.predictions[i].place_id;
          let types = response.data.predictions[i].types;
          let terms = response.data.predictions[i].terms;
          let city = "";
          let state = "";
          let country = "";
          if(terms.length && terms.length >= 3){
            city = terms[terms.length-3].value
            state = terms[terms.length-2].value
            country = terms[terms.length-1].value
          } else if(terms.length && terms.length == 2){
            city = terms[terms.length-2].value
            state = terms[terms.length-2].value
            country = terms[terms.length-1].value
          } else if(terms.length && terms.length == 1){
            city = terms[terms.length-1].value
            state = terms[terms.length-1].value
            country = "null"
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
            isAirport: isAirport
          });
        }

      return standardResponse(true, "Successfully fetched results from google api", 200, locationArr, null, "google/getPlaces");
    } catch (error) {
      return standardResponse(false, "Internal Server Error", 500, null, error.stack, "google/getPlaces")
    }
  }

  private checkIfLocationIsAirport(types: string[], primaryText: string): boolean {
    return (
      types.includes('airport') ||
      primaryText.toLowerCase().includes('airport')
    );
  }
}