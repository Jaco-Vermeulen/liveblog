# Command: /clean

## Trigger
The command is triggered when user says: `/clean`, `clean`, `/clean [target]`, or variations like "clean up" or "clean the cache"

## Purpose
Clean build artifacts, cache, etc. This command identifies what to clean, executes cleanup, verifies cleanup, and reports freed resources.

## Context
Use this command when:
- User wants to clean build artifacts
- User wants to clear cache
- User wants to free up disk space
- User wants to start fresh
- User wants to remove temporary files

## Execution Steps

### Step 1: Identify What to Clean
- **Action**: Determine cleanup target
  - Parse user input for target (e.g., "build", "cache", "node_modules", "all")
  - If not specified: Clean common targets (build artifacts, cache)
  - Identify files/directories to clean
  - Check mechanism README.md for cleanup guidelines
  - Verify targets are safe to clean
- **Verification**: Cleanup targets identified
- **On Success**: Proceed to Step 2
- **On Failure**: Report error and list available targets

### Step 2: Execute Cleanup
- **Action**: Remove files/directories
  - Delete build artifacts (dist/, build/, .next/, etc.)
  - Clear cache directories (node_modules/.cache/, .cache/, etc.)
  - Remove temporary files
  - Clear log files (if configured)
  - Clear test coverage reports (if configured)
  - Preserve important files (config, source code)
  - Calculate space to be freed
- **Verification**: Cleanup operations execute
- **On Success**: Proceed to Step 3
- **On Failure**: Report cleanup errors

### Step 3: Verify Cleanup
- **Action**: Confirm cleanup worked
  - Verify files/directories are deleted
  - Check disk space freed
  - Verify important files are preserved
  - Check for any errors during cleanup
- **Verification**: Cleanup is verified
- **On Success**: Proceed to Step 4
- **On Failure**: Report verification failures

### Step 4: Report Freed Resources
- **Action**: Document cleanup results
  - Report space freed (MB/GB)
  - List files/directories cleaned
  - Report any errors or warnings
  - Suggest next steps (rebuild, reinstall, etc.)
- **Verification**: Report is complete
- **On Success**: Command complete
- **On Failure**: Report documentation issues

## Pre-requisites
- [ ] Write permissions for cleanup targets
- [ ] No processes using files to be deleted
- [ ] Backup of important data (if needed)

## Verification Steps
1. Cleanup targets identified
2. Cleanup executed successfully
3. Cleanup verified
4. Resources freed reported

## Success Criteria
- [ ] Targets identified
- [ ] Cleanup executed
- [ ] Cleanup verified
- [ ] Resources reported

## Status Reporting Format
```
[COMMAND] /clean [target]
[STATUS] Success/Failure/Partial
[STEPS] X/4 completed
[VERIFICATION] Passed/Failed
[DETAILS]
  - Target: [target name]
  - Files deleted: [count]
  - Directories deleted: [count]
  - Space freed: [size]
  - Errors: [count]
  - Next steps: [recommendations]
```

## Error Handling

### Cannot Delete Files
- **Error**: Files are locked or in use
- **Handling**: Report which files cannot be deleted
- **Action**: Close processes using files, retry cleanup

### Insufficient Permissions
- **Error**: No write permissions
- **Handling**: Report permission errors
- **Action**: Fix permissions or run with elevated privileges

### Important Files Deleted
- **Error**: Accidentally deleted important files
- **Handling**: Report what was deleted
- **Action**: Restore from backup if available

## Examples

### Example 1: Clean Build Artifacts
```
User: /clean build
AI:
[COMMAND] /clean build
[STATUS] Success
[STEPS] 4/4 completed
[VERIFICATION] Passed
[DETAILS]
  - Target: build artifacts
  - Files deleted: 247
  - Directories deleted: 12
  - Space freed: 45.2 MB
  - Errors: 0
  - Next steps: Run /build to rebuild artifacts
```

### Example 2: Clean Cache
```
User: /clean cache
AI:
[COMMAND] /clean cache
[STATUS] Success
[STEPS] 4/4 completed
[VERIFICATION] Passed
[DETAILS]
  - Target: cache
  - Files deleted: 1,523
  - Directories deleted: 8
  - Space freed: 128.7 MB
  - Errors: 0
  - Next steps: Cache cleared. System will rebuild cache on next use.
```

### Example 3: Clean All
```
User: /clean all
AI:
[COMMAND] /clean all
[STATUS] Success
[STEPS] 4/4 completed
[VERIFICATION] Passed
[DETAILS]
  - Target: all (build, cache, temp)
  - Files deleted: 2,341
  - Directories deleted: 23
  - Space freed: 234.5 MB
  - Errors: 0
  - Next steps:
    1. Run /build to rebuild
    2. Run npm install if node_modules was cleaned
    3. System will rebuild cache on next use
```

## Related Commands
- [/build](build.md) - Rebuild after cleaning
- [/run](run.md) - Run after cleaning
- [/status](status.md) - Check status after cleaning

