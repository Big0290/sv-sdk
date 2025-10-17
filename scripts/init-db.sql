-- Initialize PostgreSQL database with multiple schemas
-- This script runs automatically when the database container starts for the first time

-- Create schemas for logical separation
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS email;
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS permissions;

-- Grant permissions to the application user
GRANT ALL ON SCHEMA auth TO sv_sdk_user;
GRANT ALL ON SCHEMA email TO sv_sdk_user;
GRANT ALL ON SCHEMA audit TO sv_sdk_user;
GRANT ALL ON SCHEMA permissions TO sv_sdk_user;

-- Grant all privileges on all tables in schemas (for future tables)
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON TABLES TO sv_sdk_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA email GRANT ALL ON TABLES TO sv_sdk_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA audit GRANT ALL ON TABLES TO sv_sdk_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA permissions GRANT ALL ON TABLES TO sv_sdk_user;

-- Grant all privileges on sequences (for auto-increment columns)
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON SEQUENCES TO sv_sdk_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA email GRANT ALL ON SEQUENCES TO sv_sdk_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA audit GRANT ALL ON SEQUENCES TO sv_sdk_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA permissions GRANT ALL ON SEQUENCES TO sv_sdk_user;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Log successful initialization
DO $$
BEGIN
  RAISE NOTICE 'Database initialized successfully with schemas: auth, email, audit, permissions';
END $$;

