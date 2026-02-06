import { readFileSync } from "node:fs";
import { join } from "node:path";
const CACHE_FILE_NAME = "eslint-trpc-duplication.json";
const CACHE_DIR = join(process.cwd(), "node_modules", ".cache");
/**
 * Loads the tRPC usage cache from disk.
 *
 * @param projectRoot - Root directory of the project (defaults to process.cwd())
 * @returns Cache object or null if file doesn't exist
 */
export function loadCache(projectRoot = process.cwd()) {
    const cachePath = join(projectRoot, "node_modules", ".cache", CACHE_FILE_NAME);
    try {
        const content = readFileSync(cachePath, "utf-8");
        const cache = JSON.parse(content);
        // Validate cache structure
        if (cache.version !== 1 || !cache.procedures || typeof cache.timestamp !== "number") {
            return null;
        }
        return cache;
    }
    catch {
        // File doesn't exist or is invalid
        return null;
    }
}
/**
 * Gets the cache file path for a given project root.
 *
 * @param projectRoot - Root directory of the project
 * @returns Absolute path to cache file
 */
export function getCachePath(projectRoot = process.cwd()) {
    return join(projectRoot, CACHE_DIR, CACHE_FILE_NAME);
}
//# sourceMappingURL=cache.js.map