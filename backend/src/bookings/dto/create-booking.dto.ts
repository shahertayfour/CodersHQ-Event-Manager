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
  IsArray,
} from 'class-validator';
import { Seating, Visibility, DepthLevel } from '@prisma/client';

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
  @IsOptional()
  seating?: Seating;

  @IsString()
  @IsNotEmpty()
  agenda: string;

  // Lecture Room specific fields
  @IsString()
  @IsOptional()
  speaker?: string;

  @IsString()
  @IsOptional()
  topic?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  partners?: string[];

  @IsEnum(DepthLevel)
  @IsOptional()
  depthLevel?: DepthLevel;

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
