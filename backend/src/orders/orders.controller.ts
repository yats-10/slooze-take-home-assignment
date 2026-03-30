import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
  ParseIntPipe,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CountryGuard } from '../common/guards/country.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, Country } from '../common/enums';
import { CreateOrderDto } from './dto/create-order.dto';
import { AddOrderItemsDto } from './dto/add-order-items.dto';
import { Request } from 'express';

interface AuthRequest extends Request {
  user: { userId: number; role: Role; country: Country };
  userCountry?: Country;
}

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard, CountryGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
  async create(@Body() dto: CreateOrderDto, @Req() req: AuthRequest) {
    return this.ordersService.create(req.user.userId, dto.restaurantId);
  }

  @Post(':id/items')
  @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
  async addItems(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddOrderItemsDto,
    @Req() req: AuthRequest,
  ) {
    return this.ordersService.addItems(id, dto.items, req.user.userId);
  }

  @Post(':id/checkout')
  @Roles(Role.ADMIN, Role.MANAGER)
  async checkout(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    await this.ensureCountryAccess(id, req);
    return this.ordersService.checkout(id, req.user.userId);
  }

  @Patch(':id/cancel')
  @Roles(Role.ADMIN, Role.MANAGER)
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    await this.ensureCountryAccess(id, req);
    return this.ordersService.cancel(id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
  async findAll(@Req() req: AuthRequest) {
    return this.ordersService.findAll(req.user.userId, req.userCountry);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    const order = await this.ordersService.findOne(id);
    if (req.userCountry && order.restaurant?.country !== req.userCountry) {
      throw new ForbiddenException(
        'You can only access orders in your country',
      );
    }
    return order;
  }

  private async ensureCountryAccess(
    orderId: number,
    req: AuthRequest,
  ): Promise<void> {
    if (req.userCountry) {
      const order =
        await this.ordersService.getOrderWithRestaurant(orderId);
      if (order.restaurant?.country !== req.userCountry) {
        throw new ForbiddenException(
          'You can only manage orders in your country',
        );
      }
    }
  }
}
