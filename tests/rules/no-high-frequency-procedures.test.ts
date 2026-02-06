import { describe, it, vi, beforeEach } from "vitest";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule from "../../src/rules/no-high-frequency-procedures.js";
import * as cacheUtils from "../../src/utils/cache.js";
import type { TrpcDuplicationCache } from "../../src/types.js";

// Mock cache loader
vi.mock("../../src/utils/cache.js", () => ({
  loadCache: vi.fn(),
}));

RuleTester.afterAll = () => {};

describe("no-high-frequency-procedures", () => {
  const ruleTester = new RuleTester({
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
      },
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reports warning when procedure used in 3+ files", () => {
    const mockCache: TrpcDuplicationCache = {
      version: 1,
      timestamp: Date.now(),
      procedures: {
        "pages.get": {
          files: ["file1.tsx", "file2.tsx", "file3.tsx", "file4.tsx"],
          count: 5,
          hooks: 4,
          serverCalls: 1,
        },
      },
    };

    vi.mocked(cacheUtils.loadCache).mockReturnValue(mockCache);

    ruleTester.run("no-high-frequency-procedures", rule, {
      valid: [],
      invalid: [
        {
          code: "api.pages.get.useQuery({ id: '123' });",
          errors: [
            {
              messageId: "highFrequencyProcedure",
              data: {
                procedure: "pages.get",
                fileCount: "4",
              },
            },
          ],
        },
      ],
    });
  });

  it("detects useSuspenseQuery hooks", () => {
    const mockCache: TrpcDuplicationCache = {
      version: 1,
      timestamp: Date.now(),
      procedures: {
        "pages.get": {
          files: ["file1.tsx", "file2.tsx", "file3.tsx"],
          count: 3,
          hooks: 3,
          serverCalls: 0,
        },
      },
    };

    vi.mocked(cacheUtils.loadCache).mockReturnValue(mockCache);

    ruleTester.run("no-high-frequency-procedures", rule, {
      valid: [],
      invalid: [
        {
          code: "api.pages.get.useSuspenseQuery({ id: '123' });",
          errors: [
            {
              messageId: "highFrequencyProcedure",
            },
          ],
        },
      ],
    });
  });

  it("does not report when procedure used in fewer than threshold files", () => {
    const mockCache: TrpcDuplicationCache = {
      version: 1,
      timestamp: Date.now(),
      procedures: {
        "pages.get": {
          files: ["file1.tsx", "file2.tsx"],
          count: 2,
          hooks: 2,
          serverCalls: 0,
        },
      },
    };

    vi.mocked(cacheUtils.loadCache).mockReturnValue(mockCache);

    ruleTester.run("no-high-frequency-procedures", rule, {
      valid: [
        {
          code: "api.pages.get.useQuery({ id: '123' });",
        },
      ],
      invalid: [],
    });
  });

  it("respects ignoreProcedures option", () => {
    const mockCache: TrpcDuplicationCache = {
      version: 1,
      timestamp: Date.now(),
      procedures: {
        "health.check": {
          files: ["file1.tsx", "file2.tsx", "file3.tsx", "file4.tsx"],
          count: 4,
          hooks: 4,
          serverCalls: 0,
        },
      },
    };

    vi.mocked(cacheUtils.loadCache).mockReturnValue(mockCache);

    ruleTester.run(
      "no-high-frequency-procedures",
      rule,
      {
        valid: [
          {
            code: "api.health.check.useQuery();",
            options: [
              {
                ignoreProcedures: ["health.check"],
              },
            ],
          },
        ],
        invalid: [],
      },
    );
  });

  it("detects server-side calls when includeServerCalls is true", () => {
    const mockCache: TrpcDuplicationCache = {
      version: 1,
      timestamp: Date.now(),
      procedures: {
        "pages.get": {
          files: ["file1.ts", "file2.ts", "file3.ts"],
          count: 3,
          hooks: 0,
          serverCalls: 3,
        },
      },
    };

    vi.mocked(cacheUtils.loadCache).mockReturnValue(mockCache);

    ruleTester.run("no-high-frequency-procedures", rule, {
      valid: [],
      invalid: [
        {
          code: "await api.pages.get({ id: '123' });",
          errors: [
            {
              messageId: "highFrequencyProcedure",
            },
          ],
        },
      ],
    });
  });

  it("ignores server-side calls when includeServerCalls is false", () => {
    const mockCache: TrpcDuplicationCache = {
      version: 1,
      timestamp: Date.now(),
      procedures: {
        "pages.get": {
          files: ["file1.ts", "file2.ts", "file3.ts"],
          count: 3,
          hooks: 0,
          serverCalls: 3,
        },
      },
    };

    vi.mocked(cacheUtils.loadCache).mockReturnValue(mockCache);

    ruleTester.run(
      "no-high-frequency-procedures",
      rule,
      {
        valid: [
          {
            code: "await api.pages.get({ id: '123' });",
            options: [
              {
                includeServerCalls: false,
              },
            ],
          },
        ],
        invalid: [],
      },
    );
  });

  it("handles missing cache gracefully", () => {
    vi.mocked(cacheUtils.loadCache).mockReturnValue(null);

    ruleTester.run("no-high-frequency-procedures", rule, {
      valid: [
        {
          code: "api.pages.get.useQuery({ id: '123' });",
        },
      ],
      invalid: [],
    });
  });

  it("ignores non-api objects", () => {
    const mockCache: TrpcDuplicationCache = {
      version: 1,
      timestamp: Date.now(),
      procedures: {
        "pages.get": {
          files: ["file1.tsx", "file2.tsx", "file3.tsx"],
          count: 3,
          hooks: 3,
          serverCalls: 0,
        },
      },
    };

    vi.mocked(cacheUtils.loadCache).mockReturnValue(mockCache);

    ruleTester.run("no-high-frequency-procedures", rule, {
      valid: [
        {
          code: "someApi.pages.get.useQuery({ id: '123' });",
        },
      ],
      invalid: [],
    });
  });

  it("respects custom threshold", () => {
    const mockCache: TrpcDuplicationCache = {
      version: 1,
      timestamp: Date.now(),
      procedures: {
        "pages.get": {
          files: ["file1.tsx", "file2.tsx"],
          count: 2,
          hooks: 2,
          serverCalls: 0,
        },
      },
    };

    vi.mocked(cacheUtils.loadCache).mockReturnValue(mockCache);

    ruleTester.run(
      "no-high-frequency-procedures",
      rule,
      {
        valid: [],
        invalid: [
          {
            code: "api.pages.get.useQuery({ id: '123' });",
            options: [
              {
                threshold: 2,
              },
            ],
            errors: [
              {
                messageId: "highFrequencyProcedure",
              },
            ],
          },
        ],
      },
    );
  });
});
