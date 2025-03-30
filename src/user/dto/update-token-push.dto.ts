import { IsMongoId, IsString } from 'class-validator';

export class UpdateTokenPushDto {
  @IsString()
  tokenPush: string;

  @IsString()
  @IsMongoId()
  userId: string;
}
