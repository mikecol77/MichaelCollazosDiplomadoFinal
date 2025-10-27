import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // Auth
  register(data: { name: string; email: string; password: string }) {
    return this.http.post<{ token: string; user: any }>(`${this.base}/api/auth/register`, data);
  }
  login(data: { email: string; password: string }) {
    return this.http.post<{ token: string; user: any }>(`${this.base}/api/auth/login`, data);
  }
  me() {
    return this.http.get<{ id: string; name: string; email: string }>(`${this.base}/api/auth/me`);
  }
  updateMe(payload: { name: string }) {
    return this.http.patch<{ id: string; name: string; email: string }>(`${this.base}/api/auth/me`, payload);
  }

  // Tasks
  getTasks() {
    return this.http.get<any[]>(`${this.base}/api/tasks`);
  }
  createTask(data: { title: string; priority?: 'low'|'med'|'high'; dueDate?: string|null }) {
    return this.http.post<any>(`${this.base}/api/tasks`, data);
  }
  toggleDone(id: string) {
    return this.http.patch<any>(`${this.base}/api/tasks/${id}`, {});
  }
  updateTask(id: string, data: { title?: string; done?: boolean; priority?: 'low'|'med'|'high'; dueDate?: string|null }) {
    return this.http.put<any>(`${this.base}/api/tasks/${id}`, data);
  }
  deleteTask(id: string) {
    return this.http.delete<{ ok: boolean }>(`${this.base}/api/tasks/${id}`);
  }
  clearCompleted() {
    return this.http.delete<{ ok: boolean; deleted: number }>(`${this.base}/api/tasks/__all__/completed`);
  }
}


