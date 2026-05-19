import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsBoolean,
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
  @Type(() => Number)
  @IsInt()
  @Min(1)
  providerId?: number;

  @IsOptional()
  @IsDateString()
  renewalDate?: string;

  @IsOptional()
  @IsIn(['monthly', 'quarterly', 'semi_annual', 'yearly', 'weekly'])
  billingCycle?: 'monthly' | 'quarterly' | 'semi_annual' | 'yearly' | 'weekly';

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';

  @IsOptional()
  @IsUrl({ require_protocol: true })
  cancelUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([1, 3, 7])
  reminderDays?: number;

  @IsOptional()
  @IsBoolean()
  remindersEnabled?: boolean;
}
