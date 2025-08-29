# Image Upload Planning

## Backend

### Routes
- GET /api/v1/images/orgs/{org_slug}/images/ (list images for org)
- POST /api/v1/images/orgs/{org_slug}/images/ (single image upload)
- GET /api/v1/images/orgs/{org_slug}/images/{app_label}/{model}/{obj_id}/ (get images for object)
- POST /api/v1/images/orgs/{org_slug}/images/{app_label}/{model}/{obj_id}/ (attach image to object)
- DELETE /api/v1/images/orgs/{org_slug}/images/{app_label}/{model}/{obj_id}/{image_id}/ (detach image from object)
- POST /api/v1/images/orgs/{org_slug}/images/{app_label}/{model}/{obj_id}/reorder (reorder images for object; first becomes primary)
- PATCH /api/v1/images/orgs/{org_slug}/images/{image_id}/ (update image metadata)
- DELETE /api/v1/images/orgs/{org_slug}/images/{image_id}/ (delete image)
- POST /api/v1/images/orgs/{org_slug}/bulk-upload/ (bulk upload images for org)
- POST /api/v1/images/orgs/{org_slug}/bulk-delete/ (bulk delete images for org)
- POST /api/v1/images/orgs/{org_slug}/images/{app_label}/{model}/{obj_id}/bulk_attach/ (bulk attach images)
- POST /api/v1/images/orgs/{org_slug}/images/{app_label}/{model}/{obj_id}/bulk_detach/ (bulk detach images)

## Usage (ImageGallery)

Import the cross-platform gallery and render it with either an org-wide feed or a target object. The same API works on Web and React Native.

```tsx
// Web or RN
import { ImageGallery } from '@bbook/app';

export function ContactImagesExample() {
  return (
    <ImageGallery
      orgSlug="acme"
      target={{ appLabel: 'contacts', model: 'contact', objId: 123 }}
      showUploaderButton
      pageSize={30}
    />
  );
}

export function OrgImagesExample() {
  return (
    <ImageGallery
      orgSlug="acme"
      showUploaderButton
      pageSize={30}
    />
  );
}
```

Notes:
- Grid shows `thumb` variant; viewer uses `lg` variant.
- RN uses FlatList with infinite scroll; Web uses CSS Grid with a Load more button.
- In target mode, items support Detach and Reorder (up/down) when fully loaded.
- Upload button attaches images to the target when provided.