import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { MarkFavCurrencyDto } from './dto/mark-fav-currency.dto';
import { Response } from 'express';
import { CheckUsersByEmailDto } from './dto/check-users-by-email.dto';
import {UpdateTokenPushDto} from "./dto/update-token-push.dto";

@Auth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('markFavCurrency')
  markFavCurrency(@Body() body: MarkFavCurrencyDto) {
    return this.userService.markFavCurrency(body);
  }

  @Post('checkUsersByEmail')
  async checkUsersByEmail(
    @Body() body: CheckUsersByEmailDto,
    @Res() res: Response,
  ) {
    const result = await this.userService.checkUsersByEmail(body);
    return res.status(200).send(result);
  }

  @Post('updatePushToken')
  updatePushToken(@Body() body: UpdateTokenPushDto) {
    return this.userService.updatePushToken(body);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
