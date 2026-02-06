/**
 * Checks if a CallExpression is a tRPC hook call (useQuery, useMutation, useInfiniteQuery).
 *
 * @param node - CallExpression node to check
 * @returns Object with router and procedure names if it's a tRPC hook, null otherwise
 */
export function isTrpcHookCall(node) {
    if (node.callee.type !== "MemberExpression") {
        return null;
    }
    const method = node.callee.property;
    if (method.type !== "Identifier") {
        return null;
    }
    const hookNames = new Set([
        "useQuery",
        "useMutation",
        "useInfiniteQuery",
        "useSuspenseQuery",
        "useSuspenseInfiniteQuery",
    ]);
    if (!hookNames.has(method.name)) {
        return null;
    }
    // Traverse up to find api.router.procedure
    return extractTrpcProcedure(node.callee.object);
}
/**
 * Checks if a CallExpression is a server-side tRPC call (await api.*.*()).
 *
 * @param node - CallExpression node to check
 * @returns Object with router and procedure names if it's a server-side call, null otherwise
 */
export function isTrpcServerCall(node) {
    // Check if it's a direct call (not a member expression with a hook)
    if (node.callee.type !== "MemberExpression") {
        return null;
    }
    const property = node.callee.property;
    if (property.type !== "Identifier") {
        return null;
    }
    // Server-side calls don't have useQuery/useMutation/etc
    const hookNames = new Set([
        "useQuery",
        "useMutation",
        "useInfiniteQuery",
        "useSuspenseQuery",
        "useSuspenseInfiniteQuery",
    ]);
    if (hookNames.has(property.name)) {
        return null;
    }
    // Extract procedure from api.router.procedure()
    return extractTrpcProcedure(node.callee);
}
/**
 * Extracts router and procedure names from a MemberExpression chain.
 *
 * @param node - MemberExpression node (should be api.router.procedure)
 * @returns Object with router and procedure names, or null if not a tRPC call
 */
function extractTrpcProcedure(node) {
    if (node.type !== "MemberExpression") {
        return null;
    }
    const parts = [];
    let current = node;
    // Traverse the member expression chain
    while (current.type === "MemberExpression") {
        if (current.property.type === "Identifier") {
            parts.unshift(current.property.name);
        }
        else {
            return null; // Non-identifier property (e.g., computed property)
        }
        current = current.object;
    }
    // Check if the root object is "api"
    if (current.type !== "Identifier" || current.name !== "api") {
        return null;
    }
    // Should have exactly 2 parts: router and procedure
    if (parts.length !== 2) {
        return null;
    }
    return {
        router: parts[0],
        procedure: parts[1],
    };
}
/**
 * Formats a procedure key from router and procedure names.
 *
 * @param router - Router name (e.g., "pages")
 * @param procedure - Procedure name (e.g., "get")
 * @returns Formatted key (e.g., "pages.get")
 */
export function formatProcedureKey(router, procedure) {
    return `${router}.${procedure}`;
}
//# sourceMappingURL=ast.js.map