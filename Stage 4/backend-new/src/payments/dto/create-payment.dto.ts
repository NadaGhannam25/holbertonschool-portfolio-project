import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePaymentDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  paymentDate: string;

  @IsIn(['paid', 'upcoming'])
  status: 'paid' | 'upcoming';

  @IsOptional()
  @IsString()
  notes?: string;
}
