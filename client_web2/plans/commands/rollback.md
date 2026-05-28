# Command: /rollback

## Trigger
The command is triggered when user says: `/rollback`, `rollback`, `/rollback [target] [change-id]`, or variations like "rollback the last change"

## Purpose
Rollback changes using changelog. This command identifies change to rollback, loads changelog, executes rollback steps, verifies rollback success, and updates changelog.

## Context
Use this command when:
- User wants to undo a recent change
- User wants to revert to previous version
- User wants to rollback a failed change
- User wants to restore previous state
- User wants to undo breaking changes

## Execution Steps

### Step 1: Identify Change to Rollback
- **Action**: Determine what to rollback
  - Parse user input for target and change identifier
  - If change-id specified: Use that change
  - If not specified: Use most recent change or ask user
  - Check mechanism CHANGELOG.md for available changes
  - Validate change exists and can be rolled back
- **Verification**: Change is identified
- **On Success**: Proceed to Step 2
- **On Failure**: Report error and list available changes

### Step 2: Load Changelog
- **Action**: Read changelog entry
  - Load mechanism CHANGELOG.md
  - Find change entry by ID or date
  - Extract change details (what was changed, files affected)
  - Extract rollback instructions (if documented)
  - Check for dependencies (other changes that depend on this)
  - Verify rollback is safe
- **Verification**: Changelog loaded and change found
- **On Success**: Proceed to Step 3
- **On Failure**: Report changelog loading issues

### Step 3: Execute Rollback Steps
- **Action**: Revert changes
  - Restore files from backup (if available)
  - Revert code changes (undo modifications)
  - Remove added files (if change added files)
  - Restore deleted files (if change deleted files)
  - Revert configuration changes
  - Update dependencies if needed
  - Follow rollback instructions from changelog
- **Verification**: Rollback operations execute
- **On Success**: Proceed to Step 4
- **On Failure**: Report rollback errors, attempt partial rollback

### Step 4: Verify Rollback Success
- **Action**: Confirm rollback worked
  - Verify files are restored correctly
  - Check code compiles/builds (if applicable)
  - Run tests to verify functionality restored
  - Check for broken dependencies
  - Verify system is in expected state
- **Verification**: Rollback is successful
- **On Success**: Proceed to Step 5
- **On Failure**: Report verification failures, suggest fixes

### Step 5: Update Changelog
- **Action**: Document rollback
  - Add rollback entry to CHANGELOG.md
  - Document what was rolled back
  - Document reason for rollback
  - Document current state after rollback
  - Update mechanism COMMENTS.md if issues discovered
- **Verification**: Changelog updated
- **On Success**: Command complete
- **On Failure**: Report changelog update issues

## Pre-requisites
- [ ] Changelog exists and is up-to-date
- [ ] Change to rollback is identified
- [ ] Backup available (recommended)
- [ ] Write permissions for files to modify
- [ ] No conflicting operations in progress

## Verification Steps
1. Change identified correctly
2. Changelog loaded successfully
3. Rollback executed successfully
4. Rollback verified
5. Changelog updated

## Success Criteria
- [ ] Change identified
- [ ] Changelog loaded
- [ ] Rollback executed
- [ ] Rollback verified
- [ ] Changelog updated

## Status Reporting Format
```
[COMMAND] /rollback [target] [change-id]
[STATUS] Success/Failure/Partial
[STEPS] X/5 completed
[VERIFICATION] Passed/Failed
[DETAILS]
  - Target: [target name]
  - Change rolled back: [change-id/description]
  - Files reverted: [count]
  - Files restored: [count]
  - Dependencies affected: [count]
  - Rollback time: [time]
  - Current state: [description]
```

## Error Handling

### Change Not Found
- **Error**: Change to rollback doesn't exist
- **Handling**: List available changes from changelog
- **Action**: Specify correct change ID or date

### Changelog Missing
- **Error**: Changelog doesn't exist or is incomplete
- **Handling**: Report missing changelog
- **Action**: Create changelog or restore from backup

### Rollback Not Possible
- **Error**: Change cannot be rolled back (dependencies, etc.)
- **Handling**: Report why rollback is not possible
- **Action**: Suggest alternative approach or manual rollback

### Partial Rollback
- **Error**: Some changes rolled back, others failed
- **Handling**: Report partial success
- **Action**: Manually complete rollback or investigate failures

## Examples

### Example 1: Successful Rollback
```
User: /rollback story-fetcher 2024-01-15
AI:
[COMMAND] /rollback story-fetcher 2024-01-15
[STATUS] Success
[STEPS] 5/5 completed
[VERIFICATION] Passed
[DETAILS]
  - Target: story-fetcher
  - Change rolled back: 2024-01-15 - Added polling interval configuration
  - Files reverted: 2
  - Files restored: 0
  - Dependencies affected: 0
  - Rollback time: 1.2s
  - Current state: Polling interval reverted to default (30s)
  - Note: Changelog updated with rollback entry
```

### Example 2: Rollback with Dependencies
```
User: /rollback carousel-composer latest
AI:
[COMMAND] /rollback carousel-composer latest
[STATUS] Partial
[STEPS] 5/5 completed
[VERIFICATION] Passed (with warnings)
[DETAILS]
  - Target: carousel-composer
  - Change rolled back: 2024-01-20 - Refactored infinite scroll hook
  - Files reverted: 3
  - Files restored: 0
  - Dependencies affected: 2
  - Rollback time: 2.8s
  - Current state: Infinite scroll reverted, but 2 dependent components may need updates
  - Warnings:
    1. card-scroller depends on rolled-back changes
    2. card-optimizer uses rolled-back API
  - Next steps: Review dependent components, may need to rollback them as well
```

### Example 3: Rollback Not Possible
```
User: /rollback database-manager 2024-01-10
AI:
[COMMAND] /rollback database-manager 2024-01-10
[STATUS] Failure
[STEPS] 2/5 completed
[VERIFICATION] Failed
[DETAILS]
  - Target: database-manager
  - Change: 2024-01-10 - Database schema migration
  - Error: Cannot rollback database schema migration
  - Reason: Data has been migrated and is incompatible with old schema
  - Dependencies: 5 mechanisms depend on new schema
  - Action: 
    1. Create new migration to restore old schema (if needed)
    2. Backup current data before attempting rollback
    3. Consider alternative: Fix issues in current schema instead
```

## Related Commands
- [/status](status.md) - Check status after rollback
- [/sync](sync.md) - Sync after rollback
- [/validate](validate.md) - Validate after rollback
- [/test](test.md) - Test after rollback

