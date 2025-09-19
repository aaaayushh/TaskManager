import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
//import { HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../login/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  errorMsg = '';

  onLogin() {
  this.authService.login(this.username, this.password).subscribe({
    next: (res: any) => {
      // Check if token exists
      if (res && res.access_token) {
        localStorage.setItem('jwtToken', res.access_token);
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMsg = 'Invalid username or password';
      }
    },
    error: (err) => {
      this.errorMsg = err?.error?.message || 'Invalid username or password';
    },
  });
}

}
