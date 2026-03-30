import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <nav class="navbar navbar-expand navbar-dark bg-dark" *ngIf="auth.isLoggedIn()">
      <div class="container">
        <a class="navbar-brand" routerLink="/restaurants">Slooze Food</a>
        <div class="navbar-nav me-auto">
          <a class="nav-link" routerLink="/restaurants">Restaurants</a>
          <a class="nav-link" routerLink="/orders">Orders</a>
          <a class="nav-link" routerLink="/payments" *ngIf="auth.getRole() === 'ADMIN'">Payments</a>
        </div>
        <div class="navbar-nav">
          <span class="nav-link text-light">{{ auth.getUserName() }} ({{ auth.getRole() }} - {{ auth.getCountry() }})</span>
          <a class="nav-link" href="#" (click)="logout($event)">Logout</a>
        </div>
      </div>
    </nav>
    <div class="container mt-3">
      <router-outlet></router-outlet>
    </div>
  `,
})
export class AppComponent {
  constructor(public auth: AuthService, private router: Router) {}

  logout(e: Event) {
    e.preventDefault();
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
