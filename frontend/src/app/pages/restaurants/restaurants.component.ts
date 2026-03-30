import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, Restaurant } from '../../services/api.service';

@Component({
  selector: 'app-restaurants',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <h2>Restaurants</h2>
    <div class="row">
      <div class="col-md-6" *ngFor="let r of restaurants">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">{{ r.name }}</h5>
            <p class="card-text">
              <span class="badge bg-info me-2">{{ r.cuisine }}</span>
              <span class="badge bg-secondary">{{ r.country }}</span>
            </p>
            <a [routerLink]="['/restaurants', r.id]" class="btn btn-primary btn-sm">View Menu</a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RestaurantsComponent implements OnInit {
  restaurants: Restaurant[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getRestaurants().subscribe((data) => (this.restaurants = data));
  }
}
