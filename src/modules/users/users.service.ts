import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import {
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto, LoginDto } from './dto/create-user.dto';
import { standardResponse } from 'src/common/helpers/response.helper';
import { otpExpiry, otpGenerator } from 'src/common/utils/otp.util';
import { timeStamp } from 'src/common/utils/time.util';
import { generateAccessToken, generateRefreshToken, TokenPayload, verifyJwtToken } from 'src/common/auth/jwt.auth';
import { ConfigService } from '@nestjs/config';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { MailService } from '../mails/mail.service';
import { UpdateUserDto } from './dto/update-user.dto';

const logger = new Logger("UserService");

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) // ← this injects the Mongoose model
    private userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
    private readonly whatsappService: WhatsappService,
    private readonly mailService: MailService,
  ) {}

  async getUser(id: string): Promise<any> {
    try {
      const userData = this.userModel.findOne({_id: id}).exec();

      if (!userData) {
        return standardResponse(false, 'User not found', 200,
          {
            data: null,
          },
          null,
          "/user/getUser"
        );
      }
      return standardResponse(true, 'User found', 200,
        {
          data: userData
        },
        null,
        "/user/getUser"
      );
    } catch (error: any) {
      return standardResponse(false, 'Internal Server Error', 500,
        {
          data: null,
        },
        error,
        "/user/getUser"
      );
    }
  }

  async createUser(createUserDto: CreateUserDto): Promise<any> {
    try {
      const existingUser: any = await this.userModel
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
          user_obj_id: existingUser._id,
          // role: existingUser.userType,
          // name: existingUser.firstName,
          // number: existingUser.contact,
          // email: existingUser.emailID,
          // gender: existingUser.gender,
          // contactCode: existingUser.contactCode,
          country: existingUser.countryName,
        },
        null,
        "/user/createUser");
      }

      const userID = `US${Date.now()}`;

      const newUser = new this.userModel({
        userID,
        firstName: createUserDto.firstName,
        gender: 'UNKNOWN',
        contact: createUserDto.contact,
        contactCode: createUserDto.contactCode,
        // countryName: createUserDto.countryName,
        // stateName: createUserDto.stateName,
        // address: createUserDto.address,
        // city: createUserDto.city,
        // postalCode: createUserDto.postalCode,
        emailID: createUserDto.emailID.toLowerCase(),
        password: createUserDto.password,
        userType: createUserDto.userType,
        // otp: {
        //   code: null,
        //   otpExpiry: null,
        // },
        auth_type: createUserDto.auth_type,
        user_from: {
          platform_using: createUserDto.platform_using
        },

      });

      await newUser.save();

      return standardResponse(true, 'New User Created', 200, {
        userCreated: true,
        userExist: false,
        // userID: existingUser.userID,
        user_obj_id: newUser._id,
        // role: existingUser.userType,
        // name: existingUser.firstName,
        // number: existingUser.contact,
        // email: existingUser.emailID,
        // gender: existingUser.gender,
        // contactCode: existingUser.contactCode,
        // country: createUserDto.countryName,
        },
        null,
        "/user/createUser"
      );
    } catch (error: any) {
      return standardResponse(false, 'Internal Server Error', 500,
        {
          userCreated: false,
          userExist: false,
        },
        error,
        "/user/createUser"
      );
    }
  }

  async loginUser(userCred: any) {
    
    try {
    logger.log("loginUser - Req.payload", userCred)

    let query = {};

    if (isNaN(userCred)) {
      // Input is likely an email
      const email = userCred.toString();
      query = { emailID: { $regex: new RegExp(`^${email}$`, 'i') } }
    } else {
      // Input is likely a phone number
      const contact = Number(userCred);
      query = { contact }
    }

    const findCred = await this.userModel.findOne(query);
    if (!findCred) {
      return standardResponse(false, 'User not found!', 200,
        {
          isWhatsappOtpSent: false,
          mailSent: false,
        },
        null,
        "/user/loginUser"
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

      logger.log(
        timeStamp(),
        `- loginUser - user exists and OTP updated`,
        userCred,
      );

        // whatsapp otp
        const isWhatsappOtpSent = await this.whatsappService.sendOtpOnWhatsapp(
          `${findCred.contactCode || '' }${findCred.contact}`,
          otp,
        );

        // email otp
        const emailSent = await this.mailService.sendOtpToMail(findCred.emailID, findCred.firstName, otp);

        if(isWhatsappOtpSent.success || emailSent){
          return standardResponse(true, 'OTP sent to Email/Whatsapp.', 200,
              {
                  isWhatsappOtpSent: isWhatsappOtpSent.success,
                  mailSent: emailSent,
              },
              null,
              "/user/loginUser"
          );
        } else {
          return standardResponse(false, 'Error sending Otp to Email and Whatsapp.', 500,
              {
                  isWhatsappOtpSent: isWhatsappOtpSent.success,
                  mailSent: emailSent,
              },
              null,
              "/user/loginUser"
          );
        }
        
    } catch (error:any) {
      return standardResponse(false, 'Internal Server Error', 500,
        {
          isWhatsappOtpSent: false,
          mailSent: false
        },
        error,
        "/user/loginUser"
      );
    }
  }

  async verifyLoginOtp(loginData: LoginDto): Promise<any> {
  try {
    const {userCred, otp} = loginData;

    logger.log("verifyLoginOtp - Req.payload", userCred, otp)

    let query = {};

    if (isNaN(userCred)) {
      // Input is likely an email
      const email = userCred.toString();
      query = { emailID: { $regex: new RegExp(`^${email}$`, 'i') } }
    } else {
      // Input is likely a phone number
      const contact = Number(userCred);
      query = { contact }
    }

    const user = await this.userModel.findOne(query);

    if (!user) {
      return standardResponse(false, "User doesn't exist", 404, null, null, "/user/verifyLoginOtp");
    }

    const currentTime = new Date();

    if (!user.otp.otpExpiry || currentTime > user.otp.otpExpiry) {
      return standardResponse(false, 'OTP expired, request a new OTP', 401, null, null, "/user/verifyLoginOtp");
    }

    if (Number(otp) !== user.otp.code || user.otp.code === null) {
      return standardResponse(false, 'Incorrect OTP', 401, null, null, "/user/verifyLoginOtp");
    }

    const payload : TokenPayload = {
      user_obj_id: user?._id?.toString() || '',
      emailID: user.emailID,
      username: user.firstName,
      profileImg: user?.profileImg?.toString() || '',
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
    }, 
    null,
    "/user/verifyLoginOtp"
    );
  } catch (error) {
    return standardResponse(false, 'Internal Server Error', 500, null, error, "/user/verifyLoginOtp");
  }
  }

  async updateUserDetails(token: string, updateDto: UpdateUserDto) {
    try {

      const secretKey = this.configService.get<string>('JWT_ACCESS_SECRET')!
      
      // 1. Verify JWT
      const verify = await verifyJwtToken(token, secretKey);

      if (!verify.isValid) {
        throw new UnauthorizedException(verify.message);
      }

      
      // 2. Update user
      const query = { _id: new mongoose.Types.ObjectId(verify.decodedToken.user_obj_id) };
      
      const { emailID, contact, ...otherDtoData } = updateDto;

      const updatedUser = await this.userModel.findOneAndUpdate(query, { $set: { ...otherDtoData } }, { new: true });

      if (!updatedUser) {
        return standardResponse(false, 'User not found', 404, null, null, "/user/updateUserDetails");
      }

      return standardResponse(true, 'User updated successfully', 200, null, null, "/user/updateUserDetails");
    } catch (error: any) {
      return standardResponse(false, 'Internal Server Error', 500, null, error, "/user/updateUserDetails");
    }
  }

  async isUserExist(userObjID: string): Promise<boolean> {
    try {
      const user = await this.userModel.findById(userObjID);
      return !!user;
    } catch (error) {
      return false;
    }
  }
}
