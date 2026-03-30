import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { OrderStatus } from '../../common/enums';
import { User } from '../../users/entities/user.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { OrderItem } from './order-item.entity';
import { PaymentMethod } from '../../payments/entities/payment-method.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  restaurantId!: number;

  @Column({ nullable: true })
  paymentMethodId!: number | null;

  @Column({ type: 'varchar', default: OrderStatus.PENDING })
  status!: OrderStatus;

  @Column('float', { default: 0 })
  totalAmount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: 'restaurantId' })
  restaurant!: Restaurant;

  @ManyToOne(() => PaymentMethod, { nullable: true, eager: false })
  @JoinColumn({ name: 'paymentMethodId' })
  paymentMethod!: PaymentMethod | null;

  @OneToMany(() => OrderItem, (item) => item.order)
  items!: OrderItem[];
}
