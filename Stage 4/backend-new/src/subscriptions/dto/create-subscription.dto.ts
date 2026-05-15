import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
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

  @IsIn(['monthly', 'quarterly', 'semi_annual', 'yearly'])
  billingCycle:  'monthly' | 'quarterly' | 'semi_annual' | 'yearly';

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
