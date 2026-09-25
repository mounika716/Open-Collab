const vm = require("vm");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const BLOCKED_JS_PATTERNS = [
  /\brequire\s*\(/i,
  /\bprocess\b/i,
  /\bchild_process\b/i,
  /\bfs\b/i,
  /\bpath\b/i,
  /\beval\s*\(/i,
  /\bFunction\s*\(/i,
  /\bWebAssembly\b/i,
  /\bimport\b/i,
  /\bfetch\s*\(/i,
];

const BLOCKED_PYTHON_PATTERNS = [
  /^\s*(import|from)\s+/im,
  /\b__import__\s*\(/i,
  /\bopen\s*\(/i,
  /\bos\./i,
  /\bsys\./i,
  /\bsubprocess\./i,
  /\bshutil\./i,
  /\bsocket\./i,
  /\bpathlib\./i,
  /\brequests\./i,
  /\bctypes\./i,
  /\bexec\s*\(/i,
  /\beval\s*\(/i,
  /\bcompile\s*\(/i,
  /\bglobals\s*\(/i,
  /\blocals\s*\(/i,
  /\binput\s*\(/i,
];

const deepEqual = (actual, expected) => {
  return JSON.stringify(actual) === JSON.stringify(expected);
};

const validateSource = (
  code,
  language
) => {
  const patterns =
    language === "python"
      ? BLOCKED_PYTHON_PATTERNS
      : BLOCKED_JS_PATTERNS;

  for (const pattern of patterns) {
    if (pattern.test(code)) {
      return {
        valid: false,
        message:
          "Restricted code detected. Remove system, file, network or dynamic execution access.",
      };
    }
  }

  return {
    valid: true,
  };
};

const executeJavaScriptTest = (
  code,
  functionName,
  input,
  expected
) => {
  const validation = validateSource(
    code,
    "javascript"
  );

  if (!validation.valid) {
    return {
      passed: false,
      error: validation.message,
    };
  }

  try {
    const context = {};

    vm.createContext(context);

    const script = `
      "use strict";

      ${code}

      if (typeof ${functionName} !== "function") {
        throw new Error(
          "Expected function '${functionName}' was not found."
        );
      }

      __result = ${functionName}(${JSON.stringify(input)});
    `;

    const compiled = new vm.Script(script);

    compiled.runInContext(context, {
      timeout: 1000,
      displayErrors: true,
    });

    return {
      passed: deepEqual(
        context.__result,
        expected
      ),
      actual: context.__result,
    };
  } catch (error) {
    return {
      passed: false,
      error:
        error.message ||
        "JavaScript runtime error",
    };
  }
};

const executePythonTest = (
  code,
  functionName,
  input,
  expected
) => {
  const validation = validateSource(
    code,
    "python"
  );

  if (!validation.valid) {
    return {
      passed: false,
      error: validation.message,
    };
  }

  const tempDirectory =
    fs.mkdtempSync(
      path.join(
        os.tmpdir(),
        "open-collab-python-"
      )
    );

  const solutionFile =
    path.join(
      tempDirectory,
      "solution.py"
    );

  const runnerFile =
    path.join(
      tempDirectory,
      "runner.py"
    );

  try {
    const runner = `
import json
import sys

${code}

if not callable(globals().get("${functionName}")):
    raise RuntimeError(
        "Expected function '${functionName}' was not found."
    )

payload = json.loads(sys.stdin.read())
result = ${functionName}(*payload)

print(json.dumps(result))
`;

    fs.writeFileSync(
      solutionFile,
      `${code}\n`,
      "utf8"
    );

    fs.writeFileSync(
      runnerFile,
      runner,
      "utf8"
    );

    const processResult =
      spawnSync(
        "python",
        [runnerFile],
        {
          input: JSON.stringify(input),
          cwd: tempDirectory,
          encoding: "utf8",
          timeout: 1200,
          windowsHide: true,
          env: {
            PYTHONIOENCODING:
              "utf-8",
            PATH:
              process.env.PATH || "",
          },
          maxBuffer:
            1024 * 1024,
        }
      );

    if (
      processResult.error
    ) {
      return {
        passed: false,
        error:
          processResult.error
            .message ||
          "Python execution failed",
      };
    }

    if (
      processResult.status !== 0
    ) {
      return {
        passed: false,
        error:
          processResult.stderr?.trim() ||
          "Python runtime error",
      };
    }

    const output =
      processResult.stdout?.trim();

    const actual =
      output === ""
        ? null
        : JSON.parse(output);

    return {
      passed: deepEqual(
        actual,
        expected
      ),
      actual,
    };
  } catch (error) {
    return {
      passed: false,
      error:
        error.message ||
        "Python execution error",
    };
  } finally {
    try {
      fs.rmSync(
        tempDirectory,
        {
          recursive: true,
          force: true,
        }
      );
    } catch {
      // Ignore temporary directory cleanup errors.
    }
  }
};

const evaluateCode = ({
  code,
  language = "javascript",
  functionName = "solution",
  visibleTests = [],
  hiddenTests = [],
}) => {
  if (
    typeof code !== "string" ||
    !code.trim()
  ) {
    return {
      score: 0,
      passedTests: 0,
      totalTests:
        visibleTests.length +
        hiddenTests.length,
      visibleResults: [],
      compileError:
        "Code cannot be empty.",
      runtimeError: "",
    };
  }

  const allTests = [
    ...visibleTests,
    ...hiddenTests,
  ];

  let passedTests = 0;

  const visibleResults = [];

  for (
    let index = 0;
    index < allTests.length;
    index += 1
  ) {
    const test =
      allTests[index];

    const result =
      language === "python"
        ? executePythonTest(
            code,
            functionName,
            test.input,
            test.expected
          )
        : executeJavaScriptTest(
            code,
            functionName,
            test.input,
            test.expected
          );

    if (result.passed) {
      passedTests += 1;
    }

    if (
      index < visibleTests.length
    ) {
      visibleResults.push({
        testNumber: index + 1,
        passed: result.passed,
        actual: result.actual,
        error: result.error || "",
      });
    }
  }

  const totalTests =
    allTests.length;

  const score =
    totalTests === 0
      ? 0
      : Math.round(
          (passedTests /
            totalTests) *
            100
        );

  return {
    score,
    passedTests,
    totalTests,
    visibleResults,
    compileError: "",
    runtimeError: "",
  };
};

module.exports = {
  evaluateCode,
};