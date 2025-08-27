import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import * as moment from 'moment';
import { WrapperReservationDto } from './dto/wrapper-reservation.dto';
import { ProvisionalReservation } from './schemas/provisional-reservation.schema';
import { ProvisionalReceipt } from './schemas/provisional-receipt.schema';
import { standardResponse } from 'src/common/helpers/response.helper';
import { User } from '../users/schemas/user.schema';
import { Extras } from '../extras/schemas/extras.schema';
import { FinalReservation } from './schemas/final-reservation.schema';
import { FinalReceipt } from './schemas/final-receipt.schema';
import { FinalReservationDto } from './dto/create-final-reservation.dto';
import { PaymentGatewayService } from '../payment-gateway/payment-gateway.service';
import { CancelReservationDto } from './dto/cancel-reservation.dto';
import { ReservationStatusEnum } from 'src/common/enums/reservation-status.enum';
import { getExtrasNamesFromArray } from 'src/common/utils/getExtrasNames.util';
import { calculateDaysDifference, convertUtcToTimezone, makeTimeStampFromDateTime } from 'src/common/utils/time.util';
import { MailService } from '../mails/mail.service';
import { SingleInventoryReqRes } from '../inventory/schemas/single-inventory-req-res';

const logger = new Logger('ReservationService');

@Injectable()
export class ReservationService {
  constructor(
    @InjectModel(ProvisionalReservation.name) private provisionalReservationModel: Model<ProvisionalReservation>,
    @InjectModel(ProvisionalReceipt.name) private provisionalReceiptModel: Model<ProvisionalReceipt>,
    @InjectModel(FinalReservation.name) private finalReservationModel: Model<FinalReservation>,
    @InjectModel(FinalReceipt.name) private finalReceiptModel: Model<FinalReceipt>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Extras.name) private extrasModel: Model<Extras>,
    @InjectModel(SingleInventoryReqRes.name) private singleInventoryReqResModel: Model<SingleInventoryReqRes>,
    private readonly paymentGatewayService: PaymentGatewayService, 
    private readonly mailService: MailService
  ) {}

  

  async makeProvisionalReservation(wrapperReservationDto: WrapperReservationDto): Promise<any> {
    try {
        const { reservation, receipt } = wrapperReservationDto;

        
        console.log('-------------------------------------------------------------------')
        logger.log(`Reservation with req.body: ${JSON.stringify(reservation)}`);
        console.log('-------------------------------------------------------------------')
        logger.log(`Receipt with req.body: ${JSON.stringify(receipt)}`);
        console.log('-------------------------------------------------------------------')


        const order_reference_number = `ORD${Date.now()}`
        const receiptId = `REC${Date.now()}`


      console.log('----------------------- creating order/session -----------------------------')
      
      let orderData: any = null;
      let stripeCustomer: any = null;
      // If payment gateway is Razorpay, create an order

      if(String(reservation.paymentGatewayUsed) == '1') {
        orderData = await this.paymentGatewayService.createOrder(
          {
            amount: receipt.totalFare, 
            currency: receipt.currencyInfo.currency,
            receiptID: receiptId,
            notes: {
              message: `Self Drive Reservation Order ${order_reference_number} for user ${reservation.user_id}`,
            }
          }
        )

        orderData = orderData?.result || null;
      } else if(String(reservation.paymentGatewayUsed) == '0') {

        const user: any = await this.userModel.findById(reservation.user_id);

        console.log("user123", user); 

        stripeCustomer = await this.paymentGatewayService.createStripeCustomer({
          name: user.firstName,
          phone: user.contact,
          email: user.emailID,
          address: {
            line1: "D-21, Corporate Park",
            postal_code: "123456",
            city: "UAE",
            country: "UAE"
          }
        })

        orderData = await this.paymentGatewayService.createCheckoutSession({
          amount: receipt.totalFare,
          currency: receipt.currencyInfo.currency,
          customerId: stripeCustomer.customerID ?? '',
          receiptId: receiptId,
          order_reference_number: order_reference_number,
          userType: reservation.userType,
        })
      }

      console.log('orderData', orderData)
      
      console.log('--------------------- order created --------------------------')

        // Calculate rental days
        const pickupDate = moment(reservation.pickupDate);
        const dropDate = moment(reservation.dropDate);
        const duration_days = dropDate.diff(pickupDate, 'days') || 1;



        // --------------------------------------------------------------------------------
        // Create provisional receipt first to save _id in reservation
        // --------------------------------------------------------------------------------

        const receiptResult = new this.provisionalReceiptModel({
            receiptId: receiptId, // required
            order_reference_number: order_reference_number, 
            baseFare: receipt.baseFare, // required
            totalTax: receipt.totalTax ?? 0, // matches `totalTax` in schema
            addOns: receipt.addOns ?? 0,
            insuranceCharge: receipt.insuranceCharge ?? 0,
            securityDeposit: receipt.securityDeposit ?? 0,
            deliveryCharge: receipt.deliveryCharge ?? 0,
            collectionCharge: receipt.collectionCharge ?? 0,

            currencyInfo: {
                currency: receipt.currencyInfo?.currency,
                currencyRate: receipt.currencyInfo?.currencyRate,
            },

            // finesAndTolls: receipt.finesAndTolls ?? [],

            totalFare: receipt.totalFare, // required
            discount: receipt.discount ?? 0,
            actualFare: receipt.actualFare, // required
            amountPaid: receipt.amountPaid, // required
            actual_amount_collected: receipt.actual_amount_collected ?? 0,
            amount_to_be_collected: receipt.amount_to_be_collected ?? 0,
            part_payment_percentage: receipt.part_payment_percentage ?? 20,
            paymentMethod: receipt.paymentMethod ?? 'CARD',

            // additional custom fields
            duration_days: duration_days, // assuming you have this in schema or you’re modifying schema to include this
        });

        await receiptResult.save();



        // --------------------------------------------------------------------------------
        // Create provisional reservation and update the receipt _id in reservation
        // --------------------------------------------------------------------------------

        const vehicleId: any = reservation.vehicle_id;

        const reservationResult = new this.provisionalReservationModel({
            timezone: reservation.timezone,
            country: reservation.country,
            search_id: new Types.ObjectId(reservation.search_id),
            order_reference_number: order_reference_number,
            receipt_ref_id: receiptResult._id,
            userType: reservation.userType || 'CUSTOMER',
            tarrifType: reservation.tarrifType,
            user_id: new Types.ObjectId(reservation.user_id),
            partnerName: reservation.partnerName || 'WTI',
            pickupLocation: reservation.pickupLocation,
            dropLocation: reservation.dropLocation,
            pickupDate: new Date(reservation.pickupDate),
            dropDate: new Date(reservation.dropDate),
            durationDays: duration_days,
            vehicle_id: new Types.ObjectId(vehicleId),
            // sku_id: reservation.sku_id,
            extrasSelected: reservation.extrasSelected?.map((id) => new Types.ObjectId(id)) || [],
            reservationStatus: ReservationStatusEnum.HOLD,
            paymentType: reservation.paymentType,
            razorpayOrderId: String(reservation.paymentGatewayUsed) == '1' ? orderData.result._id : null,
            stripeCustomerId: stripeCustomer.customerID ?? null,
            paymentId: null,
            finalPaymentId: null,
            paymentGatewayUsed: reservation.paymentGatewayUsed,
            user_documents_id: reservation.user_documents_id ?? null,
            });

      await reservationResult.save();



      return standardResponse(true, 'Provisional reservation and receipt created', 201, {
        reservation_id: reservationResult._id,
        order_reference_number: reservationResult.order_reference_number,
        reservationCreated: true,
        receiptCreated: true,
        orderData: orderData,
        }, null, '/reservation/makeProvisionalReservation'
      );

    } catch (error) {
      return standardResponse(false, 'Internal Server Error', 500, {
        reservationCreated: false,
        receiptCreated: false,
        orderData: null
        }, error.stack, '/reservation/makeProvisionalReservation');
    }
  }

  async createProvisionalReservation(reqBody: any): Promise<any>{


    let findInventoryData: any = await this.singleInventoryReqResModel.findById(reqBody.id)
    findInventoryData = findInventoryData?.resBody; 

    const findInventoryData1 = {
      vehicle_id: {
        _id: '689ae8a569a1906cacd0c21a',
        model_name: 'Nissan Sunny or Similar',
        specs: {
          Class: 'SUV',
          EngineCapacity: '1497 cc',
          MaxSpeed: 185,
          Doors: 5,
          Year: 2023,
          PowerHP: '115 HP',
          Transmission: 'Automatic',
          IsSimilarCarsTitle: true,
          IsVerified: true,
          IsSimilarCars: false,
          Model: 'Creta SX(O)',
          Seats: 5,
          Order_number: 'ORD-78901',
          DriveType: 'FWD',
          ExteriorColor: 'Phantom Black',
          Manufactory: 'Hyundai',
          BodyType: 'Crossover',
          LuggageCapacity: '3 Bags',
          _id: '689ae8a569a1906cacd0c21a',
        },
        vehicle_rating: 4.6,
        isActive: true,
        images: [
          'https://drive.yango.com/images/preview/rs:fill:580:362:1/q:80/g:ce/sm:1/ar:1/dpr:2/plain/s3://aggregator-media-me-central-1/0a090a54-4f02-4029-8191-352d871d3591/100feb3729d60ad8edee1a0ba24517cd',
          'https://drive.yango.com/side.jpg',
          'https://drive.yango.com/interior.jpg',
          'https://drive.yango.com/dashboard.jpg',
        ],
      },
      tarrifs: [
        {
          base: 1500,
          mileage_limit: 250,
          is_mileage_unlimited: false,
          partial_security_deposit: 1000,
          hikePercentage: 5,
          pickup: {
            date: '23/08/2025',
            time: '10:00',
          },
          drop: {
            date: '25/08/2025',
            time: '10:00',
          },
          tariff_type: 'Daily',
          fare_Details: {
            inventory_rate: 1500,
            base_fare: 3000,
            extra_charges: 0,
            delivery_charges: 0,
            collection_charges: 0,
            total: 3000,
            tax: 150,
            grand_total: 3150,
          },
        },
        {
          base: 9800,
          mileage_limit: 1000,
          is_mileage_unlimited: false,
          partial_security_deposit: 3000,
          hikePercentage: 8,
          pickup: {
            date: '23/08/2025',
            time: '10:00',
          },
          drop: {
            date: '30/08/2025',
            time: '10:00',
          },
          tariff_type: 'Weekly',
          fare_Details: {
            inventory_rate: 1400,
            base_fare: 9800,
            extra_charges: 0,
            delivery_charges: 0,
            collection_charges: 0,
            total: 9800,
            tax: 490,
            grand_total: 10290,
          },
        },
        {
          duration: 1,
          base: 34000,
          mileage_limit: 4000,
          is_mileage_unlimited: false,
          partial_security_deposit: 5000,
          hikePercentage: 4,
          pickup: {
            date: '23/08/2025',
            time: '10:00',
          },
          drop: {
            date: '22/09/2025',
            time: '10:00',
          },
          tariff_type: 'Monthly',
          fare_Details: {
            inventory_rate: 1133,
            base_fare: 34000,
            extra_charges: 0,
            delivery_charges: 0,
            collection_charges: 0,
            total: 34000,
            tax: 1700,
            grand_total: 35700,
          },
        },
      ],
      minimumRentalDays: 2,
      currency: 'INR',
      discount_percentage: 10,
      overrun_cost_per_km: 4.5,
      insurance_charge: 500,
      total_security_deposit: 12000,
      tarrif_selected: 'Daily',
    };

    const {vehicle_id, tarrifs} = findInventoryData;
    
    let selectedTarrif: any;

    if(tarrifs && tarrifs.length > 0){
      selectedTarrif = tarrifs.find((item) => {
        return item.tariff_type === findInventoryData.tarrif_selected
      })
    }

    console.log('selectedTarrif', selectedTarrif)


    const pickupDate = makeTimeStampFromDateTime(selectedTarrif.pickup, "Asia/Dubai");
    const dropDate = makeTimeStampFromDateTime(selectedTarrif.drop, "Asia/Dubai");
    const daysDiff = calculateDaysDifference(pickupDate, dropDate)


    const BookingDataPacket: WrapperReservationDto = {
      reservation: {
        timezone: 'Asia/Kolkata',
        country: reqBody.country,
        search_id: '64f5f07a2e9f8c23b84567d1',
        userType: reqBody.userType,
        tarrifType: findInventoryData.tarrif_selected,
        user_id: reqBody.user_id,
        partnerName: 'WTI',
        pickupLocation: 'Delhi Airport, T3 Terminal',
        dropLocation: 'Gurgaon Cyberhub',
        pickupDate: pickupDate,
        dropDate: dropDate,
        durationDays: daysDiff,
        vehicle_id: vehicle_id._id,
        model_name: vehicle_id.model_name,
        extrasSelected: reqBody.extrasSelected,
        paymentType: reqBody.paymentType,
        paymentGatewayUsed: reqBody.country.toUpperCase() == 'IND' ? '1' : '0',
        user_documents_id: reqBody.user_documents_id,
      },
      receipt: {
        baseFare: selectedTarrif.fare_Details.base_fare || 0,
        totalTax: selectedTarrif.fare_Details.tax || 0,
        addOns: selectedTarrif.fare_Details.extra_charges || 0,
        insuranceCharge: findInventoryData.insurance_charge,
        securityDeposit: findInventoryData.total_security_deposit,
        deliveryCharge: selectedTarrif.fare_Details.delivery_charges,
        collectionCharge: selectedTarrif.fare_Details.collection_charges,
        currencyInfo: {
          currency: reqBody.currency,
          currencyRate: reqBody.currencyRate,
        },
        totalFare: selectedTarrif.fare_Details.grand_total,
        discount: 0,
        actualFare: selectedTarrif.fare_Details.grand_total,
        amountPaid: selectedTarrif.fare_Details.grand_total,
        actual_amount_collected: 0,
        amount_to_be_collected: selectedTarrif.fare_Details.grand_total,
        part_payment_percentage: 20,
        paymentMethod: 'CARD',
        isModifiedFlag: false,
      },
    };

    return await this.makeProvisionalReservation(BookingDataPacket);

  }

  async makeFinalReservation(finalReservationDto : FinalReservationDto): Promise<any> {
    let isWhatsappSent :boolean = false;
    let isMailSent :boolean = false;
    let FinalReservationCreated :boolean = false;
    let FinalReceiptCreated :boolean = false;

    try {

      const {
        paymentId,
        order_reference_number,
        stripeCustomerId,
        razorpayOrderId,
      } = finalReservationDto;


        console.log('-------------------------------------------------------------------')
        console.log(`makeFinalReservation function with req.body: ${order_reference_number}`);
        console.log('-------------------------------------------------------------------')



      // --------------------------------------------------------------------------------
      // Get provisional reservation and receipt then create final from it
      // --------------------------------------------------------------------------------

      let provisionalReservation: any = await this.provisionalReservationModel
      .findOne({order_reference_number: order_reference_number})
      .populate([
        { path: 'user_id' },
        { path: 'extrasSelected' },
      ])
      .lean().exec();

      if (!provisionalReservation) throw new Error('Provisional reservation not found');

      
      let provisionalReceipt = await this.provisionalReceiptModel.findById(provisionalReservation.receipt_ref_id)
      .lean().exec();
      
      if (!provisionalReceipt) throw new Error('Provisional receipt not found');
      
      // get names of extras selected
      const extrasSelected = getExtrasNamesFromArray(provisionalReservation.extrasSelected);
      
      const extrasSelectedIds = provisionalReservation.extrasSelected?.map((e) => e._id) ?? [];

      

        // --------------------------------------------------------------------------------
        // Create final receipt first to save _id in reservation
        // --------------------------------------------------------------------------------

        const receiptResult: any = new this.finalReceiptModel({
            ...provisionalReceipt
        });

        await receiptResult.save();
        logger.log('Final receipt created with ID:', receiptResult._id);
        
        FinalReceiptCreated = true

        // --------------------------------------------------------------------------------
        // Create final reservation and update the receipt _id in reservation
        // --------------------------------------------------------------------------------

        const reservationResult = new this.finalReservationModel({
            ...provisionalReservation,
            extrasSelected: extrasSelectedIds,
            receipt_ref_id: receiptResult._id,
            reservationStatus: ReservationStatusEnum.CONFIRMED,
            razorpayOrderId: razorpayOrderId ?? null,
            stripeCustomerId: stripeCustomerId ?? null,
            paymentId: paymentId, 
            });

        await reservationResult.save();
        logger.log('Final reservation created with ID:', reservationResult._id);
        
        FinalReservationCreated = true;

        // creating mail and whatsapp packet   

        const confirmationDataPacket = {
        contact: `${provisionalReservation.user_id.contactCode}${provisionalReservation.user_id.contact}`,
        firstName: provisionalReservation.user_id.firstName,
        emailID: provisionalReservation.user_id.emailID,
        order_reference_number: provisionalReservation.order_reference_number,
        paymentId: paymentId,
        extrasSelected: extrasSelected,
        reservationStatus: reservationResult.reservationStatus,
        // start_time: convertUtcToTimezone(String(reservation.pickupDate), reservation.timezone),
        pickupDate: convertUtcToTimezone(String(provisionalReservation.pickupDate), provisionalReservation.timezone), 
        dropDate: convertUtcToTimezone(String(provisionalReservation.dropDate), provisionalReservation.timezone),
        pickupLocation: provisionalReservation.pickupLocation,
        dropLocation: provisionalReservation.dropLocation,
        tarrifType: provisionalReservation.tarrifType,
        vehicle: provisionalReservation.vehicle_id?.title ?? '',
        // carCategoryName: reservation.vehicle_details?.model ?? '',
        baseFare: (receiptResult.baseFare * receiptResult.currencyInfo.currencyRate).toFixed(2),
        currency: receiptResult.currencyInfo.currency,
        tax: 0,
        amountPaid: (receiptResult.amountPaid * receiptResult.currencyInfo.currencyRate).toFixed(2),
        discount: (receiptResult.discount * receiptResult.currencyInfo.currencyRate).toFixed(2),
        grandTotal: (receiptResult.totalFare * receiptResult.currencyInfo.currencyRate).toFixed(2),
      };

      isMailSent = await this.mailService.sendConfirmationEmail(confirmationDataPacket)

      return standardResponse(true, 'Final reservation and receipt created', 201, {
        reservation_id: reservationResult._id,
        order_reference_number: reservationResult.order_reference_number,
        reservationCreated: FinalReservationCreated,
        receiptCreated: FinalReceiptCreated,
        isMailSent: isMailSent,
        isWhatsappSent: isWhatsappSent,
        }, null, 'makeFinalReservation function'
      );

    } catch (error) {
      return standardResponse(false, 'Internal Server Error', 500, {
        reservationCreated: FinalReservationCreated,
        receiptCreated: FinalReceiptCreated,
        isMailSent: false,
        isWhatsappSent: false,
        }, error.stack, 'makeFinalReservation function');
    }
  }

  async createFinalReservation(
    finalReservationDto : FinalReservationDto
  ): Promise<any> {
    try {
      return this.makeFinalReservation(finalReservationDto)
    } catch (error) {
      return standardResponse(false, 'Internal Server Error', 500, {
        reservationCreated: false,
        receiptCreated: false,
        }, error, '/reservation/createFinalReservation');
    }
  }

  async getFinalReservationAndReceipts(user_id: string) {
    try {
      
      if (!isValidObjectId(user_id)) {
        throw new BadRequestException('Invalid MongoDB ObjectId');
      }
  
      const bookingsData = await this.finalReservationModel
        .find({
          user_id: user_id,
          isModifiedFlag: false,
        })
        .populate([
          { path: 'vehicle_id', select: "-createdAt -updatedAt" },
          { path: 'receipt_ref_id', select: "-createdAt -updatedAt"},
          // { path: 'user_id', select: 'firstName' },
          // { path: 'extrasSelected' },
        ])
        .lean().exec();
  
  
      const sortedBookings = bookingsData.sort(
        (a, b) => new Date(b.pickupDate).getTime() - new Date(a.dropDate).getTime(),
      );
      return standardResponse(true, "Successfully fetched reservations", 200, sortedBookings, null, '/reservation/getFinalReservationAndReceipts');
    } catch (error) {
      return standardResponse(false, 'Internal Server Error', 500, null, error.stack, '/reservation/getFinalReservationAndReceipts');
    }
  }

  async getConfirmedReservation(order_reference_number: string) {
    try {
      
      if (!order_reference_number) throw new BadRequestException('Missing required order_reference_number');
  
      const result = await this.finalReservationModel.findOne({order_reference_number})
        .populate([
          { path: 'receipt_ref_id', select: '-createdAt -updatedAt' },
          { path: 'vehicle_id', select: '-createdAt -updatedAt' },
        ])
        .lean().exec();

      if (!result) throw new NotFoundException('Reservation not found');

      return standardResponse(true, "Successfully fetched confirmed reservation", 200, result, null, '/reservation/getConfirmedReservation');
    } catch (error) {
      return standardResponse(false, 'Internal Server Error', 500, null, error.stack, '/reservation/getConfirmedReservation');
    }

  }

  async getFailedReservation(order_reference_number: string) {
    try {

      if (!order_reference_number) throw new BadRequestException('Missing required order_reference_number');

      const result = await this.provisionalReservationModel.findOne({ order_reference_number })
        .populate([
          { path: 'receipt_ref_id', select: '-createdAt -updatedAt' },
          { path: 'vehicle_id', select: '-createdAt -updatedAt' },
        ])
        .lean().exec();

      if (!result) throw new NotFoundException('Reservation not found');

      return standardResponse(true, "Successfully fetched failed reservation", 200, result, null, '/reservation/getFailedReservation');
    } catch (error) {
      return standardResponse(false, 'Internal Server Error', 500, null, error.stack, '/reservation/getFailedReservation');
    }
  }

  async cancelReservation(data: CancelReservationDto) {
    let mailSent: boolean = false;
    let whatsappSent: boolean = false;
    let reservationCancelled: boolean = false;

    try {
      const reservation: FinalReservation | null = await this.finalReservationModel
        .findByIdAndUpdate(data.id, {
          $set: {
            reservationStatus: ReservationStatusEnum.CANCELLED,
            cancellation_reason: data.cancellation_reason,
            cancelled_by: data.cancelled_by,
            cancel_time: new Date(),
          },
        })
        .populate([
          { path: 'receipt_ref_id' },
          { path: 'extrasSelected' },
          { path: 'user_id' },
        ])
        .lean().exec();

      if (!reservation) {
        throw new NotFoundException(`Reservation with ID ${data.id} not found`);
      }

      const receipt: any = reservation.receipt_ref_id;
      const user: any = reservation.user_id
      const extrasSelected: string = getExtrasNamesFromArray(reservation.extrasSelected);
      const vehicle: any = reservation.vehicle_id;


      const cancellationDataPacket = {
        recipient: `${user.contactCode}${user.contact}`,
        firstName: user.firstName,
        emailID: user.emailID,
        order_reference_number: reservation.order_reference_number,
        payment_id: reservation.paymentId,
        extrasSelected: extrasSelected,
        reservationStatus: reservation.reservationStatus,
        // start_time: convertUtcToTimezone(String(reservation.pickupDate), reservation.timezone),
        pickupDate: convertUtcToTimezone(String(reservation.dropDate), reservation.timezone), 
        dropDrop: convertUtcToTimezone(String(reservation.dropDate), reservation.timezone),
        pickupLocation: reservation.pickupLocation,
        dropLocation: reservation.dropLocation,
        tarrifType: reservation.tarrifType,
        vehicle: vehicle?.title ?? '',
        // carCategoryName: reservation.vehicle_details?.model ?? '',
        baseFare: (receipt.baseFare * receipt.currencyInfo.currencyRate).toFixed(2),
        currency: receipt.currencyInfo.currency,
        tax: 0,
        amountPaid: receipt.amountPaid,
        discount: (receipt.discount * receipt.currencyInfo.currencyRate).toFixed(2),
        grandTotal: (receipt.totalFare * receipt.currencyInfo.currencyRate).toFixed(2),
      };

      mailSent = await this.mailService.sendCancellationMail(cancellationDataPacket);

      return standardResponse(
        true,
        `Successfully cancelled final reservation for reservation ${data.id}`,
        200,
        { reservationCancelled: reservationCancelled, mailSent: mailSent, whatsappSent: whatsappSent },
        null,
        'reservation/cancelReservation',
      );

    } catch (error) {
      return standardResponse(
        false,
        `Internal Server Error: ${data.id}`,
        500,
        { reservationCancelled: reservationCancelled, mailSent: mailSent, whatsappSent: whatsappSent },
        error.stack,
        'reservation/cancelReservation',
      );
    }
  }

}
