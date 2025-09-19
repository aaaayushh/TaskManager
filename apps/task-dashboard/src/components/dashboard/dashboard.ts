import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AddTaskComponent } from '../addTask/add-task.component';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { ChartOptions, ChartType, ChartData } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'Pending' | 'InProgress' | 'Completed';
  isEditing?: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DragDropModule, AddTaskComponent, FormsModule, HttpClientModule, NgChartsModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  todo: Task[] = [];
  inProgress: Task[] = [];
  completed: Task[] = [];

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Task Completion Status' }
    }
  };

  public barChartLabels: string[] = ['To-Do', 'In Progress', 'Completed'];
  public barChartData: ChartData<'bar'> = {
    labels: this.barChartLabels,
    datasets: [
      { data: [0, 0, 0], backgroundColor: ['#f87171','#facc15','#34d399'] }
    ]
  };

  private apiUrl = 'http://localhost:3000/api/tasks';

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<Task[]>(`${this.apiUrl}/my-tasks`, { headers }).subscribe({
      next: (tasks) => {
        this.todo = [];
        this.inProgress = [];
        this.completed = [];
        tasks.forEach(task => {
          const mapped = this.mapBackendStatus(task.status);
          if (mapped === 'To-Do') this.todo.push(task);
          else if (mapped === 'In Progress') this.inProgress.push(task);
          else if (mapped === 'Completed') this.completed.push(task);
        });
        this.updateChart();
      },
      error: (err) => {
        console.error('Failed to load tasks', err);
        if (err.status === 401) this.router.navigate(['/login']);
      }
    });
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  darkMode = false;

toggleDarkMode() {
  this.darkMode = !this.darkMode;
  const html = document.documentElement;
  if (this.darkMode) {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
}

  updateChart() {
  this.barChartData = {
    ...this.barChartData,
    datasets: [
      { 
        data: [this.todo.length, this.inProgress.length, this.completed.length],
        backgroundColor: ['#f87171','#facc15','#34d399']
      }
    ]
  };
}

  // Child AddTaskComponent emits
  addTask(task: Task) {
    this.loadTasks(); // reload tasks after creation
  }

  startEdit(task: Task) {
    task.isEditing = true;
  }

  saveEdit(task: Task, newTitle?: string, newDescription?: string) {
    if (newTitle) task.title = newTitle;
    if (newDescription) task.description = newDescription;
    task.isEditing = false;

    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.put(`${this.apiUrl}/${task.id}`, { title: task.title, description: task.description }, { headers })
      .subscribe({ next: () => {this.updateChart();}, error: (err) => console.error(err) });
  }

  deleteTask(task: Task) {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.delete(`${this.apiUrl}/${task.id}`, { headers }).subscribe({
      next: () => {
        this.loadTasks();
        this.updateChart();
      },
      error: (err) => console.error(err)
    });
  }

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      const oldStatus = task.status;
      task.status = this.reverseMapStatus(this.getStatusFromContainer(event.container.id));

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      this.updateTaskStatus(task.id, task.status, oldStatus);
    }
  }

  private updateTaskStatus(taskId: number, newStatus: Task['status'], oldStatus: Task['status']) {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.put(`${this.apiUrl}/${taskId}`, { status: newStatus }, { headers })
      .subscribe({
        next: () => {this.updateChart();},
        error: () => {
          const array = this.getColumnArray(this.mapBackendStatus(oldStatus));
          array.push({ id: taskId, status: oldStatus } as Task);
        }
      });
  }

  private getStatusFromContainer(containerId: string): 'To-Do' | 'In Progress' | 'Completed' {
    switch (containerId) {
      case 'todoList': return 'To-Do';
      case 'inProgressList': return 'In Progress';
      case 'completedList': return 'Completed';
      default: return 'To-Do';
    }
  }

  private mapBackendStatus(status: Task['status']): 'To-Do' | 'In Progress' | 'Completed' {
    switch (status) {
      case 'Pending': return 'To-Do';
      case 'InProgress': return 'In Progress';
      case 'Completed': return 'Completed';
      default: return 'To-Do';
    }
  }

  private reverseMapStatus(status: 'To-Do' | 'In Progress' | 'Completed'): Task['status'] {
    switch (status) {
      case 'To-Do': return 'Pending';
      case 'In Progress': return 'InProgress';
      case 'Completed': return 'Completed';
    }
  }

  private getColumnArray(status: 'To-Do' | 'In Progress' | 'Completed'): Task[] {
    switch (status) {
      case 'To-Do': return this.todo;
      case 'In Progress': return this.inProgress;
      case 'Completed': return this.completed;
    }
  }
}
