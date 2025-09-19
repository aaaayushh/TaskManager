// apps/task-dashboard/src/app/services/auth.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient); // inject() function replaces constructor injection

  private apiUrl = 'http://localhost:3000/api/auth/login';

  login(username: string, password: string) {
   return this.http.post(this.apiUrl, { username, password });
  }

  logout() {
    localStorage.removeItem('jwtToken');
  }

  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }
}
