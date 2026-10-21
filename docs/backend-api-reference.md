# Dahab API - Production — API reference

Generated from `/api/docs-json` (OpenAPI 3.0.0). Swagger API documentation for the Dahab backend

## Health

### GET `/health`

**Application health check**

Auth: none

Response 200

## Uploads

### GET `/api/v1/uploads/purposes`

**List upload purposes**

What file types and sizes are allowed per purpose

Auth: Bearer token

Response 200 — Upload purposes retrieved successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")

### GET `/api/v1/uploads`

**List all uploads**

**Required permission:** `upload:read`

Auth: Bearer token

Parameters:
- `page`? (query, number, ≥ 1, default 1, e.g. 1) — Page number
- `limit`? (query, number, ≥ 1, ≤ 500, default 100, e.g. 20) — Items per page
- `sortBy`? (query, string, e.g. "createdAt") — Field to sort by
- `sortOrder`? (query, string, enum asc|desc, default "asc", e.g. "desc") — Sort order
- `include`? (query, string, e.g. "roles") — Comma separated list of relations to include
- `search`? (query, string) — Search by original filename
- `purpose`? (query, string, enum USER_AVATAR)
- `uploadedBy`? (query, string) — Filter by uploader

Response 200 — Uploads retrieved successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Data retrieved successfully")
- `data`: string[] — Response data
- `meta`: PaginationMetaDto
  - `page`: number (e.g. 1) — Current page number
  - `limit`: number (e.g. 20) — Items per page
  - `total`: number (e.g. 100) — Total number of items
  - `totalPages`: number (e.g. 5) — Total number of pages
  - `hasNextPage`: boolean (e.g. true) — Whether there is a next page
  - `hasPrevPage`: boolean (e.g. false) — Whether there is a previous page
  - `nextCursor`?: string — Cursor for next page
  - `prevCursor`?: string — Cursor for previous page
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: UploadDto[]
  - `id`: string
  - `key`: string (e.g. "avatars/a8f3c2d1.png")
  - `url`: string — Full URL of the file
  - `purpose`: string (e.g. "USER_AVATAR") — Which group of uploads this file belongs to
  - `uploadableId`: object — ID of the entity this upload is attached to. Null if unattached
  - `originalName`: string (e.g. "avatar.png")
  - `mimeType`: string (e.g. "image/png")
  - `size`: number (e.g. 184320) — File size in bytes
  - `uploadedBy`: string — User ID of who uploaded this file
  - `createdAt`: string (date-time)

### POST `/api/v1/uploads`

**Upload a file**

Auth: Bearer token

Request body (multipart/form-data, required):
- `file`: string (binary)
- `purpose`: string (enum USER_AVATAR)

Response 201 — File uploaded successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: UploadDto
  - `id`: string
  - `key`: string (e.g. "avatars/a8f3c2d1.png")
  - `url`: string — Full URL of the file
  - `purpose`: string (e.g. "USER_AVATAR") — Which group of uploads this file belongs to
  - `uploadableId`: object — ID of the entity this upload is attached to. Null if unattached
  - `originalName`: string (e.g. "avatar.png")
  - `mimeType`: string (e.g. "image/png")
  - `size`: number (e.g. 184320) — File size in bytes
  - `uploadedBy`: string — User ID of who uploaded this file
  - `createdAt`: string (date-time)

### GET `/api/v1/uploads/{id}`

**Get uploaded file by ID**

**Required permission:** `upload:read`

Auth: Bearer token

Parameters:
- `id` (path, string)

Response 200 — Upload retrieved successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: UploadDto
  - `id`: string
  - `key`: string (e.g. "avatars/a8f3c2d1.png")
  - `url`: string — Full URL of the file
  - `purpose`: string (e.g. "USER_AVATAR") — Which group of uploads this file belongs to
  - `uploadableId`: object — ID of the entity this upload is attached to. Null if unattached
  - `originalName`: string (e.g. "avatar.png")
  - `mimeType`: string (e.g. "image/png")
  - `size`: number (e.g. 184320) — File size in bytes
  - `uploadedBy`: string — User ID of who uploaded this file
  - `createdAt`: string (date-time)

### DELETE `/api/v1/uploads/{id}`

**Delete an upload**

**Required permission:** `upload:delete`

Auth: Bearer token

Parameters:
- `id` (path, string)

Response 200 — Upload deleted successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")

## Device Tokens

### GET `/api/v1/me/device-tokens`

**List my push tokens**

List the current user's registered push tokens

Auth: Bearer token

Response 200 — Push tokens retrieved successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: DeviceTokenDto[]
  - `id`: string
  - `platform`: string (enum ANDROID|IOS|WEB)
  - `deviceName`?: object
  - `lastSeenAt`: string (date-time)
  - `createdAt`: string (date-time)

### POST `/api/v1/me/device-tokens`

**Register my push token**

Register or refresh a push token for the current user

Auth: Bearer token

Request body (application/json, required):
- `deviceId`: string (e.g. "550e8400-e29b-41d4-a716-446655440000")
- `token`: string (e.g. "fcm_token_xxxxxxxxxxxx")
- `platform`: string (enum ANDROID|IOS|WEB, e.g. "IOS")
- `deviceName`?: string (e.g. "John's iPhone")

Response 201 — Push token registered successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: DeviceTokenDto
  - `id`: string
  - `platform`: string (enum ANDROID|IOS|WEB)
  - `deviceName`?: object
  - `lastSeenAt`: string (date-time)
  - `createdAt`: string (date-time)

### DELETE `/api/v1/me/device-tokens/{id}`

**Unregister my push token**

Unregister a push token for the current user

Auth: Bearer token

Parameters:
- `id` (path, string)

Response 200 — Push token unregistered successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")

## Notifications

### GET `/api/v1/me/notifications`

**List my notifications**

Get a list of the current user's notifications. Can be filtered by read/unread

Auth: Bearer token

Parameters:
- `page`? (query, number, ≥ 1, default 1, e.g. 1) — Page number
- `limit`? (query, number, ≥ 1, ≤ 500, default 100, e.g. 20) — Items per page
- `sortBy`? (query, string, e.g. "createdAt") — Field to sort by
- `sortOrder`? (query, string, enum asc|desc, default "asc", e.g. "desc") — Sort order
- `include`? (query, string, e.g. "roles") — Comma separated list of relations to include
- `read`? (query, boolean, e.g. false) — Filter by read state. Omit to return all read and unread

Response 200 — Notifications retrieved successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Data retrieved successfully")
- `data`: string[] — Response data
- `meta`: PaginationMetaDto
  - `page`: number (e.g. 1) — Current page number
  - `limit`: number (e.g. 20) — Items per page
  - `total`: number (e.g. 100) — Total number of items
  - `totalPages`: number (e.g. 5) — Total number of pages
  - `hasNextPage`: boolean (e.g. true) — Whether there is a next page
  - `hasPrevPage`: boolean (e.g. false) — Whether there is a previous page
  - `nextCursor`?: string — Cursor for next page
  - `prevCursor`?: string — Cursor for previous page
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: NotificationListDto[]
  - `id`: string
  - `type`: string
  - `title`: string
  - `body`: string
  - `icon`: string (enum SYSTEM|ACCOUNT|SECURITY)
  - `color`: string (enum DEFAULT|INFO|SUCCESS|WARNING|DANGER)
  - `category`: string (enum TRANSACTIONAL|SECURITY|ACTIVITY|MARKETING)
  - `targetType`?: object
  - `targetId`?: object
  - `readAt`?: object
  - `createdAt`: string (date-time)

### GET `/api/v1/me/notifications/unread-count`

**Count my unread notifications**

Auth: Bearer token

Response 200 — Unread count retrieved successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: UnreadCountDto
  - `count`: number (e.g. 3)

### GET `/api/v1/me/notifications/{id}`

**Get my notification by ID**

Auth: Bearer token

Parameters:
- `id` (path, string)

Response 200 — Notification retrieved successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: NotificationDto
  - `id`: string
  - `type`: string
  - `title`: string
  - `body`: string
  - `icon`: string (enum SYSTEM|ACCOUNT|SECURITY)
  - `color`: string (enum DEFAULT|INFO|SUCCESS|WARNING|DANGER)
  - `category`: string (enum TRANSACTIONAL|SECURITY|ACTIVITY|MARKETING)
  - `targetType`?: object
  - `targetId`?: object
  - `readAt`?: object
  - `createdAt`: string (date-time)

### POST `/api/v1/me/notifications/{id}/read`

**Mark my notification as read**

Auth: Bearer token

Parameters:
- `id` (path, string)

Response 200 — Notification marked as read
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: NotificationDto
  - `id`: string
  - `type`: string
  - `title`: string
  - `body`: string
  - `icon`: string (enum SYSTEM|ACCOUNT|SECURITY)
  - `color`: string (enum DEFAULT|INFO|SUCCESS|WARNING|DANGER)
  - `category`: string (enum TRANSACTIONAL|SECURITY|ACTIVITY|MARKETING)
  - `targetType`?: object
  - `targetId`?: object
  - `readAt`?: object
  - `createdAt`: string (date-time)

### POST `/api/v1/me/notifications/read-all`

**Mark all my notifications as read**

Auth: Bearer token

Response 200 — All notifications marked as read
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: MarkAllReadDto
  - `marked`: number (e.g. 12)

## Broadcasts

### GET `/api/v1/broadcasts`

**List broadcasts**

**Required permission:** `broadcast:read`

Auth: Bearer token

Parameters:
- `page`? (query, number, ≥ 1, default 1, e.g. 1) — Page number
- `limit`? (query, number, ≥ 1, ≤ 500, default 100, e.g. 20) — Items per page
- `sortBy`? (query, string, e.g. "createdAt") — Field to sort by
- `sortOrder`? (query, string, enum asc|desc, default "asc", e.g. "desc") — Sort order
- `include`? (query, string, e.g. "roles") — Comma separated list of relations to include
- `channel`? (query, string, enum EMAIL|WHATSAPP|PUSH)
- `audience`? (query, string, enum ME|ALL_USERS|NEW_USERS|NEWSLETTER_SUBSCRIBERS|USER_IDS|ROLES)
- `status`? (query, string, enum DRAFT|SENDING|COMPLETED|FAILED)

Response 200 — Broadcasts retrieved successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Data retrieved successfully")
- `data`: string[] — Response data
- `meta`: PaginationMetaDto
  - `page`: number (e.g. 1) — Current page number
  - `limit`: number (e.g. 20) — Items per page
  - `total`: number (e.g. 100) — Total number of items
  - `totalPages`: number (e.g. 5) — Total number of pages
  - `hasNextPage`: boolean (e.g. true) — Whether there is a next page
  - `hasPrevPage`: boolean (e.g. false) — Whether there is a previous page
  - `nextCursor`?: string — Cursor for next page
  - `prevCursor`?: string — Cursor for previous page
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: BroadcastListDto[]
  - `id`: string
  - `title`: string
  - `body`: string
  - `channel`: string (enum EMAIL|WHATSAPP|PUSH)
  - `audience`: string
  - `audienceParams`?: object
  - `persistAsNotification`: boolean
  - `status`: string (enum DRAFT|SENDING|COMPLETED|FAILED)
  - `audienceSize`?: object
  - `sentSuccessCount`?: object
  - `sentFailureCount`?: object
  - `createdBy`: string
  - `createdAt`: string (date-time)
  - `completedAt`?: object
  - `failureReason`?: object

### POST `/api/v1/broadcasts`

**Send a broadcast**

**Required permission:** `broadcast:create`

Auth: Bearer token

Request body (application/json, required):
- `audience`: string (enum ME|ALL_USERS|NEW_USERS|NEWSLETTER_SUBSCRIBERS|USER_IDS|ROLES, e.g. "NEW_USERS")
- `audienceParams`?: BroadcastAudienceParamsDto — Audience-specific parameters, required for the USER_IDS and ROLES audiences
  - `userIds`?: string[] — Target these explicit user IDs
  - `roleIds`?: string[] — Target users holding any of these role IDs
- `title`: string (e.g. "Scheduled maintenance tonight")
- `body`: string (e.g. "We'll be performing maintenance from 11 PM to midnight. The app may be briefly unavailable.")
- `channel`: string (enum EMAIL|WHATSAPP|PUSH, e.g. "PUSH")
- `persistAsNotification`?: boolean — Persist a notification row per recipient. Omit to use the broadcast default

Response 201 — Broadcast queued for delivery
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: BroadcastDto
  - `id`: string
  - `title`: string
  - `body`: string
  - `channel`: string (enum EMAIL|WHATSAPP|PUSH)
  - `audience`: string
  - `audienceParams`?: object
  - `persistAsNotification`: boolean
  - `status`: string (enum DRAFT|SENDING|COMPLETED|FAILED)
  - `audienceSize`?: object
  - `sentSuccessCount`?: object
  - `sentFailureCount`?: object
  - `createdBy`: string
  - `createdAt`: string (date-time)
  - `completedAt`?: object
  - `failureReason`?: object

### POST `/api/v1/broadcasts/audience/preview`

**Preview audience size**

**Required permission:** `broadcast:create`

Auth: Bearer token

Request body (application/json, required):
- `audience`: string (enum ME|ALL_USERS|NEW_USERS|NEWSLETTER_SUBSCRIBERS|USER_IDS|ROLES, e.g. "NEW_USERS")
- `audienceParams`?: BroadcastAudienceParamsDto — Audience-specific parameters, required for the USER_IDS and ROLES audiences
  - `userIds`?: string[] — Target these explicit user IDs
  - `roleIds`?: string[] — Target users holding any of these role IDs

Response 200 — Audience size retrieved successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: AudiencePreviewDto
  - `audience`: string
  - `size`: number (e.g. 1284)

### GET `/api/v1/broadcasts/{id}`

**Get a broadcast by ID**

**Required permission:** `broadcast:read`

Auth: Bearer token

Parameters:
- `id` (path, string)

Response 200 — Broadcast retrieved successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: BroadcastDto
  - `id`: string
  - `title`: string
  - `body`: string
  - `channel`: string (enum EMAIL|WHATSAPP|PUSH)
  - `audience`: string
  - `audienceParams`?: object
  - `persistAsNotification`: boolean
  - `status`: string (enum DRAFT|SENDING|COMPLETED|FAILED)
  - `audienceSize`?: object
  - `sentSuccessCount`?: object
  - `sentFailureCount`?: object
  - `createdBy`: string
  - `createdAt`: string (date-time)
  - `completedAt`?: object
  - `failureReason`?: object

## Users

### GET `/api/v1/users`

**List users with search and filters**

Auth: Bearer token

Parameters:
- `page`? (query, number, ≥ 1, default 1, e.g. 1) — Page number
- `limit`? (query, number, ≥ 1, ≤ 500, default 100, e.g. 20) — Items per page
- `sortBy`? (query, string, e.g. "createdAt") — Field to sort by
- `sortOrder`? (query, string, enum asc|desc, default "asc", e.g. "desc") — Sort order
- `include`? (query, string, e.g. "roles") — Comma separated list of relations to include
- `search`? (query, string) — Search by username, email, phone, or name
- `status`? (query, string, enum ACTIVE|SUSPENDED|PENDING_DELETION|DELETED) — Filter by user status
- `roleId`? (query, string) — Filter by role ID
- `permissionKey`? (query, string, e.g. "user:read") — Filter users holding a specific permission key through any of their roles
- `emailVerified`? (query, boolean) — Filter by email verification status
- `phoneVerified`? (query, boolean) — Filter by phone verification status

Response 200 — Users retrieved successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Data retrieved successfully")
- `data`: string[] — Response data
- `meta`: PaginationMetaDto
  - `page`: number (e.g. 1) — Current page number
  - `limit`: number (e.g. 20) — Items per page
  - `total`: number (e.g. 100) — Total number of items
  - `totalPages`: number (e.g. 5) — Total number of pages
  - `hasNextPage`: boolean (e.g. true) — Whether there is a next page
  - `hasPrevPage`: boolean (e.g. false) — Whether there is a previous page
  - `nextCursor`?: string — Cursor for next page
  - `prevCursor`?: string — Cursor for previous page
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: UserListDto[]
  - `id`: string
  - `username`: string
  - `email`: string
  - `phone`: string
  - `displayName`?: string
  - `firstName`?: string
  - `lastName`?: string
  - `avatar`?: string
  - `language`: string
  - `isNewsletterSubscribed`: boolean
  - `qrCode`: string
  - `status`: string (enum ACTIVE|SUSPENDED|PENDING_DELETION|DELETED)
  - `isTwoFactorOn`: boolean
  - `otpChannel`: string (enum EMAIL|WHATSAPP)
  - `emailVerifiedAt`?: string (date-time)
  - `phoneVerifiedAt`?: string (date-time)
  - `deletionRequestedAt`?: string (date-time)
  - `createdAt`: string (date-time)
  - `updatedAt`: string (date-time)
  - `roleCount`: number — Number of roles assigned
  - `roles`?: RoleDto[]
    - `id`: string
    - `name`: string (e.g. "User Manager")
    - `description`?: string (e.g. "Manage all user operations")
    - `isSystem`: boolean (default false)
    - `createdAt`: string (date-time)
    - `updatedAt`: string (date-time)

### POST `/api/v1/users`

**Create a new user**

Auth: Bearer token

Request body (application/json, required):
- `username`: string (e.g. "jsmith") — Must start with a letter, between 4-20 characters
- `email`: string (e.g. "email@example.com")
- `phone`: string (e.g. "+201234567890") — Phone must be in E.164 format
- `password`: string (e.g. "MyP@ssword123")
- `displayName`?: string (max 50) — Display name / nickname
- `firstName`?: string (max 50)
- `lastName`?: string (max 50)
- `avatar`?: string — Avatar upload key

Response 201 — User created successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: UserDto
  - `id`: string
  - `username`: string
  - `email`: string
  - `phone`: string
  - `displayName`?: string
  - `firstName`?: string
  - `lastName`?: string
  - `avatar`?: string
  - `language`: string
  - `isNewsletterSubscribed`: boolean
  - `qrCode`: string
  - `status`: string (enum ACTIVE|SUSPENDED|PENDING_DELETION|DELETED)
  - `isTwoFactorOn`: boolean
  - `otpChannel`: string (enum EMAIL|WHATSAPP)
  - `emailVerifiedAt`?: string (date-time)
  - `phoneVerifiedAt`?: string (date-time)
  - `deletionRequestedAt`?: string (date-time)
  - `createdAt`: string (date-time)
  - `updatedAt`: string (date-time)

### GET `/api/v1/users/{id}`

**Get user details**

Auth: Bearer token

Parameters:
- `id` (path, string)

Response 200 — User retrieved successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: UserDetailDto
  - `id`: string
  - `username`: string
  - `email`: string
  - `phone`: string
  - `displayName`?: string
  - `firstName`?: string
  - `lastName`?: string
  - `avatar`?: string
  - `language`: string
  - `isNewsletterSubscribed`: boolean
  - `qrCode`: string
  - `status`: string (enum ACTIVE|SUSPENDED|PENDING_DELETION|DELETED)
  - `isTwoFactorOn`: boolean
  - `otpChannel`: string (enum EMAIL|WHATSAPP)
  - `emailVerifiedAt`?: string (date-time)
  - `phoneVerifiedAt`?: string (date-time)
  - `deletionRequestedAt`?: string (date-time)
  - `createdAt`: string (date-time)
  - `updatedAt`: string (date-time)
  - `roleCount`: number
  - `sessionCount`: number — Number of active sessions
  - `roles`: RoleDto[]
    - `id`: string
    - `name`: string (e.g. "User Manager")
    - `description`?: string (e.g. "Manage all user operations")
    - `isSystem`: boolean (default false)
    - `createdAt`: string (date-time)
    - `updatedAt`: string (date-time)

### PATCH `/api/v1/users/{id}`

**Update user profile fields**

Auth: Bearer token

Parameters:
- `id` (path, string)

Request body (application/json, required):
- `username`?: string (e.g. "jsmith") — Must start with a letter, between 4-20 characters
- `displayName`?: string (max 50) — Display name / nickname
- `firstName`?: string (max 50) — First name
- `lastName`?: string (max 50) — Last name
- `avatar`?: string — Avatar upload key

Response 200 — User updated successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: UserDto
  - `id`: string
  - `username`: string
  - `email`: string
  - `phone`: string
  - `displayName`?: string
  - `firstName`?: string
  - `lastName`?: string
  - `avatar`?: string
  - `language`: string
  - `isNewsletterSubscribed`: boolean
  - `qrCode`: string
  - `status`: string (enum ACTIVE|SUSPENDED|PENDING_DELETION|DELETED)
  - `isTwoFactorOn`: boolean
  - `otpChannel`: string (enum EMAIL|WHATSAPP)
  - `emailVerifiedAt`?: string (date-time)
  - `phoneVerifiedAt`?: string (date-time)
  - `deletionRequestedAt`?: string (date-time)
  - `createdAt`: string (date-time)
  - `updatedAt`: string (date-time)

### DELETE `/api/v1/users/{id}`

**Delete a user immediately, skipping the grace period**

Auth: Bearer token

Parameters:
- `id` (path, string)

Response 200 — User deleted successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")

### PATCH `/api/v1/users/{id}/email`

**Override user email. Clears verification and may disable 2FA**

Auth: Bearer token

Parameters:
- `id` (path, string)

Request body (application/json, required):
- `newEmail`: string — New email address

Response 200 — User email changed successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: UserDto
  - `id`: string
  - `username`: string
  - `email`: string
  - `phone`: string
  - `displayName`?: string
  - `firstName`?: string
  - `lastName`?: string
  - `avatar`?: string
  - `language`: string
  - `isNewsletterSubscribed`: boolean
  - `qrCode`: string
  - `status`: string (enum ACTIVE|SUSPENDED|PENDING_DELETION|DELETED)
  - `isTwoFactorOn`: boolean
  - `otpChannel`: string (enum EMAIL|WHATSAPP)
  - `emailVerifiedAt`?: string (date-time)
  - `phoneVerifiedAt`?: string (date-time)
  - `deletionRequestedAt`?: string (date-time)
  - `createdAt`: string (date-time)
  - `updatedAt`: string (date-time)

### PATCH `/api/v1/users/{id}/phone`

**Override user phone. Clears verification and may disable 2FA**

Auth: Bearer token

Parameters:
- `id` (path, string)

Request body (application/json, required):
- `newPhone`: string (e.g. "+201234567890") — New phone must be in E.164 format

Response 200 — User phone changed successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: UserDto
  - `id`: string
  - `username`: string
  - `email`: string
  - `phone`: string
  - `displayName`?: string
  - `firstName`?: string
  - `lastName`?: string
  - `avatar`?: string
  - `language`: string
  - `isNewsletterSubscribed`: boolean
  - `qrCode`: string
  - `status`: string (enum ACTIVE|SUSPENDED|PENDING_DELETION|DELETED)
  - `isTwoFactorOn`: boolean
  - `otpChannel`: string (enum EMAIL|WHATSAPP)
  - `emailVerifiedAt`?: string (date-time)
  - `phoneVerifiedAt`?: string (date-time)
  - `deletionRequestedAt`?: string (date-time)
  - `createdAt`: string (date-time)
  - `updatedAt`: string (date-time)

### POST `/api/v1/users/{id}/suspend`

**Suspend user and revoke all their sessions**

Auth: Bearer token

Parameters:
- `id` (path, string)

Response 200 — User suspended successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: UserDto
  - `id`: string
  - `username`: string
  - `email`: string
  - `phone`: string
  - `displayName`?: string
  - `firstName`?: string
  - `lastName`?: string
  - `avatar`?: string
  - `language`: string
  - `isNewsletterSubscribed`: boolean
  - `qrCode`: string
  - `status`: string (enum ACTIVE|SUSPENDED|PENDING_DELETION|DELETED)
  - `isTwoFactorOn`: boolean
  - `otpChannel`: string (enum EMAIL|WHATSAPP)
  - `emailVerifiedAt`?: string (date-time)
  - `phoneVerifiedAt`?: string (date-time)
  - `deletionRequestedAt`?: string (date-time)
  - `createdAt`: string (date-time)
  - `updatedAt`: string (date-time)

### POST `/api/v1/users/{id}/unsuspend`

**Unsuspend user**

Auth: Bearer token

Parameters:
- `id` (path, string)

Response 200 — User unsuspended successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: UserDto
  - `id`: string
  - `username`: string
  - `email`: string
  - `phone`: string
  - `displayName`?: string
  - `firstName`?: string
  - `lastName`?: string
  - `avatar`?: string
  - `language`: string
  - `isNewsletterSubscribed`: boolean
  - `qrCode`: string
  - `status`: string (enum ACTIVE|SUSPENDED|PENDING_DELETION|DELETED)
  - `isTwoFactorOn`: boolean
  - `otpChannel`: string (enum EMAIL|WHATSAPP)
  - `emailVerifiedAt`?: string (date-time)
  - `phoneVerifiedAt`?: string (date-time)
  - `deletionRequestedAt`?: string (date-time)
  - `createdAt`: string (date-time)
  - `updatedAt`: string (date-time)

### POST `/api/v1/users/{id}/force-logout`

**Force logout user from all devices**

Auth: Bearer token

Parameters:
- `id` (path, string)

Response 200 — User logged out successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")

## Me

### GET `/api/v1/me`

**Get my profile**

Auth: Bearer token

Response 200 — Profile retrieved successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: ProfileDto
  - `id`: string
  - `username`: string
  - `email`: string
  - `phone`: string
  - `displayName`: string
  - `firstName`?: string
  - `lastName`?: string
  - `avatar`?: string
  - `language`: string
  - `isNewsletterSubscribed`: boolean
  - `qrCode`: string
  - `status`: string (enum ACTIVE|SUSPENDED|PENDING_DELETION|DELETED)
  - `isTwoFactorOn`: boolean
  - `otpChannel`: string (enum EMAIL|WHATSAPP)
  - `emailVerifiedAt`?: string (date-time)
  - `phoneVerifiedAt`?: string (date-time)
  - `createdAt`: string (date-time)
  - `updatedAt`: string (date-time)
  - `roles`: string[]
  - `permissions`: string[]

### PATCH `/api/v1/me`

**Update my profile**

Auth: Bearer token

Request body (application/json, required):
- `displayName`?: string (max 50) — Display name / nickname
- `firstName`?: string (max 50) — First name
- `lastName`?: string (max 50) — Last name
- `avatar`?: string — Avatar upload key
- `language`?: string (enum en) — Preferred language
- `isNewsletterSubscribed`?: boolean — Whether the user is subscribed to the newsletter

Response 200 — Profile updated successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: ProfileDto
  - `id`: string
  - `username`: string
  - `email`: string
  - `phone`: string
  - `displayName`: string
  - `firstName`?: string
  - `lastName`?: string
  - `avatar`?: string
  - `language`: string
  - `isNewsletterSubscribed`: boolean
  - `qrCode`: string
  - `status`: string (enum ACTIVE|SUSPENDED|PENDING_DELETION|DELETED)
  - `isTwoFactorOn`: boolean
  - `otpChannel`: string (enum EMAIL|WHATSAPP)
  - `emailVerifiedAt`?: string (date-time)
  - `phoneVerifiedAt`?: string (date-time)
  - `createdAt`: string (date-time)
  - `updatedAt`: string (date-time)
  - `roles`: string[]
  - `permissions`: string[]

### DELETE `/api/v1/me`

**Request account deletion, with a configurable grace period before permanent deletion**

Auth: Bearer token

Response 200 — Account deletion requested successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: DeletionRequestedDto
  - `scheduledAt`: string (date-time) — When the account will be permanently deleted

### POST `/api/v1/me/change-password`

**Change my password**

Auth: Bearer token

Request body (application/json, required):
- `currentPassword`: string — Current password
- `newPassword`: string — New password

Response 200 — Password changed successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")

### POST `/api/v1/me/email/change`

**Request email change (requires re-auth)**

Auth: Bearer token

Request body (application/json, required):
- `newEmail`: string — New email address

Response 200 — Verification code sent to the new email
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: OtpSentDto
  - `target`: string (e.g. "em***@example.com") — Masked target
  - `channel`: string (enum EMAIL|WHATSAPP)
  - `expiresIn`: number (e.g. 300) — Seconds until expiry

### POST `/api/v1/me/email/change/confirm`

**Verify email change with OTP**

Auth: Bearer token

Request body (application/json, required):
- `code`: string (e.g. "123456") — 6-digit verification code

Response 200 — Email changed successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")

### POST `/api/v1/me/phone/change`

**Request phone change (requires re-auth)**

Auth: Bearer token

Request body (application/json, required):
- `newPhone`: string (e.g. "+201234567890") — New phone must be in E.164 format

Response 200 — Verification code sent to the new phone
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: OtpSentDto
  - `target`: string (e.g. "em***@example.com") — Masked target
  - `channel`: string (enum EMAIL|WHATSAPP)
  - `expiresIn`: number (e.g. 300) — Seconds until expiry

### POST `/api/v1/me/phone/change/confirm`

**Verify phone change with OTP**

Auth: Bearer token

Request body (application/json, required):
- `code`: string (e.g. "123456") — 6-digit verification code

Response 200 — Phone changed successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")

### POST `/api/v1/me/email/verify`

**Send OTP to verify current email**

Auth: Bearer token

Response 200 — Verification code sent to the current email
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: OtpSentDto
  - `target`: string (e.g. "em***@example.com") — Masked target
  - `channel`: string (enum EMAIL|WHATSAPP)
  - `expiresIn`: number (e.g. 300) — Seconds until expiry

### POST `/api/v1/me/email/verify/confirm`

**Confirm email verification with OTP**

Auth: Bearer token

Request body (application/json, required):
- `code`: string (e.g. "123456") — 6-digit verification code

Response 200 — Email verified successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")

### POST `/api/v1/me/phone/verify`

**Send OTP to verify current phone**

Auth: Bearer token

Response 200 — Verification code sent to the current phone
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: OtpSentDto
  - `target`: string (e.g. "em***@example.com") — Masked target
  - `channel`: string (enum EMAIL|WHATSAPP)
  - `expiresIn`: number (e.g. 300) — Seconds until expiry

### POST `/api/v1/me/phone/verify/confirm`

**Confirm phone verification with OTP**

Auth: Bearer token

Request body (application/json, required):
- `code`: string (e.g. "123456") — 6-digit verification code

Response 200 — Phone verified successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")

## Permissions

### GET `/api/v1/permissions`

**List all permissions**

Auth: Bearer token

Response 200 — Permissions retrieved successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: PermissionDto[]
  - `id`: string
  - `key`: string (e.g. "user:read")
  - `resource`: string (e.g. "user")
  - `action`: string (e.g. "suspend")
  - `displayName`: string (e.g. "Suspend Users")
  - `description`?: string (e.g. "Suspend and unsuspend user accounts")
  - `group`: string (e.g. "User Management")

## Roles

### GET `/api/v1/roles`

**List all roles**

Auth: Bearer token

Parameters:
- `page`? (query, number, ≥ 1, default 1, e.g. 1) — Page number
- `limit`? (query, number, ≥ 1, ≤ 500, default 100, e.g. 20) — Items per page
- `sortBy`? (query, string, e.g. "createdAt") — Field to sort by
- `sortOrder`? (query, string, enum asc|desc, default "asc", e.g. "desc") — Sort order
- `include`? (query, string, e.g. "roles") — Comma separated list of relations to include
- `search`? (query, string, e.g. "admin") — Search by name or description
- `isSystem`? (query, boolean, e.g. true) — Filter by system roles

Response 200 — Roles retrieved successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Data retrieved successfully")
- `data`: string[] — Response data
- `meta`: PaginationMetaDto
  - `page`: number (e.g. 1) — Current page number
  - `limit`: number (e.g. 20) — Items per page
  - `total`: number (e.g. 100) — Total number of items
  - `totalPages`: number (e.g. 5) — Total number of pages
  - `hasNextPage`: boolean (e.g. true) — Whether there is a next page
  - `hasPrevPage`: boolean (e.g. false) — Whether there is a previous page
  - `nextCursor`?: string — Cursor for next page
  - `prevCursor`?: string — Cursor for previous page
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: RoleListDto[]
  - `id`: string
  - `name`: string (e.g. "User Manager")
  - `description`?: string (e.g. "Manage all user operations")
  - `isSystem`: boolean (default false)
  - `createdAt`: string (date-time)
  - `updatedAt`: string (date-time)
  - `userCount`: number
  - `permissionCount`: number
  - `permissions`: PermissionDto[]
    - `id`: string
    - `key`: string (e.g. "user:read")
    - `resource`: string (e.g. "user")
    - `action`: string (e.g. "suspend")
    - `displayName`: string (e.g. "Suspend Users")
    - `description`?: string (e.g. "Suspend and unsuspend user accounts")
    - `group`: string (e.g. "User Management")

### POST `/api/v1/roles`

**Create a new role**

Auth: Bearer token

Request body (application/json, required):
- `name`: string (e.g. "User Manager") — Unique name for the role
- `description`?: string (e.g. "Manages user operations") — Summary of what this role can do
- `permissionKeys`?: string[] (e.g. ["user:read","user:update"])

Response 201 — Role created successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: RoleDto
  - `id`: string
  - `name`: string (e.g. "User Manager")
  - `description`?: string (e.g. "Manage all user operations")
  - `isSystem`: boolean (default false)
  - `createdAt`: string (date-time)
  - `updatedAt`: string (date-time)

### GET `/api/v1/roles/{id}`

**Get role details**

Auth: Bearer token

Parameters:
- `id` (path, string)

Response 200 — Role retrieved successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: RoleDetailDto
  - `id`: string
  - `name`: string (e.g. "User Manager")
  - `description`?: string (e.g. "Manage all user operations")
  - `isSystem`: boolean (default false)
  - `createdAt`: string (date-time)
  - `updatedAt`: string (date-time)
  - `userCount`: number
  - `permissions`: PermissionDto[]
    - `id`: string
    - `key`: string (e.g. "user:read")
    - `resource`: string (e.g. "user")
    - `action`: string (e.g. "suspend")
    - `displayName`: string (e.g. "Suspend Users")
    - `description`?: string (e.g. "Suspend and unsuspend user accounts")
    - `group`: string (e.g. "User Management")

### PATCH `/api/v1/roles/{id}`

**Update role name or description**

Auth: Bearer token

Parameters:
- `id` (path, string)

Request body (application/json, required):
- `name`?: string (e.g. "User Manager") — Role visible name
- `description`?: string (e.g. "Manage all user operations") — Summary of what this role can do

Response 200 — Role updated successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: RoleDto
  - `id`: string
  - `name`: string (e.g. "User Manager")
  - `description`?: string (e.g. "Manage all user operations")
  - `isSystem`: boolean (default false)
  - `createdAt`: string (date-time)
  - `updatedAt`: string (date-time)

### DELETE `/api/v1/roles/{id}`

**Delete a role**

Auth: Bearer token

Parameters:
- `id` (path, string)

Response 200 — Role deleted successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")

## Role Permissions

### GET `/api/v1/roles/{roleId}/permissions`

**List role's permissions**

Auth: Bearer token

Parameters:
- `roleId` (path, string)

Response 200 — Role permissions retrieved successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: PermissionDto[]
  - `id`: string
  - `key`: string (e.g. "user:read")
  - `resource`: string (e.g. "user")
  - `action`: string (e.g. "suspend")
  - `displayName`: string (e.g. "Suspend Users")
  - `description`?: string (e.g. "Suspend and unsuspend user accounts")
  - `group`: string (e.g. "User Management")

### POST `/api/v1/roles/{roleId}/permissions`

**Add permissions to a role**

Auth: Bearer token

Parameters:
- `roleId` (path, string)

Request body (application/json, required):
- `permissionKeys`: string[] (e.g. ["user:read","user:create"]) — Array of permission keys to assign to the role

Response 200 — Permissions added successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: PermissionDto[]
  - `id`: string
  - `key`: string (e.g. "user:read")
  - `resource`: string (e.g. "user")
  - `action`: string (e.g. "suspend")
  - `displayName`: string (e.g. "Suspend Users")
  - `description`?: string (e.g. "Suspend and unsuspend user accounts")
  - `group`: string (e.g. "User Management")

### PUT `/api/v1/roles/{roleId}/permissions`

**Replace all role permissions**

Auth: Bearer token

Parameters:
- `roleId` (path, string)

Request body (application/json, required):
- `permissionKeys`: string[] (e.g. ["user:read","user:create"]) — Array of permission keys to assign to the role

Response 200 — Role permissions updated successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: PermissionDto[]
  - `id`: string
  - `key`: string (e.g. "user:read")
  - `resource`: string (e.g. "user")
  - `action`: string (e.g. "suspend")
  - `displayName`: string (e.g. "Suspend Users")
  - `description`?: string (e.g. "Suspend and unsuspend user accounts")
  - `group`: string (e.g. "User Management")

### DELETE `/api/v1/roles/{roleId}/permissions/{permissionKey}`

**Remove a permission from role**

Auth: Bearer token

Parameters:
- `roleId` (path, string)
- `permissionKey` (path, string)

Response 200 — Permission removed successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")

## User Roles

### GET `/api/v1/users/{userId}/roles`

**List user's roles**

Auth: Bearer token

Parameters:
- `userId` (path, string)

Response 200 — User roles retrieved successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: RoleDto[]
  - `id`: string
  - `name`: string (e.g. "User Manager")
  - `description`?: string (e.g. "Manage all user operations")
  - `isSystem`: boolean (default false)
  - `createdAt`: string (date-time)
  - `updatedAt`: string (date-time)

### POST `/api/v1/users/{userId}/roles`

**Add roles to user**

Auth: Bearer token

Parameters:
- `userId` (path, string)

Request body (application/json, required):
- `roleIds`: string[] (e.g. ["uuid-1","uuid-2"]) — Role IDs to assign

Response 200 — Roles added successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: RoleDto[]
  - `id`: string
  - `name`: string (e.g. "User Manager")
  - `description`?: string (e.g. "Manage all user operations")
  - `isSystem`: boolean (default false)
  - `createdAt`: string (date-time)
  - `updatedAt`: string (date-time)

### PUT `/api/v1/users/{userId}/roles`

**Replace all user roles**

Auth: Bearer token

Parameters:
- `userId` (path, string)

Request body (application/json, required):
- `roleIds`: string[] (e.g. ["uuid-1","uuid-2"]) — Role IDs to assign

Response 200 — User roles updated successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: RoleDto[]
  - `id`: string
  - `name`: string (e.g. "User Manager")
  - `description`?: string (e.g. "Manage all user operations")
  - `isSystem`: boolean (default false)
  - `createdAt`: string (date-time)
  - `updatedAt`: string (date-time)

### DELETE `/api/v1/users/{userId}/roles/{roleId}`

**Remove a role from user**

Auth: Bearer token

Parameters:
- `userId` (path, string)
- `roleId` (path, string)

Response 200 — Role removed successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")

## Authentication

### POST `/api/v1/auth/register/validate`

**Validate signup data for uniqueness**

Auth: none

Request body (application/json, required):
- `username`: string (e.g. "jsmith") — Must start with a letter, between 4-20 characters
- `email`: string (e.g. "email@example.com")
- `phone`: string (e.g. "+201234567890") — Phone must be in E.164 format

Response 200 — Validation successful
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")

### POST `/api/v1/auth/register/send-otp`

**Send registration verification OTP**

Auth: none

Request body (application/json, required):
- `identifier`: string — Email address or phone number
- `channel`: string (enum EMAIL|WHATSAPP, e.g. "EMAIL")

Response 200 — Verification code sent
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: RegisterOtpSentDto
  - `target`: string (e.g. "em***@example.com") — Masked target
  - `channel`: string (enum EMAIL|WHATSAPP)
  - `expiresIn`: number (e.g. 300) — Seconds until expiry
  - `transactionalToken`: string — Token to use in the register flow's next steps

### POST `/api/v1/auth/register/verify`

**Verify registration OTP**

Auth: none

Request body (application/json, required):
- `transactionalToken`: string — Token received from the OTP request step
- `code`: string (e.g. "123456") — 6-digit verification code

Response 200 — Verification completed
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: TransactionalTokenDto
  - `transactionalToken`: string

### POST `/api/v1/auth/register/complete`

**Complete registration and create the new account**

Auth: none

Request body (application/json, required):
- `transactionalToken`: string — Token received from register verification
- `password`: string (e.g. "MyP@ssword123")
- `deviceType`?: string (e.g. "mobile") — Device type (mobile, desktop, tablet, etc)
- `deviceName`?: string (e.g. "iPhone 15") — Device name (iPhone 15, Samsung S24, Windows 10, etc)

Response 201 — Account created successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: AuthTokensDto
  - `user`: AuthUserDto
    - `id`: string
    - `username`: string
    - `email`: string
    - `phone`: string
    - `displayName`: string
    - `avatar`?: string
    - `qrCode`: string
    - `isTwoFactorOn`: boolean
    - `otpChannel`: string (enum EMAIL|WHATSAPP)
    - `status`: string (enum ACTIVE|SUSPENDED|PENDING_DELETION|DELETED)
    - `language`: string
    - `emailVerifiedAt`?: string (date-time)
    - `phoneVerifiedAt`?: string (date-time)
  - `accessToken`: string
  - `refreshToken`: string

### POST `/api/v1/auth/login`

**Login with credentials**

Auth: none

Request body (application/json, required):
- `identifier`: string — Username or email address
- `password`: string (e.g. "MyP@ssword123")
- `deviceType`?: string (e.g. "mobile") — Device type (mobile, desktop, tablet, etc)
- `deviceName`?: string (e.g. "iPhone 15") — Device name (iPhone 15, Samsung S24, Windows 10, etc)

Response 200 — Login successful
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: LoginResponseDto
  - `twoFactorRequired`: boolean (default false) — True if 2FA is required for the login process
  - `accountRestored`: boolean (default false) — True if the account was restored from pending deletion during this login
  - `user`?: AuthUserDto
    - `id`: string
    - `username`: string
    - `email`: string
    - `phone`: string
    - `displayName`: string
    - `avatar`?: string
    - `qrCode`: string
    - `isTwoFactorOn`: boolean
    - `otpChannel`: string (enum EMAIL|WHATSAPP)
    - `status`: string (enum ACTIVE|SUSPENDED|PENDING_DELETION|DELETED)
    - `language`: string
    - `emailVerifiedAt`?: string (date-time)
    - `phoneVerifiedAt`?: string (date-time)
  - `accessToken`?: string
  - `refreshToken`?: string
  - `transactionalToken`?: string
  - `channel`?: string (enum EMAIL|WHATSAPP)

### POST `/api/v1/auth/login/two-factor`

**Complete 2FA during login**

Auth: none

Request body (application/json, required):
- `transactionalToken`: string — Token received from login response
- `code`: string (e.g. "123456") — 6-digit verification code
- `deviceType`?: string (e.g. "mobile") — Device type (mobile, web, tablet, etc)
- `deviceName`?: string (e.g. "iPhone 15") — Device name

Response 200 — Two factor challenge completed
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: LoginResponseDto
  - `twoFactorRequired`: boolean (default false) — True if 2FA is required for the login process
  - `accountRestored`: boolean (default false) — True if the account was restored from pending deletion during this login
  - `user`?: AuthUserDto
    - `id`: string
    - `username`: string
    - `email`: string
    - `phone`: string
    - `displayName`: string
    - `avatar`?: string
    - `qrCode`: string
    - `isTwoFactorOn`: boolean
    - `otpChannel`: string (enum EMAIL|WHATSAPP)
    - `status`: string (enum ACTIVE|SUSPENDED|PENDING_DELETION|DELETED)
    - `language`: string
    - `emailVerifiedAt`?: string (date-time)
    - `phoneVerifiedAt`?: string (date-time)
  - `accessToken`?: string
  - `refreshToken`?: string
  - `transactionalToken`?: string
  - `channel`?: string (enum EMAIL|WHATSAPP)

### POST `/api/v1/auth/refresh`

**Refresh access token**

Auth: none

Request body (application/json, required):
- `refreshToken`: string — Refresh token from login response

Response 200 — Token refreshed successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: TokensDto
  - `accessToken`: string
  - `refreshToken`: string

### POST `/api/v1/auth/logout`

**Logout of current session**

Auth: Bearer token

Request body (application/json, required):
- `refreshToken`: string — Refresh token to revoke

Response 200 — Logged out successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")

### POST `/api/v1/auth/logout/all`

**Logout from all devices**

Auth: Bearer token

Response 200 — Logged out from all devices
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")

### GET `/api/v1/auth/sessions`

**List active sessions for the user**

Auth: Bearer token

Response 200 — Sessions retrieved successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: SessionDto[]
  - `id`: string
  - `deviceType`?: string
  - `deviceName`?: string
  - `ipAddress`?: string
  - `lastActiveAt`: string (date-time)
  - `createdAt`: string (date-time)
  - `isCurrent`: boolean — True if this is the current session the user is using

### DELETE `/api/v1/auth/sessions/{id}`

**Revoke a specific session**

Auth: Bearer token

Parameters:
- `id` (path, string)

Response 200 — Session revoked successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")

### POST `/api/v1/auth/forgot-password/request`

**Request a password reset OTP**

Auth: none

Request body (application/json, required):
- `identifier`: string — Email address or phone number
- `channel`: string (enum EMAIL|WHATSAPP, e.g. "EMAIL")

Response 200 — Password reset code sent
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: ForgotPasswordOtpSentDto
  - `target`: string (e.g. "em***@example.com") — Masked target
  - `channel`: string (enum EMAIL|WHATSAPP)
  - `expiresIn`: number (e.g. 300) — Seconds until expiry
  - `transactionalToken`: string — Token to use in the forgot password flow's next steps

### POST `/api/v1/auth/forgot-password/verify`

**Verify password reset OTP**

Auth: none

Request body (application/json, required):
- `transactionalToken`: string — Token received from forgot password request step
- `code`: string (e.g. "123456") — 6-digit verification code

Response 200 — Verification completed
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: TransactionalTokenDto
  - `transactionalToken`: string

### POST `/api/v1/auth/forgot-password/reset`

**Reset password with new password**

Auth: none

Request body (application/json, required):
- `transactionalToken`: string — Token received from forgot password verification step
- `newPassword`: string (e.g. "NewP@ssword123")

Response 200 — Password reset successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")

### POST `/api/v1/auth/two-factor/enable`

**Start 2FA process and send verification OTP**

Auth: Bearer token

Request body (application/json, required):
- `channel`: string (enum EMAIL|WHATSAPP, e.g. "EMAIL")

Response 200 — Verification code sent
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: OtpSentDto
  - `target`: string (e.g. "em***@example.com") — Masked target
  - `channel`: string (enum EMAIL|WHATSAPP)
  - `expiresIn`: number (e.g. 300) — Seconds until expiry

### POST `/api/v1/auth/two-factor/enable/verify`

**Confirm two-factor authentication enabling**

Auth: Bearer token

Request body (application/json, required):
- `code`: string (e.g. "123456") — 6-digit verification code
- `channel`: string (enum EMAIL|WHATSAPP, e.g. "EMAIL")

Response 200 — Two-factor authentication enabled
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")

### POST `/api/v1/auth/two-factor/disable`

**Disable two-factor authentication**

Auth: Bearer token

Response 200 — Two-factor authentication disabled
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")

### POST `/api/v1/auth/reauth/request-otp`

**Request OTP for re-authentication**

Auth: Bearer token

Response 200 — Re-authentication OTP sent successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: OtpSentDto
  - `target`: string (e.g. "em***@example.com") — Masked target
  - `channel`: string (enum EMAIL|WHATSAPP)
  - `expiresIn`: number (e.g. 300) — Seconds until expiry

### POST `/api/v1/auth/reauth/verify/password`

**Verify re-authentication with password**

Auth: Bearer token

Request body (application/json, required):
- `password`: string — Current password

Response 200 — Re-authentication successful
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")

### POST `/api/v1/auth/reauth/verify/otp`

**Verify re-authentication with OTP**

Auth: Bearer token

Request body (application/json, required):
- `code`: string (e.g. "123456") — 6-digit verification code

Response 200 — Re-authentication successful
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")

## User Sessions

### GET `/api/v1/users/{userId}/sessions`

**List user's active sessions**

Auth: Bearer token

Parameters:
- `userId` (path, string)

Response 200 — Sessions retrieved successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: SessionDto[]
  - `id`: string
  - `deviceType`?: string
  - `deviceName`?: string
  - `ipAddress`?: string
  - `lastActiveAt`: string (date-time)
  - `createdAt`: string (date-time)
  - `isCurrent`: boolean — True if this is the current session the user is using

## Audit Logs

### GET `/api/v1/audit-logs/filters`

**Get available filter options for audit logs**

Auth: Bearer token

Response 200 — Audit filter options retrieved successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: AuditFiltersDto
  - `resources`: string[] (e.g. ["role","user","broadcast"])
  - `actions`: string[] (e.g. ["created","updated","deleted"])
  - `resourceActions`: object (e.g. {"role":["created","updated","deleted","permissions_changed"]}) — Actions available for every resource

### GET `/api/v1/audit-logs`

**List audit logs**

Auth: Bearer token

Parameters:
- `page`? (query, number, ≥ 1, default 1, e.g. 1) — Page number
- `limit`? (query, number, ≥ 1, ≤ 500, default 100, e.g. 20) — Items per page
- `sortBy`? (query, string, e.g. "createdAt") — Field to sort by
- `sortOrder`? (query, string, enum asc|desc, default "asc", e.g. "desc") — Sort order
- `include`? (query, string, e.g. "roles") — Comma separated list of relations to include
- `search`? (query, string) — Search by resource ID, request ID, or IP address
- `resource`? (query, string, e.g. "role") — Filter by resource type
- `action`? (query, string, e.g. "created") — Filter by action
- `actorId`? (query, string) — Filter by actor using user ID
- `resourceId`? (query, string) — Filter by target resource ID
- `from`? (query, string, e.g. "2026-01-01") — Filter from date
- `to`? (query, string, e.g. "2026-12-31") — Filter to date

Response 200 — Audit logs retrieved successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Data retrieved successfully")
- `data`: string[] — Response data
- `meta`: PaginationMetaDto
  - `page`: number (e.g. 1) — Current page number
  - `limit`: number (e.g. 20) — Items per page
  - `total`: number (e.g. 100) — Total number of items
  - `totalPages`: number (e.g. 5) — Total number of pages
  - `hasNextPage`: boolean (e.g. true) — Whether there is a next page
  - `hasPrevPage`: boolean (e.g. false) — Whether there is a previous page
  - `nextCursor`?: string — Cursor for next page
  - `prevCursor`?: string — Cursor for previous page
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: AuditLogListDto[]
  - `id`: string
  - `actorId`?: string
  - `resource`: string
  - `action`: string
  - `resourceId`?: string
  - `ipAddress`?: string
  - `createdAt`: string (date-time)
  - `actor`?: AuditActorDto
    - `id`: string
    - `username`: string
    - `email`: string
    - `phone`: string
    - `firstName`?: string
    - `lastName`?: string

### GET `/api/v1/audit-logs/{id}`

**Get audit log details**

Auth: Bearer token

Parameters:
- `id` (path, string)

Response 200 — Audit log retrieved successfully
- `success`: boolean (e.g. true)
- `message`: string (e.g. "Operation completed successfully")
- `data`: object — Response data
- `path`: string (e.g. "/api/v1/users")
- `timestamp`: string (e.g. "2025-02-05T12:00:00.000Z")
- `requestId`: string (e.g. "req-m1abc123-x7k2")
- `data`: AuditLogDetailDto
  - `id`: string
  - `actorId`?: string
  - `resource`: string
  - `action`: string
  - `resourceId`?: string
  - `ipAddress`?: string
  - `createdAt`: string (date-time)
  - `actor`?: AuditActorDto
    - `id`: string
    - `username`: string
    - `email`: string
    - `phone`: string
    - `firstName`?: string
    - `lastName`?: string
  - `details`?: object
  - `requestId`?: string
  - `userAgent`?: string

