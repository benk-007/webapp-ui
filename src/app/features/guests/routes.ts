import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Guests'
    },
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        loadComponent: () => import('./pages/guest-list/guest-list.component').then(m => m.GuestListComponent),
        data: {
          title: 'List'
        }
      },
    ]
  }
];
