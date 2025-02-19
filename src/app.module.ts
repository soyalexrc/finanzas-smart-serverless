import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { AccountModule } from './account/account.module';
import { CardModule } from './card/card.module';
import { TransactionModule } from './transaction/transaction.module';
import { CurrencyModule } from './currency/currency.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService) => ({
        uri: configService.get('MONGO_URI') as string,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    CategoryModule,
    AccountModule,
    CardModule,
    TransactionModule,
    CurrencyModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
