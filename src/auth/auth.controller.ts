import { Controller, Post, Body, Request, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
      challenge?: string;
      registrationResponse: any;
    },
  ) {
    return await this.authService.completeRegistration(
      body.email,
      body.registrationResponse,
      body.challenge,
    );
  }

  @Post('start-authentication')
  async startAuthentication(@Body() body: { email: string }) {
    return await this.authService.startAuthentication(body.email);
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
}
