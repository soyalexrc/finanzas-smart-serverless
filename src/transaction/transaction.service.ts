import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { FindTransactionByUserDto } from './dto/find-transaction-by-user.dto';
import { GetStatisticsByCurrencyYearDto } from './dto/get-statistics-by-currency-year.dto';
import {
  endOfMonth,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from 'date-fns';
import { GetStatisticsByCurrencyMonthDto } from './dto/get-stadistics-by-currency-month';

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

  async getStatisticsByCurrencyAndYear(body: GetStatisticsByCurrencyYearDto) {
    const { userId, currency, year } = body;
    const today = startOfDay(new Date());

    const startOfMonthDate = startOfMonth(today);
    const startOfLastMonthDate = startOfMonth(subMonths(today, 1));
    const endOfLastMonthDate = endOfMonth(subMonths(today, 1));
    const startOfWeekDate = startOfDay(subDays(today, 7));

    try {
      const expenses = await this.transactionModel.aggregate([
        {
          $match: {
            user: new Types.ObjectId(userId),
            currency: new Types.ObjectId(currency),
            date: {
              $gte: new Date(`${year}-01-01T00:00:00.000Z`), // Start of the year
              $lte: new Date(`${year}-12-31T23:59:59.999Z`), // End of the year
            },
          },
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'categoryDetails',
          },
        },
        { $unwind: '$categoryDetails' },
        {
          $match: {
            'categoryDetails.type': 'expense', // Only include expenses
          },
        },
        {
          $group: {
            _id: null,
            totalSpentOnYear: { $sum: '$amount' }, // Total spent in the entire year
            totalCurrentMonth: {
              $sum: {
                $cond: [{ $gte: ['$date', startOfMonthDate] }, '$amount', 0],
              },
            },
            totalLastMonth: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gte: ['$date', startOfLastMonthDate] },
                      { $lte: ['$date', endOfLastMonthDate] },
                    ],
                  },
                  '$amount',
                  0,
                ],
              },
            },
            totalLastWeek: {
              $sum: {
                $cond: [{ $gte: ['$date', startOfWeekDate] }, '$amount', 0],
              },
            },
          },
        },
      ]);

      return expenses.length > 0
        ? {
            totalSpentOnYear: parseFloat(
              expenses[0].totalSpentOnYear.toFixed(2),
            ),
            totalCurrentMonth: parseFloat(
              expenses[0].totalCurrentMonth.toFixed(2),
            ),
            totalLastMonth: parseFloat(expenses[0].totalLastMonth.toFixed(2)),
            totalLastWeek: parseFloat(expenses[0].totalLastWeek.toFixed(2)),
          }
        : {
            totalSpentOnYear: 0,
            totalCurrentMonth: 0,
            totalLastMonth: 0,
            totalLastWeek: 0,
          };
    } catch (error) {
      throw new Error(`Error listing transactions: ${error.message}`);
    }
  }

  async getMonthlyStatistics(body: GetStatisticsByCurrencyYearDto) {
    const { userId, currency, year } = body;

    try {
      const transactions = await this.transactionModel.aggregate([
        {
          $match: {
            user: new Types.ObjectId(userId),
            currency: new Types.ObjectId(currency),
            date: {
              $gte: new Date(`${year}-01-01T00:00:00.000Z`),
              $lte: new Date(`${year}-12-31T23:59:59.999Z`),
            },
          },
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'categoryDetails',
          },
        },
        { $unwind: '$categoryDetails' },
        {
          $group: {
            _id: {
              month: { $month: '$date' },
              type: '$categoryDetails.type', // Categorize as 'expense' or 'income'
            },
            totalAmount: { $sum: '$amount' },
          },
        },
        {
          $group: {
            _id: '$_id.month',
            expense: {
              $sum: {
                $cond: [{ $eq: ['$_id.type', 'expense'] }, '$totalAmount', 0],
              },
            },
            income: {
              $sum: {
                $cond: [{ $eq: ['$_id.type', 'income'] }, '$totalAmount', 0],
              },
            },
          },
        },
        { $sort: { _id: 1 } }, // Sort by month
      ]);

      const months = [
        { name: 'Enero', nameShort: 'Ene' },
        { name: 'Febrero', nameShort: 'Feb' },
        { name: 'Marzo', nameShort: 'Mar' },
        { name: 'Abril', nameShort: 'Abr' },
        { name: 'Mayo', nameShort: 'May' },
        { name: 'Junio', nameShort: 'Jun' },
        { name: 'Julio', nameShort: 'Jul' },
        { name: 'Agosto', nameShort: 'Ago' },
        { name: 'Septiembre', nameShort: 'Sep' },
        { name: 'Octubre', nameShort: 'Oct' },
        { name: 'Noviembre', nameShort: 'Nov' },
        { name: 'Diciembre', nameShort: 'Dic' },
      ];

      const result = months.map((month, index) => {
        const item = transactions.find((t) => t._id === index + 1);
        return {
          name: month.name,
          nameShort: month.nameShort,
          expense: item ? item.expense : 0,
          income: item ? item.income : 0,
        };
      });

      return result;
    } catch (error) {
      throw new Error(`Error getting monthly statistics: ${error.message}`);
    }
  }

  async getYearlyExpensesByCategory(body: GetStatisticsByCurrencyYearDto) {
    const { userId, currency, year } = body;

    try {
      const expensesByCategory = await this.transactionModel.aggregate([
        {
          $match: {
            user: new Types.ObjectId(userId),
            currency: new Types.ObjectId(currency),
            date: {
              $gte: new Date(`${year}-01-01T00:00:00.000Z`),
              $lte: new Date(`${year}-12-31T23:59:59.999Z`),
            },
          },
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'categoryDetails',
          },
        },
        { $unwind: '$categoryDetails' },
        {
          $match: {
            'categoryDetails.type': 'expense', // Only include expenses
          },
        },
        {
          $group: {
            _id: '$categoryDetails.title', // Group by category name
            totalAmount: { $sum: '$amount' }, // Sum all expenses per category
          },
        },
        { $sort: { totalAmount: -1 } }, // Sort from highest to lowest
      ]);

      return expensesByCategory.map((item) => ({
        name: item._id, // Category name
        value: item.totalAmount, // Expense amount
      }));
    } catch (error) {
      throw new Error(
        `Error getting yearly expenses by category: ${error.message}`,
      );
    }
  }

  async getMonthlyTransactionsByCategory(
    body: GetStatisticsByCurrencyMonthDto,
  ) {
    const { userId, categoryType, currencyId } = body;
    const now = new Date();
    const firstDay = startOfMonth(now);
    const lastDay = endOfMonth(now);

    firstDay.setUTCHours(0, 0, 0, 0);
    lastDay.setUTCHours(23, 59, 59, 999);

    try {
      const transactionsByCategory = await this.transactionModel.aggregate([
        {
          $match: {
            user: new Types.ObjectId(userId),
            currency: new Types.ObjectId(currencyId),
            date: { $gte: firstDay, $lte: lastDay },
          },
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'categoryDetails',
          },
        },
        { $unwind: '$categoryDetails' },
        {
          $match: {
            'categoryDetails.type': categoryType, // Filter by category type (income/expense)
          },
        },
        // {
        //   $lookup: {
        //     from: 'currencies',
        //     localField: 'currency',
        //     foreignField: '_id',
        //     as: 'currencyDetails',
        //   },
        // },
        // { $unwind: '$currencyDetails' },
        {
          $group: {
            _id: {
              title: '$categoryDetails.title',
              // type: '$categoryDetails.type', // Expense or Income
              // currencyId: '$currencyDetails._id',
              // currencyName: '$currencyDetails.name',
              // currencySymbol: '$currencyDetails.symbol',
              // currencyCode: '$currencyDetails.code',
              icon: '$categoryDetails.icon',
              day: { $dayOfMonth: '$date' },
            },
            dailyAmount: { $sum: '$amount' },
          },
        },
        {
          $group: {
            _id: {
              title: '$_id.title',
              type: '$_id.type',
              icon: '$_id.icon',
            },
            totalAmounts: {
              $push: {
                // currencyId: '$_id.currencyId',
                // currencyName: '$_id.currencyName',
                // currencyCode: '$_id.currencyCode',
                // currencySymbol: '$_id.currencySymbol',
                amount: '$dailyAmount',
              },
            },
            dailyData: {
              $push: {
                day: '$_id.day',
                // currencyId: '$_id.currencyId',
                // currencyName: '$_id.currencyName',
                // currencyCode: '$_id.currencyCode',
                // currencySymbol: '$_id.currencySymbol',
                amount: '$dailyAmount',
              },
            },
          },
        },
        { $sort: { 'totalAmounts.amount': -1 } },
      ]);

      return transactionsByCategory.map((item) => ({
        category: item._id,
        value: parseFloat(
          item.totalAmounts
            .reduce((sum, data) => sum + data.amount, 0)
            .toFixed(2),
        ),
        dataPoints: item.dailyData.reduce((acc, data) => {
          const dayEntry = acc.find((d) => d.day === data.day);
          if (!dayEntry) {
            acc.push({
              day: data.day,
              amount: data.amount,
            });
          } else {
            dayEntry.currencies.push({
              amount: data.amount,
            });
          }
          return acc;
        }, []),
      }));
    } catch (error) {
      throw new Error(
        `Error getting monthly transactions by category: ${error.message}`,
      );
    }
  }

  async findByUser(findTransactionsByUserDto: FindTransactionByUserDto) {
    const { userId, dateFrom, dateTo, searchTerm } = findTransactionsByUserDto;

    try {
      const matchStage: any = { user: new Types.ObjectId(userId) };

      // Add date filtering if provided
      if (dateFrom || dateTo) {
        matchStage.date = {};
        if (dateFrom) matchStage.date.$gte = new Date(dateFrom);
        if (dateTo) matchStage.date.$lte = new Date(dateTo);
      }

      const transactions = await this.transactionModel.aggregate([
        { $match: matchStage }, // First, filter transactions by user & date

        // Lookup categories
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'categoryDetails',
          },
        },
        {
          $unwind: {
            path: '$categoryDetails',
            preserveNullAndEmptyArrays: true,
          },
        },

        // Lookup currencies
        {
          $lookup: {
            from: 'currencies',
            localField: 'currency',
            foreignField: '_id',
            as: 'currencyDetails',
          },
        },
        { $unwind: '$currencyDetails' },

        // **NOW filter by searchTerm**
        {
          $match:
            searchTerm && searchTerm.trim() !== ''
              ? {
                  $or: [
                    { title: { $regex: searchTerm, $options: 'i' } }, // Search in title
                    { description: { $regex: searchTerm, $options: 'i' } }, // Search in description
                    {
                      'categoryDetails.title': {
                        $regex: searchTerm,
                        $options: 'i',
                      },
                    }, // Search in category title
                  ],
                }
              : {},
        },

        // Sort by date (latest first)
        { $sort: { date: -1 } },

        // Select only necessary fields
        {
          $project: {
            title: 1,
            description: 1,
            date: 1,
            amount: 1,
            images: 1,
            documents: 1,
            category: '$categoryDetails',
            currency: '$currencyDetails',
          },
        },
      ]);

      return transactions;
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

  async update(id: string, updateTransactionDto: UpdateTransactionDto) {
    try {
      const updatedTransaction = await this.transactionModel.findByIdAndUpdate(
        id,
        { $set: updateTransactionDto },
        { new: true, runValidators: true }, // Returns the updated document and ensures validation
      );

      if (!updatedTransaction) {
        throw new NotFoundException(`Transaction with ID ${id} not found`);
      }

      return updatedTransaction;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error updating transaction: ${error.message}`,
      );
    }
  }

  async remove(id: string) {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('ID invalido');
    }

    try {
      const deletedTransaction =
        await this.transactionModel.findByIdAndDelete(id);
      if (!deletedTransaction) {
        throw new NotFoundException('No se encontro la transaccion');
      }
      return {
        message: 'Transaccion eliminada exitosamente!',
        deletedTransaction,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error deleting transaction: ${error.message}`,
      );
    }
  }
}
