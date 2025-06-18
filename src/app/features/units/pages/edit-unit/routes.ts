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
        redirectTo: 'basic-infos',
        pathMatch: 'full',
      },
      {
        path: 'basic-infos',
        loadComponent: () => import('./general-information/general-information.component').then(m => m.GeneralInformationComponent),
        data: {
          title: 'Basic information'
        }
      },
      {
        path: 'detail-infos',
        loadComponent: () => import('./rental-details/rental-details.component').then(m => m.RentalDetailsComponent),
        data: {
          title: 'Detail information'
        }
      },
      {
        path: 'bedding-rooms',
        loadComponent: () => import('./rooms-bedding/rooms-bedding.component').then(m => m.RoomsBeddingComponent),
        data: {
          title: 'Rooms & Bedding'
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
