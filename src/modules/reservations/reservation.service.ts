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
    private readonly paymentGatewayService: PaymentGatewayService, 
  ) {}

  

  async createProvisionalReservation(wrapperReservationDto: WrapperReservationDto): Promise<any> {
    try {
        const { reservation, receipt } = wrapperReservationDto;

        
        console.log('-------------------------------------------------------------------')
        logger.log(`Reservation with req.body: ${JSON.stringify(reservation)}`);
        console.log('-------------------------------------------------------------------')
        logger.log(`Receipt with req.body: ${JSON.stringify(receipt)}`);
        console.log('-------------------------------------------------------------------')


        const order_reference_number = `ORD${Date.now()}`
        const receiptId = `REC${Date.now()}`

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
            baseRate: receipt.baseRate, // required
            totalTax: receipt.totalTax ?? 0, // matches `totalTax` in schema
            addOns: receipt.addOns ?? 0,
            insuranceCharge: receipt.insuranceCharge ?? 0,
            securityDeposit: receipt.securityDeposit ?? 0,
            deliveryCharge: receipt.deliveryCharge ?? 0,
            collectionCharge: receipt.collectionCharge ?? 0,
            baseCurrency: receipt.baseCurrency, // 'INR' | 'USD' | 'AED'

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
            countryName: reservation.countryName,
            search_id: new Types.ObjectId(reservation.search_id),
            order_reference_number: order_reference_number,
            receipt_ref_id: receiptResult._id,
            invoice_id: reservation.invoice_id ?? null,
            userType: reservation.userType || 'CUSTOMER',
            user_id: new Types.ObjectId(reservation.user_id),
            partnerName: reservation.partnerName || 'WTI',
            pickupLocation: reservation.pickupLocation,
            dropLocation: reservation.dropLocation,
            pickupDate: new Date(reservation.pickupDate),
            dropDate: new Date(reservation.dropDate),
            durationDays: duration_days,
            vehicle_id: new Types.ObjectId(vehicleId),
            sku_id: reservation.sku_id,
            extrasSelected: reservation.extrasSelected?.map((id) => new Types.ObjectId(id)) || [],
            reservationStatus: 'HOLD',
            paymentType: reservation.paymentType,
            razorpayOrderId: reservation.razorpayOrderId ?? null,
            stripeCustomerId: reservation.stripeCustomerId ?? null,
            paymentId: reservation.paymentId,
            finalPaymentId: reservation.finalPaymentId ?? null,
            paymentGatewayUsed: reservation.paymentGatewayUsed,
            discount: {
                discountType: reservation.discount?.discountType ?? null,
                discountId: reservation.discount?.discountId ? new Types.ObjectId(reservation.discount.discountId) : null,
            },
            isModifiedFlag: reservation.isModifiedFlag ?? false,
            user_documents_id: reservation.user_documents_id ?? null,
            feedback_collected: reservation.feedback_collected ?? false,
            });

      await reservationResult.save();

      console.log('----------------------- finally creating order/session -----------------------------')
      
      let orderData: any = null;
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
        orderData = await this.paymentGatewayService.createCheckoutSession({
          amount: receipt.totalFare,
          currency: receipt.currencyInfo.currency,
          customerId: reservation.stripeCustomerId ?? '',
          receiptId: receiptId,
          order_reference_number: order_reference_number,
          userType: reservation.userType,
        })
      }

      console.log('orderData', orderData)
      
      console.log('--------------------- order created --------------------------')

      return standardResponse(true, 'Provisional reservation and receipt created', 201, {
        reservation_id: reservationResult._id,
        order_reference_number: reservationResult.order_reference_number,
        reservationCreated: true,
        receiptCreated: true,
        orderData: orderData,
        }, null, '/reservation/createProvisionalReservation'
      );

    } catch (error) {
      return standardResponse(false, 'Internal Server Error', 500, {
        reservationCreated: false,
        receiptCreated: false,
        orderData: null
        }, error, '/reservation/createProvisionalReservation');
    }
  }

  async makeFinalReservation(finalReservationDto : FinalReservationDto): Promise<any> {
    try {

      const {
        paymentId,
        order_reference_number,
        stripeCustomerId,
        razorpayOrderId,
      } = finalReservationDto;

        let isWhatsappConfirmationSent :boolean = false;
        let isMailSent :boolean = false;

        console.log('-------------------------------------------------------------------')
        console.log(`makeFinalReservation function with req.body: ${order_reference_number}`);
        console.log('-------------------------------------------------------------------')



      // --------------------------------------------------------------------------------
      // Get provisional reservation and receipt then create final from it
      // --------------------------------------------------------------------------------

      let provisionalReservation = await this.provisionalReservationModel
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
      
      // const extrasSelectedNames = provisionalReservation.extrasSelected?.map((e) => e.name).join(', ') ?? 'No extras selected';
      // const extrasSelectedIds = provisionalReservation.extrasSelected?.map((e) => e._id) ?? [];

      

        // --------------------------------------------------------------------------------
        // Create final receipt first to save _id in reservation
        // --------------------------------------------------------------------------------

        const receiptResult = new this.finalReceiptModel({
            ...provisionalReceipt
        });

        await receiptResult.save();
        logger.log('Final receipt created with ID:', receiptResult._id);

        // --------------------------------------------------------------------------------
        // Create final reservation and update the receipt _id in reservation
        // --------------------------------------------------------------------------------

        const reservationResult = new this.finalReservationModel({
            ...provisionalReservation,
            receipt_ref_id: receiptResult._id,
            reservationStatus: 'CONFIRMED',
            razorpayOrderId: razorpayOrderId ?? null,
            stripeCustomerId: stripeCustomerId ?? null,
            paymentId: paymentId, 
            });

        await reservationResult.save();
        logger.log('Final reservation created with ID:', reservationResult._id);

        // sendConfirmationEmail()

      return standardResponse(true, 'Final reservation and receipt created', 201, {
        reservation_id: reservationResult._id,
        order_reference_number: reservationResult.order_reference_number,
        reservationCreated: true,
        receiptCreated: true,
        }, null, 'makeFinalReservation function'
      );

    } catch (error) {
      return standardResponse(false, 'Internal Server Error', 500, {
        reservationCreated: false,
        receiptCreated: false,
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
        }, error.stack, '/reservation/createFinalReservation');
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

  // async cancelReservation(data: CancelChauffeurReservationDto) {
  //   if (!data.id || !data.cancellation_reason || data.amount === undefined || data.payment_gateway_used === undefined) {
  //     throw new BadRequestException('Missing required id or amount or cancellation_reason or payment_gateway_used!');
  //   }

  //   let mailSent = false;

  //   try {
  //     const reservation = await this.finalReservationModel
  //       .findByIdAndUpdate(data.id, {
  //         $set: {
  //           BookingStatus: 'CANCELLED',
  //           cancellation_reason: data.cancellation_reason,
  //           canceltime: new Date(),
  //         },
  //       })
  //       .populate([
  //         { path: 'reciept_id' },
  //         { path: 'extrasSelected' },
  //         { path: 'passenger' },
  //       ])
  //       .exec();

  //     if (!reservation) {
  //       throw new NotFoundException(`Reservation with ID ${data.id} not found`);
  //     }

  //     if (data.payment_gateway_used === 1) {
  //       if (!data.paymentId || !data.receiptId) {
  //         throw new BadRequestException('Missing required paymentId or receiptId!');
  //       }

  //       const isSent = await this.sendChauffeurCancellationMail(
  //         reservation,
  //         data.paymentId,
  //         data.amount,
  //         data.receiptId,
  //       );
  //       mailSent = isSent.mailSent;

  //       await sendCancellationPacketToPanel(
  //         data.id,
  //         reservation?.reference_number,
  //         reservation?.order_reference_number,
  //       );

  //       return {
  //         ReservationCancelled: true,
  //         ID: data.id,
  //         message: 'Chauffeur Reservation Cancelled Successfully',
  //         mailSent,
  //       };
  //     } else {
  //       let extrasSelected = reservation.extrasSelected;
  //       if (extrasSelected?.length) {
  //         extrasSelected = extrasSelected.map(extra => extra.name).join(', ');
  //       }

  //       const cancellationDataPacket = {
  //         recipient: `${reservation.passenger.contactCode}${reservation.passenger.contact}`,
  //         firstName: reservation.passenger.firstName,
  //         emailID: reservation.passenger.emailID,
  //         order_reference_number: reservation.order_reference_number,
  //         payment_id: reservation.stripe_payment_id,
  //         extrasSelected: extrasSelected?.length ? extrasSelected : 'No extras selected',
  //         bookingStatus: reservation.BookingStatus,
  //         start_time: reservation.start_time,
  //         pickupAt: reservation.start_time, // convert to timezone in util
  //         dropAt: reservation.trip_type_details.trip_type === 'ONE_WAY' ? reservation.end_time : '',
  //         pickupLocation: reservation.source.address,
  //         dropLocation: reservation?.destination?.address ?? 'NA',
  //         tripType: `${reservation.trip_type_details.basic_trip_type} ${reservation.trip_type_details.trip_type}`,
  //         distance: reservation.distance,
  //         vehicle: reservation.vehicle_details?.title ?? '',
  //         package: reservation.package ?? 'No package selected',
  //         baseFare: (reservation.reciept_id.fare_details.base_fare * reservation.reciept_id.currency.currencyRate).toFixed(2),
  //         currency: reservation.reciept_id.currency.currencyName,
  //         tax: 0,
  //         discount: (reservation.reciept_id.fare_details.seller_discount * reservation.reciept_id.currency.currencyRate).toFixed(2),
  //         grandTotal: (reservation.reciept_id.fare_details.total_fare * reservation.reciept_id.currency.currencyRate).toFixed(2),
  //         carCategoryName: reservation.vehicle_details?.model ?? '',
  //       };

  //       const isSent = await sendTACancellationEmail(cancellationDataPacket);
  //       mailSent = isSent.mailSent;

  //       return {
  //         ReservationCancelled: true,
  //         ID: data.id,
  //         message: 'Chauffeur Reservation Cancelled Successfully',
  //         mailSent,
  //       };
  //     }
  //   } catch (error) {
  //     return standardResponse(false, 'Internal Server Error', 500, null, error.stack,  "reservation/cancelReservation");
  //   }
  // }

}
