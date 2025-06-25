# Polymorphic Tags

### API Routes available

Our Django API backend gives us the following routes :
GET all tags for current org `orgs/{org_slug}/tags/`
POST create tag for current org `orgs/{org_slug}/tags/`
POST assign tags to entity, payload is an array of tag slugs `orgs/{org_slug}/tags/{app_label}/{model}/{object_id}/`
DELETE unassign tag from entity `orgs/{org_slug}/tags/{app_label}/{model}/{object_id}/{tag_slug}/`
PATCH update tag `orgs/{org_slug}/tags/{tag_id}/`
DELETE delete tag `orgs/{org_slug}/tags/{tag_id}/`

## Implementation Plan

### 1. Preparation

- [x] Setup schemas for tags in data/schemas/tags.ts
- [x] Setup endpoints for tags in data/endpoints/tags.ts

### 2. Implementation

- [x] Setup react query hook to get tags
- [x] Setup react query hook to create tag
- [x] Setup react query hook to update tag
- [x] Setup react query hook to delete tag
- [x] Setup react query hook to assign tag to entity
- [x] Setup react query hook to unassign tag from entity

### 3. UI / UX

- [ ] Prepare reusable ui / ux components for displaying tags for entities
  - [ ] make a tag bubble display
  - [ ] make a tag list display with optional "editable" prop that opens tag management component / modal
- [ ] Prepare reusable ui / ux components for managing tags for entities
  - [ ] make a tag management component that opens as modal or bottom sheet
  - [ ] current tags have a little X in top right corner to remove
  - [ ] input to assign new or existing tag, autocompleting existing tags
  - [ ] save / cancel buttons, if user clicks outside, gets asked if they want to save
