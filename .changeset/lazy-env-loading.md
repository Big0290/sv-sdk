---
'@big0290/db-config': patch
'@big0290/cache': patch
'@big0290/create-app': patch
---

Fix lazy loading for environment variables

- db-config and cache now use lazy loading for database/Redis connections
- Environment variables are checked only when connections are first used, not at import time
- Fixes issue where scaffolded projects couldn't start because .env wasn't loaded yet
- create-app now generates correct drizzle schema path
