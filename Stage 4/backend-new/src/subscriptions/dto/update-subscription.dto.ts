import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number;

  @IsOptional()
  @IsDateString()
  renewalDate?: string;

  @IsOptional()
  @IsString()
  billingCycle?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';

  @IsOptional()
  @IsUrl({ require_protocol: true })
  cancelUrl?: string;
}
