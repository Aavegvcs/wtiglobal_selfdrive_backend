import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pricing, PricingDocument } from '../pricing/schema/pricing.schema';
import { SearchPricingDto } from './dto/search-all-inventory.dto';
import { standardResponse } from 'src/common/helpers/response.helper';
import { SearchSinglePricingDto } from './dto/search-single-inventory.dto';

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
        
      } else if (durationDays >= 7 && durationDays < 30) {
        const weeklyRatePerDay = (weeklyPlan.base || 0) / 7;
        const weeklyRate = weeklyRatePerDay * durationDays;
        inventoryMapping.searchedPlan = "weekly";
        inventoryMapping.finalPrice = weeklyRate;
    
      } else if ((durationDays >= 30) || monthlyPlan) {
        let plan: any = {};
        if(durationDays<90 || duration_months == 1){
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

        }else if(durationDays<180 || duration_months == 3){
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
          

        }else if(durationDays<270 || duration_months == 6){
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

        }else if(durationDays>=270 || duration_months == 9){
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


  async getSingleInventoryWithPricing(dto: SearchSinglePricingDto): Promise<any> {
  try {
    const { vehicle_id, pickup_date, drop_date, plan_type, duration_months } = dto;
    
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
      vehicle_id,
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


      const dailyPlan = inventory[0].tariff_daily || {};
      const weeklyPlan = inventory[0].tariff_weekly || {};
      const monthlyPlan = inventory[0].tariff_monthly?.find((plan) => plan.duration === 1);

      let inventoryMapping : any = {
        vehicle_details: inventory[0].vehicle_id,
        searchedPlan:plan_type,
        rentalDays:durationDays,
        finalPrice:0,
        tariff_daily: {
          pickup_date:pickup_date,
          drop_date:drop_date,
          base: dailyPlan?.base,
          mileage_limit: dailyPlan?.mileage_limit,
          is_mileage_unlimited: dailyPlan?.is_mileage_unlimited,
          partial_security_deposit: dailyPlan?.partial_security_deposit,
          hikePercentage: dailyPlan?.hikePercentage,
        },
        tariff_weekly: {
          pickup_date:pickup_date,
          drop_date:drop_date,
          base: weeklyPlan?.base,
          mileage_limit: weeklyPlan?.mileage_limit,
          is_mileage_unlimited: weeklyPlan?.is_mileage_unlimited,
          partial_security_deposit: weeklyPlan?.partial_security_deposit,
          hikePercentage: weeklyPlan?.hikePercentage,
        },
        tariff_monthly: {
          pickup_date:pickup_date,
          drop_date:drop_date,
          duration: monthlyPlan?.duration,
          base: monthlyPlan?.base,
          mileage_limit: monthlyPlan?.mileage_limit,
          is_mileage_unlimited: monthlyPlan?.is_mileage_unlimited,
          partial_security_deposit: monthlyPlan?.partial_security_deposit,
          hikePercentage: monthlyPlan?.hikePercentage,
        },
        minimumRentalDays: inventory[0].minimumRentalDays,
        currency: inventory[0].currency,
        discount_percentage: inventory[0].discount_percentage,
        overrun_cost_per_km: inventory[0].overrun_cost_per_km,
        insurance_charge: inventory[0].insurance_charge,
        total_security_deposit: inventory[0].total_security_deposit,
      };

      

      if (durationDays < 7) {
        const dailyRate = (dailyPlan.base || 0) * durationDays;
        inventoryMapping.searchedPlan = "daily";
        inventoryMapping.finalPrice = dailyRate;
        
        const weekDropDate = new Date(pickup_date);
        weekDropDate.setUTCDate(weekDropDate.getUTCDate() + 7);

        inventoryMapping.tariff_weekly.drop_date = weekDropDate.toISOString();

        const monthDropDate = new Date(pickup_date);
        monthDropDate.setUTCDate(monthDropDate.getUTCDate() + 30);

        inventoryMapping.tariff_monthly.drop_date = monthDropDate.toISOString();
        
      } else if (durationDays >= 7 && durationDays < 30) {
        const weeklyRatePerDay = (weeklyPlan.base || 0) / 7;
        const weeklyRate = weeklyRatePerDay * durationDays;
        inventoryMapping.searchedPlan = "weekly";
        inventoryMapping.finalPrice = weeklyRate;


        const monthDropDate = new Date(pickup_date);
        monthDropDate.setUTCDate(monthDropDate.getUTCDate() + 30);

        inventoryMapping.tariff_monthly.drop_date = monthDropDate.toISOString();

      } else if ((durationDays >= 30) || monthlyPlan) {
        let plan: any = {};
        if(durationDays<90 || duration_months == 1){
          plan = inventory[0].tariff_monthly?.find((plan) => plan.duration === 1);
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

        }else if(durationDays<180 || duration_months == 3){
          plan = inventory[0].tariff_monthly?.find((plan) => plan.duration === 3)
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
          

        }else if(durationDays<270 || duration_months == 6){
          plan = inventory[0].tariff_monthly?.find((plan) => plan.duration === 6)
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

        }else if(durationDays>=270 || duration_months == 9){
          plan = inventory[0].tariff_monthly?.find((plan) => plan.duration === 9)
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

        const weekDropDate = new Date(pickup_date);
        weekDropDate.setUTCDate(weekDropDate.getUTCDate() + 7);

        inventoryMapping.tariff_weekly.drop_date = weekDropDate.toISOString();

        const monthDropDate = new Date(pickup_date);
        monthDropDate.setUTCDate(monthDropDate.getUTCDate() + durationDays);

        inventoryMapping.tariff_monthly.drop_date = monthDropDate.toISOString();
        
      }

    

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
