# @big0290/create-app

Scaffold SvelteKit applications with the Big0290 SDK pre-configured.

## Usage

```bash
# With pnpm
pnpm create @big0290/app my-awesome-app

# With npm
npm create @big0290/app my-awesome-app

# With yarn
yarn create @big0290/app my-awesome-app
```

## What You Get

A fully configured SvelteKit project with:

- ✅ Big0290 SDK pre-installed and configured
- ✅ TypeScript setup
- ✅ Tailwind CSS with glassmorphism theme
- ✅ Interactive prompts for feature selection
- ✅ Docker Compose for PostgreSQL & Redis (optional)
- ✅ Example routes and components
- ✅ Authentication routes (if selected)
- ✅ Admin dashboard (if selected)
- ✅ Production-ready configuration

## Features You Can Include

During setup, you'll be asked which features to include:

- **Authentication** - BetterAuth integration with login/signup
- **Permissions & RBAC** - Role-based access control
- **Email System** - MJML templates and queue processing
- **Audit Logging** - Compliance and activity tracking
- **Admin Dashboard** - Full-featured admin panel

## Requirements

- Node.js 18+
- pnpm, npm, or yarn
- GitHub Personal Access Token (to install @big0290 packages)
  - Get one at: https://github.com/settings/tokens
  - Needs `read:packages` permission

## After Creation

```bash
cd my-awesome-app

# If using Docker
docker-compose up -d
pnpm db:migrate

# Start development
pnpm dev
```

Your app will be running at http://localhost:5173

## GitHub Token Setup

The scaffolder will ask for your GitHub token to install @big0290 packages. This token is:

- Only used during installation
- Stored in `.npmrc` (which is in .gitignore)
- Required because @big0290 packages are on GitHub Packages Registry

To create a token:

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scope: `read:packages`
4. Copy the token and paste when prompted

## Project Structure

```
my-app/
├── src/
│   ├── lib/
│   │   └── sdk.ts          # SDK initialization
│   ├── routes/
│   │   ├── +layout.svelte  # Root layout
│   │   ├── +page.svelte    # Home page
│   │   ├── login/          # Auth routes (if enabled)
│   │   ├── signup/
│   │   └── api/
│   │       └── health/     # Health check endpoint
│   ├── app.css             # Global styles
│   ├── app.d.ts            # TypeScript declarations
│   ├── app.html            # HTML template
│   └── hooks.server.ts     # Server hooks
├── static/                 # Static assets
├── .env                    # Environment variables
├── .env.example            # Example env vars
├── .npmrc                  # GitHub Packages config
├── docker-compose.yml      # Docker services (optional)
├── package.json
└── README.md
```

## Troubleshooting

### Installation fails with authentication error

Make sure your GitHub token has the `read:packages` permission and is valid.

### Docker services won't start

Check that Docker Desktop is running and ports 5432 (PostgreSQL) and 6379 (Redis) are not already in use.

### Type errors after creation

Run `pnpm check` to verify TypeScript types are correct.

## Contributing

This is part of the Big0290 SDK project. See the main repository for contribution guidelines.

## License

MIT
