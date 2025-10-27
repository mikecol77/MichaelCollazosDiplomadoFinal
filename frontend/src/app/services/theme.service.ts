import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private KEY = 'mcd_theme';

  init() {
    const saved = localStorage.getItem(this.KEY) || 'light';
    document.body.classList.toggle('dark', saved === 'dark');
    return saved;
  }

  toggle() {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem(this.KEY, isDark ? 'dark' : 'light');
    return isDark ? 'dark' : 'light';
  }

  current() {
    return document.body.classList.contains('dark') ? 'dark' : 'light';
  }
}