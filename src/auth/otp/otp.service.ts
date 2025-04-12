import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOtpDto } from '../dto/create-otp.dto';
import { Otp } from '../entities/otp.entity';
import { VerifyOtpDto } from '../dto/verify-otp.dto';

@Injectable()
export class OtpService {
  constructor(@InjectModel('Otp') private readonly otpModel: Model<Otp>) {}

  async generateOtp(dto: CreateOtpDto): Promise<string> {
    const code = this.generateCode(6);

    // Opcional: eliminar códigos anteriores del mismo email
    await this.otpModel.deleteMany({ email: dto.email });

    const otp = new this.otpModel({
      email: dto.email,
      code,
    });

    await otp.save();

    return code;

    // Aquí envías el correo
    // console.log(`Enviar código ${code} a ${dto.email}`);
    // this.mailService.sendOtp(dto.email, code); <-- ejemplo
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<boolean> {
    const otp = await this.otpModel.findOne({
      email: dto.email,
      code: dto.code,
      isUsed: false,
    });

    if (!otp) {
      return false;
    }

    otp.isUsed = true;
    await otp.save();

    return true;
  }

  private generateCode(length: number): string {
    return Math.floor(Math.random() * Math.pow(10, length))
      .toString()
      .padStart(length, '0');
  }
}
