# TechsStore — Frontend

> Interfaz de cliente para una TechsStore, construida con React 19, Tailwind CSS v4, React Router v7 y Zustand.

---

## Por qué construí esto

Con el backend de TechsStore quería ir más allá de los tutoriales y enfrentarme a los problemas reales que aparecen cuando una aplicación crece: autenticación con refresh tokens, reserva de inventario concurrente, colas de trabajo asíncronas, pagos con webhooks. Ese backend vivía en el vacío no tenía nada con qué probarlo de verdad ni nada que mostrarle a alguien que no supiera leer Swagger y pensé puedo construir el aplicativo y tener algo real, no solo un proyecto de GitHub que nadie use. 

---

## El caso de uso

TechsStore es una tienda de tecnología (laptops, periféricos, componentes, accesorios), el flujo completo es el siguiente:

```
Cliente visita la tienda
  → busca productos por categoría, marca o precio
  → ve el detalle con especificaciones técnicas
  → agrega al carrito (el backend reserva el stock en ese momento)
  → completa su dirección de envío
  → paga via Stripe Checkout
  → recibe confirmación por email 
  → puede consultar el estado de su orden en cualquier momento (Agente IA)

Si tiene dudas:
  → abre el chat de IA
  → pregunta "¿qué laptop me recomiendas para programar?"
  → el agente consulta la API, compara productos y responde en lenguaje natural
```

El administrador tiene su propio panel para gestionar productos, ajustar inventario, actualizar estados de órdenes y administrar usuarios.

---

## Arquitectura del sistema completo

```
┌─────────────────────────────────────────────────────────────────┐
│                        Cliente / Navegador                      │
│                   techsStore-frontend (:5173)                   │
│                                                                 │
│  ┌─────────────────┐   REST API    ┌──────────────────────────┐ │
│  │  React 19 SPA   │ ───────────▶  │ NestJS API (:3000)      
│  │  React Router 7 │               │  PostgreSQL + Redis      │ │
│  │  Zustand        │               │  BullMQ + Stripe         │ │
│  │  TanStack Query │               │  JWT Auth                | │
│  └────────┬────────┘               └──────────────────────────┘ │
│           │                                     │               │
│           │  POST /chat               TCP :4000 │               │
│           ▼                                     ▼               │
│  ┌─────────────────┐               ┌──────────────────────────┐ │
│  │ Agent HTTP      │               │ Notifications Service    │ │
│  │ Server (:3500)  │               │ Email                    | |  
│  │                 │               └──────────────────────────┘ │
│  │ LangGraph       │                                            │
│  │ GPT-4o-mini     │                                            │
│  └─────────────────┘                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Stack tecnológico y por qué elegí cada cosa

| Tecnología | Versión | Decisión |
|---|---|---|
| **React 19** | 19.x | Quería trabajar con la versión más reciente. El Concurrent Mode y los nuevos hooks son el estándar que voy a encontrar en el mercado laboral.  |
| **Vite 6** | 6.x | Build tool actual. HMR instantáneo, configuración mínima. |
| **Tailwind CSS v4** | 4.x | Elegí v4 porque cambia a un modelo CSS-first (`@import "tailwindcss"`) que elimina el archivo de configuración JS. Quería entender la dirección futura del framework, no solo lo que ya conozco. |
| **React Router v7** | 7.x | La versión con loaders y el modelo de enrutamiento de datos. Es lo que Remix absorbió y hacia donde va el ecosistema. |
| **Zustand v5** | 5.x | Para estado global (auth, carrito, UI). Lo elegí sobre Redux porque la API es mínima y no requiere boilerplate. La persistencia en localStorage con `zustand/middleware` es un patrón muy limpio para tokens JWT. |
| **TanStack Query v5** | 5.x | Para estado del servidor (productos, órdenes). Separa limpiamente lo que viene de la API de lo que es estado local de UI. El cache inteligente evita refetches innecesarios. |
| **Axios** | 1.x | Interceptor de request/response para el flujo de refresh automático de tokens. Más ergonómico que fetch para este caso. |
| **React Hook Form + Zod** | — | RHF para formularios con mínimo re-render. Zod para validación tipada. La combinación con `zodResolver` es el estándar actual. |
| **Framer Motion v11** | 11.x | Animaciones: stagger en product grids, transiciones de página, slide-in del carrito y del chat. Elegí Framer Motion porque trabaja directamente sobre el DOM sin conflictos con Tailwind. |
| **Lucide React** | — | Iconografía consistente y tree-shakeable. |
| **TypeScript** | 5.x | Todo el proyecto. Sin excepciones. |

---

## Estructura del proyecto

```
techsStore-frontend/
├── src/
│   ├── api/                    # Clientes HTTP por dominio
│   │   ├── client.ts           # Axios + interceptor refresh automático
│   │   ├── auth.ts
│   │   ├── products.ts
│   │   ├── cart.ts
│   │   ├── orders.ts
│   │   ├── payments.ts
│   │   ├── users.ts
│   │   └── agent.ts
│   │
│   ├── components/
│   │   ├── ui/                 # Componentes base reutilizables
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── PageTransition.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx      # Nav + carrito + menú de usuario
│   │   │   ├── Footer.tsx
│   │   │   ├── AdminSidebar.tsx
│   │   │   └── ChatWidget.tsx  # Chat de IA flotante
│   │   └── shared/
│   │       ├── ProductCard.tsx
│   │       ├── ProductGrid.tsx
│   │       ├── ProductFilters.tsx
│   │       ├── CartDrawer.tsx
│   │       ├── PriceDisplay.tsx
│   │       └── OrderStatusBadge.tsx
│   │
│   ├── hooks/
│   │   ├── useProducts.ts      # TanStack Query: productos y categorías
│   │   └── useOrders.ts        # TanStack Query: órdenes
│   │
│   ├── pages/
│   │   ├── public/             # Home, Products, ProductDetail
│   │   ├── auth/               # Login, Register
│   │   ├── customer/           # Cart, Orders, OrderDetail, Checkout, Profile
│   │   ├── admin/              # Dashboard, Products, Orders, Users
│   │   └── NotFoundPage.tsx
│   │
│   ├── router/
│   │   ├── index.tsx           # createBrowserRouter
│   │   ├── PublicLayout.tsx
│   │   ├── AuthLayout.tsx      # Redirect si ya autenticado
│   │   ├── CustomerLayout.tsx  # Guard de autenticación
│   │   └── AdminLayout.tsx     # Guard de rol ADMIN
│   │
│   ├── stores/
│   │   ├── authStore.ts        # Tokens JWT + usuario; persist en localStorage
│   │   ├── cartStore.ts        # Estado del carrito + drawer
│   │   └── uiStore.ts          # Cola de toasts
│   │
│   ├── types/
│   │   └── index.ts            # Tipos derivados del backend
│   │
│   └── lib/
│       ├── utils.ts            # cn(), formatCents(), formatDate()
│       └── constants.ts        # ROUTES, API_URL
│
├── .env                        # Variables de entorno (no subir a git)
├── .env.example
├── vite.config.ts
├── tsconfig.app.json
└── index.css                   # Tailwind v4 + tema + fuentes
```

---

## Flujos principales implementados

### Autenticación con refresh automático

El `authStore` persiste los tokens en localStorage con Zustand `persist`. Al arrancar la aplicación, `main.tsx` llama `authStore.initClient()` antes del primer render, inyectando los tokens en el cliente Axios.

Cuando un token expira, el interceptor de respuesta detecta el 401, pausa todos los requests en cola, ejecuta **un único** `POST /auth/refresh`, y los reintenta todos con el nuevo token. Si el refresh falla, hace logout automático.

### Reserva de inventario

El backend usa un sistema de tres fases: al agregar al carrito se reserva stock, al expirar el carrito se libera, y al confirmar el pago Stripe se descuenta definitivamente. El frontend respeta este flujo el carrito tiene TTL de 30 minutos y el `CartDrawer` refleja cantidades en tiempo real.

### Flujo de pago

```
CartPage → [usuario llena dirección de envío]
  → POST /orders (crea orden PENDING)
  → POST /payments/checkout (obtiene URL de Stripe)
  → window.location.href = url (redirect a Stripe)
  → Stripe redirige a /checkout/success
  → CheckoutSuccessPage limpia el carrito
```

### Chat con IA

El widget flotante en la esquina inferior izquierda se conecta al servidor Express del agente (`agent-ecommerce`) que envuelve el grafo LangGraph. El agente clasifica la intención del mensaje (pregunta, recomendación, estado de orden, tracking) y responde en lenguaje natural usando GPT-4o-mini.

---

## Instalación y configuración

### Prerrequisitos

- Node.js 20+
- El backend de TechsStore corriendo en `http://localhost:3000`
- (Opcional) El servidor del agente corriendo en `http://localhost:3500`

### Variables de entorno

Copia `.env.example` a `.env`:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_AGENT_URL=http://localhost:3500
```

### Instalación

```bash
npm install
npm run dev
```

La aplicación abre en `http://localhost:5173`.

### Build de producción

```bash
npm run build
npm run preview
```

---

## Levantar el stack completo

```bash
# 1. Backend NestJS
cd "13. Ecommerce/techsStore"
npm run start:dev

# 2. Servicio de notificaciones (otra terminal, misma carpeta)
npm run start:dev:notifications

# 3. Frontend
cd "13. Ecommerce/techsStore-frontend"
npm run dev

# 4. Servidor del agente de IA
cd "12. Agentes/agent-ecommerce"
npm install        # solo la primera vez
npm run dev:server
```

---

## Funcionalidades por rol

### Visitante (sin cuenta)

- Navegar el catálogo completo con filtros por categoría, marca y precio
- Buscar productos
- Ver detalle completo de cada producto con galería de imágenes (por implementar) y especificaciones
- Usar el chat de IA para preguntas y recomendaciones

### Cliente (cuenta registrada)

Todo lo anterior, más:

- Agregar productos al carrito (el backend reserva el stock en ese momento)
- Modificar cantidades y eliminar ítems con actualización optimista
- Completar el checkout con dirección de envío y pagar via Stripe
- Ver historial de órdenes con timeline de progreso visual
- Editar su perfil (nombre y teléfono)

### Administrador

Todo lo anterior, más panel exclusivo:

- **Dashboard**: productos, órdenes y usuarios; órdenes recientes
- **Productos**: crear, editar, desactivar; ajustar inventario manualmente
- **Órdenes**: filtrar por estado o número; avanzar el flujo (PENDING → PAID → PROCESSING → SHIPPED → DELIVERED)
- **Usuarios**: cambiar roles entre CLIENT/ADMIN; desactivar cuentas

---

## Decisiones de arquitectura que aprendí

**URL como fuente de verdad en filtros.** En `ProductsPage` usé `useSearchParams` de React Router en vez de estado local. Esto hace que cualquier combinación de filtros sea una URL compartible y que el botón "atrás" del navegador funcione correctamente. Fue más trabajo inicial pero el resultado es mucho más robusto.

**updates en el carrito.** Cuando el usuario elimina un ítem, el carrito se actualiza inmediatamente en la UI antes de que llegue la respuesta del servidor. Si falla, se revierte. La percepción de velocidad mejora notablemente.

**Cola de refresh con failedQueue.** El interceptor de Axios no solo reintenta el request que causó el 401 gestiona una cola de todos los requests que llegaron mientras el refresh estaba en curso. Esto evita múltiples llamadas simultáneas a `POST /auth/refresh` y garantiza que todos se completen con el nuevo token.

**Zustand sin Provider.** No necesité envolver la app en un `<StoreProvider>`. Zustand funciona como un singleton de módulo, lo que simplifica considerablemente el árbol de componentes y hace trivial acceder al store desde fuera de React (el cliente Axios lo hace).

**El agente como servicio separado.** Mantuve el agente LangGraph como un proceso independiente accesible via HTTP en vez de integrarlo directamente en el frontend o el backend. Esto me permite iterar sobre los prompts y la lógica del agente sin tocar el resto del sistema.

---

## Estructura del repositorio completo

Este frontend forma parte de un sistema mayor:

```
Dev/
├── 12. Agentes/
│   └── agent-ecommerce/        # LangGraph multi-agent (GPT-4o-mini)
│       └── src/server.ts       # Servidor HTTP que expone el agente
│
└── 13. Ecommerce/
    ├── techsStore/             # Backend NestJS (API principal)
    │   ├── apps/api/           # Dominio principal (puerto 3000)
    │   └── apps/notifications/ # Microservicio TCP (puerto 4000)
    │
    └── techsStore-frontend/    # Este repositorio (puerto 5173)
```

---

*Construido como proyecto de aprendizaje real con la intención de desplegarlo.*
