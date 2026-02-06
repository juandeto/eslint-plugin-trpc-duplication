import type { TrpcUsageCache } from "../types.js";
/**
 * Loads the tRPC usage cache from disk.
 *
 * @param projectRoot - Root directory of the project (defaults to process.cwd())
 * @returns Cache object or null if file doesn't exist
 */
export declare function loadCache(projectRoot?: string): TrpcUsageCache | null;
/**
 * Gets the cache file path for a given project root.
 *
 * @param projectRoot - Root directory of the project
 * @returns Absolute path to cache file
 */
export declare function getCachePath(projectRoot?: string): string;
//# sourceMappingURL=cache.d.ts.map