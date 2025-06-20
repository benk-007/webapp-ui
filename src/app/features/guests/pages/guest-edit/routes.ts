import { Routes } from '@angular/router';
import {DocumentsComponent} from "./documents/documents-list/documents.component";
import {DocumentsEditComponent} from "./documents/documents-edit/documents-edit.component";

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./guest-edit.component').then((m) => m.GuestEditComponent),
    data: { title: 'Edit Guest' },
    children: [
      {
        path: '',
        redirectTo: 'reservations',
        pathMatch: 'full',
      },
      {
        path: 'reservations',
        loadComponent: () =>
          import('./reservations/reservations.component').then(
            (m) => m.ReservationsComponent
          ),
        data: {
          title: 'Reservations',
        },
      },
      {
        path: 'documents',
        loadComponent: () =>
          import('./documents/documents-list/documents.component').then(
            (m) => m.DocumentsComponent
          ),
        data: {
          title: 'Documents',
        },
      },
      {
        path: 'documents',
        children: [
          {
            path: '',
            component: DocumentsComponent
          },
          {
            path: ':documentId',
            component: DocumentsEditComponent
          }
        ]
      }
    ],
  },
];
