import noHighFrequencyProcedures from "./rules/no-high-frequency-procedures.js";

/**
 * ESLint plugin for detecting high-frequency tRPC procedure usage.
 *
 * @example
 * ```javascript
 * import trpcUsage from "eslint-plugin-trpc-duplication";
 *
 * export default [
 *   {
 *     plugins: {
 *       "trpc-usage": trpcUsage,
 *     },
 *     rules: {
 *       "trpc-usage/no-high-frequency-procedures": ["warn", {
 *         threshold: 3,
 *       }],
 *     },
 *   },
 * ];
 * ```
 */
export default {
  rules: {
    "no-high-frequency-procedures": noHighFrequencyProcedures,
  },
};
