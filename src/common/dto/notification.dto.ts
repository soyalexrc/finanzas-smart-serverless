import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class NotificationContentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}

export class NotificationPayloadDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NotificationContentDto)
  contents: NotificationContentDto[];

  @IsString()
  @IsOptional()
  error?: string;

  @IsString()
  @IsIn(['onboarding', 'error', 'purchase'])
  type: 'onboarding' | 'error' | 'purchase';
}
