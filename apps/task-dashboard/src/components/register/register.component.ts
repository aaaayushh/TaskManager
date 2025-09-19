import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private http = inject(HttpClient);
  private router = inject(Router);

  username = '';
  orgId = 1;
  role = '';
  password = '';

  errorMsg = '';
  successMsg = '';

  private apiUrl = 'http://localhost:3000/api/users/register';

  onRegister() {
    // simple validation
    if (!this.username || !this.password || !this.role || !this.orgId) {
      this.errorMsg = 'All fields are required';
      return;
    }

    // Attach JWT if user is logged in
    const token = localStorage.getItem('jwtToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    const body = {
      username: this.username,
      password: this.password,
      role: this.role,
      orgId: this.orgId,
    };

    this.http.post(this.apiUrl, body, { headers }).subscribe({
      next: (res: any) => {
        this.successMsg = 'User registered successfully!';
        this.errorMsg = '';
        this.router.navigate(['/dashboard']); 
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Registration failed';
        this.successMsg = '';
      },
    });
  }
}
