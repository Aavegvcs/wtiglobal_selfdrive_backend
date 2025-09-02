import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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
import {
  addDaysToDate,
  calculateDaysDifference,
  convertUtcToTimezone,
  makeTimeStampFromDateTime,
} from 'src/common/utils/time.util';
import { MailService } from '../mails/mail.service';
import { SingleInventoryReqRes } from '../inventory/schemas/single-inventory-req-res';
import mongoose from 'mongoose';
import { PaymentType } from 'src/common/enums/payment-type.enum';

const logger = new Logger('ReservationService');

@Injectable()
export class ReservationService {
  constructor(
    @InjectModel(ProvisionalReservation.name)
    private provisionalReservationModel: Model<ProvisionalReservation>,
    @InjectModel(ProvisionalReceipt.name)
    private provisionalReceiptModel: Model<ProvisionalReceipt>,
    @InjectModel(FinalReservation.name)
    private finalReservationModel: Model<FinalReservation>,
    @InjectModel(FinalReceipt.name)
    private finalReceiptModel: Model<FinalReceipt>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Extras.name) private extrasModel: Model<Extras>,
    @InjectModel(SingleInventoryReqRes.name)
    private singleInventoryReqResModel: Model<SingleInventoryReqRes>,
    private readonly paymentGatewayService: PaymentGatewayService,
    private readonly mailService: MailService,
  ) {}

  async makeProvisionalReservation(
    wrapperReservationDto: WrapperReservationDto,
  ): Promise<any> {
    try {
      const { reservation, receipt } = wrapperReservationDto;

      console.log(
        '-------------------------------------------------------------------',
      );
      logger.log(`Reservation with req.body: ${JSON.stringify(reservation)}`);
      console.log(
        '-------------------------------------------------------------------',
      );
      logger.log(`Receipt with req.body: ${JSON.stringify(receipt)}`);
      console.log(
        '-------------------------------------------------------------------',
      );

      const order_reference_number = `ORD${Date.now()}`;
      const receiptId = `REC${Date.now()}`;

      console.log(
        '----------------------- creating order/session -----------------------------',
      );

      let orderData: any = null;
      let stripeCustomer: any = null;
      // If payment gateway is Razorpay, create an order

      if (reservation.paymentGatewayUsed.toString() == '1') {
        orderData = await this.paymentGatewayService.createOrder({
          amount: receipt.totalFare,
          currency: receipt.currencyInfo.currency,
          receiptID: receiptId,
          notes: {
            message: `Self Drive Reservation Order ${order_reference_number} for user ${reservation.user_id}`,
          },
        });

        orderData = orderData?.result || null;
      } else if (reservation.paymentGatewayUsed.toString() == '0') {
        const user: any = await this.userModel.findById(reservation.user_id);

        console.log('user123', user);

        stripeCustomer = await this.paymentGatewayService.createStripeCustomer({
          name: user.firstName,
          phone: user.contact,
          email: user.emailID,
          address: {
            line1: 'D-21, Corporate Park',
            postal_code: '123456',
            city: 'UAE',
            country: 'UAE',
          },
        });

        orderData = await this.paymentGatewayService.createCheckoutSession({
          amount: receipt.totalFare,
          currency: receipt.currencyInfo.currency,
          customerId: stripeCustomer.customerID ?? '',
          receiptId: receiptId,
          order_reference_number: order_reference_number,
          userType: reservation.userType,
        });
      }

      console.log('orderData', orderData);

      console.log(
        '--------------------- order created --------------------------',
      );

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
        model_name: reservation.model_name,
        sku_id: reservation.sku_id,
        extrasSelected:
          reservation.extrasSelected?.map((id) => new Types.ObjectId(id)) || [],
        reservationStatus: ReservationStatusEnum.HOLD,
        paymentType: reservation.paymentType,
        razorpayOrderId:
          reservation.paymentGatewayUsed.toString() == '1'
            ? orderData.result._id
            : null,
        stripeCustomerId: stripeCustomer.customerID ?? null,
        paymentId: null,
        finalPaymentId: null,
        paymentGatewayUsed: reservation.paymentGatewayUsed,
        user_documents_id:
          reservation.user_documents_id?.length > 0
            ? reservation.user_documents_id
            : null,
      });

      await reservationResult.save();

      return standardResponse(
        true,
        'Provisional reservation and receipt created',
        201,
        {
          reservation_id: reservationResult._id,
          order_reference_number: reservationResult.order_reference_number,
          reservationCreated: true,
          receiptCreated: true,
          orderData: orderData,
        },
        null,
        '/reservation/makeProvisionalReservation',
      );
    } catch (error) {
      return standardResponse(
        false,
        'Internal Server Error',
        500,
        {
          reservationCreated: false,
          receiptCreated: false,
          orderData: null,
        },
        error.stack,
        '/reservation/makeProvisionalReservation',
      );
    }
  }

  async createProvisionalReservation(reqBody: any): Promise<any> {
    let findInventoryData: any = await this.singleInventoryReqResModel.findById(
      reqBody.reqResId,
    );

    findInventoryData = {
      ...findInventoryData?.reqBody,
      ...findInventoryData?.resBody,
    };
    const { vehicle_id, tarrifs } = findInventoryData;

    console.log('findInventoryData', findInventoryData);

    let selectedTarrif: any;

    if (tarrifs && tarrifs.length > 0) {
      selectedTarrif = tarrifs.find((item: any) => {
        return item.tariff_type === findInventoryData.tarrif_selected;
      });
    }

    console.log('selectedTarrif', selectedTarrif);

    let pickupDate: string = makeTimeStampFromDateTime(
      selectedTarrif.pickup,
      'Asia/Dubai',
    );
    let dropDate: string;

    if (selectedTarrif.tariff_type === 'Monthly') {
      dropDate = addDaysToDate(pickupDate, 30);
    } else {
      dropDate = makeTimeStampFromDateTime(selectedTarrif.drop, 'Asia/Dubai');
    }

    const daysDiff = calculateDaysDifference(pickupDate, dropDate);

    console.log('pickupDate:', pickupDate); // 1
    console.log('dropDate', dropDate);
    console.log('daysDiff', daysDiff);

    const BookingDataPacket: WrapperReservationDto = {
      reservation: {
        timezone: 'Asia/Kolkata',
        country: findInventoryData.source.countryCode,
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
        sku_id: 'sku_id',
        extrasSelected: reqBody.extrasSelected,
        paymentType: reqBody.paymentType,
        paymentGatewayUsed:
          findInventoryData.source.countryCode.toUpperCase() == 'IND'
            ? '1'
            : '0',
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

  async makeFinalReservation(
    finalReservationDto: FinalReservationDto,
  ): Promise<any> {
    let isWhatsappSent: boolean = false;
    let isMailSent: boolean = false;
    let FinalReservationCreated: boolean = false;
    let FinalReceiptCreated: boolean = false;

    try {
      const {
        paymentId,
        order_reference_number,
        stripeCustomerId,
        razorpayOrderId,
      } = finalReservationDto;

      console.log(
        '-------------------------------------------------------------------',
      );
      console.log(
        `makeFinalReservation function with req.body: ${order_reference_number}`,
      );
      console.log(
        '-------------------------------------------------------------------',
      );

      // --------------------------------------------------------------------------------
      // Get provisional reservation and receipt then create final from it
      // --------------------------------------------------------------------------------

      let provisionalReservation: any = await this.provisionalReservationModel
        .findOne({ order_reference_number: order_reference_number })
        .populate([{ path: 'user_id' }, { path: 'extrasSelected' }])
        .lean()
        .exec();

      if (!provisionalReservation)
        throw new Error('Provisional reservation not found');

      let provisionalReceipt = await this.provisionalReceiptModel
        .findById(provisionalReservation.receipt_ref_id)
        .lean()
        .exec();

      if (!provisionalReceipt) throw new Error('Provisional receipt not found');

      // get names of extras selected
      const extrasSelected = getExtrasNamesFromArray(
        provisionalReservation.extrasSelected,
      );

      const extrasSelectedIds =
        provisionalReservation.extrasSelected?.map((e) => e._id) ?? [];

      // --------------------------------------------------------------------------------
      // Create final receipt first to save _id in reservation
      // --------------------------------------------------------------------------------

      const receiptResult: any = new this.finalReceiptModel({
        ...provisionalReceipt,
      });

      await receiptResult.save();
      logger.log('Final receipt created with ID:', receiptResult._id);

      FinalReceiptCreated = true;

      // --------------------------------------------------------------------------------
      // Create final reservation and update the receipt _id in reservation
      // --------------------------------------------------------------------------------

      const reservationResult = new this.finalReservationModel({
        ...provisionalReservation,
        user_id: provisionalReservation.user_id._id,
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
        contactCode: provisionalReservation.user_id.contactCode,
        contact: provisionalReservation.user_id.contact,
        firstName: provisionalReservation.user_id.firstName,
        emailID: provisionalReservation.user_id.emailID,
        order_reference_number: provisionalReservation.order_reference_number,
        paymentId: paymentId,
        extrasSelected: extrasSelected,
        reservationStatus: reservationResult.reservationStatus,
        // start_time: convertUtcToTimezone(String(reservation.pickupDate), reservation.timezone),
        pickupDate: convertUtcToTimezone(
          provisionalReservation.pickupDate.toString(),
          provisionalReservation.timezone,
        ),
        dropDate: convertUtcToTimezone(
          provisionalReservation.dropDate.toString(),
          provisionalReservation.timezone,
        ),
        pickupLocation: provisionalReservation.pickupLocation,
        dropLocation: provisionalReservation.dropLocation,
        tarrifType: provisionalReservation.tarrifType,
        vehicle: provisionalReservation.model_name ?? '',
        // carCategoryName: reservation.vehicle_details?.model ?? '',
        baseFare: (
          receiptResult.baseFare * receiptResult.currencyInfo.currencyRate
        ).toFixed(2),
        currency: receiptResult.currencyInfo.currency,
        tax: 0,
        amountPaid: (
          receiptResult.amountPaid * receiptResult.currencyInfo.currencyRate
        ).toFixed(2),
        discount: (
          receiptResult.discount * receiptResult.currencyInfo.currencyRate
        ).toFixed(2),
        grandTotal: (
          receiptResult.totalFare * receiptResult.currencyInfo.currencyRate
        ).toFixed(2),
      };

      isMailSent = await this.mailService.sendConfirmationEmail(
        confirmationDataPacket,
      );

      return standardResponse(
        true,
        'Final reservation and receipt created',
        201,
        {
          reservation_id: reservationResult._id,
          order_reference_number: reservationResult.order_reference_number,
          reservationCreated: FinalReservationCreated,
          receiptCreated: FinalReceiptCreated,
          isMailSent: isMailSent,
          isWhatsappSent: isWhatsappSent,
        },
        null,
        'makeFinalReservation function',
      );
    } catch (error) {
      return standardResponse(
        false,
        'Internal Server Error',
        500,
        {
          reservationCreated: FinalReservationCreated,
          receiptCreated: FinalReceiptCreated,
          isMailSent: false,
          isWhatsappSent: false,
        },
        error.stack,
        'makeFinalReservation function',
      );
    }
  }

  async createFinalReservation(
    finalReservationDto: FinalReservationDto,
  ): Promise<any> {
    try {
      return this.makeFinalReservation(finalReservationDto);
    } catch (error) {
      return standardResponse(
        false,
        'Internal Server Error',
        500,
        {
          reservationCreated: false,
          receiptCreated: false,
        },
        error,
        '/reservation/createFinalReservation',
      );
    }
  }

  async getFinalReservationAndReceipts(user_id: string, reservationStatus: string) {
    try {
      if (!isValidObjectId(user_id)) {
        throw new BadRequestException('Invalid MongoDB ObjectId');
      }

      const bookingsData = await this.finalReservationModel
        .find({
          user_id: new mongoose.Types.ObjectId(user_id),
          reservationStatus: reservationStatus,
          isModifiedFlag: false,
        })
        .populate([
          { path: 'vehicle_id', select: 'images specs' },
          { path: 'receipt_ref_id', select: 'currencyInfo totalFare' },
          { path: 'user_id', select: 'firstName' },
          // { path: 'extrasSelected' },
        ])
        .lean()
        .exec();

      const sortedBookings: any = bookingsData.sort(
        (a, b) =>
          new Date(b.pickupDate).getTime() - new Date(a.dropDate).getTime(),
      );

      let finalReservations: any[] = [];

      for (let i = 0; i < sortedBookings.length; i++) {
        console.log('------------------------------------');

        const pDate = convertUtcToTimezone(
          sortedBookings[i].pickupDate,
          sortedBookings[i].timezone,
        );
        const dDate = convertUtcToTimezone(
          sortedBookings[i].dropDate,
          sortedBookings[i].timezone,
        );

        const element: any = {
          selectedCar: {
            img:
              `${sortedBookings[i].vehicle_id.images.url_prefix}${sortedBookings[i].vehicle_id.images.s3_paths[0]}` ||
              '',
            model: sortedBookings[i].model_name,
          },
          bookingSummary: [
            {
              text: 'Booking ID',
              value: sortedBookings[i].order_reference_number,
            },
            {
              text: 'Rental Type',
              value: sortedBookings[i].tarrifType,
            },
            {
              text: 'Vehicle Category',
              value: sortedBookings[i].vehicle_id.specs.Class,
            },
            {
              text: 'User Name',
              value: sortedBookings[i].user_id.firstName,
            },
            {
              text: 'Payment Status',
              value: sortedBookings[i].paymentType === PaymentType.FULL ? "Fully Paid" : "Partially Paid",
            },
          ],
          pickup: {
            address: sortedBookings[i].pickupLocation,
            date: pDate.split(",")[0],
            time: `${pDate.split(",")[1].split(":")[0]}:${pDate.split(",")[1].split(":")[1]}`,
          },
          drop: {
            address: sortedBookings[i].dropLocation,
            date: dDate.split(",")[0],
            time: `${dDate.split(",")[1].split(":")[0]}:${dDate.split(",")[1].split(":")[1]}`,
          },
          price: {
            amount: (
              sortedBookings[i].receipt_ref_id.totalFare *
              sortedBookings[i].receipt_ref_id.currencyInfo.currencyRate
            ).toFixed(2),
            currency: sortedBookings[i].receipt_ref_id.currencyInfo.currency,
          },
        };

        finalReservations.push(element);
      }


      return standardResponse(
        true,
        'Successfully fetched reservations',
        200,
        finalReservations,
        null,
        '/reservation/getFinalReservationAndReceipts',
      );
    } catch (error) {
      return standardResponse(
        false,
        'Internal Server Error',
        500,
        null,
        error.stack,
        '/reservation/getFinalReservationAndReceipts',
      );
    }
  }

  async getConfirmedReservation(order_reference_number: string) {
    try {
      if (!order_reference_number)
        throw new BadRequestException(
          'Missing required order_reference_number',
        );

      const result: any = await this.finalReservationModel
        .findOne({ order_reference_number })
        .populate([
          { path: 'user_id', select: 'firstName' },
          { path: 'vehicle_id', select: 'images' },
        ])
        .lean()
        .exec();

      if (!result) throw new NotFoundException('Reservation not found');

      const pDate = convertUtcToTimezone(
        result.pickupDate,
        result.timezone,
      );
      const dDate = convertUtcToTimezone(
        result.dropDate,
        result.timezone,
      );

      const responseData = {
        bookingSummary: [
          { label: 'Booking ID', value: order_reference_number },
          { label: 'User Name', value: result.user_id.firstName },
          { label: 'Rental Type', value: result.tarrifType },
          { label: 'Vehicle', value: result.model_name },
          { label: 'Booked On', value: convertUtcToTimezone(result.createdAt, result.timezone) },
        ],
        vehicleImg: `${result.vehicle_id.images.url_prefix}${result.vehicle_id.images.s3_paths[0]}`,
        pickup: {
          title: 'Pickup',
          address: result.pickupLocation,
          date: pDate.split(",")[0],
          time: `${pDate.split(",")[1].split(":")[0]}:${pDate.split(",")[1].split(":")[1]}`,
        },
        drop: {
          title: 'Drop Off',
          address: result.dropLocation,
          date: dDate.split(",")[0],
          time: `${dDate.split(",")[1].split(":")[0]}:${dDate.split(",")[1].split(":")[1]}`,
        },
      };

      return standardResponse(
        true,
        'Successfully fetched confirmed reservation',
        200,
        responseData,
        null,
        '/reservation/getConfirmedReservation',
      );
    } catch (error) {
      return standardResponse(
        false,
        'Internal Server Error',
        500,
        null,
        error.stack,
        '/reservation/getConfirmedReservation',
      );
    }
  }

  async getFailedReservation(order_reference_number: string) {
    try {
      if (!order_reference_number)
        throw new BadRequestException(
          'Missing required order_reference_number',
        );

      const result: any = await this.provisionalReservationModel
        .findOne({ order_reference_number })
        .populate([
          { path: 'user_id', select: 'firstName' },
          { path: 'vehicle_id', select: 'images' },
          // { path: 'extrasSelected' },
        ])
        .lean()
        .exec();

      if (!result) throw new NotFoundException('Reservation not found');

      const pDate = convertUtcToTimezone(
        result.pickupDate,
        result.timezone,
      );
      const dDate = convertUtcToTimezone(
        result.dropDate,
        result.timezone,
      );

      const responseData = {
        bookingSummary: [
          { label: 'Booking ID', value: order_reference_number },
          { label: 'User Name', value: result.user_id.firstName },
          { label: 'Rental Type', value: result.tarrifType },
          { label: 'Vehicle', value: result.model_name },
          { label: 'Booked On', value: convertUtcToTimezone(result.createdAt, result.timezone) },
        ],
        vehicleImg: `${result.vehicle_id.images.url_prefix}${result.vehicle_id.images.s3_paths[0]}`,
        pickup: {
          title: 'Pickup',
          address: result.pickupLocation,
          date: pDate.split(",")[0],
          time: `${pDate.split(",")[1].split(":")[0]}:${pDate.split(",")[1].split(":")[1]}`,
        },
        drop: {
          title: 'Drop Off',
          address: result.dropLocation,
          date: dDate.split(",")[0],
          time: `${dDate.split(",")[1].split(":")[0]}:${dDate.split(",")[1].split(":")[1]}`,
        },
      };

      return standardResponse(
        true,
        'Successfully fetched failed reservation',
        200,
        responseData,
        null,
        '/reservation/getFailedReservation',
      );
    } catch (error) {
      return standardResponse(
        false,
        'Internal Server Error',
        500,
        null,
        error.stack,
        '/reservation/getFailedReservation',
      );
    }
  }

  async cancelReservation(data: CancelReservationDto) {
    let mailSent: boolean = false;
    let whatsappSent: boolean = false;
    let reservationCancelled: boolean = false;

    try {
      const reservation: FinalReservation | null =
        await this.finalReservationModel
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
          .lean()
          .exec();

      if (!reservation) {
        throw new NotFoundException(`Reservation with ID ${data.id} not found`);
      }

      const receipt: any = reservation.receipt_ref_id;
      const user: any = reservation.user_id;
      const extrasSelected: string = getExtrasNamesFromArray(
        reservation.extrasSelected,
      );
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
        pickupDate: convertUtcToTimezone(
          reservation.dropDate.toString(),
          reservation.timezone,
        ),
        dropDate: convertUtcToTimezone(
          reservation.dropDate.toString(),
          reservation.timezone,
        ),
        pickupLocation: reservation.pickupLocation,
        dropLocation: reservation.dropLocation,
        tarrifType: reservation.tarrifType,
        vehicle: vehicle?.title ?? '',
        // carCategoryName: reservation.vehicle_details?.model ?? '',
        baseFare: (
          receipt.baseFare * receipt.currencyInfo.currencyRate
        ).toFixed(2),
        currency: receipt.currencyInfo.currency,
        tax: 0,
        amountPaid: receipt.amountPaid,
        discount: (
          receipt.discount * receipt.currencyInfo.currencyRate
        ).toFixed(2),
        grandTotal: (
          receipt.totalFare * receipt.currencyInfo.currencyRate
        ).toFixed(2),
      };

      mailSent = await this.mailService.sendCancellationMail(
        cancellationDataPacket,
      );

      return standardResponse(
        true,
        `Successfully cancelled final reservation for reservation ${data.id}`,
        200,
        {
          reservationCancelled: reservationCancelled,
          mailSent: mailSent,
          whatsappSent: whatsappSent,
        },
        null,
        'reservation/cancelReservation',
      );
    } catch (error) {
      return standardResponse(
        false,
        `Internal Server Error: ${data.id}`,
        500,
        {
          reservationCancelled: reservationCancelled,
          mailSent: mailSent,
          whatsappSent: whatsappSent,
        },
        error.stack,
        'reservation/cancelReservation',
      );
    }
  }
}
