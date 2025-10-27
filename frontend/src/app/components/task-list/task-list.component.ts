import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { TasksService } from '../../services/tasks.service';
import { NotificationService } from '../../services/notification.service';

type FilterMode = 'all' | 'pending' | 'done';
type SortMode = 'recent' | 'az' | 'due' | 'priority';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit, OnDestroy {
  tasks: any[] = [];

  // Crear
  titleCtrl = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] });
  priorityCtrl = new FormControl<'low'|'med'|'high'>('low', { nonNullable: true });
  dueCtrl = new FormControl<string | null>(null); // 'YYYY-MM-DD' o null

  // Editar título
  editCtrl = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] });
  editId: string | null = null;

  // Buscar/Ordenar/Filtrar en general firltos
  searchCtrl = new FormControl('', { nonNullable: true });
  sortCtrl = new FormControl<SortMode>('recent', { nonNullable: true });
  filter: FilterMode = 'all';

  // Notificaciones: intervalo configurable
  reminderCtrl = new FormControl<number>(Number(localStorage.getItem('reminderMs') || '0'), { nonNullable: true });
  private reminderTimer: any = null; // setInterval id

  loading = false;
  errorMsg = '';

  constructor(
    private tasksService: TasksService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.fetch();

    // reintenta cada vez que la pestaña vuelve al frente
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) this.notify.tryNotify(this.tasks);
    });

    // aplica el intervalo guardado (si existe)
    this.applyReminderSchedule();

    // si cambias el selector manualmente y no usas (change) en el HTML, podrías suscribirte aquí:
    // this.reminderCtrl.valueChanges.subscribe(() => this.onChangeReminder());
  }

  ngOnDestroy(): void {
    this.stopReminderSchedule();
  }

  // =================== Helpers ===================

  /** Convierte 'YYYY-MM-DD' a ISO usando 12:00 hora local (evita desfase de día). */
  private dateOnlyToIsoAtNoonLocal(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    const localNoon = new Date(y, (m as number) - 1, d, 12, 0, 0, 0);
    return localNoon.toISOString();
  }

  private applyReminderSchedule() {
    this.stopReminderSchedule();
    const ms = this.reminderCtrl.value;
    if (!ms) return; // desactivado

    // Dispara una primera evaluación inmediata para dar feedback
    this.notify.remindSummary(this.tasks);

    this.reminderTimer = setInterval(() => {
      this.notify.remindSummary(this.tasks);
    }, ms);
  }

  private stopReminderSchedule() {
    if (this.reminderTimer) {
      clearInterval(this.reminderTimer);
      this.reminderTimer = null;
    }
  }

  // =================== Derivados ===================

  get counts() {
    const total = this.tasks.length;
    const done = this.tasks.filter(t => t.done).length;
    return { total, done, pending: total - done };
  }

  setFilter(mode: FilterMode) { this.filter = mode; }

  /** Aqui el progreso global (0–100) + tono para pintar la barra */
  get progress() {
    const { total, done } = this.counts;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const tone: 'ok' | 'mid' | 'low' = pct >= 80 ? 'ok' : pct >= 40 ? 'mid' : 'low';
    return { pct, tone };
  }

  /** Aqui pues Lista que se muestra (filtro + búsqueda + orden) */
  get viewTasks() {
    const q = (this.searchCtrl.value || '').toLowerCase().trim();
    let list = this.tasks.filter(t => {
      const passFilter = this.filter === 'all' ? true : this.filter === 'done' ? t.done : !t.done;
      const passSearch = !q || (t.title || '').toLowerCase().includes(q);
      return passFilter && passSearch;
    });

    switch (this.sortCtrl.value) {
      case 'az':
        list = list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'due':
        list = list.sort(
          (a, b) =>
            (a.dueDate ? +new Date(a.dueDate) : Infinity) -
            (b.dueDate ? +new Date(b.dueDate) : Infinity)
        );
        break;
      case 'priority':
        const rank = { high: 0, med: 1, low: 2 } as any;
        list = list.sort(
          (a, b) => (rank[a.priority || 'low'] ?? 2) - (rank[b.priority || 'low'] ?? 2)
        );
        break;
      default: // 'recent'
        list = list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }
    return list;
  }

  // =================== CRUD ===================

  fetch() {
    this.loading = true; this.errorMsg = '';
    this.tasksService.list().subscribe({
      next: (data) => {
        this.tasks = data;
        this.loading = false;
        this.notify.tryNotify(this.tasks); // "una vez al día"
      },
      error: () => { this.errorMsg = 'No se pudieron cargar las tareas'; this.loading = false; }
    });
  }

  addTask() {
    if (this.titleCtrl.invalid) return;
    const title = this.titleCtrl.value.trim(); if (!title) return;
    const priority = this.priorityCtrl.value;

    const rawDate = this.dueCtrl.value; // 'YYYY-MM-DD' o null
    const dueDate = rawDate ? this.dateOnlyToIsoAtNoonLocal(rawDate) : null;

    this.tasksService.create(title, priority, dueDate).subscribe({
      next: (t) => {
        this.tasks.unshift(t);
        this.titleCtrl.reset('', { emitEvent: false }); this.titleCtrl.markAsPristine(); this.titleCtrl.markAsUntouched();
        this.priorityCtrl.setValue('low');
        this.dueCtrl.setValue(null);

        this.notify.tryNotify(this.tasks); // por si crea algo para hoy / vencido
      },
      error: () => { this.errorMsg = 'Error creando la tarea'; }
    });
  }

  toggleDone(task: any) {
    this.tasksService.toggle(task._id).subscribe({
      next: (t) => { task.done = t.done; this.notify.tryNotify(this.tasks); },
      error: () => { this.errorMsg = 'Error actualizando la tarea'; }
    });
  }

  // Editar título
  startEdit(task: any) { this.editId = task._id; this.editCtrl.setValue(task.title); }
  cancelEdit() { this.editId = null; this.editCtrl.reset('', { emitEvent: false }); }
  saveEdit(task: any) {
    if (!this.editId || this.editCtrl.invalid) return;
    const newTitle = this.editCtrl.value.trim(); if (!newTitle) return;
    this.tasksService.updateTitle(this.editId, newTitle).subscribe({
      next: (t) => { task.title = t.title; this.editId = null; this.editCtrl.reset('', { emitEvent: false }); },
      error: () => { this.errorMsg = 'Error guardando cambios'; }
    });
  }

  // S
  updateMeta(task: any, change: { priority?: 'low'|'med'|'high'; dueDate?: string | null }) {
    const payload: { priority?: 'low'|'med'|'high'; dueDate?: string | null } = { ...change };
    if (payload.dueDate && typeof payload.dueDate === 'string' && payload.dueDate.length === 10 && !payload.dueDate.includes('T')) {
      payload.dueDate = this.dateOnlyToIsoAtNoonLocal(payload.dueDate);
    }

    this.tasksService.updateMeta(task._id, payload).subscribe({
      next: (t) => { task.priority = t.priority; task.dueDate = t.dueDate; this.notify.tryNotify(this.tasks); },
      error: () => { this.errorMsg = 'Error actualizando datos'; }
    });
  }

  deleteTask(task: any) {
    if (!confirm(`¿Eliminar la tarea "${task.title}"?`)) return;
    this.tasksService.remove(task._id).subscribe({
      next: () => { this.tasks = this.tasks.filter(x => x._id !== task._id); this.notify.tryNotify(this.tasks); },
      error: () => { this.errorMsg = 'Error eliminando la tarea'; }
    });
  }

  clearCompleted() {
    if (!confirm('¿Eliminar todas las tareas completadas?')) return;
    this.tasksService.clearCompleted().subscribe({
      next: () => {
        this.tasks = this.tasks.filter(t => !t.done);
        this.notify.tryNotify(this.tasks);
      },
      error: () => { this.errorMsg = 'No se pudieron limpiar las completadas'; }
    });
  }

  isOverdue(t: any) {
    return !!t.dueDate && !t.done && new Date(t.dueDate) < new Date(new Date().toDateString());
  }

  // =================== Notificaciones: UI helpers ===================

  get notifEnabled(): boolean {
    return this.notify.enabled;
  }

  async enableNotifications() {
    const res = await this.notify.requestPermission();
    if (res === 'granted') {
      this.notify.showSample();
      this.notify.tryNotify(this.tasks);
    } else {
      alert('No se activaron las notificaciones del navegador.');
    }
  }

  onChangeReminder() {
    // guarda selección y aplica el intervalo
    localStorage.setItem('reminderMs', String(this.reminderCtrl.value || 0));
    this.applyReminderSchedule();
  }

  testNotification() {
    this.notify.showSample();
  }
}





