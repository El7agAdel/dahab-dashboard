# Dahab API - Production — API reference

Generated from `/api/docs-json` (OpenAPI 3.0.0) on 2026-10-21. 98 routes.

## Health

### GET `/health`

**Application health check**

Auth: none

Response 200 — 

## Uploads

### GET `/api/v1/uploads/purposes`

**List upload purposes**

What file types and sizes are allowed per purpose

Auth: Bearer token

Response 200 — Upload purposes retrieved successfully

### GET `/api/v1/uploads`

**List all uploads**

**Required permission:** `upload:read`

Auth: Bearer token
- `page` (query): number [minimum 1, default 1] — Page number
- `limit` (query): number [minimum 1, maximum 500, default 100] — Items per page
- `sortBy` (query): string — Field to sort by
- `sortOrder` (query): string (asc|desc) [default "asc"] — Sort order
- `include` (query): string — Comma separated list of relations to include
- `search` (query): string — Search by original filename
- `purpose` (query): string (USER_AVATAR|CATEGORY_IMAGE|ITEM_IMAGE|BANNER_IMAGE)
- `uploadedBy` (query): string — Filter by uploader

Response 200 — Uploads retrieved successfully: `data` is UploadDto[]
- `id`: string
- `key`: string (e.g. "avatars/a8f3c2d1.png")
- `url`: string — Full URL of the file
- `purpose`: string — Which group of uploads this file belongs to (e.g. "USER_AVATAR")
- `uploadableId`: object — ID of the entity this upload is attached to. Null if unattached
- `originalName`: string (e.g. "avatar.png")
- `mimeType`: string (e.g. "image/png")
- `size`: number — File size in bytes (e.g. 184320)
- `uploadedBy`: string — User ID of who uploaded this file
- `createdAt`: string [format "date-time"]

### POST `/api/v1/uploads`

**Upload a file**

Auth: Bearer token

Request body (multipart/form-data, required): object
- `file`: string [format "binary"]
- `purpose`: string (USER_AVATAR|CATEGORY_IMAGE|ITEM_IMAGE|BANNER_IMAGE)

Response 201 — File uploaded successfully: `data` is UploadDto
- `id`: string
- `key`: string (e.g. "avatars/a8f3c2d1.png")
- `url`: string — Full URL of the file
- `purpose`: string — Which group of uploads this file belongs to (e.g. "USER_AVATAR")
- `uploadableId`: object — ID of the entity this upload is attached to. Null if unattached
- `originalName`: string (e.g. "avatar.png")
- `mimeType`: string (e.g. "image/png")
- `size`: number — File size in bytes (e.g. 184320)
- `uploadedBy`: string — User ID of who uploaded this file
- `createdAt`: string [format "date-time"]

### GET `/api/v1/uploads/{id}`

**Get uploaded file by ID**

**Required permission:** `upload:read`

Auth: Bearer token
- `id` (path, required): string

Response 200 — Upload retrieved successfully: `data` is UploadDto
- `id`: string
- `key`: string (e.g. "avatars/a8f3c2d1.png")
- `url`: string — Full URL of the file
- `purpose`: string — Which group of uploads this file belongs to (e.g. "USER_AVATAR")
- `uploadableId`: object — ID of the entity this upload is attached to. Null if unattached
- `originalName`: string (e.g. "avatar.png")
- `mimeType`: string (e.g. "image/png")
- `size`: number — File size in bytes (e.g. 184320)
- `uploadedBy`: string — User ID of who uploaded this file
- `createdAt`: string [format "date-time"]

### DELETE `/api/v1/uploads/{id}`

**Delete an upload**

**Required permission:** `upload:delete`

Auth: Bearer token
- `id` (path, required): string

Response 200 — Upload deleted successfully

## Device Tokens

### GET `/api/v1/me/device-tokens`

**List my push tokens**

List the current user's registered push tokens

Auth: Bearer token

Response 200 — Push tokens retrieved successfully: `data` is DeviceTokenDto[]
- `id`: string
- `platform`: string (ANDROID|IOS|WEB)
- `deviceName`?: object
- `lastSeenAt`: string [format "date-time"]
- `createdAt`: string [format "date-time"]

### POST `/api/v1/me/device-tokens`

**Register my push token**

Register or refresh a push token for the current user

Auth: Bearer token

Request body (application/json, required): RegisterDeviceTokenDto
- `deviceId`: string (e.g. "550e8400-e29b-41d4-a716-446655440000")
- `token`: string (e.g. "fcm_token_xxxxxxxxxxxx")
- `platform`: string (ANDROID|IOS|WEB) (e.g. "IOS")
- `deviceName`?: string (e.g. "John's iPhone")

Response 201 — Push token registered successfully: `data` is DeviceTokenDto
- `id`: string
- `platform`: string (ANDROID|IOS|WEB)
- `deviceName`?: object
- `lastSeenAt`: string [format "date-time"]
- `createdAt`: string [format "date-time"]

### DELETE `/api/v1/me/device-tokens/{id}`

**Unregister my push token**

Unregister a push token for the current user

Auth: Bearer token
- `id` (path, required): string

Response 200 — Push token unregistered successfully

## Notifications

### GET `/api/v1/me/notifications`

**List my notifications**

Get a list of the current user's notifications. Can be filtered by read/unread

Auth: Bearer token
- `page` (query): number [minimum 1, default 1] — Page number
- `limit` (query): number [minimum 1, maximum 500, default 100] — Items per page
- `sortBy` (query): string — Field to sort by
- `sortOrder` (query): string (asc|desc) [default "asc"] — Sort order
- `include` (query): string — Comma separated list of relations to include
- `read` (query): boolean — Filter by read state. Omit to return all read and unread

Response 200 — Notifications retrieved successfully: `data` is NotificationListDto[]
- `id`: string
- `type`: string
- `title`: string
- `body`: string
- `icon`: string (SYSTEM|ACCOUNT|SECURITY)
- `color`: string (DEFAULT|INFO|SUCCESS|WARNING|DANGER)
- `category`: string (TRANSACTIONAL|SECURITY|ACTIVITY|MARKETING)
- `targetType`?: object
- `targetId`?: object
- `readAt`?: object
- `createdAt`: string [format "date-time"]

### GET `/api/v1/me/notifications/unread-count`

**Count my unread notifications**

Auth: Bearer token

Response 200 — Unread count retrieved successfully: `data` is UnreadCountDto
- `count`: number (e.g. 3)

### GET `/api/v1/me/notifications/{id}`

**Get my notification by ID**

Auth: Bearer token
- `id` (path, required): string

Response 200 — Notification retrieved successfully: `data` is NotificationDto
- `id`: string
- `type`: string
- `title`: string
- `body`: string
- `icon`: string (SYSTEM|ACCOUNT|SECURITY)
- `color`: string (DEFAULT|INFO|SUCCESS|WARNING|DANGER)
- `category`: string (TRANSACTIONAL|SECURITY|ACTIVITY|MARKETING)
- `targetType`?: object
- `targetId`?: object
- `readAt`?: object
- `createdAt`: string [format "date-time"]

### POST `/api/v1/me/notifications/{id}/read`

**Mark my notification as read**

Auth: Bearer token
- `id` (path, required): string

Response 200 — Notification marked as read: `data` is NotificationDto
- `id`: string
- `type`: string
- `title`: string
- `body`: string
- `icon`: string (SYSTEM|ACCOUNT|SECURITY)
- `color`: string (DEFAULT|INFO|SUCCESS|WARNING|DANGER)
- `category`: string (TRANSACTIONAL|SECURITY|ACTIVITY|MARKETING)
- `targetType`?: object
- `targetId`?: object
- `readAt`?: object
- `createdAt`: string [format "date-time"]

### POST `/api/v1/me/notifications/read-all`

**Mark all my notifications as read**

Auth: Bearer token

Response 200 — All notifications marked as read: `data` is MarkAllReadDto
- `marked`: number (e.g. 12)

## Broadcasts

### GET `/api/v1/broadcasts`

**List broadcasts**

**Required permission:** `broadcast:read`

Auth: Bearer token
- `page` (query): number [minimum 1, default 1] — Page number
- `limit` (query): number [minimum 1, maximum 500, default 100] — Items per page
- `sortBy` (query): string — Field to sort by
- `sortOrder` (query): string (asc|desc) [default "asc"] — Sort order
- `include` (query): string — Comma separated list of relations to include
- `channel` (query): string (EMAIL|WHATSAPP|PUSH)
- `audience` (query): string (ME|ALL_USERS|NEW_USERS|NEWSLETTER_SUBSCRIBERS|USER_IDS|ROLES)
- `status` (query): string (DRAFT|SENDING|COMPLETED|FAILED)

Response 200 — Broadcasts retrieved successfully: `data` is BroadcastListDto[]
- `id`: string
- `title`: string
- `body`: string
- `channel`: string (EMAIL|WHATSAPP|PUSH)
- `audience`: string
- `audienceParams`?: object
- `persistAsNotification`: boolean
- `status`: string (DRAFT|SENDING|COMPLETED|FAILED)
- `audienceSize`?: object
- `sentSuccessCount`?: object
- `sentFailureCount`?: object
- `createdBy`: string
- `createdAt`: string [format "date-time"]
- `completedAt`?: object
- `failureReason`?: object

### POST `/api/v1/broadcasts`

**Send a broadcast**

**Required permission:** `broadcast:create`

Auth: Bearer token

Request body (application/json, required): CreateBroadcastDto
- `audience`: string (ME|ALL_USERS|NEW_USERS|NEWSLETTER_SUBSCRIBERS|USER_IDS|ROLES) (e.g. "NEW_USERS")
- `audienceParams`?: BroadcastAudienceParamsDto — Audience-specific parameters, required for the USER_IDS and ROLES audiences
  - `userIds`?: string[] — Target these explicit user IDs
  - `roleIds`?: string[] — Target users holding any of these role IDs
- `title`: string (e.g. "Scheduled maintenance tonight")
- `body`: string (e.g. "We'll be performing maintenance from 11 PM to midnight. The app may be briefly unavailable.")
- `channel`: string (EMAIL|WHATSAPP|PUSH) (e.g. "PUSH")
- `persistAsNotification`?: boolean — Persist a notification row per recipient. Omit to use the broadcast default

Response 201 — Broadcast queued for delivery: `data` is BroadcastDto
- `id`: string
- `title`: string
- `body`: string
- `channel`: string (EMAIL|WHATSAPP|PUSH)
- `audience`: string
- `audienceParams`?: object
- `persistAsNotification`: boolean
- `status`: string (DRAFT|SENDING|COMPLETED|FAILED)
- `audienceSize`?: object
- `sentSuccessCount`?: object
- `sentFailureCount`?: object
- `createdBy`: string
- `createdAt`: string [format "date-time"]
- `completedAt`?: object
- `failureReason`?: object

### POST `/api/v1/broadcasts/audience/preview`

**Preview audience size**

**Required permission:** `broadcast:create`

Auth: Bearer token

Request body (application/json, required): AudienceSelectionDto
- `audience`: string (ME|ALL_USERS|NEW_USERS|NEWSLETTER_SUBSCRIBERS|USER_IDS|ROLES) (e.g. "NEW_USERS")
- `audienceParams`?: BroadcastAudienceParamsDto — Audience-specific parameters, required for the USER_IDS and ROLES audiences
  - `userIds`?: string[] — Target these explicit user IDs
  - `roleIds`?: string[] — Target users holding any of these role IDs

Response 200 — Audience size retrieved successfully: `data` is AudiencePreviewDto
- `audience`: string
- `size`: number (e.g. 1284)

### GET `/api/v1/broadcasts/{id}`

**Get a broadcast by ID**

**Required permission:** `broadcast:read`

Auth: Bearer token
- `id` (path, required): string

Response 200 — Broadcast retrieved successfully: `data` is BroadcastDto
- `id`: string
- `title`: string
- `body`: string
- `channel`: string (EMAIL|WHATSAPP|PUSH)
- `audience`: string
- `audienceParams`?: object
- `persistAsNotification`: boolean
- `status`: string (DRAFT|SENDING|COMPLETED|FAILED)
- `audienceSize`?: object
- `sentSuccessCount`?: object
- `sentFailureCount`?: object
- `createdBy`: string
- `createdAt`: string [format "date-time"]
- `completedAt`?: object
- `failureReason`?: object

## Users

### GET `/api/v1/users`

**List users with search and filters**

Auth: Bearer token
- `page` (query): number [minimum 1, default 1] — Page number
- `limit` (query): number [minimum 1, maximum 500, default 100] — Items per page
- `sortBy` (query): string — Field to sort by
- `sortOrder` (query): string (asc|desc) [default "asc"] — Sort order
- `include` (query): string — Comma separated list of relations to include
- `search` (query): string — Search by username, email, phone, or name
- `status` (query): string (ACTIVE|SUSPENDED|PENDING_DELETION|DELETED) — Filter by user status
- `roleId` (query): string — Filter by role ID
- `permissionKey` (query): string — Filter users holding a specific permission key through any of their roles
- `emailVerified` (query): boolean — Filter by email verification status
- `phoneVerified` (query): boolean — Filter by phone verification status

Response 200 — Users retrieved successfully: `data` is UserListDto[]
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
- `status`: string (ACTIVE|SUSPENDED|PENDING_DELETION|DELETED)
- `isTwoFactorOn`: boolean
- `otpChannel`: string (EMAIL|WHATSAPP)
- `emailVerifiedAt`?: string [format "date-time"]
- `phoneVerifiedAt`?: string [format "date-time"]
- `deletionRequestedAt`?: string [format "date-time"]
- `createdAt`: string [format "date-time"]
- `updatedAt`: string [format "date-time"]
- `roleCount`: number — Number of roles assigned
- `roles`?: RoleDto[]
  - `id`: string
  - `name`: string (e.g. "User Manager")
  - `description`?: string (e.g. "Manage all user operations")
  - `isSystem`: boolean [default false]
  - `createdAt`: string [format "date-time"]
  - `updatedAt`: string [format "date-time"]

### POST `/api/v1/users`

**Create a new user**

Auth: Bearer token

Request body (application/json, required): AdminCreateUserDto
- `username`: string — Must start with a letter, between 4-20 characters (e.g. "jsmith")
- `email`: string (e.g. "email@example.com")
- `phone`: string — Phone must be in E.164 format (e.g. "+201234567890")
- `password`: string (e.g. "MyP@ssword123")
- `displayName`?: string [maxLength 50] — Display name / nickname
- `firstName`?: string [maxLength 50]
- `lastName`?: string [maxLength 50]
- `avatar`?: string — Avatar upload key

Response 201 — User created successfully: `data` is UserDto
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
- `status`: string (ACTIVE|SUSPENDED|PENDING_DELETION|DELETED)
- `isTwoFactorOn`: boolean
- `otpChannel`: string (EMAIL|WHATSAPP)
- `emailVerifiedAt`?: string [format "date-time"]
- `phoneVerifiedAt`?: string [format "date-time"]
- `deletionRequestedAt`?: string [format "date-time"]
- `createdAt`: string [format "date-time"]
- `updatedAt`: string [format "date-time"]

### GET `/api/v1/users/{id}`

**Get user details**

Auth: Bearer token
- `id` (path, required): string

Response 200 — User retrieved successfully: `data` is UserDetailDto
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
- `status`: string (ACTIVE|SUSPENDED|PENDING_DELETION|DELETED)
- `isTwoFactorOn`: boolean
- `otpChannel`: string (EMAIL|WHATSAPP)
- `emailVerifiedAt`?: string [format "date-time"]
- `phoneVerifiedAt`?: string [format "date-time"]
- `deletionRequestedAt`?: string [format "date-time"]
- `createdAt`: string [format "date-time"]
- `updatedAt`: string [format "date-time"]
- `roleCount`: number
- `sessionCount`: number — Number of active sessions
- `roles`: RoleDto[]
  - `id`: string
  - `name`: string (e.g. "User Manager")
  - `description`?: string (e.g. "Manage all user operations")
  - `isSystem`: boolean [default false]
  - `createdAt`: string [format "date-time"]
  - `updatedAt`: string [format "date-time"]

### PATCH `/api/v1/users/{id}`

**Update user profile fields**

Auth: Bearer token
- `id` (path, required): string

Request body (application/json, required): AdminUpdateUserDto
- `username`?: string — Must start with a letter, between 4-20 characters (e.g. "jsmith")
- `displayName`?: string [maxLength 50] — Display name / nickname
- `firstName`?: string [maxLength 50] — First name
- `lastName`?: string [maxLength 50] — Last name
- `avatar`?: string — Avatar upload key

Response 200 — User updated successfully: `data` is UserDto
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
- `status`: string (ACTIVE|SUSPENDED|PENDING_DELETION|DELETED)
- `isTwoFactorOn`: boolean
- `otpChannel`: string (EMAIL|WHATSAPP)
- `emailVerifiedAt`?: string [format "date-time"]
- `phoneVerifiedAt`?: string [format "date-time"]
- `deletionRequestedAt`?: string [format "date-time"]
- `createdAt`: string [format "date-time"]
- `updatedAt`: string [format "date-time"]

### DELETE `/api/v1/users/{id}`

**Delete a user immediately, skipping the grace period**

Auth: Bearer token
- `id` (path, required): string

Response 200 — User deleted successfully

### PATCH `/api/v1/users/{id}/email`

**Override user email. Clears verification and may disable 2FA**

Auth: Bearer token
- `id` (path, required): string

Request body (application/json, required): AdminChangeEmailDto
- `newEmail`: string — New email address

Response 200 — User email changed successfully: `data` is UserDto
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
- `status`: string (ACTIVE|SUSPENDED|PENDING_DELETION|DELETED)
- `isTwoFactorOn`: boolean
- `otpChannel`: string (EMAIL|WHATSAPP)
- `emailVerifiedAt`?: string [format "date-time"]
- `phoneVerifiedAt`?: string [format "date-time"]
- `deletionRequestedAt`?: string [format "date-time"]
- `createdAt`: string [format "date-time"]
- `updatedAt`: string [format "date-time"]

### PATCH `/api/v1/users/{id}/phone`

**Override user phone. Clears verification and may disable 2FA**

Auth: Bearer token
- `id` (path, required): string

Request body (application/json, required): AdminChangePhoneDto
- `newPhone`: string — New phone must be in E.164 format (e.g. "+201234567890")

Response 200 — User phone changed successfully: `data` is UserDto
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
- `status`: string (ACTIVE|SUSPENDED|PENDING_DELETION|DELETED)
- `isTwoFactorOn`: boolean
- `otpChannel`: string (EMAIL|WHATSAPP)
- `emailVerifiedAt`?: string [format "date-time"]
- `phoneVerifiedAt`?: string [format "date-time"]
- `deletionRequestedAt`?: string [format "date-time"]
- `createdAt`: string [format "date-time"]
- `updatedAt`: string [format "date-time"]

### POST `/api/v1/users/{id}/suspend`

**Suspend user and revoke all their sessions**

Auth: Bearer token
- `id` (path, required): string

Response 200 — User suspended successfully: `data` is UserDto
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
- `status`: string (ACTIVE|SUSPENDED|PENDING_DELETION|DELETED)
- `isTwoFactorOn`: boolean
- `otpChannel`: string (EMAIL|WHATSAPP)
- `emailVerifiedAt`?: string [format "date-time"]
- `phoneVerifiedAt`?: string [format "date-time"]
- `deletionRequestedAt`?: string [format "date-time"]
- `createdAt`: string [format "date-time"]
- `updatedAt`: string [format "date-time"]

### POST `/api/v1/users/{id}/unsuspend`

**Unsuspend user**

Auth: Bearer token
- `id` (path, required): string

Response 200 — User unsuspended successfully: `data` is UserDto
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
- `status`: string (ACTIVE|SUSPENDED|PENDING_DELETION|DELETED)
- `isTwoFactorOn`: boolean
- `otpChannel`: string (EMAIL|WHATSAPP)
- `emailVerifiedAt`?: string [format "date-time"]
- `phoneVerifiedAt`?: string [format "date-time"]
- `deletionRequestedAt`?: string [format "date-time"]
- `createdAt`: string [format "date-time"]
- `updatedAt`: string [format "date-time"]

### POST `/api/v1/users/{id}/force-logout`

**Force logout user from all devices**

Auth: Bearer token
- `id` (path, required): string

Response 200 — User logged out successfully

## Me

### GET `/api/v1/me`

**Get my profile**

Auth: Bearer token

Response 200 — Profile retrieved successfully: `data` is ProfileDto
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
- `status`: string (ACTIVE|SUSPENDED|PENDING_DELETION|DELETED)
- `isTwoFactorOn`: boolean
- `otpChannel`: string (EMAIL|WHATSAPP)
- `emailVerifiedAt`?: string [format "date-time"]
- `phoneVerifiedAt`?: string [format "date-time"]
- `createdAt`: string [format "date-time"]
- `updatedAt`: string [format "date-time"]
- `roles`: string[]
- `permissions`: string[]

### PATCH `/api/v1/me`

**Update my profile**

Auth: Bearer token

Request body (application/json, required): UpdateProfileDto
- `displayName`?: string [maxLength 50] — Display name / nickname
- `firstName`?: string [maxLength 50] — First name
- `lastName`?: string [maxLength 50] — Last name
- `avatar`?: string — Avatar upload key
- `language`?: string (en) — Preferred language
- `isNewsletterSubscribed`?: boolean — Whether the user is subscribed to the newsletter

Response 200 — Profile updated successfully: `data` is ProfileDto
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
- `status`: string (ACTIVE|SUSPENDED|PENDING_DELETION|DELETED)
- `isTwoFactorOn`: boolean
- `otpChannel`: string (EMAIL|WHATSAPP)
- `emailVerifiedAt`?: string [format "date-time"]
- `phoneVerifiedAt`?: string [format "date-time"]
- `createdAt`: string [format "date-time"]
- `updatedAt`: string [format "date-time"]
- `roles`: string[]
- `permissions`: string[]

### DELETE `/api/v1/me`

**Request account deletion, with a configurable grace period before permanent deletion**

Auth: Bearer token

Response 200 — Account deletion requested successfully: `data` is DeletionRequestedDto
- `scheduledAt`: string [format "date-time"] — When the account will be permanently deleted

### POST `/api/v1/me/change-password`

**Change my password**

Auth: Bearer token

Request body (application/json, required): ChangePasswordDto
- `currentPassword`: string — Current password
- `newPassword`: string — New password

Response 200 — Password changed successfully

### POST `/api/v1/me/email/change`

**Request email change (requires re-auth)**

Auth: Bearer token

Request body (application/json, required): ChangeEmailDto
- `newEmail`: string — New email address

Response 200 — Verification code sent to the new email: `data` is OtpSentDto
- `target`: string — Masked target (e.g. "em***@example.com")
- `channel`: string (EMAIL|WHATSAPP)
- `expiresIn`: number — Seconds until expiry (e.g. 300)

### POST `/api/v1/me/email/change/confirm`

**Verify email change with OTP**

Auth: Bearer token

Request body (application/json, required): VerifyCodeDto
- `code`: string — 6-digit verification code (e.g. "123456")

Response 200 — Email changed successfully

### POST `/api/v1/me/phone/change`

**Request phone change (requires re-auth)**

Auth: Bearer token

Request body (application/json, required): ChangePhoneDto
- `newPhone`: string — New phone must be in E.164 format (e.g. "+201234567890")

Response 200 — Verification code sent to the new phone: `data` is OtpSentDto
- `target`: string — Masked target (e.g. "em***@example.com")
- `channel`: string (EMAIL|WHATSAPP)
- `expiresIn`: number — Seconds until expiry (e.g. 300)

### POST `/api/v1/me/phone/change/confirm`

**Verify phone change with OTP**

Auth: Bearer token

Request body (application/json, required): VerifyCodeDto
- `code`: string — 6-digit verification code (e.g. "123456")

Response 200 — Phone changed successfully

### POST `/api/v1/me/email/verify`

**Send OTP to verify current email**

Auth: Bearer token

Response 200 — Verification code sent to the current email: `data` is OtpSentDto
- `target`: string — Masked target (e.g. "em***@example.com")
- `channel`: string (EMAIL|WHATSAPP)
- `expiresIn`: number — Seconds until expiry (e.g. 300)

### POST `/api/v1/me/email/verify/confirm`

**Confirm email verification with OTP**

Auth: Bearer token

Request body (application/json, required): VerifyCodeDto
- `code`: string — 6-digit verification code (e.g. "123456")

Response 200 — Email verified successfully

### POST `/api/v1/me/phone/verify`

**Send OTP to verify current phone**

Auth: Bearer token

Response 200 — Verification code sent to the current phone: `data` is OtpSentDto
- `target`: string — Masked target (e.g. "em***@example.com")
- `channel`: string (EMAIL|WHATSAPP)
- `expiresIn`: number — Seconds until expiry (e.g. 300)

### POST `/api/v1/me/phone/verify/confirm`

**Confirm phone verification with OTP**

Auth: Bearer token

Request body (application/json, required): VerifyCodeDto
- `code`: string — 6-digit verification code (e.g. "123456")

Response 200 — Phone verified successfully

## Permissions

### GET `/api/v1/permissions`

**List all permissions**

Auth: Bearer token

Response 200 — Permissions retrieved successfully: `data` is PermissionDto[]
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
- `page` (query): number [minimum 1, default 1] — Page number
- `limit` (query): number [minimum 1, maximum 500, default 100] — Items per page
- `sortBy` (query): string — Field to sort by
- `sortOrder` (query): string (asc|desc) [default "asc"] — Sort order
- `include` (query): string — Comma separated list of relations to include
- `search` (query): string — Search by name or description
- `isSystem` (query): boolean — Filter by system roles

Response 200 — Roles retrieved successfully: `data` is RoleListDto[]
- `id`: string
- `name`: string (e.g. "User Manager")
- `description`?: string (e.g. "Manage all user operations")
- `isSystem`: boolean [default false]
- `createdAt`: string [format "date-time"]
- `updatedAt`: string [format "date-time"]
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

Request body (application/json, required): CreateRoleDto
- `name`: string — Unique name for the role (e.g. "User Manager")
- `description`?: string — Summary of what this role can do (e.g. "Manages user operations")
- `permissionKeys`?: string[] (e.g. ["user:read","user:update"])

Response 201 — Role created successfully: `data` is RoleDto
- `id`: string
- `name`: string (e.g. "User Manager")
- `description`?: string (e.g. "Manage all user operations")
- `isSystem`: boolean [default false]
- `createdAt`: string [format "date-time"]
- `updatedAt`: string [format "date-time"]

### GET `/api/v1/roles/{id}`

**Get role details**

Auth: Bearer token
- `id` (path, required): string

Response 200 — Role retrieved successfully: `data` is RoleDetailDto
- `id`: string
- `name`: string (e.g. "User Manager")
- `description`?: string (e.g. "Manage all user operations")
- `isSystem`: boolean [default false]
- `createdAt`: string [format "date-time"]
- `updatedAt`: string [format "date-time"]
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
- `id` (path, required): string

Request body (application/json, required): UpdateRoleDto
- `name`?: string — Role visible name (e.g. "User Manager")
- `description`?: string — Summary of what this role can do (e.g. "Manage all user operations")

Response 200 — Role updated successfully: `data` is RoleDto
- `id`: string
- `name`: string (e.g. "User Manager")
- `description`?: string (e.g. "Manage all user operations")
- `isSystem`: boolean [default false]
- `createdAt`: string [format "date-time"]
- `updatedAt`: string [format "date-time"]

### DELETE `/api/v1/roles/{id}`

**Delete a role**

Auth: Bearer token
- `id` (path, required): string

Response 200 — Role deleted successfully

## Role Permissions

### GET `/api/v1/roles/{roleId}/permissions`

**List role's permissions**

Auth: Bearer token
- `roleId` (path, required): string

Response 200 — Role permissions retrieved successfully: `data` is PermissionDto[]
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
- `roleId` (path, required): string

Request body (application/json, required): SetPermissionDto
- `permissionKeys`: string[] — Array of permission keys to assign to the role (e.g. ["user:read","user:create"])

Response 200 — Permissions added successfully: `data` is PermissionDto[]
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
- `roleId` (path, required): string

Request body (application/json, required): SetPermissionDto
- `permissionKeys`: string[] — Array of permission keys to assign to the role (e.g. ["user:read","user:create"])

Response 200 — Role permissions updated successfully: `data` is PermissionDto[]
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
- `roleId` (path, required): string
- `permissionKey` (path, required): string

Response 200 — Permission removed successfully

## User Roles

### GET `/api/v1/users/{userId}/roles`

**List user's roles**

Auth: Bearer token
- `userId` (path, required): string

Response 200 — User roles retrieved successfully: `data` is RoleDto[]
- `id`: string
- `name`: string (e.g. "User Manager")
- `description`?: string (e.g. "Manage all user operations")
- `isSystem`: boolean [default false]
- `createdAt`: string [format "date-time"]
- `updatedAt`: string [format "date-time"]

### POST `/api/v1/users/{userId}/roles`

**Add roles to user**

Auth: Bearer token
- `userId` (path, required): string

Request body (application/json, required): AssignRoleDto
- `roleIds`: string[] — Role IDs to assign (e.g. ["uuid-1","uuid-2"])

Response 200 — Roles added successfully: `data` is RoleDto[]
- `id`: string
- `name`: string (e.g. "User Manager")
- `description`?: string (e.g. "Manage all user operations")
- `isSystem`: boolean [default false]
- `createdAt`: string [format "date-time"]
- `updatedAt`: string [format "date-time"]

### PUT `/api/v1/users/{userId}/roles`

**Replace all user roles**

Auth: Bearer token
- `userId` (path, required): string

Request body (application/json, required): AssignRoleDto
- `roleIds`: string[] — Role IDs to assign (e.g. ["uuid-1","uuid-2"])

Response 200 — User roles updated successfully: `data` is RoleDto[]
- `id`: string
- `name`: string (e.g. "User Manager")
- `description`?: string (e.g. "Manage all user operations")
- `isSystem`: boolean [default false]
- `createdAt`: string [format "date-time"]
- `updatedAt`: string [format "date-time"]

### DELETE `/api/v1/users/{userId}/roles/{roleId}`

**Remove a role from user**

Auth: Bearer token
- `userId` (path, required): string
- `roleId` (path, required): string

Response 200 — Role removed successfully

## Authentication

### POST `/api/v1/auth/register/validate`

**Validate signup data for uniqueness**

Auth: none

Request body (application/json, required): RegisterValidateDto
- `username`: string — Must start with a letter, between 4-20 characters (e.g. "jsmith")
- `email`: string (e.g. "email@example.com")
- `phone`: string — Phone must be in E.164 format (e.g. "+201234567890")

Response 200 — Validation successful

### POST `/api/v1/auth/register/send-otp`

**Send registration verification OTP**

Auth: none

Request body (application/json, required): RegisterSendOtpDto
- `identifier`: string — Email address or phone number
- `channel`: string (EMAIL|WHATSAPP) (e.g. "EMAIL")

Response 200 — Verification code sent: `data` is RegisterOtpSentDto
- `target`: string — Masked target (e.g. "em***@example.com")
- `channel`: string (EMAIL|WHATSAPP)
- `expiresIn`: number — Seconds until expiry (e.g. 300)
- `transactionalToken`: string — Token to use in the register flow's next steps

### POST `/api/v1/auth/register/verify`

**Verify registration OTP**

Auth: none

Request body (application/json, required): RegisterVerifyDto
- `transactionalToken`: string — Token received from the OTP request step
- `code`: string — 6-digit verification code (e.g. "123456")

Response 200 — Verification completed: `data` is TransactionalTokenDto
- `transactionalToken`: string

### POST `/api/v1/auth/register/complete`

**Complete registration and create the new account**

Auth: none

Request body (application/json, required): RegisterCompleteDto
- `transactionalToken`: string — Token received from register verification
- `password`: string (e.g. "MyP@ssword123")
- `deviceType`?: string — Device type (mobile, desktop, tablet, etc) (e.g. "mobile")
- `deviceName`?: string — Device name (iPhone 15, Samsung S24, Windows 10, etc) (e.g. "iPhone 15")

Response 201 — Account created successfully: `data` is AuthTokensDto
- `user`: AuthUserDto
  - `id`: string
  - `username`: string
  - `email`: string
  - `phone`: string
  - `displayName`: string
  - `avatar`?: string
  - `qrCode`: string
  - `isTwoFactorOn`: boolean
  - `otpChannel`: string (EMAIL|WHATSAPP)
  - `status`: string (ACTIVE|SUSPENDED|PENDING_DELETION|DELETED)
  - `language`: string
  - `emailVerifiedAt`?: string [format "date-time"]
  - `phoneVerifiedAt`?: string [format "date-time"]
- `accessToken`: string
- `refreshToken`: string

### POST `/api/v1/auth/login`

**Login with credentials**

Auth: none

Request body (application/json, required): LoginDto
- `identifier`: string — Username or email address
- `password`: string (e.g. "MyP@ssword123")
- `deviceType`?: string — Device type (mobile, desktop, tablet, etc) (e.g. "mobile")
- `deviceName`?: string — Device name (iPhone 15, Samsung S24, Windows 10, etc) (e.g. "iPhone 15")

Response 200 — Login successful: `data` is LoginResponseDto
- `twoFactorRequired`: boolean [default false] — True if 2FA is required for the login process
- `accountRestored`: boolean [default false] — True if the account was restored from pending deletion during this login
- `user`?: AuthUserDto
  - `id`: string
  - `username`: string
  - `email`: string
  - `phone`: string
  - `displayName`: string
  - `avatar`?: string
  - `qrCode`: string
  - `isTwoFactorOn`: boolean
  - `otpChannel`: string (EMAIL|WHATSAPP)
  - `status`: string (ACTIVE|SUSPENDED|PENDING_DELETION|DELETED)
  - `language`: string
  - `emailVerifiedAt`?: string [format "date-time"]
  - `phoneVerifiedAt`?: string [format "date-time"]
- `accessToken`?: string
- `refreshToken`?: string
- `transactionalToken`?: string
- `channel`?: string (EMAIL|WHATSAPP)

### POST `/api/v1/auth/login/two-factor`

**Complete 2FA during login**

Auth: none

Request body (application/json, required): LoginTwoFactorDto
- `transactionalToken`: string — Token received from login response
- `code`: string — 6-digit verification code (e.g. "123456")
- `deviceType`?: string — Device type (mobile, web, tablet, etc) (e.g. "mobile")
- `deviceName`?: string — Device name (e.g. "iPhone 15")

Response 200 — Two factor challenge completed: `data` is LoginResponseDto
- `twoFactorRequired`: boolean [default false] — True if 2FA is required for the login process
- `accountRestored`: boolean [default false] — True if the account was restored from pending deletion during this login
- `user`?: AuthUserDto
  - `id`: string
  - `username`: string
  - `email`: string
  - `phone`: string
  - `displayName`: string
  - `avatar`?: string
  - `qrCode`: string
  - `isTwoFactorOn`: boolean
  - `otpChannel`: string (EMAIL|WHATSAPP)
  - `status`: string (ACTIVE|SUSPENDED|PENDING_DELETION|DELETED)
  - `language`: string
  - `emailVerifiedAt`?: string [format "date-time"]
  - `phoneVerifiedAt`?: string [format "date-time"]
- `accessToken`?: string
- `refreshToken`?: string
- `transactionalToken`?: string
- `channel`?: string (EMAIL|WHATSAPP)

### POST `/api/v1/auth/refresh`

**Refresh access token**

Auth: none

Request body (application/json, required): RefreshTokenDto
- `refreshToken`: string — Refresh token from login response

Response 200 — Token refreshed successfully: `data` is TokensDto
- `accessToken`: string
- `refreshToken`: string

### POST `/api/v1/auth/logout`

**Logout of current session**

Auth: Bearer token

Request body (application/json, required): LogoutDto
- `refreshToken`: string — Refresh token to revoke

Response 200 — Logged out successfully

### POST `/api/v1/auth/logout/all`

**Logout from all devices**

Auth: Bearer token

Response 200 — Logged out from all devices

### GET `/api/v1/auth/sessions`

**List active sessions for the user**

Auth: Bearer token

Response 200 — Sessions retrieved successfully: `data` is SessionDto[]
- `id`: string
- `deviceType`?: string
- `deviceName`?: string
- `ipAddress`?: string
- `lastActiveAt`: string [format "date-time"]
- `createdAt`: string [format "date-time"]
- `isCurrent`: boolean — True if this is the current session the user is using

### DELETE `/api/v1/auth/sessions/{id}`

**Revoke a specific session**

Auth: Bearer token
- `id` (path, required): string

Response 200 — Session revoked successfully

### POST `/api/v1/auth/forgot-password/request`

**Request a password reset OTP**

Auth: none

Request body (application/json, required): ForgotPasswordRequestDto
- `identifier`: string — Email address or phone number
- `channel`: string (EMAIL|WHATSAPP) (e.g. "EMAIL")

Response 200 — Password reset code sent: `data` is ForgotPasswordOtpSentDto
- `target`: string — Masked target (e.g. "em***@example.com")
- `channel`: string (EMAIL|WHATSAPP)
- `expiresIn`: number — Seconds until expiry (e.g. 300)
- `transactionalToken`: string — Token to use in the forgot password flow's next steps

### POST `/api/v1/auth/forgot-password/verify`

**Verify password reset OTP**

Auth: none

Request body (application/json, required): ForgotPasswordVerifyDto
- `transactionalToken`: string — Token received from forgot password request step
- `code`: string — 6-digit verification code (e.g. "123456")

Response 200 — Verification completed: `data` is TransactionalTokenDto
- `transactionalToken`: string

### POST `/api/v1/auth/forgot-password/reset`

**Reset password with new password**

Auth: none

Request body (application/json, required): ForgotPasswordResetDto
- `transactionalToken`: string — Token received from forgot password verification step
- `newPassword`: string (e.g. "NewP@ssword123")

Response 200 — Password reset successfully

### POST `/api/v1/auth/two-factor/enable`

**Start 2FA process and send verification OTP**

Auth: Bearer token

Request body (application/json, required): TwoFactorEnableDto
- `channel`: string (EMAIL|WHATSAPP) (e.g. "EMAIL")

Response 200 — Verification code sent: `data` is OtpSentDto
- `target`: string — Masked target (e.g. "em***@example.com")
- `channel`: string (EMAIL|WHATSAPP)
- `expiresIn`: number — Seconds until expiry (e.g. 300)

### POST `/api/v1/auth/two-factor/enable/verify`

**Confirm two-factor authentication enabling**

Auth: Bearer token

Request body (application/json, required): TwoFactorEnableVerifyDto
- `code`: string — 6-digit verification code (e.g. "123456")
- `channel`: string (EMAIL|WHATSAPP) (e.g. "EMAIL")

Response 200 — Two-factor authentication enabled

### POST `/api/v1/auth/two-factor/disable`

**Disable two-factor authentication**

Auth: Bearer token

Response 200 — Two-factor authentication disabled

### POST `/api/v1/auth/reauth/request-otp`

**Request OTP for re-authentication**

Auth: Bearer token

Response 200 — Re-authentication OTP sent successfully: `data` is OtpSentDto
- `target`: string — Masked target (e.g. "em***@example.com")
- `channel`: string (EMAIL|WHATSAPP)
- `expiresIn`: number — Seconds until expiry (e.g. 300)

### POST `/api/v1/auth/reauth/verify/password`

**Verify re-authentication with password**

Auth: Bearer token

Request body (application/json, required): ReAuthPasswordDto
- `password`: string — Current password

Response 200 — Re-authentication successful

### POST `/api/v1/auth/reauth/verify/otp`

**Verify re-authentication with OTP**

Auth: Bearer token

Request body (application/json, required): ReAuthOtpDto
- `code`: string — 6-digit verification code (e.g. "123456")

Response 200 — Re-authentication successful

## User Sessions

### GET `/api/v1/users/{userId}/sessions`

**List user's active sessions**

Auth: Bearer token
- `userId` (path, required): string

Response 200 — Sessions retrieved successfully: `data` is SessionDto[]
- `id`: string
- `deviceType`?: string
- `deviceName`?: string
- `ipAddress`?: string
- `lastActiveAt`: string [format "date-time"]
- `createdAt`: string [format "date-time"]
- `isCurrent`: boolean — True if this is the current session the user is using

## Audit Logs

### GET `/api/v1/audit-logs/filters`

**Get available filter options for audit logs**

Auth: Bearer token

Response 200 — Audit filter options retrieved successfully: `data` is AuditFiltersDto
- `resources`: string[] (e.g. ["role","user","broadcast"])
- `actions`: string[] (e.g. ["created","updated","deleted"])
- `resourceActions`: object — Actions available for every resource (e.g. {"role":["created","updated","deleted","permissions_changed"]})

### GET `/api/v1/audit-logs`

**List audit logs**

Auth: Bearer token
- `page` (query): number [minimum 1, default 1] — Page number
- `limit` (query): number [minimum 1, maximum 500, default 100] — Items per page
- `sortBy` (query): string — Field to sort by
- `sortOrder` (query): string (asc|desc) [default "asc"] — Sort order
- `include` (query): string — Comma separated list of relations to include
- `search` (query): string — Search by resource ID, request ID, or IP address
- `resource` (query): string — Filter by resource type
- `action` (query): string — Filter by action
- `actorId` (query): string — Filter by actor using user ID
- `resourceId` (query): string — Filter by target resource ID
- `from` (query): string — Filter from date
- `to` (query): string — Filter to date

Response 200 — Audit logs retrieved successfully: `data` is AuditLogListDto[]
- `id`: string
- `actorId`?: string
- `resource`: string
- `action`: string
- `resourceId`?: string
- `ipAddress`?: string
- `createdAt`: string [format "date-time"]
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
- `id` (path, required): string

Response 200 — Audit log retrieved successfully: `data` is AuditLogDetailDto
- `id`: string
- `actorId`?: string
- `resource`: string
- `action`: string
- `resourceId`?: string
- `ipAddress`?: string
- `createdAt`: string [format "date-time"]
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

## Categories

### GET `/api/v1/categories`

**List categories in store order**

**Audience:** holders of `category:read` get the admin view. Everyone else, with or without a token, gets the store view.

Store view: active categories only. Admin view: every category.

Auth: Bearer token

Response 200 — Categories retrieved successfully: `data` is CategoryDto[]
- `id`: string
- `slug`: string (e.g. "oriental-sweets")
- `name`: LocalizedTextDto
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `imageUrl`: string [nullable true]
- `itemCount`: number — Store view: available items. Admin view: every live item (e.g. 6)
- `isActive`?: boolean — Admin view only
- `sortOrder`?: number — Admin view only
- `createdAt`?: string [format "date-time"] — Admin view only
- `updatedAt`?: string [format "date-time"] — Admin view only

### POST `/api/v1/categories`

**Create a category**

**Required permission:** `category:create`

Auth: Bearer token

Request body (application/json, required): CreateCategoryDto
- `name`: LocalizedTextDto — Both languages are required. The English name builds the category's slug (e.g. {"ar":"حلويات شرقي","en":"Oriental sweets"})
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `imageKey`?: string — Key from POST /uploads with purpose CATEGORY_IMAGE

Response 201 — Category created successfully: `data` is CategoryDto
- `id`: string
- `slug`: string (e.g. "oriental-sweets")
- `name`: LocalizedTextDto
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `imageUrl`: string [nullable true]
- `itemCount`: number — Store view: available items. Admin view: every live item (e.g. 6)
- `isActive`?: boolean — Admin view only
- `sortOrder`?: number — Admin view only
- `createdAt`?: string [format "date-time"] — Admin view only
- `updatedAt`?: string [format "date-time"] — Admin view only

### PUT `/api/v1/categories/order`

**Reorder categories**

**Required permission:** `category:update`

Send every category id once, in the new order.

Auth: Bearer token

Request body (application/json, required): ReorderDto
- `ids`: string[] — Every id of the resource, each once, in the new order (e.g. ["019a0c5e-8f1a-7b2c-9d3e-4f5a6b7c8d9e","019a0c5e-9a2b-7c3d-8e4f-5a6b7c8d9e0f"])

Response 200 — Categories reordered successfully: `data` is CategoryDto[]
- `id`: string
- `slug`: string (e.g. "oriental-sweets")
- `name`: LocalizedTextDto
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `imageUrl`: string [nullable true]
- `itemCount`: number — Store view: available items. Admin view: every live item (e.g. 6)
- `isActive`?: boolean — Admin view only
- `sortOrder`?: number — Admin view only
- `createdAt`?: string [format "date-time"] — Admin view only
- `updatedAt`?: string [format "date-time"] — Admin view only

### PATCH `/api/v1/categories/{id}`

**Update a category**

**Required permission:** `category:update`

Auth: Bearer token
- `id` (path, required): string

Request body (application/json, required): UpdateCategoryDto
- `name`?: LocalizedTextDto — Both languages. Changing the English name changes the slug (e.g. {"ar":"حلويات شرقي","en":"Oriental sweets"})
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `imageKey`?: string [nullable true] — Key from POST /uploads with purpose CATEGORY_IMAGE. Null removes the image
- `isActive`?: boolean — Show or hide the category in the store (e.g. true)

Response 200 — Category updated successfully: `data` is CategoryDto
- `id`: string
- `slug`: string (e.g. "oriental-sweets")
- `name`: LocalizedTextDto
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `imageUrl`: string [nullable true]
- `itemCount`: number — Store view: available items. Admin view: every live item (e.g. 6)
- `isActive`?: boolean — Admin view only
- `sortOrder`?: number — Admin view only
- `createdAt`?: string [format "date-time"] — Admin view only
- `updatedAt`?: string [format "date-time"] — Admin view only

### DELETE `/api/v1/categories/{id}`

**Delete a category**

**Required permission:** `category:delete`

Auth: Bearer token
- `id` (path, required): string

Response 200 — Category deleted successfully

## Items

### GET `/api/v1/items`

**List items**

**Audience:** holders of `item:read` get the admin view. Everyone else, with or without a token, gets the store view.

Store view: available items as cards, filtered by `category`. Admin view: every live item with its variants, also filtered by `isAvailable`.

Auth: Bearer token
- `page` (query): number [minimum 1, default 1] — Page number
- `limit` (query): number [minimum 1, maximum 500, default 100] — Items per page
- `category` (query): string — Category id or slug
- `search` (query): string — Search the Arabic and English names
- `sort` (query): string (featured|price_asc|price_desc|newest) [default "featured"]
- `isAvailable` (query): boolean — Admin view only: filter by the item's own on/off switch

Response 200 — Items retrieved successfully: `data` is ItemDto[]
- `id`: string
- `slug`: string (e.g. "arabic-kunafa")
- `name`: LocalizedTextDto
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `badge`: LocalizedOptionalTextDto (nullable) — The badge on the image
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `imageUrl`: string
- `category`: ItemCategoryDto
  - `id`: string
  - `slug`: string (e.g. "oriental-sweets")
  - `name`: LocalizedTextDto
    - `ar`: string — Arabic text (e.g. "كنافة عربي")
    - `en`: string — English text (e.g. "Arabic kunafa")
- `startingPrice`?: number — Store view only. The cheapest variant's price, in piasters (e.g. 48000)
- `startingVariantName`?: LocalizedTextDto — Store view only. The cheapest variant's name
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `createdAt`?: string [format "date-time"] — Admin view only
- `updatedAt`?: string [format "date-time"] — Admin view only
- `isAvailable`?: boolean — Admin view only. The item's own on/off switch (متاح)
- `variants`?: ItemVariantDto[] — Admin view only, for the inline price edit
  - `id`: string
  - `name`: LocalizedTextDto (e.g. {"ar":"نصف كيلو","en":"Half kilo"})
    - `ar`: string — Arabic text (e.g. "كنافة عربي")
    - `en`: string — English text (e.g. "Arabic kunafa")
  - `price`: number — Piasters (e.g. 48000)
  - `isAvailable`?: boolean — Store view only: whether this variant can be ordered now
  - `sortOrder`?: number — Admin view only

### POST `/api/v1/items`

**Create an item**

**Required permission:** `item:create`

Auth: Bearer token

Request body (application/json, required): ItemFormDto
- `categoryId`: string — The item's category
- `name`: LocalizedTextDto — Both languages are required. The English name builds the item's slug (e.g. {"ar":"كنافة عربي","en":"Arabic kunafa"})
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `badge`?: LocalizedOptionalTextDto (nullable) — The badge on the image (شارة على الصورة) (e.g. {"ar":"الأكثر طلبًا","en":"Best seller"})
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `description`?: LocalizedLongTextDto (nullable)
  - `ar`?: string [nullable true] — Arabic text
  - `en`?: string [nullable true] — English text
- `ingredients`?: LocalizedLongTextDto (nullable) — المكونات
  - `ar`?: string [nullable true] — Arabic text
  - `en`?: string [nullable true] — English text
- `storage`?: LocalizedLongTextDto (nullable) — طريقة الحفظ
  - `ar`?: string [nullable true] — Arabic text
  - `en`?: string [nullable true] — English text
- `imageKey`: string — Key from POST /uploads with purpose ITEM_IMAGE
- `optionType`: string (WEIGHT|SIZE|FLAVOR|PIECES) — What the variants differ by (الاختيار حسب)
- `allowsCustomMessage`?: boolean [default false] — Customers may write a message on the cake
- `variants`: ItemVariantInputDto[] — The whole variant list in display order, 1 to 20. Existing variants keep their id
  - `id`?: string — The variant's id when it already exists. Leave out for a new variant
  - `name`: LocalizedTextDto (e.g. {"ar":"نصف كيلو","en":"Half kilo"})
    - `ar`: string — Arabic text (e.g. "كنافة عربي")
    - `en`: string — English text (e.g. "Arabic kunafa")
  - `price`: number — Piasters: 48000 is 480 EGP (e.g. 48000)

Response 201 — Item created successfully: `data` is ItemDetailDto
- `id`: string
- `slug`: string (e.g. "arabic-kunafa")
- `name`: LocalizedTextDto
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `badge`: LocalizedOptionalTextDto (nullable) — The badge on the image
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `imageUrl`: string
- `category`: ItemCategoryDto
  - `id`: string
  - `slug`: string (e.g. "oriental-sweets")
  - `name`: LocalizedTextDto
    - `ar`: string — Arabic text (e.g. "كنافة عربي")
    - `en`: string — English text (e.g. "Arabic kunafa")
- `startingPrice`?: number — Store view only. The cheapest variant's price, in piasters (e.g. 48000)
- `startingVariantName`?: LocalizedTextDto — Store view only. The cheapest variant's name
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `createdAt`?: string [format "date-time"] — Admin view only
- `updatedAt`?: string [format "date-time"] — Admin view only
- `description`: LocalizedOptionalTextDto (nullable)
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `ingredients`: LocalizedOptionalTextDto (nullable) — المكونات
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `storage`: LocalizedOptionalTextDto (nullable) — طريقة الحفظ
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `optionType`: string (WEIGHT|SIZE|FLAVOR|PIECES)
- `optionTypeLabel`: LocalizedTextDto (e.g. {"ar":"الوزن","en":"Weight"})
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `allowsCustomMessage`: boolean
- `isAvailable`: boolean — Store view: whether the item can be ordered now. Admin view: the item's own on/off switch
- `variants`: ItemVariantDto[]
  - `id`: string
  - `name`: LocalizedTextDto (e.g. {"ar":"نصف كيلو","en":"Half kilo"})
    - `ar`: string — Arabic text (e.g. "كنافة عربي")
    - `en`: string — English text (e.g. "Arabic kunafa")
  - `price`: number — Piasters (e.g. 48000)
  - `isAvailable`?: boolean — Store view only: whether this variant can be ordered now
  - `sortOrder`?: number — Admin view only

### GET `/api/v1/items/{id}/related`

**List related items**

Up to four other available items from the same category, as store cards.

Auth: Bearer token
- `id` (path, required): string

Response 200 — Related items retrieved successfully: `data` is ItemDto[]
- `id`: string
- `slug`: string (e.g. "arabic-kunafa")
- `name`: LocalizedTextDto
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `badge`: LocalizedOptionalTextDto (nullable) — The badge on the image
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `imageUrl`: string
- `category`: ItemCategoryDto
  - `id`: string
  - `slug`: string (e.g. "oriental-sweets")
  - `name`: LocalizedTextDto
    - `ar`: string — Arabic text (e.g. "كنافة عربي")
    - `en`: string — English text (e.g. "Arabic kunafa")
- `startingPrice`?: number — Store view only. The cheapest variant's price, in piasters (e.g. 48000)
- `startingVariantName`?: LocalizedTextDto — Store view only. The cheapest variant's name
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `createdAt`?: string [format "date-time"] — Admin view only
- `updatedAt`?: string [format "date-time"] — Admin view only
- `isAvailable`?: boolean — Admin view only. The item's own on/off switch (متاح)
- `variants`?: ItemVariantDto[] — Admin view only, for the inline price edit
  - `id`: string
  - `name`: LocalizedTextDto (e.g. {"ar":"نصف كيلو","en":"Half kilo"})
    - `ar`: string — Arabic text (e.g. "كنافة عربي")
    - `en`: string — English text (e.g. "Arabic kunafa")
  - `price`: number — Piasters (e.g. 48000)
  - `isAvailable`?: boolean — Store view only: whether this variant can be ordered now
  - `sortOrder`?: number — Admin view only

### GET `/api/v1/items/{id}`

**Get an item**

**Audience:** holders of `item:read` get the admin view. Everyone else, with or without a token, gets the store view.

Store view: the item page; an unavailable item still loads with `isAvailable: false`. Admin view: the item form.

Auth: Bearer token
- `id` (path, required): string

Response 200 — Item retrieved successfully: `data` is ItemDetailDto
- `id`: string
- `slug`: string (e.g. "arabic-kunafa")
- `name`: LocalizedTextDto
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `badge`: LocalizedOptionalTextDto (nullable) — The badge on the image
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `imageUrl`: string
- `category`: ItemCategoryDto
  - `id`: string
  - `slug`: string (e.g. "oriental-sweets")
  - `name`: LocalizedTextDto
    - `ar`: string — Arabic text (e.g. "كنافة عربي")
    - `en`: string — English text (e.g. "Arabic kunafa")
- `startingPrice`?: number — Store view only. The cheapest variant's price, in piasters (e.g. 48000)
- `startingVariantName`?: LocalizedTextDto — Store view only. The cheapest variant's name
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `createdAt`?: string [format "date-time"] — Admin view only
- `updatedAt`?: string [format "date-time"] — Admin view only
- `description`: LocalizedOptionalTextDto (nullable)
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `ingredients`: LocalizedOptionalTextDto (nullable) — المكونات
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `storage`: LocalizedOptionalTextDto (nullable) — طريقة الحفظ
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `optionType`: string (WEIGHT|SIZE|FLAVOR|PIECES)
- `optionTypeLabel`: LocalizedTextDto (e.g. {"ar":"الوزن","en":"Weight"})
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `allowsCustomMessage`: boolean
- `isAvailable`: boolean — Store view: whether the item can be ordered now. Admin view: the item's own on/off switch
- `variants`: ItemVariantDto[]
  - `id`: string
  - `name`: LocalizedTextDto (e.g. {"ar":"نصف كيلو","en":"Half kilo"})
    - `ar`: string — Arabic text (e.g. "كنافة عربي")
    - `en`: string — English text (e.g. "Arabic kunafa")
  - `price`: number — Piasters (e.g. 48000)
  - `isAvailable`?: boolean — Store view only: whether this variant can be ordered now
  - `sortOrder`?: number — Admin view only

### PUT `/api/v1/items/{id}`

**Save the item form**

**Required permission:** `item:update`

Send the whole form. Variants with an `id` are updated, new ones created, missing ones removed.

Auth: Bearer token
- `id` (path, required): string

Request body (application/json, required): ItemFormDto
- `categoryId`: string — The item's category
- `name`: LocalizedTextDto — Both languages are required. The English name builds the item's slug (e.g. {"ar":"كنافة عربي","en":"Arabic kunafa"})
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `badge`?: LocalizedOptionalTextDto (nullable) — The badge on the image (شارة على الصورة) (e.g. {"ar":"الأكثر طلبًا","en":"Best seller"})
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `description`?: LocalizedLongTextDto (nullable)
  - `ar`?: string [nullable true] — Arabic text
  - `en`?: string [nullable true] — English text
- `ingredients`?: LocalizedLongTextDto (nullable) — المكونات
  - `ar`?: string [nullable true] — Arabic text
  - `en`?: string [nullable true] — English text
- `storage`?: LocalizedLongTextDto (nullable) — طريقة الحفظ
  - `ar`?: string [nullable true] — Arabic text
  - `en`?: string [nullable true] — English text
- `imageKey`: string — Key from POST /uploads with purpose ITEM_IMAGE
- `optionType`: string (WEIGHT|SIZE|FLAVOR|PIECES) — What the variants differ by (الاختيار حسب)
- `allowsCustomMessage`?: boolean [default false] — Customers may write a message on the cake
- `variants`: ItemVariantInputDto[] — The whole variant list in display order, 1 to 20. Existing variants keep their id
  - `id`?: string — The variant's id when it already exists. Leave out for a new variant
  - `name`: LocalizedTextDto (e.g. {"ar":"نصف كيلو","en":"Half kilo"})
    - `ar`: string — Arabic text (e.g. "كنافة عربي")
    - `en`: string — English text (e.g. "Arabic kunafa")
  - `price`: number — Piasters: 48000 is 480 EGP (e.g. 48000)

Response 200 — Item updated successfully: `data` is ItemDetailDto
- `id`: string
- `slug`: string (e.g. "arabic-kunafa")
- `name`: LocalizedTextDto
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `badge`: LocalizedOptionalTextDto (nullable) — The badge on the image
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `imageUrl`: string
- `category`: ItemCategoryDto
  - `id`: string
  - `slug`: string (e.g. "oriental-sweets")
  - `name`: LocalizedTextDto
    - `ar`: string — Arabic text (e.g. "كنافة عربي")
    - `en`: string — English text (e.g. "Arabic kunafa")
- `startingPrice`?: number — Store view only. The cheapest variant's price, in piasters (e.g. 48000)
- `startingVariantName`?: LocalizedTextDto — Store view only. The cheapest variant's name
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `createdAt`?: string [format "date-time"] — Admin view only
- `updatedAt`?: string [format "date-time"] — Admin view only
- `description`: LocalizedOptionalTextDto (nullable)
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `ingredients`: LocalizedOptionalTextDto (nullable) — المكونات
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `storage`: LocalizedOptionalTextDto (nullable) — طريقة الحفظ
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `optionType`: string (WEIGHT|SIZE|FLAVOR|PIECES)
- `optionTypeLabel`: LocalizedTextDto (e.g. {"ar":"الوزن","en":"Weight"})
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `allowsCustomMessage`: boolean
- `isAvailable`: boolean — Store view: whether the item can be ordered now. Admin view: the item's own on/off switch
- `variants`: ItemVariantDto[]
  - `id`: string
  - `name`: LocalizedTextDto (e.g. {"ar":"نصف كيلو","en":"Half kilo"})
    - `ar`: string — Arabic text (e.g. "كنافة عربي")
    - `en`: string — English text (e.g. "Arabic kunafa")
  - `price`: number — Piasters (e.g. 48000)
  - `isAvailable`?: boolean — Store view only: whether this variant can be ordered now
  - `sortOrder`?: number — Admin view only

### PATCH `/api/v1/items/{id}`

**Switch an item on or off**

**Required permission:** `item:update`

The list toggle (متاح). Off hides the item from the whole store.

Auth: Bearer token
- `id` (path, required): string

Request body (application/json, required): SetItemAvailabilityDto
- `isAvailable`: boolean — The item's own on/off switch (متاح). Off hides it from the whole store

Response 200 — Item availability updated successfully: `data` is ItemDetailDto
- `id`: string
- `slug`: string (e.g. "arabic-kunafa")
- `name`: LocalizedTextDto
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `badge`: LocalizedOptionalTextDto (nullable) — The badge on the image
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `imageUrl`: string
- `category`: ItemCategoryDto
  - `id`: string
  - `slug`: string (e.g. "oriental-sweets")
  - `name`: LocalizedTextDto
    - `ar`: string — Arabic text (e.g. "كنافة عربي")
    - `en`: string — English text (e.g. "Arabic kunafa")
- `startingPrice`?: number — Store view only. The cheapest variant's price, in piasters (e.g. 48000)
- `startingVariantName`?: LocalizedTextDto — Store view only. The cheapest variant's name
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `createdAt`?: string [format "date-time"] — Admin view only
- `updatedAt`?: string [format "date-time"] — Admin view only
- `description`: LocalizedOptionalTextDto (nullable)
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `ingredients`: LocalizedOptionalTextDto (nullable) — المكونات
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `storage`: LocalizedOptionalTextDto (nullable) — طريقة الحفظ
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `optionType`: string (WEIGHT|SIZE|FLAVOR|PIECES)
- `optionTypeLabel`: LocalizedTextDto (e.g. {"ar":"الوزن","en":"Weight"})
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `allowsCustomMessage`: boolean
- `isAvailable`: boolean — Store view: whether the item can be ordered now. Admin view: the item's own on/off switch
- `variants`: ItemVariantDto[]
  - `id`: string
  - `name`: LocalizedTextDto (e.g. {"ar":"نصف كيلو","en":"Half kilo"})
    - `ar`: string — Arabic text (e.g. "كنافة عربي")
    - `en`: string — English text (e.g. "Arabic kunafa")
  - `price`: number — Piasters (e.g. 48000)
  - `isAvailable`?: boolean — Store view only: whether this variant can be ordered now
  - `sortOrder`?: number — Admin view only

### DELETE `/api/v1/items/{id}`

**Delete an item**

**Required permission:** `item:delete`

Auth: Bearer token
- `id` (path, required): string

Response 200 — Item deleted successfully

### PATCH `/api/v1/items/{id}/variants/{variantId}`

**Change a variant's price**

**Required permission:** `item:update`

The inline price edit in the items list.

Auth: Bearer token
- `id` (path, required): string
- `variantId` (path, required): string

Request body (application/json, required): UpdateVariantPriceDto
- `price`: number — Piasters: 48000 is 480 EGP (e.g. 48000)

Response 200 — Variant price updated successfully: `data` is ItemDetailDto
- `id`: string
- `slug`: string (e.g. "arabic-kunafa")
- `name`: LocalizedTextDto
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `badge`: LocalizedOptionalTextDto (nullable) — The badge on the image
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `imageUrl`: string
- `category`: ItemCategoryDto
  - `id`: string
  - `slug`: string (e.g. "oriental-sweets")
  - `name`: LocalizedTextDto
    - `ar`: string — Arabic text (e.g. "كنافة عربي")
    - `en`: string — English text (e.g. "Arabic kunafa")
- `startingPrice`?: number — Store view only. The cheapest variant's price, in piasters (e.g. 48000)
- `startingVariantName`?: LocalizedTextDto — Store view only. The cheapest variant's name
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `createdAt`?: string [format "date-time"] — Admin view only
- `updatedAt`?: string [format "date-time"] — Admin view only
- `description`: LocalizedOptionalTextDto (nullable)
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `ingredients`: LocalizedOptionalTextDto (nullable) — المكونات
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `storage`: LocalizedOptionalTextDto (nullable) — طريقة الحفظ
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `optionType`: string (WEIGHT|SIZE|FLAVOR|PIECES)
- `optionTypeLabel`: LocalizedTextDto (e.g. {"ar":"الوزن","en":"Weight"})
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `allowsCustomMessage`: boolean
- `isAvailable`: boolean — Store view: whether the item can be ordered now. Admin view: the item's own on/off switch
- `variants`: ItemVariantDto[]
  - `id`: string
  - `name`: LocalizedTextDto (e.g. {"ar":"نصف كيلو","en":"Half kilo"})
    - `ar`: string — Arabic text (e.g. "كنافة عربي")
    - `en`: string — English text (e.g. "Arabic kunafa")
  - `price`: number — Piasters (e.g. 48000)
  - `isAvailable`?: boolean — Store view only: whether this variant can be ordered now
  - `sortOrder`?: number — Admin view only

## Banners

### GET `/api/v1/banners`

**List home page banners in rotation order**

**Audience:** holders of `banner:read` get the admin view. Everyone else, with or without a token, gets the store view.

Store view: visible banners only; a button whose target can't be shown goes to all items, and such a card is left out. Admin view: every banner, with its link and card as stored.

Auth: Bearer token

Response 200 — Banners retrieved successfully: `data` is BannerDto[]
- `id`: string
- `imageUrl`: string — The large image
- `eyebrow`: LocalizedOptionalTextDto (nullable) — The small line above the title
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `title`: LocalizedTextDto — Multi-line, "\n" separated
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `body`: LocalizedOptionalTextDto (nullable)
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `buttonText`: LocalizedOptionalTextDto (nullable)
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `link`: BannerLinkDto
  - `type`: string (ALL_ITEMS|CATEGORY|ITEM) — Store view: ALL_ITEMS when the stored target is gone, hidden or unavailable
  - `category`: BannerTargetDto (nullable) — Set when type is CATEGORY
    - `id`: string
    - `slug`: string (e.g. "cakes")
    - `name`: LocalizedTextDto
      - `ar`: string — Arabic text (e.g. "كنافة عربي")
      - `en`: string — English text (e.g. "Arabic kunafa")
  - `item`: BannerTargetDto (nullable) — Set when type is ITEM
    - `id`: string
    - `slug`: string (e.g. "cakes")
    - `name`: LocalizedTextDto
      - `ar`: string — Arabic text (e.g. "كنافة عربي")
      - `en`: string — English text (e.g. "Arabic kunafa")
- `card`: BannerCardDto (nullable) — The small card. Store view: null when its item can't be shown
  - `item`: BannerTargetDto (nullable) — The item the card opens. Null only in the admin view, when that item was deleted
    - `id`: string
    - `slug`: string (e.g. "cakes")
    - `name`: LocalizedTextDto
      - `ar`: string — Arabic text (e.g. "كنافة عربي")
      - `en`: string — English text (e.g. "Arabic kunafa")
  - `imageUrl`: string [nullable true] — The card's own image, or else the item's
  - `isItemImage`?: boolean — Admin view only. True when the card shows the item's own image
  - `caption`: LocalizedOptionalTextDto (nullable)
    - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
    - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `isVisible`?: boolean — Admin view only
- `sortOrder`?: number — Admin view only
- `createdAt`?: string [format "date-time"] — Admin view only
- `updatedAt`?: string [format "date-time"] — Admin view only

### POST `/api/v1/banners`

**Create a banner**

**Required permission:** `banner:create`

Added at the end of the rotation.

Auth: Bearer token

Request body (application/json, required): BannerFormDto
- `imageKey`: string — The large image. Key from POST /uploads with purpose BANNER_IMAGE
- `eyebrow`?: LocalizedOptionalTextDto (nullable) — The small line above the title (سطر صغير فوق العنوان) (e.g. {"ar":"توقيع دهب","en":"Dahab signature"})
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `title`: LocalizedTextDto — Both languages are required. "\n" starts a new line (e.g. {"ar":"تورتة الفستق\nبكتابتك عليها","en":"Pistachio cake,\nwith your message on top"})
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `body`?: LocalizedLongTextDto (nullable) (e.g. {"ar":"اكتب رسالتك ونجهّزها لعيد الميلاد أو أي مناسبة.","en":"Add your message — ready for birthdays and every occasion."})
  - `ar`?: string [nullable true] — Arabic text
  - `en`?: string [nullable true] — English text
- `buttonText`?: LocalizedOptionalTextDto (nullable) — نص الزرار (e.g. {"ar":"اطلب التورتة","en":"Order the cake"})
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `linkType`: string (ALL_ITEMS|CATEGORY|ITEM) — Where the button goes (الزرار بيودّي على)
- `linkCategoryId`?: object [nullable true] — Required when linkType is CATEGORY, ignored otherwise
- `linkItemId`?: object [nullable true] — Required when linkType is ITEM, ignored otherwise
- `cardItemId`?: object [nullable true] — The item the small card opens. Null means no card
- `cardImageKey`?: string [nullable true] — Replaces the item's own image on the card. Key from POST /uploads with purpose BANNER_IMAGE. Ignored without a card
- `cardCaption`?: LocalizedOptionalTextDto (nullable) — The text under the small image (نص تحت الصورة الصغيرة). Ignored without a card
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `isVisible`: boolean — Shown in the store (البانر ظاهر في المتجر). Send false for a new, hidden banner

Response 201 — Banner created successfully: `data` is BannerDto
- `id`: string
- `imageUrl`: string — The large image
- `eyebrow`: LocalizedOptionalTextDto (nullable) — The small line above the title
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `title`: LocalizedTextDto — Multi-line, "\n" separated
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `body`: LocalizedOptionalTextDto (nullable)
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `buttonText`: LocalizedOptionalTextDto (nullable)
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `link`: BannerLinkDto
  - `type`: string (ALL_ITEMS|CATEGORY|ITEM) — Store view: ALL_ITEMS when the stored target is gone, hidden or unavailable
  - `category`: BannerTargetDto (nullable) — Set when type is CATEGORY
    - `id`: string
    - `slug`: string (e.g. "cakes")
    - `name`: LocalizedTextDto
      - `ar`: string — Arabic text (e.g. "كنافة عربي")
      - `en`: string — English text (e.g. "Arabic kunafa")
  - `item`: BannerTargetDto (nullable) — Set when type is ITEM
    - `id`: string
    - `slug`: string (e.g. "cakes")
    - `name`: LocalizedTextDto
      - `ar`: string — Arabic text (e.g. "كنافة عربي")
      - `en`: string — English text (e.g. "Arabic kunafa")
- `card`: BannerCardDto (nullable) — The small card. Store view: null when its item can't be shown
  - `item`: BannerTargetDto (nullable) — The item the card opens. Null only in the admin view, when that item was deleted
    - `id`: string
    - `slug`: string (e.g. "cakes")
    - `name`: LocalizedTextDto
      - `ar`: string — Arabic text (e.g. "كنافة عربي")
      - `en`: string — English text (e.g. "Arabic kunafa")
  - `imageUrl`: string [nullable true] — The card's own image, or else the item's
  - `isItemImage`?: boolean — Admin view only. True when the card shows the item's own image
  - `caption`: LocalizedOptionalTextDto (nullable)
    - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
    - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `isVisible`?: boolean — Admin view only
- `sortOrder`?: number — Admin view only
- `createdAt`?: string [format "date-time"] — Admin view only
- `updatedAt`?: string [format "date-time"] — Admin view only

### GET `/api/v1/banners/{id}`

**Get a banner for the edit drawer**

**Required permission:** `banner:read`

Auth: Bearer token
- `id` (path, required): string

Response 200 — Banner retrieved successfully: `data` is BannerDto
- `id`: string
- `imageUrl`: string — The large image
- `eyebrow`: LocalizedOptionalTextDto (nullable) — The small line above the title
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `title`: LocalizedTextDto — Multi-line, "\n" separated
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `body`: LocalizedOptionalTextDto (nullable)
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `buttonText`: LocalizedOptionalTextDto (nullable)
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `link`: BannerLinkDto
  - `type`: string (ALL_ITEMS|CATEGORY|ITEM) — Store view: ALL_ITEMS when the stored target is gone, hidden or unavailable
  - `category`: BannerTargetDto (nullable) — Set when type is CATEGORY
    - `id`: string
    - `slug`: string (e.g. "cakes")
    - `name`: LocalizedTextDto
      - `ar`: string — Arabic text (e.g. "كنافة عربي")
      - `en`: string — English text (e.g. "Arabic kunafa")
  - `item`: BannerTargetDto (nullable) — Set when type is ITEM
    - `id`: string
    - `slug`: string (e.g. "cakes")
    - `name`: LocalizedTextDto
      - `ar`: string — Arabic text (e.g. "كنافة عربي")
      - `en`: string — English text (e.g. "Arabic kunafa")
- `card`: BannerCardDto (nullable) — The small card. Store view: null when its item can't be shown
  - `item`: BannerTargetDto (nullable) — The item the card opens. Null only in the admin view, when that item was deleted
    - `id`: string
    - `slug`: string (e.g. "cakes")
    - `name`: LocalizedTextDto
      - `ar`: string — Arabic text (e.g. "كنافة عربي")
      - `en`: string — English text (e.g. "Arabic kunafa")
  - `imageUrl`: string [nullable true] — The card's own image, or else the item's
  - `isItemImage`?: boolean — Admin view only. True when the card shows the item's own image
  - `caption`: LocalizedOptionalTextDto (nullable)
    - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
    - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `isVisible`?: boolean — Admin view only
- `sortOrder`?: number — Admin view only
- `createdAt`?: string [format "date-time"] — Admin view only
- `updatedAt`?: string [format "date-time"] — Admin view only

### PUT `/api/v1/banners/{id}`

**Save the banner's edit drawer**

**Required permission:** `banner:update`

Send the whole drawer. A text left out is cleared; replaced images are deleted.

Auth: Bearer token
- `id` (path, required): string

Request body (application/json, required): BannerFormDto
- `imageKey`: string — The large image. Key from POST /uploads with purpose BANNER_IMAGE
- `eyebrow`?: LocalizedOptionalTextDto (nullable) — The small line above the title (سطر صغير فوق العنوان) (e.g. {"ar":"توقيع دهب","en":"Dahab signature"})
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `title`: LocalizedTextDto — Both languages are required. "\n" starts a new line (e.g. {"ar":"تورتة الفستق\nبكتابتك عليها","en":"Pistachio cake,\nwith your message on top"})
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `body`?: LocalizedLongTextDto (nullable) (e.g. {"ar":"اكتب رسالتك ونجهّزها لعيد الميلاد أو أي مناسبة.","en":"Add your message — ready for birthdays and every occasion."})
  - `ar`?: string [nullable true] — Arabic text
  - `en`?: string [nullable true] — English text
- `buttonText`?: LocalizedOptionalTextDto (nullable) — نص الزرار (e.g. {"ar":"اطلب التورتة","en":"Order the cake"})
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `linkType`: string (ALL_ITEMS|CATEGORY|ITEM) — Where the button goes (الزرار بيودّي على)
- `linkCategoryId`?: object [nullable true] — Required when linkType is CATEGORY, ignored otherwise
- `linkItemId`?: object [nullable true] — Required when linkType is ITEM, ignored otherwise
- `cardItemId`?: object [nullable true] — The item the small card opens. Null means no card
- `cardImageKey`?: string [nullable true] — Replaces the item's own image on the card. Key from POST /uploads with purpose BANNER_IMAGE. Ignored without a card
- `cardCaption`?: LocalizedOptionalTextDto (nullable) — The text under the small image (نص تحت الصورة الصغيرة). Ignored without a card
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `isVisible`: boolean — Shown in the store (البانر ظاهر في المتجر). Send false for a new, hidden banner

Response 200 — Banner updated successfully: `data` is BannerDto
- `id`: string
- `imageUrl`: string — The large image
- `eyebrow`: LocalizedOptionalTextDto (nullable) — The small line above the title
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `title`: LocalizedTextDto — Multi-line, "\n" separated
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `body`: LocalizedOptionalTextDto (nullable)
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `buttonText`: LocalizedOptionalTextDto (nullable)
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `link`: BannerLinkDto
  - `type`: string (ALL_ITEMS|CATEGORY|ITEM) — Store view: ALL_ITEMS when the stored target is gone, hidden or unavailable
  - `category`: BannerTargetDto (nullable) — Set when type is CATEGORY
    - `id`: string
    - `slug`: string (e.g. "cakes")
    - `name`: LocalizedTextDto
      - `ar`: string — Arabic text (e.g. "كنافة عربي")
      - `en`: string — English text (e.g. "Arabic kunafa")
  - `item`: BannerTargetDto (nullable) — Set when type is ITEM
    - `id`: string
    - `slug`: string (e.g. "cakes")
    - `name`: LocalizedTextDto
      - `ar`: string — Arabic text (e.g. "كنافة عربي")
      - `en`: string — English text (e.g. "Arabic kunafa")
- `card`: BannerCardDto (nullable) — The small card. Store view: null when its item can't be shown
  - `item`: BannerTargetDto (nullable) — The item the card opens. Null only in the admin view, when that item was deleted
    - `id`: string
    - `slug`: string (e.g. "cakes")
    - `name`: LocalizedTextDto
      - `ar`: string — Arabic text (e.g. "كنافة عربي")
      - `en`: string — English text (e.g. "Arabic kunafa")
  - `imageUrl`: string [nullable true] — The card's own image, or else the item's
  - `isItemImage`?: boolean — Admin view only. True when the card shows the item's own image
  - `caption`: LocalizedOptionalTextDto (nullable)
    - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
    - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `isVisible`?: boolean — Admin view only
- `sortOrder`?: number — Admin view only
- `createdAt`?: string [format "date-time"] — Admin view only
- `updatedAt`?: string [format "date-time"] — Admin view only

### PATCH `/api/v1/banners/{id}`

**Show or hide a banner**

**Required permission:** `banner:update`

The list toggle (ظاهر).

Auth: Bearer token
- `id` (path, required): string

Request body (application/json, required): SetBannerVisibilityDto
- `isVisible`: boolean — Shown in the store (ظاهر)

Response 200 — Banner visibility updated successfully: `data` is BannerDto
- `id`: string
- `imageUrl`: string — The large image
- `eyebrow`: LocalizedOptionalTextDto (nullable) — The small line above the title
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `title`: LocalizedTextDto — Multi-line, "\n" separated
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `body`: LocalizedOptionalTextDto (nullable)
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `buttonText`: LocalizedOptionalTextDto (nullable)
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `link`: BannerLinkDto
  - `type`: string (ALL_ITEMS|CATEGORY|ITEM) — Store view: ALL_ITEMS when the stored target is gone, hidden or unavailable
  - `category`: BannerTargetDto (nullable) — Set when type is CATEGORY
    - `id`: string
    - `slug`: string (e.g. "cakes")
    - `name`: LocalizedTextDto
      - `ar`: string — Arabic text (e.g. "كنافة عربي")
      - `en`: string — English text (e.g. "Arabic kunafa")
  - `item`: BannerTargetDto (nullable) — Set when type is ITEM
    - `id`: string
    - `slug`: string (e.g. "cakes")
    - `name`: LocalizedTextDto
      - `ar`: string — Arabic text (e.g. "كنافة عربي")
      - `en`: string — English text (e.g. "Arabic kunafa")
- `card`: BannerCardDto (nullable) — The small card. Store view: null when its item can't be shown
  - `item`: BannerTargetDto (nullable) — The item the card opens. Null only in the admin view, when that item was deleted
    - `id`: string
    - `slug`: string (e.g. "cakes")
    - `name`: LocalizedTextDto
      - `ar`: string — Arabic text (e.g. "كنافة عربي")
      - `en`: string — English text (e.g. "Arabic kunafa")
  - `imageUrl`: string [nullable true] — The card's own image, or else the item's
  - `isItemImage`?: boolean — Admin view only. True when the card shows the item's own image
  - `caption`: LocalizedOptionalTextDto (nullable)
    - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
    - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `isVisible`?: boolean — Admin view only
- `sortOrder`?: number — Admin view only
- `createdAt`?: string [format "date-time"] — Admin view only
- `updatedAt`?: string [format "date-time"] — Admin view only

### DELETE `/api/v1/banners/{id}`

**Delete a banner**

**Required permission:** `banner:delete`

Also deletes its images.

Auth: Bearer token
- `id` (path, required): string

Response 200 — Banner deleted successfully

### PUT `/api/v1/banners/order`

**Reorder banners**

**Required permission:** `banner:update`

Send every banner id once, in the new rotation order.

Auth: Bearer token

Request body (application/json, required): ReorderDto
- `ids`: string[] — Every id of the resource, each once, in the new order (e.g. ["019a0c5e-8f1a-7b2c-9d3e-4f5a6b7c8d9e","019a0c5e-9a2b-7c3d-8e4f-5a6b7c8d9e0f"])

Response 200 — Banners reordered successfully: `data` is BannerDto[]
- `id`: string
- `imageUrl`: string — The large image
- `eyebrow`: LocalizedOptionalTextDto (nullable) — The small line above the title
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `title`: LocalizedTextDto — Multi-line, "\n" separated
  - `ar`: string — Arabic text (e.g. "كنافة عربي")
  - `en`: string — English text (e.g. "Arabic kunafa")
- `body`: LocalizedOptionalTextDto (nullable)
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `buttonText`: LocalizedOptionalTextDto (nullable)
  - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
  - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `link`: BannerLinkDto
  - `type`: string (ALL_ITEMS|CATEGORY|ITEM) — Store view: ALL_ITEMS when the stored target is gone, hidden or unavailable
  - `category`: BannerTargetDto (nullable) — Set when type is CATEGORY
    - `id`: string
    - `slug`: string (e.g. "cakes")
    - `name`: LocalizedTextDto
      - `ar`: string — Arabic text (e.g. "كنافة عربي")
      - `en`: string — English text (e.g. "Arabic kunafa")
  - `item`: BannerTargetDto (nullable) — Set when type is ITEM
    - `id`: string
    - `slug`: string (e.g. "cakes")
    - `name`: LocalizedTextDto
      - `ar`: string — Arabic text (e.g. "كنافة عربي")
      - `en`: string — English text (e.g. "Arabic kunafa")
- `card`: BannerCardDto (nullable) — The small card. Store view: null when its item can't be shown
  - `item`: BannerTargetDto (nullable) — The item the card opens. Null only in the admin view, when that item was deleted
    - `id`: string
    - `slug`: string (e.g. "cakes")
    - `name`: LocalizedTextDto
      - `ar`: string — Arabic text (e.g. "كنافة عربي")
      - `en`: string — English text (e.g. "Arabic kunafa")
  - `imageUrl`: string [nullable true] — The card's own image, or else the item's
  - `isItemImage`?: boolean — Admin view only. True when the card shows the item's own image
  - `caption`: LocalizedOptionalTextDto (nullable)
    - `ar`?: string [nullable true] — Arabic text (e.g. "الأكثر طلبًا")
    - `en`?: string [nullable true] — English text (e.g. "Best seller")
- `isVisible`?: boolean — Admin view only
- `sortOrder`?: number — Admin view only
- `createdAt`?: string [format "date-time"] — Admin view only
- `updatedAt`?: string [format "date-time"] — Admin view only
