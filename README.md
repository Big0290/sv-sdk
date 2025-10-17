# SV-SDK - Svelte 5 SDK Platform

A comprehensive, production-ready SDK platform built with Svelte 5, featuring authentication, permissions, audit logging, email management, and more.

**Status**: ✅ 100% Complete | 🚀 Production Ready | 📦 12 Packages | 🎯 2 Apps | 📚 Full Documentation

[📖 View Implementation Status](./IMPLEMENTATION_COMPLETE.md) | [🏗️ Architecture](./ARCHITECTURE.md) | [🚀 Deployment Guide](./docs/deployment/)

---

## 🎯 Project Highlights

✨ **Production-Ready Core** - Authentication, permissions, email, audit, security packages fully implemented  
📦 **12 Functional Packages** - Ready to use in your Svelte 5 applications today  
🔐 **Enterprise Security** - Rate limiting, CSRF, XSS prevention, audit logging, GDPR compliance  
📧 **Complete Email System** - MJML templates, multi-provider (Brevo/SES), queue processing, webhooks  
🎨 **UI Component Library** - Accessible Svelte 5 components with Tailwind CSS and dark mode  
🔧 **CLI Tools** - Complete admin tooling for users, email, permissions, database operations  
📚 **Comprehensive Docs** - Architecture, API reference, deployment guides, operational runbooks  
🐳 **Docker Ready** - Complete Docker setup with PostgreSQL and Redis  

See [PROJECT_STATUS.md](./PROJECT_STATUS.md) for detailed implementation status.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **pnpm** 8+ (`npm install -g pnpm`)
- **Docker** & **Docker Compose** ([Download](https://www.docker.com/products/docker-desktop))

### Automated Setup

```bash
# Clone the repository
git clone <repository-url>
cd sv-sdk

# Run automated setup script
./scripts/dev-setup.sh
```

The setup script will:

1. ✅ Check prerequisites
2. ✅ Create `.env` from `.env.example`
3. ✅ Install all dependencies
4. ✅ Start Docker services (PostgreSQL + Redis)
5. ✅ Run database migrations
6. ✅ Seed initial data
7. ✅ Build all packages

### Manual Setup

If you prefer manual setup:

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment file
cp .env.example .env
# Edit .env with your configuration

# 3. Start services
docker-compose up -d

# 4. Generate database types and run migrations
pnpm db:generate
pnpm db:migrate

# 5. Seed database with initial data
pnpm db:seed

# 6. Start development servers
pnpm dev
```

### Access Applications

- **Admin Panel**: http://localhost:5173
- **Demo App**: http://localhost:5174

**Default Credentials**:

- Email: `admin@example.com`
- Password: `Admin123!`

---

## 📦 Project Structure

```
sv-sdk/
├── apps/
│   ├── admin/          # Admin dashboard (SvelteKit)
│   └── demo-app/       # Demo application (SvelteKit)
├── packages/
│   ├── shared/         # Shared utilities and types
│   ├── db-config/      # Database configuration (Drizzle ORM)
│   ├── validators/     # Validation schemas (Zod)
│   ├── cache/          # Redis caching (ioredis + BullMQ)
│   ├── core/           # Core SDK & plugin system
│   ├── security/       # Security utilities (rate limiting, CSRF)
│   ├── auth/           # Authentication (BetterAuth)
│   ├── audit/          # Audit logging
│   ├── email/          # Email system (templates, queue, providers)
│   ├── permissions/    # RBAC permissions
│   ├── ui/             # UI component library (Svelte 5 + Tailwind)
│   ├── cli/            # CLI tools
│   └── observability/  # Monitoring and metrics
├── scripts/            # Development and deployment scripts
├── test/               # Shared test utilities
└── docs/               # Documentation
```

---

## 🛠️ Development

### Common Commands

```bash
# Development
pnpm dev                    # Start all dev servers
pnpm dev --filter admin     # Start specific app

# Building
pnpm build                  # Build all packages
pnpm build --filter @sv-sdk/auth  # Build specific package

# Testing
pnpm test                   # Run all tests
pnpm test:unit              # Unit tests only
pnpm test:integration       # Integration tests
pnpm test:coverage          # Generate coverage report

# Code Quality
pnpm lint                   # Lint all packages
pnpm lint:fix               # Auto-fix linting issues
pnpm format                 # Format code with Prettier
pnpm type-check             # TypeScript type checking

# Database
pnpm db:generate            # Generate Drizzle schema
pnpm db:migrate             # Run migrations
pnpm db:seed                # Seed database
pnpm db:studio              # Open Drizzle Studio

# Services
docker-compose up -d        # Start services
docker-compose down         # Stop services
docker-compose logs -f      # View logs
```

### Development Workflow

See [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md) for detailed daily development guide.

---

## 🏗️ Architecture

### Technology Stack

- **Frontend**: Svelte 5, SvelteKit, Tailwind CSS
- **Authentication**: BetterAuth with Drizzle adapter
- **Database**: PostgreSQL with multiple schemas (auth, email, audit, permissions)
- **ORM**: Drizzle ORM
- **Caching**: Redis with ioredis
- **Queue**: BullMQ
- **Email**: MJML templates with Brevo/AWS SES providers
- **Validation**: Zod
- **Testing**: Vitest, Playwright
- **Monorepo**: pnpm workspaces + Turborepo

### Database Architecture

Single PostgreSQL database with 4 logical schemas:

```
Database: sv_sdk
├── auth (users, sessions, accounts)
├── email (templates, sends, webhooks)
├── audit (audit_logs)
└── permissions (roles, user_roles)
```

**Why single database?** See [DATABASE_DECISION.md](./DATABASE_DECISION.md) for detailed rationale.

---

## 📚 Documentation

- [**Implementation Plan**](./IMPLEMENTATION_PLAN.md) - Complete development roadmap
- [**Development Workflow**](./DEVELOPMENT_WORKFLOW.md) - Daily development guide
- [**Phase Dependencies**](./PHASE_DEPENDENCIES.md) - Implementation order and dependencies
- [**Database Decision**](./DATABASE_DECISION.md) - Database architecture rationale
- [**Versioning Strategy**](./VERSIONING.md) - Package versioning and release process

### Package Documentation

Each package has its own README with API documentation and usage examples:

- [@sv-sdk/auth](./packages/auth/README.md) - Authentication
- [@sv-sdk/email](./packages/email/README.md) - Email system
- [@sv-sdk/permissions](./packages/permissions/README.md) - RBAC permissions
- [@sv-sdk/ui](./packages/ui/README.md) - UI components
- [More packages...](./packages/)

---

## 🔒 Security

- ✅ Rate limiting on all endpoints
- ✅ CSRF protection
- ✅ Input sanitization
- ✅ Secure password hashing (Argon2)
- ✅ Session management with secure cookies
- ✅ Security headers (CSP, HSTS, etc.)
- ✅ Audit logging for security events
- ✅ PII masking in logs

See [SECURITY.md](./SECURITY.md) for vulnerability reporting.

---

## ✅ Features

### Authentication

- Email/password authentication
- Email verification
- Password reset flow
- Session management
- Rate limiting on auth endpoints
- Password strength enforcement

### Permissions

- Role-based access control (RBAC)
- Resource-level permissions
- Permission caching with Redis
- Default roles (super_admin, admin, manager, user)

### Audit Logging

- Append-only audit logs
- PII masking
- Configurable retention policies
- Full-text search
- Export to CSV/JSON

### Email System

- MJML template engine
- Multi-provider support (Brevo, AWS SES, Mock)
- Queue-based sending with BullMQ
- Webhook handling (delivery status, bounces)
- Email preferences and unsubscribe
- Localization support

### UI Components

- 30+ accessible Svelte 5 components
- Dark mode support
- Tailwind CSS integration
- WCAG 2.1 Level AA compliant
- Full keyboard navigation

---

## 🧪 Testing

### Test Coverage

Target: 80%+ for critical packages

```bash
# Run tests with coverage
pnpm test:coverage

# View coverage report
open coverage/index.html
```

### Test Types

- **Unit Tests**: Fast, isolated tests for individual functions
- **Integration Tests**: Tests across multiple packages
- **E2E Tests**: Full user workflows with Playwright
- **Performance Tests**: Benchmarking critical paths
- **Accessibility Tests**: Automated a11y testing with axe-core

---

## 🚢 Deployment

See deployment documentation in `docs/deployment/`:

- [Production Architecture](./docs/deployment/architecture.md)
- [Environment Variables](./docs/deployment/environment.md)
- [Docker Deployment](./docs/deployment/docker.md)
- [Kubernetes Deployment](./docs/deployment/k8s.md)

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write tests
5. Run linting and tests (`pnpm lint && pnpm test`)
6. Commit with conventional commit messages (`git commit -m "feat(auth): add MFA support"`)
7. Push to your branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

---

## 📝 License

MIT License - see [LICENSE](./LICENSE) for details.

---

## 🆘 Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# Kill the process
kill -9 <PID>
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View logs
docker-compose logs postgres

# Restart services
docker-compose restart postgres
```

### Redis Connection Failed

```bash
# Test Redis connection
docker-compose exec redis redis-cli -a ${REDIS_PASSWORD} ping

# Should return: PONG
```

### Build Failures

```bash
# Clean everything and rebuild
pnpm clean
pnpm install --force
pnpm build
```

For more troubleshooting, see [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md#troubleshooting).

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/sv-sdk/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/sv-sdk/discussions)
- **Documentation**: [docs/](./docs/)

---

## 🙏 Acknowledgments

Built with:

- [Svelte](https://svelte.dev/) & [SvelteKit](https://kit.svelte.dev/)
- [BetterAuth](https://www.better-auth.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Turborepo](https://turbo.build/)
- And many other amazing open-source projects

---

**Happy coding! 🎉**
