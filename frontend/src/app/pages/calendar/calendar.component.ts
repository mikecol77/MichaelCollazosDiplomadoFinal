import { Component, OnInit } from '@angular/core';
import { TasksService } from '../../services/tasks.service';

type DayCell = {
  date: Date;
  inMonth: boolean;
  key: string;          // 'YYYY-MM-DD'
  tasks: any[];         // tareas con dueDate = key
};

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  viewDate = new Date();            // mes que se está viendo
  weeks: DayCell[][] = [];          // 6 filas x 7 columnas
  selectedKey: string | null = null;
  selectedTasks: any[] = [];

  private allTasks: any[] = [];
  private tasksByDay = new Map<string, any[]>();

  // nombres de días como propiedad (evita llamar funciones en el template)
  readonly dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  constructor(private tasksService: TasksService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  // ---------- Carga y agrupación ----------
  loadTasks() {
    this.tasksService.list().subscribe({
      next: (data) => {
        this.allTasks = data || [];
        this.groupByDay();
        this.buildCalendar();
      },
      error: () => {
        this.allTasks = [];
        this.tasksByDay.clear();
        this.buildCalendar();
      }
    });
  }

  private groupByDay() {
    this.tasksByDay.clear();

    for (const t of this.allTasks) {
      if (!t?.dueDate) continue;
      const key = this.keyFromISO(t.dueDate);
      if (!this.tasksByDay.has(key)) this.tasksByDay.set(key, []);
      this.tasksByDay.get(key)!.push(t);
    }
  }

  // ---------- Calendario ----------
  buildCalendar() {
    const y = this.viewDate.getFullYear();
    const m = this.viewDate.getMonth();
    const first = new Date(y, m, 1);
    const start = new Date(first);
    // Comienza el domingo: 0=dom,1=lun,...6=sáb
    const offset = first.getDay(); // 0..6
    start.setDate(first.getDate() - offset);

    const weeks: DayCell[][] = [];
    let cursor = new Date(start);

    for (let w = 0; w < 6; w++) {
      const row: DayCell[] = [];
      for (let d = 0; d < 7; d++) {
        const key = this.keyFromDate(cursor);
        const inMonth = cursor.getMonth() === m;
        row.push({
          date: new Date(cursor),
          inMonth,
          key,
          tasks: inMonth ? (this.tasksByDay.get(key) || []) : []
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(row);
    }

    this.weeks = weeks;

    // Si hay un día seleccionado y ya no está en el mes, se limpiar panel
    if (this.selectedKey) {
      const stillVisible = weeks.flat().some(c => c.key === this.selectedKey);
      if (!stillVisible) { this.selectedKey = null; this.selectedTasks = []; }
    }
  }

  // ---------- Navegación ----------
  prevMonth() {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
    this.buildCalendar();
  }

  nextMonth() {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
    this.buildCalendar();
  }

  goToday() {
    this.viewDate = new Date();
    this.buildCalendar();
  }

  // ---------- Selección de día ----------
  openDay(cell: DayCell) {
    this.selectedKey = cell.key;
    this.selectedTasks = [...cell.tasks].sort((a, b) => {
      const ap = a.priority || 'low';
      const bp = b.priority || 'low';
      const rank: any = { high: 0, med: 1, low: 2 };
      return (rank[ap] ?? 2) - (rank[bp] ?? 2);
    });
  }

  // ---------- Etiquetas y utilidades ----------
  monthLabel(): string {
    const fmt = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' });
    return fmt.format(this.viewDate);
  }

  isToday(cell: DayCell) {
    const t = new Date(); t.setHours(0,0,0,0);
    const c = new Date(cell.date); c.setHours(0,0,0,0);
    return t.getTime() === c.getTime();
  }

  // Checkers (evitan funciones flecha en el template)
  hasHigh(cell: DayCell): boolean {
    return cell.tasks?.some((t: any) => t?.priority === 'high') ?? false;
  }
  hasMed(cell: DayCell): boolean {
    return cell.tasks?.some((t: any) => t?.priority === 'med') ?? false;
  }
  hasLow(cell: DayCell): boolean {
    return cell.tasks?.some((t: any) => t?.priority === 'low') ?? false;
  }

  // ---------- Keys de fecha ----------
  private keyFromISO(iso: string): string {
    const d = new Date(iso);
    return this.keyFromDate(d);
  }
  private keyFromDate(d: Date): string {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }
}

