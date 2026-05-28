# Command: /task

## Trigger
The command is triggered when user says: `/task`, `task`, `/task [subcommand]`, `/task [subcommand] [target]`, or variations like "task audit", "task list", "task report"

## Purpose
Analyze, audit, list, and report on all tasks across the project. Provides comprehensive task management capabilities including verification of completed tasks, listing tasks by mechanism or globally, and generating detailed manager reports.

## Context
Use this command when:
- User wants to audit if marked tasks are actually implemented
- User wants to list tasks for a mechanism or all mechanisms
- User wants a comprehensive project status report
- User wants to understand project progress
- User needs manager-level reporting
- User wants recommendations for next steps

## Sub-commands

### audit
Verify that tasks marked as completed (`[x]`) are actually implemented in the codebase.

### list
List all tasks, optionally filtered by mechanism.

### report
Generate a comprehensive manager's report with project state, progress, recommendations, and ordered next steps.

## Execution Steps

### Step 1: Parse Command and Sub-command
- **Action**: Determine sub-command and target
  - Parse user input for sub-command: `audit`, `list`, or `report`
  - Parse user input for target mechanism (optional for `list` and `audit`)
  - If sub-command not specified: Default to `list`
  - Validate sub-command is valid
- **Verification**: Sub-command and target identified
- **On Success**: Proceed to appropriate sub-command flow
- **On Failure**: Report error and list valid sub-commands

### Step 2: Execute Sub-command

#### For `/task audit [mechanism]`:

##### Step 2.1: Collect All Tasks
- **Action**: Gather all tasks from TASKS.md files
  - If mechanism specified: Read `client_web2/plans/mechanisms/[mechanism]/TASKS.md`
  - If no mechanism: Read all TASKS.md files recursively from `client_web2/plans/mechanisms/`
  - Parse task format: `- [x] Task description` (completed), `- [ ] Task description` (pending)
  - Extract task descriptions and status
  - Note any special markers like `(stub)`
- **Verification**: Tasks collected
- **On Success**: Proceed to Step 2.2
- **On Failure**: Report collection errors

##### Step 2.2: Identify Completed Tasks
- **Action**: Filter tasks marked as completed
  - Find all tasks with `[x]` marker
  - Extract task descriptions
  - Group by mechanism
  - Note any `(stub)` markers
- **Verification**: Completed tasks identified
- **On Success**: Proceed to Step 2.3
- **On Failure**: Report identification errors

##### Step 2.3: Verify Implementation in Codebase
- **Action**: Check if completed tasks are actually implemented
  - For each completed task, search codebase for implementation evidence
  - Check for:
    - Function/class names matching task description
    - Code comments referencing the task
    - Test files for the functionality
    - Integration points mentioned in task
  - Verify against actual code files in `client_web2/src/mechanisms/`
  - Check CHANGELOG.md for implementation entries
  - Distinguish between stub implementations and real implementations
- **Verification**: Implementation verified
- **On Success**: Proceed to Step 2.4
- **On Failure**: Report verification errors

##### Step 2.4: Generate Audit Report
- **Action**: Create audit findings report
  - Categorize tasks:
    - ✅ Verified: Task marked complete AND implemented
    - ⚠️ Unverified: Task marked complete but implementation not found
    - 🔍 Stub: Task marked complete with `(stub)` marker
    - ❌ Missing: Task marked complete but code missing
  - Count discrepancies
  - List unverified tasks with details
  - Provide recommendations
- **Verification**: Report generated
- **On Success**: Proceed to Step 2.5
- **On Failure**: Report generation errors

##### Step 2.5: Present Audit Results
- **Action**: Display audit findings
  - Format results using standard format
  - Highlight unverified tasks
  - Show statistics
  - Provide action items
- **Verification**: Results presented
- **On Success**: Command complete
- **On Failure**: Report presentation issues

#### For `/task list [mechanism]`:

##### Step 2.1: Collect All Tasks
- **Action**: Gather all tasks from TASKS.md files
  - If mechanism specified: Read `client_web2/plans/mechanisms/[mechanism]/TASKS.md`
  - If no mechanism: Read all TASKS.md files recursively from `client_web2/plans/mechanisms/`
  - Parse task format and status markers
  - Extract phase information
  - Extract task descriptions
- **Verification**: Tasks collected
- **On Success**: Proceed to Step 2.2
- **On Failure**: Report collection errors

##### Step 2.2: Organize Tasks
- **Action**: Structure tasks for display
  - Group by mechanism
  - Group by phase within mechanism
  - Count tasks by status:
    - Completed: `[x]`
    - Pending: `[ ]`
    - In Progress: `[~]` or similar
    - Blocked: `[~]` or similar
  - Calculate completion percentages
- **Verification**: Tasks organized
- **On Success**: Proceed to Step 2.3
- **On Failure**: Report organization errors

##### Step 2.3: Present Task List
- **Action**: Display organized task list
  - Format by mechanism (if multiple)
  - Show phases within each mechanism
  - Display task counts and percentages
  - Use clear status indicators
  - If single mechanism: Show detailed list
  - If all mechanisms: Show summary with option to drill down
- **Verification**: List presented
- **On Success**: Command complete
- **On Failure**: Report presentation issues

#### For `/task report`:

##### Step 2.1: Discover Task Files (Incremental)
- **Action**: Find all task files efficiently
  - Discover all TASKS.md files recursively from `client_web2/plans/mechanisms/`
  - Build file list with mechanism paths
  - Count total files discovered
  - **Error Resilience**: Continue if some files are inaccessible, log errors but proceed
  - Group files by mechanism hierarchy

**IMPLEMENTATION CODE - File Discovery:**
```javascript
// CRITICAL: Use glob_file_search TOOL, not shell commands
// This is a TOOL CALL, not a shell command to execute

// Step 1: Call glob_file_search tool to find ALL TASKS.md files
// Tool call: glob_file_search({
//   glob_pattern: "**/TASKS.md",
//   target_directory: "client_web2/plans/mechanisms"
// })
// This returns an array of file paths

// Step 2: Process the results (in AI's execution context, not shell)
const taskFiles = [/* results from glob_file_search tool */];
const totalFiles = taskFiles.length;

// Step 3: Build file list with mechanism paths
const fileList = taskFiles.map(filePath => {
  // Extract mechanism name from path
  // e.g., "client_web2/plans/mechanisms/story-fetcher/TASKS.md" -> "story-fetcher"
  // e.g., "client_web2/plans/mechanisms/carousel-composer/subsystems/infinite-scroll/TASKS.md" -> "carousel-composer/subsystems/infinite-scroll"
  const relativePath = filePath.replace(/^.*plans\/mechanisms\//, '').replace(/\/TASKS\.md$/, '');
  return {
    filePath: filePath,
    mechanism: relativePath,
    isSubsystem: relativePath.includes('/subsystems/')
  };
});

// Step 4: Log discovery results (in AI response, not console.log)
// Report: `[TASK REPORT] Discovered ${totalFiles} TASKS.md files`
```

**AI EXECUTION INSTRUCTIONS:**
1. Call `glob_file_search()` tool with pattern `"**/TASKS.md"` and directory `"client_web2/plans/mechanisms"`
2. Process the returned file paths
3. Count total files
4. Build file list with mechanism names
5. Report the count in your response: `[TASK REPORT] Discovered X TASKS.md files`

**VERIFICATION:**
- Total file count must be logged: `[TASK REPORT] Discovered X TASKS.md files`
- File list must include ALL mechanisms and subsystems
- If count is less than expected (~40), investigate missing files

- **Verification**: File list created with accurate count
- **On Success**: Proceed to Step 2.2
- **On Failure**: Report discovery errors, proceed with available files

##### Step 2.2: Generate Summary Metrics (Summary-First Approach)
- **Action**: Process files incrementally to generate high-level metrics first
  - **Batch Processing**: Process files in batches (e.g., 5-10 files at a time)
  - **Streaming Parsing**: For each batch:
    - Read TASKS.md files one at a time
    - Parse task format: `- [x]`, `- [ ]`, `- [~]` (completed, pending, blocked)
    - Extract task counts per status immediately
    - Extract mechanism name from file path
    - **Error Resilience**: If file read fails, log error, skip file, continue with next
  - **Accumulate Metrics**: Build running totals as files are processed:
    - Total tasks (completed, pending, blocked, in progress)
    - Tasks per mechanism
    - Completion percentages per mechanism
  - **Memory Efficient**: Only store counts and summaries, not full task lists initially
  - Continue until all files processed or error threshold reached

**IMPLEMENTATION CODE - Task Counting:**
```javascript
// CRITICAL: Use read_file TOOL for each file, not shell commands
// Process files in batches using tool calls

// Initialize accumulators (in AI's execution context)
const globalMetrics = {
  totalTasks: 0,
  completed: 0,
  pending: 0,
  blocked: 0,
  inProgress: 0,
  stubTasks: 0
};

const mechanismMetrics = {};

// Process files in batches
const BATCH_SIZE = 8; // Process 8 files at a time
const totalBatches = Math.ceil(fileList.length / BATCH_SIZE);

// Report: `[TASK REPORT] Processing ${fileList.length} files in ${totalBatches} batches`

for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
  const batchStart = batchIndex * BATCH_SIZE;
  const batchEnd = Math.min(batchStart + BATCH_SIZE, fileList.length);
  const batch = fileList.slice(batchStart, batchEnd);
  
  // Report: `[TASK REPORT] Processing batch ${batchIndex + 1}/${totalBatches} (files ${batchStart + 1}-${batchEnd})`
  
  for (const fileInfo of batch) {
    try {
      // CRITICAL: Call read_file TOOL, not shell command
      // Tool call: read_file({ target_file: fileInfo.filePath })
      const content = [/* result from read_file tool */];
      
      // Parse tasks - CRITICAL: Must count ALL tasks accurately
      const lines = content.split('\n');
      let completed = 0;
      let pending = 0;
      let blocked = 0;
      let stubTasks = 0;
      
      // Parse each line - handle all task formats
      for (const line of lines) {
        const trimmed = line.trim();
        
        // Match task patterns - be comprehensive
        // Pattern: "- [x]" (completed)
        if (trimmed.match(/^-\s*\[x\]/i)) {
          completed++;
          // Check for stub marker
          if (trimmed.toLowerCase().includes('(stub)')) {
            stubTasks++;
          }
        }
        // Pattern: "- [ ]" (pending)
        else if (trimmed.match(/^-\s*\[\s*\]/)) {
          pending++;
        }
        // Pattern: "- [~]" (blocked)
        else if (trimmed.match(/^-\s*\[~\]/)) {
          blocked++;
        }
        // Pattern: "- [~]" or "- [~]" variations (in progress)
        else if (trimmed.match(/^-\s*\[[~\-\.]\]/)) {
          // Could be in progress or blocked - count as blocked for now
          blocked++;
        }
      }
      
      const total = completed + pending + blocked;
      
      // Store mechanism metrics
      mechanismMetrics[fileInfo.mechanism] = {
        completed,
        pending,
        blocked,
        total,
        stubTasks,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0
      };
      
      // Accumulate global metrics
      globalMetrics.totalTasks += total;
      globalMetrics.completed += completed;
      globalMetrics.pending += pending;
      globalMetrics.blocked += blocked;
      globalMetrics.stubTasks += stubTasks;
      
      // Report: `[TASK REPORT] ${fileInfo.mechanism}: ${total} tasks (${completed} completed, ${pending} pending, ${blocked} blocked)`
      
    } catch (error) {
      // Report error, continue with next file
      mechanismMetrics[fileInfo.mechanism] = {
        completed: 0,
        pending: 0,
        blocked: 0,
        total: 0,
        stubTasks: 0,
        percentage: 0,
        error: error.message
      };
    }
  }
}

// Final verification - report totals in AI response
// Report: `[TASK REPORT] FINAL TOTALS:`
// Report: `[TASK REPORT] Total Tasks: ${globalMetrics.totalTasks}`
// Report: `[TASK REPORT] Completed: ${globalMetrics.completed}`
// Report: `[TASK REPORT] Pending: ${globalMetrics.pending}`
// Report: `[TASK REPORT] Blocked: ${globalMetrics.blocked}`
// Report: `[TASK REPORT] Stub Tasks: ${globalMetrics.stubTasks}`
// Report: `[TASK REPORT] Mechanisms Processed: ${Object.keys(mechanismMetrics).length}`

// CRITICAL VERIFICATION: If total tasks is around 590, check for missing files or incomplete parsing
if (globalMetrics.totalTasks < 600) {
  // Report warning in AI response
  // `[TASK REPORT] WARNING: Total tasks (${globalMetrics.totalTasks}) seems low. Expected 1000+. Check for:`
  // `[TASK REPORT] - Missing TASKS.md files`
  // `[TASK REPORT] - Incomplete task parsing`
  // `[TASK REPORT] - Files not being read correctly`
}
```

**AI EXECUTION INSTRUCTIONS:**
1. For each file in batch, call `read_file()` tool (NOT shell `cat` command)
2. Parse the content returned by the tool
3. Count tasks using the regex patterns shown
4. Accumulate metrics
5. Report progress and totals in your AI response (NOT using console.log)
6. Continue until all files are processed

**VERIFICATION CHECKLIST:**
- [ ] Total file count matches discovered files
- [ ] Each file is processed and logged
- [ ] Task counts are accurate (check a few files manually)
- [ ] Global totals are calculated correctly
- [ ] If total tasks < 600, investigate missing files or parsing issues
- [ ] All mechanism metrics are stored

- **Verification**: Summary metrics generated with accurate counts
- **On Success**: Proceed to Step 2.3
- **On Failure**: Report partial metrics, proceed with available data

##### Step 2.3: Analyze Task Status (Detailed Analysis)
- **Action**: Perform detailed analysis on collected summary data
  - Categorize mechanisms by completion status (complete, in progress, pending)
  - Calculate overall completion percentage
  - Identify phases and their completion status (from mechanism summaries)
  - Note any `(stub)` implementations (from task parsing)
  - **Filtering Support**: If filters specified (mechanism, phase, status), apply here
- **Verification**: Task status analyzed
- **On Success**: Proceed to Step 2.4
- **On Failure**: Report analysis errors, use summary data

##### Step 2.4: Analyze Implementation State (Selective)
- **Action**: Verify actual implementation state efficiently
  - **Selective Processing**: Only check mechanisms with completed tasks
  - **Batch Verification**: Process mechanisms in batches
  - For each mechanism batch:
    - Check if code exists in `client_web2/src/mechanisms/`
    - For completed tasks only, verify against actual code (skip if too many)
    - Identify gaps between tasks and implementation
    - **Error Resilience**: If code check fails, mark as "unknown", continue
  - **Summary Approach**: For large datasets, provide summary statistics rather than per-task verification
  - Check for test files (count only, not detailed analysis)
- **Verification**: Implementation state analyzed
- **On Success**: Proceed to Step 2.5
- **On Failure**: Report analysis errors, use available data

##### Step 2.5: Analyze Recent Activity (Incremental)
- **Action**: Determine recent work efficiently
  - **Selective Reading**: Only read CHANGELOG.md files for mechanisms with recent activity indicators
  - **Batch Processing**: Process CHANGELOG files in batches
  - For each batch:
    - Read CHANGELOG.md (if exists)
    - Extract recent entries (last N entries only, not full history)
    - **Error Resilience**: If file read fails, skip, continue
  - Analyze file modification dates (if available) - sample-based, not exhaustive
  - Identify most recently worked on mechanisms (top N only)
  - Note recent completions (recent N only)
  - Identify stalled work (mechanisms with no activity in threshold period)
- **Verification**: Recent activity analyzed
- **On Success**: Proceed to Step 2.6
- **On Failure**: Report analysis errors, use available data

##### Step 2.6: Calculate Timings and Estimates
- **Action**: Estimate effort and timing based on summary data
  - Count remaining tasks (from summary metrics)
  - Estimate effort per task type (use averages, not per-task analysis)
  - Calculate estimated time to completion (based on totals)
  - Identify critical path tasks (summary-level, not exhaustive)
  - Note dependencies between tasks (from README.md summaries only, not full analysis)
  - Estimate time per mechanism (based on task counts and averages)
- **Verification**: Timings calculated
- **On Success**: Proceed to Step 2.7
- **On Failure**: Report calculation errors, use estimates

##### Step 2.7: Generate Recommendations
- **Action**: Create actionable recommendations based on summary data
  - Identify next logical steps based on dependencies (from summary analysis)
  - Prioritize tasks by:
    - Dependencies (blocking other work) - summary level
    - Critical path items - top N only
    - Quick wins - identify from completion percentages
    - High-value features - from mechanism priorities
  - Order recommendations implicitly (next steps in sequence)
  - Identify risks and blockers (from summary data)
  - Suggest focus areas (top N mechanisms needing attention)
- **Verification**: Recommendations generated
- **On Success**: Proceed to Step 2.8
- **On Failure**: Report generation errors, provide basic recommendations

##### Step 2.8: Generate Comprehensive Report (Progressive)
- **Action**: Create manager's report document progressively
  - **Start with Summary**: Generate Executive Summary first using summary metrics
  - **Progressive Enhancement**: Build report sections incrementally
  - **Executive Summary**:
    - Overall project status (from summary metrics)
    - Key metrics (completion %, tasks done/total)
    - Critical issues (from summary analysis)
    - Recent achievements (from recent activity analysis)
  - **Project State**:
    - Mechanisms overview (completed, in progress, pending) - summary table
    - Task breakdown by status (from summary metrics)
    - Implementation verification status (summary-level)
  - **Completed Work**:
    - List of completed mechanisms/phases (top N, not exhaustive for large datasets)
    - Recently completed items (recent N only)
    - Verified implementations (summary counts)
  - **Pending Work**:
    - Remaining tasks by mechanism (summary table, not full task lists)
    - Blocked items (summary counts and top N)
    - Stub implementations needing completion (summary counts)
  - **Recent Activity**:
    - Most recently worked on mechanisms (top N)
    - Recent completions (recent N)
    - Recent changes (summary from CHANGELOG analysis)
  - **Timings and Estimates**:
    - Estimated time to completion
    - Time per mechanism (estimated) - summary table
    - Critical path timeline (summary-level)
  - **Recommendations** (IMPLICIT ORDERING):
    - Next steps in recommended order (top N)
    - Priority items (top N)
    - Focus areas (top N)
    - Risk mitigation (summary)
  - **Problems and Blockers**:
    - Current blockers (summary counts and top N)
    - Risks identified (summary)
    - Dependencies issues (summary)
  - **Mechanism Details**:
    - Per-mechanism breakdown (summary table format)
    - Task counts (from summary metrics)
    - Completion status (from summary analysis)
    - Implementation status (summary-level)
    - **Pagination Note**: For large datasets, indicate if details are truncated
- **Verification**: Report generated
- **On Success**: Proceed to Step 2.9
- **On Failure**: Report generation errors, save partial report

##### Step 2.9: Save Report (Streaming Write)
- **Action**: Save report to file efficiently
  - Create timestamped report file: `client_web2/plans/reports/task-report-[timestamp].md`
  - Ensure reports directory exists
  - **Streaming Write**: Write report sections incrementally as they're generated
  - Format as markdown
  - Include metadata (generation date, scope, processing notes)
  - Include performance notes if dataset is large (e.g., "Processed 40+ files, 1000+ tasks")
- **Verification**: Report saved
- **On Success**: Proceed to Step 2.10
- **On Failure**: Report save errors, attempt to save partial report

##### Step 2.10: Present Report (Summary-First Display)
- **Action**: Display comprehensive report efficiently
  - **Summary-First**: Display Executive Summary and key metrics first
  - Format report sections clearly
  - Highlight key metrics prominently
  - Emphasize recommendations (with implicit ordering)
  - Show actionable items (top N)
  - Provide report file location
  - **Note Large Datasets**: If dataset is large, indicate that full details are in report file
  - **Truncation Notice**: If any sections are truncated, note this clearly
- **Verification**: Report presented
- **On Success**: Command complete
- **On Failure**: Report presentation issues, provide report file location

## Pre-requisites
- [ ] TASKS.md files exist
- [ ] Access to mechanism directories
- [ ] Access to source code (for audit)
- [ ] Read permissions for plans directory

## Implementation Requirements

### CRITICAL: Tool Usage (Not Shell Commands)

**IMPORTANT**: The implementation code examples use JavaScript syntax, but they represent **tool calls** that the AI should make using available tools, NOT shell commands.

- Use `glob_file_search()` tool to find files (NOT `find` or shell commands)
- Use `read_file()` tool to read files (NOT `cat` or shell commands)
- Use `list_dir()` tool to list directories (NOT `ls` or shell commands)
- **DO NOT** use shell commands with `&&` (PowerShell doesn't support this)
- **DO NOT** chain commands with `&&` - use separate tool calls instead
- All operations should use the available tools directly

### CRITICAL: Accurate File Discovery and Task Counting

When executing `/task report`, the AI MUST:

1. **Discover ALL Files**:
   - Use `glob_file_search` or `list_dir` recursively to find ALL `TASKS.md` files
   - Include mechanisms AND subsystems (e.g., `carousel-composer/subsystems/infinite-scroll/TASKS.md`)
   - Count total files discovered and log: `[TASK REPORT] Discovered X TASKS.md files`
   - If count is less than ~40, investigate missing files

2. **Count ALL Tasks Accurately**:
   - Parse every line in every TASKS.md file
   - Match ALL task patterns:
     - `- [x]` or `- [X]` (completed)
     - `- [ ]` (pending)
     - `- [~]` (blocked)
     - Variations with different spacing
   - Count stub tasks: tasks with `(stub)` marker
   - Log per-file counts: `[TASK REPORT] {mechanism}: {total} tasks`
   - Accumulate global totals accurately

3. **Verify Totals**:
   - After processing all files, log final totals
   - If total tasks < 600, investigate:
     - Missing files
     - Incomplete parsing
     - Files not being read
   - Expected: 1000+ tasks across all mechanisms

4. **Batch Processing**:
   - Process files in batches of 8
   - Log progress: `[TASK REPORT] Processing batch X/Y`
   - Continue even if some files fail

### Example Implementation Pattern

**CRITICAL: Use Tools, Not Shell Commands**

```javascript
// Step 1: Discover ALL files using glob_file_search TOOL
// Tool call: glob_file_search({
//   glob_pattern: "**/TASKS.md",
//   target_directory: "client_web2/plans/mechanisms"
// })
// Report in AI response: `[TASK REPORT] Discovered ${taskFiles.length} TASKS.md files`

// Step 2: Process in batches using read_file TOOL
const BATCH_SIZE = 8;
for (let i = 0; i < taskFiles.length; i += BATCH_SIZE) {
  const batch = taskFiles.slice(i, i + BATCH_SIZE);
  // For each file in batch: call read_file() tool
  // Parse content and count tasks
  // Accumulate metrics
}

// Step 3: Verify totals and report in AI response
if (globalMetrics.totalTasks < 600) {
  // Report warning in AI response (NOT console.warn)
  // `[TASK REPORT] WARNING: Only ${globalMetrics.totalTasks} tasks found. Expected 1000+`
}
```

**POWERSHELL COMPATIBILITY NOTE:**
- **DO NOT** use shell commands with `&&` (e.g., `cd dir && node script.js`)
- **DO NOT** chain commands - use separate tool calls
- **DO** use available tools directly: `glob_file_search()`, `read_file()`, `list_dir()`
- **DO** process results in AI execution context, not shell scripts

## Scalability Considerations

### Large Dataset Handling (40+ files, 1000+ tasks)
The `/task report` command is designed to handle large-scale task reporting efficiently:

1. **Incremental Processing**: Files are processed in batches, not all at once
2. **Summary-First Approach**: High-level metrics generated first, details added progressively
3. **Streaming Parsing**: Tasks parsed as files are read, not stored in full memory
4. **Error Resilience**: Processing continues even if some files fail
5. **Selective Analysis**: Only detailed analysis on relevant subsets (e.g., completed tasks)
6. **Progressive Report Generation**: Report sections built incrementally
7. **Memory Efficient**: Only stores counts and summaries, not full task lists

### Performance Characteristics
- **File Discovery**: O(n) where n = number of directories
- **Task Parsing**: O(m) where m = total lines, processed incrementally
- **Memory Usage**: O(k) where k = number of mechanisms (not tasks)
- **Report Generation**: O(k) for summary, O(m) only if full details requested

### Filtering and Pagination (Future Enhancement)
- Support for filtering by mechanism, phase, status
- Pagination for large result sets
- Caching of parsed task data (optional optimization)

## Verification Steps
1. Command parsed correctly
2. Sub-command executed
3. Data collected
4. Analysis completed
5. Results presented/report generated

## Success Criteria
- [ ] Command parsed correctly
- [ ] Sub-command executed successfully
- [ ] Data collected accurately
- [ ] Analysis completed
- [ ] Results presented clearly
- [ ] Report saved (for report sub-command)

## Status Reporting Format

### For `/task audit`:
```
[COMMAND] /task audit [mechanism]
[STATUS] Success/Failure
[STEPS] X/5 completed
[VERIFICATION] Passed/Failed
[DETAILS]
  - Target: [mechanism name or "all mechanisms"]
  - Tasks audited: [count]
  - Verified: [count] ✅
  - Unverified: [count] ⚠️
  - Stub implementations: [count] 🔍
  - Missing implementations: [count] ❌
  - Issues found: [list]
  - Recommendations: [list]
```

### For `/task list`:
```
[COMMAND] /task list [mechanism]
[STATUS] Success/Failure
[STEPS] X/3 completed
[VERIFICATION] Passed/Failed
[DETAILS]
  - Target: [mechanism name or "all mechanisms"]
  - Total tasks: [count]
  - Completed: [count] ([percentage]%)
  - Pending: [count]
  - In Progress: [count]
  - Blocked: [count]
  - Mechanisms: [list]
  - Task breakdown: [summary]
```

### For `/task report`:
```
[COMMAND] /task report
[STATUS] Success/Failure/Partial Success
[STEPS] X/10 completed
[VERIFICATION] Passed/Failed/Partial
[DETAILS]
  - Report generated: [timestamp]
  - Report file: [path]
  - Files processed: [count] of [total] (if partial)
  - Processing method: [incremental/streaming/summary-first]
  - Overall completion: [percentage]%
  - Total tasks: [count]
  - Completed: [count]
  - Pending: [count]
  - Mechanisms: [count]
  - Completed mechanisms: [count]
  - Recent activity: [summary]
  - Estimated time to completion: [estimate]
  - Critical issues: [count]
  - Recommendations: [count] (ordered)
  - Report sections: [list]
  - Performance notes: [any scalability notes]
  - Errors encountered: [count] (if any files skipped)
```

## Error Handling

### Invalid Sub-command
- **Error**: Sub-command is invalid
- **Handling**: List valid sub-commands (audit, list, report)
- **Action**: Use valid sub-command

### Mechanism Not Found
- **Error**: Specified mechanism doesn't exist
- **Handling**: List available mechanisms
- **Action**: Specify correct mechanism or use "all"

### TASKS.md Not Found
- **Error**: TASKS.md file missing for mechanism
- **Handling**: Report missing file, skip mechanism
- **Action**: Create TASKS.md file or check mechanism name

### Cannot Access Codebase
- **Error**: Cannot read source code for audit
- **Handling**: Report access issues, skip code verification
- **Action**: Check permissions or file paths

### Report Generation Failure
- **Error**: Cannot generate report
- **Handling**: Report generation error
- **Action**: Check directory permissions, disk space

### Large Dataset Performance
- **Error**: Report generation is slow or fails due to dataset size
- **Handling**: Use incremental processing, batch files, summary-first approach
- **Action**: Report will automatically use scalable methods, provide progress updates

### File Read Errors During Processing
- **Error**: Some TASKS.md files cannot be read
- **Handling**: Log error, skip file, continue processing
- **Action**: Report will include note about skipped files, continue with available data

### Memory Constraints
- **Error**: Processing fails due to memory limits
- **Handling**: Use streaming processing, don't load all data at once
- **Action**: Report uses incremental processing to avoid memory issues

## Examples

### Example 1: Task Audit for Specific Mechanism
```
User: /task audit story-fetcher
AI:
[COMMAND] /task audit story-fetcher
[STATUS] Success
[STEPS] 5/5 completed
[VERIFICATION] Passed
[DETAILS]
  - Target: story-fetcher
  - Tasks audited: 47
  - Verified: 12 ✅
  - Unverified: 2 ⚠️
  - Stub implementations: 1 🔍
  - Missing implementations: 0 ❌
  - Issues found:
    1. Task "Implement retry logic" marked complete but retry function not found
    2. Task "Add error handling" marked complete but error handling incomplete
  - Recommendations:
    1. Verify retry logic implementation or mark task as pending
    2. Complete error handling implementation
    3. Replace stub implementation with full implementation
```

### Example 2: Task List for All Mechanisms
```
User: /task list
AI:
[COMMAND] /task list (all mechanisms)
[STATUS] Success
[STEPS] 3/3 completed
[VERIFICATION] Passed
[DETAILS]
  - Target: all mechanisms
  - Total tasks: 342
  - Completed: 89 (26%)
  - Pending: 241
  - In Progress: 8
  - Blocked: 4
  - Mechanisms: 19
  - Task breakdown:
    - story-fetcher: 12/47 (26%)
    - card-composer: 8/23 (35%)
    - carousel-composer: 15/56 (27%)
    - [etc...]
```

### Example 3: Comprehensive Task Report
```
User: /task report
AI:
[COMMAND] /task report
[STATUS] Success
[STEPS] 9/9 completed
[VERIFICATION] Passed
[DETAILS]
  - Report generated: 2024-01-15T14:32:18Z
  - Report file: client_web2/plans/reports/task-report-20240115-143218.md
  - Overall completion: 26%
  - Total tasks: 342
  - Completed: 89
  - Pending: 241
  - Mechanisms: 19
  - Completed mechanisms: 0 (all partial)
  - Recent activity:
    - Last worked on: story-fetcher (2 days ago)
    - Recent completions: 3 tasks in card-composer
    - Recent changes: Updated TASKS.md for 2 mechanisms
  - Estimated time to completion: 8-12 weeks
  - Critical issues: 2 blockers
  - Recommendations: 15 items (ordered)
  - Report sections:
    1. Executive Summary
    2. Project State
    3. Completed Work
    4. Pending Work
    5. Recent Activity
    6. Timings and Estimates
    7. Recommendations (ordered)
    8. Problems and Blockers
    9. Mechanism Details

[Full report displayed below...]
```

## Report Format Template

The `/task report` command generates reports in this format:

```markdown
# Task Management Report
**Generated:** [timestamp]  
**Scope:** All Mechanisms  
**Report Type:** Comprehensive Manager Report

## Executive Summary
- **Overall Status:** [status]
- **Completion:** [X]% ([Y] tasks completed of [Z] total)
- **Mechanisms:** [A] total, [B] completed, [C] in progress
- **Critical Issues:** [count]
- **Recent Achievements:** [list]

## Project State

### Overall Metrics
- Total Tasks: [count]
- Completed: [count] ([percentage]%)
- Pending: [count]
- In Progress: [count]
- Blocked: [count]

### Mechanism Status
| Mechanism | Tasks | Completed | % | Status |
|-----------|-------|-----------|---|--------|
| [name] | [total] | [done] | [%] | [status] |

## Completed Work

### Recently Completed
- [List of recent completions with dates]

### Verified Implementations
- [List of verified completed tasks]

### Completed Phases
- [List of completed phases by mechanism]

## Pending Work

### Remaining Tasks by Mechanism
[Breakdown per mechanism]

### Blocked Items
- [List of blocked tasks and reasons]

### Stub Implementations
- [List of stubs needing completion]

## Recent Activity

### Most Recently Worked On
1. [Mechanism] - [timeframe]
2. [Mechanism] - [timeframe]

### Recent Completions
- [List with dates]

### Recent Changes
- [List from CHANGELOG]

## Timings and Estimates

### Estimated Time to Completion
- **Optimistic:** [estimate]
- **Realistic:** [estimate]
- **Pessimistic:** [estimate]

### Time per Mechanism (Estimated)
[Table with estimates]

### Critical Path
[Timeline showing dependencies]

## Recommendations (Ordered)

### Immediate Next Steps (In Order)
1. [Task/Mechanism] - [reason] - [estimated time]
2. [Task/Mechanism] - [reason] - [estimated time]
3. [Task/Mechanism] - [reason] - [estimated time]

### Priority Items
[Prioritized list]

### Focus Areas
[Areas requiring attention]

### Risk Mitigation
[Risk mitigation strategies]

## Problems and Blockers

### Current Blockers
- [Blocker 1]
- [Blocker 2]

### Risks Identified
- [Risk 1]
- [Risk 2]

### Dependency Issues
- [Issue 1]
- [Issue 2]

## Mechanism Details

### [Mechanism Name]
- **Status:** [status]
- **Tasks:** [X]/[Y] completed ([Z]%)
- **Phases:** [phase status]
- **Implementation:** [verified/unverified/partial]
- **Recent Activity:** [summary]
- **Next Steps:** [list]
```

## Related Commands
- [/status](status.md) - Check system status
- [/audit](audit.md) - Comprehensive audits
- [/check](check.md) - Quick health check
- [/planner](planner.md) - Plan management
- [/implement](implement.md) - Implementation execution


