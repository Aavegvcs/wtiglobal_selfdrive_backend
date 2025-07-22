import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto, LoginDto } from './dto/create-user.dto';
import { standardResponse } from 'src/common/helpers/response.helper';
import { otpExpiry, otpGenerator } from 'src/common/utils/otp.util';
import { timeStamp } from 'src/common/utils/time.util';
import { generateAccessToken, generateRefreshToken, TokenPayload } from 'src/common/auth/jwt.auth';
import { ConfigService } from '@nestjs/config';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) // ← this injects the Mongoose model
    private userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
    private readonly whatsappService: WhatsappService
  ) {}

  async getUser(id: string): Promise<any> {
    try {
      const userData = this.userModel.findOne({_id: id}).exec();

      if (!userData) {
        return standardResponse(false, 'User not found', 200,
          {
            data: null,
          },
        );
      }
      return standardResponse(true, 'User found', 200,
        {
          data: userData
        },
      );
    } catch (error: any) {
      return standardResponse(false, 'Internal Server Error', 500,
        {
          data: null,
        },
        error,
      );
    }
  }

  async createUser(createUserDto: CreateUserDto): Promise<any> {
    try {
      const existingUser = await this.userModel
        .findOne({
          $or: [
            { contact: createUserDto.contact },
            { emailID: createUserDto.emailID },
          ],
        })
        .exec();

      if (existingUser) {
        return standardResponse(true, 'User already exists', 200, {
          userCreated: false,
          userExist: true,
          // userID: existingUser.userID,
          // user_obj_id: existingUser._id,
          // role: existingUser.userType,
          // name: existingUser.firstName,
          // number: existingUser.contact,
          // email: existingUser.emailID,
          // gender: existingUser.gender,
          // contactCode: existingUser.contactCode,
          country: existingUser.countryName,
        });
      }

      const userID = `US${Date.now()}`;

      const newUser = new this.userModel({
        userID,
        firstName: createUserDto.firstName,
        gender: createUserDto.gender,
        contact: createUserDto.contact,
        contactCode: createUserDto.contactCode,
        countryName: createUserDto.countryName,
        stateName: createUserDto.stateName,
        address: createUserDto.address,
        city: createUserDto.city,
        postalCode: createUserDto.postalCode,
        emailID: createUserDto.emailID.toLowerCase(),
        password: createUserDto.password,
        userType: 'CUSTOMER',
        otp: {
          code: null,
          otpExpiry: null,
        },
        auth_type: createUserDto.auth_type,
      });

      await newUser.save();

      return standardResponse(true, 'New User Created', 200, {
        userCreated: true,
        userExist: false,
        // userID: existingUser.userID,
        // user_obj_id: existingUser._id,
        // role: existingUser.userType,
        // name: existingUser.firstName,
        // number: existingUser.contact,
        // email: existingUser.emailID,
        // gender: existingUser.gender,
        // contactCode: existingUser.contactCode,
        country: createUserDto.countryName,
      });
    } catch (error: any) {
      return standardResponse(false, 'Internal Server Error', 500,
        {
          userCreated: false,
          userExist: false,
        },
        error,
      );
    }
  }

  async loginUser(userCred: string) {
    
    try {
    console.log("loginUser - Req.payload", userCred)
    const query = {
      $or: [{ contact: userCred }, { emailID: userCred }],
    };

    const findCred = await this.userModel.findOne(query);
    if (!findCred) {
      return standardResponse(false, 'User not found!', 200,
        {
          isWhatsappOtpSent: false,
          mailSent: false,
        },
      );
    }

    const otp = otpGenerator();
    const expiry = otpExpiry(5);

    const docToUpdate = {
      otp: {
        code: otp,
        otpExpiry: expiry,
      },
    };

      await this.userModel.findOneAndUpdate(query, docToUpdate);

      console.log(
        timeStamp(),
        `- loginUser - user exists and OTP updated`,
        userCred,
      );

        const isWhatsappOtpSent = await this.whatsappService.sendOtpOnWhatsapp(
          `${findCred.contactCode}${findCred.contact}`,
          otp,
        );

        // const emailSent = await this.sendOtpToMail(findCred.emailID, findCred.firstName, otp);

        return standardResponse(true, 'OTP sent to Email and Whatsapp.', 200,
            {
                isWhatsappOtpSent: isWhatsappOtpSent.success,
                mailSent: 'emailSent',
            },
        );
        
    } catch (error:any) {
      return standardResponse(false, 'Internal Server Error', 500,
        {
          isWhatsappOtpSent: false,
          mailSent: false
        },
        error
      );
    }
  }

  async verifyLoginOtp(loginData: LoginDto): Promise<any> {
  try {
    const {userCred, otp} = loginData;

    console.log("verifyLoginOtp - Req.payload", userCred, otp)
    const query = {
      $or: [{ contact: userCred }, { emailID: userCred }],
    };

    const user = await this.userModel.findOne(query);

    if (!user) {
      return standardResponse(false, "User doesn't exist", 404);
    }

    const currentTime = new Date();

    if (!user.otp.otpExpiry || currentTime > user.otp.otpExpiry) {
      return standardResponse(false, 'OTP expired, request a new OTP', 401);
    }

    if (Number(otp) !== user.otp.code || user.otp.code === null) {
      return standardResponse(false, 'Incorrect OTP', 401);
    }

    const payload : TokenPayload = {
      user_obj_id: String(user?._id),
      emailID: user.emailID,
      username: user.firstName,
      profileImg: String(user.profileImg),
      role: user.userType,
      countryName: user?.countryName,
        //   user.gender,
        //   user.contact,
        //   user?.contactCode,
    }
    const accessToken = await generateAccessToken(payload, this.configService);
    const refreshToken = await generateRefreshToken(payload, this.configService);

    // Clear OTP
    user.otp.code = null;
    user.otp.otpExpiry = null;
    await user.save();

    return standardResponse(true, 'Login Success', 200, {
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return standardResponse(false, 'Internal Server Error', 500, null, error);
  }
  }

}
