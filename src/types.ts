/**
 * Cache file structure stored at node_modules/.cache/eslint-trpc-usage.json
 */
export interface TrpcUsageCache {
  /** Schema version for future migrations */
  version: 1;

  /** Unix timestamp when cache was generated */
  timestamp: number;

  /** Map of procedure key to usage data */
  procedures: Record<string, ProcedureUsage>;
}

/**
 * Usage data for a single tRPC procedure
 */
export interface ProcedureUsage {
  /** List of file paths using this procedure (relative to project root) */
  files: string[];

  /** Total usage count (may exceed files.length if used multiple times per file) */
  count: number;

  /** Usage breakdown by call type */
  hooks: number; // useQuery, useMutation, useInfiniteQuery
  serverCalls: number; // await api.*.*()
}

/**
 * ESLint rule options for no-high-frequency-procedures
 */
export interface RuleOptions {
  /**
   * Number of files that triggers a warning/error
   * @default 3
   */
  threshold?: number;

  /**
   * Severity when threshold is met
   * @default "warn"
   */
  severity?: "warn" | "error";

  /**
   * Procedures to ignore (won't trigger warnings)
   * @default []
   */
  ignoreProcedures?: string[];

  /**
   * Include server-side calls (await api.*.*())
   * @default true
   */
  includeServerCalls?: boolean;
}
