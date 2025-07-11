import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Categories'
    },
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
      },
      {
        path: 'list',
        loadComponent: () => import('./pages/category-list/category-list.component').then(m => m.CategoryListComponent),
        data: {
          title: 'List'
        }
      }
    ]
  }
];
