import {Routes} from "@angular/router";
import {RentalInstructionsComponent} from "./rental-instructions/rental-instructions.component";

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
        path: 'instructions',
        loadComponent: () => import('./rental-instructions/rental-instructions.component').then(m => m.RentalInstructionsComponent),
        data: {
          title: 'Rental instructions'
        }
      }
    ]
  }
]
