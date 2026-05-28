# Command: /check

## Trigger
The command is triggered when user says: `/check`, `check`, `/check [target]`, or variations like "quick check" or "health check"

## Purpose
Quick check/health check. This command runs quick checks, reports status, and flags issues. This is a lighter version of /status for rapid health assessment.

## Context
Use this command when:
- User wants a quick health check
- User wants to verify basic functionality
- User wants to check if something is working
- User wants a fast status update
- User wants to verify before proceeding

## Execution Steps

### Step 1: Run Quick Checks
- **Action**: Execute rapid health checks
  - Check if processes are running (if applicable)
  - Check if files exist
  - Check if services are accessible (if applicable)
  - Check for obvious errors in logs
  - Check disk space (if relevant)
  - Run basic connectivity tests (if applicable)
  - Skip detailed analysis (use /status for that)
- **Verification**: Checks execute quickly
- **On Success**: Proceed to Step 2
- **On Failure**: Report check execution errors

### Step 2: Report Status
- **Action**: Present quick status summary
  - Use simple status indicators (✅ OK, ⚠️ Warning, ❌ Error)
  - Report key metrics only
  - Skip detailed analysis
  - Provide quick summary
- **Verification**: Status reported
- **On Success**: Proceed to Step 3
- **On Failure**: Report status reporting issues

### Step 3: Flag Issues
- **Action**: Highlight critical problems only
  - List only critical issues
  - Skip minor warnings
  - Suggest quick fixes if obvious
  - Recommend /status or /analyze for details
- **Verification**: Issues flagged
- **On Success**: Command complete
- **On Failure**: Report issue flagging problems

## Pre-requisites
- [ ] Target exists (if specified)
- [ ] Access to check targets
- [ ] Basic permissions

## Verification Steps
1. Quick checks executed
2. Status reported
3. Issues flagged

## Success Criteria
- [ ] Checks executed
- [ ] Status reported
- [ ] Issues flagged (if any)

## Status Reporting Format
```
[COMMAND] /check [target]
[STATUS] OK/Warning/Error
[STEPS] X/3 completed
[VERIFICATION] Passed/Failed
[DETAILS]
  - Target: [target name]
  - Status: [OK/Warning/Error]
  - Quick summary: [one-line summary]
  - Critical issues: [count]
  - For details: Use /status or /analyze
```

## Error Handling

### Cannot Run Checks
- **Error**: Cannot execute checks
- **Handling**: Report access issues
- **Action**: Check permissions or use /status for detailed check

### Target Not Found
- **Error**: Check target doesn't exist
- **Handling**: Report target not found
- **Action**: Specify correct target or check if it exists

## Examples

### Example 1: All OK
```
User: /check
AI:
[COMMAND] /check (entire system)
[STATUS] OK
[STEPS] 3/3 completed
[VERIFICATION] Passed
[DETAILS]
  - Target: entire system
  - Status: ✅ OK
  - Quick summary: All systems operational
  - Critical issues: 0
  - For details: Use /status for detailed status
```

### Example 2: Warning
```
User: /check carousel-composer
AI:
[COMMAND] /check carousel-composer
[STATUS] Warning
[STEPS] 3/3 completed
[VERIFICATION] Passed
[DETAILS]
  - Target: carousel-composer
  - Status: ⚠️ Warning
  - Quick summary: Running but performance issues detected
  - Critical issues: 1 (high memory usage)
  - For details: Use /status carousel-composer or /analyze carousel-composer performance
```

### Example 3: Error
```
User: /check database-manager
AI:
[COMMAND] /check database-manager
[STATUS] Error
[STEPS] 3/3 completed
[VERIFICATION] Failed
[DETAILS]
  - Target: database-manager
  - Status: ❌ Error
  - Quick summary: Not running, IndexedDB connection failed
  - Critical issues: 1
  - For details: Use /status database-manager for full error details
```

## Related Commands
- [/status](status.md) - Detailed status check
- [/analyze](analyze.md) - Detailed analysis
- [/fix](fix.md) - Fix identified issues

