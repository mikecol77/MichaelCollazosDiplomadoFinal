import { Injectable } from '@angular/core';

export interface TaskLike {
  title?: string;
  done?: boolean;
  dueDate?: string | null; // ISO o null
  createdAt?: string;
  priority?: 'low' | 'med' | 'high';
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  // ---- Soporte / permiso ----
  get supported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }
  get permission(): NotificationPermission {
    return this.supported ? Notification.permission : 'denied';
  }
  get enabled(): boolean {
    return this.permission === 'granted';
  }
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.supported) return 'denied';
    if (this.permission === 'granted') return 'granted';
    return await Notification.requestPermission();
  }

  // ---- Enviar notificación ----
  notify(title: string, body?: string) {
    if (!this.enabled) return;
    try {
      new Notification(title, { body });
    } catch {}
  }

  // ---- KPI de tareas ----
  private computeKpis(tasks: TaskLike[]) {
    const today = this.startOfDay(new Date());
    const in3 = new Date(today); in3.setDate(today.getDate() + 3);

    let dueToday = 0, overdue = 0, soon = 0, pending = 0;

    for (const t of tasks || []) {
      if (!t) continue;
      if (!t.done) pending++;
      if (!t?.dueDate || t.done) continue;

      const d = this.startOfDay(new Date(t.dueDate));
      if (d.getTime() === today.getTime()) dueToday++;
      else if (d.getTime() < today.getTime()) overdue++;
      else if (d.getTime() > today.getTime() && d.getTime() <= in3.getTime()) soon++;
    }
    return { dueToday, overdue, soon, pending };
  }

  // ---- Construye cuerpo multi-línea (resumen general) ----
  private buildSummaryBody(tasks: TaskLike[]): string | null {
    const { dueToday, overdue, soon, pending } = this.computeKpis(tasks);
    const s = (n: number) => (n === 1 ? '' : 's');

    const lines: string[] = [];
    if (overdue > 0)   lines.push(`Tienes ${overdue} tarea${s(overdue)} vencida${s(overdue)}.`);
    if (dueToday > 0)  lines.push(`Hoy vence${s(dueToday)} ${dueToday} tarea${s(dueToday)}.`);
    if (soon > 0)      lines.push(`Tienes ${soon} tarea${s(soon)} dentro de los próximos 3 días.`);
    if (pending > 0)   lines.push(`Pendientes totales: ${pending}.`);

    if (lines.length === 0) return null;
    return lines.map(l => `• ${l}`).join('\n'); // viñetas y saltos de línea
  }

  /** Notificación “una vez al día” con resumen general. */
  tryNotify(tasks: TaskLike[]) {
    if (!this.enabled || !Array.isArray(tasks)) return;

    const body = this.buildSummaryBody(tasks);
    if (!body) return;

    const key = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const flag = sessionStorage.getItem(`notified:summary:${key}`);
    if (flag === '1') return;

    this.notify('Resumen de tus tareas', body);
    sessionStorage.setItem(`notified:summary:${key}`, '1');
  }

  /** Recordatorio resumido (para usar con intervalos configurables). */
  remindSummary(tasks: TaskLike[]) {
    if (!this.enabled || !Array.isArray(tasks)) return;
    const body = this.buildSummaryBody(tasks);
    if (body) this.notify('Recordatorio de tareas', body);
  }

  // ---- Ejemplo / helpers ----
  showSample() {
    this.notify('Notificaciones activas ✅', 'Ejemplo de aviso del Gestor de Tareas');
  }

  private startOfDay(d: Date) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }
}


