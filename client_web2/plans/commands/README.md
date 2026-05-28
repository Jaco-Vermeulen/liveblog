# Commands Registry — client_web2

## client_web2 context

| Item | Value |
|------|-------|
| Project root | `client_web2/` |
| Plans | `client_web2/plans/` |
| Agent rules | `client_web2/AGENT_INSTRUCTIONS.md` |
| Dev server | `npm run dev` → **http://localhost:9001** (do not assume 5173/3000) |
| API | http://localhost:5000/api (Vite proxies `/api`) |
| Legacy reference | `../client/` (read-only) |
| Example mechanisms | `auth-manager`, `liveblog-api`, `blog-list-manager`, `editor-manager` |

Commands below are ported from **maroela_web2** (`maroela_demo/maroela_web2/plans/commands/`). Examples using `story-fetcher` / `card-composer` illustrate command behaviour — substitute **client_web2** mechanism names.

---

This directory contains command definitions for AI agents. When a user issues a command (e.g., `/run`, `/test`), the AI agent should:

1. Look up the command definition here
2. Follow the execution steps
3. Verify each step
4. Report status in the specified format
5. Handle errors according to the error handling section

## Command Naming
- Commands start with `/` (e.g., `/run`)
- Case-insensitive
- Can be triggered by exact match or variations

## Command Execution Flow
1. Parse user command
2. Match to command definition
3. Check prerequisites
4. Execute steps sequentially
5. Verify after each step
6. Report final status

## Adding New Commands
1. Create `[command].md` file
2. Follow command template
3. Add to index in README.md
4. Test command execution

## Critical Commands

### /planner - Plan Management
**NEVER modify mechanism plans directly!** Always use `/planner` command. This ensures:
- Dependency validation
- Overlap prevention
- Reference checking
- Plan integrity

### /implement - Implementation
Use this to execute implementation plans created via `/planner`. Ensures:
- Comprehensive planning before coding
- Progress tracking
- Resumability

## Command Categories

### Plan Management
- [/planner](planner.md) - **CRITICAL**: **ONLY WAY** to update/delete/change/create mechanism plans (validates dependencies, prevents overlaps, checks references)

### Implementation
- [/implement](implement.md) - **CRITICAL**: Execute implementation plan for a mechanism (gathers info, creates plan, implements step-by-step, tracks progress)

### Build/Deploy
- [/build](build.md) - Build a mechanism or entire system
- [/deploy](deploy.md) - Deploy to environment
- [/run](run.md) - Run/build a mechanism or system

### Testing
- [/test](test.md) - **COMPREHENSIVE**: Create and run tests with three levels (quick verification, code tests, final phase integration). **MANDATORY**: All tests must be created using this command. Includes screenshot capture and test parameter management.
- [/validate](validate.md) - Validate implementation against requirements

### Analysis
- [/analyze](analyze.md) - Analyze code, performance, or structure
- [/audit](audit.md) - Comprehensive audits (quick/comprehensive/extreme)
- [/check](check.md) - Quick check/health check
- [/debug](debug.md) - Debug issues and gather diagnostics
- [/status](status.md) - Check status of system/mechanism
- [/task](task.md) - **COMPREHENSIVE**: Analyze, audit, list, and report on all tasks (audit/list/report sub-commands)

### Setup/Initialization
- [/initialize](initialize.md) - **COMPREHENSIVE**: Initialize project, validate all dependencies, imports, versions, vulnerabilities, and configurations (first-time setup or existing project validation)

### Maintenance
- [/clean](clean.md) - Clean build artifacts, cache, etc.
- [/fix](fix.md) - Fix identified issues
- [/troubleshoot](troubleshoot.md) - **COMPREHENSIVE**: Systematically identify, trace, fix, and test visual/UI problems (flickering, duplicates, layout issues). Complete workflow with visual verification.
- [/rollback](rollback.md) - Rollback changes using changelog
- [/sync](sync.md) - Sync between versions or systems

## Command Index

| Command | Purpose | Category |
|---------|---------|----------|
| [/planner](planner.md) | **CRITICAL**: **ONLY WAY** to modify mechanism plans | Plan Management |
| [/implement](implement.md) | **CRITICAL**: Execute implementation plan for a mechanism | Implementation |
| [/initialize](initialize.md) | **COMPREHENSIVE**: Initialize project, validate dependencies, imports, versions, vulnerabilities | Setup/Initialization |
| [/run](run.md) | Run/build a mechanism or system | Build/Deploy |
| [/test](test.md) | **COMPREHENSIVE**: Create and run tests (3 levels: quick verification, code tests, final phase integration). **MANDATORY** for test creation. | Testing |
| [/build](build.md) | Build a mechanism or entire system | Build/Deploy |
| [/analyze](analyze.md) | Analyze code, performance, or structure | Analysis |
| [/audit](audit.md) | Comprehensive audits (quick/comprehensive/extreme) | Analysis |
| [/check](check.md) | Quick check/health check | Analysis |
| [/debug](debug.md) | Debug issues and gather diagnostics | Analysis |
| [/status](status.md) | Check status of system/mechanism | Analysis |
| [/task](task.md) | **COMPREHENSIVE**: Analyze, audit, list, and report on all tasks | Analysis |
| [/validate](validate.md) | Validate implementation against requirements | Testing |
| [/sync](sync.md) | Sync between versions or systems | Maintenance |
| [/rollback](rollback.md) | Rollback changes using changelog | Maintenance |
| [/clean](clean.md) | Clean build artifacts, cache, etc. | Maintenance |
| [/deploy](deploy.md) | Deploy to environment | Build/Deploy |
| [/fix](fix.md) | Fix identified issues | Maintenance |
| [/troubleshoot](troubleshoot.md) | **COMPREHENSIVE**: Systematically identify, trace, fix, and test visual/UI problems | Maintenance |

## Usage Examples

### Running a Mechanism
```
User: /run auth-manager
AI: [Follows run.md steps]
```

### Testing
```
User: /test create blog-list-manager
AI: [Follows test.md steps]

User: /test auth-manager
AI: [Follows test.md steps — dev server on port 9001, API on 5000]
```

### Checking Status
```
User: /status
AI: [Follows status.md steps]
```

### Debugging
```
User: /debug carousel-composer
AI: [Follows debug.md steps]
```

### Auditing
```
User: /audit comprehensive story-fetcher
AI: [Follows audit.md steps with comprehensive mode]
```

### Planning (Modifying Plans)
```
User: /planner create new mechanism "image-loader"
AI: [Follows planner.md steps]
  - Discusses the request
  - Analyzes implications (dependencies, overlaps, references)
  - Presents implications report for approval
  - Makes changes to plan files
  - Validates plan integrity (dependencies, references, overlaps)
  - Updates mechanism index
  - Reports completion
```

### Implementing a Mechanism
```
User: /implement story-fetcher
AI: [Follows implement.md steps]
  - Gathers information from plans and existing code
  - Analyzes base/web versions
  - Creates comprehensive implementation plan
  - Presents plan for approval
  - Implements step-by-step with progress tracking
  - Updates TASKS.md and CHANGELOG.md throughout
```

### Initializing Project
```
User: /initialize
AI: [Follows initialize.md steps]
  - Assesses project state (first-time vs existing)
  - Creates config files if needed (package.json, vite.config.ts, etc.)
  - Validates all dependencies and imports
  - Checks for syntax errors
  - Audits versions (icons, React, Apollo, etc.)
  - Checks for vulnerabilities and deprecations
  - Generates comprehensive report with action items
```

### Task Management
```
User: /task report
AI: [Follows task.md steps]
  - Collects all tasks from TASKS.md files
  - Analyzes task status and implementation state
  - Identifies recent activity and progress
  - Calculates timings and estimates
  - Generates recommendations (ordered)
  - Creates comprehensive manager report
  - Saves report to file

User: /task audit story-fetcher
AI: [Follows task.md audit steps]
  - Collects tasks for story-fetcher
  - Verifies completed tasks against actual code
  - Identifies unverified or missing implementations
  - Reports audit findings

User: /task list
AI: [Follows task.md list steps]
  - Collects all tasks across mechanisms
  - Organizes by mechanism and phase
  - Displays task counts and completion percentages
```

### Troubleshooting Visual Problems
```
User: /troubleshoot carousel-composer flickering cards
AI: [Follows troubleshoot.md steps]
  - Identifies visual problem (flickering cards)
  - Reproduces and captures initial state (screenshots, DOM inspection)
  - Performs visual inspection (React DevTools, console logs)
  - Traces code flow to find root cause
  - Analyzes root cause (unnecessary re-renders, unstable context)
  - Implements fix (memoization, stable keys)
  - Verifies fix visually (before/after screenshots)
  - Runs comprehensive tests
  - Documents resolution (CHANGELOG.md, troubleshooting report)

User: /troubleshoot duplicate cards
AI: [Follows troubleshoot.md steps]
  - Identifies problem (duplicate cards)
  - Traces through card-tracker and deduplication logic
  - Finds root cause (race condition in registration)
  - Fixes deduplication logic
  - Verifies no duplicates remain
  - Tests fix comprehensively
```

## Status Reporting Format

All commands should report status in this format:

```
[COMMAND] /[command]
[STATUS] Success/Failure/In Progress
[STEPS] X/Y completed
[VERIFICATION] Passed/Failed
[DETAILS] Additional information
```

