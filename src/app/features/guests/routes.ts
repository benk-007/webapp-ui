import { Routes } from "@angular/router";
import {GuestEditComponent} from "./pages/guest-edit/guest-edit.component";

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
      {
        path: ':id',
        loadComponent: () => import('./pages/guest-edit/guest-edit.component').then(m => m.GuestEditComponent),
        data: {
          title: 'Edit Guest'
        }
      }
    ]
  }
];
