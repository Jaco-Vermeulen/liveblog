# Command: /build

## Trigger
The command is triggered when user says: `/build`, `build`, `/build [target]`, or variations like "build the carousel composer"

## Purpose
Build a mechanism or entire system. This command checks build prerequisites, executes build steps, verifies build artifacts, checks for errors, and reports build status.

## Context
Use this command when:
- User wants to build a specific mechanism
- User wants to compile TypeScript/JavaScript
- User wants to create production bundles
- User wants to verify build configuration
- User wants to prepare for deployment

## Execution Steps

### Step 1: Check Build Prerequisites
- **Action**: Verify prerequisites are met
  - Check if build tools are installed (TypeScript, Vite, Webpack, etc.)
  - Check if dependencies are installed (node_modules exists)
  - Check if build configuration files exist (tsconfig.json, vite.config.ts, etc.)
  - Check if required environment variables are set
  - Review mechanism README.md for build requirements
- **Verification**: All prerequisites must pass
- **On Success**: Proceed to Step 2
- **On Failure**: Report missing prerequisites and suggest fixes

### Step 2: Execute Build Steps
- **Action**: Run the build process
  - Execute build command (e.g., `npm run build`, `vite build`, `tsc`)
  - If specific target: Build only that mechanism
  - Monitor build output for errors and warnings
  - Capture build logs
  - Check mechanism TASKS.md for specific build instructions
- **Verification**: Build process executes
- **On Success**: Proceed to Step 3
- **On Failure**: Capture error details and proceed to error handling

### Step 3: Verify Build Artifacts
- **Action**: Verify build outputs exist
  - Check if expected output files/directories exist
  - Verify file sizes are reasonable (not empty, not suspiciously large)
  - Check if source maps are generated (if configured)
  - Verify build artifacts match expected structure
  - Check mechanism README.md for expected outputs
- **Verification**: All expected artifacts exist
- **On Success**: Proceed to Step 4
- **On Failure**: Report missing artifacts

### Step 4: Check for Errors
- **Action**: Analyze build output for errors
  - Review build logs for errors
  - Check for TypeScript/compilation errors
  - Check for bundling errors
  - Check for missing dependencies
  - Check for configuration errors
  - Review warnings (may indicate issues)
- **Verification**: Errors are identified
- **On Success**: Proceed to Step 5
- **On Failure**: Report analysis failure

### Step 5: Report Build Status
- **Action**: Compile and present build results
  - Format status report using standard format
  - Include build time
  - Include artifact sizes
  - Include error count and warnings
  - Include next steps or recommendations
- **Verification**: Report is complete and accurate
- **On Success**: Command complete
- **On Failure**: Report partial results with error details

## Pre-requisites
- [ ] Build tools installed (TypeScript, bundler, etc.)
- [ ] Dependencies installed (check package.json)
- [ ] Build configuration files exist
- [ ] Required environment variables set (if any)
- [ ] Sufficient disk space available
- [ ] Write permissions for output directory

## Verification Steps
1. Build process completes (success or failure)
2. Expected build artifacts exist
3. Artifact sizes are reasonable
4. No critical errors in build output
5. Build logs are accessible

## Success Criteria
- [ ] All prerequisites met
- [ ] Build executed successfully
- [ ] Build artifacts verified
- [ ] No critical errors
- [ ] Build status reported clearly

## Status Reporting Format
```
[COMMAND] /build [target]
[STATUS] Success/Failure/In Progress
[STEPS] X/5 completed
[VERIFICATION] Passed/Failed
[DETAILS]
  - Target: [target name]
  - Build time: [time]
  - Artifacts: [list]
  - Total size: [size]
  - Errors: [count]
  - Warnings: [count]
  - Next steps: [recommendations]
```

## Error Handling

### Build Tools Not Available
- **Error**: Build tools not installed
- **Handling**: Check package.json for build scripts
- **Action**: Install build tools or configure build environment

### Dependencies Missing
- **Error**: Required dependencies not installed
- **Handling**: Check package.json and node_modules
- **Action**: Run `npm install` or install missing dependencies

### Configuration Errors
- **Error**: Build configuration is invalid
- **Handling**: Parse configuration file errors
- **Action**: Fix configuration file, check mechanism COMMENTS.md for known issues

### Compilation Errors
- **Error**: TypeScript/JavaScript compilation fails
- **Handling**: Capture compilation error details
- **Action**: Fix code errors, check type definitions, review error messages

### Missing Artifacts
- **Error**: Expected build artifacts don't exist
- **Handling**: List expected vs actual artifacts
- **Action**: Check build configuration, verify output paths

### Build Warnings
- **Error**: Build succeeds but has warnings
- **Handling**: Report warnings but don't fail
- **Action**: Review warnings, fix if critical, document in COMMENTS.md

## Examples

### Example 1: Successful Build
```
User: /build carousel-composer
AI:
[COMMAND] /build carousel-composer
[STATUS] Success
[STEPS] 5/5 completed
[VERIFICATION] Passed
[DETAILS]
  - Target: carousel-composer
  - Build time: 12.3s
  - Artifacts:
    - dist/carousel-composer.js (245 KB)
    - dist/carousel-composer.js.map (892 KB)
  - Total size: 1.1 MB
  - Errors: 0
  - Warnings: 2 (non-critical)
  - Next steps: Build successful. Use /test to verify functionality.
```

### Example 2: Build with Errors
```
User: /build story-fetcher
AI:
[COMMAND] /build story-fetcher
[STATUS] Failure
[STEPS] 4/5 completed
[VERIFICATION] Failed
[DETAILS]
  - Target: story-fetcher
  - Build time: 3.1s
  - Artifacts: None (build failed)
  - Errors: 3
  - Warnings: 0
  - Error details:
    1. src/story-fetcher.ts:45 - Type 'string | undefined' is not assignable to type 'string'
    2. src/story-fetcher.ts:78 - Cannot find module './utils/query-builder'
    3. src/story-fetcher.ts:102 - Property 'fetch' does not exist on type 'Window'
  - Next steps: Fix compilation errors and rebuild
```

### Example 3: Missing Prerequisites
```
User: /build
AI:
[COMMAND] /build (entire system)
[STATUS] Failure
[STEPS] 1/5 completed
[VERIFICATION] Failed
[DETAILS]
  - Target: entire system
  - Error: Prerequisites not met
  - Missing:
    - TypeScript compiler not found
    - Vite not installed
  - Action: Run 'npm install' to install dependencies
```

## Related Commands
- [/run](run.md) - Run after building
- [/test](test.md) - Test after building
- [/deploy](deploy.md) - Deploy after building
- [/clean](clean.md) - Clean before building

