import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Invitacion {
  _id?: string;
  taskId: any;
  userId: any;
  estado: 'pendiente' | 'aceptada' | 'rechazada';
  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class InvitacionService {
  private apiUrl = environment.apiUrl + '/invitaciones';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    return new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`,
    );
  }

  crearInvitacion(formData: FormData): Observable<Invitacion> {
    return this.http.post<Invitacion>(this.apiUrl, formData, {
      headers: this.getHeaders(),
    });
  }

  getInvitaciones(): Observable<Invitacion[]> {
    return this.http.get<Invitacion[]>(this.apiUrl, {
      headers: this.getHeaders(),
    });
  }

  gestionarInvitacion(id: string, aceptar: boolean): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${id}`,
      { aceptar },
      { headers: this.getHeaders() },
    );
  }
}
