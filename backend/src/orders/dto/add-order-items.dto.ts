import { IsInt, IsPositive, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AddOrderItemDto {
  @IsInt()
  @IsPositive()
  menuItemId!: number;

  @IsInt()
  @IsPositive()
  quantity!: number;
}

export class AddOrderItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddOrderItemDto)
  items!: AddOrderItemDto[];
}
