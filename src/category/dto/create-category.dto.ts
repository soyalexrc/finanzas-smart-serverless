import { IsString, IsOptional, IsMongoId } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  icon: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsMongoId()
  user: string;
}
