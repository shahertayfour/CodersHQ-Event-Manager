import { IsString, IsOptional } from 'class-validator';

export class UpdateBookingStatusDto {
  @IsString()
  @IsOptional()
  adminComment?: string;
}
