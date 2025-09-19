import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';

interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'Pending' | 'InProgress' | 'Completed';
}

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './add-task.component.html'
})
export class AddTaskComponent {
  newTaskTitle = '';
  newTaskDescription = '';
  private apiUrl = 'http://localhost:3000/api/tasks';

  @Output() taskAdded = new EventEmitter<Task>();

  constructor(private http: HttpClient) {}

  addTask() {
    const title = this.newTaskTitle.trim();
    if (!title) return;

    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const payload = { 
      title: this.newTaskTitle.trim(), 
      description: this.newTaskDescription.trim(), 
      status: 'Pending' 
    };

    this.http.post<Task>(`${this.apiUrl}/create`, payload, { headers }).subscribe({
      next: (task) => {
        this.taskAdded.emit(task); // send new task to dashboard
        this.newTaskTitle = '';
        this.newTaskDescription = '';
      },
      error: (err) => console.error('Failed to add task', err)
    });
  }
}
