# User Manager — Comments

## 2026-05-27 — Initial implementation

- Profile (`/profile`) stays in **auth-manager**; this mechanism is admin-only Superdesk users parity.
- `DELETE /users/:id` disables user (`is_enabled: false`) per apiary — UI label "Verwyder".
- Team pickers keep using `listUsers()` (active users only); admin list uses `searchUsers({ adminList: true })`.
