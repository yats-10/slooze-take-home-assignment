import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from './entities/payment-method.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentsRepo: Repository<PaymentMethod>,
  ) {}

  async findAllByUser(userId: number): Promise<PaymentMethod[]> {
    return this.paymentsRepo.find({ where: { userId } });
  }

  async create(
    userId: number,
    data: Partial<PaymentMethod>,
  ): Promise<PaymentMethod> {
    const pm = this.paymentsRepo.create({ ...data, userId });
    return this.paymentsRepo.save(pm);
  }

  async update(
    id: number,
    data: Partial<PaymentMethod>,
  ): Promise<PaymentMethod> {
    const pm = await this.paymentsRepo.findOne({ where: { id } });
    if (!pm) {
      throw new NotFoundException(`Payment method #${id} not found`);
    }
    Object.assign(pm, data);
    return this.paymentsRepo.save(pm);
  }

  async remove(id: number): Promise<void> {
    const pm = await this.paymentsRepo.findOne({ where: { id } });
    if (!pm) {
      throw new NotFoundException(`Payment method #${id} not found`);
    }
    await this.paymentsRepo.remove(pm);
  }

  async setDefault(id: number, userId: number): Promise<PaymentMethod> {
    const pm = await this.paymentsRepo.findOne({ where: { id, userId } });
    if (!pm) {
      throw new NotFoundException(`Payment method #${id} not found`);
    }

    const isCurrentlyDefault = pm.isDefault;

    // Clear default on all methods for this user
    await this.paymentsRepo.update({ userId }, { isDefault: false });

    // Toggle: if it wasn't default, mark it; if it was, leave it unset
    if (!isCurrentlyDefault) {
      pm.isDefault = true;
      await this.paymentsRepo.save(pm);
    } else {
      pm.isDefault = false;
    }

    return pm;
  }

  async count(): Promise<number> {
    return this.paymentsRepo.count();
  }
}
