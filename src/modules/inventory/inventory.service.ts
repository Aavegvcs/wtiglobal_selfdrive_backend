import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pricing, PricingDocument } from '../pricing/schema/pricing.schema';
import { SearchPricingDto } from './dto/search-all-inventory.dto';
import { standardResponse } from 'src/common/helpers/response.helper';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Pricing.name) private pricingModel: Model<PricingDocument>,
  ) {}

  async getAllInventoryWithPricing(dto: SearchPricingDto): Promise<any> {
  try {
    const { country_id, pickup_date, drop_date, plan_type, duration_months } = dto;

    let durationDays = 0;
    if (plan_type === 'daily' || plan_type === 'weekly') {
      const pickup = new Date(pickup_date);
      const drop = new Date(drop_date);
      const diffTime = Math.abs(drop.getTime() - pickup.getTime());
      durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert ms to days
    } else if (plan_type === 'monthly') {
      durationDays = duration_months * 30;
    }
    // console.log(durationDays);
    const inventory = await this.pricingModel.find({
      country_id,
      isActive: true,
    }).populate('vehicle_id');

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

      const dailyPlan = item.tariff_daily || {};
      const weeklyPlan = item.tariff_weekly || {};
      const monthlyPlan = item.tariff_monthly?.find((plan) => plan.duration === 1);

      let inventoryMapping = {
        vehicle_details: item.vehicle_id,
        searchedPlan:plan_type,
        rentalDays:durationDays,
        finalPrice:0,
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
        inventoryMapping.searchedPlan = "daily";
        inventoryMapping.finalPrice = dailyRate;
        // inventoryMapping.tariff_daily = {
        //   base: dailyRate,
        //   mileage_limit: dailyPlan.mileage_limit || 0,
        //   is_mileage_unlimited: dailyPlan.is_mileage_unlimited || false,
        //   partial_security_deposit: dailyPlan.partial_security_deposit || 0,
        //   hikePercentage: dailyPlan.hikePercentage || 0
        // };
        
      } else if (durationDays >= 7 && durationDays < 30) {
        const weeklyRatePerDay = (weeklyPlan.base || 0) / 7;
        const weeklyRate = weeklyRatePerDay * durationDays;
        inventoryMapping.searchedPlan = "weekly";
        inventoryMapping.finalPrice = weeklyRate;
        // inventoryMapping.tariff_weekly = {
        //   base: weeklyRate,
        //   mileage_limit: weeklyPlan.mileage_limit || 0,
        //   is_mileage_unlimited: weeklyPlan.is_mileage_unlimited || false,
        //   partial_security_deposit: weeklyPlan.partial_security_deposit || 0,
        //   hikePercentage: weeklyPlan.hikePercentage || 0
        // };
      } else if ((durationDays >= 30) || monthlyPlan) {
        let plan: any = {};
        if(durationDays<90 || monthlyPlan?.duration == 1){
          plan = item.tariff_monthly?.find((plan) => plan.duration === 1);
          let monthlyRatePerDay = plan?.base/30;
          let monthlyRate = monthlyRatePerDay * durationDays;
          inventoryMapping.searchedPlan = "monthly";
          inventoryMapping.finalPrice = monthlyRate,
          inventoryMapping.tariff_monthly.duration = plan?.duration || 0,
          inventoryMapping.tariff_monthly.base = plan.base,
          inventoryMapping.tariff_monthly.mileage_limit =  plan?.mileage_limit || 0,
          inventoryMapping.tariff_monthly.is_mileage_unlimited =  plan?.is_mileage_unlimited || false,
          inventoryMapping.tariff_monthly.partial_security_deposit =  plan?.partial_security_deposit || 0,
          inventoryMapping.tariff_monthly.hikePercentage =  plan?.hikePercentage || 0

        }else if(durationDays<180 || monthlyPlan?.duration == 3){
          plan = item.tariff_monthly?.find((plan) => plan.duration === 3)
          let monthlyRatePerDay = plan?.base/30;
          let monthlyRate = monthlyRatePerDay * durationDays;
          inventoryMapping.searchedPlan = "monthly";
          inventoryMapping.finalPrice = monthlyRate,
          inventoryMapping.tariff_monthly.duration = plan?.duration || 0,
          inventoryMapping.tariff_monthly.base = plan.base,
          inventoryMapping.tariff_monthly.mileage_limit =  plan?.mileage_limit || 0,
          inventoryMapping.tariff_monthly.is_mileage_unlimited =  plan?.is_mileage_unlimited || false,
          inventoryMapping.tariff_monthly.partial_security_deposit =  plan?.partial_security_deposit || 0,
          inventoryMapping.tariff_monthly.hikePercentage =  plan?.hikePercentage || 0
          

        }else if(durationDays<270 || monthlyPlan?.duration == 6){
          plan = item.tariff_monthly?.find((plan) => plan.duration === 6)
          let monthlyRatePerDay = plan?.base/30;
          let monthlyRate = monthlyRatePerDay * durationDays;
          inventoryMapping.searchedPlan = "monthly";
          inventoryMapping.finalPrice = monthlyRate,
          inventoryMapping.tariff_monthly.duration = plan?.duration || 0,
          inventoryMapping.tariff_monthly.base = plan.base,
          inventoryMapping.tariff_monthly.mileage_limit =  plan?.mileage_limit || 0,
          inventoryMapping.tariff_monthly.is_mileage_unlimited =  plan?.is_mileage_unlimited || false,
          inventoryMapping.tariff_monthly.partial_security_deposit =  plan?.partial_security_deposit || 0,
          inventoryMapping.tariff_monthly.hikePercentage =  plan?.hikePercentage || 0

        }else{
          plan = item.tariff_monthly?.find((plan) => plan.duration === 9)
          let monthlyRatePerDay = plan?.base/30;
          let monthlyRate = monthlyRatePerDay * durationDays;
          inventoryMapping.searchedPlan = "monthly";
          inventoryMapping.finalPrice = monthlyRate,
          inventoryMapping.tariff_monthly.duration = plan?.duration || 0,
          inventoryMapping.tariff_monthly.base = plan.base,
          inventoryMapping.tariff_monthly.mileage_limit =  plan?.mileage_limit || 0,
          inventoryMapping.tariff_monthly.is_mileage_unlimited =  plan?.is_mileage_unlimited || false,
          inventoryMapping.tariff_monthly.partial_security_deposit =  plan?.partial_security_deposit || 0,
          inventoryMapping.tariff_monthly.hikePercentage =  plan?.hikePercentage || 0

        }
        
      }

      inventories.push(inventoryMapping);
    }

    let filteredInventories = inventories;

    if (dto.vehicle_class && dto.vehicle_class.toLowerCase() !== 'all') {
      filteredInventories = inventories.filter((item) => 
        item.vehicle_details?.specs?.Class?.toLowerCase() === dto.vehicle_class.toLowerCase()
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

async getAllInventoryByCountry(country_id: String): Promise<any> {
  try {
    const inventory = await this.pricingModel.find({
      country_id,
      isActive: true,
    }).populate('vehicle_id');

    if (!inventory || inventory.length === 0) {
      return standardResponse(
        true,
        'no inventory exists',
        400,
        { data: [] },
        null,
        '/inventory/getAllInventoryByCountry',
      );
    }

    return standardResponse(
      true,
      'all vehicle data fetched successfully',
      200,
      inventory,
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


  // async getAllInventoryWithPricing(dto: SearchPricingDto): Promise<any> {
  //   try {
      
  //   const { country_id, pickup_date, drop_date, plan_type, duration_months } = dto;

  //   let durationDays = 0;
  //   if(plan_type == 'daily' || plan_type == 'weekly'){
  //     // durationDays = drop_date-pickup_date;
  //   }else{
  //     // durationDays = duration_months*30;
  //   }
  //   const inventory = await this.pricingModel.find({
  //     country_id,
  //     isActive: true,
  //   });


  //   if(inventory){

    

  //   let inventories = [];

  //   await inventory.map((item) => {

  //     let inventoryMapping = {
  //     "vehicle_details":{},
  //     "tariff_daily": {
  //       "base": 0,
  //       "mileage_limit": 0,
  //       "is_mileage_unlimited": false,
  //       "partial_security_deposit": 0,
  //       "hikePercentage": 0
  //     },
  //     "tariff_weekly": {
  //       "base": 0,
  //       "mileage_limit": 0,
  //       "is_mileage_unlimited": false,
  //       "partial_security_deposit": 0,
  //       "hikePercentage": 0
  //     },
  //     "tariff_monthly": {
  //         "duration": 0,
  //         "base": 0,
  //         "mileage_limit": 0,
  //         "is_mileage_unlimited": false,
  //         "partial_security_deposit": 0,
  //         "hikePercentage": 0
  //     },
  //     "minimumRentalDays": 0,
  //     "currency": "",
  //     "discount_percentage": 0,
  //     "overrun_cost_per_km": 0,
  //     "insurance_charge": 0,
  //     "total_security_deposit": 0,
  //   }


  //     const dailyBase = item.tariff_daily?.base || 0;
  //     const weeklyBase = item.tariff_weekly?.base || 0;
  //     const monthlyPlan = item.tariff_monthly?.find((plan) => plan.duration === duration_months);

  //     const dailyPlan = item.tariff_daily;
  //     const weeklyPlan = item.tariff_weekly;



  //     let finalDailyRate = 0;
  //     let finalWeeklyRate = 0;
  //     let finalMonthlyRate = 0;

  //     if(durationDays < 7 ){
  //       finalDailyRate = dailyBase * durationDays;
  //       inventoryMapping.tariff_daily.base = finalDailyRate;
  //       inventoryMapping.tariff_daily.mileage_limit = dailyPlan.mileage_limit;
  //       inventoryMapping.tariff_daily.is_mileage_unlimited = dailyPlan.is_mileage_unlimited;
  //       inventoryMapping.tariff_daily.partial_security_deposit = dailyPlan.partial_security_deposit;
  //       inventoryMapping.tariff_daily.hikePercentage = dailyPlan.hikePercentage;

  //     }else if(durationDays >=7 && durationDays<30){
  //       let weeklyRatePerDay = weeklyBase/7;
  //       finalWeeklyRate = weeklyRatePerDay * durationDays;

  //       inventoryMapping.tariff_weekly.base = finalWeeklyRate;
  //       inventoryMapping.tariff_weekly.mileage_limit = weeklyPlan.mileage_limit;
  //       inventoryMapping.tariff_weekly.is_mileage_unlimited = weeklyPlan.is_mileage_unlimited;
  //       inventoryMapping.tariff_weekly.partial_security_deposit = weeklyPlan.partial_security_deposit;
  //       inventoryMapping.tariff_weekly.hikePercentage = weeklyPlan.hikePercentage;


  //     }else{
  //       let monthlyRatePerDay = monthlyPlan/30;
  //       finalMonthlyRate = monthlyRatePerDay * durationDays;
  //       inventoryMapping.tariff_monthly.duration = monthlyPlan?.duration;
  //       inventoryMapping.tariff_monthly.base = finalMonthlyRate;
  //       inventoryMapping.tariff_monthly.mileage_limit = monthlyPlan.mileage_limit;
  //       inventoryMapping.tariff_monthly.is_mileage_unlimited = monthlyPlan.is_mileage_unlimited;
  //       inventoryMapping.tariff_monthly.partial_security_deposit = monthlyPlan.partial_security_deposit;
  //       inventoryMapping.tariff_monthly.hikePercentage = monthlyPlan.hikePercentage;
  //     }


  //     inventoryMapping.minimumRentalDays = item.minimumRentalDays;
  //     inventoryMapping.currency = item.currency;
  //     inventoryMapping.discount_percentage = item.discount_percentage;
  //     inventoryMapping.overrun_cost_per_km = item.overrun_cost_per_km;
  //     inventoryMapping.insurance_charge = item.insurance_charge;
  //     inventoryMapping.total_security_deposit = item.total_security_deposit;



  //     inventories.push(inventoryMapping);
  //   });

  //   return standardResponse(
  //       true,
  //       'all inventories data fetched successfully',
  //       200,
  //       inventories,
  //       null,
  //       '/inventory/getAllInventoriesWithPricing',
  //   );



  //   }else{
  //     return standardResponse(
  //       true,
  //       'no inventory exists',
  //       400,
  //       {data:[]},
  //       null,
  //       '/inventory/getAllInventoriesWithPricing',
  //   );
  //   }




  //   } catch (error) {
  //     return standardResponse(
  //       false,
  //       'Internal server error',
  //       500,
  //       null,
  //       error,
  //       '/inventory/getAllInventoriesWithPricing',
  //     );
  //   }
  // }
}
