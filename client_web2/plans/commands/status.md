# Command: /status

## Trigger
The command is triggered when user says: `/status`, `status`, `/status [target]`, or variations like "check status" or "what's the status"

## Purpose
Check status of system/mechanism. This command identifies what to check, gathers status information, verifies health, reports status, and flags any issues.

## Context
Use this command when:
- User wants to check if something is running
- User wants to verify system health
- User wants to see current state
- User wants to check for issues
- User wants to monitor progress

## Execution Steps

### Step 1: Identify What to Check
- **Action**: Parse user input to identify status target
  - If target specified: Use that target (e.g., "story-fetcher", "carousel-composer")
  - If no target: Check entire system or current mechanism
  - Determine status type (runtime, build, test, deployment)
  - Check mechanism README.md for status indicators
- **Verification**: Confirm target is valid
- **On Success**: Proceed to Step 2
- **On Failure**: Report error and suggest available targets

### Step 2: Gather Status Information
- **Action**: Collect status data
  - Check if process/service is running (if applicable)
  - Check build artifacts exist (if applicable)
  - Check test results (if applicable)
  - Check logs for recent activity
  - Check resource usage (CPU, memory, disk)
  - Check database/storage status
  - Check network connectivity (if applicable)
  - Review mechanism TASKS.md for completion status
- **Verification**: Status information is collected
- **On Success**: Proceed to Step 3
- **On Failure**: Report data collection issues

### Step 3: Verify Health
- **Action**: Assess health status
  - Check for errors in logs
  - Check for warnings
  - Verify expected functionality is working
  - Check if metrics are within acceptable ranges
  - Compare against known good state
  - Check mechanism CHANGELOG.md for recent changes
- **Verification**: Health assessment is complete
- **On Success**: Proceed to Step 4
- **On Failure**: Report health check issues

### Step 4: Report Status
- **Action**: Present status information
  - Format status report using standard format
  - Use clear status indicators (✅ Healthy, ⚠️ Warning, ❌ Error)
  - Include key metrics
  - Include recent activity summary
  - Include uptime/duration (if applicable)
- **Verification**: Report is clear and accurate
- **On Success**: Proceed to Step 5
- **On Failure**: Report formatting issues

### Step 5: Flag Issues
- **Action**: Identify and highlight problems
  - List critical issues
  - List warnings
  - Suggest actions for issues
  - Check mechanism COMMENTS.md for known issues
  - Provide next steps
- **Verification**: Issues are identified
- **On Success**: Command complete
- **On Failure**: Report issue identification problems

## Pre-requisites
- [ ] Target exists (mechanism, system, etc.)
- [ ] Access to status information (logs, processes, etc.)
- [ ] Sufficient permissions to check status

## Verification Steps
1. Status target identified
2. Status information gathered
3. Health verified
4. Status reported clearly
5. Issues flagged appropriately

## Success Criteria
- [ ] Target identified
- [ ] Status information gathered
- [ ] Health verified
- [ ] Status reported clearly
- [ ] Issues flagged (if any)

## Status Reporting Format
```
[COMMAND] /status [target]
[STATUS] Healthy/Warning/Error/Unknown
[STEPS] X/5 completed
[VERIFICATION] Passed/Failed
[DETAILS]
  - Target: [target name]
  - Status: [Healthy/Warning/Error]
  - Uptime: [duration if applicable]
  - Metrics: [key metrics]
  - Recent activity: [summary]
  - Issues: [list if any]
  - Next steps: [recommendations]
```

## Error Handling

### Target Not Found
- **Error**: Status target doesn't exist
- **Handling**: List available targets
- **Action**: Suggest correct target

### Cannot Access Status
- **Error**: Cannot gather status information
- **Handling**: Report access issues
- **Action**: Check permissions, verify target is accessible

### Status Unknown
- **Error**: Cannot determine status
- **Handling**: Report unknown status
- **Action**: Investigate why status cannot be determined

## Examples

### Example 1: Healthy Status
```
User: /status story-fetcher
AI:
[COMMAND] /status story-fetcher
[STATUS] Healthy
[STEPS] 5/5 completed
[VERIFICATION] Passed
[DETAILS]
  - Target: story-fetcher
  - Status: ✅ Healthy
  - Uptime: 2h 15m
  - Metrics:
    - Stories fetched: 1,247
    - Cache hit rate: 87%
    - Average fetch time: 234ms
    - Errors: 0
  - Recent activity: Fetched 15 new stories in last 5 minutes
  - Issues: None
  - Next steps: System operating normally
```

### Example 2: Warning Status
```
User: /status carousel-composer
AI:
[COMMAND] /status carousel-composer
[STATUS] Warning
[STEPS] 5/5 completed
[VERIFICATION] Passed
[DETAILS]
  - Target: carousel-composer
  - Status: ⚠️ Warning
  - Uptime: 1h 32m
  - Metrics:
    - Carousels rendered: 12
    - Average render time: 145ms
    - Memory usage: 89% (high)
    - Warnings: 3
  - Recent activity: Rendered 2 new carousels, 3 performance warnings
  - Issues:
    1. High memory usage (89%)
    2. Slow render times on mobile devices
    3. Virtual scroll not enabled for vertical carousels
  - Next steps: Consider optimizing memory usage, enable virtual scroll
```

### Example 3: Error Status
```
User: /status database-manager
AI:
[COMMAND] /status database-manager
[STATUS] Error
[STEPS] 5/5 completed
[VERIFICATION] Failed
[DETAILS]
  - Target: database-manager
  - Status: ❌ Error
  - Uptime: N/A (not running)
  - Metrics: N/A
  - Recent activity: Last successful operation 15 minutes ago
  - Issues:
    1. IndexedDB connection failed
    2. Cannot access database stores
    3. Error: "QuotaExceededError: The quota has been exceeded"
  - Next steps:
    1. Check browser storage quota
    2. Clear old cache data
    3. Restart database manager
    4. Use /clean to free up space
```

### Example 4: System Status
```
User: /status
AI:
[COMMAND] /status (entire system)
[STATUS] Warning
[STEPS] 5/5 completed
[VERIFICATION] Passed
[DETAILS]
  - Target: entire system
  - Status: ⚠️ Warning
  - Components:
    - story-fetcher: ✅ Healthy
    - ad-fetcher: ✅ Healthy
    - carousel-composer: ⚠️ Warning
    - database-manager: ❌ Error
    - page-composer: ✅ Healthy
  - Overall health: 4/5 components healthy
  - Issues:
    1. database-manager has critical error (see /status database-manager)
    2. carousel-composer has performance warnings
  - Next steps: Fix database-manager error, optimize carousel-composer
```

## Related Commands
- [/check](check.md) - Quick health check
- [/analyze](analyze.md) - Detailed analysis
- [/run](run.md) - Start if not running
- [/fix](fix.md) - Fix identified issues

