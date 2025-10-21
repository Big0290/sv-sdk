---
'@big0290/db-config': patch
'@big0290/cache': patch
'@big0290/create-app': patch
'@big0290/ui': patch
---

Fix lazy loading for environment variables and Svelte rune usage

- db-config and cache now use lazy loading for database/Redis connections
- Environment variables are checked only when connections are first used, not at import time
- Fixes issue where scaffolded projects couldn't start because .env wasn't loaded yet
- create-app now generates correct drizzle schema path
- ui: Remove $state rune from theme/store.ts (runes only work in .svelte files)
