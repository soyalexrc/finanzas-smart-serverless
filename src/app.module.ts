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
import { CalendarModule } from './calendar/calendar.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
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
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    AuthModule,
    UserModule,
    CalendarModule,
    CategoryModule,
    AccountModule,
    CardModule,
    TransactionModule,
    CurrencyModule,
    CalendarModule,
    AppModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
