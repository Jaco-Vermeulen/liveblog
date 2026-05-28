# Command: /initialize

## Trigger
The command is triggered when user says: `/initialize`, `initialize`, `/init`, or variations like "initialize project" or "set up project"

## Purpose
Comprehensive project initialization and validation. This command checks the current project state, validates all dependencies, imports, configurations, and ensures everything is in order. For first-time setup, it guides through creating all necessary configuration files. For existing projects, it performs comprehensive audits of dependencies, imports, versions, vulnerabilities, and deprecations.

## Context
Use this command when:
- User wants to initialize a new project from scratch
- User wants to verify project setup is complete
- User wants to check all dependencies and imports
- User wants to audit versions and detect mismatches
- User wants to check for vulnerabilities and deprecations
- User wants to ensure project is ready to run
- User suspects configuration or dependency issues

## Execution Steps

### Step 1: Assess Project State
- **Action**: Determine if this is first-time setup or existing project
  - Check if `package.json` exists in `client_web2/`
  - Check if `node_modules/` exists
  - Check for config files: `craco.config.js`, `tailwind.config.js`, `postcss.config.js`, `tsconfig.json`, `vite.config.ts`
  - Check if `src/` directory exists with any code
  - Check for build artifacts (`dist/`, `build/`)
- **Verification**: Project state is determined
- **On First-Time**: Proceed to Step 2 (First-Time Setup)
- **On Existing**: Proceed to Step 3 (Comprehensive Validation)

### Step 2: First-Time Setup (if needed)
- **Action**: Guide through initial project setup
  - **2.1: Check Working Directory**
    - Verify we're in `client_web2/` (CRITICAL - per AGENT_INSTRUCTIONS.md)
    - If not, STOP and report error
  - **2.2: Create package.json**
    - If missing, create `package.json` based on project requirements
    - Ask user about:
      - Build tool preference (Vite vs Create React App/Craco)
      - TypeScript vs JavaScript
      - Testing framework preference
    - Create appropriate `package.json` with dependencies
  - **2.3: Create Build Configuration**
    - If Vite: Create `vite.config.ts` or `vite.config.js`
    - If CRA/Craco: Create `craco.config.js`
    - Configure based on project structure
  - **2.4: Create TypeScript Configuration**
    - If TypeScript: Create `tsconfig.json` and related configs
    - Configure paths, includes, excludes appropriately
  - **2.5: Create Styling Configuration**
    - Create `tailwind.config.js` with appropriate content paths
    - Create `postcss.config.js` with Tailwind and Autoprefixer
    - Check for CSS entry point (`index.css`, `App.css`)
  - **2.6: Create Project Structure**
    - Verify `src/` directory exists
    - Create basic structure if needed (`src/index.tsx`, `src/App.tsx`)
    - Create `public/` directory if needed
  - **2.7: Install Dependencies**
    - Run `npm install` or `yarn install`
    - Verify installation completes successfully
- **Verification**: All required files created and dependencies installed
- **On Success**: Proceed to Step 3
- **On Failure**: Report missing items and guide user to fix

### Step 3: Comprehensive Dependency Check
- **Action**: Validate all dependencies
  - **3.1: Check package.json**
    - Read `package.json` from `client_web2/`
    - Verify it exists and is valid JSON
    - List all dependencies (dependencies and devDependencies)
  - **3.2: Check node_modules**
    - Verify `node_modules/` exists
    - Check if it's empty or missing packages
    - Compare installed packages vs package.json
    - Identify missing packages
  - **3.3: Check Package Lock Files**
    - Check for `package-lock.json` or `yarn.lock`
    - Verify lock file matches package.json
    - Check for lock file conflicts
  - **3.4: Audit Dependency Versions**
    - Check for version mismatches
    - Identify duplicate packages at different versions
    - Check for peer dependency warnings
- **Verification**: All dependencies validated
- **On Success**: Proceed to Step 4
- **On Failure**: Report missing or mismatched dependencies

### Step 4: Import and Require Validation
- **Action**: Check all imports and requires in codebase
  - **4.1: Scan All Source Files**
    - Find all `.ts`, `.tsx`, `.js`, `.jsx` files in `client_web2/src/`
    - Use codebase search to find all import/require statements
  - **4.2: Validate Import Paths**
    - Check if imported modules exist
    - Verify relative paths are correct
    - Check for circular dependencies
    - Verify TypeScript path mappings (if using)
  - **4.3: Validate Package Imports**
    - For each `import` from `node_modules`:
      - Verify package exists in `package.json`
      - Verify package is installed in `node_modules`
      - Check if version matches what's imported
  - **4.4: Check Icon Library Usage**
    - Find all icon imports (e.g., `react-icons`, `lucide-react`)
    - Verify icon library version matches usage
    - Check for deprecated icon names
    - Identify icons from wrong version
  - **4.5: Check GraphQL/Apollo Imports**
    - Verify `@apollo/client` imports match version
    - Check GraphQL query imports
    - Verify query syntax matches Apollo version
- **Verification**: All imports validated
- **On Success**: Proceed to Step 5
- **On Failure**: Report import errors with file locations

### Step 5: Syntax and Error Detection
- **Action**: Check for syntax errors and code issues
  - **5.1: TypeScript Compilation Check**
    - If TypeScript: Run `tsc --noEmit` to check for type errors
    - Capture all TypeScript errors
    - Report file locations and error messages
  - **5.2: ESLint Check**
    - If ESLint config exists: Run ESLint
    - Capture linting errors and warnings
    - Report critical issues
  - **5.3: Syntax Validation**
    - Parse all source files for syntax errors
    - Check for missing brackets, quotes, semicolons
    - Verify JSX/TSX syntax is correct
  - **5.4: Build Test**
    - Attempt to run build command (`npm run build` or equivalent)
    - Capture build errors
    - Check for missing dependencies during build
- **Verification**: Syntax errors identified
- **On Success**: Proceed to Step 6
- **On Failure**: Report syntax errors with locations

### Step 6: Version Auditing
- **Action**: Audit component and library versions
  - **6.1: Icon Library Audit**
    - Check installed version of icon libraries (`react-icons`, `lucide-react`)
    - Scan codebase for icon usage
    - Compare icon names used vs available in installed version
    - Report mismatches (e.g., using icons from v5 when v6 is installed)
  - **6.2: React Version Audit**
    - Check React version in package.json
    - Verify React DOM version matches
    - Check for React 19 compatibility issues
    - Verify hooks and API usage matches React version
  - **6.3: Router Version Audit**
    - Check `react-router-dom` version
    - Verify router API usage matches version
    - Check for deprecated router APIs
  - **6.4: Apollo Client Audit**
    - Check `@apollo/client` version
    - Verify Apollo hooks match version
    - Check query syntax matches version
  - **6.5: Build Tool Audit**
    - Check build tool version (Vite, Webpack, etc.)
    - Verify config syntax matches version
    - Check for deprecated config options
- **Verification**: Version mismatches identified
- **On Success**: Proceed to Step 7
- **On Failure**: Report version issues

### Step 7: Security and Deprecation Audit
- **Action**: Check for vulnerabilities and deprecations
  - **7.1: Vulnerability Check**
    - Run `npm audit` or equivalent
    - Capture all vulnerabilities (low, moderate, high, critical)
    - Categorize by severity
    - Check for known security issues
  - **7.2: Deprecation Check**
    - Check for deprecated packages in dependencies
    - Check npm registry for deprecation notices
    - Identify packages with no maintenance
  - **7.3: Outdated Packages**
    - Check for outdated packages (compare installed vs latest)
    - Identify packages significantly behind latest
    - Check for breaking changes in newer versions
  - **7.4: Peer Dependency Warnings**
    - Check for peer dependency mismatches
    - Verify React version compatibility
    - Check for conflicting peer dependencies
- **Verification**: Security and deprecation issues identified
- **On Success**: Proceed to Step 8
- **On Failure**: Report audit issues

### Step 8: Configuration Validation
- **Action**: Validate all configuration files
  - **8.1: Build Config Validation**
    - Validate `vite.config.ts` or `craco.config.js` syntax
    - Check for deprecated options
    - Verify paths and aliases are correct
  - **8.2: TypeScript Config Validation**
    - Validate `tsconfig.json` syntax
    - Check compiler options
    - Verify path mappings
    - Check include/exclude patterns
  - **8.3: Tailwind Config Validation**
    - Validate `tailwind.config.js` syntax
    - Check content paths match source structure
    - Verify plugins are installed
  - **8.4: PostCSS Config Validation**
    - Validate `postcss.config.js` syntax
    - Verify plugins are installed
  - **8.5: ESLint Config Validation**
    - If exists: Validate ESLint config
    - Check for deprecated rules
    - Verify plugins are installed
- **Verification**: All configs validated
- **On Success**: Proceed to Step 9
- **On Failure**: Report config errors

### Step 9: Generate Comprehensive Report
- **Action**: Compile all findings into comprehensive report
  - **9.1: Create Status Summary**
    - Overall project health status
    - First-time setup vs existing project
    - Critical issues count
    - Warnings count
  - **9.2: Create Issue Categories**
    - Missing files/configs
    - Missing dependencies
    - Import errors
    - Syntax errors
    - Version mismatches
    - Vulnerabilities
    - Deprecations
  - **9.3: Create Action Items**
    - Prioritized list of fixes needed
    - Commands to run
    - Files to create/modify
    - Dependencies to install/update
  - **9.4: Create Recommendations**
    - Suggestions for improvements
    - Best practices recommendations
    - Security recommendations
- **Verification**: Report is complete and actionable
- **On Success**: Command complete
- **On Failure**: Report partial findings

## Pre-requisites
- [ ] Working directory is `client_web2/` (CRITICAL)
- [ ] Node.js and npm/yarn installed
- [ ] Access to npm registry (for dependency checks)
- [ ] Read access to project files
- [ ] Write access for creating config files (if first-time)

## Verification Steps
1. Project state assessed (first-time vs existing)
2. All required config files exist (or created)
3. Dependencies installed and validated
4. All imports validated
5. No critical syntax errors
6. Version mismatches identified
7. Vulnerabilities and deprecations checked
8. Comprehensive report generated

## Success Criteria
- [ ] Project state determined
- [ ] First-time setup completed (if needed)
- [ ] All dependencies validated
- [ ] All imports validated
- [ ] Syntax errors identified (if any)
- [ ] Version audits completed
- [ ] Security audit completed
- [ ] Comprehensive report generated

## Status Reporting Format
```
[COMMAND] /initialize
[STATUS] Success/Failure/In Progress
[STEPS] X/9 completed
[VERIFICATION] Passed/Failed
[DETAILS]
  - Project State: [First-time setup / Existing project]
  - Config Files: [X/Y present]
  - Dependencies: [X installed, Y missing]
  - Import Errors: [count]
  - Syntax Errors: [count]
  - Version Mismatches: [count]
  - Vulnerabilities: [critical/high/moderate/low counts]
  - Deprecations: [count]
  - Critical Issues: [list]
  - Action Items: [prioritized list]
  - Recommendations: [suggestions]
```

## Error Handling

### Wrong Working Directory
- **Error**: Not in `client_web2/`
- **Handling**: STOP immediately, report error
- **Action**: User must navigate to correct directory or command must be run from `client_web2/`

### Missing Node.js/npm
- **Error**: Node.js or npm not installed
- **Handling**: Report missing tools
- **Action**: Guide user to install Node.js and npm

### Config File Creation Failure
- **Error**: Cannot create config files
- **Handling**: Report permission issues
- **Action**: Check write permissions, guide user to create manually

### Dependency Installation Failure
- **Error**: `npm install` fails
- **Handling**: Capture error output
- **Action**: Report specific errors, suggest fixes (network issues, registry problems, etc.)

### Import Validation Failure
- **Error**: Cannot validate imports
- **Handling**: Report files that couldn't be parsed
- **Action**: Check file permissions, syntax errors preventing parsing

### Build Tool Not Found
- **Error**: Build tool (Vite, Webpack, etc.) not found
- **Handling**: Report missing build tool
- **Action**: Install build tool or configure alternative

### Vulnerability Fix Required
- **Error**: Critical vulnerabilities found
- **Handling**: Report vulnerabilities with severity
- **Action**: Provide `npm audit fix` commands or manual fix instructions

### Version Mismatch Critical
- **Error**: Critical version mismatch (e.g., React version conflict)
- **Handling**: Report version conflicts
- **Action**: Guide user to resolve version conflicts, update packages

## Examples

### Example 1: First-Time Setup
```
User: /initialize
AI:
[COMMAND] /initialize
[STATUS] In Progress
[STEPS] 2/9 completed
[VERIFICATION] In Progress
[DETAILS]
  - Project State: First-time setup detected
  - Config Files: 0/5 present
  - Missing: package.json, vite.config.ts, tsconfig.json, tailwind.config.js, postcss.config.js
  
  Creating initial setup...
  
  Questions for setup:
  1. Build tool: Vite or Create React App/Craco? (Recommended: Vite)
  2. Language: TypeScript or JavaScript? (Recommended: TypeScript)
  3. Testing: Vitest or Jest? (Recommended: Vitest for Vite)
  
  [After user answers]
  
  Creating package.json...
  Creating vite.config.ts...
  Creating tsconfig.json...
  Creating tailwind.config.js...
  Creating postcss.config.js...
  Installing dependencies...
  
  [After completion]
  
[COMMAND] /initialize
[STATUS] Success
[STEPS] 9/9 completed
[VERIFICATION] Passed
[DETAILS]
  - Project State: First-time setup completed
  - Config Files: 5/5 present
  - Dependencies: 45 installed, 0 missing
  - Import Errors: 0
  - Syntax Errors: 0
  - Version Mismatches: 0
  - Vulnerabilities: 0 critical, 2 low
  - Deprecations: 0
  - Critical Issues: None
  - Action Items:
    1. ✅ Project initialized successfully
    2. Run /build to test build process
    3. Run /test to verify setup
  - Recommendations:
    - Consider running npm audit fix for low vulnerabilities
    - Project ready for development
```

### Example 2: Existing Project Validation
```
User: /initialize
AI:
[COMMAND] /initialize
[STATUS] Success
[STEPS] 9/9 completed
[VERIFICATION] Passed
[DETAILS]
  - Project State: Existing project
  - Config Files: 5/5 present
  - Dependencies: 45 installed, 0 missing
  - Import Errors: 2
  - Syntax Errors: 1
  - Version Mismatches: 3
  - Vulnerabilities: 0 critical, 1 high, 3 moderate, 5 low
  - Deprecations: 1
  - Critical Issues:
    1. Import error: src/components/Card.tsx - Cannot find module 'react-icons/fa' (using react-icons v5, but importing from v4 path)
    2. Syntax error: src/utils/helpers.ts:45 - Missing semicolon
    3. Version mismatch: react-icons v5 installed but code uses v4 API
  - Action Items:
    1. ⚠️ HIGH PRIORITY: Fix react-icons imports (update to v5 API)
    2. ⚠️ HIGH PRIORITY: Fix syntax error in helpers.ts
    3. ⚠️ MEDIUM PRIORITY: Update deprecated package: old-package@1.0.0 → new-package@2.0.0
    4. ⚠️ MEDIUM PRIORITY: Run npm audit fix for vulnerabilities
    5. ⚠️ LOW PRIORITY: Update outdated packages (5 packages behind latest)
  - Recommendations:
    - Fix import errors before building
    - Update react-icons usage to v5 API (see migration guide)
    - Run npm audit fix --force for moderate vulnerabilities (review changes)
    - Consider updating outdated packages during next maintenance window
```

### Example 3: Critical Issues Found
```
User: /initialize
AI:
[COMMAND] /initialize
[STATUS] Failure
[STEPS] 6/9 completed
[VERIFICATION] Failed
[DETAILS]
  - Project State: Existing project
  - Config Files: 5/5 present
  - Dependencies: 40 installed, 5 missing
  - Import Errors: 15
  - Syntax Errors: 8
  - Version Mismatches: 12
  - Vulnerabilities: 2 critical, 5 high, 10 moderate
  - Deprecations: 3
  - Critical Issues:
    1. ❌ CRITICAL: Missing dependencies: @apollo/client, react-router-dom, tailwindcss
    2. ❌ CRITICAL: React version conflict (React 19 installed but react-dom 18.2.0)
    3. ❌ CRITICAL: 2 critical security vulnerabilities in dependencies
    4. ❌ CRITICAL: Multiple import errors preventing build
    5. ⚠️ HIGH: TypeScript config errors preventing compilation
  - Action Items:
    1. 🚨 IMMEDIATE: Run npm install to install missing dependencies
    2. 🚨 IMMEDIATE: Fix React version conflict (update react-dom to match React 19)
    3. 🚨 IMMEDIATE: Address critical vulnerabilities (run npm audit fix)
    4. 🚨 IMMEDIATE: Fix import errors (15 files affected)
    5. ⚠️ HIGH: Fix TypeScript configuration
    6. ⚠️ HIGH: Update deprecated packages
    7. ⚠️ MEDIUM: Fix syntax errors
  - Recommendations:
    - Project is not ready to run. Fix critical issues first.
    - Consider running /fix command after addressing critical issues
    - Review security vulnerabilities immediately
    - Fix version conflicts before proceeding
```

## Related Commands
- [/check](check.md) - Quick health check (lighter version)
- [/status](status.md) - Detailed status check
- [/build](build.md) - Build after initialization
- [/test](test.md) - Test after initialization
- [/fix](fix.md) - Fix issues identified by initialize
- [/audit](audit.md) - Comprehensive audit (complementary to initialize)

## Notes
- This command is comprehensive and may take time to complete
- For quick checks, use `/check` instead
- Run this command after cloning repository or when setting up new environment
- Run this command when experiencing dependency or import issues
- This command should be run before `/build` or `/run` to ensure project is ready
- First-time setup will ask questions - answer based on project requirements
- Always verify working directory is `client_web2/` before proceeding


