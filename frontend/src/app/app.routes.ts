import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'restaurants', loadComponent: () => import('./pages/restaurants/restaurants.component').then(m => m.RestaurantsComponent), canActivate: [authGuard] },
  { path: 'restaurants/:id', loadComponent: () => import('./pages/restaurant-detail/restaurant-detail.component').then(m => m.RestaurantDetailComponent), canActivate: [authGuard] },
  { path: 'orders', loadComponent: () => import('./pages/orders/orders.component').then(m => m.OrdersComponent), canActivate: [authGuard] },
  { path: 'payments', loadComponent: () => import('./pages/payments/payments.component').then(m => m.PaymentsComponent), canActivate: [authGuard] },
  { path: '', redirectTo: '/restaurants', pathMatch: 'full' },
  { path: '**', redirectTo: '/restaurants' },
];
