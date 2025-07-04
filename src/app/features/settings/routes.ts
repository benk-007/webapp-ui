import {Routes} from "@angular/router";

export const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Settings'
    },
    children: [
      {
        path: '',
        redirectTo: 'user-settings',
        pathMatch: 'full',
      },
      {
        path: 'user-settings',
        loadChildren: () => import('./user-settings/routes').then((m) => m.routes)
      }
    ]
  }
]
