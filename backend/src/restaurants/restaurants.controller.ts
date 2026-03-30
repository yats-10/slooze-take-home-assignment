import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CountryGuard } from '../common/guards/country.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, Country } from '../common/enums';
import { Request } from 'express';

interface AuthRequest extends Request {
  user: { userId: number; role: Role; country: Country };
  userCountry?: Country;
}

@Controller('restaurants')
@UseGuards(JwtAuthGuard, RolesGuard, CountryGuard)
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
  async findAll(@Req() req: AuthRequest) {
    return this.restaurantsService.findAll(req.userCountry);
  }

  @Get(':id/menu')
  @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
  async getMenu(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthRequest,
  ) {
    // Country check: ensure restaurant belongs to user's country
    if (req.userCountry) {
      const restaurant = await this.restaurantsService.findById(id);
      if (restaurant.country !== req.userCountry) {
        throw new ForbiddenException(
          'You can only access restaurants in your country',
        );
      }
    }
    return this.restaurantsService.getMenu(id);
  }
}
