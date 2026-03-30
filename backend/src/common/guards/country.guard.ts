import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Role, Country } from '../enums';

@Injectable()
export class CountryGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Admins are unrestricted
    if (user.role === Role.ADMIN) {
      return true;
    }

    // For MANAGER and MEMBER, attach country filter to request
    // Controllers will use request.userCountry to filter data
    request.userCountry = user.country as Country;
    return true;
  }
}
