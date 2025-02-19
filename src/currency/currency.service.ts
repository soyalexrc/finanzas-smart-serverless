import { Injectable } from '@nestjs/common';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Currency } from './entities/currency.entity';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectModel('Currency') private readonly currencyModel: Model<Currency>,
  ) {}

  create(createCurrencyDto: CreateCurrencyDto) {
    return 'This action adds a new currency';
  }

  async seed(seedDto: CreateCurrencyDto[]) {
    try {
      return await this.currencyModel.insertMany(seedDto);
    } catch (error) {
      throw new Error(`Error seeding currencies: ${error.message}`);
    }
  }

  async findAll() {
    try {
      return await this.currencyModel.find();
    } catch (error) {
      throw new Error(`Error listing currencies: ${error.message}`);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} currency`;
  }

  update(id: number, updateCurrencyDto: UpdateCurrencyDto) {
    return `This action updates a #${id} currency`;
  }

  remove(id: number) {
    return `This action removes a #${id} currency`;
  }
}
