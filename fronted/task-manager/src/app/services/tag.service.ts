import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpHeaders } from '@angular/common/http';

export interface Tag {
  _id?: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private apiUrl = environment.apiUrl + '/tags';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    return new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`,
    );
  }

  getTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(this.apiUrl, {
      headers: this.getHeaders(),
    });
  }

  createTag(name: string): Observable<Tag> {
    return this.http.post<Tag>(
      this.apiUrl,
      { name },
      { headers: this.getHeaders() },
    );
  }

  updateTag(id: string, name: string): Observable<Tag> {
    return this.http.put<Tag>(
      `${this.apiUrl}/${id}`,
      { name },
      { headers: this.getHeaders() },
    );
  }

  deleteTag(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
