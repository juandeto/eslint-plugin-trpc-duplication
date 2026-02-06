import { ESLintUtils } from "@typescript-eslint/utils";
import { loadCache } from "../utils/cache.js";
import { formatProcedureKey, isTrpcHookCall, isTrpcServerCall } from "../utils/ast.js";
const createRule = ESLintUtils.RuleCreator((name) => `https://github.com/your-org/eslint-plugin-trpc-usage/blob/main/docs/rules/${name}.md`);
export default createRule({
    name: "no-high-frequency-procedures",
    meta: {
        type: "suggestion",
        docs: {
            description: "Detects tRPC procedures used across multiple files, suggesting shared hook extraction",
        },
        messages: {
            highFrequencyProcedure: "Procedure '{{procedure}}' is used in {{fileCount}} file(s). Time to refactor! Consider creating a shared hook to reduce duplication.",
        },
        schema: [
            {
                type: "object",
                properties: {
                    threshold: {
                        type: "number",
                        minimum: 1,
                    },
                    severity: {
                        type: "string",
                        enum: ["warn", "error"],
                    },
                    ignoreProcedures: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                    },
                    includeServerCalls: {
                        type: "boolean",
                    },
                },
                additionalProperties: false,
            },
        ],
    },
    defaultOptions: [
        {
            threshold: 3,
            severity: "warn",
            ignoreProcedures: [],
            includeServerCalls: true,
        },
    ],
    create(context, [options]) {
        const cache = loadCache();
        const threshold = options.threshold ?? 3;
        const ignoreProcedures = new Set(options.ignoreProcedures ?? []);
        const includeServerCalls = options.includeServerCalls ?? true;
        // If cache doesn't exist, silently skip (don't error)
        if (!cache) {
            return {};
        }
        return {
            CallExpression(node) {
                // Check for hook calls (useQuery, useMutation, useInfiniteQuery)
                const hookCall = isTrpcHookCall(node);
                if (hookCall) {
                    checkProcedure(hookCall.router, hookCall.procedure, node);
                    return;
                }
                // Check for server-side calls if enabled
                if (includeServerCalls) {
                    const serverCall = isTrpcServerCall(node);
                    if (serverCall) {
                        checkProcedure(serverCall.router, serverCall.procedure, node);
                    }
                }
            },
        };
        function checkProcedure(router, procedure, node) {
            const procedureKey = formatProcedureKey(router, procedure);
            // Skip if ignored
            if (ignoreProcedures.has(procedureKey)) {
                return;
            }
            // Look up in cache (cache is guaranteed to exist here due to early return above)
            const usage = cache.procedures[procedureKey];
            if (!usage) {
                return; // Procedure not in cache (might be new or not scanned)
            }
            // Check if threshold exceeded
            const fileCount = usage.files.length;
            if (fileCount >= threshold) {
                const severity = options.severity ?? "warn";
                context.report({
                    node,
                    messageId: "highFrequencyProcedure",
                    data: {
                        procedure: procedureKey,
                        fileCount: fileCount.toString(),
                    },
                    ...(severity === "error" ? {} : {}), // ESLint handles severity via rule config
                });
            }
        }
    },
});
//# sourceMappingURL=no-high-frequency-procedures.js.map