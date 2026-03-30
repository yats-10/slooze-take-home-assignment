import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Order } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container py-4">
      <h4 class="fw-bold mb-4">📦 Your Orders</h4>
      <div *ngIf="orders.length === 0" class="text-muted">No orders found.</div>

      <div class="card mb-3" *ngFor="let order of orders">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="fw-semibold mb-0">Order #{{ order.id }}</h6>
              <small class="text-muted">{{ order.restaurant?.name || 'Restaurant #' + order.restaurantId }}</small>
            </div>
            <span class="badge" [ngClass]="{
              'bg-warning text-dark': order.status === 'PENDING',
              'bg-success': order.status === 'PLACED',
              'bg-danger': order.status === 'CANCELLED'
            }">{{ order.status }}</span>
          </div>

          <hr class="my-2">

          <div *ngIf="order.items && order.items.length > 0" class="mb-2">
            <small *ngFor="let item of order.items" class="d-block text-muted">
              {{ item.menuItem?.name || 'Item #' + item.menuItemId }} &times;{{ item.quantity }}
              <span class="float-end">{{ item.price | currency }}</span>
            </small>
          </div>

          <div class="d-flex justify-content-between align-items-center">
            <strong>Total: {{ order.totalAmount | currency }}</strong>
            <small class="text-muted">{{ order.createdAt | date:'short' }}</small>
          </div>

          <!-- Payment method (shown after checkout) -->
          <div *ngIf="order.status === 'PLACED' && order.paymentMethod" class="mt-2 p-2 bg-light rounded small">
            <span class="text-success fw-semibold">✅ Paid via</span>
            <span class="badge bg-secondary ms-1">{{ order.paymentMethod.type }}</span>
            <ng-container *ngIf="order.paymentMethod.type === 'CARD'">
              &bull;&bull;&bull;&bull; {{ order.paymentMethod.details?.last4 }}
              <span *ngIf="order.paymentMethod.details?.brand" class="ms-1 text-muted">({{ order.paymentMethod.details.brand }})</span>
            </ng-container>
            <ng-container *ngIf="order.paymentMethod.type === 'UPI'">
              {{ order.paymentMethod.details?.upiId }}
            </ng-container>
            <ng-container *ngIf="order.paymentMethod.type === 'WALLET'">
              {{ order.paymentMethod.details?.provider }}
            </ng-container>
          </div>

          <div class="mt-2" *ngIf="canManageOrders() && order.status === 'PENDING'">
            <button class="btn btn-success btn-sm me-2" (click)="checkout(order)">Checkout</button>
            <button class="btn btn-outline-danger btn-sm" (click)="cancel(order)">Cancel</button>
          </div>
          <div *ngIf="errorMap[order.id]" class="alert alert-danger mt-2 py-1 small">{{ errorMap[order.id] }}</div>
        </div>
      </div>
    </div>
  `,
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  errorMap: Record<number, string> = {};

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.api.getOrders().subscribe((data) => (this.orders = data));
  }

  canManageOrders(): boolean {
    const role = this.auth.getRole();
    return role === 'ADMIN' || role === 'MANAGER';
  }

  checkout(order: Order) {
    delete this.errorMap[order.id];
    this.api.checkoutOrder(order.id).subscribe({
      next: () => this.loadOrders(),
      error: (err) => {
        this.errorMap[order.id] =
          err?.error?.message || 'Checkout failed. Make sure you have a default payment method.';
      },
    });
  }

  cancel(order: Order) {
    this.api.cancelOrder(order.id).subscribe(() => this.loadOrders());
  }
}
