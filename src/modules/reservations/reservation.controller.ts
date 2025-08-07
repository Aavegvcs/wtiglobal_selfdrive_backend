import { Body, Controller, Post, Res } from "@nestjs/common";
import { ReservationService } from "./reservation.service";
import { CreateProvisionalReservationDto } from "./dto/create-provisional-reservation.dto";
import { Response } from "express";
import { WrapperReservationDto } from "./dto/wrapper-reservation.dto";
import { FinalReservationDto } from "./dto/create-final-reservation.dto";


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
}