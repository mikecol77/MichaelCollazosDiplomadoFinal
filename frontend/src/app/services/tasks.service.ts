import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class TasksService {
  constructor(private api: ApiService) {}

  list() { return this.api.getTasks(); }
  create(title: string, priority: 'low'|'med'|'high', dueDate: string | null) {
    return this.api.createTask({ title, priority, dueDate });
  }
  toggle(id: string) { return this.api.toggleDone(id); }
  updateTitle(id: string, title: string) { return this.api.updateTask(id, { title }); }
  updateMeta(id: string, data: { priority?: 'low'|'med'|'high'; dueDate?: string | null }) {
    return this.api.updateTask(id, data);
  }
  remove(id: string) { return this.api.deleteTask(id); }
  clearCompleted() { return this.api.clearCompleted(); }
}

