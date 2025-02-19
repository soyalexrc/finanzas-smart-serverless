import { Module } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { CurrencyController } from './currency.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CurrencySchema } from './entities/currency.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Currency', schema: CurrencySchema }]),
  ],
  controllers: [CurrencyController],
  providers: [CurrencyService],
})
export class CurrencyModule {}
