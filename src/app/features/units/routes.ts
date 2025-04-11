import {Routes} from "@angular/router";

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Units'
    },
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        loadComponent: () => import('./pages/unit-list/unit-list.component').then(m => m.UnitListComponent),
        data: {
          title: 'List'
        }
      }
    ]
  }
]
