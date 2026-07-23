// tests/igentmind/pillar-01/block-20/block20.sut.ts

import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  Block20Adapter,
  CreateBlock20Adapter,
} from "./block20.types";

type UnknownRecord = Record<string, unknown>;

type UnknownFunction = (
  ...args: unknown[]
) => unknown | Promise<unknown>;

const REQUIRED_METHOD_ALIASES = {
  reset: [
    "reset",
    "loadFixture",
    "seedFixture",
    "resetForTest",
  ],

  dispatch: [
    "dispatch",
    "send",
    "handleCommand",
    "execute",
  ],

  snapshot: [
    "snapshot",
    "getSnapshot",
    "inspect",
    "getState",
  ],

  telemetry: [
    "telemetry",
    "getTelemetry",
    "readTelemetry",
  ],

  outbound: [
    "outbound",
    "getOutbound",
    "getSentMessages",
  ],

  dispose: [
    "dispose",
    "close",
    "destroy",
  ],
} as const;

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(
    value &&
    typeof value === "object" &&
    !Array.isArray(value),
  );
}

function findMethod(
  source: UnknownRecord,
  aliases: readonly string[],
): UnknownFunction | null {
  for (const alias of aliases) {
    const candidate = source[alias];

    if (typeof candidate === "function") {
      return candidate.bind(source) as UnknownFunction;
    }
  }

  return null;
}

function resolveModuleSpecifier(
  modulePath: string,
): string {
  const isFilePath =
    modulePath.startsWith(".") ||
    modulePath.startsWith("/") ||
    modulePath.includes("\\") ||
    modulePath.endsWith(".ts") ||
    modulePath.endsWith(".js") ||
    modulePath.endsWith(".mjs") ||
    modulePath.endsWith(".cjs");

  if (!isFilePath) {
    return modulePath;
  }

  const absolutePath = path.isAbsolute(modulePath)
    ? modulePath
    : path.resolve(process.cwd(), modulePath);

  return pathToFileURL(absolutePath).href;
}

function isBlock20Adapter(
  value: unknown,
): value is Block20Adapter {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.reset === "function" &&
    typeof value.dispatch === "function" &&
    typeof value.snapshot === "function" &&
    typeof value.telemetry === "function" &&
    typeof value.outbound === "function"
  );
}

function normalizeAdapter(
  rawRuntime: unknown,
): Block20Adapter {
  if (isBlock20Adapter(rawRuntime)) {
    return rawRuntime;
  }

  if (!isRecord(rawRuntime)) {
    throw new Error(
      [
        "[B20_E001] O runtime não retornou um objeto.",
        "Exporte createBlock20Adapter() ou um runtime com métodos de teste.",
      ].join(" "),
    );
  }

  const possibleSources: UnknownRecord[] = [
    rawRuntime,
  ];

  if (isRecord(rawRuntime.testing)) {
    possibleSources.push(rawRuntime.testing);
  }

  if (isRecord(rawRuntime.block20Adapter)) {
    possibleSources.push(rawRuntime.block20Adapter);
  }

  for (const source of possibleSources) {
    const reset = findMethod(
      source,
      REQUIRED_METHOD_ALIASES.reset,
    );

    const dispatch = findMethod(
      source,
      REQUIRED_METHOD_ALIASES.dispatch,
    );

    const snapshot = findMethod(
      source,
      REQUIRED_METHOD_ALIASES.snapshot,
    );

    const telemetry = findMethod(
      source,
      REQUIRED_METHOD_ALIASES.telemetry,
    );

    const outbound = findMethod(
      source,
      REQUIRED_METHOD_ALIASES.outbound,
    );

    const dispose = findMethod(
      source,
      REQUIRED_METHOD_ALIASES.dispose,
    );

    if (
      reset &&
      dispatch &&
      snapshot &&
      telemetry &&
      outbound
    ) {
      return {
        async reset(fixture) {
          await reset(fixture);
        },

        async dispatch(command) {
          await dispatch(command);
        },

        async snapshot() {
          return await snapshot() as Awaited<
            ReturnType<Block20Adapter["snapshot"]>
          >;
        },

        async telemetry() {
          return await telemetry() as Awaited<
            ReturnType<Block20Adapter["telemetry"]>
          >;
        },

        async outbound() {
          return await outbound() as Awaited<
            ReturnType<Block20Adapter["outbound"]>
          >;
        },

        dispose: dispose
          ? async () => {
              await dispose();
            }
          : undefined,
      };
    }
  }

  throw new Error(
    [
      "[B20_E001] Nenhum contrato compatível foi encontrado.",
      "O módulo deve exportar createBlock20Adapter(),",
      "createIGentMindRuntime(), createRuntime()",
      "ou um objeto com reset, dispatch, snapshot, telemetry e outbound.",
    ].join(" "),
  );
}

export const createBlock20Sut: CreateBlock20Adapter =
  async () => {
    const configuredModule =
      process.env.IGENTMIND_RUNTIME_MODULE ??
      "src/igentmind/runtime/index.ts";

    const moduleSpecifier =
      resolveModuleSpecifier(configuredModule);

    const importedModule = await import(moduleSpecifier);

    const directAdapterFactory =
      importedModule.createBlock20Adapter;

    if (typeof directAdapterFactory === "function") {
      const adapter = await directAdapterFactory({
        testMode: true,
        suite: "block-20",
      });

      return normalizeAdapter(adapter);
    }

    const runtimeFactory =
      importedModule.createIGentMindRuntime ??
      importedModule.createRuntime ??
      importedModule.default;

    if (typeof runtimeFactory !== "function") {
      return normalizeAdapter(importedModule);
    }

    const runtime = await runtimeFactory({
      testMode: true,
      suite: "block-20",
      deterministic: true,
    });

    return normalizeAdapter(runtime);
  };
