# Command: /test

## Trigger
The command is triggered when user says: `/test`, `test`, `/test [action] [target]`, `/test [level] [target]`, or variations like "test the card composer", "create tests for story-fetcher", "run level 3 tests"

## Purpose
**COMPREHENSIVE TESTING MANDATE**: Create, run, and manage tests for mechanisms. This command ensures ALL implementations are properly tested through three testing levels: quick verification, code tests, and final phase integration tests. **ALL tests MUST be created using this command** - no test files should be created manually.

## Critical Rules

### Rule 1: Mandatory Test Creation
- **NEVER** create test files manually - always use `/test create`
- **ALWAYS** create tests when implementing new functionality
- **ALWAYS** test existing functionality before modifying
- Tests are **REQUIRED** for all mechanisms and components

### Rule 2: Three Testing Levels
Every implementation must have tests at all three levels:
- **Level 1 (Quick Verification)**: Fast sanity checks, basic functionality verification
- **Level 2 (Code Tests)**: Independent function/unit tests with comprehensive reporting
- **Level 3 (Final Phase)**: In-situ integration tests with screenshots, test parameters, and full environment testing

### Rule 3: Test File Organization (AI-Optimized)
- **Location**: `tests/` directory at project root (`client_web2/tests/`)
- **Naming Pattern**: `[mechanism]-[level]-[test-name].test.ts` (e.g., `database-manager-level1-basic-crud.test.ts`)
- **Parameters**: `[mechanism]-[level]-[test-name].params.json` (JSON format for AI parsing)
- **Results**: `plans/reports/tests/[mechanism]/[timestamp]/`
- **Screenshots**: `plans/reports/tests/[mechanism]/[timestamp]/screenshots/`

### Rule 4: Test Results Storage
- All test results stored in `plans/reports/tests/`
- Organized by mechanism and timestamp for easy reference
- Screenshots stored in subdirectory for Level 3 tests
- Results include JSON reports for AI parsing

### Rule 5: Input/Output Verification (CRITICAL)
- **MANDATORY**: All test reports MUST include:
  - **Test Inputs**: What parameters/data were passed to functions/APIs
  - **Expected Outputs**: What the test expects to receive
  - **Actual Outputs**: What was actually returned/received
  - **Assertion Details**: Every assertion made (type, expected, actual, pass/fail)
  - **Verification**: Clear statement of whether actual matches expected
- **Purpose**: Without input/output verification, tests are meaningless - you can't verify correctness
- **Quality Check**: Reports must show that tests have meaningful assertions, not just "it runs"
- **Failure Analysis**: Failed tests must show clear diffs between expected and actual outputs

### Rule 6: Real Data Testing Requirement (CRITICAL)
- **MANDATORY**: Testing with ONLY mock data is **INCOMPLETE** and **NOT ACCEPTABLE**
- **Real Data Requirement**: All mechanisms that interact with external systems (APIs, databases, services) MUST be tested with real data
- **Why This Matters**: 
  - Mock data only validates assumptions, not actual behavior
  - Real systems may return unexpected data structures, edge cases, or errors
  - Mock data cannot catch integration issues, network problems, or API changes
  - Example: Story fetcher tested with only mock data will only verify assumptions about API responses, not actual API behavior
- **Level 2 Clarification**: 
  - Level 2 tests may use mocks for isolation and speed during development
  - **BUT**: Level 2 tests with only mocks are NOT sufficient for completion
  - Level 2 tests should be supplemented with real data tests or Level 3 tests must use real data
- **Level 3 Requirement**: 
  - **MUST** use real APIs, real databases, real services
  - **MUST** test actual data structures returned by external systems
  - **MUST** verify actual network behavior, error handling, and edge cases
  - **MUST NOT** use mocks for external system interactions
- **Test Report Warnings**: 
  - Test reports MUST clearly indicate when only mock data was used
  - Reports MUST include a warning: "⚠️ WARNING: Tests used only mock data. Testing is INCOMPLETE until real data testing is performed."
  - Reports MUST NOT mark tests as "complete" if only mock data was used
- **Completion Criteria**: 
  - Tests are only considered complete when:
    1. Level 1 tests pass (may use mocks for speed)
    2. Level 2 tests pass (may use mocks for isolation)
    3. **Level 3 tests pass with REAL DATA** (mandatory for completion)
  - If Level 3 tests are skipped or use mocks, testing is INCOMPLETE

### Rule 7: Port Detection (CRITICAL - NO ASSUMPTIONS)
- **FORBIDDEN**: **NEVER** assume default ports (3000, 5173, 8080, etc.)
- **FORBIDDEN**: **NEVER** hardcode port numbers in tests
- **MANDATORY**: **ALWAYS** detect the actual running port before testing
- **MANDATORY**: **ALWAYS** check what port the dev server is actually running on
- **How to detect port**:
  1. Check `package.json` scripts for dev server command
  2. Check `vite.config.ts` or build config for configured port
  3. **MOST IMPORTANT**: Check running processes or ask user what port is active
  4. **MOST IMPORTANT**: Use browser MCP tools to navigate to actual running URL
  5. If port cannot be determined: **ASK USER** - do not guess
- **Failure handling**: If port cannot be detected, report error and ask user for correct port
- **Why this matters**: Default ports often don't match actual running ports, causing all tests to fail

## Context
Use this command when:
- User wants to create tests for a mechanism or component
- User wants to run tests for a specific mechanism
- User wants to run tests at a specific level
- User wants to verify implementation correctness
- User wants to check test coverage
- User wants to run tests before committing changes
- **ANY time tests need to be created**

## Action Types

### `/test create [target] [level?]`
Create new test files for a target. If level not specified, creates tests for all three levels.

### `/test run [target] [level?]`
Run existing tests. If level not specified, runs all levels sequentially.

### `/test [target]` (default)
Shorthand for `/test run [target]` - runs all tests for target.

### `/test level[1|2|3] [target]`
Run tests at specific level only.

## Testing Levels

### Level 1: Quick Verification Tests
**Purpose**: Fast sanity checks and basic functionality verification
- **Speed**: Must complete in < 5 seconds per test
- **Scope**: Basic functionality, happy paths, critical paths
- **Isolation**: Can run independently, minimal setup
- **Reporting**: Simple pass/fail with basic error messages
- **When to use**: After every implementation change, before committing

**Example Test Names**:
- `database-manager-level1-basic-crud.test.ts`
- `story-fetcher-level1-fetch-success.test.ts`
- `card-composer-level1-transform-basic.test.ts`

### Level 2: Code Tests (Unit/Function Tests)
**Purpose**: Comprehensive independent function testing with detailed reporting
- **Speed**: Can take longer, focus on thoroughness
- **Scope**: All functions, edge cases, error handling, boundary conditions
- **Isolation**: Fully independent, mock dependencies, no external services
- **Reporting**: Detailed reports with function coverage, input/output validation, error analysis
- **When to use**: During development, before integration, for debugging
- **⚠️ IMPORTANT**: Level 2 tests may use mocks for isolation, but **testing is INCOMPLETE if only mock data is used**. Level 3 tests MUST use real data to complete testing.

**Example Test Names**:
- `database-manager-level2-migration-tests.test.ts`
- `story-fetcher-level2-error-handling.test.ts`
- `card-composer-level2-all-variants.test.ts`

**Requirements**:
- Test all exported functions
- Test all error paths
- Test boundary conditions
- Generate coverage reports
- Validate input/output types
- Report execution time per test

### Level 3: Final Phase Tests (Integration Tests)
**Purpose**: In-situ testing with real environment, screenshots, and comprehensive test parameters
- **Speed**: Can be slow, tests real integration
- **Scope**: Full integration, real APIs, real database, real UI rendering
- **Environment**: Real or production-like environment
- **Reporting**: Screenshots, test parameters, environment details, performance metrics
- **When to use**: Before deployment, after major changes, for validation
- **⚠️ CRITICAL**: Level 3 tests **MUST** use real data. Testing is **INCOMPLETE** if Level 3 tests use mocks or are skipped.

**Example Test Names**:
- `database-manager-level3-integration.test.ts`
- `story-fetcher-level3-api-integration.test.ts`
- `card-composer-level3-ui-rendering.test.ts`

**Requirements**:
- **MANDATORY**: Test in real environment (or production-like) with REAL DATA
- **MANDATORY**: Test actual API calls and responses (NO MOCKS for external systems)
- **MANDATORY**: Test actual database operations (NO MOCKS for database)
- **MANDATORY**: Test actual UI rendering and interactions (NO MOCKS for UI)
- **FORBIDDEN**: Using mocks for external systems, APIs, databases, or services
- Capture screenshots at key points
- Use test parameters from JSON files
- Report performance metrics
- Document environment configuration
- **Verification**: Test reports MUST clearly indicate that real data was used

## Execution Steps

### Step 1: Parse Command and Action
- **Action**: Parse user input to determine action and target
  - Parse action: `create`, `run`, or default (run)
  - Parse target: mechanism name, component name, or "all"
  - Parse level: `level1`, `level2`, `level3`, or `all`
  - Parse test name: specific test name (optional)
- **Verification**: Command parsed correctly
- **On Success**: Proceed to Step 2
- **On Failure**: Ask for clarification

### Step 2: Identify Test Target
- **Action**: Determine what to test
  - If target specified: Use that target (e.g., "story-fetcher", "card-composer")
  - If "all": Test all mechanisms
  - Check if implementation exists for target
  - Check mechanism README.md for test requirements
  - Check existing test files in `tests/` directory
- **Verification**: Test target is valid and exists
- **On Success**: Proceed to Step 3
- **On Failure**: Report error with suggestions

### Step 3: Action-Specific Execution

#### For `create` Action:
- **Action**: Create test files
  - Analyze target implementation to determine test requirements
  - Determine what functions/components need testing
  - For Level 3: Analyze what test parameters are needed
  - Create test files following naming convention
  - Create parameter JSON files for Level 3 tests
  - Generate test structure based on implementation
- **Verification**: Test files created successfully
- **On Success**: Proceed to Step 4
- **On Failure**: Report creation errors

#### For `run` Action:
- **Action**: Run existing tests with input/output capture
  - Discover test files matching target pattern
  - Filter by level if specified
  - Execute tests in order: Level 1 → Level 2 → Level 3
  - **CRITICAL**: Use Vitest JSON reporter or custom reporter to capture:
    - Test execution output (stdout/stderr)
    - Assertion failures with expected/actual values
    - Test context (test name, file, line numbers)
  - **CRITICAL**: Parse test code to extract:
    - Function call arguments (inputs)
    - Expected values from assertions (expectedOutputs)
    - Actual values from assertion errors (actualOutputs)
    - Assertion types and results
  - Capture all output and results
- **Verification**: Test execution completes AND input/output data captured
- **On Success**: Proceed to Step 4
- **On Failure**: Capture error details

### Step 4: Execute Tests
- **Action**: Run the test suite with full input/output capture
  - **Level 1**: Run quick verification tests
    - Execute tests with timeout (5s per test)
    - **CRITICAL**: Capture test inputs (function parameters, test data)
    - **CRITICAL**: Capture expected outputs (what test expects)
    - **CRITICAL**: Capture actual outputs (what function returned)
    - **CRITICAL**: Capture assertion details (what was compared, how)
    - Capture pass/fail status
    - Capture basic error messages
  - **Level 2**: Run code tests
    - Execute independent function tests
    - Generate coverage reports
    - **CRITICAL**: Capture test inputs for each function call
    - **CRITICAL**: Capture expected outputs for each assertion
    - **CRITICAL**: Capture actual outputs from each function call
    - **CRITICAL**: Capture all assertion details (expect().toBe(), expect().toEqual(), etc.)
    - Validate input/output
  - **Level 3**: Run final phase tests
    - **CRITICAL PORT DETECTION**: Before running Level 3 tests:
      - **DO NOT** assume port (3000, 5173, 8080, etc.)
      - **MUST** detect actual running port:
        1. Check package.json scripts for dev server
        2. Check vite.config.ts for configured port
        3. **MOST IMPORTANT**: Check what port is actually running (ask user if needed)
        4. Use browser MCP tools to navigate to actual URL
      - If port cannot be determined: **ASK USER** - do not proceed with assumed port
    - Load test parameters from JSON files
    - Execute in real environment using **ACTUAL DETECTED PORT**
    - **CRITICAL**: Capture API request inputs (endpoints, parameters, headers)
    - **CRITICAL**: Capture API response outputs (status, data, errors)
    - **CRITICAL**: Capture expected API responses
    - **CRITICAL**: Capture database operation inputs and outputs
    - **CRITICAL**: Capture UI state before/after interactions
    - Capture screenshots at key points
    - Test actual API calls
    - Test actual database operations
    - Test actual UI rendering
- **Verification**: Test execution completes (success or failure) AND all input/output data captured
- **On Success**: Proceed to Step 5
- **On Failure**: Capture error details and proceed to error handling

### Step 5: Capture Results and Screenshots
- **Action**: Save test results and artifacts
  - Create results directory: `plans/reports/tests/[mechanism]/[timestamp]/`
  - Save test output as JSON: `test-results.json`
  - Save summary report: `test-summary.md`
  - **Level 3 only**: Save screenshots to `screenshots/` subdirectory
  - Save test parameters used: `test-params.json`
  - Save environment details: `environment.json`
- **Verification**: Results saved successfully
- **On Success**: Proceed to Step 6
- **On Failure**: Report save errors

### Step 6: Analyze Results
- **Action**: Analyze test output with input/output validation
  - Parse test results (passed, failed, skipped) by level
  - **CRITICAL**: Extract and structure test inputs from each test
  - **CRITICAL**: Extract and structure expected outputs from each test
  - **CRITICAL**: Extract and structure actual outputs from each test
  - **CRITICAL**: Extract assertion details (comparison type, expected vs actual)
  - **CRITICAL**: Detect mock data usage:
    - Check if Level 3 tests used mocks for external systems (APIs, databases, services)
    - Check if test data is clearly mock data (hardcoded, predictable patterns, no network calls)
    - Flag tests that only use mock data
    - Identify which tests need real data testing
  - Identify failed tests and error messages
  - **For failed tests**: Compare expected vs actual outputs to identify discrepancies
  - **For passed tests**: Verify that actual outputs match expected outputs
  - Check test coverage (Level 2)
  - Analyze screenshot results (Level 3)
  - Identify patterns in failures
  - Check for flaky tests
  - Calculate performance metrics (Level 3)
  - **Validate test quality**: Ensure tests have meaningful assertions (not just "it runs")
  - **Validate real data usage**: Ensure Level 3 tests used real data, not mocks
- **Verification**: Results are parsed correctly AND input/output data is structured
- **On Success**: Proceed to Step 7
- **On Failure**: Report parsing error

### Step 7: Generate Comprehensive Report
- **Action**: Create detailed test report with full input/output verification data
  - **Generate test-results.json**: Complete machine-readable results
    - Test execution metadata (timestamp, duration, command used)
    - Results by level (Level 1, 2, 3)
    - For each test: 
      - name, status (passed/failed/skipped), duration, error details
      - **CRITICAL**: inputs (function parameters, test data, API request details)
      - **CRITICAL**: expectedOutputs (what the test expects to receive)
      - **CRITICAL**: actualOutputs (what was actually returned/received)
      - **CRITICAL**: assertions (array of assertion details: type, expected, actual, passed)
      - **CRITICAL**: inputOutputMatch (boolean: does actual match expected?)
    - Coverage data (Level 2): line, function, branch, statement coverage
    - Performance metrics (Level 3): API response times, render times, memory usage
    - Screenshot references (Level 3): paths and descriptions
    - Test parameters used
    - Environment details
    - **CRITICAL**: Real data usage status:
      - `realDataUsed`: boolean indicating if real data was used in Level 3 tests
      - `mockDataOnly`: boolean indicating if only mock data was used
      - `level3TestsPresent`: boolean indicating if Level 3 tests exist
      - `level3TestsSkipped`: boolean indicating if Level 3 tests were skipped
      - `testingComplete`: boolean indicating if testing is complete (only true if Level 3 tests passed with real data)
      - `warnings`: array of warnings about incomplete testing
  - **Generate test-summary.md**: Human-readable comprehensive report
    - Executive summary (overall status, pass/fail counts)
    - Results breakdown by level
    - **For each test**:
      - Test name and status
      - **Inputs section**: What was tested (function parameters, API endpoints, etc.)
      - **Expected section**: What was expected (expected return values, API responses, etc.)
      - **Actual section**: What was actually received (actual return values, API responses, etc.)
      - **Assertions section**: Detailed list of all assertions made:
        - Assertion type (toBe, toEqual, toContain, etc.)
        - Expected value
        - Actual value
        - Pass/fail status
        - For failures: clear diff showing what differs
      - **Verification**: Clear statement of whether actual matches expected
    - Failed tests with full error details, stack traces, AND input/output comparison
    - Coverage summary (Level 2)
    - Performance analysis (Level 3)
    - Screenshot gallery with descriptions (Level 3)
    - **Test Quality Assessment**: 
      - Tests with meaningful assertions vs tests that just run
      - Tests missing input/output verification
      - Recommendations for improving test quality
    - **Real Data Testing Status** (CRITICAL):
      - **MANDATORY**: Report whether Level 3 tests used real data or mocks
      - **MANDATORY**: If only mock data was used, include prominent warning:
        - "⚠️ **WARNING: Tests used only mock data. Testing is INCOMPLETE until real data testing is performed.**"
        - "⚠️ **Testing cannot be considered complete if only mock data is used.**"
        - "⚠️ **Mock data only validates assumptions, not actual system behavior.**"
      - **MANDATORY**: If Level 3 tests are skipped or missing, include warning:
        - "⚠️ **WARNING: Level 3 tests (real data integration tests) are missing or skipped. Testing is INCOMPLETE.**"
      - **Completion Status**: Only mark tests as "complete" if Level 3 tests passed with real data
      - List which tests need real data testing
      - Provide guidance on how to add real data tests
    - Recommendations and next steps
    - Links to detailed JSON data
  - **Save both files** to `plans/reports/tests/[mechanism]/[timestamp]/`
- **Verification**: Report files created and contain all data INCLUDING input/output verification
- **On Success**: Proceed to Step 8
- **On Failure**: Report partial results with error details

### Step 8: Document Failures and Update Comments
- **Action**: Document any test failures
  - List failed test names by level
  - Include error messages and stack traces
  - Include screenshot references for Level 3 failures
  - Suggest potential fixes
  - Check mechanism COMMENTS.md for known issues
  - Update mechanism COMMENTS.md if new issue discovered
  - Update test results in reports directory
- **Verification**: Failures are documented
- **On Success**: Command complete
- **On Failure**: Report documentation issues

## Test File Structure

### Test File Naming Convention
```
tests/
├── [mechanism]-level1-[test-name].test.ts
├── [mechanism]-level2-[test-name].test.ts
├── [mechanism]-level3-[test-name].test.ts
└── [mechanism]-level3-[test-name].params.json
```

### Test Results Structure
```
plans/reports/tests/
└── [mechanism]/
    └── [timestamp]/
        ├── test-results.json          # Complete machine-readable results
        ├── test-summary.md            # Comprehensive human-readable report
        ├── test-params.json           # Test parameters used
        ├── environment.json           # Environment configuration
        └── screenshots/ (Level 3 only)
            ├── screenshot-001.png
            ├── screenshot-002.png
            └── ...
```

### Report Contents

#### test-results.json Structure
```json
{
  "metadata": {
    "timestamp": "2026-01-06T13:34:00Z",
    "mechanism": "database-manager",
    "command": "/test run database-manager all",
    "duration": {
      "total": 12.3,
      "level1": 2.1,
      "level2": 8.5,
      "level3": 1.7
    },
    "environment": {
      "nodeVersion": "v20.x.x",
      "testFramework": "vitest@4.0.15",
      "os": "Windows 10"
    }
  },
  "results": {
    "level1": {
      "total": 6,
      "passed": 6,
      "failed": 0,
      "skipped": 0,
      "tests": [
        {
          "name": "should set and get a single item",
          "status": "passed",
          "duration": 0.023,
          "file": "tests/database-manager-level1-basic-crud.test.ts",
          "inputs": {
            "namespace": "test",
            "key": "item1",
            "value": { "id": 1, "name": "Test Item" }
          },
          "expectedOutputs": {
            "getResult": { "id": 1, "name": "Test Item" }
          },
          "actualOutputs": {
            "getResult": { "id": 1, "name": "Test Item" }
          },
          "assertions": [
            {
              "type": "toEqual",
              "description": "get() should return the value that was set",
              "expected": { "id": 1, "name": "Test Item" },
              "actual": { "id": 1, "name": "Test Item" },
              "passed": true
            }
          ],
          "inputOutputMatch": true
        }
      ]
    },
    "level2": {
      "total": 15,
      "passed": 14,
      "failed": 1,
      "skipped": 0,
      "coverage": {
        "lines": 87.5,
        "functions": 92.3,
        "branches": 85.1,
        "statements": 88.2
      },
      "tests": [
        {
          "name": "should handle concurrent sets",
          "status": "passed",
          "duration": 0.145
        },
        {
          "name": "should handle memory leaks",
          "status": "failed",
          "duration": 0.089,
          "inputs": {
            "operations": 100,
            "operationType": "set",
            "namespace": "test"
          },
          "expectedOutputs": {
            "memoryDelta": "< 1MB",
            "finalMemoryUsage": "< 50MB"
          },
          "actualOutputs": {
            "memoryDelta": "2.6MB",
            "finalMemoryUsage": "52.8MB",
            "beforeMemory": "45.2MB",
            "afterMemory": "47.8MB"
          },
          "assertions": [
            {
              "type": "toBeLessThan",
              "description": "Memory delta should be less than 1MB",
              "expected": "< 1MB",
              "actual": "2.6MB",
              "passed": false,
              "diff": "Expected memory delta < 1MB, but got 2.6MB (1.6MB over limit)"
            }
          ],
          "inputOutputMatch": false,
          "error": {
            "message": "Memory leak detected after 100 operations",
            "stack": "...",
            "file": "tests/database-manager-level2-comprehensive.test.ts",
            "line": 234
          }
        }
      ]
    },
    "level3": {
      "total": 3,
      "passed": 2,
      "failed": 1,
      "skipped": 0,
      "performance": {
        "averageApiResponseTime": 245,
        "averageRenderTime": 89,
        "memoryUsage": {
          "before": 45.2,
          "after": 47.8,
          "delta": 2.6
        }
      },
      "screenshots": [
        {
          "path": "screenshots/screenshot-001.png",
          "description": "Initial page load",
          "timestamp": "2026-01-06T13:34:05Z"
        }
      ],
      "tests": [
        {
          "name": "should render carousel correctly",
          "status": "failed",
          "duration": 1.234,
          "inputs": {
            "apiEndpoint": "https://api.example.com/graphql",
            "query": "query { posts(first: 10) { edges { node { id title } } } }",
            "expectedCards": 10,
            "timeout": 5000
          },
          "expectedOutputs": {
            "cardsRendered": 10,
            "cardIds": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
            "apiResponseStatus": 200,
            "apiResponseData": { "posts": { "edges": [/* 10 items */] } }
          },
          "actualOutputs": {
            "cardsRendered": 4,
            "cardIds": ["1", "2", "3", "4"],
            "apiResponseStatus": 200,
            "apiResponseData": { "posts": { "edges": [/* 4 items */] } },
            "renderTime": 1234,
            "missingCards": ["5", "6", "7", "8", "9", "10"]
          },
          "assertions": [
            {
              "type": "toBe",
              "description": "All 10 cards should be rendered",
              "expected": 10,
              "actual": 4,
              "passed": false,
              "diff": "Expected 10 cards, but only 4 were rendered. Missing cards: 5, 6, 7, 8, 9, 10"
            },
            {
              "type": "toContain",
              "description": "Card 5 should be present",
              "expected": "5",
              "actual": ["1", "2", "3", "4"],
              "passed": false,
              "diff": "Expected card IDs to contain '5', but array only contains [1, 2, 3, 4]"
            }
          ],
          "inputOutputMatch": false,
          "screenshots": ["screenshots/screenshot-003.png"],
          "error": {
            "message": "Card 5 not rendered after 5 seconds",
            "screenshot": "screenshots/screenshot-003.png"
          }
        }
      ]
    }
  },
  "summary": {
    "overall": {
      "total": 24,
      "passed": 22,
      "failed": 2,
      "skipped": 0,
      "passRate": 91.7
    },
    "realDataTesting": {
      "realDataUsed": true,
      "mockDataOnly": false,
      "level3TestsPresent": true,
      "level3TestsSkipped": false,
      "testingComplete": false,
      "warnings": [
        "Level 3 tests failed - testing incomplete until all Level 3 tests pass with real data"
      ]
    },
    "recommendations": [
      "Fix memory leak in concurrent operations",
      "Investigate card rendering delay in Level 3 test"
    ]
  }
}
```

#### test-summary.md Structure
```markdown
# Test Report: database-manager
**Generated:** 2026-01-06T13:34:00Z  
**Command:** /test run database-manager all  
**Duration:** 12.3s

## Executive Summary

- **Overall Status:** ⚠️ Partial Failure
- **Total Tests:** 24
- **Passed:** 22 (91.7%)
- **Failed:** 2 (8.3%)
- **Skipped:** 0

## Real Data Testing Status

- **Real Data Used:** ✅ Yes (Level 3 tests used real APIs and databases)
- **Mock Data Only:** ❌ No
- **Level 3 Tests Present:** ✅ Yes
- **Level 3 Tests Skipped:** ❌ No
- **Testing Complete:** ❌ No (Level 3 tests must all pass for completion)
- **Status:** ⚠️ Testing incomplete - Level 3 tests failed. All Level 3 tests must pass with real data for testing to be considered complete.

## Results by Level

### Level 1: Quick Verification ✅
- **Status:** All Passed
- **Tests:** 6/6 passed
- **Duration:** 2.1s
- **Details:** All basic CRUD operations working correctly

**Test Details:**

1. **should set and get a single item** ✅
   - **Inputs:**
     - Namespace: `"test"`
     - Key: `"item1"`
     - Value: `{ "id": 1, "name": "Test Item" }`
   - **Expected Output:**
     - get() should return: `{ "id": 1, "name": "Test Item" }`
   - **Actual Output:**
     - get() returned: `{ "id": 1, "name": "Test Item" }`
   - **Assertions:**
     - ✅ `expect(getResult).toEqual({ id: 1, name: "Test Item" })` - PASSED
   - **Verification:** ✅ Actual output matches expected output

### Level 2: Code Tests ⚠️
- **Status:** 1 Failure
- **Tests:** 14/15 passed (93.3%)
- **Duration:** 8.5s
- **Coverage:** 87.5% lines, 92.3% functions, 85.1% branches
- **Failures:**
  1. **should handle memory leaks** ❌
     - **Inputs:**
       - Operations: 100
       - Operation Type: `"set"`
       - Namespace: `"test"`
     - **Expected Outputs:**
       - Memory Delta: `< 1MB`
       - Final Memory Usage: `< 50MB`
     - **Actual Outputs:**
       - Memory Delta: `2.6MB` ❌
       - Final Memory Usage: `47.8MB` ✅
       - Before Memory: `45.2MB`
       - After Memory: `47.8MB`
     - **Assertions:**
       - ❌ `expect(memoryDelta).toBeLessThan(1MB)` - FAILED
         - Expected: `< 1MB`
         - Actual: `2.6MB`
         - **Diff:** Expected memory delta < 1MB, but got 2.6MB (1.6MB over limit)
       - ✅ `expect(finalMemoryUsage).toBeLessThan(50MB)` - PASSED
     - **Verification:** ❌ Actual output does NOT match expected output
     - Error: Memory leak detected after 100 operations
     - File: `tests/database-manager-level2-comprehensive.test.ts:234`
     - Stack trace: [full stack trace]

### Level 3: Final Phase ⚠️
- **Status:** 1 Failure
- **Tests:** 2/3 passed (66.7%)
- **Duration:** 1.7s
- **Performance:**
  - Average API Response Time: 245ms
  - Average Render Time: 89ms
  - Memory Usage: +2.6MB
- **Failures:**
  1. **should render carousel correctly** ❌
     - **Inputs:**
       - API Endpoint: `https://api.example.com/graphql`
       - Query: `query { posts(first: 10) { edges { node { id title } } } }`
       - Expected Cards: `10`
       - Timeout: `5000ms`
     - **Expected Outputs:**
       - Cards Rendered: `10`
       - Card IDs: `["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]`
       - API Response Status: `200`
       - API Response Data: `{ posts: { edges: [/* 10 items */] } }`
     - **Actual Outputs:**
       - Cards Rendered: `4` ❌
       - Card IDs: `["1", "2", "3", "4"]` ❌
       - API Response Status: `200` ✅
       - API Response Data: `{ posts: { edges: [/* 4 items */] } }` ❌
       - Render Time: `1234ms`
       - Missing Cards: `["5", "6", "7", "8", "9", "10"]`
     - **Assertions:**
       - ❌ `expect(cardsRendered).toBe(10)` - FAILED
         - Expected: `10`
         - Actual: `4`
         - **Diff:** Expected 10 cards, but only 4 were rendered. Missing cards: 5, 6, 7, 8, 9, 10
       - ❌ `expect(cardIds).toContain("5")` - FAILED
         - Expected: `"5"` to be in array
         - Actual: `["1", "2", "3", "4"]`
         - **Diff:** Expected card IDs to contain '5', but array only contains [1, 2, 3, 4]
     - **Verification:** ❌ Actual output does NOT match expected output
     - Error: Card 5 not rendered after 5 seconds
     - Screenshot: `screenshots/screenshot-003.png`
     - Duration: 1.234s

## Screenshots (Level 3)

1. **Initial page load** (`screenshot-001.png`)
   - Captured at: 2026-01-06T13:34:05Z
   - Description: Page loaded successfully

2. **After API call** (`screenshot-002.png`)
   - Captured at: 2026-01-06T13:34:06Z
   - Description: Data fetched and displayed

3. **Failure state** (`screenshot-003.png`)
   - Captured at: 2026-01-06T13:34:09Z
   - Description: Card 5 missing from render

## Test Quality Assessment

### Tests with Meaningful Assertions ✅
- All Level 1 tests: ✅ Input/output verification present
- All Level 2 tests: ✅ Input/output verification present
- Level 3 tests: ✅ Input/output verification present

### Tests Requiring Improvement ⚠️
- None identified in this run

### Recommendations for Test Quality
- All tests include proper input/output verification
- All assertions are meaningful and verifiable
- Failed tests provide clear diffs showing what differs

## Recommendations

1. **Fix memory leak in concurrent operations**
   - Priority: High
   - Location: `DatabaseManager.queueOperation()`
   - Action: Review operation queue cleanup logic
   - **Evidence**: Memory delta 2.6MB exceeds 1MB limit (see test inputs/outputs above)

2. **Investigate card rendering delay**
   - Priority: Medium
   - Location: Level 3 integration test
   - Action: Check carousel rendering logic and timing
   - **Evidence**: Only 4 cards rendered instead of 10 (see test inputs/outputs above)

## Detailed Data

For complete machine-readable results, see:
- `test-results.json` - Full test data
- `test-params.json` - Test parameters used
- `environment.json` - Environment details
```

## Test Parameter Format (JSON)

For Level 3 tests, parameters are stored in JSON files for AI efficiency:

```json
{
  "testName": "story-fetcher-api-integration",
  "level": 3,
  "mechanism": "story-fetcher",
  "environment": {
    "apiUrl": "https://api.example.com/graphql",
    "timeout": 30000,
    "retries": 3
  },
  "testCases": [
    {
      "name": "fetch-recent-stories",
      "query": "query { posts { edges { node { id title } } } }",
      "expectedMinResults": 10,
      "screenshotPoints": ["before-request", "after-response"]
    }
  ],
  "screenshotConfig": {
    "format": "png",
    "fullPage": true,
    "capturePoints": ["before", "after", "error"]
  }
}
```

## Pre-requisites
- [ ] Test framework installed (Vitest)
- [ ] Test environment configured (setupTests.ts)
- [ ] Dependencies installed
- [ ] Screenshot capture library installed (for Level 3)
- [ ] Test results directory exists or can be created
- [ ] No conflicting test processes running
- [ ] **CRITICAL**: Test execution configured to capture:
  - Function call inputs (parameters, test data)
  - Function return values (actual outputs)
  - Expected values from assertions
  - Assertion results (pass/fail with diffs)
  - API request/response data (Level 3)
  - Database operation inputs/outputs (Level 3)

## Verification Steps
1. Command parsed correctly
2. Test target identified
3. Test files exist (for run) or created (for create)
4. Test suite executes without errors
5. Test results are parseable
6. Results saved to reports directory
7. Screenshots captured (Level 3)
8. Results accurately reported

## Success Criteria
- [ ] Command parsed correctly
- [ ] Test target identified
- [ ] Tests created (if create action) or found (if run action)
- [ ] Test suite executed
- [ ] Results analyzed by level
- [ ] **Full comprehensive report generated** (`test-results.json` and `test-summary.md`)
- [ ] **Real data usage detected and reported** (mock data usage flagged if present)
- [ ] **Warnings included if only mock data used** (testing incomplete warning)
- [ ] Results saved to reports directory with timestamp
- [ ] Screenshots captured (Level 3)
- [ ] Results reported clearly in console
- [ ] Failures documented in reports and COMMENTS.md (if any)
- [ ] **Testing completion status accurately reported** (only complete if Level 3 tests passed with real data)

## Status Reporting Format
```
[COMMAND] /test [action] [target] [level]
[STATUS] Success/Failure/In Progress
[STEPS] X/8 completed
[VERIFICATION] Passed/Failed
[DETAILS]
  - Action: [create/run]
  - Target: [target name]
  - Level: [level1/level2/level3/all]
  - Tests run: [count]
  - Level 1: [passed]/[failed]/[skipped]
  - Level 2: [passed]/[failed]/[skipped]
  - Level 3: [passed]/[failed]/[skipped]
  - Coverage: [percentage] (Level 2)
  - Screenshots: [count] (Level 3)
  - Execution time: [time]
  - Report: [path to test-summary.md]
  - Results: [path to test-results.json]
  - Failures: [list if any]
```

## Error Handling

### No Tests Found
- **Error**: No test files exist for target
- **Handling**: List available test targets, suggest creating tests
- **Action**: Use `/test create [target]` to create tests

### Test Framework Not Available
- **Error**: Test framework not installed or configured
- **Handling**: Check package.json for test scripts and dependencies
- **Action**: Install test framework or configure test environment

### Test Creation Failure
- **Error**: Cannot create test files
- **Handling**: Check write permissions, disk space, target implementation exists
- **Action**: Fix permissions, free disk space, verify target exists

### Test Execution Failure
- **Error**: Tests fail to execute
- **Handling**: Capture error output, check test configuration
- **Action**: Check test configuration, dependencies, environment

### Screenshot Capture Failure (Level 3)
- **Error**: Cannot capture screenshots
- **Handling**: Check screenshot library, browser/headless browser availability
- **Action**: Install screenshot library, configure browser

### Parse Failure
- **Error**: Cannot parse test results
- **Handling**: Report raw output
- **Action**: Check test output format, update parser if needed

## Examples

### Example 1: Create Tests for Mechanism
```
User: /test create story-fetcher
AI:
[COMMAND] /test create story-fetcher
[STATUS] In Progress
[STEPS] 3/8 completed

[ANALYZING IMPLEMENTATION...]
- Found implementation: src/mechanisms/story-fetcher/
- Functions to test: fetchStories, cacheStories, transformStories
- Components to test: None

[CREATING TEST FILES...]
- Created: tests/story-fetcher-level1-basic-fetch.test.ts
- Created: tests/story-fetcher-level2-error-handling.test.ts
- Created: tests/story-fetcher-level2-transform.test.ts
- Created: tests/story-fetcher-level3-api-integration.test.ts
- Created: tests/story-fetcher-level3-api-integration.params.json

[COMMAND] /test create story-fetcher
[STATUS] Success
[STEPS] 8/8 completed
[VERIFICATION] Passed
[DETAILS]
  - Action: create
  - Target: story-fetcher
  - Level: all
  - Tests created: 4 files
  - Parameter files: 1 file
```

### Example 2: Run All Tests
```
User: /test story-fetcher
AI:
[COMMAND] /test run story-fetcher all
[STATUS] Success
[STEPS] 8/8 completed
[VERIFICATION] Passed
[DETAILS]
  - Action: run
  - Target: story-fetcher
  - Level: all
  - Tests run: 15
  - Level 1: 5/0/0 (passed/failed/skipped)
  - Level 2: 8/0/0
  - Level 3: 2/0/0
  - Coverage: 87% (Level 2)
  - Screenshots: 6 (Level 3)
  - Execution time: 12.3s
  - Report: plans/reports/tests/story-fetcher/20260106-143022/test-summary.md
  - Results: plans/reports/tests/story-fetcher/20260106-143022/test-results.json
  - Failures: None

[REPORT GENERATED]
Full comprehensive report saved to:
  - Summary: plans/reports/tests/story-fetcher/20260106-143022/test-summary.md
  - Results: plans/reports/tests/story-fetcher/20260106-143022/test-results.json
  - Environment: plans/reports/tests/story-fetcher/20260106-143022/environment.json
  - Screenshots: plans/reports/tests/story-fetcher/20260106-143022/screenshots/
```

### Example 3: Run Level 3 Tests Only
```
User: /test level3 card-composer
AI:
[COMMAND] /test run card-composer level3
[STATUS] Success
[STEPS] 8/8 completed
[VERIFICATION] Passed
[DETAILS]
  - Action: run
  - Target: card-composer
  - Level: level3
  - Tests run: 3
  - Level 3: 3/0/0
  - Screenshots: 9
  - Execution time: 8.7s
  - Results: plans/reports/tests/card-composer/20260106-143155/
  - Failures: None
```

### Example 4: Test Failures with Screenshots
```
User: /test carousel-composer
AI:
[COMMAND] /test run carousel-composer all
[STATUS] Failure
[STEPS] 8/8 completed
[VERIFICATION] Failed
[DETAILS]
  - Action: run
  - Target: carousel-composer
  - Level: all
  - Tests run: 18
  - Level 1: 6/0/0
  - Level 2: 8/1/0
  - Level 3: 2/1/0
  - Coverage: 82% (Level 2)
  - Screenshots: 5 (Level 3)
  - Execution time: 15.2s
  - Results: plans/reports/tests/carousel-composer/20260106-143301/
  - Failures:
    Level 2:
      1. infinite-scroll should handle rapid scrolling
         Error: Memory leak detected after 100 scroll events
         File: tests/carousel-composer-level2-scroll.test.ts:45
    Level 3:
      1. carousel-rendering should render all cards correctly
         Error: Card 5 not rendered after 5 seconds
         Screenshot: plans/reports/tests/carousel-composer/20260106-143301/screenshots/screenshot-003.png
         File: tests/carousel-composer-level3-rendering.test.ts:23
```

### Example 5: Incomplete Testing with Mock Data Only
```
User: /test story-fetcher
AI:
[COMMAND] /test run story-fetcher all
[STATUS] Success (with warnings)
[STEPS] 8/8 completed
[VERIFICATION] Passed (but incomplete)
[DETAILS]
  - Action: run
  - Target: story-fetcher
  - Level: all
  - Tests run: 12
  - Level 1: 4/0/0
  - Level 2: 6/0/0
  - Level 3: 2/0/0 (⚠️ WARNING: Used mock data only)
  - Coverage: 95% (Level 2)
  - Screenshots: 0 (Level 3 tests used mocks, no real API calls)
  - Execution time: 3.2s
  - Results: plans/reports/tests/story-fetcher/20260106-144500/
  - Warnings:
    ⚠️ CRITICAL: Level 3 tests used only mock data
    ⚠️ Testing is INCOMPLETE - real data testing required
    ⚠️ Mock data only validates assumptions, not actual API behavior

[REPORT GENERATED]
⚠️ WARNING: Tests used only mock data. Testing is INCOMPLETE until real data testing is performed.
⚠️ Testing cannot be considered complete if only mock data is used.
⚠️ Mock data only validates assumptions, not actual system behavior.

Full report saved to:
  - Summary: plans/reports/tests/story-fetcher/20260106-144500/test-summary.md
  - Results: plans/reports/tests/story-fetcher/20260106-144500/test-results.json

The test summary includes:
  - Real Data Testing Status: ❌ Mock Data Only
  - Testing Complete: ❌ No (Level 3 tests must use real data)
  - Recommendations: Add Level 3 tests that make actual API calls to Liveblog REST API
```

## Test Creation Workflow

When creating tests, follow this workflow:

1. **Analyze Implementation**
   - Read implementation files
   - Identify all functions/components
   - Identify dependencies
   - Determine test requirements

2. **Determine Test Parameters (Level 3)**
   - Analyze what needs to be tested in real environment
   - **CRITICAL**: Determine real API endpoints, real database operations (NO MOCKS)
   - Determine UI interactions
   - Determine screenshot capture points
   - **MANDATORY**: Level 3 tests MUST use real data, not mocks
   - Ask user questions if needed:
     - "What API endpoints should be tested?" (must be real endpoints)
     - "What real test data should be used?" (not mock data)
     - "What UI interactions should be tested?"
     - "At what points should screenshots be captured?"
   - **WARNING**: If user suggests using mocks for Level 3, remind them that testing will be incomplete

3. **Create Test Files**
   - Create Level 1 tests (quick verification)
   - Create Level 2 tests (comprehensive code tests)
   - Create Level 3 tests (integration tests)
   - Create parameter JSON files for Level 3

4. **Generate Test Structure**
   - Use Vitest test structure
   - Include proper imports
   - Include test setup/teardown
   - **CRITICAL**: Structure tests to enable input/output capture:
     - Store test inputs in variables (don't inline)
     - Store expected outputs in variables
     - Store actual outputs in variables
     - Use descriptive assertion messages
     - Example structure:
     ```typescript
     test('should do something', () => {
       // INPUTS - clearly defined
       const inputParam = { key: 'value' };
       const expectedResult = { result: 'expected' };
       
       // EXECUTION
       const actualResult = functionUnderTest(inputParam);
       
       // ASSERTIONS - with clear expected/actual
       expect(actualResult).toEqual(expectedResult);
     });
     ```
   - Include proper assertions
   - Include error handling

## Input/Output Capture Strategy

### How to Capture Test Data

1. **From Test Code Structure**
   - Parse test files to extract:
     - Variable assignments (inputs)
     - Function call arguments
     - Expected values in assertions
     - Actual values from function calls

2. **From Vitest Output**
   - Use Vitest JSON reporter (`--reporter=json`)
   - Parse JSON output to extract:
     - Test names and status
     - Assertion failures with expected/actual values
     - Error messages and stack traces
     - Test durations

3. **From Assertion Errors**
   - Vitest assertion errors contain:
     - Expected value
     - Actual value
     - Diff (for toEqual, toContain, etc.)
   - Extract this data for failed tests

4. **For Level 3 Tests**
   - Capture API request/response data:
     - Use fetch/axios interceptors
     - Log request details (URL, method, headers, body)
     - Log response details (status, headers, body)
   - Capture database operations:
     - Log operation type, parameters, results
   - Capture UI state:
     - DOM snapshots before/after
     - Component state/props

### Implementation Notes

- **Test Reporter**: May need custom Vitest reporter to capture all data
- **Test Parsing**: May need AST parsing to extract inputs from test code
- **Assertion Extraction**: Use Vitest's built-in error formatting
- **Data Structure**: Store captured data in structured format matching JSON schema

## Related Commands
- [/run](run.md) - Run mechanism before testing
- [/validate](validate.md) - Validate implementation against requirements
- [/build](build.md) - Build before testing
- [/fix](fix.md) - Fix test failures
- [/implement](implement.md) - Implement mechanism (should create tests)

## Migration from Existing TestsIf tests exist outside the `tests/` directory:
1. Use `/test create` to analyze existing tests
2. Move tests to `tests/` directory following naming convention
3. Update test imports and paths
4. Create parameter JSON files for Level 3 tests
5. Verify tests still run correctly