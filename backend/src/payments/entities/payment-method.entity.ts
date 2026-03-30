import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PaymentType } from '../../common/enums';
import { User } from '../../users/entities/user.entity';

@Entity('payment_methods')
export class PaymentMethod {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column({ type: 'varchar' })
  type!: PaymentType;

  @Column({ type: 'simple-json', nullable: true })
  details!: any;

  @Column({ default: false })
  isDefault!: boolean;

  @ManyToOne(() => User, (user) => user.paymentMethods)
  @JoinColumn({ name: 'userId' })
  user!: User;
}
