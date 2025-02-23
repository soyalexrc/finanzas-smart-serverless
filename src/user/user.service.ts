import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MarkFavCurrencyDto } from './dto/mark-fav-currency.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from '../transaction/entities/transaction.entity';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }
  async markFavCurrency(body: MarkFavCurrencyDto) {
    const { currencyId, userId } = body;
    try {
      const user: any = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isFav = user.favCurrencies.includes(currencyId);

      user.favCurrencies = isFav
        ? user.favCurrencies.filter((id) => id !== currencyId) // Remove if exists
        : [...user.favCurrencies, currencyId]; // Add if not exists

      await user.save();
      return {
        message: 'Se actualizaron las preferencias con exito!',
        favCurrencies: user.favCurrencies,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error consulting: ${error.message}`,
      );
    }
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
