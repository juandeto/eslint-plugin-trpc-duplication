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
declare const _default: {
    rules: {
        "no-high-frequency-procedures": import("@typescript-eslint/utils/ts-eslint").RuleModule<"highFrequencyProcedure", [import("./types.js").RuleOptions], unknown, import("@typescript-eslint/utils/ts-eslint").RuleListener> & {
            name: string;
        };
    };
};
export default _default;
//# sourceMappingURL=index.d.ts.map