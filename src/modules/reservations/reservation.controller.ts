import { Body, Controller, Get, Param, Post, Query, Res } from "@nestjs/common";
import { ReservationService } from "./reservation.service";
import { Response } from "express";
import { FinalReservationDto } from "./dto/create-final-reservation.dto";
import { CancelReservationDto } from "./dto/cancel-reservation.dto";
import { IncomingReservationDto } from "./dto/incoming-reservation.dto";


@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post('createProvisionalReservation')
  async createProvisionalReservation(
    @Body() incomingReservationDto: IncomingReservationDto,
    @Res() res: Response,
  ) {
    const response = await this.reservationService.createProvisionalReservation(
      incomingReservationDto,
    );
    return res.status(response.statusCode).json(response);
  }

  @Post('createFinalReservation')
  async createFinalReservation(
    @Body() finalReservationDto: FinalReservationDto,
    @Res() res: Response,
  ) {
    const response =
      await this.reservationService.createFinalReservation(finalReservationDto);
    return res.status(response.statusCode).json(response);
  }

  @Get('getConfirmedReservation/:order_reference_number')
  async getConfirmedReservation(
    @Param('order_reference_number') order_reference_number: string,
    @Res() res: Response,
  ) {
    const response = await this.reservationService.getConfirmedReservation(
      order_reference_number,
    );
    return res.status(response.statusCode).json(response);
  }

  @Get('getFailedReservation/:order_reference_number')
  async getFailedReservation(
    @Param('order_reference_number') order_reference_number: string,
    @Res() res: Response,
  ) {
    const response = await this.reservationService.getFailedReservation(
      order_reference_number,
    );
    return res.status(response.statusCode).json(response);
  }

  @Post('cancelReservation')
  async cancelReservation(
    @Body() cancelReservationDto: CancelReservationDto,
    @Res() res: Response,
  ) {
    const response =
      await this.reservationService.cancelReservation(cancelReservationDto);
    return res.status(response.statusCode).json(response);
  }

  @Get('getFinalReservationAndReceipts/:user_id/:reservationStatus')
  async getFinalReservationAndReceipts(
    @Param('user_id') user_id: string,
    @Param('reservationStatus') reservationStatus: string,
    @Res() res: Response,
  ) {
    const response =
      await this.reservationService.getFinalReservationAndReceipts(
        user_id,
        reservationStatus,
      );
    return res.status(response.statusCode).json(response);
  }

  @Get('getAllFinalReservations/:country')
  async getAllFinalReservations(
    @Param('country') country: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Res() res: Response,
  ) {
    const response = await this.reservationService.getAllFinalReservations(
      country,
      page,
      limit,
    );
    return res.status(response.statusCode).json(response);
  }
}