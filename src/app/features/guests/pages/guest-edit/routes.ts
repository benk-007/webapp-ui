import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./guest-edit.component').then((m) => m.GuestEditComponent),
    data: {title: 'Edit Guest'},
    children: [
      {
        path: '',
        redirectTo: 'identity-documents',
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
        path: 'identity-documents',
        loadComponent: () =>
          import('./identity-document-list/identity-document-list.component').then(
            (m) => m.IdentityDocumentListComponent
          ),
        data: {
          title: 'Documents',
        },
      }
    ],
  },
];
