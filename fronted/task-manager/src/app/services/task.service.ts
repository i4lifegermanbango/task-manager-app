import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpHeaders } from '@angular/common/http';

export interface Task {
  _id?: string;
  title: string;
  completed: 'pendiente' | 'en_proceso' | 'completed';
  tags?: Tag[];
}

export interface Tag {
  _id: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = environment.apiUrl + '/tasks';

  constructor(private http: HttpClient) {}

  getTask(): Observable<Task[]> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`,
    );
    return this.http.get<Task[]>(this.apiUrl, { headers });
  }

  addTask(formData: FormData): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  addTagToTask(taskId: string, tagId: string): Observable<Task> {
    return this.http.put<Task>(
      `${this.apiUrl}/${taskId}/add-tag`,
      { tagId },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      },
    );
  }

  removeTagFromTask(taskId: string, tagId: string): Observable<Task> {
    return this.http.put<Task>(
      `${this.apiUrl}/${taskId}/remove-tag`,
      { tagId },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      },
    );
  }

  toggleTask(id: string): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, {});
  }

  deleteTask(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  deleteAllTasks() {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`,
    );

    return this.http.delete(this.apiUrl, { headers });
  }
}
