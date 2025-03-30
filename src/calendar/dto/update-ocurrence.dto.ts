import { IsBoolean } from 'class-validator';

export class UpdateOccurrenceDto {
  @IsBoolean()
  checked: boolean;
}
