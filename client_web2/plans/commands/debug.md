# Command: /debug

## Trigger
The command is triggered when user says: `/debug`, `debug`, `/debug [target]`, or variations like "debug this" or "start debugging"

## Purpose
Debug issues, enable debugging tools, and gather diagnostic information. This command helps identify problems, enables debug modes, collects diagnostic data, and provides debugging insights.

## Context
Use this command when:
- User wants to debug a specific issue
- User wants to enable debug logging
- User wants to gather diagnostic information
- User wants to inspect runtime state
- User wants to trace execution flow

## Execution Steps

### Step 1: Identify Debug Target
- **Action**: Determine what to debug
  - Parse user input for target (e.g., "story-fetcher", "carousel-composer", "entire system")
  - If not specified: Debug current mechanism or entire system
  - Determine debug type (runtime, performance, state, flow)
  - Check mechanism COMMENTS.md for known debug points
- **Verification**: Target is identified
- **On Success**: Proceed to Step 2
- **On Failure**: Report error and suggest available targets

### Step 2: Enable Debug Mode
- **Action**: Activate debugging capabilities
  - Enable debug logging for target
  - Enable console logging if needed
  - Enable performance profiling if needed
  - Enable state inspection if needed
  - Set debug flags in code (if applicable)
  - Check mechanism README.md for debug options
- **Verification**: Debug mode is enabled
- **On Success**: Proceed to Step 3
- **On Failure**: Report debug activation issues

### Step 3: Collect Diagnostic Information
- **Action**: Gather debugging data
  - Collect current state information
  - Collect recent logs/errors
  - Collect performance metrics
  - Collect execution traces
  - Collect memory/CPU usage (if applicable)
  - Collect network requests (if applicable)
  - Check mechanism CHANGELOG.md for recent changes
- **Verification**: Diagnostic data is collected
- **On Success**: Proceed to Step 4
- **On Failure**: Report data collection issues

### Step 4: Analyze Debug Data
- **Action**: Examine collected information
  - Identify errors and warnings
  - Identify performance bottlenecks
  - Identify state inconsistencies
  - Identify execution flow issues
  - Compare against expected behavior
  - Check for patterns or anomalies
- **Verification**: Analysis is complete
- **On Success**: Proceed to Step 5
- **On Failure**: Report analysis issues

### Step 5: Report Debug Findings
- **Action**: Present debug results
  - Format debug report using standard format
  - Highlight critical issues
  - Provide debugging insights
  - Suggest next steps
  - Include relevant code locations
  - Update mechanism COMMENTS.md with findings
- **Verification**: Report is complete
- **On Success**: Command complete
- **On Failure**: Report documentation issues

## Pre-requisites
- [ ] Target exists and is accessible
- [ ] Debug tools available (console, profiler, etc.)
- [ ] Sufficient permissions for debugging
- [ ] Debug mode can be enabled

## Verification Steps
1. Debug target identified
2. Debug mode enabled
3. Diagnostic data collected
4. Data analyzed
5. Findings reported

## Success Criteria
- [ ] Target identified
- [ ] Debug mode enabled
- [ ] Diagnostic data collected
- [ ] Data analyzed
- [ ] Findings reported

## Status Reporting Format
```
[COMMAND] /debug [target]
[STATUS] Success/Failure/In Progress
[STEPS] X/5 completed
[VERIFICATION] Passed/Failed
[DETAILS]
  - Target: [target name]
  - Debug mode: [enabled/disabled]
  - Issues found: [count]
    - Critical: [count]
    - Warnings: [count]
    - Info: [count]
  - Diagnostic data: [summary]
  - Findings: [list]
  - Next steps: [recommendations]
```

## Error Handling

### Target Not Found
- **Error**: Debug target doesn't exist
- **Handling**: List available targets
- **Action**: Suggest correct target

### Debug Mode Cannot Be Enabled
- **Error**: Cannot enable debug mode
- **Handling**: Report why debug mode cannot be enabled
- **Action**: Check permissions, configuration, or environment

### Diagnostic Collection Failure
- **Error**: Cannot collect diagnostic data
- **Handling**: Report collection issues
- **Action**: Check access permissions or tool availability

## Examples

### Example 1: Debug Specific Mechanism
```
User: /debug story-fetcher
AI:
[COMMAND] /debug story-fetcher
[STATUS] Success
[STEPS] 5/5 completed
[VERIFICATION] Passed
[DETAILS]
  - Target: story-fetcher
  - Debug mode: ✅ Enabled
  - Issues found: 2
    - Critical: 0
    - Warnings: 1
    - Info: 1
  - Diagnostic data:
    - Recent errors: None
    - Performance: Normal (avg fetch: 234ms)
    - State: Healthy (1,247 stories cached)
  - Findings:
    1. Warning: Polling interval may be too frequent (30s)
    2. Info: Cache hit rate is 87% (good)
  - Next steps: Monitor polling frequency, consider increasing interval
```

### Example 2: Debug with Performance Profiling
```
User: /debug carousel-composer performance
AI:
[COMMAND] /debug carousel-composer performance
[STATUS] Success
[STEPS] 5/5 completed
[VERIFICATION] Passed
[DETAILS]
  - Target: carousel-composer (performance)
  - Debug mode: ✅ Enabled (performance profiling)
  - Issues found: 3
    - Critical: 1
    - Warnings: 2
    - Info: 0
  - Diagnostic data:
    - Render time: 145ms (target: <100ms)
    - Memory usage: 89% (high)
    - Re-renders: 12 in last 5 seconds
  - Findings:
    1. Critical: Render time exceeds target (145ms vs 100ms)
    2. Warning: High memory usage (89%)
    3. Warning: Excessive re-renders detected
  - Next steps:
    1. Enable virtual scrolling for vertical carousels
    2. Optimize card rendering
    3. Review memoization strategy
```

## Related Commands
- [/analyze](analyze.md) - Detailed analysis
- [/check](check.md) - Quick health check
- [/fix](fix.md) - Fix identified issues
- [/troubleshoot](troubleshoot.md) - Systematically identify, trace, fix, and test visual/UI problems
- [/audit](audit.md) - Comprehensive audit


