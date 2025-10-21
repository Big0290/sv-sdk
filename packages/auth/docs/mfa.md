# Multi-Factor Authentication (MFA) - Future Feature

This document outlines the plan for implementing MFA in a future version of @big0290/auth.

## Overview

Multi-Factor Authentication adds an extra layer of security by requiring users to provide two or more verification factors.

## Planned Implementation

### Phase 1: TOTP (Time-based One-Time Password)

**Features**:

- QR code generation for authenticator apps (Google Authenticator, Authy, etc.)
- Backup codes for account recovery
- Optional MFA (user can enable/disable)
- Remember device option

**Database Schema** (to be added):

```sql
CREATE TABLE auth.mfa_settings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT FALSE,
  secret TEXT, -- TOTP secret (encrypted)
  backup_codes TEXT[], -- Encrypted backup codes
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE auth.mfa_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT,
  trusted_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**API Endpoints**:

- `POST /api/auth/mfa/enable` - Enable MFA for user
- `POST /api/auth/mfa/verify-setup` - Verify TOTP setup
- `POST /api/auth/mfa/verify` - Verify TOTP code during login
- `POST /api/auth/mfa/disable` - Disable MFA
- `POST /api/auth/mfa/backup-codes` - Generate new backup codes
- `POST /api/auth/mfa/trust-device` - Trust current device

### Phase 2: SMS/Email OTP

**Features**:

- SMS-based OTP
- Email-based OTP
- Configurable OTP length (6 digits)
- Configurable OTP expiry (5 minutes)

**Requirements**:

- SMS provider integration (Twilio, SNS)
- Email provider (already available via @big0290/email)

### Phase 3: WebAuthn / Passkeys

**Features**:

- Biometric authentication (Face ID, Touch ID, Windows Hello)
- Hardware security keys (YubiKey, etc.)
- Passwordless authentication option

**Libraries**:

- [@simplewebauthn/server](https://www.npmjs.com/package/@simplewebauthn/server)
- [@simplewebauthn/browser](https://www.npmjs.com/package/@simplewebauthn/browser)

## Implementation Considerations

### Security

- **Secret Storage**: Encrypt TOTP secrets in database
- **Backup Codes**: One-time use, encrypted
- **Rate Limiting**: Prevent brute force on OTP verification
- **Device Trust**: Limited time trust (e.g., 30 days)
- **Recovery Flow**: Secure account recovery if MFA device lost

### UX

- **Optional**: Don't force MFA on all users
- **Gradual Rollout**: Allow users to opt-in
- **Recovery Options**: Multiple recovery methods
- **Clear Instructions**: Setup wizard with QR code
- **Device Management**: List and revoke trusted devices

### Compatibility

- **BetterAuth Support**: Check BetterAuth MFA plugins
- **Existing Sessions**: Handle migration of existing sessions
- **API Compatibility**: Maintain backward compatibility

## Timeline

- **Q2 2024**: TOTP implementation
- **Q3 2024**: SMS/Email OTP
- **Q4 2024**: WebAuthn/Passkeys

## Resources

- [TOTP RFC 6238](https://tools.ietf.org/html/rfc6238)
- [WebAuthn Guide](https://webauthn.guide/)
- [OWASP MFA Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html)

## References

For now, use strong password policy as primary security measure. MFA will be added in future releases.
