# Polymorphic Images – Action Plan

## Decisions
- [x] Use `packages/data` for image API functions, Valibot schemas, and TanStack Query hooks (no separate shared-images package).
- [x] Build generic, reusable UI components; add thin wrappers for specific entities (starting with Contacts).
- [x] Derive TS types from Valibot schemas where validation is helpful; define plain TS for purely structural types if simpler.
- [x] Use a single cross-platform Gallery component in `packages/app/components/images/` powered by Tamagui + Galeria (viewer). Platform-specific list primitives: FlatList/FlashList (RN) and CSS Grid (Web).

## Avatars – Contacts
- [x] Unified avatar rendering via `AvatarWithUrl` which fetches pre-signed URLs with `useAvatarUrl`.
- [x] Fixed list cards: `packages/app/components/contacts/ContactCard.tsx` now passes `entityType="contact"` and `imagePath` = DB filename (e.g. `ct_*.webp`).
- [x] Fixed web details page trigger avatar: `packages/app/components/avatar/AvatarUploader.web.tsx` now passes `entityType` through to `AvatarWithUrl`.
- [x] Correct endpoint constant: `packages/ui/src/config/constants.ts` `AVATAR_URL_PATTERN` now points to `${API_BASE_URL}/contacts/avatars`.
- [x] Fallback initials rendered via text component to satisfy RN requirements.
- [x] Avoid manual URL normalization; rely on pre-signed flow on all platforms.

### Verify
- Web and RN list/detail load avatars via `/api/v1/contacts/avatars/{ct_*.webp}` (200 OK).
- If a contact still fails, ensure `avatar_path` follows backend rules: starts with `ct_`, ends with `.webp`, no leading slash.

### Notes / Follow-ups
- [ ] Optional: add cache-busting on avatar updates if any stale UI persists (e.g., include `avatar_path` in query key already handled by `useAvatarUrl`).
- [ ] Optional: monitoring/logging around avatar URL fetch failures for better UX.

## Backend Routes (reference)
- Single upload: POST `/api/v1/images/orgs/{org_slug}/images/`
- Org images: GET `/api/v1/images/orgs/{org_slug}/images/`
- Object images: GET `/api/v1/images/orgs/{org_slug}/images/{app_label}/{model}/{obj_id}/`
- Attach: POST `/api/v1/images/orgs/{org_slug}/images/{app_label}/{model}/{obj_id}/`
- Detach: DELETE `/api/v1/images/orgs/{org_slug}/images/{app_label}/{model}/{obj_id}/{image_id}/`
- Reorder: POST `/api/v1/images/orgs/{org_slug}/images/{app_label}/{model}/{obj_id}/reorder`
- Bulk upload: POST `/api/v1/images/orgs/{org_slug}/bulk-upload/`
- Bulk delete: POST `/api/v1/images/orgs/{org_slug}/bulk-delete/`
- Image metadata: PATCH `/api/v1/images/orgs/{org_slug}/images/{image_id}/`
- Image delete: DELETE `/api/v1/images/orgs/{org_slug}/images/{image_id}/`

### Backend status
- [x] Reorder cover fix: atomic order update + clear/set `is_cover` to satisfy unique constraint.

## packages/data
- valibot schemas (and derived types):
  - [x] ImageVariants, ImageOut
  - [x] PolymorphicImageRelationOut
  - [x] ImageIdsIn, BulkImageIdsIn, ReorderIn, ImagePatchIn
- API functions:
  - [x] uploadImage(orgSlug, file)
  - [x] listOrgImages(orgSlug, params)
  - [x] listObjectImages(orgSlug, { appLabel, model, objId }, params)
  - [x] attachImages(orgSlug, target, imageIds)
  - [x] bulkAttachImages(orgSlug, target, imageIds, { idempotencyKey? })
  - [x] bulkDetachImages(orgSlug, target, imageIds, { idempotencyKey? })
  - [x] detachImage(orgSlug, target, imageId)
  - [x] reorderImages(orgSlug, target, imageIds)
  - [ ] patchImage(orgSlug, imageId, patch) (not supported yet)
  - [x] bulkDeleteImages(orgSlug, imageIds, { idempotencyKey? })
- TanStack Query hooks:
  - [x] useListOrgImages, useListObjectImages (implemented as `useOrgImages`, `useObjectImages`)
  - [x] useUploadImage, useBulkUploadImages
  - [x] useAttachImages, useBulkAttachImages, useBulkDetachImages, useDetachImage
  - [x] useReorderImages
  - [ ] usePatchImage, useBulkDeleteImages
- Utilities:
  - [x] query keys, idempotency header support
  - [ ] buildImagesUrl(), pagination helpers and ordering options

## apps/web
- Components (generic):
  - [ ] ImageUploader: single + multi (dropzone + file input), accepts orgSlug and callbacks
  - [x] ImageGalleryWeb: grid with variants, detach/delete, pagination; uses shared Gallery core; MVP reorder (up/down) + "Set cover" action via reorder API
- Hook:
  - [ ] useImages({ orgSlug, appLabel, model, objId }) → wraps list/attach/detach/reorder
- Wrapper example:
  - [x] ContactImages({ orgSlug, contactId }) → binds `{ appLabel: 'contacts', model: 'contact', objId: contactId }`
- Integration:
  - [x] Contact detail page: add gallery/uploader; allow reorder and set primary via reorder API

## apps/mobile (React Native)
- [ ] RNImageUploader, RNImageGallery with platform file pickers; drag-to-reorder later phase; uses shared Gallery core
- [x] RN gallery: MVP reorder (up/down) + "Set cover" action

## Shared Gallery (Web + RN)
- [x] Install deps: `@nandorojo/galeria` (viewer). Optional later: `@shopify/flash-list` for large RN grids.
- [x] Create shared component: `packages/app/components/images/ImageGallery.tsx` (exports `ImageGallery` + types)
  - Props:
    - `orgSlug`
    - `target?: { appLabel: string; model: string; objId: string | number }` (if provided, use `useObjectImages`; else `useOrgImages`)
    - `pageSize?: number`
    - `onDetach?: (imageId: number) => void`
    - `onReorder?: (imageIds: number[]) => void`
    - `selectionMode?: 'none' | 'single' | 'multi'`
    - `showUploaderButton?: boolean`
  - Internal:
    - Map relations/images to arrays of URLs for viewer: `thumb` for grid, `lg` or original for viewer.
    - Maintain `viewerIndex` state and pass `urls` to `<Galeria>`.
  - [x] RN grid implementation (separate `ImageGallery.native.tsx`):
    - FlatList 3 columns, fixed square cells, stable keys.
    - Viewer wired with `<Galeria>` and `<Galeria.Image index={i}>` wrapping cells.
    - Data wired with `useObjectImages`/`useOrgImages` and variant mapping (`thumb`/`lg`).
    - Pagination: limit/offset accumulation with loading footer.
    - Actions: Detach inline button in target mode.
  - [x] Web grid implementation (`ImageGallery.web.tsx`):
    - CSS Grid with responsive columns (minmax cell width ~160–200px).
    - Same viewer wiring and variant mapping as RN.
    - Pagination: Load more button; accumulated list.
    - Actions: Detach inline button in target mode.
- [x] Reorder (both platforms):
  - MVP: up/down controls in item overlay that compute new order client-side, call `useReorderImages` with full list of IDs. Enable when all images are loaded.
  - MVP: "Set cover" button that moves clicked image to index 0 and calls the same reorder API (Web + RN).
  - Later: drag-and-drop (RN via Reanimated/Gestures; Web via dnd-kit).
- [x] Detach:
  - Wire `useDetachImage` or `useBulkDetachImages`; optimistic update and invalidate `imagesQueryKeys.object`.
- [x] Empty / loading / error states:
  - Loading indicator, error message, and empty message with optional upload button.
- [ ] Types/utilities:
  - Small adapter to build `urls` array and index mapping from `PolymorphicImageRelationOut` | `ImageOut`.
  - Helper to read variant URLs: prefer `thumb` for grid; `lg`/`md` for viewer.
- [x] Docs: add usage snippets to `docs/polymorphic-images.md` for Web and RN with Galeria.

### File layout & exports
- [x] File names:
  - `packages/app/components/images/ImageGalleryCore.ts` (shared logic/state)
  - `packages/app/components/images/ImageGallery.web.tsx` (Web renderer)
  - `packages/app/components/images/ImageGallery.native.tsx` (RN renderer)
  - `packages/app/components/images/ImageGallery.tsx` (wrapper that re-exports the default from platform file so consumers import a single symbol)
- [x] Public export:
  - Re-exported `ImageGallery` from `packages/app/index.ts` so apps can `import { ImageGallery } from '@bbook/app'`.
- [ ] Contract:
  - Keep identical props across `.web.tsx` and `.native.tsx` to ensure platform-agnostic consumption.
  - [ ] Notes:
  - Platform resolution achieved via wrapper that requires `.web`/`.native` based on `Platform.OS`.

## Testing & Docs
- [ ] Basic tests: schema parsing, API utils, hook behavior (mocks)
- [ ] Update `docs/polymorphic-images.md` with usage snippets after components exist

## Next steps (starter-friendly)
- [ ] Add small "Cover" badge on first image (Web + RN) for clarity. Priority: low (purely visual)
- [ ] Ensure reorder is disabled until all pages loaded; show hint if more pages. Priority: medium
- [ ] Improve optimistic updates + error toasts for reorder/detach. Priority: medium
- [ ] Basic drag-and-drop on Web using dnd-kit (optional, nice-to-have). Priority: low
- [ ] RN drag-to-reorder via Reanimated/Gesture Handler (future). Priority: low
- [ ] Image metadata editing (title/alt/description) flow + PATCH endpoint wiring. Priority: medium
- [ ] Minimal tests around reorder/set-cover and detach hooks. Priority: medium
- [ ] Update docs with usage snippets and gotchas (full list must be loaded to reorder). Priority: medium

## Phased Tasks
1) [x] Define schemas + types in `packages/data` (Images) and API functions
2) [x] Add TanStack Query hooks and keys
3) [x] Build shared Gallery core + RN grid (FlatList) MVP
4) [x] Create `ContactImages` wrapper and integrate into contact detail page
5) [x] Build Web grid (CSS Grid) and finalize shared viewer wiring
6) [ ] RN advanced components (optional phase)

## Notes
- Honor backend constraints: max size, mime type, idempotency for bulk, 429 handling
- Expose variant URLs (thumb, sm, md, lg) in UI; lazy-load where possible
- Confirm exact `appLabel`/`model` values for Contacts in backend before wiring

### Convention (current)
- First image = cover. Users can use up/down or "Set cover" to move an image to index 0.
- No cover badge is shown for now. Add a badge later only if cover can differ from index 0.
