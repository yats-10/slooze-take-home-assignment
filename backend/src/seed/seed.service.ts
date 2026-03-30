import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { MenuItem } from '../menu-items/entities/menu-item.entity';
import { PaymentMethod } from '../payments/entities/payment-method.entity';
import { Role, Country, PaymentType } from '../common/enums';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(Restaurant)
    private readonly restaurantsRepo: Repository<Restaurant>,
    @InjectRepository(MenuItem)
    private readonly menuItemsRepo: Repository<MenuItem>,
    @InjectRepository(PaymentMethod)
    private readonly paymentsRepo: Repository<PaymentMethod>,
  ) {}

  async onModuleInit() {
    const userCount = await this.usersRepo.count();
    if (userCount > 0) {
      this.logger.log('Database already seeded, skipping...');
      return;
    }

    this.logger.log('Seeding database...');
    await this.seedUsers();
    await this.seedRestaurants();
    await this.seedPaymentMethods();
    this.logger.log('Database seeded successfully!');
  }

  private async seedUsers() {
    const users = [
      {
        name: 'Nick Fury',
        email: 'nick@slooze.com',
        password: 'nick',
        role: Role.ADMIN,
        country: Country.AMERICA,
      },
      {
        name: 'Captain Marvel',
        email: 'marvel@slooze.com',
        password: 'marvel',
        role: Role.MANAGER,
        country: Country.INDIA,
      },
      {
        name: 'Captain America',
        email: 'america@slooze.com',
        password: 'america',
        role: Role.MANAGER,
        country: Country.AMERICA,
      },
      {
        name: 'Thanos',
        email: 'thanos@slooze.com',
        password: 'thanos',
        role: Role.MEMBER,
        country: Country.INDIA,
      },
      {
        name: 'Thor',
        email: 'thor@slooze.com',
        password: 'thor',
        role: Role.MEMBER,
        country: Country.INDIA,
      },
      {
        name: 'Travis',
        email: 'travis@slooze.com',
        password: 'travis',
        role: Role.MEMBER,
        country: Country.AMERICA,
      },
    ];

    for (const u of users) {
      const hashed = await bcrypt.hash(u.password, 10);
      await this.usersRepo.save(
        this.usersRepo.create({ ...u, password: hashed }),
      );
    }
    this.logger.log(`Seeded ${users.length} users`);
  }

  private async seedRestaurants() {
    const restaurants = [
      // India restaurants
      {
        name: 'Taj Mahal Kitchen',
        country: Country.INDIA,
        cuisine: 'Indian',
        items: [
          { name: 'Butter Chicken', price: 350 },
          { name: 'Biryani', price: 250 },
          { name: 'Paneer Tikka', price: 200 },
          { name: 'Naan Bread', price: 50 },
          { name: 'Gulab Jamun', price: 100 },
        ],
      },
      {
        name: 'Spice Garden',
        country: Country.INDIA,
        cuisine: 'South Indian',
        items: [
          { name: 'Masala Dosa', price: 120 },
          { name: 'Idli Sambar', price: 80 },
          { name: 'Vada', price: 60 },
          { name: 'Uttapam', price: 100 },
          { name: 'Filter Coffee', price: 40 },
        ],
      },
      // America restaurants
      {
        name: 'Liberty Burgers',
        country: Country.AMERICA,
        cuisine: 'American',
        items: [
          { name: 'Classic Burger', price: 12 },
          { name: 'Cheese Fries', price: 8 },
          { name: 'Milkshake', price: 6 },
          { name: 'Hot Dog', price: 10 },
          { name: 'Apple Pie', price: 7 },
        ],
      },
      {
        name: 'Eagle Pizza',
        country: Country.AMERICA,
        cuisine: 'Italian-American',
        items: [
          { name: 'Pepperoni Pizza', price: 15 },
          { name: 'Margherita Pizza', price: 13 },
          { name: 'Garlic Bread', price: 5 },
          { name: 'Caesar Salad', price: 9 },
          { name: 'Tiramisu', price: 8 },
        ],
      },
    ];

    for (const r of restaurants) {
      const restaurant = await this.restaurantsRepo.save(
        this.restaurantsRepo.create({
          name: r.name,
          country: r.country,
          cuisine: r.cuisine,
        }),
      );
      for (const item of r.items) {
        await this.menuItemsRepo.save(
          this.menuItemsRepo.create({
            ...item,
            restaurantId: restaurant.id,
          }),
        );
      }
    }
    this.logger.log('Seeded 4 restaurants with menu items');
  }

  private async seedPaymentMethods() {
    const users = await this.usersRepo.find();
    for (const user of users) {
      await this.paymentsRepo.save(
        this.paymentsRepo.create({
          userId: user.id,
          type: PaymentType.CARD,
          details: { last4: '4242', brand: 'Visa' },
          isDefault: true,
        }),
      );
    }
    this.logger.log(`Seeded payment methods for ${users.length} users`);
  }
}
