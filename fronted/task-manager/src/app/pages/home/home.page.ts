import { Component, OnInit } from '@angular/core';
import { TaskService, Task } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  tasks: Task[] = [];
  newTaskTitle: string = '';
  constructor(
    private taskService: TaskService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getTask().subscribe((tasks) => (this.tasks = tasks));
  }

  addTask() {
    if (!this.newTaskTitle.trim()) return;
    this.taskService.addTask(this.newTaskTitle).subscribe((task) => {
      this.taskService.addTask(this.newTaskTitle).subscribe((task) => {
        this.tasks.push(task);
        this.newTaskTitle = '';
      });
    });
  }

  toggleTask(task: Task) {
    this.taskService.toggleTask(task._id!).subscribe((updatedTask) => {
      task.completed = updatedTask.completed;
    });
  }

  deleteTask(task: Task) {
    this.taskService.deleteTask(task._id!).subscribe(() => {
      this.tasks = this.tasks.filter((t) => t._id !== task._id);
    });
  }

  logout() {
    this.authService.logout();
  }
}
