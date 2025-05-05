# Tamagui-Turbo-Starter

An opinionated starter template for Tamagui in a monorepo with Turbo. Expo 53 for mobile, Tanstack Router for web.

Featuring Tanstack Query, Tanstack Form, Zustand, i18n, Valibot, all that good stuff.

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm installed
- For mobile: iOS Simulator/Android Emulator

### Installation

```bash
# Clone the repo
git clone https://github.com/mrkshm/turbobook.git
cd turbobook

# Install dependencies
pnpm install

# Start development servers
pnpm dev
```

### Backend Integration

This starter comes with a complete authentication system and API integration layer. To connect it to your backend:

1. **Configure API Base URL**:

   - Set your API base URL in `packages/data/src/constants/config.ts`

2. **Update API Endpoints**:

   - Modify endpoint definitions in `packages/data/src/endpoints/` to match your backend routes
   - Example: `packages/data/src/endpoints/auth.ts` for authentication endpoints

3. **Update Request/Response Schemas**:

   - Adjust schemas in `packages/data/src/schemas/` to match your API's data structure
   - Example: `packages/data/src/schemas/user.ts` for user-related schemas

4. **Authentication Setup**:
   - The starter includes a complete JWT-based auth system
   - Configure token handling in `packages/data/src/services/token-service.ts`

### Required Backend Endpoints

At minimum, your backend needs to implement these endpoints for the authentication system to work:

1. **Login** (`POST /token/pair`):

   - Accepts: `{ email: string, password: string }`
   - Returns: `{ email: string, access: string, refresh: string }`

2. **User Profile** (`GET /users/me`):

   - Requires: Authorization header with JWT token
   - Returns: User profile object with at least `{ id: number|string, email: string }`

3. **Logout** (`POST /auth/logout/`):
   - Requires: Authorization header with JWT token
   - Invalidates the token on the server side

You can customize these endpoint URLs in the endpoint definition files.

### Comes With an Optional Backend Companion

While this starter works with any backend that implements the required endpoints, it's adapted to work with the [Django Ninja API Starter](https://github.com/mrkshm/django-ninja-api-starter).

The Django Ninja API Starter provides:

- JWT authentication endpoints that match this frontend's expectations
- User management and profile endpoints
- Image upload to S3 compatible storage and processing endpoints
- API documentation with OpenAPI/Swagger

Using both starters together gives you a complete full-stack solution with minimal configuration.

For detailed documentation on API setup and authentication, see:

- [API Setup Documentation](./docs/api-setup.md)
- [Authentication Documentation](./docs/authentication.md)

---

## Structure

- `apps/web` — Vite + React + Tanstack Router web app
- `apps/mobile` — Expo + React Native mobile app
- `packages/ui` — Shared Tamagui UI components
- `packages/app` — Shared app logic, providers, hooks
- `packages/config` — Tamagui config, tokens, themes
- `packages/i18n` — i18n config
- `packages/data` — QueryClient, API hooks, API route definitions
- `packages/stores` — Zustand stores

## Features

- **Tamagui** for universal UI
- **TurboRepo** for fast builds and task running
- **Expo** for mobile (SDK 53+)
- **Tanstack Router** for web navigation
- **Tanstack Query** for data fetching
- **Zustand** for state management
- **Valibot** for validation

## Usage

```sh
pnpm install

# Run web app
pnpm dev-web

# Run mobile app (Expo Go on iOS)
pnpm dev-ios

# Run mobile app (native build)
pnpm run-ios
```

## TODO / Roadmap

- [x] Make both apps boot
- [x] Add i18n
- [x] QueryClient setup
- [x] Add example Zustand store
- [x] Add modular API endpoint structure
- [x] Implement JWT-based authentication system
- [x] Add platform-specific storage adapters
- [x] Create comprehensive documentation
- [ ] Add theme toggle with persistence
- [ ] Add Login Screens
- [ ] Add CI/CD example
- [ ] Write more docs

## i18n

This project currently uses [i18next](https://www.i18next.com/) with [react-i18next](https://react.i18next.com/). The translation function is wrapped so if you want to switch to another i18n library, you can do so by simply modifying the `packages/i18n/src/hooks.ts` file.

Translations are expected to be namespaced in folders in the `packages/i18n/locales` directory. When a new namespace is added, resources need to be regenerated with the command `pnpm generate:i18n`.

The script assumes one single namespace level (ie no folders inside folders), but keys can be nested of course.

### Example:

```
locales/
  common/
    en.json
    fr.json
  profile/
    en.json
    fr.json
```

// Keys can be nested:

```json
{
  "button": {
    "save": "Save"
  }
}
```

---

Feel free to fork or copy for your own projects. PRs welcome once this is less embarrassing.
