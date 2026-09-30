# jonathan-0294

Aplicación web de apuestas simuladas en carreras de caracoles.

- **Frontend:** React + TypeScript (Vite) — carpeta [`client/`](client)
- **Backend:** Express + TypeScript — carpeta [`server/`](server), incluye el mock de pagos **SnailPay**
- **Persistencia:** `localStorage` en el navegador (usuario, sesión y saldo)

## Requisitos

- Node.js 20 o superior
- npm 10 o superior

## Instalación

Cada proyecto es independiente y tiene sus propias dependencias. Hay que instalar los dos:

```bash
cd server
npm install
```

```bash
cd client
npm install
```

## Ejecución en desarrollo

Se necesitan dos terminales, una por proyecto.

**Terminal 1: API**

```bash
cd server
npm run dev
```

**Terminal 2: frontend**

```bash
cd client
npm run dev
```

| Proyecto | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API | http://localhost:3001 |