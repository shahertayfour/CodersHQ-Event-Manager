import {
  IsString,
  IsEmail,
  IsInt,
  IsDateString,
  IsEnum,
  IsOptional,
  Min,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { Seating, Visibility, DepthLevel } from '@prisma/client';

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
  @IsOptional()
  seating?: Seating;

  @IsString()
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
