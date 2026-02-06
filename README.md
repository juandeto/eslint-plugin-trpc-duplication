# eslint-plugin-trpc-duplication

ESLint plugin to detect high-frequency tRPC procedure usage across the codebase, helping identify candidates for shared hooks.

## Installation

```bash
npm install --save-dev eslint-plugin-trpc-duplication
```

## Usage

### 1. Generate Cache

The cache is generated automatically on install via `postinstall`.

If you need to regenerate manually:

```bash
trpc-usage cache --if-needed
```

### 2. Configure ESLint

Add the plugin to your ESLint configuration:

```javascript
// eslint.config.js
import trpcUsage from "eslint-plugin-trpc-duplication";

export default [
  {
    plugins: {
      "trpc-usage": trpcUsage,
    },
    rules: {
      "trpc-usage/no-high-frequency-procedures": [
        "warn",
        {
          threshold: 3,
          severity: "warn",
          ignoreProcedures: ["health"],
          includeServerCalls: true,
        },
      ],
    },
  },
];
```

### 3. Integrate with lint-staged

Add cache generation to your pre-commit hook:

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "trpc-usage cache --if-needed",
      "eslint --fix"
    ]
  }
}
```

## Options

### `threshold`

- **Type:** `number`
- **Default:** `3`
- **Description:** Number of files that triggers a warning/error

### `severity`

- **Type:** `"warn" | "error"`
- **Default:** `"warn"`
- **Description:** Severity when threshold is met (note: actual severity is controlled by ESLint rule config)

### `ignoreProcedures`

- **Type:** `string[]`
- **Default:** `[]`
- **Description:** Procedures to ignore (won't trigger warnings)

### `includeServerCalls`

- **Type:** `boolean`
- **Default:** `true`
- **Description:** Include server-side calls (`await api.*.*()`) in detection

## Cache Generation

The cache is stored at `node_modules/.cache/eslint-trpc-usage.json` and contains:

- Procedure usage counts per file
- Breakdown by hook vs server-side calls
- Timestamp for cache freshness

Cache is regenerated:
- On install (via postinstall)
- On every commit (via lint-staged, if configured)
- Manually via `trpc-usage cache --if-needed`
- Automatically if cache is older than 1 hour

## Examples

### Warning Example

```typescript
// If pages.get is used in 5 files and threshold is 3:
api.pages.get.useQuery({ id: "123" });
// ⚠️ Procedure 'pages.get' is used in 5 file(s). Consider creating a shared hook to reduce duplication.
```

### Ignoring Procedures

```javascript
{
  "trpc-usage/no-high-frequency-procedures": [
    "warn",
    {
      ignoreProcedures: ["health", "internal.sidebar.list"],
    },
  ],
}
```

### Server-Side Detection

```typescript
// Detects server-side calls when includeServerCalls: true
await api.pages.get({ id: "123" });
```

## Troubleshooting

### Cache Not Found

If you see no warnings, ensure the cache is generated:

```bash
trpc-usage cache
```

### False Positives

The plugin uses AST-based detection, so it should not have false positives. If you see warnings for procedures that aren't actually duplicated:

1. Check the cache: `cat node_modules/.cache/eslint-trpc-usage.json`
2. Verify file counts match your expectations
3. Add to `ignoreProcedures` if needed

### Performance

Cache generation takes ~2-5 seconds for a typical codebase. Lint overhead is < 100ms.

## License

MIT
