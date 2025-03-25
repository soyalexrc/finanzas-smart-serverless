import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FindTransactionByUserDto } from './dto/find-transaction-by-user.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetStatisticsByCurrencyYearDto } from './dto/get-statistics-by-currency-year.dto';

@Auth()
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionService.create(createTransactionDto);
  }

  @Post('byUser')
  findByUser(@Body() findTransactionsByUserDto: FindTransactionByUserDto) {
    return this.transactionService.findByUser(findTransactionsByUserDto);
  }

  @Get()
  findAll() {
    return this.transactionService.findAll();
  }

  @Post('getStatisticsByCurrencyAndYear')
  getStatisticsByCurrencyAndYear(@Body() body: GetStatisticsByCurrencyYearDto) {
    return this.transactionService.getStatisticsByCurrencyAndYear(body);
  }

  @Post('getMonthlyStatistics')
  getMonthlyStatistics(@Body() body: GetStatisticsByCurrencyYearDto) {
    return this.transactionService.getMonthlyStatistics(body);
  }

  @Post('getYearlyExpensesByCategory')
  getYearlyExpensesByCategory(@Body() body: GetStatisticsByCurrencyYearDto) {
    return this.transactionService.getYearlyExpensesByCategory(body);
  }

  @Post('getMonthlyExpensesByCategory')
  getMonthlyExpensesByCategory(@Body() body: GetStatisticsByCurrencyYearDto) {
    return this.transactionService.getMonthlyTransactionsByCategory(body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionService.remove(id);
  }
}
