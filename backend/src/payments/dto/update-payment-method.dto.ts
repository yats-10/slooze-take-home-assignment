import { IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { PaymentType } from '../../common/enums';

export class UpdatePaymentMethodDto {
  @IsEnum(PaymentType)
  @IsOptional()
  type?: PaymentType;

  @IsOptional()
  details?: any;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
