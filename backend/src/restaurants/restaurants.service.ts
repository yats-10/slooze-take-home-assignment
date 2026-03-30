import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { MenuItem } from '../menu-items/entities/menu-item.entity';
import { Country } from '../common/enums';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantsRepo: Repository<Restaurant>,
    @InjectRepository(MenuItem)
    private readonly menuItemsRepo: Repository<MenuItem>,
  ) {}

  async findAll(country?: Country): Promise<Restaurant[]> {
    if (country) {
      return this.restaurantsRepo.find({ where: { country } });
    }
    return this.restaurantsRepo.find();
  }

  async findById(id: number): Promise<Restaurant> {
    const restaurant = await this.restaurantsRepo.findOne({ where: { id } });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant #${id} not found`);
    }
    return restaurant;
  }

  async getMenu(restaurantId: number): Promise<MenuItem[]> {
    const restaurant = await this.restaurantsRepo.findOne({
      where: { id: restaurantId },
    });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant #${restaurantId} not found`);
    }
    return this.menuItemsRepo.find({ where: { restaurantId } });
  }
}
