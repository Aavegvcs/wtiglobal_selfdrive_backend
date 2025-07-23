import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  BadRequestException,
  Req,
  Res
} from '@nestjs/common';
import { Response, Request } from 'express';
import { CreateUserDto, LoginDto } from './dto/create-user.dto';
import { UserService } from './users.service';
import { isValidObjectId } from 'mongoose';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('createUser')
  async createUser(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    const response = await this.userService.createUser(createUserDto);
    return res.status(response.statusCode).json(response)
  }

  @Get('getUser/:_id')
  async getUser(@Param('_id') _id:string, @Res() res: Response) {
    if (!isValidObjectId(_id)) {
        throw new BadRequestException('Invalid MongoDB ObjectId');
    }
    const response = await this.userService.getUser(_id);
    return res.status(response.statusCode).json(response)
  }

  @Get('loginUser/:userCred')
  async loginUser(@Param('userCred') userCred: string, @Res() res: Response) {
    const response = await this.userService.loginUser(userCred);    
    return res.status(response.statusCode).json(response)
  }

  @Post('verifyLoginOtp')
  async verifyLoginOtp(@Body() loginDto: LoginDto, @Res() res: Response) {
    const response = await this.userService.verifyLoginOtp(loginDto);    
    return res.status(response.statusCode).json(response)
  }
}
