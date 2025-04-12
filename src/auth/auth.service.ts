import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { Response } from 'express';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { v4 as uuidv4 } from 'uuid';
import { Passkey } from './entities/passkey.entity';
import { ConfigService } from '@nestjs/config';
import Mailgun from 'mailgun.js';
import { OtpService } from './otp/otp.service';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { EmailTemplateType } from '../common/enums/email-templates';

@Injectable()
export class AuthService {
  private mg;
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('Passkey') private readonly passkeyModel: Model<Passkey>,
    private otpService: OtpService,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {
    const mailgun = new Mailgun(FormData);
    this.mg = mailgun.client({
      username: 'api',
      key: this.configService.get('MAILGUN_API_KEY')!,
    });
  }

  async register(body: CreateUserDto, res: Response) {
    try {
      const hashedPassword = await bcrypt.hash(body.password, 10);
      const newUser = new this.userModel({ ...body, password: hashedPassword });
      const data = await newUser.save();
      return this.validateUser(data.email, body.password, res, true);
    } catch (error) {
      return {
        message: error.message,
      };
    }
  }

  async validateUser(
    email: string,
    password: string,
    res: Response,
    isRegister = false,
  ) {
    try {
      const user: any = await this.userModel.findOne({ email });
      if (!user) {
        return res.status(400).json({
          message: 'No se encontro el usuario',
        });
      } else {
        const passwordValidation = await bcrypt.compare(
          password,
          user.password,
        );
        if (passwordValidation) {
          // Get the token from AuthService
          const { access_token } = this.login(user);

          const userObj = user.toObject();

          delete userObj.password;

          // Send success response
          return res.status(200).json({
            message: `Bienvenido ${!isRegister && 'de vuelta'}, ${user.firstname}!`,
            user: { ...userObj, access_token },
          });
        }
      }
    } catch (error) {
      return res.status(500).json({
        message: error,
      });
    }
  }

  login(user: any): { access_token: string } {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async createOrUpdateUserByEmail(
    email: string,
    userData: Partial<CreateUserDto>,
  ) {
    try {
      const user = await this.userModel.findOne({ email });
      if (user) {
        // Update existing user
        Object.assign(user, userData);
        await user.save();
        return user;
      } else {
        // Create new user
        const newUser = new this.userModel({ email, ...userData });
        await newUser.save();
        return newUser;
      }
    } catch (error) {
      return {
        message: error.message,
      };
    }
  }

  async startRegistration(email: string) {
    console.log(`Starting registration for email: ${email}`);
    const user = await this.userModel.findOne({ email });
    let passkeys: Passkey[] = [];

    if (user) {
      console.log(`User found: ${user._id}`);
      passkeys = await this.passkeyModel.find({ user: user._id });
    }
    const challenge = uuidv4(); // Store this in the DB for the user
    console.log(`Generated challenge: ${challenge}`);

    // Generate the registration challenge
    const registrationOptions = await generateRegistrationOptions({
      rpName: 'Finanzas Inteligentes',
      rpID: 'finanzasok.xyz',
      userName: email,
      userDisplayName: email,
      challenge,
      // excludeCredentials:
      //   passkeys.length > 0
      //     ? passkeys.map((passkey) => ({
      //         id: passkey.credentialId,
      //         transports: passkey.transports as any[],
      //       }))
      //     : undefined,
      timeout: 60000, // 1-minute timeout for the registration challenge
      attestationType: 'none',
      authenticatorSelection: {
        userVerification: 'preferred',
        residentKey: 'preferred',
      },
    });

    console.log(
      `Registration options generated: ${JSON.stringify(registrationOptions)}`,
    );

    // Store the challenge and email temporarily for later verification
    await this.createOrUpdateUserByEmail(email, { challenge });
    console.log(`Stored challenge for email: ${email}`);

    // Return the challenge to the client
    return { ...registrationOptions, challenge };
  }

  async startAuthentication(email: string) {
    console.log(`Starting authentication for email: ${email}`);
    const user = await this.userModel.findOne({ email });
    let passkeys: Passkey[] = [];
    const challenge = uuidv4(); // Store this in the DB for the user
    console.log(`Generated challenge: ${challenge}`);

    if (!user) {
      console.error(`User not found: ${email}`);
      throw new Error('User not found');
    }

    passkeys = await this.passkeyModel.find({ user: user._id });
    const allPasskeys = await this.passkeyModel.find();
    console.log(allPasskeys);
    console.log(`Found passkeys: ${JSON.stringify(passkeys)}`);

    const safeTransports = ['usb', 'nfc', 'ble', 'internal', 'hybrid'];

    const authenticationOptions = await generateAuthenticationOptions({
      rpID: 'finanzasok.xyz',
      userVerification: 'preferred',
      challenge,
      allowCredentials: passkeys.map((passkey) => ({
        id: passkey.credentialId,
        type: 'public-key',
        transport:
          passkey.transports?.filter((t) => safeTransports.includes(t)) || [],
        // transports: passkey.transports as any[],
      })),
    });

    console.log(
      `Authentication options generated: ${JSON.stringify(authenticationOptions)}`,
    );

    await this.createOrUpdateUserByEmail(email, { challenge });
    console.log(`Stored challenge for email: ${email}`);

    return { ...authenticationOptions, challenge };
  }

  async completeRegistration(email: string, response: any, challenge?: string) {
    console.log(`Completing registration for email: ${email}`);
    let challengeToUse: string = '';
    const user = await this.userModel.findOne({ email });

    if (!user) {
      console.error(`User not found: ${email}`);
      throw new Error('User not found');
    }

    if (challenge) {
      challengeToUse = challenge;
    } else {
      if (!user.challenge) {
        console.error(`Challenge not found for user: ${email}`);
        throw new Error('Challenge not found for user');
      }
      challengeToUse = user.challenge;
    }

    console.log(`Using challenge: ${challengeToUse}`);

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: challengeToUse,
      expectedOrigin: [
        'https://finanzasok.xyz',
        'android:apk-key-hash:-eCdrJIpYllXkeZqeUGhKc1xoBKZm92XEzwxWOfugys',
        'https://finanzasok.xyz',
      ],
      expectedRPID: 'finanzasok.xyz',
    });

    console.log(`Verification result: ${JSON.stringify(verification)}`);

    const { registrationInfo } = verification;

    if (registrationInfo && user) {
      const { credential, credentialDeviceType, credentialBackedUp } =
        registrationInfo;
      const newPasskey: Passkey = {
        user,
        backedUp: credentialBackedUp,
        transports: credential.transports as any,
        credentialId: credential.id,
        publicKey: Buffer.from(credential.publicKey).toString('base64'),
        counter: credential.counter,
        deviceType: credentialDeviceType,
        webAuthnUserID: user._id.toString(),
      };

      await this.passkeyModel.create(newPasskey);
      console.log(`New passkey created: ${JSON.stringify(newPasskey)}`);
    }

    if (verification.verified) {
      console.log(`Registration verified for email: ${email}`);
      // 🔐 Sign a JWT and return it
      const payload = {
        email: user.email,
        sub: user._id,
      };
      const access_token = this.jwtService.sign(payload);

      const userObj: any = user.toObject();
      delete userObj.password;

      return {
        success: true,
        message: 'Bienvenid@!',
        user: { ...userObj, access_token },
      };
    } else {
      console.error(`Registration verification failed for email: ${email}`);
      throw new Error('Registration verification failed');
    }
  }

  async completeAuthentication(
    email: string,
    response: any,
    challenge?: string,
  ) {
    console.log(`Completing authentication for email: ${email}`);
    let challengeToUse: string = '';
    const user = await this.userModel.findOne({ email });
    if (!user) {
      console.error(`User not found: ${email}`);
      throw new Error('User not found');
    }

    const passkey: Passkey | null = await this.passkeyModel.findOne({
      user: user._id,
      credentialId: response.id,
    });

    console.log('passkey to use', passkey);

    if (challenge) {
      challengeToUse = challenge;
    } else {
      if (!user.challenge) {
        console.error(`Challenge not found for user: ${email}`);
        throw new Error('Challenge not found for user');
      }
      challengeToUse = user.challenge;
    }

    console.log(`Using challenge: ${challengeToUse}`);

    if (passkey) {
      const verification = await verifyAuthenticationResponse({
        response: response,
        expectedChallenge: challengeToUse,
        expectedOrigin: [
          'https://finanzasok.xyz',
          'android:apk-key-hash:-eCdrJIpYllXkeZqeUGhKc1xoBKZm92XEzwxWOfugys',
          'https://finanzasok.xyz',
        ],
        expectedRPID: 'finanzasok.xyz',
        credential: {
          id: passkey.credentialId,
          publicKey: Buffer.from(passkey.publicKey, 'base64'),
          counter: passkey.counter,
          transports: passkey.transports as any[],
        },
      });

      console.log(`Verification result: ${JSON.stringify(verification)}`);

      const { authenticationInfo } = verification;

      const { newCounter } = authenticationInfo;

      await this.passkeyModel.updateOne(
        { credentialId: passkey.credentialId },
        {
          counter: newCounter,
        },
      );

      console.log(`Updated passkey counter: ${newCounter}`);

      if (verification.verified) {
        console.log(`Authentication verified for email: ${email}`);
        // 🔐 Sign a JWT and return it
        const payload = {
          email: user.email,
          sub: user._id,
        };
        const access_token = this.jwtService.sign(payload);

        const userObj: any = user.toObject();
        delete userObj.password;

        return {
          success: true,
          message: 'Bienvenid@!',
          user: { ...userObj, access_token },
        };
      } else {
        console.error(`Authentication verification failed for email: ${email}`);
        throw new Error('Registration verification failed');
      }
    }
  }

  async validateUserEmailForPasskey(email: string) {
    try {
      const user = await this.userModel.findOne({ email });

      if (!user) {
        const otp = await this.otpService.generateOtp({ email });
        await this.sendOtpEmail(
          email,
          otp,
          EmailTemplateType.VERIFY_EMAIL_FOR_REGISTRATION,
          'Verificación de correo electrónico',
        );
        return {
          message: 'Usuario no encontrado. OTP enviado al correo.',
          error: true,
        };
      }

      const passkeys = await this.hasPasskeys(user?._id.toString());

      if (!passkeys) {
        const otp = await this.otpService.generateOtp({ email });
        await this.sendOtpEmail(
          email,
          otp,
          EmailTemplateType.VERIFY_EMAIL_FOR_PASSKEY_REGISTRATION,
          'Confirma tu correo electrónico para activar el acceso con Passkey',
          user.firstname,
        );
        return {
          message: 'Usuario sin llaves de acceso. OTP enviado al correo.',
          error: true,
        };
      }

      if (user) {
        return await this.startAuthentication(email);
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al consultar las llaves de acceso: ${error.message}`,
      );
    }
  }

  private async hasPasskeys(userId: string): Promise<boolean> {
    const passkeys = await this.passkeyModel.find({ user: userId });
    return passkeys && passkeys.length > 0;
  }

  private async sendOtpEmail(
    email: string,
    otp: string,
    template: EmailTemplateType,
    subject: string,
    name = '',
  ): Promise<void> {
    const data = await this.mg.messages.create('finanzasok.xyz', {
      from: 'postmaster@finanzasok.xyz',
      to: [email],
      subject,
      template,
      'h:X-Mailgun-Variables': JSON.stringify({
        app_name: 'Finanzas Inteligentes',
        name: name || email,
        valid_time_in_minutes: 5,
        otp,
      }),
    });
    console.log(data); // logs response data
  }

  async validateEmailForRegister(dto: VerifyOtpDto, res: Response) {
    try {
      const result = await this.otpService.verifyOtp(dto);
      if (result) {
        const registrationOptions = await this.startRegistration(dto.email);
        return res.status(200).json(registrationOptions);
      } else {
        return res.status(400).send({
          message: 'OTP inválido o expirado',
          error: true,
        });
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al consultar las llaves de acceso: ${error.message}`,
      );
    }
  }

  async getPasskeysByUserId(userId: string) {
    try {
      return await this.passkeyModel.find({ user: userId });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al consultar las llaves de acceso: ${error.message}`,
      );
    }
  }
}
