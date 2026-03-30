import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { Request } from 'express';

interface AuthRequest extends Request {
  user: { userId: number; role: Role };
}

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
  async findAll(@Req() req: AuthRequest) {
    return this.paymentsService.findAllByUser(req.user.userId);
  }

  @Post()
  @Roles(Role.ADMIN)
  async create(
    @Body() dto: CreatePaymentMethodDto,
    @Req() req: AuthRequest,
  ) {
    return this.paymentsService.create(req.user.userId, dto);
  }

  @Patch(':id/default')
  @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
  async setDefault(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    return this.paymentsService.setDefault(id, req.user.userId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePaymentMethodDto,
  ) {
    return this.paymentsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.paymentsService.remove(id);
    return { message: 'Payment method deleted' };
  }
}
