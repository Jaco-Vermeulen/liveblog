# Command: /fix

## Trigger
The command is triggered when user says: `/fix`, `fix`, `/fix [issue]`, or variations like "fix the error" or "fix this issue"

## Purpose
Fix identified issues. This command identifies the issue, analyzes root cause, applies fix, verifies fix, and updates changelog.

## Context
Use this command when:
- User wants to fix a specific issue
- User wants to resolve errors
- User wants to address warnings
- User wants to correct implementation problems
- User wants to fix test failures

## Execution Steps

### Step 1: Identify Issue
- **Action**: Determine what to fix
  - Parse user input for issue description
  - If issue specified: Use that issue
  - If not specified: Check recent errors/warnings
  - Check mechanism COMMENTS.md for known issues
  - Check mechanism CHANGELOG.md for recent changes
  - Validate issue exists and is fixable
- **Verification**: Issue is identified
- **On Success**: Proceed to Step 2
- **On Failure**: Report error and ask for clarification

### Step 2: Analyze Root Cause
- **Action**: Understand the problem
  - Review error messages/logs
  - Check code where issue occurs
  - Identify root cause
  - Check for similar issues in COMMENTS.md
  - Understand impact of issue
  - Determine fix approach
- **Verification**: Root cause identified
- **On Success**: Proceed to Step 3
- **On Failure**: Report analysis issues, suggest manual investigation

### Step 3: Apply Fix
- **Action**: Implement solution
  - Make code changes
  - Update configuration if needed
  - Fix dependencies if needed
  - Follow fix approach determined in Step 2
  - Ensure fix doesn't break other functionality
  - Check mechanism README.md for fix guidelines
- **Verification**: Fix is applied
- **On Success**: Proceed to Step 4
- **On Failure**: Report fix application errors

### Step 4: Verify Fix
- **Action**: Confirm fix works
  - Run tests related to fix
  - Verify error is resolved
  - Check for regressions
  - Verify functionality works correctly
  - Run broader tests if needed
- **Verification**: Fix is verified
- **On Success**: Proceed to Step 5
- **On Failure**: Report verification failures, suggest alternative fixes

### Step 5: Update Changelog
- **Action**: Document the fix
  - Add fix entry to CHANGELOG.md
  - Document what was fixed
  - Document how it was fixed
  - Update mechanism COMMENTS.md if new insights
  - Remove from COMMENTS.md if issue was known
- **Verification**: Changelog updated
- **On Success**: Command complete
- **On Failure**: Report changelog update issues

## Pre-requisites
- [ ] Issue is identified
- [ ] Access to fix files
- [ ] Write permissions
- [ ] Tests available (for verification)

## Verification Steps
1. Issue identified
2. Root cause analyzed
3. Fix applied
4. Fix verified
5. Changelog updated

## Success Criteria
- [ ] Issue identified
- [ ] Root cause understood
- [ ] Fix applied
- [ ] Fix verified
- [ ] Changelog updated

## Status Reporting Format
```
[COMMAND] /fix [issue]
[STATUS] Success/Failure/Partial
[STEPS] X/5 completed
[VERIFICATION] Passed/Failed
[DETAILS]
  - Issue: [issue description]
  - Root cause: [cause]
  - Fix applied: [what was fixed]
  - Tests: [passed/failed]
  - Files changed: [count]
  - Verification: [passed/failed]
  - Changelog: [updated/not updated]
```

## Error Handling

### Issue Not Identified
- **Error**: Cannot identify issue to fix
- **Handling**: Ask for clarification
- **Action**: Provide more details or use /analyze to identify issues

### Root Cause Unknown
- **Error**: Cannot determine root cause
- **Handling**: Report analysis limitations
- **Action**: Suggest manual investigation or use /analyze

### Fix Application Failure
- **Error**: Cannot apply fix
- **Handling**: Report fix errors
- **Action**: Check file permissions, verify fix approach

### Verification Failure
- **Error**: Fix doesn't work or causes regressions
- **Handling**: Report verification failures
- **Action**: Revert fix, try alternative approach

## Examples

### Example 1: Successful Fix
```
User: /fix story-fetcher timeout error
AI:
[COMMAND] /fix story-fetcher timeout error
[STATUS] Success
[STEPS] 5/5 completed
[VERIFICATION] Passed
[DETAILS]
  - Issue: Timeout error when fetching stories
  - Root cause: Polling interval too short, causing race conditions
  - Fix applied: Increased polling interval from 5s to 30s, added debouncing
  - Tests: ✅ Passed (15/15)
  - Files changed: 2
  - Verification: ✅ Passed
  - Changelog: ✅ Updated
```

### Example 2: Fix with Regressions
```
User: /fix carousel memory leak
AI:
[COMMAND] /fix carousel memory leak
[STATUS] Partial
[STEPS] 5/5 completed
[VERIFICATION] Failed
[DETAILS]
  - Issue: Memory leak in carousel composer
  - Root cause: Event listeners not cleaned up
  - Fix applied: Added cleanup in useEffect return
  - Tests: ⚠️ Partial (12/15 passed)
  - Files changed: 1
  - Verification: ⚠️ Partial (fix works but 3 tests failing)
  - Regressions:
    1. Scroll position not persisting
    2. Card animations not working
    3. Virtual scroll not updating
  - Action: Revert fix, investigate alternative approach
```

### Example 3: Cannot Identify Issue
```
User: /fix
AI:
[COMMAND] /fix
[STATUS] Failure
[STEPS] 1/5 completed
[VERIFICATION] Failed
[DETAILS]
  - Error: Issue not specified
  - Available issues from recent checks:
    1. story-fetcher: timeout errors
    2. carousel-composer: memory leak
    3. database-manager: connection failures
  - Action: Specify issue to fix or use /check to identify issues
```

## Related Commands
- [/check](check.md) - Identify issues to fix
- [/analyze](analyze.md) - Analyze issues in detail
- [/troubleshoot](troubleshoot.md) - Systematically identify, trace, fix, and test visual/UI problems
- [/test](test.md) - Test after fixing
- [/validate](validate.md) - Validate fix

