import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Role, Country } from '../../common/enums';
import { Order } from '../../orders/entities/order.entity';
import { PaymentMethod } from '../../payments/entities/payment-method.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ type: 'varchar' })
  role!: Role;

  @Column({ type: 'varchar' })
  country!: Country;

  @OneToMany(() => Order, (order) => order.user)
  orders!: Order[];

  @OneToMany(() => PaymentMethod, (pm) => pm.user)
  paymentMethods!: PaymentMethod[];
}
