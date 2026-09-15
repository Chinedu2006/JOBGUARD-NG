---
name: Generated client DOM iterable types
description: TypeScript configuration needed by Orval's generated API client
---

The generated React API client uses `Headers.entries()`. The client library must include both `dom` and `dom.iterable` in its TypeScript `lib` list, or the workspace library typecheck fails after codegen.

**Why:** The generated fetch helpers reference iterable DOM APIs that are not included by the default shared `es2022` library settings.

**How to apply:** Preserve `dom.iterable` in `lib/api-client-react/tsconfig.json` whenever regenerating the API client.