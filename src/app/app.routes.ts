import { Routes } from '@angular/router';
import { IsLoggedGuard } from './guards/is-logged.guard';
import { MessagesComponent } from './pages/home/sub-pages/messages/messages.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./pages/home/home.component').then(c => c.HomeComponent), canActivate: [IsLoggedGuard], children: [
    { path: 'messages/:id', component: MessagesComponent },
  ] },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(c => c.LoginComponent) },
];
