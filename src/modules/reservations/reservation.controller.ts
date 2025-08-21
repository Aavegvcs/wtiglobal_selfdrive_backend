import { Body, Controller, Get, Param, Post, Res } from "@nestjs/common";
import { ReservationService } from "./reservation.service";
import { Response } from "express";
import { WrapperReservationDto } from "./dto/wrapper-reservation.dto";
import { FinalReservationDto } from "./dto/create-final-reservation.dto";
import { CancelReservationDto } from "./dto/cancel-reservation.dto";


@Controller('reservations')
export class ReservationController {
    constructor(private readonly reservationService: ReservationService) {}

    @Post('createProvisionalReservation')
    async createProvisionalReservation(@Body() wrapperReservationDto: WrapperReservationDto, @Res() res: Response) {
        const response = await this.reservationService.createProvisionalReservation(wrapperReservationDto);
        return res.status(response.statusCode).json(response);
    }

    @Post('createFinalReservation') 
    async createFinalReservation(@Body() finalReservationDto: FinalReservationDto, @Res() res: Response) {
        const response = await this.reservationService.createFinalReservation(finalReservationDto);
        return res.status(response.statusCode).json(response);
    }
    
    @Get('getConfirmedReservation/:order_reference_number') 
    async getConfirmedReservation(@Param('order_reference_number') order_reference_number: string, @Res() res: Response) {
        const response = await this.reservationService.getConfirmedReservation(order_reference_number);
        return res.status(response.statusCode).json(response);
    }

    @Get('getFailedReservation/:order_reference_number') 
    async getFailedReservation(@Param('order_reference_number') order_reference_number: string, @Res() res: Response) {
        const response = await this.reservationService.getFailedReservation(order_reference_number);
        return res.status(response.statusCode).json(response);
    }

    @Post('cancelReservation') 
    async cancelReservation(@Body() cancelReservationDto: CancelReservationDto, @Res() res: Response) {
        const response = await this.reservationService.cancelReservation(cancelReservationDto);
        return res.status(response.statusCode).json(response);
    }
}