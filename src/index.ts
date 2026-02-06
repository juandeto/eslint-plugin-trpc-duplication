import noHighFrequencyProcedures from "./rules/no-high-frequency-procedures.js";

/**
 * ESLint plugin for detecting high-frequency tRPC procedure usage.
 *
 * @example
 * ```javascript
 * import trpcDuplication from "eslint-plugin-trpc-duplication";
 *
 * export default [
 *   {
 *     plugins: {
 *       "trpc-duplication": trpcDuplication,
 *     },
 *     rules: {
 *       "trpc-duplication/no-high-frequency-procedures": ["warn", {
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
