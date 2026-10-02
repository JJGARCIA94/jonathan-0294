# jonathan-0294 · Caracol Derby

[![CI](https://github.com/JJGARCIA94/jonathan-0294/actions/workflows/ci.yml/badge.svg)](https://github.com/JJGARCIA94/jonathan-0294/actions/workflows/ci.yml)

Aplicación web de apuestas simuladas en carreras de caracoles. Cada usuario crea una cuenta, consulta su saldo y las estadísticas de las carreras del día, y recarga saldo con **SnailPay**, una pasarela de pagos simulada.

**Demo:** https://jonathan-0294.onrender.com

> La demo usa el plan gratuito de Render: el servidor se apaga tras 15 minutos sin visitas y la primera carga puede tardar alrededor de un minuto mientras arranca.

## Índice

- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Ejecución en desarrollo](#ejecución-en-desarrollo)
- [Pruebas](#pruebas)
- [SnailPay: cómo reproducir cada respuesta](#snailpay-cómo-reproducir-cada-respuesta)
- [Variables de entorno](#variables-de-entorno)
- [Ejecución en modo producción](#ejecución-en-modo-producción)
- [Integración continua y despliegue](#integración-continua-y-despliegue)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Datos guardados en el navegador](#datos-guardados-en-el-navegador)

## Tecnologías

| Proyecto | Tecnologías |
|---|---|
| `client/` | React 19, TypeScript, Vite, React Router, Bootstrap 5, Recharts |
| `server/` | Express 5, TypeScript, helmet, express-rate-limit |
| Pruebas | Vitest, Testing Library, jsdom, supertest |
| Calidad | oxlint, TypeScript en modo estricto, GitHub Actions |

El frontend y el backend son proyectos independientes: cada uno tiene su propio `package.json`, `package-lock.json` y `node_modules`.

## Requisitos

- Node.js 22.22 o superior (la integración continua usa Node 24)
- npm (incluido con Node.js)

## Instalación

Hay que instalar las dependencias de los dos proyectos:

```bash
cd server
npm ci
```

```bash
cd client
npm ci
```

`npm ci` instala exactamente las versiones registradas en `package-lock.json`.

## Ejecución en desarrollo

Se necesitan dos terminales, una por proyecto. El servidor no necesita configuración: sin archivo `.env` usa los valores por defecto.

**Terminal 1: API y SnailPay**

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

En desarrollo, Vite redirige las peticiones a `/api` hacia `http://localhost:3001`, por lo que el frontend necesita que la API esté encendida para poder recargar saldo.

### Recorrido rápido

1. Abre http://localhost:5173 y entra a **Crear cuenta**. Al registrarte, la sesión se inicia sola y llegas al dashboard con saldo de $0.00.
2. Presiona **Recargar saldo** y usa la tarjeta de prueba `1234 1234 1234 1234`, vencimiento `12/26` y CVV `543`.
3. El saldo se actualiza al momento y la recarga aparece en el historial. Recarga la página: la sesión y el saldo se conservan.
4. Para probar los errores, usa las tarjetas de la sección [SnailPay](#snailpay-cómo-reproducir-cada-respuesta).

## Pruebas

Las pruebas se ejecutan por separado en cada proyecto y no necesitan que la API esté encendida.

```bash
cd client
npm test
```

```bash
cd server
npm test
```

| Comando (en cada proyecto) | Qué hace |
|---|---|
| `npm test` | Ejecuta todas las pruebas una vez |
| `npm run test:watch` | Vuelve a ejecutar las pruebas al guardar cambios |
| `npm run typecheck` | Revisa los tipos de TypeScript |
| `npm run lint` | Revisa el código con oxlint |
| `npm run build` | Genera la versión de producción |

### Qué cubren

**client/** (las pruebas están junto al archivo que prueban, como `*.test.ts(x)`):

| Archivo | Qué comprueba |
|---|---|
| `utils/validations.test.ts` | Reglas de nombre, correo, contraseña y del formulario de recarga |
| `utils/cardFormat.test.ts` | Formato de la tarjeta, la fecha MM/AA y el monto mientras se escribe, y la tarjeta enmascarada |
| `services/password.test.ts` | Que la contraseña no queda en texto plano, que la sal cambia el hash y que solo verifica la correcta |
| `services/authService.test.ts` | Registro con saldo $0, correo duplicado, login, logout y sesión recuperada al recargar la página |
| `services/raceSimulation.test.ts` | Congruencia del día simulado: 6 carreras, 6 caracoles y totales que cuadran, con 1000 semillas |
| `services/rechargeService.test.ts` | Que el saldo solo cambia con un cobro aprobado y congruente, y que cada error, timeout o falla de conexión muestra su mensaje |
| `pages/DashboardPage.test.tsx` | Recarga aprobada que actualiza saldo e historial, y recarga rechazada que no toca el saldo |
| `App.test.tsx` | Ruta protegida, registro → logout → login, y errores de los formularios |
| `components/ErrorBoundary.test.tsx` | Mensaje de error en lugar de una pantalla en blanco |

**server/** (en la carpeta `tests/`, con supertest sobre la aplicación de Express):

| Archivo | Qué comprueba |
|---|---|
| `snailpay.test.ts` | Cada escenario de SnailPay, los campos de la respuesta y los encabezados de seguridad |
| `rateLimit.test.ts` | La respuesta 429 al superar el límite de intentos |
| `clientHosting.test.ts` | Que Express sirve el frontend compilado sin tapar las rutas de `/api` |
| `health.test.ts` | El endpoint de salud |

## SnailPay: cómo reproducir cada respuesta

SnailPay es un mock dentro del servidor de Express. No se conecta a ningún servicio real.

### Endpoint

`POST /api/snailpay/charges` con un cuerpo JSON:

| Campo | Tipo | Regla |
|---|---|---|
| `card_number` | string | 16 dígitos; se aceptan espacios |
| `expiration_date` | string | Formato `MM/AA` |
| `cvv` | string | 3 dígitos |
| `cardholder_name` | string | No vacío |
| `amount` | number | Mayor a 0, máximo 50,000 y hasta 2 decimales |
| `payer_id` | string | Identificador del usuario |
| `payer_email` | string | Correo del usuario |

El frontend envía `payer_id` y `payer_email` automáticamente a partir del usuario con sesión iniciada.

### Escenarios

En todos los casos sin datos inválidos basta con usar un nombre cualquiera y un monto válido. Las tarjetas se pueden escribir con o sin espacios.

| Escenario | Cómo provocarlo | HTTP | `status` | `status_detail` |
|---|---|---|---|---|
| Cobro aprobado | Tarjeta `1234 1234 1234 1234`, vencimiento `12/26`, CVV `543` | 201 | `approved` | `accredited` |
| Fondos insuficientes | Tarjeta `4000 0000 0000 0002` con cualquier vencimiento y CVV válidos | 402 | `rejected` | `insufficient_funds` |
| Tarjeta rechazada | Cualquier otra tarjeta de 16 dígitos, por ejemplo `4111 1111 1111 1111` | 402 | `rejected` | `card_declined` |
| Vencimiento incorrecto | Tarjeta aprobada con un vencimiento distinto de `12/26` | 402 | `rejected` | `bad_expiration_date` |
| CVV incorrecto | Tarjeta aprobada, vencimiento `12/26` y un CVV distinto de `543` | 402 | `rejected` | `bad_cvv` |
| **Error del sistema** | Tarjeta `5000 0000 0000 0009`: SnailPay responde que no está disponible | 503 | `error` | `service_unavailable` |
| Tiempo de espera agotado | Tarjeta `5000 0000 0000 0017`: SnailPay tarda 15 s y responde 504. La app cancela la espera a los 10 s y avisa que el saldo no cambió | 504 | `error` | `processing_timeout` |
| Demasiados intentos | Más de 20 cobros en un minuto desde la misma IP. El contador vive en memoria: se reinicia al reiniciar el servidor | 429 | `rejected` | `too_many_requests` |
| Datos inválidos | Ver la tabla siguiente | 400 | `rejected` | Según el campo |
| Error interno | No se provoca con datos: es la respuesta de respaldo ante un fallo inesperado del servidor | 500 | `error` | `internal_error` |

**Datos inválidos.** El formulario de la app valida antes de enviar, así que estos casos se reproducen llamando al API directamente (ver el ejemplo con curl):

| Dato enviado | `status_detail` |
|---|---|
| Cuerpo que no es JSON válido | `invalid_request` |
| `card_number` sin 16 dígitos | `invalid_card_number` |
| `expiration_date` fuera del formato `MM/AA` | `invalid_expiration_date` |
| `cvv` sin 3 dígitos | `invalid_cvv` |
| `cardholder_name` vacío | `invalid_cardholder_name` |
| `amount` que no es número, es 0 o menor, pasa de 50,000 o tiene más de 2 decimales | `invalid_amount` |
| `payer_id` vacío o `payer_email` sin formato de correo | `invalid_payer` |

Solo el cobro aprobado (HTTP 201 con `status: "approved"` y el mismo monto solicitado) suma saldo. En cualquier otro escenario el saldo no cambia.

### Formato de la respuesta

Todas las respuestas, aprobadas o no, tienen los mismos campos:

| Campo | Contenido |
|---|---|
| `id` | Identificador de la operación (`ch_` + UUID) |
| `status` | `approved`, `rejected` o `error` |
| `status_detail` | Detalle del resultado (ver las tablas anteriores) |
| `transaction_amount` | Monto solicitado (`null` si no se envió un número) |
| `date_created` | Fecha de creación en formato ISO 8601 (UTC) |
| `authorization_code` | Código de 6 dígitos; `null` si el cobro no se aprobó |
| `reference` | Referencia de la operación (`SNP-AAAAMMDD-XXXXXXXX`) |
| `payer_id` | Identificador del usuario |
| `payer_email` | Correo del usuario |
| `card_number` | Número de tarjeta enviado |
| `cvv` | CVV enviado |

`card_number` y `cvv` se devuelven y se guardan en `localStorage` porque así lo pide el requerimiento del proyecto. En una pasarela real el CVV nunca se devuelve ni se almacena (PCI DSS).

### Ejemplo con curl

Con la API encendida (en Windows, desde Git Bash):

```bash
curl -i -X POST http://localhost:3001/api/snailpay/charges -H "Content-Type: application/json" -d '{"card_number":"1234123412341234","expiration_date":"12/26","cvv":"543","cardholder_name":"Ana Lopez","amount":250,"payer_id":"6f1c2b9e-4a7d-4e3b-8c21-9d0f5a7e3b14","payer_email":"ana@correo.com"}'
```

Respuesta (`201 Created`):

```json
{
  "id": "ch_c523285b-7a5e-413b-adfe-e68cdd54511b",
  "status": "approved",
  "status_detail": "accredited",
  "transaction_amount": 250,
  "date_created": "2026-10-02T13:58:42.589Z",
  "authorization_code": "470474",
  "reference": "SNP-20261002-8B460273",
  "payer_id": "6f1c2b9e-4a7d-4e3b-8c21-9d0f5a7e3b14",
  "payer_email": "ana@correo.com",
  "card_number": "1234123412341234",
  "cvv": "543"
}
```

Para probar otro escenario, cambia `card_number` por una de las tarjetas de la tabla. Con la demo publicada, usa `https://jonathan-0294.onrender.com/api/snailpay/charges`.

## Variables de entorno

Todas son del servidor y opcionales. Para cambiarlas, crea `server/.env` (puedes partir de `server/.env.example`); ese archivo no se sube al repositorio.

| Variable | Valor por defecto | Para qué sirve |
|---|---|---|
| `PORT` | `3001` | Puerto de la API |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Origen que CORS permite llamar a la API |
| `CLIENT_DIST_DIR` | sin valor | Si se define, Express también sirve el frontend compilado desde esa carpeta (ruta relativa a `server/`) |
| `TRUST_PROXY_HOPS` | `0` | Cuántos proxies hay delante del servidor, para que el límite de intentos vea la IP real del usuario. En Render es `1` |

## Ejecución en modo producción

Para probar en local lo mismo que corre en la demo, con un solo servidor que entrega el frontend y la API:

1. Compila los dos proyectos:

   ```bash
   cd client
   npm run build
   ```

   ```bash
   cd server
   npm run build
   ```

2. Crea `server/.env` con esta línea:

   ```
   CLIENT_DIST_DIR=../client/dist
   ```

3. Inicia el servidor y abre http://localhost:3001:

   ```bash
   cd server
   npm start
   ```

## Integración continua y despliegue

- **GitHub Actions** ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)): en cada push a `main` y en cada pull request, revisa por separado `client` y `server` con `npm ci`, tipos, lint, pruebas y build.
- **Render** (web service gratuito): despliega automáticamente solo cuando la integración continua pasa.

| Ajuste en Render | Valor |
|---|---|
| Build command | `cd client && npm ci --include=dev && npm run build && cd ../server && npm ci --include=dev && npm run build` |
| Start command | `cd server && npm start` |
| Health check | `/api/health` |
| Variables | `NODE_VERSION=24.21.0`, `CLIENT_DIST_DIR=../client/dist`, `TRUST_PROXY_HOPS=1` |

## Estructura del proyecto

```
jonathan-0294/
├── .github/workflows/ci.yml   Integración continua
├── client/                    Frontend (React + Vite)
│   └── src/
│       ├── pages/             Login, registro y dashboard
│       ├── components/        Componentes de interfaz, dashboard/ y recharge/
│       ├── context/           Estado de la sesión (AuthProvider)
│       ├── hooks/             useAuth, useChargeHistory, usePageTitle
│       ├── guards/            Rutas protegidas y rutas solo para visitantes
│       ├── services/          Lógica: autenticación, localStorage, simulación y SnailPay
│       ├── constants/         Caracoles, límites de recarga, mensajes y colores
│       ├── types/             Tipos compartidos
│       ├── utils/             Validaciones, formatos y números aleatorios con semilla
│       └── test/setup.ts      Configuración de las pruebas
└── server/                    Backend (Express)
    ├── src/
    │   ├── app.ts             Arma la aplicación: seguridad, CORS, rutas y frontend
    │   ├── routes/            /api/health y /api/snailpay
    │   ├── services/          Reglas del mock de SnailPay
    │   ├── validations/       Validación del cobro
    │   └── config/            Tarjetas de prueba, montos y límites
    └── tests/
```

## Datos guardados en el navegador

Los datos viven en el `localStorage` del navegador, así que una cuenta creada en un navegador no existe en otro.

| Clave | Contenido |
|---|---|
| `snail:users` | Usuarios registrados con su saldo. La contraseña se guarda como hash PBKDF2-SHA256 con sal, nunca en texto plano |
| `snail:session` | Identificador del usuario con sesión iniciada |
| `snail:charges` | Respuestas de SnailPay de cada intento de recarga |

Para empezar de cero, borra esas claves desde las herramientas de desarrollo del navegador (Application → Local Storage).

Las carreras del día se simulan con un generador de números aleatorios cuya semilla es la fecha (AAAAMMDD): el mismo día siempre muestra los mismos resultados y las dos gráficas son congruentes entre sí.
