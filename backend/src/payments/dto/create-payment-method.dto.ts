import { IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { PaymentType } from '../../common/enums';

export class CreatePaymentMethodDto {
  @IsEnum(PaymentType)
  type!: PaymentType;

  @IsOptional()
  details?: any;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
