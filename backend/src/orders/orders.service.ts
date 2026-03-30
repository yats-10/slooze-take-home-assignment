import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { MenuItem } from '../menu-items/entities/menu-item.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { PaymentMethod } from '../payments/entities/payment-method.entity';
import { OrderStatus, Country } from '../common/enums';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepo: Repository<OrderItem>,
    @InjectRepository(MenuItem)
    private readonly menuItemsRepo: Repository<MenuItem>,
    @InjectRepository(Restaurant)
    private readonly restaurantsRepo: Repository<Restaurant>,
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodsRepo: Repository<PaymentMethod>,
  ) {}

  async create(userId: number, restaurantId: number): Promise<Order> {
    const restaurant = await this.restaurantsRepo.findOne({
      where: { id: restaurantId },
    });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant #${restaurantId} not found`);
    }

    const order = this.ordersRepo.create({
      userId,
      restaurantId,
      status: OrderStatus.PENDING,
      totalAmount: 0,
    });
    return this.ordersRepo.save(order);
  }

  async addItems(
    orderId: number,
    items: { menuItemId: number; quantity: number }[],
    userId: number,
  ): Promise<Order> {
    const order = await this.ordersRepo.findOne({
      where: { id: orderId },
      relations: ['items'],
    });
    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }
    if (order.userId !== userId) {
      throw new ForbiddenException('You can only modify your own orders');
    }
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Can only add items to PENDING orders');
    }

    let addedTotal = 0;
    const orderItems: OrderItem[] = [];

    for (const item of items) {
      const menuItem = await this.menuItemsRepo.findOne({
        where: { id: item.menuItemId },
      });
      if (!menuItem) {
        throw new NotFoundException(`Menu item #${item.menuItemId} not found`);
      }
      if (menuItem.restaurantId !== order.restaurantId) {
        throw new BadRequestException(
          `Menu item #${item.menuItemId} does not belong to this restaurant`,
        );
      }

      const orderItem = this.orderItemsRepo.create({
        orderId,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.price * item.quantity,
      });
      orderItems.push(orderItem);
      addedTotal += menuItem.price * item.quantity;
    }

    await this.orderItemsRepo.save(orderItems);
    const updatedOrder = await this.ordersRepo.findOne({ where: { id: orderId } });
    updatedOrder!.totalAmount = Number(updatedOrder!.totalAmount) + addedTotal;
    return this.ordersRepo.save(updatedOrder!);
  }

  async checkout(orderId: number, userId: number): Promise<Order> {
    const order = await this.ordersRepo.findOne({
      where: { id: orderId },
      relations: ['items'],
    });
    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only PENDING orders can be checked out');
    }
    if (!order.items || order.items.length === 0) {
      throw new BadRequestException('Cannot checkout an empty order');
    }

    const defaultPayment = await this.paymentMethodsRepo.findOne({
      where: { userId, isDefault: true },
    });
    if (!defaultPayment) {
      throw new BadRequestException(
        'No default payment method set. Please set a default payment method before checking out.',
      );
    }

    order.status = OrderStatus.PLACED;
    order.paymentMethodId = defaultPayment.id;
    return this.ordersRepo.save(order);
  }

  async cancel(orderId: number): Promise<Order> {
    const order = await this.ordersRepo.findOne({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    order.status = OrderStatus.CANCELLED;
    return this.ordersRepo.save(order);
  }

  async findAll(userId: number, country?: Country): Promise<Order[]> {
    const query = this.ordersRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.menuItem', 'menuItem')
      .leftJoinAndSelect('order.restaurant', 'restaurant')
      .leftJoinAndSelect('order.paymentMethod', 'paymentMethod');

    if (country) {
      query.where('restaurant.country = :country', { country });
    }

    return query.orderBy('order.createdAt', 'DESC').getMany();
  }

  async findOne(orderId: number): Promise<Order> {
    const order = await this.ordersRepo.findOne({
      where: { id: orderId },
      relations: ['items', 'items.menuItem', 'restaurant', 'paymentMethod'],
    });
    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }
    return order;
  }

  async getOrderWithRestaurant(orderId: number): Promise<Order> {
    const order = await this.ordersRepo.findOne({
      where: { id: orderId },
      relations: ['restaurant'],
    });
    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }
    return order;
  }
}
