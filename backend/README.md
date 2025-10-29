
API **Express + MongoDB (Mongoose)** con **JWT** para gestor de tareas.
Incluye registro/login, endpoints protegidos, CORS y modelos `User` y `Task`.

---

## ✅ Requisitos previos
- **Node.js 18+** (LTS recomendado)
- **npm 9+**
- **MongoDB** local o **Atlas**

---

## ⚙️ Variables de entorno

Crea un archivo `.env` a partir de `.env.example`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/michaelcollazos_final
# Opción B: MongoDB Atlas (reemplaza <user>, <password>, <cluster>, <db>, <appName>)
# MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.<id>.mongodb.net/<db>?retryWrites=true&w=majority&appName=<appName>
JWT_SECRET=cambia_este_valor_por_uno_largo_y_unico
PORT=4000
CLIENT_ORIGIN=http://localhost:4200
````

> `CLIENT_ORIGIN` se usa para CORS (origen del frontend).

---

## 📦 Instalación y ejecución

```bash
# 1) Instalar dependencias
npm install

# 2) Configurar variables
cp .env.example .env
# (Edita .env con tu MONGO_URI/JWT_SECRET/PORT/CLIENT_ORIGIN)

# 3) Ejecutar
npm run dev   # Desarrollo con nodemon → http://localhost:4000
# o
npm start     # Producción (node)
```

> La API expone la base en `http://localhost:4000/api` (por defecto).

---

## 🧱 Estructura

```
backend/
├─ src/
│  ├─ app.js                 # Configuración de Express, CORS, middlewares
│  ├─ server.js              # Punto de arranque
│  ├─ config/db.js           # Conexión a MongoDB
│  ├─ middlewares/auth.js    # Verificación JWT
│  ├─ models/
│  │  ├─ User.js             # { name, email(unique), password(hash) }
│  │  └─ Task.js             # { title, done, priority, dueDate, user: ObjectId }
│  ├─ controllers/
│  │  ├─ auth.controller.js  # register, login, updateMe
│  │  └─ task.controller.js  # list, create, patch, delete, (clear-completed opc.)
│  └─ routes/
│     ├─ auth.routes.js
│     └─ task.routes.js
├─ .env.example
└─ package.json
```

---

## 🔐 Autenticación

* **JWT** en el header:
  `Authorization: Bearer <token>`
* El **login** y **register** devuelven `{ token, user }`.
* Rutas de **tareas** protegidas por `middlewares/auth.js`.

---

## 🌐 CORS

* Permite por defecto `http://localhost:4200`.
* En producción, ajusta `CLIENT_ORIGIN` a tu dominio del frontend.

---

## 🛣️ Endpoints

### Auth

* **POST** `/api/auth/register`
  **Body:** `{ "name": "Juan", "email": "a@a.com", "password": "123456" }`
  **200:** `{ "token": "...", "user": { "id", "name", "email" } }`

* **POST** `/api/auth/login`
  **Body:** `{ "email": "a@a.com", "password": "123456" }`
  **200:** `{ "token": "...", "user": { "id", "name", "email" } }`

* **PATCH** `/api/auth/me` *(JWT)*
  **Body:** `{ "name": "Nuevo nombre" }`
  **200:** `{ "id", "name", "email" }`

### Tasks *(todas requieren JWT)*

* **GET** `/api/tasks`
  Lista las tareas del usuario autenticado.

* **POST** `/api/tasks`
  **Body:**

  ```json
  {
    "title": "Llamar cliente",
    "priority": "low" | "med" | "high",
    "dueDate": "2025-11-19"  // opcional, formato YYYY-MM-DD
  }
  ```

  **200:** tarea creada.

* **PATCH** `/api/tasks/:id`
  Actualiza campos: `title`, `done`, `priority`, `dueDate`.
  **Body (ejemplos):**

  * `{ "done": true }`
  * `{ "title": "Nuevo título" }`
  * `{ "priority": "high", "dueDate": "2025-12-01" }`

* **DELETE** `/api/tasks/:id`
  Elimina una tarea del usuario autenticado.

* **DELETE** `/api/tasks/clear-completed` *(opcional, si se incluyó)*
  Elimina **todas** las tareas completadas del usuario.

---

## 🧪 cURL de ejemplo

```bash
# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@demo.com","password":"123456"}'

# Crear tarea
curl -X POST http://localhost:4000/api/tasks \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Llamar cliente","priority":"med","dueDate":"2025-11-19"}'

# Marcar completada
curl -X PATCH http://localhost:4000/api/tasks/<ID> \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"done":true}'
```

---

## 🛡️ Validaciones y seguridad

* Email **único** y contraseña **hasheada** con `bcrypt`.
* Validación básica de campos en controladores.
* JWT firmado con `JWT_SECRET` (mantener en secreto).
* CORS restringido al origen configurado.

---

## 🩺 Troubleshooting

* **Puerto 4000 ocupado**
  Cambia `PORT` en `.env`.

* **CORS bloqueado**
  Verifica que `CLIENT_ORIGIN` coincide con el host del frontend.

* **MongoDB no conecta**
  Revisa `MONGO_URI`. En Atlas, usa la **cadena completa** con usuario/clave y IP whitelisteada.

* **401/403 en tareas**
  Asegúrate de enviar `Authorization: Bearer <token>` y que el token no esté expirado/inválido.

---
