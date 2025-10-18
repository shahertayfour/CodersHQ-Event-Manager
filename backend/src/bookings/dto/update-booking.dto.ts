import {
  IsString,
  IsEmail,
  IsInt,
  IsDateString,
  IsEnum,
  IsOptional,
  Min,
  IsBoolean,
} from 'class-validator';
import { Seating, Visibility } from '@prisma/client';

export class UpdateBookingDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  entity: string;

  @IsString()
  jobTitle: string;

  @IsString()
  spaceId: string;

  @IsString()
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
