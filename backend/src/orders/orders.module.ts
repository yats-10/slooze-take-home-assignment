import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { MenuItem } from '../menu-items/entities/menu-item.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { PaymentMethod } from '../payments/entities/payment-method.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, MenuItem, Restaurant, PaymentMethod])],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
