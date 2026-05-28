# Command: /run

## Trigger
The command is triggered when user says: `/run`, `run`, `/run [target]`, or variations like "run the story fetcher"

## Purpose
Run/build a mechanism or system. This command identifies what needs to run, checks prerequisites, executes build/run steps, verifies execution, and reports results.

## Context
Use this command when:
- User wants to run a specific mechanism
- User wants to build and run the entire system
- User wants to start a development server
- User wants to execute a specific component

## Execution Steps

### Step 1: Identify Target
- **Action**: Parse user input to identify what to run
  - If target specified: Use that target (e.g., "story-fetcher", "carousel-composer")
  - If no target: Determine default (usually entire system or current working mechanism)
  - Check if target exists in mechanisms/ directory
- **Verification**: Confirm target is valid and accessible
- **On Success**: Proceed to Step 2
- **On Failure**: Report error: "Target '[target]' not found. Available targets: [list]"

### Step 2: Check Prerequisites
- **Action**: Verify prerequisites are met
  - Check if required dependencies are installed (node_modules, packages)
  - Check if required files exist
  - Check if required environment variables are set
  - Check if database/storage is accessible
  - Review mechanism README.md for specific prerequisites
- **Verification**: All prerequisites must pass
- **On Success**: Proceed to Step 3
- **On Failure**: Report missing prerequisites and suggest fixes

### Step 3: Execute Build/Run Steps
- **Action**: Execute the run sequence
  - If mechanism has build step: Run build command (e.g., `npm run build`, `vite build`)
  - If mechanism needs compilation: Compile TypeScript/JavaScript
  - If mechanism is a service: Start the service
  - If mechanism is a component: Verify it can be imported/used
  - Check mechanism TASKS.md for specific run instructions
- **Verification**: Monitor execution output for errors
- **On Success**: Proceed to Step 4
- **On Failure**: Capture error details and proceed to error handling

### Step 4: Verify Execution
- **Action**: Verify the mechanism is running correctly
  - Check if process/service is running (if applicable)
  - Check if build artifacts exist (if applicable)
  - Check if no errors in console/logs
  - Run basic smoke tests if available
  - Check mechanism-specific verification steps from README.md
- **Verification**: All verification checks pass
- **On Success**: Proceed to Step 5
- **On Failure**: Report verification failures

### Step 5: Check Status/Logs
- **Action**: Gather runtime information
  - Check process status
  - Review recent logs for warnings/errors
  - Check resource usage (if applicable)
  - Verify expected outputs/endpoints are available
- **Verification**: Status information is accessible
- **On Success**: Proceed to Step 6
- **On Failure**: Report inability to check status

### Step 6: Report Results
- **Action**: Compile and present results
  - Format status report using standard format
  - Include execution time
  - Include any warnings
  - Include next steps or recommendations
- **Verification**: Report is complete and accurate
- **On Success**: Command complete
- **On Failure**: Report partial results with error details

## Pre-requisites
- [ ] Target mechanism exists in mechanisms/ directory
- [ ] Required dependencies installed (check package.json)
- [ ] Required environment variables set (if any)
- [ ] Database/storage accessible (if required)
- [ ] No conflicting processes running (if applicable)

## Verification Steps
1. Process/service is running (if applicable)
2. Build artifacts exist (if build was required)
3. No critical errors in logs
4. Basic functionality accessible
5. Expected outputs/endpoints respond correctly

## Success Criteria
- [ ] Target identified successfully
- [ ] All prerequisites met
- [ ] Execution completed without critical errors
- [ ] Verification checks passed
- [ ] Status information available
- [ ] Results reported clearly

## Status Reporting Format
```
[COMMAND] /run [target]
[STATUS] Success/Failure/In Progress
[STEPS] X/6 completed
[VERIFICATION] Passed/Failed
[DETAILS] 
  - Target: [target name]
  - Execution time: [time]
  - Warnings: [list]
  - Next steps: [recommendations]
```

## Error Handling

### Target Not Found
- **Error**: Target mechanism doesn't exist
- **Handling**: List available mechanisms from mechanisms/ directory
- **Action**: Ask user to specify correct target

### Prerequisites Not Met
- **Error**: Missing dependencies or configuration
- **Handling**: List missing prerequisites
- **Action**: Provide installation/configuration instructions

### Build Failure
- **Error**: Build process fails
- **Handling**: Capture build error output
- **Action**: Analyze error, suggest fixes, check COMMENTS.md for known issues

### Execution Failure
- **Error**: Mechanism fails to run
- **Handling**: Capture error logs
- **Action**: Check mechanism COMMENTS.md, review CHANGELOG.md for recent changes

### Verification Failure
- **Error**: Verification checks fail
- **Handling**: Report which checks failed
- **Action**: Investigate root cause, check mechanism documentation

## Examples

### Example 1: Run Specific Mechanism
```
User: /run story-fetcher
AI: 
[COMMAND] /run story-fetcher
[STATUS] In Progress
[STEPS] 1/6 completed
[DETAILS] Target identified: story-fetcher

[STATUS] In Progress
[STEPS] 2/6 completed
[DETAILS] Prerequisites checked: All met

[STATUS] Success
[STEPS] 6/6 completed
[VERIFICATION] Passed
[DETAILS] 
  - Target: story-fetcher
  - Execution time: 2.3s
  - Warnings: None
  - Next steps: Mechanism is running. Use /status to check runtime status.
```

### Example 2: Run Entire System
```
User: /run
AI:
[COMMAND] /run (entire system)
[STATUS] In Progress
[STEPS] 1/6 completed
[DETAILS] Target identified: entire system (all mechanisms)

[STATUS] Success
[STEPS] 6/6 completed
[VERIFICATION] Passed
[DETAILS]
  - Target: entire system
  - Execution time: 15.7s
  - Warnings: 2 non-critical warnings in carousel-composer
  - Next steps: System is running. Use /status for detailed status.
```

### Example 3: Prerequisites Not Met
```
User: /run database-manager
AI:
[COMMAND] /run database-manager
[STATUS] Failure
[STEPS] 2/6 completed
[VERIFICATION] Failed
[DETAILS]
  - Target: database-manager
  - Error: Prerequisites not met
  - Missing: IndexedDB API not available (check browser compatibility)
  - Action: Ensure browser supports IndexedDB or use fallback storage
```

## Related Commands
- [/build](build.md) - Build without running
- [/status](status.md) - Check runtime status
- [/test](test.md) - Run tests after execution
- [/check](check.md) - Quick health check

