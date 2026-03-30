import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, MenuItem } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="row">
      <div class="col-md-8">
        <h2>Menu</h2>
        <table class="table">
          <thead>
            <tr><th>Item</th><th>Price</th><th>Action</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of menuItems">
              <td>{{ item.name }}</td>
              <td>{{ item.price }}</td>
              <td>
                <button class="btn btn-sm btn-success" (click)="addToCart(item)">Add to Cart</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5>Cart</h5>
            <div *ngIf="cart.length === 0" class="text-muted">Cart is empty</div>
            <ul class="list-group list-group-flush" *ngIf="cart.length > 0">
              <li class="list-group-item d-flex justify-content-between" *ngFor="let c of cart">
                <span>{{ c.menuItem.name }} x{{ c.quantity }}</span>
                <span>{{ c.menuItem.price * c.quantity }}</span>
              </li>
            </ul>
            <hr *ngIf="cart.length > 0">
            <div *ngIf="cart.length > 0">
              <strong>Total: {{ getTotal() }}</strong>
              <div class="mt-2">
                <button class="btn btn-primary btn-sm w-100" (click)="placeOrder()" [disabled]="ordering">
                  {{ ordering ? 'Placing...' : 'Create & Checkout Order' }}
                </button>
                <button *ngIf="canCheckout()" class="btn btn-outline-secondary btn-sm w-100 mt-1" (click)="createOnly()" [disabled]="ordering">
                  Create Order Only
                </button>
              </div>
            </div>
            <div *ngIf="message" class="alert alert-info mt-2">{{ message }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RestaurantDetailComponent implements OnInit {
  menuItems: MenuItem[] = [];
  cart: CartItem[] = [];
  restaurantId = 0;
  ordering = false;
  message = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private auth: AuthService,
  ) {}

  ngOnInit() {
    this.restaurantId = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getMenu(this.restaurantId).subscribe((data) => (this.menuItems = data));
  }

  addToCart(item: MenuItem) {
    const existing = this.cart.find((c) => c.menuItem.id === item.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.cart.push({ menuItem: item, quantity: 1 });
    }
  }

  getTotal(): number {
    return this.cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);
  }

  canCheckout(): boolean {
    const role = this.auth.getRole();
    return role === 'ADMIN' || role === 'MANAGER';
  }

  placeOrder() {
    this.ordering = true;
    this.message = '';
    this.api.createOrder(this.restaurantId).subscribe({
      next: (order) => {
        const items = this.cart.map((c) => ({ menuItemId: c.menuItem.id, quantity: c.quantity }));
        this.api.addOrderItems(order.id, items).subscribe({
          next: () => {
            if (this.canCheckout()) {
              this.api.checkoutOrder(order.id).subscribe({
                next: () => {
                  this.message = 'Order placed successfully!';
                  this.cart = [];
                  this.ordering = false;
                },
                error: (err) => {
                  const msg = err?.error?.message || 'Checkout failed.';
                  this.message = `Order created but checkout failed: ${msg}`;
                  this.ordering = false;
                },
              });
            } else {
              this.message = 'Order created (pending checkout by manager).';
              this.cart = [];
              this.ordering = false;
            }
          },
          error: () => {
            this.message = 'Failed to add items to order.';
            this.ordering = false;
          },
        });
      },
      error: () => {
        this.message = 'Failed to create order.';
        this.ordering = false;
      },
    });
  }

  createOnly() {
    this.ordering = true;
    this.message = '';
    this.api.createOrder(this.restaurantId).subscribe({
      next: (order) => {
        const items = this.cart.map((c) => ({ menuItemId: c.menuItem.id, quantity: c.quantity }));
        this.api.addOrderItems(order.id, items).subscribe({
          next: () => {
            this.message = `Order #${order.id} created (PENDING).`;
            this.cart = [];
            this.ordering = false;
          },
          error: () => {
            this.message = 'Failed to add items.';
            this.ordering = false;
          },
        });
      },
      error: () => {
        this.message = 'Failed to create order.';
        this.ordering = false;
      },
    });
  }
}
