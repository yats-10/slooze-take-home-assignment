import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Restaurant {
  id: number;
  name: string;
  country: string;
  cuisine: string;
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  restaurantId: number;
}

export interface OrderItem {
  id: number;
  menuItemId: number;
  quantity: number;
  price: number;
  menuItem?: MenuItem;
}

export interface Order {
  id: number;
  userId: number;
  restaurantId: number;
  paymentMethodId: number | null;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
  restaurant?: Restaurant;
  paymentMethod?: PaymentMethod;
}

export interface PaymentMethod {
  id: number;
  userId: number;
  type: string;
  details: any;
  isDefault: boolean;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = '/api';

  constructor(private http: HttpClient) {}

  getRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.base}/restaurants`);
  }

  getMenu(restaurantId: number): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.base}/restaurants/${restaurantId}/menu`);
  }

  createOrder(restaurantId: number): Observable<Order> {
    return this.http.post<Order>(`${this.base}/orders`, { restaurantId });
  }

  addOrderItems(orderId: number, items: { menuItemId: number; quantity: number }[]): Observable<Order> {
    return this.http.post<Order>(`${this.base}/orders/${orderId}/items`, { items });
  }

  checkoutOrder(orderId: number): Observable<Order> {
    return this.http.post<Order>(`${this.base}/orders/${orderId}/checkout`, {});
  }

  cancelOrder(orderId: number): Observable<Order> {
    return this.http.patch<Order>(`${this.base}/orders/${orderId}/cancel`, {});
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.base}/orders`);
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.base}/orders/${id}`);
  }

  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(`${this.base}/payments`);
  }

  addPaymentMethod(data: { type: string; details?: any; isDefault?: boolean }): Observable<PaymentMethod> {
    return this.http.post<PaymentMethod>(`${this.base}/payments`, data);
  }

  updatePaymentMethod(id: number, data: Partial<PaymentMethod>): Observable<PaymentMethod> {
    return this.http.patch<PaymentMethod>(`${this.base}/payments/${id}`, data);
  }

  setDefaultPaymentMethod(id: number): Observable<PaymentMethod> {
    return this.http.patch<PaymentMethod>(`${this.base}/payments/${id}/default`, {});
  }

  deletePaymentMethod(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/payments/${id}`);
  }
}
