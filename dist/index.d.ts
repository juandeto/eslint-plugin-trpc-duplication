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
declare const _default: {
    rules: {
        "no-high-frequency-procedures": import("@typescript-eslint/utils/ts-eslint").RuleModule<"highFrequencyProcedure", [import("./types.js").RuleOptions], unknown, import("@typescript-eslint/utils/ts-eslint").RuleListener> & {
            name: string;
        };
    };
};
export default _default;
//# sourceMappingURL=index.d.ts.map