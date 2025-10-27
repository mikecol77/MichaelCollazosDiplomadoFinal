import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  msg = '';
  err = '';

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: [{ value: '', disabled: true }]
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private api: ApiService) {}

  ngOnInit(): void {
    // Cargar datos confiables del backend
    this.api.me().subscribe({
      next: (u) => this.form.setValue({ name: u.name, email: u.email }),
      error: () => {
        // fallback a localStorage si algo falla
        const u = this.auth.getUser();
        if (u) this.form.setValue({ name: u.name, email: u.email });
      }
    });
  }

  save() {
    this.msg = ''; this.err = '';
    if (this.form.invalid) return;

    const name = this.form.controls.name.value!.trim();
    this.auth.updateMe(name).subscribe({
      next: (u) => { this.msg = 'Perfil actualizado.'; },
      error: (e) => { this.err = e?.error?.message || 'No se pudo actualizar'; }
    });
  }
}
