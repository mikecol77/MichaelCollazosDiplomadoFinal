Aplicación **Angular** (SPA) paragestor de tareas con autenticación **JWT**, CRUD, **Calendario**, **Dashboard** con progreso, recordatorios (notificaciones) y **Perfil**.

---

## ✅ Requisitos

- **Node.js 18+** (LTS recomendado)
- **npm 9+**
- (Opcional) **Angular CLI** global:  
  ```bash
  npm i -g @angular/cli
````

---

## ⚙️ Configuración (entornos)

Edita `src/environments/environment.ts` si cambiaste el puerto/host del backend:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:4000/api'
};
```

> En producción usa `environment.prod.ts` con la URL pública del backend y compila con `ng build --configuration production`.

---

## ▶️ Ejecutar en local

```bash
npm install
npm start          # Servirá en http://localhost:4200
```

> Asegúrate que el backend corre en `http://localhost:4000` (o ajusta `apiUrl`).

---

## 🧭 Rutas principales

* `/` → **Inicio (Landing)**

  * Sin sesión: hero + features + CTA.
  * Con sesión: **Resumen** (KPI, progreso, próximas tareas, últimas creadas).
* `/auth` → **Registro / Login** (formularios reactivos, validaciones).
* `/dashboard` → **Mis Tareas** (ruta privada con `AuthGuard`).
* `/perfil` → **Perfil** (editar nombre) (privada).
* `/calendario` → **Calendario mensual** (privada, muestra SOLO días y tareas del mes visible).

> Rutas privadas protegidas con `AuthGuard`. El token JWT y datos básicos se guardan en `localStorage`.

---

## ✨ Funcionalidades

### Autenticación

* **Login / Registro** (JWT).
* Persistencia de sesión en `localStorage` (`token` y `user`).
* **Logout** desde el navbar (limpia storage y redirige).

### Tareas (Dashboard)

* Crear tarea con **título**, **prioridad** (`baja`, `media`, `alta`) y **fecha límite** (YYYY-MM-DD).
* Listado con **búsqueda**, **filtros** (todas/pendientes/completadas) y **orden** (recientes, A–Z, vencimiento, prioridad).
* **Marcar completada**, **editar título** inline, **eliminar** y **limpiar completadas**.
* **Barra de progreso** global (0–100%) con color según porcentaje.

### Calendario

* Vista **mensual**; renderiza **solo** los días del mes actual.
* Muestra tareas del mes con badges de prioridad.

### Perfil

* Editar **nombre** del usuario (actualiza `localStorage` y backend).

### Recordatorios (Notificaciones del navegador)

* Frecuencia configurable (p. ej. **5 min**, **1h**, **8h**, **24h**, **desactivado**).
* Notifica **resumen**: cantidad de **vencidas** y **próximas en 3 días**.
* Requiere: permisos del navegador y pestaña abierta (no usa Service Worker/Push).

### UI / Navbar

* Navbar con marca **MichaelCollazosDiplomadoFinal**.
* Enlaces **Calendario / Dashboard / Perfil** sólo visibles con sesión.
* CTA “Iniciar sesión” para no autenticados.
* Landing **hero + features + CTA** a **ancho completo** (full-bleed).

---

## 🧱 Estructura relevante

```
src/
├─ app/
│  ├─ components/
│  │  ├─ navbar/
│  │  └─ task-list/
│  ├─ pages/
│  │  ├─ home/        # Landing + Resumen (si hay sesión)
│  │  ├─ auth/        # Registro / Login (Reactive Forms)
│  │  ├─ dashboard/   # Mis tareas
│  │  ├─ profile/     # Perfil
│  │  └─ calendar/    # Calendario mensual
│  ├─ services/
│  │  ├─ api.service.ts
│  │  ├─ auth.service.ts
│  │  └─ tasks.service.ts
│  ├─ guards/auth.guard.ts
│  ├─ interceptors/auth.interceptor.ts   # (opcional) adjunta Authorization
│  ├─ app-routing.module.ts
│  └─ app.module.ts
└─ environments/
   ├─ environment.ts
   └─ environment.prod.ts
```

---

## 🔌 Integración con el backend

* **Base URL**: `environment.apiUrl`
* **Header Authorization**: `Bearer <token>` (interceptor opcional).
* Endpoints usados:

  * `POST /auth/register`, `POST /auth/login`, `PATCH /auth/me`
  * `GET /tasks`, `POST /tasks`, `PATCH /tasks/:id`, `DELETE /tasks/:id`
  * (opcional) `DELETE /tasks/clear-completed`

---

## 🛠️ Scripts

```bash
npm start          # ng serve
npm run build      # ng build (compilación de producción)
```

> Puedes agregar `--host 0.0.0.0 --port 4200` si requieres exponerlo en LAN.

---

## 🩺 Troubleshooting

* **Pantalla en blanco / navegación no funciona**

  * Verifica que exista `<router-outlet>` en `app.component.html`.
  * Confirma `<base href="/">` en `src/index.html`.
  * Revisa la consola por errores de rutas o binding.

* **No carga datos**

  * Chequea `environment.apiUrl` y que el backend esté arriba.
  * Revisa CORS en el backend (`CLIENT_ORIGIN`).

* **401/403**

  * Asegúrate de estar logueado y que el token esté en `localStorage`.
  * Si usas interceptor, confirma que adjunta `Authorization`.

* **Notificaciones no aparecen**

  * Otorga permisos en el navegador.
  * La pestaña debe estar **abierta** (sin Service Worker aún).

---

## 🧪 Usuario demo

* **Email:** `demo@demo.com`
* **Password:** `123456`
  *(Si no existe, regístralo desde `/auth` o crea la semilla en el backend si tienes script.)*

---

## 🛫 Despliegue (resumen)

1. Ajusta `environment.prod.ts` con la URL del backend público.
2. Compila:

   ```bash
   npm run build
   ```
3. Sube la carpeta `dist/` a tu hosting (Netlify, Firebase Hosting, etc.).
4. Configura **redirecciones SPA** (en Netlify, `_redirects`: `/*   /index.html   200`).

---

## ✅ Checklist (Frontend)

* [ ] `environment.apiUrl` correcto.
* [ ] Rutas: `/`, `/auth`, `/dashboard`, `/perfil`, `/calendario`.
* [ ] `<router-outlet>` presente.
* [ ] `AuthGuard` protegiendo rutas privadas.
* [ ] Formularios reactivos (registro/login/crear tarea).
* [ ] Token + user en `localStorage`.
* [ ] TaskList con búsqueda/filtro/orden y acciones.
* [ ] Calendario muestra solo el mes visible.
* [ ] Notificaciones configuradas (si se usan).

---

```
```
