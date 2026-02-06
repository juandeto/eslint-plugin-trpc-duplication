#!/usr/bin/env node

/**
 * CLI for generating tRPC usage cache.
 *
 * Usage:
 *   trpc-usage cache
 *   trpc-usage cache --if-needed
 *   trpc-usage cache --force
 *   trpc-usage cache --verbose
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { glob } from "glob";
import * as ts from "typescript";
import type { TrpcUsageCache, ProcedureUsage } from "./types.js";

const args = process.argv.slice(2);
const command = args[0];
const force = args.includes("--force");
const verbose = args.includes("--verbose");
const ifNeeded = args.includes("--if-needed");

const projectRoot = process.env.INIT_CWD ?? process.cwd();
const cacheDir = join(projectRoot, "node_modules", ".cache");
const cacheFile = join(cacheDir, "eslint-trpc-usage.json");
const sourceDirs = ["app", "components", "lib"];
const sourcePatterns = sourceDirs.map((dir) => `${dir}/**/*.{ts,tsx}`);

interface ProcedureCall {
  router: string;
  procedure: string;
  file: string;
  type: "hook" | "serverCall";
}

function printHelp(): void {
  console.log("Usage: trpc-usage cache [--if-needed] [--force] [--verbose]");
}

function shouldRegenerateCache(): boolean {
  if (force) return true;
  if (!existsSync(cacheFile)) return true;

  try {
    const cache = JSON.parse(readFileSync(cacheFile, "utf-8")) as TrpcUsageCache;
    const ageMs = Date.now() - cache.timestamp;
    const oneHour = 60 * 60 * 1000;
    return ageMs > oneHour;
  } catch {
    return true;
  }
}

async function findSourceFiles(): Promise<string[]> {
  const files: string[] = [];

  for (const pattern of sourcePatterns) {
    const matches = await glob(pattern, {
      cwd: projectRoot,
      ignore: ["**/node_modules/**", "**/.next/**", "**/dist/**"],
      absolute: true,
    });
    files.push(...matches);
  }

  return files;
}

function extractProcedureCalls(filePath: string, sourceText: string): ProcedureCall[] {
  const calls: ProcedureCall[] = [];
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
  );

  function visit(node: ts.Node): void {
    if (ts.isCallExpression(node)) {
      const procedure = extractProcedureFromCall(node);
      if (procedure) {
        calls.push({
          ...procedure,
          file: relative(projectRoot, filePath),
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return calls;
}

function extractProcedureFromCall(
  node: ts.CallExpression,
): { router: string; procedure: string; type: "hook" | "serverCall" } | null {
  if (!ts.isPropertyAccessExpression(node.expression)) {
    return null;
  }

  const methodName = node.expression.name.text;
  const isHook = [
    "useQuery",
    "useMutation",
    "useInfiniteQuery",
    "useSuspenseQuery",
    "useSuspenseInfiniteQuery",
  ].includes(methodName);
  const object = isHook ? node.expression.expression : node.expression;

  if (!ts.isPropertyAccessExpression(object)) {
    return null;
  }

  const procedure = object.name.text;
  const routerExpr = object.expression;

  if (!ts.isPropertyAccessExpression(routerExpr)) {
    return null;
  }

  const router = routerExpr.name.text;
  const apiExpr = routerExpr.expression;

  if (!ts.isIdentifier(apiExpr) || apiExpr.text !== "api") {
    return null;
  }

  return {
    router,
    procedure,
    type: isHook ? "hook" : "serverCall",
  };
}

async function generateCache(): Promise<TrpcUsageCache> {
  const files = await findSourceFiles();
  const procedureMap = new Map<string, ProcedureUsage>();

  if (verbose) {
    console.log(`📁 Scanning ${files.length} files...`);
  }

  for (const filePath of files) {
    try {
      const sourceText = readFileSync(filePath, "utf-8");
      const calls = extractProcedureCalls(filePath, sourceText);

      for (const call of calls) {
        const key = `${call.router}.${call.procedure}`;

        if (!procedureMap.has(key)) {
          procedureMap.set(key, {
            files: [],
            count: 0,
            hooks: 0,
            serverCalls: 0,
          });
        }

        const usage = procedureMap.get(key)!;

        if (!usage.files.includes(call.file)) {
          usage.files.push(call.file);
        }

        usage.count++;
        if (call.type === "hook") {
          usage.hooks++;
        } else {
          usage.serverCalls++;
        }
      }
    } catch (error) {
      if (verbose) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`⚠️  Skipping ${filePath}: ${message}`);
      }
    }
  }

  const procedures: Record<string, ProcedureUsage> = {};
  for (const [key, usage] of procedureMap) {
    procedures[key] = usage;
  }

  return {
    version: 1,
    timestamp: Date.now(),
    procedures,
  };
}

async function runCache(): Promise<void> {
  if (ifNeeded && !shouldRegenerateCache()) {
    if (verbose) {
      console.log("✅ Cache is up to date.");
    }
    return;
  }

  console.log("🔍 Generating tRPC usage cache...");

  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true });
  }

  const cache = await generateCache();
  writeFileSync(cacheFile, JSON.stringify(cache, null, 2), "utf-8");

  const procedureCount = Object.keys(cache.procedures).length;
  console.log(`✅ Cache generated: ${procedureCount} procedures found`);

  if (verbose) {
    console.log("\n📊 Procedure summary:");
    const sorted = Object.entries(cache.procedures).sort(
      (a, b) => b[1].files.length - a[1].files.length,
    );

    for (const [key, usage] of sorted.slice(0, 20)) {
      console.log(`  ${key}: ${usage.files.length} files (${usage.count} total calls)`);
    }
  }
}

async function main(): Promise<void> {
  if (command !== "cache") {
    printHelp();
    process.exit(1);
  }

  await runCache();
}

main().catch((error) => {
  console.error("❌ Error generating cache:", error);
  process.exit(1);
});
