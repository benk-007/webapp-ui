import {Routes} from "@angular/router";

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Calendars'
    },
    children: [
      {
        path: '',
        redirectTo: 'multi',
        pathMatch: 'full',
      },
      {
        path: 'multi',
        loadComponent: () => import('./pages/multi/multi.component').then(m => m.MultiComponent),
        data: {
          title: 'List'
        }
      }
    ]
  }
]
