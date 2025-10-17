# API Versioning Strategy

SV-SDK uses URL-based versioning for the REST API.

---

## Current Versions

### v1 (Current - Stable)

**Base URL**: `/api/v1/`

**Endpoints**:
- `GET /api/v1/users` - List users
- `POST /api/v1/users` - Create user
- `GET /api/v1/users/:id` - Get user by ID
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user (soft)
- `GET /api/v1/roles` - List roles
- `POST /api/v1/roles` - Create role
- `GET /api/v1/audit` - Query audit logs
- `GET /api/v1/templates` - List email templates

**Features**:
- Request validation with Zod
- Rate limiting (100 req/15 min)
- Permission-based access control
- Comprehensive error responses
- Pagination support

**Stability**: Stable - no breaking changes

---

## Versioning Policy

### Breaking Changes

Breaking changes require a new API version:
- Removing endpoints
- Changing required fields
- Changing response structure
- Removing response fields

### Non-Breaking Changes

Can be added to current version:
- Adding new endpoints
- Adding optional fields
- Adding new response fields
- Performance improvements
- Bug fixes

---

## Deprecation Process

1. **Announce** - 3 months advance notice
2. **Mark Deprecated** - Add deprecation headers
3. **Support Window** - Maintain for 6 months
4. **Remove** - After support window expires

**Example Deprecation Header**:
```
Deprecation: true
Sunset: 2025-06-01
Link: <https://docs.example.com/api/migration>; rel="sunset"
```

---

## Version Compatibility Matrix

| API Version | Min Client Version | Supported Until | Status |
|-------------|-------------------|-----------------|---------|
| v1 | 0.0.1 | Current | ✅ Stable |
| v2 | TBD | TBD | 🚧 Planned |

---

## Migration Guide

### From v1 to v2 (Future)

When v2 is released, migration guide will be added here.

---

## Client Compatibility

### Recommended Approach

Use the latest stable version:

```typescript
const API_BASE = '/api/v1'

async function getUsers() {
  const response = await fetch(`${API_BASE}/users`)
  return response.json()
}
```

### Version Negotiation

Clients can specify accepted versions:

```typescript
fetch('/api/v1/users', {
  headers: {
    'Accept-Version': 'v1',
  },
})
```

---

## Changelog

### v1.0.0 (Initial Release)

**Added**:
- User management endpoints
- Role management endpoints
- Audit log query endpoints
- Email template endpoints
- Authentication endpoints (via BetterAuth)

**Features**:
- Zod validation
- Rate limiting
- Permission checks
- Pagination
- Comprehensive error handling

---

## Support

For API questions or issues:
- Documentation: [docs/api/](./api/)
- GitHub Issues: https://github.com/your-org/sv-sdk/issues
- API Status: https://status.example.com

