import {
  Controller,
  Post,
  Body,
  Request,
  Res,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { Response } from 'express';
import { CreateOtpDto } from './dto/create-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { OtpService } from '../common/services/otp/otp.service';
import { EmailTemplateType } from 'src/common/enums/email-templates';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private otpService: OtpService,
  ) {}

  @Post('register')
  async register(@Body() body: CreateUserDto, @Res() res: Response) {
    return await this.authService.register(body, res);
  }

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res() res: Response,
  ) {
    return await this.authService.validateUser(body.email, body.password, res);
  }

  // @UseGuards(JwtAuthGuard)
  @Post('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  //   passkeys

  @Post('start-registration')
  async startRegistration(@Body() body: { email: string }) {
    return await this.authService.startRegistration(body.email);
  }

  @Post('complete-registration')
  async completeRegistration(
    @Body()
    body: {
      email: string;
      registrationResponse: any;
      platform: string;
      challenge?: string;
    },
  ) {
    return await this.authService.completeRegistration(
      body.email,
      body.registrationResponse,
      body.platform,
      body.challenge,
    );
  }

  @Post('start-authentication')
  async startAuthentication(@Body() body: { email: string, platform: string }) {
    return await this.authService.startAuthentication(body.email, body.platform);
  }

  @Get('getPasskeysByUserId')
  getPasskeysByUserId(@Query() query: { userId: string }) {
    return this.authService.getPasskeysByUserId(query.userId);
  }

  @Post('complete-authentication')
  async completeAuthentication(
    @Body()
    body: {
      email: string;
      authenticationResponse: any;
      challenge?: string;
    },
  ) {
    return await this.authService.completeAuthentication(
      body.email,
      body.authenticationResponse,
      body.challenge,
    );
  }

  @Post('validateUserEmailForPasskey')
  async validateUserEmailForPasskey(@Body() body: { email: string }) {
    return await this.authService.validateUserEmailForPasskey(body.email);
  }

  @Post('validateEmailForRegister')
  async validateEmailForRegister(
    @Body() dto: VerifyOtpDto,
    @Res() res: Response,
  ) {
    return await this.authService.validateEmailForRegister(dto, res);
  }

  @Post('checkUserByEmail')
  async checkUserByEmail(@Body() body: { email: string }) {
    return await this.authService.checkUserByEmail(body.email);
  }

  @Post('request-otp')
  async requestOtp(@Body() dto: CreateOtpDto) {
    const code = await this.otpService.generateOtp(dto);;
    await this.authService.sendOtpEmail(
      dto.email,
      code,
      EmailTemplateType.VERIFY_EMAIL_FOR_REGISTRATION,
      'Verifica tu correo electrónico',
      dto.email,
    );
    return { message: 'OTP enviado' };
  }

  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const result = await this.otpService.verifyOtp(dto);
    if (result) {
      return { message: 'OTP válido' }
    } else {
      throw new BadRequestException('OTP inválido o ya utilizado');
    }
  }
}