import type { TSESTree } from "@typescript-eslint/utils";
/**
 * Checks if a CallExpression is a tRPC hook call (useQuery, useMutation, useInfiniteQuery).
 *
 * @param node - CallExpression node to check
 * @returns Object with router and procedure names if it's a tRPC hook, null otherwise
 */
export declare function isTrpcHookCall(node: TSESTree.CallExpression): {
    router: string;
    procedure: string;
} | null;
/**
 * Checks if a CallExpression is a server-side tRPC call (await api.*.*()).
 *
 * @param node - CallExpression node to check
 * @returns Object with router and procedure names if it's a server-side call, null otherwise
 */
export declare function isTrpcServerCall(node: TSESTree.CallExpression): {
    router: string;
    procedure: string;
} | null;
/**
 * Formats a procedure key from router and procedure names.
 *
 * @param router - Router name (e.g., "pages")
 * @param procedure - Procedure name (e.g., "get")
 * @returns Formatted key (e.g., "pages.get")
 */
export declare function formatProcedureKey(router: string, procedure: string): string;
//# sourceMappingURL=ast.d.ts.map