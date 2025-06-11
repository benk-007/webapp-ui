import {Routes} from "@angular/router";

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Edit rental'
    },
    loadComponent: () => import('./edit-unit.component').then(m => m.EditUnitComponent),
    children: [
      {
        path: '',
        redirectTo: 'infos',
        pathMatch: 'full',
      },
      {
        path: 'infos',
        loadComponent: () => import('./general-information/general-information.component').then(m => m.GeneralInformationComponent),
        data: {
          title: 'General information'
        }
      },
      {
        path: 'details',
        loadComponent: () => import('./rental-details/rental-details.component').then(m => m.RentalDetailsComponent),
        data: {
          title: 'Rental details'
        }
      },
      {
        path: 'checkin-policy',
        loadComponent: () => import('./rental-checkin/rental-checkin.component').then(m => m.RentalCheckinComponent),
        data: {
          title: 'Rental checkin'
        }
      }
    ]
  }
]
