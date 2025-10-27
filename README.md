
**Gestor de tareas con usuarios** (registro/login con JWT), construido con **Angular** (frontend) y **Node.js + Express + MongoDB** (backend).

> Proyecto: Mi Gestor de Tareas es una solución integral para organizar y dar seguimiento a actividades, que integra autenticación segura, CRUD completo de tareas, panel de control con progreso, vista de calendario, perfil de usuario y una comunicación Frontend ↔ Backend mediante JWT.
---

## 🚀 Características principales

- **Auth (JWT)**: registro y login; token guardado en `localStorage`.
- **Dashboard**: KPI rápidos, progreso global (%), próximas tareas (7 días), últimas creadas.
- **Tareas**:
  - Crear, listar, marcar como completadas.
  - **Prioridad** (baja / media / alta) y **fecha límite**.
  - Búsqueda, filtros (todas/pendientes/completadas) y orden (más recientes / A–Z / vencimiento / prioridad).
  - Limpieza de completadas.
- **Notificaciones locales (opcionales)**: recordatorios cada X minutos/horas con resumen (si el navegador lo permite y el usuario concede permiso).
- **Calendario**: vista mensual con las tareas del mes actual (sin mezclar con otros meses).
- **Perfil**: edición del nombre del usuario autenticado.
- **Frontend**: Angular con `ReactiveFormsModule`, `HttpClientModule`, `Router`.
- **Backend**: Express + Mongoose + CORS + JWT + bcrypt.

---

## 🧱 Estructura del repositorio

```

/backend        # API Express + MongoDB
/frontend       # Angular App
README.md       # Este archivo

```

- Lee también:
  - 📄 [`/backend/README.md`](backend/README.md)
  - 📄 [`/frontend/README.md`](frontend/README.md)

---

## 🔧 Requisitos previos

- **Node.js 18+**  
- **MongoDB** local o **MongoDB Atlas**
- Navegador moderno (para notificaciones, si las usas)

---

## ⚙️ Variables de entorno

### Backend (`/backend/.env`)
Crea `.env` a partir de `.env.example`:

```

MONGO_URI=mongodb://127.0.0.1:27017/michaelcollazos_final
JWT_SECRET=cambia_este_valor_por_uno_largo_y_unico
PORT=4000
CLIENT_ORIGIN=[http://localhost:4200](http://localhost:4200)

````

### Frontend
La base URL está en `environment.ts` (ya configurada a `http://localhost:4000`).  
Modifícala si cambiaste el puerto/host del backend.

---

## ▶️ Puesta en marcha (local)

1) **Backend**
```bash
cd backend
npm install
cp .env.example .env   # edita si es necesario
npm run dev            # arranca en http://localhost:4000
````

> (Opcional) Semilla de datos:

```bash
npm run seed   # crea usuario demo y algunas tareas
```

2. **Frontend**

```bash
cd ../frontend
npm install
npm start               # abre http://localhost:4200
```

> Si ves una pantalla en blanco, refresca o revisa la consola por errores de entorno CORS/URL.

---

## 🔑 Usuario demo

```txt
Email:    demo@demo.com
Password: 123456
```

> Si el login falla, ejecuta `npm run seed` en `/backend`.

---

## 🧩 Tecnologías

* **Frontend**: Angular (Router, Reactive Forms, HttpClient)
* **Backend**: Node.js, Express, Mongoose, jsonwebtoken, bcrypt, CORS
* **DB**: MongoDB

---

## 🛣️ API (resumen)

Base URL (local): `http://localhost:4000`

* `POST /api/auth/register` → Crea usuario.
* `POST /api/auth/login` → Devuelve `{ token, user }`.
* `GET /api/tasks` (JWT) → Lista tareas del usuario.
* `POST /api/tasks` (JWT) → Crea tarea.
* `PATCH /api/tasks/:id` (JWT) → Actualiza (marcar `done`, prioridad/fecha o título).
* `PATCH /api/me` (JWT) → Actualiza nombre del usuario autenticado.

> El token se envía con `Authorization: Bearer <token>`.

---

## 📦 Scripts útiles

### Backend

```bash
npm run dev      # nodemon
npm start        # producción
npm run seed     # crea usuario demo + tareas
```

### Frontend

```bash
npm start        # ng serve
npm run build    # ng build
```

---

## ❗ Troubleshooting

* **CORS bloqueado**: revisa `CLIENT_ORIGIN` en `/backend/.env` (debe ser `http://localhost:4200` en local).
* **MongoDB no conecta**: verifica `MONGO_URI`. En Atlas, usa la cadena completa (usuario/clave/DB).
* **Token no adjunto**: confirma que estás logueado; si el backend devuelve 401, revisa el **interceptor** y el `localStorage`.
* **Calendario no navega**: comprueba que `/calendar` esté en `app-routing.module.ts` y que el **Navbar** use `[routerLink]`.

---

## Autor
**Michael Collazos**
