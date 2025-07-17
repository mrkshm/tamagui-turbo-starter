# Tamagui-Turbo-Starter

An opinionated starter template for Tamagui in a monorepo with Turbo. Expo 53 for mobile, Tanstack Router for web.

Featuring Tanstack Query, Tanstack Form, Zustand, i18n, Valibot, all that good stuff.

The mobile app is currently only getting tested for iOS.

This is very much a work in progress, breaking changes are expected, use at your peril.

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

# Start web app
pnpm dev-web

# Start mobile app
pnpm dev-mobile
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

While this starter works with any backend that implements the required endpoints, it's designed to work with the [Django Ninja API Starter](https://github.com/mrkshm/django-ninja-api-starter).

The Django Ninja API Starter provides:

- JWT authentication endpoints that match this frontend's expectations
- User management and profile endpoints
- Image upload to S3 compatible storage and processing endpoints
- API documentation with OpenAPI/Swagger

Using both starters together gives you a complete full-stack solution with hopefully minimal configuration.

For detailed documentation on API setup and authentication, see:

- [API Setup Documentation](./docs/api-setup.md)
- [Authentication Documentation](./docs/authentication.md)

---

## Structure

- `apps/web` — Vite + React + Tanstack Router web app
- `apps/mobile` — Expo + React Native mobile app
- `packages/ui` — Tamagui configuration, shared low level Tamagui UI components
- `packages/utils` — Shared utililty functions
- `packages/app` — Shared app logic, providers, hooks, shared components
- `packages/data` — QueryClient, API hooks, API route definitions, Valibot schemas and types
- `packages/stores` — Zustand stores
- `packages/i18n` — i18n configuration and translations

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

- [x] Make apps boot
- [x] Add i18n
- [x] QueryClient setup
- [x] Add example Zustand store
- [x] Add modular API endpoint structure
- [x] Implement JWT-based authentication system
- [x] Add platform-specific storage adapters
- [x] Create basic documentation
- [x] Add theme toggle with persistence
- [x] Add Login Screens
- [x] Add Profile Screen
- [x] Add Contacts Screen
- [x] Add reusable components for inline editable fields
- [x] Avatars for Profile and Contacts
- [x] Add reusable components for avatar upload/display
- [x] Add tagging for contacts with reusable Combobox
- [ ] Add reusable image upload/display component for contacts
- [ ] Add reusable gallery component for contacts
- [ ] Make app presentable and theme a bit nicer
- [ ] Clean up translation files
- [ ] Better testing
- [ ] Add CI/CD example
- [ ] Clean up console logs etc
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
