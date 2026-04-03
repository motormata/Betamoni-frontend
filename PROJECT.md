# BetaMoni Admin - Project Documentation

## Project Overview

**Project Name:** BetaMoni Admin Dashboard  
**Type:** Internal admin application  
**Purpose:** Mobile-first fintech admin interface for BetaMoni, a Nigerian nano-lending platform that provides quick, small loans to market women and traders.

**Current Phase:** Dashboard & User Management Modules Completed  
**Target Users:** Admins, Supervisors, and Superadmins representing the internal BetaMoni team.

---

## Tech Stack

### Core Framework

- **React 18** with TypeScript
- **Vite** - Build tool and dev server
- **React Router v7** - Navigation (declarative mode)

### State Management

- **Redux Toolkit** - Global state management
- **RTK Query** - API calls, caching, and server state

### Styling & UI

- **Tailwind CSS v3.4** - Utility-first CSS framework
- **shadcn/ui** - Customizable component library
- **CSS Variables** - Design tokens approach
- **Lucide React** - Icon library

### Animation & Interaction

- **Framer Motion** - Animation library

### Development Tools

- **TypeScript** - Type safety
- **Vitest** - Testing framework
- **npm** - Package manager

### Build Configuration

- **PostCSS** - CSS processing
- **Autoprefixer** - Browser compatibility

---

## Architecture Decisions

### 1. Role-Based Module Structure

**Decision:** Organize features primarily by user role (`superadmin`, `supervisor`, `agent`) rather than generic features.  
**Rationale:**

- Modules like loans and dashboards vary drastically between an agent and a superadmin.
- Isolating by role makes it easier to enforce authorization boundaries.
- Reusable elements are extracted to a globally shared `/components/shared/` folder.
- Scales better for role-specific feature sets without entangling logic.

### 2. Centralized API Layer (Option A)

**Decision:** All API endpoints in `/src/api/endpoints/`  
**Rationale:**

- Fintech requires audit trails - easy to see all API calls
- Solo developer - no team conflicts about ownership
- RTK Query encourages centralized setup
- Better for compliance and security reviews

### 3. Design System First

**Decision:** Set up design tokens before building components  
**Rationale:**

- Ensures visual consistency from day one
- Components automatically inherit design decisions
- Easy to rebrand or adjust styling globally
- Mobile-first approach requires careful spacing/typography

### 4. Tailwind v3.4 (Stable) Over v4 (Beta)

**Decision:** Use production-ready v3.4  
**Rationale:**

- v4 is still in beta
- v3.4 is battle-tested and stable
- Lower risk for production fintech application

### 5. JWT in localStorage synced with Redux AuthSlice

**Decision:** Store auth token in Redux (`authSlice`) and sync with localStorage  
**Rationale:**

- Redux is the single source of truth for the application state.
- LocalStorage provides cross-refresh persistence so the user doesn't get logged out on F5.
- The `AuthProvider` component checks this token on mount and validates it against `/api/me`.

---

## Project Structure

```
betamoni-admin/
├── .env.development          # Dev environment variables
├── .env.production          # Production environment variables
├── public/                  # Static assets
├── src/
│   ├── api/                 # API Layer (RTK Query)
│   │   ├── baseApi.ts       # Base RTK Query configuration
│   │   └── endpoints/       # API endpoint definitions
│   │       └── authApi.ts   # Authentication endpoints
│   │
│   ├── features/            # Role-Based Modules
│   │   ├── auth/            # Auth pages & components
│   │   ├── superadmin/      # Admin dashboard, staff, clusters, loans
│   │   ├── supervisor/      # Supervisor-specific pages
│   │   └── agent/           # Agent-specific pages
│   │
│   ├── components/          # Shared Components
│   │   ├── ui/              # shadcn components (Button, Input, etc.)
│   │   ├── layout/          # Layout components (Sidebar, Header)
│   │   ├── feedback/        # Loading & error components
│   │   └── shared/          # Domain-agnostic reusable pieces (Badges, Cards)
│   │
│   ├── lib/                 # Utility Libraries
│   │   ├── utils.ts         # shadcn cn() utility
│   │   └── env.ts           # Environment variable helpers
│   │
│   ├── store/               # Redux Store
│   │   ├── index.ts         # Store configuration
│   │   ├── hooks.ts         # Typed Redux hooks
│   │   └── slices/          # Redux slices
│   │       └── appSlice.ts  # Global UI state
│   │
│   ├── routes/              # Routing
│   │   ├── index.tsx        # Route definitions
│   │   └── ProtectedRoute.tsx  # Auth guard
│   │
│   ├── styles/              # Design System
│   │   └── index.css        # All design tokens & Tailwind imports
│   │
│   ├── types/               # TypeScript Definitions
│   │   ├── auth.types.ts    # Auth-related types
│   │   ├── dashboard.types.ts # Dashboard-related types (Summary, Portfolio, etc.)
│   │   └── staff.types.ts    # User management & role types
│   │
│   ├── App.tsx              # Root component
│   └── main.tsx             # Application entry point
│
├── package.json
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.ts       # Tailwind configuration
└── postcss.config.js        # PostCSS configuration
```

### Folder Organization Rules

**`/features`** - Role-Based modules

- Grouped by account type (`superadmin`, `supervisor`, `agent`) and core infra (`auth`, `settings`).
- Each module handles its own specific views and logic.
- If 2+ modules need a specific component, move it to `/components/shared`.

**`/components`** - Shared components

- `/ui` = shadcn components (Button, Card, Input)
- `/layout` = Layouts used across features
- `/feedback` = Loading states, error boundaries
- `/shared` = App-specific reusable presentational elements (DetailCard, SummaryCard, PageHeader)

**`/api`** - API layer

- `baseApi.ts` = RTK Query base setup
- `/endpoints` = Specific API endpoints by feature

**`/store`** - Redux state

- `index.ts` = Store configuration
- `hooks.ts` = Typed useSelector/useDispatch
- `/slices` = Redux slices for non-API state

---

## Design System

### Design Tokens Approach

All visual decisions live in CSS variables, mapped to Tailwind utilities.

**Location:** `src/styles/index.css`

### Color System (HSL Format)

```css
/* Primary - Green (prosperity/success theme) */
--primary: 142 71% 45%;
--primary-foreground: 144 61% 97%;

/* Secondary - Blue (trust/security) */
--secondary: 217 91% 60%;
--secondary-foreground: 222 47% 11%;

/* Destructive - Error states */
--destructive: 0 84% 60%;
--destructive-foreground: 0 0% 98%;

/* Neutral colors */
--background: 0 0% 100%;
--foreground: 240 10% 3.9%;
--muted: 240 4.8% 95.9%;
--muted-foreground: 240 3.8% 46.1%;
```

### Naming Convention

**Semantic naming** (by purpose, not appearance):

- ✅ `--primary` (tells you when to use it)
- ❌ `--green-500` (doesn't tell you meaning)

### Usage in Components

```tsx
// Tailwind automatically reads CSS variables
<button className="bg-primary text-primary-foreground">Login</button>
```

### Mobile-First Typography

- Minimum body text: 16px (prevents iOS auto-zoom)
- Based on 4px grid system
- Readable line heights (1.5 for body, 1.25 for headings)

---

## State Management Architecture

### Redux Toolkit + RTK Query

**Mental Model:** Redux = Central kitchen, RTK Query = Waiter/chef system

### Key Concepts

**Store** - Single source of truth for all state  
**Slice** - One feature's state (e.g., auth slice, UI slice)  
**Reducer** - Pure function that updates state  
**Action** - Event that happened (user clicked, data arrived)  
**Selector** - Read specific data from store

### RTK Query Concepts

**Query** - GET requests (reading data)

- Auto-fetches on component mount
- Caches results
- Shares data across components

**Mutation** - POST/PUT/DELETE requests (changing data)

- Manually triggered
- Returns [trigger, result]
- Used for login, create, update, delete

**Tags** - Cache invalidation system

- `providesTags`: "This data is about X"
- `invalidatesTags`: "Refetch all data about X"

### Authentication Flow

```
1. User submits login form (`{ login, password }`)
2. Component calls `useLoginMutation()`
3. RTK Query hits POST `/api/login`
4. Server responds with an envelope: `{ success: true, message: "Login successful", data: { user, token, token_type } }`
5. `authApi`'s `onQueryStarted` extracts the nested `data.token` and `data.user`
6. `authApi` dispatches `setCredentials` which saves state to Redux and localStorage
7. UI reacts to `isAuthenticated === true` and redirects to `/dashboard`
8. On reload, `AuthProvider` reads the token and calls `useLazyGetCurrentUserQuery` (`/api/me`) to validate the session.
```

### Base API Configuration

**Location:** `src/api/baseApi.ts`

**Key Features:**

- Automatic auth header injection via `prepareHeaders`
- Centralized error handling
- Tag-based cache invalidation
- Environment-based base URL

### Pattern: How to Add New Endpoints

1. Create endpoint file in `/api/endpoints/`
2. Define TypeScript types for request/response
3. Use `baseApi.injectEndpoints()`
4. Define queries (GET) or mutations (POST/PUT/DELETE)
5. Add appropriate tags for cache management
6. Export auto-generated hooks
7. Use hooks in components

---

## Component Patterns

### shadcn/ui Components

**Philosophy:** Copy, don't install

- Components live in your codebase (`/components/ui`)
- Fully customizable
- Use design tokens automatically
- Built with Radix UI primitives

### Pattern: Compound Components

Used for complex components with multiple parts:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

### Pattern: Container/Presenter (Smart/Dumb)

**Container** (Smart) - Handles logic, data fetching:

```tsx
function LoginContainer() {
  const [login, { isLoading }] = useLoginMutation();
  return <LoginForm onSubmit={login} isLoading={isLoading} />;
}
```

**Presenter** (Dumb) - Just renders UI:

```tsx
function LoginForm({ onSubmit, isLoading }) {
  return <form onSubmit={onSubmit}>...</form>;
}
```

### Pattern: Custom Hooks

Extract reusable logic:

```tsx
function useAuth() {
  const [login] = useLoginMutation();
  const [logout] = useLogoutMutation();
  const { data: user } = useGetCurrentUserQuery();

  return { login, logout, user };
}
```

---

## Current Implementation Status

### ✅ Completed

1. **Project Setup**
   - Vite + React + TypeScript initialized
   - All dependencies installed
   - Path aliases configured (`@/`)

2. **Design System**
   - CSS variables defined in `styles/index.css`
   - Tailwind v3.4 configured
   - Color, spacing, typography tokens established

3. **Redux + RTK Query**
   - Store configured with RTK Query middleware
   - Base API created with auth header injection
   - Typed hooks (useAppDispatch, useAppSelector)

4. **Authentication Module**
   - Auth endpoints defined (login, logout, getCurrentUser)
   - LoginForm component with validation
   - LoginPage container
   - Toast notifications for errors/success
   - Protected route guard

5. **Routing**
   - React Router v7 configured
   - Basic routes (/, /login, /dashboard)
   - ProtectedRoute wrapper for auth

6. **shadcn Components**
   - Button, Input, Card, Label, Toast, Skeletons
   - Consistent styling via design tokens

7. **Backend Integration & Authentication**
   - Connected to live dev backend (`api.dev.betamoni.com.ng`)
   - Completed full login/logout flow with JWT management
   - Persistent login via `AuthProvider` and manual refetch validation
   - Automatic token refresh logic for 401 interceptors

8. **Dashboard Overview**
   - Consolidated API Layer: 2 queries (`getDashboardSummary` and `getHistorical`) replace 5+ individual calls.
   - Redesigned responsive grid layout (2x2 on desktop, stacked on mobile).
   - Component merging: `CashPosition` and `DailyCollections` consolidated into a high-density card.
   - Smart chart aggregation (Day/Week/Month/Year/Custom) with built-in time range selector.
   - Real-time KPI cards for Daily, Weekly, and Monthly loans.

9. **Staff & User Management**
   - UUID-based role fetching (`/api/admin/roles`) and market fetching.
   - Dynamic user creation form with field-level Laravel validation error handling.
   - Reusable `.input-field` utility class for consistent form styling.

10. **Version Control**
    - Git initialized and synced with `motormata/Betamoni-frontend`.
    - Secure `.env` handling.

### 🚧 In Progress / Pending

1. **Loading States**
   - Global loader for route transitions
   - Component-level loading skeletons for dashboard grids

2. **Error Handling**
   - Field-level validation parsing for forms
   - Global error banners for API failures
### 📋 Planned Features

- Full administrative loan management workflows
- In-depth cluster hierarchy reporting & analytics
- Transactions/Ledger module
- Advanced settings & profile management
---

## Environment Configuration

### Development Environment

**File:** `.env.development`

```
VITE_API_BASE_URL=https://api.dev.betamoni.com.ng
VITE_APP_NAME=BetaMoni Admin (Dev)
```

### Production Environment

**File:** `.env.production`

```
VITE_API_BASE_URL=https://api.betamoni.com.ng  # (Placeholder until confirmed)
VITE_APP_NAME=BetaMoni Admin
```

### Accessing Environment Variables

**File:** `src/lib/env.ts`

Centralized env variable access with validation:

```ts
export const ENV = {
  API_BASE_URL: getEnvVar("VITE_API_BASE_URL"),
  APP_NAME: getEnvVar("VITE_APP_NAME"),
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
};
```

**Note:** All env variables must be prefixed with `VITE_` to be exposed to the browser.

---

## Code Conventions

### File Naming

- Components: PascalCase (`LoginForm.tsx`, `UserCard.tsx`)
- Utilities: camelCase (`utils.ts`, `env.ts`)
- Types: camelCase with `.types.ts` suffix (`auth.types.ts`)

### Component Structure

- One component per file
- Export component as named export or default
- Props interface defined above component
- Hooks at top of component
- Event handlers below hooks
- JSX return at bottom

### Import Order

1. React imports
2. Third-party libraries
3. Internal utilities (@/lib)
4. Components (@/components)
5. Types (@/types)
6. Relative imports

### TypeScript Guidelines

- Always define types for props
- Use interfaces for objects
- Use type for unions/primitives
- No `any` unless absolutely necessary
- Leverage type inference when obvious

### ID Fields — Always Use `UUID`

> **Rule:** Every entity `id`, foreign-key `*_id`, and URL path parameter that identifies a backend resource **must** be typed as `UUID`, never as plain `string` or `number`.

The BetaMoni backend exclusively uses **UUID v7** strings for all primary and foreign keys. To make this explicit in the type system, a shared `UUID` alias is defined in `src/types/common.types.ts`:

```ts
// src/types/common.types.ts
export type UUID = string;
```

Import and use it in every type file:

```ts
import type { UUID } from "@/types/common.types";

export interface Borrower {
  id: UUID;           // ✅ primary key
  market_id: UUID;    // ✅ foreign key
  // ...
}

export interface CreateBorrowerPayload {
  market_id: UUID;    // ✅ body field sent to API
  // ...
}
```

**Affected ID fields by entity:**

| Entity | ID fields typed as `UUID` |
|---|---|
| **User / Auth** | `User.id` |
| **Staff** | `StaffUser.id`, `StaffUser.role_id`, `StaffUser.market_id`, `Role.id`, `CreatedUser.id`, `AssignMarketPayload.userId`, `AssignMarketPayload.market_id` |
| **Borrower** | `Borrower.id`, `Borrower.market_id`, `CreateBorrowerPayload.market_id` |
| **Agent Loan** | `AgentLoan.id`, `AgentLoan.borrower_id`, `CreateAgentLoanPayload.borrower_id` |
| **Supervisor** | `RejectLoanPayload.id`, `DisburseLoanPayload.id` |
| **Cluster / Region** | `Region.id`, `MarketRegion.id`, `ClusterMarket.id`, `ClusterMarket.region_id`, `CreateMarketPayload.region_id` |
| **Dashboard** | `Market.id`, `Market.region_id`, `DashboardQueryParams.market_id`, `HistoricalQueryParams.market_id` |

### Paginated List Responses — Use `PaginatedData<T>`

List endpoints (e.g. `GET /api/agent/borrowers`) return a Laravel paginator envelope, **not** a flat array. Use the `PaginatedData<T>` generic from `agent.types.ts`:

```ts
// api response shape for a paginated list
export interface PaginatedData<T> {
  current_page: number;
  data: T[];          // ← the actual items array
  last_page: number;
  total: number;
  // ...
}

// Compose with ApiResponse:
export type AgentBorrowersResponse = ApiResponse<PaginatedData<Borrower>>;
```

When consuming in a component, always drill to `.data.data` for the array:

```ts
const { data: res } = useGetAgentBorrowersQuery();
const borrowers = res?.data?.data ?? [];  // ✅
// NOT: res?.data ?? []                   // ❌ — that's the pagination object
```


### Styling Guidelines

- Use Tailwind utility classes
- Use `cn()` utility for conditional classes
- Avoid inline styles unless dynamic
- Use design tokens (text-primary, not text-green-500)
- Mobile-first responsive design

---

## API Integration Guide

### Current State: Live Integration (Dev Environment)

Authentication endpoints are fully wired up to the live development backend:

- Dev API: `https://api.dev.betamoni.com.ng/api`
- All responses use an envelope structure: `{ success, message, data, errors }`
- Token refresh is **not** implemented (backend handles token lifetime natively). A 401 error results in an immediate clear of credentials.

### Adding New Endpoints

**Pattern to follow:**

```ts
// 1. Define types
interface CreateLoanRequest { ... }
interface CreateLoanResponse { ... }

// 2. Add endpoint
export const loansApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createLoan: builder.mutation<CreateLoanResponse, CreateLoanRequest>({
      query: (loanData) => ({
        url: '/loans',
        method: 'POST',
        body: loanData,
      }),
      invalidatesTags: ['Loans'], // Refetch loan list after creation
    }),
  }),
})

// 3. Export hook
export const { useCreateLoanMutation } = loansApi
```

---

## Testing Strategy

### Unit Tests (Vitest)

- Test utility functions
- Test custom hooks
- Test Redux slices/reducers

### Component Tests

- Test user interactions
- Test form submissions
- Test error states
- Test loading states

### Integration Tests

- Test complete user flows
- Test API integration
- Test navigation

### E2E Tests (Future)

- Test critical user journeys
- Test across different screen sizes
- Test authentication flows

---

## Development Workflow

### Starting Development Server

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

### Running Tests

```bash
npm run test
```

### Type Checking

```bash
npx tsc --noEmit
```

---

## Common Tasks

### Adding a New Feature Module

1. Create feature folder: `src/features/[feature-name]/`
2. Create subfolders: `components/`, `pages/`, `hooks/`
3. Create API endpoints in `src/api/endpoints/[feature-name]Api.ts`
4. Add routes in `src/routes/index.tsx`
5. Add types in `src/types/[feature-name].types.ts`

### Adding a New shadcn Component

```bash
npx shadcn@latest add [component-name]
```

Component will be added to `src/components/ui/`

### Adding Global UI State

1. Create slice in `src/store/slices/[name]Slice.ts`
2. Add reducer to store in `src/store/index.ts`
3. Use typed hooks in components

---

## Troubleshooting

### Common Issues

**Issue:** TypeScript errors about path aliases  
**Fix:** Ensure `baseUrl` and `paths` are set in `tsconfig.json`

**Issue:** Tailwind classes not working  
**Fix:** Check that file is in `content` array in `tailwind.config.ts`

**Issue:** RTK Query hooks not auto-generated  
**Fix:** Ensure you're exporting from `baseApi.injectEndpoints()`

**Issue:** Environment variables undefined  
**Fix:** Ensure variable is prefixed with `VITE_` and restart dev server

**Issue:** Redux state not updating  
**Fix:** Check that reducer is added to store configuration

---

## Security Considerations

### Current Implementation

- Token stored in localStorage (development phase)
- HTTPS required in production
- No sensitive data in Redux DevTools production builds

### Future Improvements

- Migrate to httpOnly cookies
- Implement token refresh mechanism
- Add CSRF protection
- Implement rate limiting awareness
- Add request signing for sensitive operations

### Best Practices

- Never log sensitive data
- Validate all user inputs
- Sanitize data before displaying
- Use environment variables for secrets
- Regular security audits

---

## Performance Optimization

### Current Optimizations

- Vite's fast HMR (Hot Module Replacement)
- RTK Query automatic caching
- Component lazy loading (via React.lazy)
- Tailwind CSS purging unused styles

### Future Optimizations

- Code splitting by route
- Image optimization
- Bundle size analysis
- Lighthouse performance audits
- Lazy load heavy libraries

---

## Accessibility

### Current Standards

- Semantic HTML elements
- ARIA labels on interactive elements
- Keyboard navigation support (via shadcn)
- Focus visible indicators
- Color contrast compliance

### Testing

- Test with keyboard navigation
- Test with screen readers
- Verify color contrast ratios
- Check mobile touch targets (min 44px)

---

## Browser Support

### Target Browsers

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

### Mobile Support

- iOS Safari (last 2 versions)
- Chrome Android (last 2 versions)

---

## Deployment

### Build Process

```bash
npm run build
```

Output in `dist/` folder, ready for static hosting.

### Environment Variables

Set production environment variables in hosting platform.

### Recommended Platforms

- Vercel (recommended for Vite apps)
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

---

## Team Collaboration

### Before Working on a Feature

1. Review this documentation
2. Check current implementation status
3. Follow established patterns
4. Use typed hooks and utilities

### Code Review Checklist

- Follows folder structure conventions
- Uses design tokens (not hardcoded colors)
- TypeScript types defined
- Error handling implemented
- Loading states handled
- Mobile responsive
- Accessible (keyboard + screen reader)

---

## Resources

### Official Documentation

- [React](https://react.dev)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [RTK Query](https://redux-toolkit.js.org/rtk-query/overview)
- [React Router](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Vite](https://vitejs.dev)

### Design Resources

- [Figma Design System](link-when-available)
- Brand Guidelines (pending)

---

## Questions & Support

### Developer Notes

- This is the initial implementation
- Architecture may evolve based on requirements
- Document significant decisions in this file
- Keep this file updated as project grows

---

**Last Updated:** April 2026  
**Project Phase:** Architecture Refactored to Role-Based Modules  
**Next Milestone:** Deepening Sub-Modules (Loans, Cluster reports)  
