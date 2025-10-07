import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Visibility } from '@prisma/client';

export class CreateInternalEventDto {
  @IsString()
  @IsNotEmpty()
  spaceId: string;

  @IsString()
  @IsNotEmpty()
  eventName: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(Visibility)
  @IsOptional()
  visibility?: Visibility;
}
