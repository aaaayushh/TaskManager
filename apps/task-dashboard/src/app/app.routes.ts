import { Routes } from '@angular/router';
import { LoginComponent } from '../components/login/login';
import { DashboardComponent } from '../components/dashboard/dashboard';
import { RegisterComponent } from '../components/register/register.component';

// export const routes: Routes = [
//   { path: 'login', component: LoginComponent },
//    { path: 'register', component: RegisterComponent },
//   { path: 'dashboard', component: DashboardComponent },
//   { path: '', redirectTo: '/login', pathMatch: 'full' },
//   { path: '**', redirectTo: '/login' }
// ];


export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('../components/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('../components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('../components/dashboard/dashboard').then(m => m.DashboardComponent)
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

