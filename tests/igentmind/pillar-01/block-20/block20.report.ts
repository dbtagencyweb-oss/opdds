// tests/igentmind/pillar-01/block-20/block20.report.ts

import fs from "node:fs";
import path from "node:path";

import {
  SCENARIO_MATRIX,
} from "./block20.fixtures";

import {
  BLOCK20_ISSUE_CATALOG,
} from "./block20.audit";

interface AssertionResult {
  fullName?: string;
  title?: string;
  status?: string;
  failureMessages?: string[];
}

interface TestResult {
  assertionResults?: AssertionResult[];
}

interface VitestJsonReport {
  testResults?: TestResult[];
  numTotalTests?: number;
  numPassedTests?: number;
  numFailedTests?: number;
  numPendingTests?: number;
}

interface NormalizedTestResult {
  id: string | null;
  name: string;
  status: "passed" | "failed" | "skipped" | "unknown";
  failures: string[];
}

interface Block20Report {
  generatedAt: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    requiredJourneys: number;
    coveredJourneys: number;
  };

  journeyMatrix: Array<{
    id: string;
    title: string;
    area: string;
    status:
      | "passed"
      | "failed"
      | "skipped"
      | "not_found";
    expected: string[];
    failures: string[];
  }>;

  failures: Array<{
    testId: string | null;
    testName: string;
    messages: string[];
    probableIssueCodes: string[];
  }>;

  issueCatalog: typeof BLOCK20_ISSUE_CATALOG;
}

function extractTestId(
  name: string,
): string | null {
  const match = name.match(/\[(B20-[A-Z]\d+)\]/);

  return match?.[1] ?? null;
}

function normalizeStatus(
  status?: string,
): NormalizedTestResult["status"] {
  switch (status) {
    case "passed":
      return "passed";

    case "failed":
      return "failed";

    case "pending":
    case "skipped":
    case "todo":
      return "skipped";

    default:
      return "unknown";
  }
}

function normalizeResults(
  report: VitestJsonReport,
): NormalizedTestResult[] {
  return (
    report.testResults ?? []
  ).flatMap((testResult) =>
    (testResult.assertionResults ?? []).map(
      (assertion) => {
        const name =
          assertion.fullName ??
          assertion.title ??
          "unnamed test";

        return {
          id: extractTestId(name),
          name,
          status: normalizeStatus(assertion.status),
          failures: assertion.failureMessages ?? [],
        };
      },
    ),
  );
}

function inferIssueCodes(
  failures: string[],
): string[] {
  const joined = failures.join("\n");

  const explicitCodes =
    joined.match(/B20_E\d{3}/g) ?? [];

  const inferred: string[] = [];

  if (joined.includes("pillar_01_vinculo")) {
    inferred.push("B20_E002");
  }

  if (
    joined.includes("editorialOrigin") ||
    joined.includes("generationMode") ||
    joined.includes("contentOrigin")
  ) {
    inferred.push("B20_E003");
  }

  if (joined.includes("nextMove")) {
    inferred.push("B20_E004");
  }

  if (
    joined.includes("delta") ||
    joined.includes("Scale")
  ) {
    inferred.push("B20_E005", "B20_E006");
  }

  if (
    joined.includes("memory") ||
    joined.includes("consent")
  ) {
    inferred.push("B20_E007", "B20_E008");
  }

  if (
    joined.includes("telemetry") ||
    joined.includes("private")
  ) {
    inferred.push("B20_E009");
  }

  if (joined.includes("outbound")) {
    inferred.push("B20_E010");
  }

  if (joined.includes("questionCount")) {
    inferred.push("B20_E011");
  }

  if (joined.includes("visibleMoves")) {
    inferred.push("B20_E012");
  }

  if (
    joined.includes("confidence") ||
    joined.includes("authoritativeSource")
  ) {
    inferred.push("B20_E013", "B20_E014");
  }

  if (
    joined.includes("closure") ||
    joined.includes("complete")
  ) {
    inferred.push("B20_E015");
  }

  if (
    joined.includes("bookCursor") ||
    joined.includes("returnCursor")
  ) {
    inferred.push("B20_E016");
  }

  if (
    joined.includes("failClosed") ||
    joined.includes("inventedReplacement")
  ) {
    inferred.push("B20_E017");
  }

  if (
    joined.includes("safety") ||
    joined.includes("selectedPriority")
  ) {
    inferred.push("B20_E018");
  }

  return Array.from(
    new Set([...explicitCodes, ...inferred]),
  );
}

function main(): void {
  const sourcePath = path.resolve(
    process.cwd(),
    process.argv[2] ??
      "artifacts/block20-vitest.json",
  );

  const outputPath = path.resolve(
    process.cwd(),
    process.argv[3] ??
      "artifacts/block20-report.json",
  );

  if (!fs.existsSync(sourcePath)) {
    throw new Error(
      `Relatório do Vitest não encontrado: ${sourcePath}`,
    );
  }

  const raw = fs.readFileSync(sourcePath, "utf8");

  const vitestReport = JSON.parse(
    raw,
  ) as VitestJsonReport;

  const tests = normalizeResults(vitestReport);

  const resultById = new Map(
    tests
      .filter(
        (
          item,
        ): item is NormalizedTestResult & {
          id: string;
        } => Boolean(item.id),
      )
      .map((item) => [item.id, item]),
  );

  const journeyMatrix: Block20Report["journeyMatrix"] =
    SCENARIO_MATRIX.map((scenario) => {
      const test = resultById.get(scenario.id);

      return {
        id: scenario.id,
        title: scenario.title,
        area: scenario.area,
        status:
          test?.status === "unknown"
            ? "failed"
            : test?.status ?? "not_found",
        expected: [...scenario.expected],
        failures: test?.failures ?? [],
      };
    });

  const failedTests = tests.filter(
    (test) => test.status === "failed",
  );

  const report: Block20Report = {
    generatedAt: new Date().toISOString(),

    summary: {
      total: tests.length,
      passed: tests.filter(
        (test) => test.status === "passed",
      ).length,
      failed: failedTests.length,
      skipped: tests.filter(
        (test) => test.status === "skipped",
      ).length,
      requiredJourneys: SCENARIO_MATRIX.length,
      coveredJourneys: journeyMatrix.filter(
        (item) => item.status !== "not_found",
      ).length,
    },

    journeyMatrix,

    failures: failedTests.map((test) => ({
      testId: test.id,
      testName: test.name,
      messages: test.failures,
      probableIssueCodes: inferIssueCodes(
        test.failures,
      ),
    })),

    issueCatalog: BLOCK20_ISSUE_CATALOG,
  };

  fs.mkdirSync(
    path.dirname(outputPath),
    {
      recursive: true,
    },
  );

  fs.writeFileSync(
    outputPath,
    JSON.stringify(report, null, 2),
    "utf8",
  );

  process.stdout.write(
    [
      "",
      "BLOCO 20 — RELATÓRIO GERADO",
      `Total: ${report.summary.total}`,
      `Aprovados: ${report.summary.passed}`,
      `Falhos: ${report.summary.failed}`,
      `Ignorados: ${report.summary.skipped}`,
      `Jornadas cobertas: ${report.summary.coveredJourneys}/${report.summary.requiredJourneys}`,
      `Arquivo: ${outputPath}`,
      "",
    ].join("\n"),
  );
}

main();
