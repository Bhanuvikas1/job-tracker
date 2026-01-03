# Job Tracker (React + Spring Boot)

## 1) Database
Create the DB (once):

```sql
CREATE DATABASE jobs_db;
```

Update MySQL username/password in:

`backend/src/main/resources/application.properties`

## 2) Run Backend (Spring Boot)

From `job-tracker/backend`:

```bash
mvn spring-boot:run
```

Backend runs at: `http://localhost:8080`

### Auth endpoints
- `POST /api/auth/register`  (auto-login)
- `POST /api/auth/login`
- `GET  /api/auth/me`
- `POST /api/auth/logout`

### Applications endpoints (requires login)
- `GET    /api/applications`
- `POST   /api/applications`
- `PUT    /api/applications/{id}/status`
- `DELETE /api/applications/{id}`

## 3) Run Frontend (Vite + React)

From `job-tracker/frontend`:

```bash
npm install
npm run dev
```

Open: `http://localhost:5173`

## Notes
- No Spring Security is used.
- Login is handled with a simple HTTP session (`JSESSIONID`) and CORS `withCredentials`.
