import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Country } from '../../common/enums';
import { MenuItem } from '../../menu-items/entities/menu-item.entity';

@Entity('restaurants')
export class Restaurant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: 'varchar' })
  country!: Country;

  @Column()
  cuisine!: string;

  @OneToMany(() => MenuItem, (item) => item.restaurant)
  menuItems!: MenuItem[];
}
