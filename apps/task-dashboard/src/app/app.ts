import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    CommonModule,      // Needed for *ngIf, *ngFor, etc.
    RouterModule,      // Needed for routerLink, router-outlet
    FormsModule,       // Needed for ngModel
    HttpClientModule   // ✅ This is the correct module for HTTP requests
  ]
})
export class AppComponent {
  constructor() {
    console.log('AppComponent constructor');
  }
  ngOnInit() {
    console.log('AppComponent ngOnInit');
  }
}
