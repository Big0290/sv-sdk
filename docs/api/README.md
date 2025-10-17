# API Documentation

Complete API reference for SV-SDK packages.

## Package APIs

### Authentication (@sv-sdk/auth)

**User Management**:
- `getUsers(filters, pagination)` - Get users with filtering
- `getUserById(id)` - Get user by ID
- `createUser(data)` - Create new user
- `updateUser(id, data)` - Update user
- `deleteUser(id)` - Delete user (soft delete)

**Authentication**:
- `login(request, metadata)` - Authenticate user
- `signup(request, metadata)` - Register new user
- `logout(sessionToken)` - Logout user
- `getSession(sessionToken)` - Get session data

**Password**:
- `requestPasswordReset(email)` - Request password reset
- `verifyEmail(token)` - Verify email address
- `enforcePasswordPolicy(password)` - Validate password strength

### Permissions (@sv-sdk/permissions)

**Permission Checking**:
- `can(userId, permission, context?)` - Check permission
- `enforce(userId, permission, context?)` - Enforce permission (throws)
- `canAny(userId, permissions, context?)` - Check any permission
- `canAll(userId, permissions, context?)` - Check all permissions

**Role Management**:
- `getRoles()` - Get all roles
- `createRole(data)` - Create new role
- `updateRole(id, data)` - Update role
- `deleteRole(id, reassignTo?)` - Delete role
- `assignRole(userId, roleId)` - Assign role to user
- `revokeRole(userId, roleId)` - Revoke role from user

### Email (@sv-sdk/email)

**Sending**:
- `sendEmail(template, to, variables)` - Send email (queued)
- `sendEmailImmediate(template, to, variables)` - Send immediately

**Templates**:
- `renderTemplate(name, variables, locale)` - Render template
- `validateTemplateMJML(mjml)` - Validate MJML
- `previewTemplate(name, variables)` - Preview rendering

**Monitoring**:
- `getEmailHistory(filters, pagination)` - Get send history
- `getEmailStats()` - Get statistics

### Audit (@sv-sdk/audit)

**Logging**:
- `logAudit(eventType, metadata, options?)` - Log event
- `logAuditBulk(events)` - Log multiple events
- `flushBatch()` - Flush batched logs

**Querying**:
- `fetchAuditLogs(filters, pagination, sort)` - Query logs
- `searchAuditLogs(query, pagination)` - Search logs
- `exportAuditLogsJSON(filters)` - Export to JSON
- `exportAuditLogsCSV(filters)` - Export to CSV

**Retention**:
- `applyRetentionPolicy(policy)` - Apply retention
- `getRetentionStats()` - Get statistics

---

## REST API (Admin App)

### Authentication Endpoints

**POST /api/v1/auth/login**:
```json
Request:
{
  "email": "user@example.com",
  "password": "password"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "session": { ... }
  }
}
```

**POST /api/v1/auth/signup**:
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "name": "John Doe"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "session": { ... }
  }
}
```

### User Management Endpoints

**GET /api/v1/users**:
```
Query Parameters:
- page: number (default: 1)
- pageSize: number (default: 20)
- role: string (optional)
- search: string (optional)

Response:
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalPages": 5,
    "totalCount": 100
  }
}
```

**GET /api/v1/users/:id**:
```json
Response:
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "isActive": true,
    "emailVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

For complete API reference, see package-specific documentation.

---

## SDK Function Reference

See package READMEs:
- [@sv-sdk/auth](../packages/auth/README.md)
- [@sv-sdk/email](../packages/email/README.md)
- [@sv-sdk/audit](../packages/audit/README.md)
- [@sv-sdk/permissions](../packages/permissions/README.md)

