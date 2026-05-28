# Command: /troubleshoot

## Trigger
The command is triggered when user says: `/troubleshoot`, `troubleshoot`, `/troubleshoot [issue]`, `/troubleshoot [target] [issue]`, or variations like "troubleshoot flickering cards", "investigate visual problem", "fix display issue"

## Purpose
**COMPREHENSIVE VISUAL PROBLEM RESOLUTION**: Systematically identify, trace, fix, and test visual/UI problems. This command provides a complete workflow for resolving visual issues like flickering, duplicate displays, layout problems, rendering glitches, and state-related visual bugs. Focuses on visual problems with systematic root cause analysis, fix implementation, and visual verification.

## Key Improvements (Updated to Address Documentation Issues)

### Progressive Documentation (Not Just at the End)
- **Documentation files are created IMMEDIATELY** at the start of Step 1, not at the end
- **Documentation is updated PROGRESSIVELY** after every operation, not just at completion
- **troubleshooting-log.md** provides real-time record of ALL operations as they happen
- **troubleshooting-report.md** is updated incrementally as information is gathered
- **troubleshooting-data.json** is updated after every operation to keep data current

### Screenshot Enforcement
- **Screenshots MUST be saved to disk** - verification checks ensure files exist before proceeding
- **Screenshots are logged immediately** in troubleshooting-log.md when captured
- **Screenshot verification is mandatory** - operations cannot proceed if screenshots don't exist
- **All screenshots are referenced** in troubleshooting-report.md as they are taken

### Complete Operation Logging
- **Every operation is logged** in troubleshooting-log.md before and after execution
- **Failed attempts are documented** with reasons and next steps
- **Multiple fix attempts are tracked** with results for each attempt
- **Complete chronological record** provides full troubleshooting history, even if interrupted

### Real-Time Documentation
- **No waiting until the end** - documentation happens as troubleshooting proceeds
- **If troubleshooting is interrupted**, complete record exists in troubleshooting-log.md
- **All attempts are documented**, not just successful ones
- **Visual states are captured and documented** immediately when observed

## Context
Use this command when:
- User reports visual/UI problems (flickering, duplicates, layout issues, rendering glitches)
- User wants to investigate display problems systematically
- User wants to trace root causes of visual issues through code
- User wants to fix visual problems with proper testing
- User wants visual verification of fixes (before/after comparison)
- User struggles with identifying what's causing visual problems

## Critical Rules

### Rule 1: Visual Problem Focus
- **PRIMARY USE**: Visual/UI problems only (flickering, duplicates, layout, rendering)
- **NOT FOR**: Non-visual bugs (use `/fix` or `/debug` instead)
- **SCOPE**: Problems that manifest visually in the browser/UI

### Rule 2: Complete Workflow
- **MANDATORY STEPS**: Identify → Inspect → Trace → Fix → Test → Verify
- **NO SHORTCUTS**: Must complete all steps for proper resolution
- **VISUAL VERIFICATION**: Always capture before/after screenshots

### Rule 3: Browser-Based Inspection
- **REQUIRED**: Use browser MCP tools for visual inspection
- **SCREENSHOTS**: Capture screenshots at key points (before fix, after fix)
- **DOM INSPECTION**: Inspect DOM state, CSS, React component tree
- **STATE CAPTURE**: Capture React state, props, and component hierarchy

### Rule 4: Root Cause Tracing
- **SYSTEMATIC**: Trace through code flow from visual symptom to root cause
- **STATE TRACKING**: Track state changes that cause visual issues
- **DEPENDENCY CHECKING**: Check dependencies, hooks, context providers
- **RE-RENDER ANALYSIS**: Identify unnecessary re-renders causing flickering

### Rule 5: Visual Testing - CRITICAL: ACTUAL VISUAL STATE VERIFICATION
- **MANDATORY**: You MUST ACTUALLY SEE the visual state, not assume it
- **FORBIDDEN**: Do NOT assume code changes fixed the visual problem
- **FORBIDDEN**: Do NOT skip visual verification
- **BEFORE/AFTER**: Always compare ACTUAL visual state before and after fix
  - Take screenshots showing ACTUAL visual state
  - **LOOK** at the screenshots - can you SEE the fix?
  - **VERIFY** visually that the problem is gone
- **REGRESSION CHECK**: Verify fix doesn't break other visual aspects by LOOKING at them
- **SCREENSHOT COMPARISON**: Use screenshots to verify visual fixes - compare what you SEE
- **INTEGRATION**: Use `/test` command for comprehensive testing after fix

### Rule 6: Screenshot Saving (CRITICAL - MUST SAVE TO DISK)
- **FORBIDDEN**: **NEVER** just take screenshots without saving them
- **FORBIDDEN**: **NEVER** reference screenshots that don't exist
- **MANDATORY**: **ALWAYS** save screenshots to disk using browser MCP tools
- **MANDATORY**: **ALWAYS** save screenshots to `plans/reports/troubleshooting/[problem-title]/screenshots/` folder
- **MANDATORY**: **ALWAYS** verify screenshot files exist before referencing them
- **How to save screenshots**:
  1. Create `screenshots/` folder in problem directory (if it doesn't exist)
  2. Use browser MCP tool: `browser_take_screenshot` with `filename` parameter
  3. Save to: `plans/reports/troubleshooting/[problem-title]/screenshots/[filename].png`
  4. **VERIFY**: Check file exists after saving
  5. Use numbered filenames: `01-initial-state.png`, `02-problem-reproduced.png`, etc.
- **Failure handling**: If screenshot cannot be saved, report error and retry
- **Why this matters**: Screenshots are proof of fixes - they must exist on disk to be referenced later

### Rule 7: Port Detection (CRITICAL - NO ASSUMPTIONS)
- **FORBIDDEN**: **NEVER** assume default ports (3000, 5173, 8080, etc.)
- **FORBIDDEN**: **NEVER** hardcode port numbers
- **MANDATORY**: **ALWAYS** detect the actual running port before testing/troubleshooting
- **MANDATORY**: **ALWAYS** check what port the dev server is actually running on
- **How to detect port**:
  1. Check `package.json` scripts for dev server command
  2. Check `vite.config.ts` or build config for configured port
  3. **MOST IMPORTANT**: Check running processes or ask user what port is active
  4. **MOST IMPORTANT**: Use browser MCP tools to navigate to actual running URL
  5. If port cannot be determined: **ASK USER** - do not guess
- **Failure handling**: If port cannot be detected, report error and ask user for correct port
- **Why this matters**: Default ports often don't match actual running ports, causing all visual verification to fail

### Rule 8: Progressive Documentation (CRITICAL - DOCUMENT AS YOU GO)
- **FORBIDDEN**: **NEVER** wait until the end to document troubleshooting steps
- **FORBIDDEN**: **NEVER** skip documentation of attempts, failures, or operations
- **MANDATORY**: **ALWAYS** create and update documentation files IMMEDIATELY as troubleshooting proceeds
- **MANDATORY**: **ALWAYS** document each step, attempt, and operation in real-time
- **Why this matters**: Troubleshooting is iterative - if interrupted or if attempts fail, there must be a record of what was tried
- **Documentation files to create/update immediately**:
  1. **troubleshooting-log.md** - Created at START of Step 1, updated after EVERY operation
  2. **troubleshooting-report.md** - Created at START of Step 1, updated progressively
  3. **troubleshooting-data.json** - Created at START of Step 1, updated after EVERY operation
  4. **README.md** - Created at START of Step 1, updated when status changes
- **When to document**:
  - **BEFORE** starting any operation: Log intent in troubleshooting-log.md
  - **AFTER** completing any operation: Log result (success/failure) in troubleshooting-log.md
  - **AFTER** taking any screenshot: Update troubleshooting-report.md with screenshot reference
  - **AFTER** any code change: Update troubleshooting-report.md with change details
  - **AFTER** any failed attempt: Log failure reason and next steps in troubleshooting-log.md
  - **IMMEDIATELY** when visual state changes: Take screenshot and document in troubleshooting-log.md
- **What to document**:
  - Every operation attempted (with timestamp)
  - Every screenshot taken (with filename and description)
  - Every code change made (with file and line numbers)
  - Every failure encountered (with error details and reason)
  - Every hypothesis tested (with result)
  - Every fix attempted (with result)
  - Every visual state observed (with screenshot reference)

### Rule 9: Attempt Logging (CRITICAL - LOG ALL OPERATIONS)
- **FORBIDDEN**: **NEVER** proceed with operations without logging them first
- **FORBIDDEN**: **NEVER** skip logging failed attempts or operations that didn't work
- **MANDATORY**: **ALWAYS** log every operation, attempt, and result in troubleshooting-log.md
- **MANDATORY**: **ALWAYS** include timestamps, operation type, result, and next steps
- **Why this matters**: Troubleshooting involves multiple attempts - we need a complete record of what was tried, what failed, and why
- **Log format** (in troubleshooting-log.md):
  ```markdown
  ## [Timestamp] - [Operation Type]
  - **Action**: [What was attempted]
  - **Result**: [Success/Failure/Partial]
  - **Details**: [What happened, what was observed]
  - **Screenshot**: [Filename if visual state captured]
  - **Code Changes**: [Files changed if applicable]
  - **Next Steps**: [What to try next]
  - **Notes**: [Any observations, hypotheses, or issues]
  ```
- **Operations that MUST be logged**:
  - Problem identification
  - Screenshot capture (with verification that file exists)
  - Code inspection
  - Hypothesis formation
  - Code changes
  - Visual verification attempts
  - Test execution
  - Failed attempts (with reason for failure)
  - Successful operations
  - Status changes

## Troubleshooting Report Structure

### Problem-Based Organization
Troubleshooting is organized by **problem**, not mechanism, because problems can span multiple mechanisms.

### File Structure
```
plans/reports/troubleshooting/
└── [problem-title]/                    # Problem-based folder (e.g., "card-flickering-on-scroll")
    ├── README.md                        # Problem overview, quick reference (created at START, updated progressively)
    ├── troubleshooting-log.md           # Real-time log of ALL operations and attempts (created at START, updated after EVERY operation)
    ├── troubleshooting-report.md        # Main report with picture references (created at START, updated progressively)
    ├── troubleshooting-data.json       # Machine-readable data (created at START, updated after EVERY operation)
    ├── screenshots/                     # All screenshots organized
    │   ├── 01-initial-state.png
    │   ├── 02-problem-reproduced.png
    │   ├── 03-before-fix.png
    │   ├── 04-after-fix.png
    │   ├── 05-verification.png
    │   ├── [attempt-number]-[description].png  # Screenshots from failed attempts
    │   └── ...
    └── iterations/                      # If troubleshooting same problem multiple times
        └── [timestamp]/
            ├── iteration-report.md
            └── screenshots/
```

### Documentation File Purposes

#### troubleshooting-log.md (CRITICAL - Real-Time Operations Log)
- **Purpose**: Complete chronological log of ALL operations, attempts, and results
- **Created**: At START of Step 1 (immediately after problem identification)
- **Updated**: After EVERY operation, attempt, screenshot, code change, or status change
- **Content**: 
  - Timestamped entries for every operation
  - All attempts (successful and failed)
  - All screenshots taken (with verification that file exists)
  - All code changes made
  - All hypotheses tested
  - All failures encountered (with reasons)
  - All visual states observed
- **Format**: Chronological entries with timestamps
- **Why critical**: Provides complete record of troubleshooting process, even if interrupted or if attempts fail
- **Example Format**:
  ```markdown
  # Troubleshooting Log: [Problem Title]
  
  ## [2024-01-15 10:30:00] - Problem Identification
  - **Action**: Identified visual problem: cards flickering on scroll
  - **Result**: Success
  - **Details**: Problem occurs in carousel-composer when scrolling horizontally
  - **Affected Mechanisms**: carousel-composer, card-composer
  - **Status**: investigating
  - **Next Steps**: Reproduce and capture initial state
  
  ## [2024-01-15 10:31:00] - Screenshot Capture
  - **Action**: Taking initial state screenshot
  - **Result**: Success
  - **Details**: Captured initial visual state showing flickering
  - **Screenshot**: `01-initial-state.png`
  - **File Verified**: Yes (file exists at screenshots/01-initial-state.png)
  - **Visual Observation**: Cards visible, flickering occurs on scroll
  - **Next Steps**: Reproduce problem and capture screenshot
  
  ## [2024-01-15 10:32:00] - Problem Reproduction
  - **Action**: Reproducing visual problem
  - **Result**: Success
  - **Details**: Scrolled carousel, flickering clearly visible
  - **Screenshot**: `02-problem-reproduced.png`
  - **File Verified**: Yes
  - **Next Steps**: Visual inspection and code tracing
  
  ## [2024-01-15 10:35:00] - Code Change Attempt 1
  - **Action**: Attempting fix: Memoize CardTrackerContext value
  - **Result**: Failure
  - **Details**: Changed CardTrackerContext.tsx line 45, added useMemo. Visual verification shows flickering still occurs.
  - **Code Changes**: src/mechanisms/carousel-composer/subsystems/card-tracker/CardTrackerContext.tsx:45
  - **Screenshot**: `03-attempt-1-after.png`
  - **File Verified**: Yes
  - **Reason for Failure**: Memoization didn't prevent re-renders, need to check dependency array
  - **Next Steps**: Try fix attempt 2: Fix dependency array in useCardTracker hook
  
  ## [2024-01-15 10:40:00] - Code Change Attempt 2
  - **Action**: Attempting fix: Fix dependency array in useCardTracker hook
  - **Result**: Success
  - **Details**: Fixed dependency array in useCardTracker.ts line 23. Visual verification shows flickering resolved.
  - **Code Changes**: src/mechanisms/carousel-composer/subsystems/card-tracker/useCardTracker.ts:23
  - **Screenshot**: `04-after-fix.png`
  - **File Verified**: Yes
  - **Visual Observation**: No flickering observed, cards scroll smoothly
  - **Next Steps**: Run comprehensive tests
  ```

#### troubleshooting-report.md (Progressive Main Report)
- **Purpose**: Structured report with picture references and analysis
- **Created**: At START of Step 1 (immediately after problem identification)
- **Updated**: Progressively as information is gathered (not just at the end)
- **Content**: 
  - Problem description (updated in Step 1)
  - Initial state with screenshots (updated in Step 2)
  - Visual inspection results (updated in Step 3)
  - Root cause analysis (updated in Step 4-5)
  - Fix attempts and results (updated in Step 6)
  - Visual verification (updated in Step 7)
  - Test results (updated in Step 8)
- **Format**: Structured sections, updated as information becomes available

#### troubleshooting-data.json (Machine-Readable Data)
- **Purpose**: Structured data for programmatic access
- **Created**: At START of Step 1
- **Updated**: After EVERY operation to keep data current
- **Content**: 
  - Problem metadata
  - Timestamps (started, last updated, resolved)
  - Screenshot references with paths
  - Operation log entries
  - Root cause data
  - Fix data
  - Verification data
- **Format**: JSON structure, updated incrementally

#### README.md (Quick Reference)
- **Purpose**: Quick overview and status
- **Created**: At START of Step 1
- **Updated**: When status changes (investigating → fixed, etc.)
- **Content**: 
  - Problem title and description
  - Current status
  - Affected mechanisms
  - Date started, date resolved
  - Link to troubleshooting-log.md and troubleshooting-report.md
  - Quick summary

### Problem Title Inference
- Create descriptive, kebab-case title from problem description
- Examples:
  - "flickering cards" → `card-flickering-on-scroll`
  - "duplicate cards in carousel" → `duplicate-cards-in-carousel`
  - "layout broken on mobile" → `layout-broken-on-mobile`
- Title should be problem-focused, not mechanism-focused
- Title should be clear and searchable

### Report Contents

#### README.md (Quick Reference)
- Problem title and description
- Status (investigating/fixed/ongoing)
- Affected mechanisms (list all)
- Date started, date resolved (if applicable)
- Link to latest troubleshooting-report.md
- Quick summary of fix (if resolved)

#### troubleshooting-report.md (Main Report)
- **Problem Description**: Clear description with context
- **Initial State**: Screenshot references with descriptions
- **Root Cause Analysis**: Code flow, root cause, locations
- **Fix Applied**: What changed, files modified
- **Visual Verification**: Before/after screenshots with proof statements
- **Test Results**: Test execution results
- **Verification Results**: Visual verification with screenshot evidence
- **Files Changed**: List of modified files

#### troubleshooting-data.json (Machine-Readable)
- Problem metadata
- Timestamps
- Screenshot references with paths
- Root cause data
- Fix data
- Verification data

#### Screenshots
- Numbered sequentially (01-, 02-, etc.)
- Clear, descriptive filenames
- Referenced in markdown reports using `![Description](screenshots/filename.png)`
- Each screenshot should have context in the report

## Execution Steps

### Step 1: Identify Visual Problem and Infer Problem Title
- **Action**: Understand the visual issue and create problem-based identifier
  - Parse user input for problem description (e.g., "flickering cards", "duplicate cards", "layout broken")
  - Parse target mechanism/component if specified (note: problem may span multiple mechanisms)
  - If not specified: Ask for clarification or check COMMENTS.md for known visual issues
  - Capture problem description:
    - What visual symptom? (flickering, duplicates, misalignment, missing content)
    - When does it occur? (on load, on scroll, on interaction, always)
    - Where does it occur? (specific page, component, carousel)
    - How often? (always, sometimes, intermittent)
  - **Infer problem title** (for folder naming):
    - Create descriptive, kebab-case title from problem description
    - Examples: "card-flickering-on-scroll", "duplicate-cards-in-carousel", "layout-broken-on-mobile"
    - Title should be problem-focused, not mechanism-focused
    - Title should be clear and searchable
  - **Identify affected mechanisms** (can be multiple):
    - Which mechanisms are involved? (e.g., carousel-composer, card-composer, page-manager)
    - Note: Problems can span multiple mechanisms
  - Check mechanism COMMENTS.md for known visual issues (check all affected mechanisms)
  - Check mechanism CHANGELOG.md for recent visual changes (check all affected mechanisms)
  - Validate problem is visual/UI related
  - **Check for existing troubleshooting folder**:
    - If problem folder already exists: This is an iteration - use iterations/[timestamp]/
    - If new problem: Create new problem folder
  - **CRITICAL: Create documentation structure IMMEDIATELY**:
    1. Create problem folder: `plans/reports/troubleshooting/[problem-title]/`
    2. Create `screenshots/` subfolder
    3. **Create troubleshooting-log.md** with initial entry:
       - Timestamp
       - Problem identification
       - Problem description
       - Affected mechanisms
       - Status: "investigating"
    4. **Create troubleshooting-report.md** with problem description section
    5. **Create troubleshooting-data.json** with initial metadata
    6. **Create README.md** with problem overview and status
    7. **LOG THIS OPERATION** in troubleshooting-log.md: "Problem identified, documentation structure created"
- **Verification**: 
  - ✅ Problem is clearly identified, title inferred, affected mechanisms identified
  - ✅ Documentation structure created (troubleshooting-log.md, troubleshooting-report.md, troubleshooting-data.json, README.md)
  - ✅ Initial log entry created
- **On Success**: Proceed to Step 2
- **On Failure**: Ask for clarification or suggest using `/debug` for non-visual issues

### Step 2: Reproduce and Capture Initial State
- **Action**: Reproduce problem and capture visual state
  - **LOG OPERATION START** in troubleshooting-log.md: "Starting reproduction and initial state capture"
  - **CRITICAL PORT DETECTION**: Before navigating:
    - **DO NOT** assume port (3000, 5173, 8080, etc.)
    - **MUST** detect actual running port:
      1. Check package.json scripts for dev server
      2. Check vite.config.ts for configured port
      3. **MOST IMPORTANT**: Check what port is actually running (ask user if needed)
    - If port cannot be determined: **ASK USER** - do not proceed with assumed port
    - **LOG** port detection result in troubleshooting-log.md
  - Navigate to page/component where problem occurs (using browser MCP tools):
    - Use **ACTUAL DETECTED PORT** or user-provided URL
    - Navigate to: `http://localhost:[ACTUAL_PORT]` or user-provided URL
    - **LOG** navigation in troubleshooting-log.md
  - **Create screenshots folder** (if it doesn't exist):
    - Path: `plans/reports/troubleshooting/[problem-title]/screenshots/`
    - Create directory structure before taking screenshots
    - **LOG** folder creation in troubleshooting-log.md
  - **ACTUALLY SEE** the visual problem (use browser snapshot/screenshot):
    - **LOG** intent: "Taking initial state screenshot" in troubleshooting-log.md
    - Take screenshot using browser MCP tools (browser_take_screenshot)
    - **MANDATORY**: Save screenshot to `plans/reports/troubleshooting/[problem-title]/screenshots/01-initial-state.png`
    - **MANDATORY**: Verify file exists using file system check
    - **IF FILE DOES NOT EXIST**: Report error, retry screenshot, do not proceed
    - **LOG** screenshot capture in troubleshooting-log.md with:
      - Filename: `01-initial-state.png`
      - Verification: File exists (yes/no)
      - Description: What was observed visually
    - **UPDATE** troubleshooting-report.md with screenshot reference: `![Initial State](screenshots/01-initial-state.png)`
    - **UPDATE** troubleshooting-data.json with screenshot entry
    - **LOOK** at what's actually displayed
    - **DO NOT** assume what the problem looks like - SEE it
  - Reproduce the visual problem:
    - **LOG** intent: "Reproducing visual problem" in troubleshooting-log.md
    - Perform actions that trigger the problem
    - **SEE** the problem occur visually
    - **LOG** reproduction result in troubleshooting-log.md
  - **Capture problem reproduction screenshot**:
    - **LOG** intent: "Taking problem reproduction screenshot" in troubleshooting-log.md
    - Take screenshot using browser MCP tools
    - **MANDATORY**: Save to `plans/reports/troubleshooting/[problem-title]/screenshots/02-problem-reproduced.png`
    - **MANDATORY**: Verify file exists using file system check
    - **IF FILE DOES NOT EXIST**: Report error, retry screenshot, do not proceed
    - **LOG** screenshot capture in troubleshooting-log.md with:
      - Filename: `02-problem-reproduced.png`
      - Verification: File exists (yes/no)
      - Description: Problem clearly visible
    - **UPDATE** troubleshooting-report.md with screenshot reference
    - **UPDATE** troubleshooting-data.json with screenshot entry
    - This screenshot is your baseline - it shows the ACTUAL visual problem
  - Inspect DOM state:
    - **LOG** DOM inspection in troubleshooting-log.md
    - Check element structure
    - Check CSS classes and styles
    - Check for duplicate elements
    - Check element visibility/display properties
    - **UPDATE** troubleshooting-report.md with DOM inspection results
  - Capture React component tree:
    - **LOG** React inspection in troubleshooting-log.md
    - Component hierarchy
    - Props being passed
    - State values
    - Context values
    - **UPDATE** troubleshooting-report.md with React inspection results
  - Capture console logs/errors:
    - **LOG** console inspection in troubleshooting-log.md
    - **UPDATE** troubleshooting-report.md with console findings
  - Document reproduction steps:
    - **UPDATE** troubleshooting-report.md with reproduction steps
    - **UPDATE** troubleshooting-data.json with reproduction data
  - **LOG OPERATION COMPLETE** in troubleshooting-log.md: "Initial state captured, problem reproduced"
- **Verification**: 
  - ✅ Problem is reproduced and initial state captured
  - ✅ Screenshots saved and verified (01-initial-state.png, 02-problem-reproduced.png)
  - ✅ All operations logged in troubleshooting-log.md
  - ✅ troubleshooting-report.md updated with initial state
  - ✅ troubleshooting-data.json updated
- **On Success**: Proceed to Step 3
- **On Failure**: 
  - Log failure in troubleshooting-log.md with reason
  - Report reproduction issues, suggest manual reproduction

### Step 3: Visual Inspection and Analysis
- **Action**: Deep visual inspection
  - **LOG OPERATION START** in troubleshooting-log.md: "Starting visual inspection and analysis"
  - **Take detailed screenshots of problem area**:
    - **LOG** intent: "Taking detailed screenshots of problem area" in troubleshooting-log.md
    - Use browser MCP tools (browser_take_screenshot)
    - **MANDATORY**: Save screenshots to `plans/reports/troubleshooting/[problem-title]/screenshots/` folder
    - **MANDATORY**: For EACH screenshot:
      1. Save with numbered filename (e.g., `03-inspection-detail-1.png`)
      2. **VERIFY** file exists using file system check
      3. **IF FILE DOES NOT EXIST**: Report error, retry, do not proceed
      4. **LOG** in troubleshooting-log.md with filename, verification status, and description
      5. **UPDATE** troubleshooting-report.md with screenshot reference
      6. **UPDATE** troubleshooting-data.json with screenshot entry
    - Number screenshots sequentially if taking multiple
  - Inspect DOM for anomalies:
    - **LOG** DOM inspection start in troubleshooting-log.md
    - Duplicate IDs or keys
    - Missing or incorrect CSS classes
    - Incorrect element structure
    - Layout issues (flexbox, grid, positioning)
    - **LOG** findings in troubleshooting-log.md
    - **UPDATE** troubleshooting-report.md with DOM findings
  - Inspect React DevTools (if available):
    - **LOG** React inspection start in troubleshooting-log.md
    - Component render counts
    - Props changes
    - State changes
    - Re-render triggers
    - **LOG** findings in troubleshooting-log.md
    - **UPDATE** troubleshooting-report.md with React findings
  - Check browser console for:
    - **LOG** console inspection start in troubleshooting-log.md
    - React warnings (keys, state updates)
    - CSS warnings
    - JavaScript errors
    - **LOG** findings in troubleshooting-log.md
    - **UPDATE** troubleshooting-report.md with console findings
  - Check network tab for:
    - **LOG** network inspection start in troubleshooting-log.md
    - Failed resource loads
    - Slow API calls causing visual delays
    - **LOG** findings in troubleshooting-log.md
    - **UPDATE** troubleshooting-report.md with network findings
  - Analyze visual patterns:
    - **LOG** pattern analysis start in troubleshooting-log.md
    - When does flickering occur? (on scroll, on state change, on data fetch)
    - What triggers duplicates? (re-renders, state updates, data fetching)
    - What causes layout issues? (CSS, component structure, data changes)
    - **LOG** patterns identified in troubleshooting-log.md
    - **UPDATE** troubleshooting-report.md with pattern analysis
  - **LOG OPERATION COMPLETE** in troubleshooting-log.md: "Visual inspection complete, patterns identified"
- **Verification**: 
  - ✅ Visual inspection complete, patterns identified
  - ✅ All screenshots saved and verified
  - ✅ All operations logged in troubleshooting-log.md
  - ✅ troubleshooting-report.md updated with inspection results
  - ✅ troubleshooting-data.json updated
- **On Success**: Proceed to Step 4
- **On Failure**: 
  - Log failure in troubleshooting-log.md with reason
  - Report inspection limitations, proceed with code analysis

### Step 4: Code Flow Tracing
- **Action**: Trace code to find root cause
  - **LOG OPERATION START** in troubleshooting-log.md: "Starting code flow tracing"
  - Identify relevant code files:
    - **LOG** file identification in troubleshooting-log.md
    - Component files (where visual issue manifests)
    - Hook files (state management, effects)
    - Context providers (shared state)
    - Transform functions (data processing)
    - **UPDATE** troubleshooting-report.md with identified files
  - Trace data flow:
    - **LOG** data flow tracing start in troubleshooting-log.md
    - Where does data come from? (API, cache, props)
    - How is data transformed? (transform functions, filters)
    - How is data used? (rendering, state updates)
    - **LOG** findings in troubleshooting-log.md
    - **UPDATE** troubleshooting-report.md with data flow findings
  - Trace state flow:
    - **LOG** state flow tracing start in troubleshooting-log.md
    - What state changes trigger re-renders?
    - Are state updates causing unnecessary re-renders?
    - Are state updates batched correctly?
    - **LOG** findings in troubleshooting-log.md
    - **UPDATE** troubleshooting-report.md with state flow findings
  - Trace render flow:
    - **LOG** render flow tracing start in troubleshooting-log.md
    - What triggers component re-renders?
    - Are memoization hooks used correctly? (useMemo, useCallback)
    - Are keys stable and unique?
    - Are dependencies correct in hooks?
    - **LOG** findings in troubleshooting-log.md
    - **UPDATE** troubleshooting-report.md with render flow findings
  - Check for common visual problem patterns:
    - **LOG** pattern checking start in troubleshooting-log.md
    - **Flickering**: Unnecessary re-renders, unstable keys, state updates in render
    - **Duplicates**: Missing deduplication, incorrect filtering, race conditions
    - **Layout issues**: CSS conflicts, missing styles, incorrect component structure
    - **Missing content**: Conditional rendering bugs, state initialization issues
    - **LOG** patterns found in troubleshooting-log.md
    - **UPDATE** troubleshooting-report.md with pattern findings
  - Identify root cause:
    - **LOG** root cause identification start in troubleshooting-log.md
    - What code is causing the visual problem?
    - Why is it happening? (race condition, state management, rendering logic)
    - What needs to be fixed?
    - **LOG** root cause in troubleshooting-log.md with:
      - Code location (file:line)
      - Root cause description
      - Why it's happening
      - What needs to be fixed
    - **UPDATE** troubleshooting-report.md with root cause
    - **UPDATE** troubleshooting-data.json with root cause data
  - **LOG OPERATION COMPLETE** in troubleshooting-log.md: "Code flow tracing complete - root cause identified"
- **Verification**: 
  - ✅ Root cause identified with code location
  - ✅ All tracing operations logged in troubleshooting-log.md
  - ✅ troubleshooting-report.md updated with tracing results
  - ✅ troubleshooting-data.json updated
- **On Success**: Proceed to Step 5
- **On Failure**: 
  - Log failure in troubleshooting-log.md with reason and what was attempted
  - Report tracing limitations, suggest manual code review

### Step 5: Analyze Root Cause
- **Action**: Deep analysis of root cause
  - **LOG OPERATION START** in troubleshooting-log.md: "Starting root cause analysis"
  - Review identified code sections:
    - **LOG** code review in troubleshooting-log.md
    - **UPDATE** troubleshooting-report.md with code review notes
  - Understand why the problem occurs:
    - **LOG** analysis start in troubleshooting-log.md
    - Is it a race condition? (async operations, state updates)
    - Is it a state management issue? (incorrect state updates, missing state)
    - Is it a rendering issue? (unnecessary re-renders, missing memoization)
    - Is it a data processing issue? (incorrect filtering, deduplication)
    - Is it a CSS/styling issue? (conflicts, missing styles)
    - **LOG** findings in troubleshooting-log.md
    - **UPDATE** troubleshooting-report.md with analysis findings
  - Check for similar issues in COMMENTS.md:
    - **LOG** COMMENTS.md check in troubleshooting-log.md
    - **UPDATE** troubleshooting-report.md with similar issues found (if any)
  - Check mechanism README.md for design decisions:
    - **LOG** README.md check in troubleshooting-log.md
    - **UPDATE** troubleshooting-report.md with design context
  - Understand impact:
    - **LOG** impact analysis start in troubleshooting-log.md
    - What components are affected?
    - What functionality is broken?
    - Are there workarounds?
    - **LOG** impact findings in troubleshooting-log.md
    - **UPDATE** troubleshooting-report.md with impact analysis
  - Determine fix approach:
    - **LOG** fix approach determination start in troubleshooting-log.md
    - What needs to be changed?
    - How should it be fixed?
    - What are the risks?
    - What tests are needed?
    - **LOG** fix approach in troubleshooting-log.md with:
      - What will be changed
      - How it will be fixed
      - Risks identified
      - Tests needed
    - **UPDATE** troubleshooting-report.md with fix approach
    - **UPDATE** troubleshooting-data.json with fix approach data
  - **LOG OPERATION COMPLETE** in troubleshooting-log.md: "Root cause analysis complete - fix approach determined"
- **Verification**: 
  - ✅ Root cause fully understood, fix approach determined
  - ✅ All analysis operations logged in troubleshooting-log.md
  - ✅ troubleshooting-report.md updated with analysis results
  - ✅ troubleshooting-data.json updated
- **On Success**: Proceed to Step 6
- **On Failure**: 
  - Log failure in troubleshooting-log.md with reason and what was attempted
  - Report analysis limitations, suggest alternative approaches

### Step 6: Implement Fix
- **Action**: Apply the fix
  - **LOG OPERATION START** in troubleshooting-log.md: "Starting fix implementation"
  - **LOG** fix approach in troubleshooting-log.md (what will be changed and why)
  - Make code changes based on fix approach
  - **FOR EACH CODE CHANGE**:
    1. **LOG** before making change: "Changing [file]:[line] - [what will change]"
    2. Make the change
    3. **LOG** after change: "Changed [file]:[line] - [what changed]"
    4. **UPDATE** troubleshooting-report.md with change details
    5. **UPDATE** troubleshooting-data.json with change entry
  - Ensure fix addresses root cause:
    - Fix race conditions (add proper async handling, debouncing)
    - Fix state management (correct state updates, proper initialization)
    - Fix rendering (add memoization, fix keys, optimize re-renders)
    - Fix data processing (correct filtering, deduplication logic)
    - Fix CSS/styling (resolve conflicts, add missing styles)
  - Follow mechanism README.md guidelines
  - Ensure fix doesn't break other functionality
  - Add comments explaining the fix
  - Update types/interfaces if needed
  - **LOG OPERATION COMPLETE** in troubleshooting-log.md: "Fix implemented - [summary of changes]"
  - **UPDATE** troubleshooting-report.md with fix summary
  - **UPDATE** troubleshooting-data.json with fix data
- **Verification**: 
  - ✅ Fix is implemented
  - ✅ All code changes logged in troubleshooting-log.md
  - ✅ troubleshooting-report.md updated with fix details
  - ✅ troubleshooting-data.json updated
- **On Success**: Proceed to Step 7
- **On Failure**: 
  - Log failure in troubleshooting-log.md with reason and error details
  - Report fix application errors
  - Document what was attempted and why it failed

### Step 7: Visual Verification (Before/After) - CRITICAL: ACTUAL VISUAL STATE
- **Action**: Verify fix by ACTUALLY SEEING the visual state - NOT by assuming code changes worked
  - **LOG OPERATION START** in troubleshooting-log.md: "Starting visual verification"
  - **CRITICAL**: This step requires ACTUAL VISUAL INSPECTION, not code inspection
  - **CRITICAL**: You MUST SEE the visual state with your own "eyes" (browser MCP tools)
  - **FORBIDDEN**: Do NOT assume the fix worked just because code was changed
  - **FORBIDDEN**: Do NOT skip visual verification
  - **MANDATORY STEPS**:
    1. **Navigate to actual running application** (using browser MCP tools):
       - **LOG** navigation intent in troubleshooting-log.md
       - **DO NOT** assume port - detect actual running port first
       - **DO NOT** use default ports (3000, 5173, etc.) without verification
       - Check package.json or vite.config.ts for actual port
       - **ASK USER** if port cannot be determined
       - Navigate to actual URL: `http://localhost:[ACTUAL_PORT]` or user-provided URL
       - **LOG** navigation result in troubleshooting-log.md
    2. **Actually LOOK at the visual state** (use browser snapshot/screenshot):
      - **LOG** intent: "Taking before-fix screenshot" in troubleshooting-log.md
      - **Take screenshot using browser MCP tools** (browser_take_screenshot)
      - **MANDATORY**: Save to `plans/reports/troubleshooting/[problem-title]/screenshots/03-before-fix.png`
      - **MANDATORY**: Verify file exists using file system check
      - **IF FILE DOES NOT EXIST**: Report error, retry screenshot, do not proceed
      - **LOG** screenshot capture in troubleshooting-log.md with:
        - Filename: `03-before-fix.png`
        - Verification: File exists (yes/no)
        - Visual observation: What is actually seen
      - **UPDATE** troubleshooting-report.md with screenshot reference
      - **UPDATE** troubleshooting-data.json with screenshot entry
      - Inspect DOM to see actual rendered elements
      - Check React DevTools (if available) for component state
      - **LOG** visual observation in troubleshooting-log.md
      - **VERIFY**: Can you actually SEE the fix? Is the visual problem gone?
    3. **Reproduce the original problem scenario**:
       - **LOG** intent: "Reproducing original problem scenario" in troubleshooting-log.md
       - Perform the same actions that caused the problem
       - Scroll, click, interact as the user would
       - **LOG** result in troubleshooting-log.md: Does problem still occur?
       - **VERIFY**: Does the problem still occur visually?
    4. **Compare ACTUAL visual state**:
      - **LOG** intent: "Taking after-fix screenshot" in troubleshooting-log.md
      - **Take after-fix screenshot using browser MCP tools** (browser_take_screenshot)
      - **MANDATORY**: Save to `plans/reports/troubleshooting/[problem-title]/screenshots/04-after-fix.png`
      - **MANDATORY**: Verify file exists using file system check
      - **IF FILE DOES NOT EXIST**: Report error, retry screenshot, do not proceed
      - **LOG** screenshot capture in troubleshooting-log.md with:
        - Filename: `04-after-fix.png`
        - Verification: File exists (yes/no)
        - Visual observation: What is actually seen
      - **UPDATE** troubleshooting-report.md with screenshot reference
      - **UPDATE** troubleshooting-data.json with screenshot entry
      - Compare before-fix screenshot (03-before-fix.png) with after-fix screenshot (04-after-fix.png)
      - **LOG** comparison results in troubleshooting-log.md
      - **VERIFY VISUALLY**:
         - Is flickering actually resolved? (LOOK at the screen, don't assume)
         - Are duplicates actually removed? (COUNT visible duplicates, don't assume)
         - Is layout actually correct? (SEE the layout, don't assume)
         - Is content actually displaying correctly? (SEE the content, don't assume)
      - **LOG** verification results in troubleshooting-log.md
    5. **Test edge cases visually**:
       - **LOG** intent: "Testing edge cases" in troubleshooting-log.md
       - Different data scenarios - **SEE** how it looks
       - Different interaction patterns - **SEE** how it behaves
       - Different screen sizes (if applicable) - **SEE** how it adapts
       - **LOG** edge case results in troubleshooting-log.md
       - **TAKE SCREENSHOTS** of edge cases if visual state differs:
         - Save with descriptive names (e.g., `05-edge-case-mobile.png`)
         - **VERIFY** file exists
         - **LOG** in troubleshooting-log.md
         - **UPDATE** troubleshooting-report.md and troubleshooting-data.json
    6. **Verify no regressions visually**:
       - **LOG** intent: "Checking for regressions" in troubleshooting-log.md
       - **LOOK** at other parts of UI - do they still work?
       - **LOOK** at other components - do they still render correctly?
       - **LOOK** for new visual issues - are any introduced?
       - **LOG** regression check results in troubleshooting-log.md
       - **TAKE SCREENSHOTS** if regressions found:
         - Save with descriptive names (e.g., `06-regression-[description].png`)
         - **VERIFY** file exists
         - **LOG** in troubleshooting-log.md
         - **UPDATE** troubleshooting-report.md and troubleshooting-data.json
  - **Document visual verification results**:
    - **LOG** verification summary in troubleshooting-log.md
    - What did you ACTUALLY SEE? (not what you assume)
    - Screenshot comparison results
    - Visual confirmation that fix is working
    - Any visual regressions observed
    - **UPDATE** troubleshooting-report.md with verification results
    - **UPDATE** troubleshooting-data.json with verification data
  - **LOG OPERATION COMPLETE** in troubleshooting-log.md: "Visual verification complete - [result: fix verified/fix failed/regressions found]"
- **Verification**: 
  - ✅ Visual fix ACTUALLY VERIFIED by seeing it work (not assumed)
  - ✅ Screenshots captured showing before/after (03-before-fix.png, 04-after-fix.png)
  - ✅ All screenshots verified to exist on disk
  - ✅ All operations logged in troubleshooting-log.md
  - ✅ troubleshooting-report.md updated with verification results
  - ✅ troubleshooting-data.json updated
  - ✅ No visual regressions observed (or regressions documented)
  - ✅ Problem is ACTUALLY resolved (visually confirmed)
- **On Success**: Proceed to Step 8
- **On Failure**: 
  - **LOG** failure in troubleshooting-log.md with:
    - Reason for failure
    - What was observed
    - Next steps to try
  - If visual problem persists: Report that fix did not work, re-investigate
  - If port cannot be determined: Ask user for correct port/URL
  - If visual verification cannot be performed: Report limitation and ask user to verify manually

### Step 8: Run Comprehensive Tests
- **Action**: Test fix comprehensively
  - **LOG OPERATION START** in troubleshooting-log.md: "Starting comprehensive tests"
  - Use `/test` command to run tests for affected mechanism:
    - **LOG** test execution intent in troubleshooting-log.md
    - Run Level 1 tests (quick verification)
    - **LOG** Level 1 test results in troubleshooting-log.md
    - Run Level 2 tests (code tests)
    - **LOG** Level 2 test results in troubleshooting-log.md
    - Run Level 3 tests (integration tests with screenshots)
    - **LOG** Level 3 test results in troubleshooting-log.md
    - **UPDATE** troubleshooting-report.md with test results
    - **UPDATE** troubleshooting-data.json with test data
  - Verify all tests pass:
    - **LOG** test verification in troubleshooting-log.md
    - Check for test failures related to fix
    - **LOG** any failures in troubleshooting-log.md with:
      - Test name
      - Failure reason
      - Next steps
  - Document test results:
    - **UPDATE** troubleshooting-report.md with test summary
    - **UPDATE** troubleshooting-data.json with test results
  - **LOG OPERATION COMPLETE** in troubleshooting-log.md: "Tests complete - [passed/failed with details]"
- **Verification**: 
  - ✅ Tests pass, fix validated (or failures documented)
  - ✅ All test operations logged in troubleshooting-log.md
  - ✅ troubleshooting-report.md updated with test results
  - ✅ troubleshooting-data.json updated
- **On Success**: Proceed to Step 9
- **On Failure**: 
  - Log failure in troubleshooting-log.md with:
    - Test failures
    - Failure reasons
    - Investigation steps
  - Report test failures, investigate issues

### Step 9: Finalize Documentation and Update Mechanism Docs
- **Action**: Finalize all documentation and update mechanism documentation
  - **LOG OPERATION START** in troubleshooting-log.md: "Finalizing documentation"
  - **NOTE**: Most documentation should already be created and updated progressively (troubleshooting-log.md, troubleshooting-report.md, troubleshooting-data.json, README.md)
  - **Verify all screenshots were saved** (CRITICAL - screenshots must exist):
    - **MANDATORY**: Check that `screenshots/` folder exists
    - **MANDATORY**: Verify each screenshot file exists using file system check:
      - `screenshots/01-initial-state.png` - Initial visual state
      - `screenshots/02-problem-reproduced.png` - Problem clearly visible
      - `screenshots/03-before-fix.png` - State before fix applied
      - `screenshots/04-after-fix.png` - State after fix applied
      - Any additional screenshots taken during troubleshooting
    - **LOG** screenshot verification in troubleshooting-log.md
    - **If screenshots are missing**: 
      - **ERROR**: Screenshots must be saved - do not proceed without them
      - **LOG** error in troubleshooting-log.md
      - Use browser MCP tools (browser_take_screenshot) to take and save screenshots NOW
      - Save with proper filenames to `screenshots/` folder
      - Verify files exist before completing documentation
      - **LOG** screenshot capture in troubleshooting-log.md
    - Each screenshot should have clear, descriptive filename
    - Screenshots must be actual image files saved to disk, not just references
  - **Finalize troubleshooting-report.md**:
    - Ensure all sections are complete
    - Ensure all screenshot references are correct
    - Add any final summary or conclusions
    - **LOG** finalization in troubleshooting-log.md
  - **Finalize troubleshooting-data.json**:
    - Update status to "resolved" if fix verified
    - Update resolved timestamp
    - Ensure all data is complete
    - **LOG** finalization in troubleshooting-log.md
  - **Update README.md**:
    - Update status (investigating → fixed, if resolved)
    - Update date resolved (if applicable)
    - Add quick summary of fix (if resolved)
    - **LOG** update in troubleshooting-log.md
  - **Update affected mechanisms' CHANGELOG.md** (update all affected mechanisms):
    - **LOG** intent: "Updating mechanism CHANGELOG.md" in troubleshooting-log.md
    - Add entry describing visual problem
    - Document root cause
    - Document fix applied
    - Document verification results
    - Reference troubleshooting report: `See plans/reports/troubleshooting/[problem-title]/`
    - **LOG** update in troubleshooting-log.md
  - **Update affected mechanisms' COMMENTS.md** (update all affected mechanisms):
    - **LOG** intent: "Updating mechanism COMMENTS.md" in troubleshooting-log.md
    - Add troubleshooting notes if insights discovered
    - Document any workarounds or known limitations
    - Remove from COMMENTS.md if issue was previously documented
    - Reference troubleshooting report
    - **LOG** update in troubleshooting-log.md
  - **Create final log entry** in troubleshooting-log.md:
    - Summary of troubleshooting process
    - Final status (resolved/failed/ongoing)
    - Key findings
    - Screenshot summary
    - Files changed summary
  - **LOG OPERATION COMPLETE** in troubleshooting-log.md: "Documentation finalized"
- **Verification**: 
  - ✅ All documentation files created and finalized
  - ✅ All screenshots verified to exist on disk
  - ✅ Screenshots organized and referenced in report
  - ✅ Proof of fix documented with screenshot evidence
  - ✅ Affected mechanisms' documentation updated
  - ✅ troubleshooting-log.md contains complete record of all operations
- **On Success**: Proceed to Step 10
- **On Failure**: 
  - Log failure in troubleshooting-log.md with reason
  - Report documentation issues

### Step 10: Report Completion
- **Action**: Present final report
  - Format completion report using standard format
  - Include:
    - Problem summary
    - Root cause
    - Fix applied
    - Visual verification results
    - Test results
    - Files changed
    - Screenshots (before/after)
    - Next steps (if any)
- **Verification**: Report complete
- **On Success**: Command complete
- **On Failure**: Report completion issues

## Pre-requisites
- [ ] Visual problem is identified
- [ ] Browser MCP tools available (for visual inspection)
- [ ] Access to code files
- [ ] Write permissions
- [ ] Tests available (for verification)

## Verification Steps
1. Problem identified
2. Initial state captured
3. Visual inspection complete
4. Root cause traced
5. Root cause analyzed
6. Fix implemented
7. Visual verification passed
8. Tests passed
9. Documentation updated
10. Completion reported

## Success Criteria
- [ ] Visual problem identified
- [ ] Root cause traced and understood
- [ ] Fix implemented
- [ ] Visual verification passed (before/after comparison)
- [ ] Tests passed
- [ ] Documentation updated
- [ ] No regressions introduced

## Status Reporting Format
```
[COMMAND] /troubleshoot [target] [issue]
[STATUS] Success/Failure/Partial
[STEPS] X/10 completed
[VERIFICATION] Passed/Failed
[DETAILS]
  - Problem: [visual problem description]
  - Target: [mechanism/component]
  - Root cause: [cause]
  - Fix applied: [what was fixed]
  - Visual verification: [passed/failed]
  - Tests: [passed/failed]
  - Files changed: [count]
  - Screenshots: [before/after captured]
  - Documentation: [updated/not updated]
```

## Error Handling

### Problem Not Identified
- **Error**: Cannot identify visual problem
- **Handling**: Ask for clarification
- **Action**: Request more details about visual symptoms, or use `/debug` for non-visual issues

### Cannot Reproduce
- **Error**: Cannot reproduce visual problem
- **Handling**: Report reproduction issues
- **Action**: Request reproduction steps, check environment differences, suggest manual reproduction

### Root Cause Not Found
- **Error**: Cannot trace root cause
- **Handling**: Report tracing limitations
- **Action**: Suggest manual code review, use `/analyze` for deeper analysis, check COMMENTS.md for similar issues

### Fix Doesn't Work
- **Error**: Fix doesn't resolve visual problem
- **Handling**: Report fix failure
- **Action**: Re-analyze root cause, try alternative fix approach, check if multiple issues exist

### Visual Verification Fails
- **Error**: Visual problem persists after fix
- **Handling**: Report verification failure
- **Action**: Re-investigate, check if fix was applied correctly, verify no other issues

### Tests Fail
- **Error**: Tests fail after fix
- **Handling**: Report test failures
- **Action**: Investigate test failures, check for regressions, verify fix doesn't break functionality

## Examples

### Example 1: Troubleshoot Flickering Cards
```
User: /troubleshoot carousel-composer flickering cards
AI:
[COMMAND] /troubleshoot carousel-composer flickering cards
[STATUS] Success
[STEPS] 10/10 completed
[VERIFICATION] Passed
[DETAILS]
  - Problem: Cards flickering when scrolling carousel
  - Problem Title: card-flickering-on-scroll
  - Affected Mechanisms: carousel-composer, card-composer
  - Root cause: useCardTracker hook causing unnecessary re-renders due to unstable context value
  - Fix applied: 
    - Memoized CardTrackerContext value in CardTrackerContext.tsx
    - Added useMemo to filterStories callback
    - Fixed dependency arrays in useCardTracker hook
  - Visual verification: ✅ Passed (flickering resolved - see screenshot 04-after-fix.png)
  - Tests: ✅ Passed (15/15)
  - Files changed: 2
    - src/mechanisms/carousel-composer/subsystems/card-tracker/CardTrackerContext.tsx
    - src/mechanisms/carousel-composer/subsystems/card-tracker/useCardTracker.ts
  - Screenshots: ✅ Before/after captured and referenced in report
  - Report Location: plans/reports/troubleshooting/card-flickering-on-scroll/
  - Documentation: ✅ Updated (CHANGELOG.md, COMMENTS.md, troubleshooting report)
```

### Example 2: Troubleshoot Duplicate Cards
```
User: /troubleshoot duplicate cards in carousel
AI:
[COMMAND] /troubleshoot duplicate cards in carousel
[STATUS] Success
[STEPS] 10/10 completed
[VERIFICATION] Passed
[DETAILS]
  - Problem: Duplicate cards appearing in carousel
  - Problem Title: duplicate-cards-in-carousel
  - Affected Mechanisms: carousel-composer, card-tracker
  - Root cause: Race condition in card deduplication - items registered before filtering, causing duplicates when multiple carousels render simultaneously
  - Fix applied:
    - Fixed registration order in BaseCarousel.tsx
    - Added stable key generation for item registration
    - Improved deduplication logic in CardTrackerContext.tsx
  - Visual verification: ✅ Passed (no duplicates - see screenshot 04-after-fix.png showing single instance of each card)
  - Tests: ✅ Passed (18/18)
  - Files changed: 2
    - src/mechanisms/carousel-composer/components/BaseCarousel.tsx
    - src/mechanisms/carousel-composer/subsystems/card-tracker/CardTrackerContext.tsx
  - Screenshots: ✅ Before/after captured and referenced in report
  - Report Location: plans/reports/troubleshooting/duplicate-cards-in-carousel/
  - Documentation: ✅ Updated (CHANGELOG.md, COMMENTS.md, troubleshooting report with proof)
```

### Example 3: Troubleshoot Layout Issue
```
User: /troubleshoot page-composer layout broken
AI:
[COMMAND] /troubleshoot page-composer layout broken
[STATUS] Success
[STEPS] 10/10 completed
[VERIFICATION] Passed
[DETAILS]
  - Problem: Page layout broken, carousels overlapping
  - Target: page-composer
  - Root cause: Missing CSS classes from style-guide, incorrect flexbox configuration
  - Fix applied:
    - Added missing style-guide classes to PageComposer.tsx
    - Fixed flexbox container configuration
    - Added proper spacing classes
  - Visual verification: ✅ Passed (layout correct)
  - Tests: ✅ Passed (12/12)
  - Files changed: 1
    - src/mechanisms/page-manager/subsystems/page-composer/PageComposer.tsx
  - Screenshots: ✅ Before/after captured
  - Documentation: ✅ Updated
```

### Example 4: Cannot Reproduce
```
User: /troubleshoot flickering
AI:
[COMMAND] /troubleshoot flickering
[STATUS] Failure
[STEPS] 2/10 completed
[VERIFICATION] Failed
[DETAILS]
  - Error: Cannot reproduce flickering issue
  - Attempted: Navigated to carousel pages, scrolled, interacted with components
  - Visual state: No flickering observed
  - Action: 
    - Please provide more details:
      1. Which page/component shows flickering?
      2. What actions trigger the flickering?
      3. Does it happen consistently or intermittently?
      4. Any console errors?
    - Or use /debug to gather diagnostic information
```

## Related Commands
- [/debug](debug.md) - Debug non-visual issues, enable debug modes
- [/fix](fix.md) - Fix identified non-visual issues
- [/test](test.md) - Comprehensive testing (used by troubleshoot for verification)
- [/analyze](analyze.md) - Deep code analysis
- [/check](check.md) - Quick health check

## Visual Problem Patterns

### Flickering
- **Common Causes**:
  - Unnecessary re-renders (missing memoization)
  - Unstable keys in lists
  - State updates in render functions
  - Context value changes causing re-renders
- **Tracing Steps**:
  1. Check React DevTools for render counts
  2. Check for useMemo/useCallback usage
  3. Check key stability in lists
  4. Check context value memoization
  5. Check state update patterns

### Duplicates
- **Common Causes**:
  - Missing deduplication logic
  - Race conditions in data fetching
  - Incorrect filtering logic
  - State updates causing re-renders with old data
- **Tracing Steps**:
  1. Check data flow (API → transform → render)
  2. Check deduplication logic
  3. Check for race conditions
  4. Check state management
  5. Check component key uniqueness

### Layout Issues
- **Common Causes**:
  - Missing CSS classes
  - CSS conflicts
  - Incorrect flexbox/grid configuration
  - Missing style-guide references
- **Tracing Steps**:
  1. Inspect DOM structure
  2. Check CSS classes applied
  3. Check style-guide usage
  4. Check flexbox/grid configuration
  5. Check for CSS conflicts

### Missing Content
- **Common Causes**:
  - Conditional rendering bugs
  - State initialization issues
  - Data loading race conditions
  - Incorrect data filtering
- **Tracing Steps**:
  1. Check conditional rendering logic
  2. Check state initialization
  3. Check data loading patterns
  4. Check data filtering logic
  5. Check error boundaries
