import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpHeaders } from '@angular/common/http';

export interface Task {
  _id?: string;
  title: string;
  completed: 'pendiente' | 'en_proceso' | 'completada';
  tags?: Tag[];
  userRol?: string;
  deleted?: boolean;

  userId?: {
    _id: string;
    name: string;
  };
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

  private getHeaders() {
    return new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`,
    );
  }

  // 🔹 Obtener tareas activas
  getTask(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl, {
      headers: this.getHeaders(),
    });
  }

  // 🔹 Obtener tareas eliminadas (papelera)
  getTrashTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/deleted`, {
      headers: this.getHeaders(),
    });
  }

  // 🔹 Crear tarea
  addTask(formData: FormData): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, formData, {
      headers: this.getHeaders(),
    });
  }

  // 🔹 Cambiar estado (pendiente → en_proceso → completada)
  toggleTask(id: string): Observable<Task> {
    return this.http.put<Task>(
      `${this.apiUrl}/${id}`,
      {},
      {
        headers: this.getHeaders(),
      },
    );
  }

  // 🔹 Mover a papelera / restaurar (toggle deleted)
  toggleDeleted(id: string) {
    return this.http.put(
      `${this.apiUrl}/${id}/change-deleted-state`,
      {},
      {
        headers: this.getHeaders(),
      },
    );
  }

  // 🔹 Añadir tag
  addTagToTask(taskId: string, tagId: string): Observable<Task> {
    return this.http.put<Task>(
      `${this.apiUrl}/${taskId}/add-tag`,
      { tagId },
      { headers: this.getHeaders() },
    );
  }

  // 🔹 Eliminar tag
  removeTagFromTask(taskId: string, tagId: string): Observable<Task> {
    return this.http.put<Task>(
      `${this.apiUrl}/${taskId}/remove-tag`,
      { tagId },
      { headers: this.getHeaders() },
    );
  }

  // 🔹 Restaurar tareas seleccionadas
  restoreSelected(ids: string[]) {
    return this.http.put(
      `${this.apiUrl}/restore-selected`,
      { ids },
      { headers: this.getHeaders() },
    );
  }

  // 🔹 Restaurar todas las tareas (papelera)
  restoreAll() {
    return this.http.put(
      `${this.apiUrl}/restore-all`,
      {},
      { headers: this.getHeaders() },
    );
  }

  // 🔹 Mover TODAS a papelera (solo admin)
  moveAllToDelete() {
    return this.http.put(
      `${this.apiUrl}/move-to-delete`,
      {},
      { headers: this.getHeaders() },
    );
  }

  // 🔹 Eliminar tarea definitivamente
  deleteTask(task: Task, avisar: boolean = false) {
    return this.http.delete(`${this.apiUrl}/${task._id}`, {
      headers: this.getHeaders(),
      body: { avisar },
    });
  }

  // 🔹 Vaciar papelera (solo admin)
  deleteAllTasks() {
    return this.http.delete(this.apiUrl, {
      headers: this.getHeaders(),
    });
  }

  // 🔹 Enviar email (lo dejas igual)
  sendEmail(email: string, mensaje: string) {
    return this.http.post(`${environment.apiUrl}/send-email`, {
      email,
      mensaje,
    });
  }
}
