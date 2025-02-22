import { Injectable } from '@nestjs/common';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { FindTransactionByUserDto } from './dto/find-transaction-by-user.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel('Transaction')
    private readonly transactionModel: Model<Transaction>,
  ) {}

  async create(seedDto: CreateTransactionDto) {
    try {
      return await this.transactionModel.create(seedDto);
    } catch (error) {
      throw new Error(`Error creating transaction: ${error.message}`);
    }
  }

  async findByUser(findTransactionsByUserDto: FindTransactionByUserDto) {
    const { userId, dateFrom, dateTo } = findTransactionsByUserDto;

    try {
      const filter: any = { user: userId };

      // Add date filtering if provided
      if (dateFrom || dateTo) {
        filter.date = {};
        if (dateFrom) filter.date.$gte = new Date(dateFrom);
        if (dateTo) filter.date.$lte = new Date(dateTo);
      }

      return await this.transactionModel
        .find(filter)
        .populate(['category', 'currency'])
        .sort({ date: -1 })
        .lean();
    } catch (error) {
      throw new Error(`Error listing transactions: ${error.message}`);
    }
  }

  async findAll() {
    try {
      return await this.transactionModel
        .find()
        .populate(['currency', 'category']);
    } catch (error) {
      throw new Error(`Error listing transaction: ${error.message}`);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
