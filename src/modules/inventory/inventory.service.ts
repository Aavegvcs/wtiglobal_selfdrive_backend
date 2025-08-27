import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pricing, PricingDocument } from '../pricing/schema/pricing.schema';
import { SearchPricingDto } from './dto/search-all-inventory.dto';
import { standardResponse } from 'src/common/helpers/response.helper';
import { SearchSinglePricingDto } from './dto/search-single-inventory.dto';
import items from 'razorpay/dist/types/items';
import { SingleInventoryReqRes } from './schemas/single-inventory-req-res';

function parseDateTime(dateStr: string, timeStr: string) {
  const [day, month, year] = dateStr.split('/').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

function fareDetailsCalculation(inventoryRate:number, base_fare: number, extra_charges: number,delivery_charges: number, collection_charges:number) {
    try {
      const tax = 0.05;
      const total = base_fare+extra_charges+delivery_charges+collection_charges;
      const total_tax = total*tax;
      const grand_total = total+total_tax;

      return{
        inventory_rate:Number(inventoryRate.toFixed(0)),
        base_fare:Number(base_fare.toFixed(0)),
        extra_charges:Number(extra_charges.toFixed(0)) || 0,
        delivery_charges:Number(delivery_charges.toFixed(0)) || 0,
        collection_charges:Number(collection_charges.toFixed(0)) || 0,
        total:Number(total.toFixed(0)),
        tax:Number(total_tax.toFixed(0)),
        grand_total:Number(grand_total.toFixed(0))
      }

    
    } catch (error) {
      console.log(error);
      return {
        total:0,
        total_tax:0,
        grand_total:0
      }
    }
}


// function dateTimeCalculator(home_page:Boolean,plan_type:number,plan: string,duration_months:number ,pickup: Object, drop: Object, minimum_rental_days: number,durationDays:number){

//   try {
//     "pickup": {
//                 "date": "14/08/2025",
//                 "time": "02:00"
//             },
//             "drop": {
//                 "date": "14/08/2025",
//                 "time": "02:00"
//             },
//     if(home_page){
//       if(plan_type == 1){
//         if(plan == "daily"){
//           add add minimum_rental_days days in pickup to calculate drop date and change the dropdate to it

//         }else if(plan == "weekly"){
//           add 7 days in pickup to calculate drop date and change the dropdate to it
//         }

//       }else{
//         add 30 days in pickup to calculate drop date and change the dropdate to it
//       }


//     }else{
//       if(plan_type == 1){
//         if(plan == "daily"){
//            if(durationDays<minimum_rental_days){
//               add minimum rental days in the pickup and change the drop date and retunr drop date object else use return same drop date
             

//         }else if(plan == "weekly"){
//           return same drop date
//         }

//       }else{
//         if(duration_months == 1){
//           add 30 days in pickup to calculate drop date and change the dropdate to it
//         }else if(duration_months == 3){
//           add 60 days in pickup to calculate drop date and change the dropdate to it
//         }else if(duration_months == 6){
//             add 90 days in pickup to calculate drop date and change the dropdate to it
//         }else if(duration_months == 9){
//           add 120 days in pickup to calculate drop date and change the dropdate to it
//         }
//       }


//     }


    
//   } catch (error) {
//     console.log(error)
//   }
// }

type DateTime = {
  date: string; // format: "DD/MM/YYYY"
  time: string; // format: "HH:mm"
};

function calculateDurationDays(planTypeString:string,pickup:DateTime,drop:DateTime,duration_months:number){

  console.log('111',planTypeString,pickup,drop,duration_months);

  let durationDays = 0;
  if (planTypeString === 'DAILY_WEEKLY_RENTAL') {
        const pickupDateTime = parseDateTime(pickup.date, pickup.time);
        const dropDateTime = parseDateTime(drop.date, drop.time);

        const diffTime = Math.abs(
          dropDateTime.getTime() - pickupDateTime.getTime(),
        );
        durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Exact fractional days

        
  } else if (planTypeString === 'MONTHLY_RENTAL') {
    durationDays = Math.ceil((duration_months || 1) * 30);
  }
  return durationDays;

}



function dateTimeCalculator(
  home_page: boolean,
  plan_type: number,
  plan: string,
  duration_months: number,
  pickup: DateTime,
  drop: DateTime,
  minimum_rental_days: number,
  durationDays: number
): DateTime {
  try {
    console.log("dateTIme",home_page,plan_type,plan,duration_months,pickup,drop,minimum_rental_days,durationDays);
    // Helper: Parse "DD/MM/YYYY" and "HH:mm" to Date object
    const parseDate = (dateStr: string, timeStr: string): Date => {
      const [day, month, year] = dateStr.split('/').map(Number);
      const [hours, minutes] = timeStr.split(':').map(Number);
      return new Date(year, month - 1, day, hours, minutes , 0);
    };

    // Helper: Format Date to { date: "DD/MM/YYYY", time: "HH:mm" }
    const formatDate = (dateObj: Date): DateTime => {
      const pad = (n: number) => (n < 10 ? '0' + n : n.toString());
      const day = pad(dateObj.getDate());
      const month = pad(dateObj.getMonth() + 1);
      const year = dateObj.getFullYear();
      const hours = pad(dateObj.getHours());
      const minutes = pad(dateObj.getMinutes());

      return {
        date: `${day}/${month}/${year}`,
        time: `${hours}:${minutes}`,
      };
    };

    // Parse pickup and drop times
    const pickupDateTime = parseDate(pickup.date, pickup.time);
    let dropDateTime = parseDate(drop.date, drop.time);

    if (home_page) {
      if (plan_type === 1) {
        if (plan === 'daily') {
          dropDateTime = new Date(pickupDateTime);
          dropDateTime.setDate(dropDateTime.getDate() + minimum_rental_days);
        } else if (plan === 'weekly') {
          dropDateTime = new Date(pickupDateTime);
          dropDateTime.setDate(dropDateTime.getDate() + 7);
        }
      } else {
        dropDateTime = new Date(pickupDateTime);
        dropDateTime.setDate(dropDateTime.getDate() + 30);
      }
    } else {
      if (plan_type === 1) {
        if (plan === 'daily') {
          if (durationDays <= minimum_rental_days) {
            dropDateTime = new Date(pickupDateTime);
            dropDateTime.setDate(dropDateTime.getDate() + minimum_rental_days);
          }else {
             dropDateTime = new Date(pickupDateTime);
            dropDateTime.setDate(dropDateTime.getDate() + durationDays);
          }
          // else: return existing drop
        } else if (plan === 'weekly') {
          console.log("hellow")
          // No change to dropDateTime
          dropDateTime = new Date(pickupDateTime);
          dropDateTime.setDate(dropDateTime.getDate() + durationDays);
        }
      } else {
        dropDateTime = new Date(pickupDateTime);
        if(duration_months == 1){
          dropDateTime.setDate(dropDateTime.getDate() + 30);
        }else if(duration_months == 3){
          dropDateTime.setDate(dropDateTime.getDate() + 90);
        }else if(duration_months == 6){
          dropDateTime.setDate(dropDateTime.getDate() + 180);
        }else if(duration_months == 9){
          dropDateTime.setDate(dropDateTime.getDate() + 270);
        }
      }
    }

    return formatDate(dropDateTime);
  } catch (error) {
    console.error('Error in dateTimeCalculator:', error);
    return drop; // return original drop in case of failure
  }
}




@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Pricing.name) private pricingModel: Model<PricingDocument>,
       @InjectModel(SingleInventoryReqRes.name)
        private singleInventoryReqRes: Model<SingleInventoryReqRes>,
  ) {}

  async getAllInventoryWithPricing(dto: SearchPricingDto): Promise<any> {
    try {
      const { source, pickup, drop, plan_type, duration_months } = dto;

      let durationDays = 0;

      // Helper function to parse "DD/MM/YYYY" and time "HH:mm"
      let planTypeString = '';
      let country_id = source.countryId;

      if (plan_type == 1) {
        planTypeString = 'DAILY_WEEKLY_RENTAL';
      } else {
        planTypeString = 'MONTHLY_RENTAL';
      }

      if (planTypeString === 'DAILY_WEEKLY_RENTAL') {
        const pickupDateTime = parseDateTime(pickup.date, pickup.time);
        const dropDateTime = parseDateTime(drop.date, drop.time);

        const diffTime = Math.abs(
          dropDateTime.getTime() - pickupDateTime.getTime(),
        );
        durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Exact fractional days
      } else if (planTypeString === 'MONTHLY_RENTAL') {
        durationDays = Math.ceil((duration_months || 1) * 30);
      }

      console.log({ durationDays });

      // console.log(durationDays);
      const inventory = await this.pricingModel
        .find({
          country_id,
          isActive: true,
        })
        .populate({
          path: 'vehicle_id',
          select: 'model_name specs images vehicle_rating isActive',
        })
        .lean();

      if (!inventory || inventory.length === 0) {
        return standardResponse(
          true,
          'no inventory exists',
          400,
          { data: [] },
          null,
          '/inventory/getAllInventoriesWithPricing',
        );
      }

      let inventories: any = [];

      for (const item of inventory) {
        const v = item.vehicle_id as any | null;

        console.log(v);

        const dailyPlan = item.tariff_daily || {};
        const weeklyPlan = item.tariff_weekly || {};
        const monthlyPlan = item.tariff_monthly?.find(
          (plan) => plan.duration === 1,
        );

        const imagesObj = v?.images;
        const urlPrefix: string = imagesObj?.url_prefix ?? '';
        const s3Paths: string[] = Array.isArray(imagesObj?.s3_paths)
          ? imagesObj.s3_paths
          : [];

        // Build full image URLs safely
        const allImagesUrl =
          urlPrefix && s3Paths.length
            ? s3Paths.map((p) => `${urlPrefix}${p}`)
            : [];

        v.images = allImagesUrl;

        let inventoryMapping = {
          vehicle_id: item.vehicle_id,
          searchedPlan: planTypeString,
          rentalDays: durationDays,
          finalPrice: 0,
          tariff_daily: {
            base: dailyPlan?.base,
            mileage_limit: dailyPlan?.mileage_limit,
            is_mileage_unlimited: dailyPlan?.is_mileage_unlimited,
            partial_security_deposit: dailyPlan?.partial_security_deposit,
            hikePercentage: dailyPlan?.hikePercentage,
          },
          tariff_weekly: {
            base: weeklyPlan?.base,
            mileage_limit: weeklyPlan?.mileage_limit,
            is_mileage_unlimited: weeklyPlan?.is_mileage_unlimited,
            partial_security_deposit: weeklyPlan?.partial_security_deposit,
            hikePercentage: weeklyPlan?.hikePercentage,
          },
          tariff_monthly: {
            duration: monthlyPlan?.duration,
            base: monthlyPlan?.base,
            mileage_limit: monthlyPlan?.mileage_limit,
            is_mileage_unlimited: monthlyPlan?.is_mileage_unlimited,
            partial_security_deposit: monthlyPlan?.partial_security_deposit,
            hikePercentage: monthlyPlan?.hikePercentage,
          },
          minimumRentalDays: item.minimumRentalDays,
          currency: item.currency,
          discount_percentage: item.discount_percentage,
          overrun_cost_per_km: item.overrun_cost_per_km,
          insurance_charge: item.insurance_charge,
          total_security_deposit: item.total_security_deposit,
        };

        if (durationDays < 7) {
          const dailyRate = (dailyPlan.base || 0) * durationDays;
          inventoryMapping.searchedPlan = 'Daily';
          inventoryMapping.finalPrice = dailyRate;
          v.specs.mileage_limit = dailyPlan.mileage_limit;
        } else if (durationDays >= 7 && durationDays < 30) {
          const weeklyRatePerDay = (weeklyPlan.base || 0) / 7;
          const weeklyRate = weeklyRatePerDay * durationDays;
          inventoryMapping.searchedPlan = 'Weekly';
          inventoryMapping.finalPrice = weeklyRate;
          v.specs.mileage_limit = weeklyPlan.mileage_limit;
        } else if (durationDays >= 30 || monthlyPlan) {
          let plan: any = {};
          if (durationDays < 90 || duration_months == 1) {
            plan = item.tariff_monthly?.find((plan) => plan.duration === 1);
            let monthlyRatePerDay = plan?.base / 30;
            let monthlyRate = monthlyRatePerDay * durationDays;
            inventoryMapping.searchedPlan = 'Monthly';
            ((inventoryMapping.finalPrice = monthlyRate),
              (inventoryMapping.tariff_monthly.duration = plan?.duration || 0),
              (inventoryMapping.tariff_monthly.base = plan.base),
              (inventoryMapping.tariff_monthly.mileage_limit =
                plan?.mileage_limit || 0),
              (inventoryMapping.tariff_monthly.is_mileage_unlimited =
                plan?.is_mileage_unlimited || false),
              (inventoryMapping.tariff_monthly.partial_security_deposit =
                plan?.partial_security_deposit || 0),
              (inventoryMapping.tariff_monthly.hikePercentage =
                plan?.hikePercentage || 0));
            v.specs.mileage_limit = plan.mileage_limit;
          } else if (durationDays < 180 || duration_months == 3) {
            plan = item.tariff_monthly?.find((plan) => plan.duration === 3);
            let monthlyRatePerDay = plan?.base / 30;
            let monthlyRate = monthlyRatePerDay * durationDays;
            inventoryMapping.searchedPlan = 'Monthly';
            ((inventoryMapping.finalPrice = monthlyRate),
              (inventoryMapping.tariff_monthly.duration = plan?.duration || 0),
              (inventoryMapping.tariff_monthly.base = plan.base),
              (inventoryMapping.tariff_monthly.mileage_limit =
                plan?.mileage_limit || 0),
              (inventoryMapping.tariff_monthly.is_mileage_unlimited =
                plan?.is_mileage_unlimited || false),
              (inventoryMapping.tariff_monthly.partial_security_deposit =
                plan?.partial_security_deposit || 0),
              (inventoryMapping.tariff_monthly.hikePercentage =
                plan?.hikePercentage || 0));
            v.specs.mileage_limit = plan.mileage_limit;
          } else if (durationDays < 270 || duration_months == 6) {
            plan = item.tariff_monthly?.find((plan) => plan.duration === 6);
            let monthlyRatePerDay = plan?.base / 30;
            let monthlyRate = monthlyRatePerDay * durationDays;
            inventoryMapping.searchedPlan = 'Monthly';
            ((inventoryMapping.finalPrice = monthlyRate),
              (inventoryMapping.tariff_monthly.duration = plan?.duration || 0),
              (inventoryMapping.tariff_monthly.base = plan.base),
              (inventoryMapping.tariff_monthly.mileage_limit =
                plan?.mileage_limit || 0),
              (inventoryMapping.tariff_monthly.is_mileage_unlimited =
                plan?.is_mileage_unlimited || false),
              (inventoryMapping.tariff_monthly.partial_security_deposit =
                plan?.partial_security_deposit || 0),
              (inventoryMapping.tariff_monthly.hikePercentage =
                plan?.hikePercentage || 0));
            v.specs.mileage_limit = plan.mileage_limit;
          } else if (durationDays >= 270 || duration_months == 9) {
            plan = item.tariff_monthly?.find((plan) => plan.duration === 9);
            let monthlyRatePerDay = plan?.base / 30;
            let monthlyRate = monthlyRatePerDay * durationDays;
            inventoryMapping.searchedPlan = 'Monthly';
            ((inventoryMapping.finalPrice = monthlyRate),
              (inventoryMapping.tariff_monthly.duration = plan?.duration || 0),
              (inventoryMapping.tariff_monthly.base = plan.base),
              (inventoryMapping.tariff_monthly.mileage_limit =
                plan?.mileage_limit || 0),
              (inventoryMapping.tariff_monthly.is_mileage_unlimited =
                plan?.is_mileage_unlimited || false),
              (inventoryMapping.tariff_monthly.partial_security_deposit =
                plan?.partial_security_deposit || 0),
              (inventoryMapping.tariff_monthly.hikePercentage =
                plan?.hikePercentage || 0));
            v.specs.mileage_limit = plan.mileage_limit;
          }
        }

        inventories.push(inventoryMapping);
      }

      let filteredInventories = inventories;

      if (dto.vehicle_class && dto.vehicle_class.toLowerCase() !== 'all') {
        filteredInventories = inventories.filter(
          (item) =>
            item.vehicle_details?.specs?.Class?.toLowerCase() ===
            dto.vehicle_class.toLowerCase(),
        );
      }

      return standardResponse(
        true,
        'all inventories data fetched successfully',
        200,
        filteredInventories,
        null,
        '/inventory/getAllInventoriesWithPricing',
      );
    } catch (error) {
      return standardResponse(
        false,
        'Internal server error',
        500,
        null,
        error,
        '/inventory/getAllInventoriesWithPricing',
      );
    }
  }

  // Assuming NestJS + Mongoose + TypeScript

  async getAllInventoryByCountry(country_id: string): Promise<any> {
    try {
      const inventory = await this.pricingModel
        .find(
          { country_id, isActive: true },
          // project only what you need from pricing docs
          {
            tariff_daily: 1,
            tariff_weekly: 1,
            tariff_monthly: 1,
            minimumRentalDays: 1,
            currency: 1,
            discount_percentage: 1,
            vehicle_id: 1,
          },
        )
        .populate({
          path: 'vehicle_id',
          select: 'model_name specs images vehicle_rating isActive', // only required fields
        })
        .lean(); // return plain objects so optional chaining works predictably

      // Prefer 200 with empty array for "no data"
      if (!inventory || inventory.length === 0) {
        return standardResponse(
          true,
          'No inventory exists',
          200,
          [],
          null,
          '/inventory/getAllInventoryByCountry',
        );
      }

      const inventoryData = inventory.map((doc) => {
        const v = doc.vehicle_id as any | null; // populated vehicle or null

        // Guard against missing vehicle document (bad ref / not found)
        const model_name = v?.model_name ?? null;
        const specs = v?.specs ?? {};
        const imagesObj = v?.images ?? {};
        const urlPrefix: string = imagesObj?.url_prefix ?? '';
        const s3Paths: string[] = Array.isArray(imagesObj?.s3_paths)
          ? imagesObj.s3_paths
          : [];

        // Build full image URLs safely
        const allImagesUrl =
          urlPrefix && s3Paths.length
            ? s3Paths.map((p) => `${urlPrefix}${p}`)
            : [];

        let plan = doc.tariff_monthly?.find((plan) => plan.duration === 1);
        console.log(plan);
        return {
          vehicle_id: {
            _id:v._id,
            model_name,
            specs: {
              Class: specs?.Class ?? null,
              EngineCapacity: specs?.EngineCapacity ?? null,
              MaxSpeed: specs?.MaxSpeed ?? null,
              Doors: specs?.Doors ?? null,
              Year: specs?.Year ?? null,
              PowerHP: specs?.PowerHP ?? null,
              Transmission: specs?.Transmission ?? null,
              IsSimilarCarsTitle: specs?.IsSimilarCarsTitle ?? false,
              IsVerified: specs?.IsVerified ?? false,
              IsSimilarCars: specs?.IsSimilarCars ?? false,
              Model: specs?.Model ?? null,
              Seats: specs?.Seats ?? null,
              Order_number: specs?.Order_number ?? null,
              DriveType: specs?.DriveType ?? null,
              ExteriorColor: specs?.ExteriorColor ?? null,
              Manufactory: specs?.Manufactory ?? null,
              BodyType: specs?.BodyType ?? null,
              LuggageCapacity: specs?.LuggageCapacity ?? null,
              mileage_limit: doc.tariff_daily?.mileage_limit ?? 0,
              _id: v?._id ?? null,
            },
            vehicle_rating: v?.vehicle_rating ?? null,
            isActive: v?.isActive ?? false,
            images: allImagesUrl,
          },

          tariff_daily: {
            base: doc.tariff_daily?.base ?? 0,
            mileage_limit: doc.tariff_daily?.mileage_limit ?? 0,
            is_mileage_unlimited:
              doc.tariff_daily?.is_mileage_unlimited ?? false,
            partial_security_deposit:
              doc.tariff_daily?.partial_security_deposit ?? 0,
            hikePercentage: doc.tariff_daily?.hikePercentage ?? 0,
          },

          tariff_weekly: {
            base: doc.tariff_weekly?.base ?? 0,
            mileage_limit: doc.tariff_weekly?.mileage_limit ?? 0,
            is_mileage_unlimited:
              doc.tariff_weekly?.is_mileage_unlimited ?? false,
            partial_security_deposit:
              doc.tariff_weekly?.partial_security_deposit ?? 0,
            hikePercentage: doc.tariff_weekly?.hikePercentage ?? 0,
          },

          tariff_monthly: {
            duration: plan?.duration ?? 0,
            base: plan?.base ?? 0,
            mileage_limit: plan?.mileage_limit ?? 0,
            is_mileage_unlimited: plan?.is_mileage_unlimited ?? false,
            partial_security_deposit: plan?.partial_security_deposit ?? 0,
            hikePercentage: plan?.hikePercentage ?? 0,
          },

          minimumRentalDays: doc.minimumRentalDays ?? 0,
          currency: doc.currency ?? 'INR',
          discount_percentage: doc.discount_percentage ?? 0,
        };
      });

      return standardResponse(
        true,
        'All vehicle data fetched successfully',
        200,
        inventoryData,
        null,
        '/inventory/getAllInventoryByCountry',
      );
    } catch (error) {
      return standardResponse(
        false,
        'Internal server error',
        500,
        null,
        error,
        '/inventory/getAllInventoryByCountry',
      );
    }
  }

  async getSingleInventoryWithPricing(
    dto: SearchSinglePricingDto,
  ): Promise<any> {
    try {
      // const { vehicle_id, pickup_date, drop_date, plan_type, duration_months } = dto;

      const {
        vehicle_id,
    source,
    pickup,
    drop,
    plan_type,
    duration_months = plan_type === 2 ? 1 : 0,
    is_home_page = false,
      } = dto;

      console.log(dto);
      
      // console.log(durationDays);
      const inventory = await this.pricingModel
        .find({
          vehicle_id: vehicle_id,
          isActive: true,
        })
        .populate('vehicle_id').lean();

      if (!inventory || inventory.length === 0) {
        return standardResponse(
          true,
          'no inventory exists',
          400,
          { data: [] },
          null,
          '/inventory/getAllInventoriesWithPricing',
        );
      }

      let planTypeString = '';

      if (plan_type == 1) {
        planTypeString = 'DAILY_WEEKLY_RENTAL';
      } else {
        planTypeString = 'MONTHLY_RENTAL';
      }


      // Helper function to parse "DD/MM/YYYY" and time "HH:mm"
      let dailyDurationDays:any = 0;
      let weeklyDurationDays:any = 0;
      let monthlyDurationDays:any = 0;
      let daily_drop_date:any = {};
      let weekly_drop_date:any = {};
      let monthly_drop_date:any = {};
      let duration_days:any = 0;
      let delivery_charges = 0;
      let collection_charges = 0;
      let extra_charges = 0;

      if(is_home_page){
      daily_drop_date = dateTimeCalculator(is_home_page,1,"daily",duration_months,pickup,drop,inventory[0].minimumRentalDays,0);
      dailyDurationDays = calculateDurationDays("DAILY_WEEKLY_RENTAL",pickup,daily_drop_date,0)

      weekly_drop_date = dateTimeCalculator(is_home_page,1,"weekly",duration_months,pickup,drop,inventory[0].minimumRentalDays,0)
      weeklyDurationDays = calculateDurationDays("DAILY_WEEKLY_RENTAL",pickup,weekly_drop_date,0)

      monthly_drop_date = dateTimeCalculator(is_home_page,2,"monthly",duration_months,pickup,drop,inventory[0].minimumRentalDays,0)
      monthlyDurationDays = calculateDurationDays("DAILY_WEEKLY_RENTAL",pickup,monthly_drop_date,0)

      }else{
        duration_days = calculateDurationDays(planTypeString,pickup,drop,duration_months);
      }


      // console.log(dailyDurationDays,weeklyDurationDays,monthlyDurationDays);
      // console.log("671",daily_drop_date,weekly_drop_date,monthly_drop_date);
      console.log(duration_days,"677");

      

      // console.log(inventory, '430');
      let dailyPlan: any = inventory[0].tariff_daily || {};
      let weeklyPlan: any = inventory[0].tariff_weekly || {};
      // let monthlyPlan:any = inventory[0].tariff_monthly?.find((plan) => plan.duration === 1);

      const v = inventory[0].vehicle_id as any | null; // populated vehicle or null

      const model_name = v?.model_name ?? null;
      const specs = v?.specs ?? {};

      const imagesObj = v?.images ?? {};
      const urlPrefix: string = imagesObj?.url_prefix ?? '';
      const s3Paths: string[] = Array.isArray(imagesObj?.s3_paths)
        ? imagesObj.s3_paths
        : [];

      // Build full image URLs safely
      const allImagesUrl =
        urlPrefix && s3Paths.length
          ? s3Paths.map((p) => `${urlPrefix}${p}`)
          : [];

      let inventoryMapping: any = {
        vehicle_id: {
          _id:v._id,
          model_name,
          specs: [
                { label: "Class", value: specs?.Class ?? null },
                { label: "EngineCapacity", value: specs?.EngineCapacity ?? null },
                { label: "MaxSpeed", value: specs?.MaxSpeed ?? null },
                { label: "Doors", value: specs?.Doors ?? null },
                { label: "Year", value: specs?.Year ?? null },
                { label: "PowerHP", value: specs?.PowerHP ?? null },
                { label: "Transmission", value: specs?.Transmission ?? null },
                { label: "IsSimilarCarsTitle", value: specs?.IsSimilarCarsTitle ?? false },
                { label: "IsVerified", value: specs?.IsVerified ?? false },
                { label: "IsSimilarCars", value: specs?.IsSimilarCars ?? false },
                { label: "Model", value: specs?.Model ?? null },
                { label: "Seats", value: specs?.Seats ?? null },
                { label: "Order_number", value: specs?.Order_number ?? null },
                { label: "DriveType", value: specs?.DriveType ?? null },
                { label: "ExteriorColor", value: specs?.ExteriorColor ?? null },
                { label: "Manufactory", value: specs?.Manufactory ?? null },
                { label: "BodyType", value: specs?.BodyType ?? null },
                { label: "LuggageCapacity", value: specs?.LuggageCapacity ?? null },
                { label: "_id", value: v?._id ?? null },
              ],
          vehicle_rating: v?.vehicle_rating ?? null,
          isActive: v?.isActive ?? false,
          images: allImagesUrl,
        },
        // rentalDays: durationDays,
        tarrifs: [],
        minimumRentalDays: inventory[0].minimumRentalDays,
        currency: inventory[0].currency,
        discount_percentage: inventory[0].discount_percentage,
        overrun_cost_per_km: inventory[0].overrun_cost_per_km,
        insurance_charge: inventory[0].insurance_charge,
        total_security_deposit: inventory[0].total_security_deposit,
      };

      // daily
      if(is_home_page == false){
        if((duration_days<7)){
          console.log(duration_days,"742")
          dailyDurationDays = duration_days;
          daily_drop_date = dateTimeCalculator(is_home_page,plan_type,"daily",duration_months,pickup,drop,inventory[0].minimumRentalDays,dailyDurationDays);
          console.log(daily_drop_date,"745")
          weeklyDurationDays = 7;
          weekly_drop_date = dateTimeCalculator(is_home_page,1,"weekly",duration_months,pickup,drop,inventory[0].minimumRentalDays,weeklyDurationDays);
          monthlyDurationDays = 30;
          monthly_drop_date = dateTimeCalculator(is_home_page,2,"monthly",1,pickup,drop,inventory[0].minimumRentalDays,monthlyDurationDays);

        }else if(duration_days>=7 && duration_days<30){
          dailyDurationDays = 2;
          daily_drop_date = dateTimeCalculator(is_home_page,plan_type,"daily",duration_months,pickup,drop,inventory[0].minimumRentalDays,dailyDurationDays);
          weeklyDurationDays = duration_days;
          weekly_drop_date = dateTimeCalculator(is_home_page,plan_type,"weekly",duration_months,pickup,drop,inventory[0].minimumRentalDays,weeklyDurationDays);
          monthlyDurationDays = 30;
          monthly_drop_date = dateTimeCalculator(is_home_page,2,"monthly",1,pickup,drop,inventory[0].minimumRentalDays,monthlyDurationDays);
        }else if(duration_days>=30 || plan_type == 2){
          dailyDurationDays = 2;
          daily_drop_date = dateTimeCalculator(is_home_page,1,"daily",duration_months,pickup,drop,inventory[0].minimumRentalDays,dailyDurationDays);
          weeklyDurationDays = 7;
          weekly_drop_date = dateTimeCalculator(is_home_page,1,"weekly",duration_months,pickup,drop,inventory[0].minimumRentalDays,weeklyDurationDays);
          monthlyDurationDays = duration_days;
          monthly_drop_date = dateTimeCalculator(is_home_page,plan_type,"monthly",duration_months,pickup,drop,inventory[0].minimumRentalDays,monthlyDurationDays);
        }
      }
      console.log(duration_days,daily_drop_date,weekly_drop_date,monthly_drop_date,"765");


      const dailyRate = (dailyPlan.base || 0) * dailyDurationDays;


      // let base_fare = dailyPlan.base;
      let daily_fare_details = fareDetailsCalculation(
        dailyPlan.base,
        dailyRate,
        extra_charges,
        delivery_charges,
        collection_charges,
      );
      // console.log(dailyPlan,"749");
      dailyPlan.pickup = pickup;
      dailyPlan.drop = daily_drop_date;
      dailyPlan.tariff_type = 'Daily';
      dailyPlan.fare_Details = daily_fare_details;
      inventoryMapping.tarrifs.push(dailyPlan);

      // console.log(dailyPlan,"756");
      // }

      // weekly



      const weeklyBase = weeklyPlan.base || 0;
      let weeklyBaseRate = weeklyBase / 7;
      let weeklyFinalRate = weeklyBaseRate * weeklyDurationDays;

      if(plan_type == 1 && duration_days>29){
        weeklyFinalRate = weeklyBaseRate*duration_days;
        weekly_drop_date = dateTimeCalculator(is_home_page,plan_type,"weekly",duration_months,pickup,drop,inventory[0].minimumRentalDays,duration_days);
      }

      

      let weekly_fare_details = fareDetailsCalculation(
        weeklyPlan.base/7,
        weeklyFinalRate,
        extra_charges,
        delivery_charges,
        collection_charges,
      );
      weeklyPlan.pickup = pickup;
      weeklyPlan.drop = weekly_drop_date
      weeklyPlan.tariff_type = 'Weekly';
      weeklyPlan.fare_Details = weekly_fare_details;
      inventoryMapping.tarrifs.push(weeklyPlan);

      //monthly

      let monthlyRate = 0;
      let monthlyBaseRate = 0;
      let calculatedMonthlyRate = {};
      let selectedMonthlyPlan: any = {};

      if (!is_home_page) {
        if(plan_type == 1){
          selectedMonthlyPlan = inventory[0].tariff_monthly?.find(
            (plan) => plan.duration === 1,
          );

          let oneMonthDailyPrice = selectedMonthlyPlan?.base/30;
          calculatedMonthlyRate = fareDetailsCalculation(
            selectedMonthlyPlan?.base,
            selectedMonthlyPlan?.base,
            extra_charges,
            delivery_charges,
            collection_charges,
          );

        }else{

        
        if ((duration_days >=30 && duration_days<90) || duration_months == 1) {
          selectedMonthlyPlan = inventory[0].tariff_monthly?.find(
            (plan) => plan.duration === 1,
          );

          let oneMonthDailyPrice = selectedMonthlyPlan?.base/30;
          calculatedMonthlyRate = fareDetailsCalculation(
            selectedMonthlyPlan?.base,
            oneMonthDailyPrice*duration_days,
            extra_charges,
            delivery_charges,
            collection_charges,
          );
        } else if ((duration_days >=90 && duration_days<180) || duration_months == 3) {
          selectedMonthlyPlan = inventory[0].tariff_monthly?.find(
            (plan) => plan.duration === 3,
          );
           let threeMonthDailyPrice = selectedMonthlyPlan?.base/90;
          calculatedMonthlyRate = fareDetailsCalculation(
            selectedMonthlyPlan?.base,
            threeMonthDailyPrice*duration_days,
            extra_charges,
            delivery_charges,
            collection_charges,
          );
        } else if ((duration_days >=180 && duration_days<270) || duration_months == 6) {
          selectedMonthlyPlan = inventory[0].tariff_monthly?.find(
            (plan) => plan.duration === 6,
          );
          let sixMonthDailyPrice = selectedMonthlyPlan?.base/180;
          calculatedMonthlyRate = fareDetailsCalculation(
            selectedMonthlyPlan?.base,
            sixMonthDailyPrice*duration_days,
            extra_charges,
            delivery_charges,
            collection_charges,
          );
        } else if ((duration_days >=270 && duration_days<360) || duration_months == 9) {
          selectedMonthlyPlan = inventory[0].tariff_monthly?.find(
            (plan) => plan.duration === 9,
          );
          let nineMonthDailyPrice = selectedMonthlyPlan?.base/270;
          calculatedMonthlyRate = fareDetailsCalculation(
            selectedMonthlyPlan?.base,
            nineMonthDailyPrice*duration_days,
            extra_charges,
            delivery_charges,
            collection_charges,
          );
        }
      }
      } else {
        selectedMonthlyPlan = inventory[0].tariff_monthly?.find(
          (plan) => plan.duration === 1,
        );
        calculatedMonthlyRate = fareDetailsCalculation(
          selectedMonthlyPlan?.base/30,
          selectedMonthlyPlan?.base,
          extra_charges,
          delivery_charges,
          collection_charges,
        );
      }

      selectedMonthlyPlan.pickup = pickup;
      selectedMonthlyPlan.drop = monthly_drop_date;
      selectedMonthlyPlan.tariff_type = 'Monthly';
      selectedMonthlyPlan.fare_Details = calculatedMonthlyRate;
      inventoryMapping.tarrif_selected = is_home_page?"Daily":((duration_days<7 && plan_type == 1)?"Daily":((duration_days>=7 && duration_days<30)||plan_type == 1)?"Weekly":"Monthly"),
      inventoryMapping.tarrifs.push(selectedMonthlyPlan);


      const reqResData = await this.singleInventoryReqRes.create({ reqBody: dto, resBody: inventoryMapping });
      inventoryMapping.reqResId = reqResData._id;

      return standardResponse(
        true,
        'all inventories data fetched successfully',
        200,
        inventoryMapping,
        null,
        '/inventory/getAllInventoriesWithPricing',
      );
    } catch (error) {
      return standardResponse(
        false,
        'Internal server error',
        500,
        null,
        error,
        '/inventory/getAllInventoriesWithPricing',
      );
    }
  }
}
