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
      }
    ]
  }
]
