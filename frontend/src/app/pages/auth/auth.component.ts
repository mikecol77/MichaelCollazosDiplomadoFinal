import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  isLogin = true;
  msg = '';
  err = '';

  registerForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  toggle(mode: 'login'|'register') {
    this.isLogin = (mode === 'login');
    this.msg = ''; this.err = '';
  }

  onRegister() {
    this.msg = ''; this.err = '';
    if (this.registerForm.invalid) return;
    this.auth.register(this.registerForm.value as any).subscribe({
      next: () => { this.msg = 'Registro exitoso. Redirigiendo...'; this.router.navigate(['/dashboard']); },
      error: (e) => { this.err = e?.error?.message || 'Error en registro'; }
    });
  }

  onLogin() {
    this.msg = ''; this.err = '';
    if (this.loginForm.invalid) return;
    this.auth.login(this.loginForm.value as any).subscribe({
      next: () => { this.msg = 'Login exitoso. Redirigiendo...'; this.router.navigate(['/dashboard']); },
      error: (e) => { this.err = e?.error?.message || 'Credenciales inválidas'; }
    });
  }
}