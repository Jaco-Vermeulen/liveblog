# Command: /deploy

## Trigger
The command is triggered when user says: `/deploy`, `deploy`, `/deploy [environment]`, or variations like "deploy to production"

## Purpose
Deploy to environment. This command checks deployment prerequisites, builds deployment package, executes deployment, verifies deployment, and runs smoke tests.

## Context
Use this command when:
- User wants to deploy to an environment
- User wants to publish changes
- User wants to release a version
- User wants to update production/staging

## Execution Steps

### Step 1: Check Deployment Prerequisites
- **Action**: Verify deployment requirements
  - Check if build is up-to-date
  - Check if tests pass
  - Check if environment variables are set
  - Check if deployment credentials are available
  - Check if target environment is accessible
  - Review mechanism README.md for deployment requirements
- **Verification**: All prerequisites met
- **On Success**: Proceed to Step 2
- **On Failure**: Report missing prerequisites

### Step 2: Build Deployment Package
- **Action**: Create deployment bundle
  - Run production build
  - Optimize assets
  - Create deployment package
  - Generate deployment manifest
  - Calculate package size
  - Verify package integrity
- **Verification**: Package created successfully
- **On Success**: Proceed to Step 3
- **On Failure**: Report build errors

### Step 3: Execute Deployment
- **Action**: Deploy to target environment
  - Upload deployment package
  - Update environment configuration
  - Run deployment scripts
  - Update version information
  - Monitor deployment progress
  - Check for deployment errors
- **Verification**: Deployment executes
- **On Success**: Proceed to Step 4
- **On Failure**: Report deployment errors, attempt rollback

### Step 4: Verify Deployment
- **Action**: Confirm deployment success
  - Check if files are deployed correctly
  - Verify version is updated
  - Check if services are running
  - Verify environment configuration
  - Check deployment logs
- **Verification**: Deployment is verified
- **On Success**: Proceed to Step 5
- **On Failure**: Report verification failures

### Step 5: Run Smoke Tests
- **Action**: Execute basic functionality tests
  - Run critical path tests
  - Verify key features work
  - Check API endpoints (if applicable)
  - Verify database connections (if applicable)
  - Check for critical errors
- **Verification**: Smoke tests pass
- **On Success**: Command complete
- **On Failure**: Report test failures, suggest fixes

## Pre-requisites
- [ ] Build is successful
- [ ] Tests pass
- [ ] Deployment credentials available
- [ ] Target environment accessible
- [ ] Deployment scripts configured
- [ ] Backup of current deployment (recommended)

## Verification Steps
1. Prerequisites checked
2. Package built successfully
3. Deployment executed
4. Deployment verified
5. Smoke tests passed

## Success Criteria
- [ ] Prerequisites met
- [ ] Package built
- [ ] Deployment executed
- [ ] Deployment verified
- [ ] Smoke tests passed

## Status Reporting Format
```
[COMMAND] /deploy [environment]
[STATUS] Success/Failure/In Progress
[STEPS] X/5 completed
[VERIFICATION] Passed/Failed
[DETAILS]
  - Environment: [environment name]
  - Version: [version]
  - Package size: [size]
  - Deployment time: [time]
  - Smoke tests: [passed/failed]
  - URL: [deployment URL if applicable]
  - Next steps: [recommendations]
```

## Error Handling

### Prerequisites Not Met
- **Error**: Deployment prerequisites not satisfied
- **Handling**: List missing prerequisites
- **Action**: Fix prerequisites before deploying

### Build Failure
- **Error**: Deployment package build fails
- **Handling**: Report build errors
- **Action**: Fix build issues, retry

### Deployment Failure
- **Error**: Deployment process fails
- **Handling**: Report deployment errors
- **Action**: Check deployment logs, attempt rollback if needed

### Verification Failure
- **Error**: Deployment verification fails
- **Handling**: Report what failed
- **Action**: Investigate issues, consider rollback

### Smoke Test Failure
- **Error**: Smoke tests fail after deployment
- **Handling**: Report test failures
- **Action**: Fix issues or rollback deployment

## Examples

### Example 1: Successful Deployment
```
User: /deploy staging
AI:
[COMMAND] /deploy staging
[STATUS] Success
[STEPS] 5/5 completed
[VERIFICATION] Passed
[DETAILS]
  - Environment: staging
  - Version: 1.2.3
  - Package size: 2.3 MB
  - Deployment time: 45.2s
  - Smoke tests: ✅ Passed (12/12)
  - URL: https://staging.maroela.com
  - Next steps: Deployment successful. Monitor for issues.
```

### Example 2: Deployment Failure
```
User: /deploy production
AI:
[COMMAND] /deploy production
[STATUS] Failure
[STEPS] 3/5 completed
[VERIFICATION] Failed
[DETAILS]
  - Environment: production
  - Error: Deployment failed during upload
  - Reason: Insufficient disk space on server
  - Action: 
    1. Free up disk space on server
    2. Or reduce package size
    3. Retry deployment
  - Note: Previous deployment remains active
```

### Example 3: Smoke Test Failure
```
User: /deploy staging
AI:
[COMMAND] /deploy staging
[STATUS] Failure
[STEPS] 5/5 completed
[VERIFICATION] Failed
[DETAILS]
  - Environment: staging
  - Version: 1.2.4
  - Package size: 2.4 MB
  - Deployment time: 42.1s
  - Smoke tests: ❌ Failed (8/12 passed)
  - Failures:
    1. Story fetcher API endpoint not responding
    2. Database connection timeout
    3. Carousel composer not rendering
    4. Cache not initializing
  - Action: Investigate failures, consider rollback
```

## Related Commands
- [/build](build.md) - Build before deploying
- [/test](test.md) - Test before deploying
- [/rollback](rollback.md) - Rollback if deployment fails
- [/status](status.md) - Check deployment status

