import {Routes} from "@angular/router";

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'User settings'
    },
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        loadComponent: () => import('./pages/user-list/user-list.component').then(m => m.UserListComponent),
        data: {
          title: 'List'
        }
      }
    ]
  }
]
