export const API_BASE_URL = 'http://localhost:8000/api/v1';

// Must match backend route in `DjangoApiStarter/contacts/api.py`:
// contacts_router.get("/avatars/{path:path}", ...)
export const AVATAR_URL_PATTERN = `${API_BASE_URL}/contacts/avatars`;
