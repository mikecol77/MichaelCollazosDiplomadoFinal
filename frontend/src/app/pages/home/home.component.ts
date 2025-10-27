import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TasksService } from '../../services/tasks.service';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  tasks: any[] = [];
  loading = false;

  // Formulario de “tarea rápida”
  quickForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    priority: ['low'],
    dueDate: ['']
  });

  constructor(
    public auth: AuthService,
    private router: Router,
    private tasksService: TasksService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.loading = true;
      this.tasksService.list().subscribe({
        next: (data) => { this.tasks = data || []; this.loading = false; },
        error: () => { this.loading = false; }
      });
    }
  }

  goNext() {
    this.router.navigate([ this.auth.isLoggedIn() ? '/dashboard' : '/auth' ]);
  }

  /** Nombre del usuario desde localStorage (fallback seguro) */
  get userName(): string {
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null');
      return u?.name || 'Usuario';
    } catch { return 'Usuario'; }
  }

  // ---------- Derivados para el resumen ----------
  get counts() {
    const total = this.tasks.length;
    const done = this.tasks.filter(t => t.done).length;
    return { total, done, pending: total - done };
  }

  get progress() {
    const { total, done } = this.counts;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const tone: 'ok' | 'mid' | 'low' = pct >= 80 ? 'ok' : pct >= 40 ? 'mid' : 'low';
    return { pct, tone };
  }

  get soonTasks() {
    const now = this.startOfDay(new Date());
    const in7 = new Date(now); in7.setDate(now.getDate() + 7);
    return this.tasks
      .filter(t => t.dueDate && !t.done && this.startOfDay(new Date(t.dueDate)) <= in7)
      .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))
      .slice(0, 3);
  }

  get recentTasks() {
    return [...this.tasks]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 3);
  }

  priorityLabel(p?: string) {
    return p === 'high' ? '🔴 Alta' : p === 'med' ? '🟡 Media' : '🟢 Baja';
  }

  // ---------- KPIs ----------
  get kpiToday(): number {
    const today = this.startOfDay(new Date());
    return this.tasks.filter(t =>
      t.dueDate && !t.done && this.isSameDay(this.startOfDay(new Date(t.dueDate)), today)
    ).length;
  }

  get kpiWeek(): number {
    const today = this.startOfDay(new Date());
    const in7 = new Date(today); in7.setDate(today.getDate() + 7);
    return this.tasks.filter(t => {
      const d = t.dueDate ? this.startOfDay(new Date(t.dueDate)) : null;
      return d && !t.done && d > today && d <= in7;
    }).length;
  }

  get kpiOverdue(): number {
    const today = this.startOfDay(new Date());
    return this.tasks.filter(t =>
      t.dueDate && !t.done && this.startOfDay(new Date(t.dueDate)) < today
    ).length;
  }

  private startOfDay(d: Date) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  private isSameDay(a: Date, b: Date) {
    return a.getTime() === b.getTime();
  }

  // ✅ MÉTODO dentro de la clase (no function) para evitar desfase de fechas
  private dateOnlyToIsoAtNoonLocal(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    const localNoon = new Date(y, (m as number) - 1, d, 12, 0, 0, 0);
    return localNoon.toISOString();
  }

  // ---------- Crear “tarea rápida” ----------
  addQuickTask() {
    if (this.quickForm.invalid) return;

    const { title, priority, dueDate } = this.quickForm.value;

    const t = (title || '').trim();
    const p = (priority as 'low' | 'med' | 'high') || 'low';
    const d: string | null = dueDate
      ? this.dateOnlyToIsoAtNoonLocal(dueDate as string)
      : null;

    this.tasksService.create(t, p, d).subscribe({
      next: (created) => {
        this.tasks = [created, ...this.tasks];
        this.quickForm.reset({ title: '', priority: 'low', dueDate: '' });
      },
      error: () => { /* opcional: toast */ }
    });
  }
}
