import { Routes } from "@angular/router";
import {AvailabilityListComponent} from "./pages/availability-list/availability-list.component";
import {BookingComponent} from "./pages/booking/booking.component";

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Availability'
    },
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        loadComponent: () => import('./pages/availability-list/availability-list.component').then(m => m.AvailabilityListComponent),
        data: {
          title: 'List'
        }
      },
      {
        path: 'booking',
        loadComponent: () => import('./pages/booking/booking.component').then(m => m.BookingComponent),
        data: {
          title: 'Booking'
        }
      }
    ]
  }
];
