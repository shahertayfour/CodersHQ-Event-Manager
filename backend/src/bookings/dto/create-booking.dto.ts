import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsInt,
  Min,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { Seating, Visibility } from '@prisma/client';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  entity: string;

  @IsString()
  @IsNotEmpty()
  jobTitle: string;

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

  @IsInt()
  @Min(1)
  attendees: number;

  @IsEnum(Seating)
  seating: Seating;

  @IsString()
  @IsNotEmpty()
  agenda: string;

  @IsBoolean()
  @IsOptional()
  valet?: boolean;

  @IsBoolean()
  @IsOptional()
  catering?: boolean;

  @IsBoolean()
  @IsOptional()
  photography?: boolean;

  @IsBoolean()
  @IsOptional()
  itSupport?: boolean;

  @IsBoolean()
  @IsOptional()
  screensDisplay?: boolean;

  @IsString()
  @IsOptional()
  comments?: string;

  @IsEnum(Visibility)
  @IsOptional()
  visibility?: Visibility;
}
