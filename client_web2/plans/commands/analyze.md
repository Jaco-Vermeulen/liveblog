# Command: /analyze

## Trigger
The command is triggered when user says: `/analyze`, `analyze`, `/analyze [target]`, or variations like "analyze the carousel composer performance"

## Purpose
Analyze code, performance, or structure. This command identifies the analysis target, runs analysis tools, collects metrics, generates reports, and highlights issues.

## Context
Use this command when:
- User wants to analyze code quality
- User wants to check performance metrics
- User wants to understand code structure
- User wants to identify potential issues
- User wants to check dependencies

## Execution Steps

### Step 1: Identify Analysis Target
- **Action**: Parse user input to identify what to analyze
  - If target specified: Use that target (e.g., "carousel-composer", "performance", "dependencies")
  - If no target: Analyze current mechanism or entire system
  - Determine analysis type (code, performance, structure, dependencies)
  - Check mechanism README.md for analysis guidelines
- **Verification**: Confirm target is valid
- **On Success**: Proceed to Step 2
- **On Failure**: Report error and suggest available targets

### Step 2: Run Analysis Tools
- **Action**: Execute appropriate analysis tools
  - Code analysis: ESLint, TypeScript compiler, code complexity tools
  - Performance: Lighthouse, performance profiler, bundle analyzer
  - Structure: Dependency graph, file size analysis, import analysis
  - Dependencies: npm audit, dependency checker, license checker
  - Run tools based on analysis type
  - Capture tool output
- **Verification**: Analysis tools execute successfully
- **On Success**: Proceed to Step 3
- **On Failure**: Report tool execution errors

### Step 3: Collect Metrics
- **Action**: Gather analysis metrics
  - Parse tool output
  - Extract key metrics (lines of code, complexity, bundle size, etc.)
  - Calculate derived metrics
  - Compare against baselines or thresholds
  - Check mechanism README.md for expected metrics
- **Verification**: Metrics are collected correctly
- **On Success**: Proceed to Step 4
- **On Failure**: Report metric collection errors

### Step 4: Generate Report
- **Action**: Create analysis report
  - Format metrics in readable format
  - Create visualizations if helpful (charts, graphs)
  - Highlight critical issues
  - Provide recommendations
  - Include comparison with previous analysis (if available)
- **Verification**: Report is complete
- **On Success**: Proceed to Step 5
- **On Failure**: Report generation issues

### Step 5: Highlight Issues
- **Action**: Identify and highlight problems
  - List critical issues first
  - List warnings and suggestions
  - Prioritize issues by severity
  - Link issues to specific files/lines
  - Suggest fixes or improvements
  - Check mechanism COMMENTS.md for known issues
- **Verification**: Issues are identified and prioritized
- **On Success**: Command complete
- **On Failure**: Report issue identification problems

## Pre-requisites
- [ ] Analysis tools installed (ESLint, TypeScript, etc.)
- [ ] Target code/files accessible
- [ ] Sufficient permissions to read files
- [ ] Analysis tools configured (if needed)

## Verification Steps
1. Analysis target identified
2. Analysis tools execute successfully
3. Metrics collected accurately
4. Report generated completely
5. Issues highlighted clearly

## Success Criteria
- [ ] Target identified
- [ ] Analysis tools executed
- [ ] Metrics collected
- [ ] Report generated
- [ ] Issues highlighted

## Status Reporting Format
```
[COMMAND] /analyze [target] [type]
[STATUS] Success/Failure/In Progress
[STEPS] X/5 completed
[VERIFICATION] Passed/Failed
[DETAILS]
  - Target: [target name]
  - Analysis type: [code/performance/structure/dependencies]
  - Metrics: [key metrics]
  - Issues found: [count]
    - Critical: [count]
    - Warnings: [count]
    - Suggestions: [count]
  - Report: [summary]
  - Recommendations: [list]
```

## Error Handling

### Target Not Found
- **Error**: Analysis target doesn't exist
- **Handling**: List available targets
- **Action**: Suggest correct target or create if needed

### Analysis Tools Not Available
- **Error**: Required analysis tools not installed
- **Handling**: Check for tool availability
- **Action**: Install missing tools or use alternatives

### Tool Execution Failure
- **Error**: Analysis tool fails to execute
- **Handling**: Capture tool error output
- **Action**: Check tool configuration, fix errors, retry

### Metric Collection Failure
- **Error**: Cannot collect metrics from tool output
- **Handling**: Report raw output
- **Action**: Check output format, update parser if needed

## Examples

### Example 1: Code Analysis
```
User: /analyze carousel-composer code
AI:
[COMMAND] /analyze carousel-composer code
[STATUS] Success
[STEPS] 5/5 completed
[VERIFICATION] Passed
[DETAILS]
  - Target: carousel-composer
  - Analysis type: code
  - Metrics:
    - Lines of code: 1,247
    - Complexity: Medium (avg cyclomatic: 8.3)
    - Type coverage: 94%
    - Test coverage: 87%
  - Issues found: 5
    - Critical: 0
    - Warnings: 3
    - Suggestions: 2
  - Report: Code quality is good overall. Some complexity warnings in useCarousel hook.
  - Recommendations:
    1. Refactor useCarousel hook to reduce complexity
    2. Add type annotations for remaining 6% of code
    3. Increase test coverage for edge cases
```

### Example 2: Performance Analysis
```
User: /analyze performance
AI:
[COMMAND] /analyze entire system performance
[STATUS] Success
[STEPS] 5/5 completed
[VERIFICATION] Passed
[DETAILS]
  - Target: entire system
  - Analysis type: performance
  - Metrics:
    - Bundle size: 2.3 MB (gzipped: 645 KB)
    - Initial load: 1.2s
    - Time to interactive: 2.8s
    - Largest components: carousel-composer (45%), story-fetcher (23%)
  - Issues found: 3
    - Critical: 1
    - Warnings: 2
    - Suggestions: 0
  - Report: Performance is acceptable but can be improved.
  - Recommendations:
    1. Code-split carousel-composer (critical)
    2. Lazy load story-fetcher
    3. Optimize image loading
```

### Example 3: Dependency Analysis
```
User: /analyze dependencies
AI:
[COMMAND] /analyze dependencies
[STATUS] Success
[STEPS] 5/5 completed
[VERIFICATION] Passed
[DETAILS]
  - Target: entire system
  - Analysis type: dependencies
  - Metrics:
    - Total dependencies: 127
    - Outdated: 12
    - Vulnerabilities: 2 (low severity)
    - Unused: 3
  - Issues found: 17
    - Critical: 0
    - Warnings: 2
    - Suggestions: 15
  - Report: Dependencies are mostly up-to-date. Minor vulnerabilities found.
  - Recommendations:
    1. Update 12 outdated packages
    2. Address 2 low-severity vulnerabilities
    3. Remove 3 unused dependencies
```

## Related Commands
- [/check](check.md) - Quick health check
- [/status](status.md) - Check system status
- [/fix](fix.md) - Fix identified issues
- [/validate](validate.md) - Validate against requirements

