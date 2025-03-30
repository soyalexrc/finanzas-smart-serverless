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
import { User } from './entities/user.entity';
import { CheckUsersByEmailDto } from './dto/check-users-by-email.dto';
import { UpdateTokenPushDto } from './dto/update-token-push.dto';

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

  async updatePushToken(body: UpdateTokenPushDto) {
    const { tokenPush, userId } = body;
    try {
      const user: any = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.pushToken = tokenPush;

      await user.save();
      return {
        message: 'Se actualizo el push token con exito!',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error consulting: ${error.message}`,
      );
    }
  }

  async checkUsersByEmail(body: CheckUsersByEmailDto) {
    const { emails } = body;
    try {
      const users = await this.userModel.find({ email: { $in: emails } });

      // Extract found emails
      const foundEmails = users.map((user) => user.email);

      const participants = users.map((user) => user._id);
      const participantsDetail = users.map((user) => ({
        id: user._id,
        name: `${user.firstname} ${user.lastname}`,
        email: user.email,
        photoUrl: user.photoUrl,
        pushToken: user.pushToken ?? '',
      }));

      // Get emails that do not exist in the system
      const notFoundEmails = emails.filter(
        (email) => !foundEmails.includes(email),
      );

      if (notFoundEmails.length > 0) {
        return {
          message: `Los siguientes usuarios no existen en el sistema y se les enviará un mensaje de invitacion: ${notFoundEmails.join(', ')}`,
          participants,
          participantsDetail,
          notFoundEmails,
        };
      }

      return {
        message: '',
        participants,
        participantsDetail,
        notFoundEmails,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al consultar: ${error.message}`,
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
