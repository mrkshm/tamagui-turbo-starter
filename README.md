# Tamagui-Turbo-Starter

An opinionated starter template for Tamagui in a monorepo with Turbo. Expo 53 for mobile, Tanstack Router for web.

Featuring Tanstack Query, Tanstack Form, Valtio, i18n, Valibot, all that good stuff.

## Getting Started

This is still a work in progress, not ready in any way for anything really. But if you want to poke around, go ahead.

---

## Structure

- `apps/web` — Vite + React + Tanstack Router web app
- `apps/mobile` — Expo + React Native mobile app
- `packages/ui` — Shared Tamagui UI components
- `packages/app` — Shared app logic, providers, hooks
- `packages/config` — Tamagui config, tokens, themes
- `packages/i18n` — i18n config
- `packages/data` — QueryClient, API hooks, API route definitions
- `packages/stores` — Valtio stores

## Features

- **Tamagui** for universal UI
- **TurboRepo** for fast builds and task running
- **Expo** for mobile (SDK 53+)
- **Tanstack Router** for web navigation
- **Tanstack Query** for data fetching
- **Valtio** for state management
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
- [ ] QueryClient setup
- [x] Add example Valtio store
- [ ] Add example API hooks
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
