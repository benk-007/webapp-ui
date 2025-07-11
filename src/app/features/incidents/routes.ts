import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Incidents'
    },
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        loadComponent: () => import('./pages/incident-list/incident-list.component').then(m => m.IncidentListComponent),
        data: {
          title: 'List'
        }
      },
      {
        path: ':id',
        loadChildren: () => import('./pages/incident-edit/routes').then((m) => m.routes)
      }
    ]
  }
];
