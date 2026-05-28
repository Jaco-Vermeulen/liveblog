# Command: /sync

## Trigger
The command is triggered when user says: `/sync`, `sync`, `/sync [source] [target]`, or variations like "sync the changes"

## Purpose
Sync between versions or systems. This command identifies source and target, checks for differences, applies sync operations, verifies sync success, and reports changes.

## Context
Use this command when:
- User wants to sync between base and web versions
- User wants to sync between web and web2
- User wants to sync documentation
- User wants to sync code changes
- User wants to sync configuration

## Execution Steps

### Step 1: Identify Source and Target
- **Action**: Determine sync direction and targets
  - Parse user input for source and target
  - If not specified: Determine default (usually web → web2 or base → web2)
  - Validate source exists
  - Validate target exists or can be created
  - Check mechanism README.md for sync guidelines
- **Verification**: Source and target are valid
- **On Success**: Proceed to Step 2
- **On Failure**: Report error and suggest correct source/target

### Step 2: Check for Differences
- **Action**: Compare source and target
  - Compare file structures
  - Compare file contents
  - Identify new files in source
  - Identify modified files
  - Identify deleted files (if applicable)
  - Check for conflicts
  - Generate diff report
- **Verification**: Differences are identified
- **On Success**: Proceed to Step 3
- **On Failure**: Report comparison issues

### Step 3: Apply Sync Operations
- **Action**: Synchronize files
  - Copy new files from source to target
  - Update modified files in target
  - Handle deletions (if applicable)
  - Resolve conflicts (if any)
  - Preserve target-specific changes (if configured)
  - Update timestamps
  - Check mechanism CHANGELOG.md for sync history
- **Verification**: Sync operations execute
- **On Success**: Proceed to Step 4
- **On Failure**: Report sync errors, rollback if needed

### Step 4: Verify Sync Success
- **Action**: Confirm synchronization
  - Verify files were copied/updated correctly
  - Check file contents match
  - Verify no files were corrupted
  - Check for sync errors
  - Verify target structure matches source (where applicable)
- **Verification**: Sync is successful
- **On Success**: Proceed to Step 5
- **On Failure**: Report verification failures, suggest fixes

### Step 5: Report Changes
- **Action**: Document sync results
  - List files added
  - List files updated
  - List files deleted (if applicable)
  - Report conflicts resolved
  - Update mechanism CHANGELOG.md with sync entry
  - Provide summary of changes
- **Verification**: Changes are documented
- **On Success**: Command complete
- **On Failure**: Report documentation issues

## Pre-requisites
- [ ] Source exists and is accessible
- [ ] Target exists or can be created
- [ ] Write permissions for target
- [ ] No conflicting operations in progress
- [ ] Backup of target (recommended)

## Verification Steps
1. Source and target identified
2. Differences identified correctly
3. Sync operations applied successfully
4. Sync verified
5. Changes reported accurately

## Success Criteria
- [ ] Source and target identified
- [ ] Differences checked
- [ ] Sync operations applied
- [ ] Sync verified
- [ ] Changes reported

## Status Reporting Format
```
[COMMAND] /sync [source] → [target]
[STATUS] Success/Failure/Partial
[STEPS] X/5 completed
[VERIFICATION] Passed/Failed
[DETAILS]
  - Source: [source path]
  - Target: [target path]
  - Files added: [count]
  - Files updated: [count]
  - Files deleted: [count]
  - Conflicts resolved: [count]
  - Sync time: [time]
  - Changes: [summary]
```

## Error Handling

### Source Not Found
- **Error**: Source doesn't exist
- **Handling**: Verify source path
- **Action**: Check path, verify source exists

### Target Not Accessible
- **Error**: Cannot write to target
- **Handling**: Check permissions
- **Action**: Fix permissions or specify different target

### Conflicts Detected
- **Error**: Files have conflicts
- **Handling**: Report conflicts
- **Action**: Resolve conflicts manually or use merge strategy

### Sync Failure
- **Error**: Sync operation fails
- **Handling**: Rollback changes if possible
- **Action**: Investigate error, retry sync

## Examples

### Example 1: Successful Sync
```
User: /sync base web2
AI:
[COMMAND] /sync base → web2
[STATUS] Success
[STEPS] 5/5 completed
[VERIFICATION] Passed
[DETAILS]
  - Source: src/components/store/storyStore.js
  - Target: client_web2/src/components/store/storyStore.js
  - Files added: 3
  - Files updated: 12
  - Files deleted: 0
  - Conflicts resolved: 0
  - Sync time: 2.3s
  - Changes:
    - Added: story-fetcher implementation
    - Updated: transform functions
    - Updated: cache management
```

### Example 2: Sync with Conflicts
```
User: /sync web web2
AI:
[COMMAND] /sync web → web2
[STATUS] Partial
[STEPS] 5/5 completed
[VERIFICATION] Passed (with conflicts)
[DETAILS]
  - Source: maroela_web/src/components/Carousel
  - Target: client_web2/src/components/Carousel
  - Files added: 5
  - Files updated: 8
  - Files deleted: 0
  - Conflicts resolved: 2
  - Sync time: 4.1s
  - Changes:
    - Added: 5 new carousel components
    - Updated: 8 existing components
    - Conflicts: 2 files had conflicts (manually resolved)
      - BaseCarousel.tsx: Merge conflict in useInfiniteScroll hook
      - Card.tsx: Merge conflict in card variants
  - Note: Conflicts resolved manually. Review changes before proceeding.
```

### Example 3: Sync Failure
```
User: /sync plans mechanisms
AI:
[COMMAND] /sync plans → mechanisms
[STATUS] Failure
[STEPS] 3/5 completed
[VERIFICATION] Failed
[DETAILS]
  - Source: plans/mechanisms
  - Target: mechanisms
  - Error: Target directory is read-only
  - Action: Check write permissions or use different target location
```

## Related Commands
- [/rollback](rollback.md) - Rollback sync if needed
- [/status](status.md) - Check sync status
- [/validate](validate.md) - Validate after sync
- [/build](build.md) - Build after sync

