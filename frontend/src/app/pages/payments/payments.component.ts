import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, PaymentMethod } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container py-4">
      <h4 class="fw-bold mb-4">💳 Payment Methods</h4>

      <div *ngIf="payments.length === 0" class="text-muted">No payment methods found.</div>

      <div class="row g-3 mb-4">
        <div class="col-md-6" *ngFor="let pm of payments">
          <div class="card h-100" [class.border-success]="pm.isDefault">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <span class="badge bg-secondary me-2">{{ pm.type }}</span>
                  <span *ngIf="pm.isDefault" class="badge bg-success">⭐ Default</span>
                </div>
                <div class="d-flex gap-2">
                  <button
                    class="btn btn-sm"
                    [class.btn-outline-success]="!pm.isDefault"
                    [class.btn-outline-secondary]="pm.isDefault"
                    (click)="toggleDefault(pm.id)"
                    [title]="pm.isDefault ? 'Unset default' : 'Set as default'"
                  >
                    {{ pm.isDefault ? '★ Unset' : '☆ Set Default' }}
                  </button>
                  <button *ngIf="isAdmin" class="btn btn-sm btn-outline-danger" (click)="remove(pm.id)">✕</button>
                </div>
              </div>
              <hr class="my-2">
              <div *ngIf="pm.type === 'CARD'" class="small">
                <span class="text-muted">Card:</span>
                {{ pm.details?.brand || '—' }} •••• {{ pm.details?.last4 || '—' }}
                <span *ngIf="pm.details?.expiry" class="ms-2 text-muted">exp {{ pm.details.expiry }}</span>
              </div>
              <div *ngIf="pm.type === 'UPI'" class="small">
                <span class="text-muted">UPI ID:</span> {{ pm.details?.upiId || '—' }}
              </div>
              <div *ngIf="pm.type === 'WALLET'" class="small">
                <span class="text-muted">{{ pm.details?.provider || 'Wallet' }}:</span> {{ pm.details?.phone || '—' }}
              </div>
              <div *ngIf="pm.type !== 'CARD' && pm.type !== 'UPI' && pm.type !== 'WALLET'" class="small text-muted">
                {{ pm.details | json }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add form — ADMIN only -->
      <div *ngIf="isAdmin" class="card">
        <div class="card-body">
          <h6 class="fw-semibold mb-3">Add New Payment Method</h6>
          <form (ngSubmit)="add()">
            <div class="mb-3">
              <label class="form-label small">Type</label>
              <select class="form-select form-select-sm" [(ngModel)]="newType" name="type" (ngModelChange)="onTypeChange()">
                <option value="CARD">CARD</option>
                <option value="UPI">UPI</option>
                <option value="WALLET">WALLET</option>
              </select>
            </div>

            <!-- CARD fields -->
            <ng-container *ngIf="newType === 'CARD'">
              <div class="row g-2 mb-3">
                <div class="col">
                  <input class="form-control form-control-sm" placeholder="Last 4 digits" [(ngModel)]="card.last4" name="last4" maxlength="4">
                </div>
                <div class="col">
                  <input class="form-control form-control-sm" placeholder="Brand (Visa, Mastercard…)" [(ngModel)]="card.brand" name="brand">
                </div>
                <div class="col">
                  <input class="form-control form-control-sm" placeholder="Expiry (MM/YY)" [(ngModel)]="card.expiry" name="expiry">
                </div>
              </div>
            </ng-container>

            <!-- UPI fields -->
            <ng-container *ngIf="newType === 'UPI'">
              <div class="mb-3">
                <input class="form-control form-control-sm" placeholder="UPI ID (e.g. user@upi)" [(ngModel)]="upi.upiId" name="upiId">
              </div>
            </ng-container>

            <!-- WALLET fields -->
            <ng-container *ngIf="newType === 'WALLET'">
              <div class="row g-2 mb-3">
                <div class="col">
                  <input class="form-control form-control-sm" placeholder="Provider (PayTM, PhonePe…)" [(ngModel)]="wallet.provider" name="provider">
                </div>
                <div class="col">
                  <input class="form-control form-control-sm" placeholder="Phone number" [(ngModel)]="wallet.phone" name="phone">
                </div>
              </div>
            </ng-container>

            <div class="form-check mb-3">
              <input class="form-check-input" type="checkbox" [(ngModel)]="newIsDefault" name="isDefault" id="isDefaultCheck">
              <label class="form-check-label small" for="isDefaultCheck">Set as default</label>
            </div>

            <button type="submit" class="btn btn-primary btn-sm">Add Method</button>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class PaymentsComponent implements OnInit {
  payments: PaymentMethod[] = [];
  isAdmin = false;

  newType = 'CARD';
  newIsDefault = false;
  card = { last4: '', brand: '', expiry: '' };
  upi = { upiId: '' };
  wallet = { provider: '', phone: '' };

  constructor(
    private api: ApiService,
    public auth: AuthService,
  ) {}

  ngOnInit() {
    this.isAdmin = this.auth.getRole() === 'ADMIN';
    this.load();
  }

  load() {
    this.api.getPaymentMethods().subscribe((data) => (this.payments = data));
  }

  onTypeChange() {
    this.card = { last4: '', brand: '', expiry: '' };
    this.upi = { upiId: '' };
    this.wallet = { provider: '', phone: '' };
  }

  toggleDefault(id: number) {
    this.api.setDefaultPaymentMethod(id).subscribe(() => this.load());
  }

  add() {
    let details: any;
    if (this.newType === 'CARD') {
      details = { ...this.card };
    } else if (this.newType === 'UPI') {
      details = { ...this.upi };
    } else {
      details = { ...this.wallet };
    }
    this.api
      .addPaymentMethod({ type: this.newType, details, isDefault: this.newIsDefault })
      .subscribe(() => {
        this.onTypeChange();
        this.newIsDefault = false;
        this.load();
      });
  }

  remove(id: number) {
    this.api.deletePaymentMethod(id).subscribe(() => this.load());
  }
}
