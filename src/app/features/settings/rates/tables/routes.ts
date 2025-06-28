import { Routes } from "@angular/router";
import {TableListComponent} from "./pages/table-list/table-list.component";

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Tables'
    },
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        loadComponent: () => import('./pages/table-list/table-list.component').then(m => m.TableListComponent),
        data: {
          title: 'List'
        }
      }
    ]
  }
];
