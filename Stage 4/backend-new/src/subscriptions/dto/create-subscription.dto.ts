import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsBoolean,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  providerId?: number;

  @IsDateString()
  renewalDate: string;

  @IsIn(['monthly', 'quarterly', 'semi_annual', 'yearly', 'weekly'])
  billingCycle: 'monthly' | 'quarterly' | 'semi_annual' | 'yearly' | 'weekly';

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
