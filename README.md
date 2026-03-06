# BetaMoni Admin Dashboard

BetaMoni Admin is the internal administration interface for BetaMoni, a Nigerian nano-lending platform that provides quick, small loans to market women and traders. This application is built for the internal team (Superadmins, Supervisors, and Agents) to manage users, loans, policies, and system settings.

## 🚀 Tech Stack

- **Framework:** React 18 + Vite
- **Language:** TypeScript
- **State Management:** Redux Toolkit + RTK Query
- **Routing:** React Router v7
- **Styling:** Tailwind CSS v3.4 + shadcn/ui
- **Icons:** Lucide React
- **Animations:** Framer Motion

## 🛠️ Features Implemented

- **Authentication System:** Fully integrated with `api.dev.betamoni.com.ng`. Includes JWT token storage via Redux/localStorage, loading splash screens, and a robust 401 automatic logout handling sequence.
- **Role-Based Access Control (RBAC):** Supports `super-admin`, `supervisor`, and `agent` roles with protected routes.
- **Premium UI:** Custom designed login interface featuring modern glassmorphism, Framer Motion entrance animations, and the signature BetaMoni emerald branding.

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/motormata/Betamoni-frontend.git
   cd betamoni-admin
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env.development` and ensure the API URLs are correct:

   ```bash
   cp .env.example .env.development
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## 📚 Project Documentation

For an in-depth look at architecture decisions, design system tokens, folder structure, and API patterns, please read the [PROJECT.md](./PROJECT.md) file included in the root directory.

## 🤝 Contributing

This project strictly follows feature-based folder organization (`src/features/*`). When creating new modules, ensure all components, hooks, and pages specific to that module remain encapsulated within its feature folder. Shared UI components belong in `src/components/ui`.
