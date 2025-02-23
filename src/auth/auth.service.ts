import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

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
    const payload = { email: user.email, sub: user.id, roles: user.roles };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
