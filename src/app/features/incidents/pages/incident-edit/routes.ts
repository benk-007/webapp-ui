import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Edit Incident'
    },
    loadComponent: () => import('./incident-edit.component').then(m => m.IncidentEditComponent),
    children: [
      {
        path: '',
        redirectTo: 'details',
        pathMatch: 'full',
      },
      {
        path: 'details',
        loadComponent: () => import('./incident-details/incident-details.component').then(m => m.IncidentDetailsComponent),
        data: {
          title: 'Details'
        }
      }
      // Onglets futurs peuvent être ajoutés ici :
      // {
      //   path: 'images',
      //   loadComponent: () => import('./incident-images/incident-images.component').then(m => m.IncidentImagesComponent),
      //   data: {
      //     title: 'Images'
      //   }
      // }
    ]
  }
];
