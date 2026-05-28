# Command: /implement

## Trigger
The command is triggered when user says: `/implement`, `implement`, `/implement [mechanism]`, or variations like "implement the story fetcher" or "start implementing"

## Purpose
Execute the implementation plan for a mechanism. This is a comprehensive command that gathers information, creates detailed implementation plans, tracks progress, and implements mechanisms step-by-step with full documentation and resumability.

## Context
Use this command when:
- User wants to implement a specific mechanism
- User wants to start building a mechanism from the plans
- User wants to continue/resume implementation
- User wants to execute the implementation plan

## Execution Steps

### Step 1: Identify Implementation Target
- **Action**: Determine what to implement
  - Parse user input for mechanism name (e.g., "story-fetcher", "carousel-composer")
  - If not specified: Ask user which mechanism to implement
  - Validate mechanism exists in `plans/mechanisms/` directory
  - Check if mechanism folder has README.md, TASKS.md, CHANGELOG.md, COMMENTS.md
  - Verify mechanism is ready for implementation
- **Verification**: Mechanism is identified and valid
- **On Success**: Proceed to Step 2
- **On Failure**: Report error and list available mechanisms

### Step 2: Gather Information
- **Action**: Collect comprehensive information about the mechanism
  - Read mechanism README.md for requirements and design (section order and File Structure must follow [plans/MECHANISM_README_STANDARD.md](../MECHANISM_README_STANDARD.md))
  - Read mechanism TASKS.md to see current progress
  - Read mechanism CHANGELOG.md for history
  - Read mechanism COMMENTS.md for known issues/notes
  - Search codebase for current implementations (base and web versions)
  - Identify all files related to this mechanism in base/web
  - Read relevant source files from base/web versions
  - Identify dependencies from mechanism README.md
  - Check if dependencies are implemented (if not, note as prerequisite)
  - Gather design decisions from README.md
  - Note any complexity issues from COMMENTS.md
  - **Detect stub tasks**: Check TASKS.md for tasks marked with `(stub)` notation
  - **Check existing stub implementations**: If mechanism already has code, verify which files are stubs:
    - Search for stub comments in code (`// stub`, `// TODO`, `// placeholder`, `Note: This is a stub`)
    - Check if stub implementations match stub tasks in TASKS.md
    - Identify what dependencies are missing for stub tasks
- **Verification**: Information is gathered comprehensively, stubs identified
- **On Success**: Proceed to Step 3
- **On Failure**: Report missing information or access issues

### Step 3: Analyze Current Implementations
- **Action**: Deep analysis of existing implementations
  - Compare base version implementation
  - Compare web version implementation
  - Identify what works well in each version
  - Identify problems/complexity in each version
  - Identify differences between versions
  - Extract reusable patterns
  - Extract lessons learned
  - Note what to avoid (from COMMENTS.md)
  - Document current implementation details
- **Verification**: Analysis is complete
- **On Success**: Proceed to Step 4
- **On Failure**: Report analysis issues

### Step 4: Design New Implementation Plan
- **Action**: Create detailed implementation plan
  - Review mechanism README.md design decisions
  - Review mechanism TASKS.md for planned tasks
  - Design improved architecture based on analysis
  - Identify what makes new version better:
    - Simplicity improvements
    - Performance improvements
    - Maintainability improvements
    - Bug fixes
    - Feature additions
  - Break down into implementation phases
  - Identify file structure for web2
  - Identify TypeScript interfaces/types needed
  - Identify dependencies on other mechanisms
  - Create step-by-step implementation plan
  - Estimate complexity and effort
- **Verification**: Plan is comprehensive and clear
- **On Success**: Proceed to Step 5
- **On Failure**: Report planning issues

### Step 5: Output Implementation Plan
- **Action**: Present the plan before coding
  - Format comprehensive plan document
  - Include:
    - **Overview**: What will be implemented
    - **Current State**: What exists in base/web versions
    - **Problems Identified**: Issues with current implementations
    - **Improvements**: What makes web2 version better
    - **Architecture**: New design and structure
    - **File Structure**: Where files will be created
    - **Dependencies**: What other mechanisms are needed
    - **Implementation Phases**: Step-by-step breakdown
    - **Risk Assessment**: Potential issues and mitigations
  - Present plan to user for review
  - Wait for user approval before proceeding
  - Update mechanism COMMENTS.md with plan details
- **Verification**: Plan is presented and approved
- **On Success**: Proceed to Step 6
- **On Failure**: Revise plan based on feedback

### Step 6: Check Prerequisites
- **Action**: Verify prerequisites are met
  - Check if dependencies are implemented
  - Check if required tools/configurations exist
  - Check if web2 folder structure exists
  - Verify TypeScript/build setup
  - Check if tests can be run
  - Verify documentation structure
  - If prerequisites missing: Report and pause (don't fail, just note)
- **Verification**: Prerequisites checked
- **On Success**: Proceed to Step 7
- **On Failure**: Report missing prerequisites, suggest fixes

### Step 7: Initialize Implementation Tracking
- **Action**: Set up progress tracking
  - Check current state of TASKS.md
  - Mark first task as "in-progress" in TASKS.md
  - Create initial CHANGELOG.md entry: "[ADDED] Starting implementation"
  - Note start time in COMMENTS.md
  - Create implementation session note in COMMENTS.md
  - Verify tracking files are ready
- **Verification**: Tracking is initialized
- **On Success**: Proceed to Step 8
- **On Failure**: Report tracking initialization issues

### Step 8: Execute Implementation Phases
- **Action**: Implement mechanism phase by phase
  - For each phase in the plan:
    - Mark phase as "in-progress" in TASKS.md
    - Execute phase tasks:
      - Create files/folders as planned
      - Write code following design
      - Add TypeScript types
      - Add comments/documentation
      - Follow web2 patterns and conventions
    - After each significant change:
      - Update CHANGELOG.md with change entry (when the mechanism uses task IDs, include `tasks: T-id1, T-id2` so completion dates are accurate; see plans/CHANGELOG_TASK_MILESTONE_PLAN.md)
      - Update TASKS.md to mark completed tasks
      - Note progress in COMMENTS.md
    - Verify phase completion:
      - Code compiles (if applicable)
      - Basic syntax checks pass
      - Files are created correctly
    - Mark phase as "completed" in TASKS.md
  - Continue until all phases complete
  - Handle errors gracefully:
    - Document issues in COMMENTS.md
    - Update CHANGELOG.md with fixes
    - Adjust plan if needed
- **Verification**: Phases execute successfully
- **On Success**: Proceed to Step 9
- **On Failure**: Report phase execution issues, allow resume

### Step 9: Verify Implementation
- **Action**: Verify implementation is complete
  - Check all planned files exist
  - Verify code structure matches plan
  - Run basic compilation checks
  - Verify TypeScript types are correct
  - Check that all TASKS.md items are completed
  - Verify documentation is updated
  - Compare against plan to ensure completeness
  - **Verify stub status**: For tasks marked `(stub)` in TASKS.md:
    - Verify stub implementations exist in code
    - Verify stub code has clear comments indicating it's a stub
    - Verify stub dependencies are documented
    - Verify stub tasks are NOT marked as fully implemented
  - **Identify stub vs real**: Distinguish between:
    - Stub implementations: Placeholder code with TODO comments
    - Real implementations: Fully functional code
- **Verification**: Implementation is verified, stubs clearly identified
- **On Success**: Proceed to Step 10
- **On Failure**: Report verification failures, list missing items

### Step 10: Update Documentation
- **Action**: Finalize all documentation
  - Update mechanism README.md with implementation notes
  - Mark all completed tasks in TASKS.md
  - Add final CHANGELOG.md entry: "[COMPLETED] Implementation finished" (include `tasks: T-id1, …` when mechanism uses task IDs for timeline accuracy)
  - Update COMMENTS.md with:
    - Implementation summary
    - Lessons learned
    - Known issues (if any)
    - Next steps
  - Verify all documentation is complete
- **Verification**: Documentation is updated
- **On Success**: Proceed to Step 11
- **On Failure**: Report documentation issues

### Step 11: Report Implementation Complete
- **Action**: Present final implementation report
  - Format completion report
  - Include:
    - Implementation summary
    - Files created/modified
    - Phases completed
    - Improvements achieved
    - Next steps (testing, integration, etc.)
  - Present report using standard format
- **Verification**: Report is complete
- **On Success**: Command complete
- **On Failure**: Report completion issues

## Resume Capability

### Checking Implementation Status
- Read mechanism TASKS.md to see progress
- Read mechanism CHANGELOG.md for recent changes
- Read mechanism COMMENTS.md for current state
- Identify last completed phase
- Resume from next incomplete phase

### Resuming Implementation
- When resuming:
  - Start from Step 2 (Gather Information) to refresh context
  - Check TASKS.md for completed items
  - **Check for stubs**: Identify which completed tasks are stubs vs real implementations
  - Continue from first incomplete task (or first stub that needs real implementation)
  - Update COMMENTS.md with resume note

## Pre-requisites
- [ ] Mechanism exists in `plans/mechanisms/` directory
- [ ] Mechanism has README.md, TASKS.md, CHANGELOG.md, COMMENTS.md
- [ ] Access to base/web versions for reference
- [ ] web2 folder structure exists
- [ ] TypeScript/build tools configured (if applicable)
- [ ] User approval of implementation plan

## Verification Steps
1. Mechanism identified
2. Information gathered comprehensively
3. Current implementations analyzed
4. New implementation plan designed
5. Plan presented and approved
6. Prerequisites checked
7. Tracking initialized
8. Implementation phases executed
9. Implementation verified
10. Documentation updated
11. Completion reported

## Success Criteria
- [ ] Mechanism identified
- [ ] Comprehensive information gathered
- [ ] Current implementations analyzed
- [ ] Detailed plan created and approved
- [ ] All phases implemented
- [ ] Implementation verified
- [ ] Documentation complete
- [ ] Progress tracked in TASKS.md and CHANGELOG.md

## Status Reporting Format
```
[COMMAND] /implement [mechanism]
[STATUS] Planning/In Progress/Completed/Paused
[STEPS] X/11 completed
[VERIFICATION] Passed/Failed
[DETAILS]
  - Mechanism: [mechanism name]
  - Current phase: [phase name]
  - Tasks completed: X/Y
  - Files created: [count]
  - Files modified: [count]
  - Prerequisites: [met/missing]
  - Next steps: [list]
  - Progress: [summary]
```

## Implementation Plan Output Format

When presenting the plan (Step 5), use this format:

```markdown
# Implementation Plan: [Mechanism Name]

## Overview
[What will be implemented]

## Current State Analysis

### Base Version ([path])
- **Location**: [file paths]
- **What Works**: [list]
- **Problems**: [list]
- **Complexity**: [assessment]

### Web Version ([path])
- **Location**: [file paths]
- **What Works**: [list]
- **Problems**: [list]
- **Complexity**: [assessment]

### Comparison
- **Differences**: [list]
- **Common Issues**: [list]
- **Best Practices**: [list]

## Improvements for web2

### Simplicity
- [Improvement 1]
- [Improvement 2]

### Performance
- [Improvement 1]
- [Improvement 2]

### Maintainability
- [Improvement 1]
- [Improvement 2]

### Bug Fixes
- [Fix 1]
- [Fix 2]

## Architecture Design

### File Structure
```
client_web2/src/
  mechanisms/
    [mechanism-name]/
      index.ts
      [files...]
```

### Key Components
- [Component 1]: [description]
- [Component 2]: [description]

### Dependencies
- [Dependency 1]: [status - implemented/needed]
- [Dependency 2]: [status]

## Implementation Phases

### Phase 1: [Phase Name]
- [ ] Task 1
- [ ] Task 2
- **Estimated effort**: [time]
- **Dependencies**: [list]

### Phase 2: [Phase Name]
- [ ] Task 1
- [ ] Task 2
- **Estimated effort**: [time]
- **Dependencies**: [list]

## Risk Assessment
- **Risk 1**: [description] - Mitigation: [strategy]
- **Risk 2**: [description] - Mitigation: [strategy]

## Approval Required
[Wait for user approval before proceeding]
```

## Error Handling

### Mechanism Not Found
- **Error**: Mechanism doesn't exist in plans
- **Handling**: List available mechanisms
- **Action**: Create mechanism documentation first or specify correct name

### Missing Documentation
- **Error**: Mechanism missing README.md or TASKS.md
- **Handling**: Report missing files
- **Action**: Create missing documentation files first

### Prerequisites Not Met
- **Error**: Dependencies not implemented
- **Handling**: List missing dependencies
- **Action**: Implement dependencies first or proceed with notes

### Implementation Failure
- **Error**: Phase fails to implement
- **Handling**: Document failure in COMMENTS.md
- **Action**: Fix issue, update plan if needed, resume

### User Rejects Plan
- **Error**: User doesn't approve implementation plan
- **Handling**: Request feedback
- **Action**: Revise plan based on feedback, re-present

## Examples

### Example 1: Starting Fresh Implementation
```
User: /implement story-fetcher
AI:
[COMMAND] /implement story-fetcher
[STATUS] Planning
[STEPS] 1/11 completed
[DETAILS]
  - Mechanism: story-fetcher
  - Current phase: Gathering information
  - Progress: Reading mechanism documentation and analyzing current implementations

[GATHERING INFORMATION...]
- Read mechanism README.md ✓
- Read mechanism TASKS.md ✓
- Analyzing base version: src/components/store/storyStore.js
- Analyzing web version: maroela_web/src/components/Carousel/hooks/useInfiniteScroll.ts
- Identifying dependencies...

[ANALYZING CURRENT IMPLEMENTATIONS...]
- Base version: Centralized store with consumer pattern (complex)
- Web version: Hook-based (also complex, 962 lines)
- Common issues: Too much complexity, tight coupling

[DESIGNING IMPLEMENTATION PLAN...]

# Implementation Plan: Story Fetcher

## Overview
Implement a simplified story fetcher that fetches stories from Liveblog REST API API with clean separation of concerns.

## Current State Analysis

### Base Version (src/components/store/storyStore.js)
- **Location**: src/components/store/storyStore.js (225 lines)
- **What Works**: 
  - Consumer pattern allows multiple carousels to share stories
  - Background preloading works well
- **Problems**:
  - Complex consumer registration system
  - Shared state can cause issues
  - Hard to test
- **Complexity**: High - consumer pattern adds complexity

### Web Version (maroela_web/src/components/Carousel/hooks/useInfiniteScroll.ts)
- **Location**: maroela_web/src/components/Carousel/hooks/useInfiniteScroll.ts (962 lines)
- **What Works**:
  - Hook-based approach is more React-friendly
  - Per-carousel cache keys work well
- **Problems**:
  - WAY too complex (962 lines!)
  - Handles too many concerns (caching, polling, fetching, state)
  - Difficult to understand and maintain
- **Complexity**: Very High - handles too much

### Comparison
- **Differences**: Base uses consumer pattern, web uses hooks
- **Common Issues**: Both are too complex, tight coupling
- **Best Practices**: Need simpler, focused approach

## Improvements for web2

### Simplicity
- Single `fetchStories()` function instead of complex patterns
- No consumer registration - direct usage
- Clear, simple API

### Performance
- Request deduplication
- Efficient caching integration
- Optimized GraphQL queries

### Maintainability
- Focused responsibilities
- Easy to test
- Clear documentation

## Architecture Design

### File Structure
```
client_web2/src/
  mechanisms/
    story-fetcher/
      index.ts              # Main export
      fetchStories.ts       # Core fetch function
      types.ts              # TypeScript types
      filters.ts            # Filter utilities
      errors.ts             # Error handling
```

### Key Components
- fetchStories: Core function for fetching stories
- Filter utilities: Build and validate filters
- Error handling: Comprehensive error management

### Dependencies
- query-builder: Needed (to be implemented)
- transform-functions: Needed (to be implemented)
- story-cache: Needed (to be implemented)
- polling-system: Needed (to be implemented)

## Implementation Phases

### Phase 1: Setup and Types
- [ ] Create mechanism folder structure
- [ ] Define TypeScript interfaces
- [ ] Create types.ts file
- **Estimated effort**: 30 minutes
- **Dependencies**: None

### Phase 2: Core Fetch Function
- [ ] Implement fetchStories function
- [ ] Add error handling
- [ ] Add retry logic
- **Estimated effort**: 2 hours
- **Dependencies**: query-builder, transform-functions

### Phase 3: Filter Utilities
- [ ] Implement filter validation
- [ ] Implement filter utilities
- **Estimated effort**: 1 hour
- **Dependencies**: None

### Phase 4: Integration
- [ ] Integrate with query-builder
- [ ] Integrate with transform-functions
- [ ] Integrate with story-cache
- **Estimated effort**: 1.5 hours
- **Dependencies**: All dependencies must be implemented

## Risk Assessment
- **Risk 1**: Dependencies not ready - Mitigation: Implement dependencies first
- **Risk 2**: GraphQL API changes - Mitigation: Test with actual API

## Approval Required
Please review this plan. Type "approve" to proceed with implementation, or provide feedback for revisions.
```

### Example 2: Resuming Implementation
```
User: /implement story-fetcher
AI:
[COMMAND] /implement story-fetcher
[STATUS] In Progress
[STEPS] 7/11 completed
[DETAILS]
  - Mechanism: story-fetcher
  - Current phase: Phase 2 - Core Fetch Function
  - Tasks completed: 4/12
  - Files created: 2
  - Progress: Phase 1 completed, starting Phase 2

[RESUMING IMPLEMENTATION...]
- Reading TASKS.md to check progress...
- Phase 1: Completed ✓
- Phase 2: In progress (2/4 tasks done)
- Continuing from: Implement error handling

[CONTINUING IMPLEMENTATION...]
- Implementing error handling...
- Adding retry logic...
- Updating CHANGELOG.md...
- Marking tasks complete in TASKS.md...
```

## Stub Handling

### Detecting Stubs During Implementation

When gathering information (Step 2), check for stubs:
1. **In TASKS.md**: Look for tasks marked with `(stub)` notation
2. **In Code**: Search for stub indicators:
   - Comments: `// stub`, `// TODO`, `// placeholder`, `Note: This is a stub`
   - Placeholder implementations that don't fully work
   - Code that returns mock/placeholder data
3. **In Documentation**: Check COMMENTS.md and CHANGELOG.md for stub mentions

### Handling Stub Tasks

When implementing a task marked as `(stub)`:
1. **Create stub implementation**:
   - Implement the interface/structure
   - Add clear stub comments explaining what's missing
   - Document missing dependencies
   - Make it compile/run but with placeholder behavior
2. **Mark as stub in code**:
   ```typescript
   /**
    * Note: This is a stub implementation. Full implementation requires:
    * - [dependency 1]: [what it needs]
    * - [dependency 2]: [what it needs]
    */
   ```
3. **Update TASKS.md**: Mark as `- [x] Task name (stub)`
4. **Update CHANGELOG.md**: `[ADDED] Task name (stub implementation)`
5. **Update COMMENTS.md**: Document stub status and dependencies

### Transitioning from Stub to Real Implementation

When dependencies become available and you want to replace a stub:

1. **Use `/planner` first**:
   - Update TASKS.md: Remove `(stub)` notation
   - Update README.md: Remove stub from dependencies if needed
   - Update CHANGELOG.md: `[CHANGED] Task name - replacing stub with real implementation`

2. **Then use `/implement`**:
   - Start from Step 2 (Gather Information)
   - Identify the stub implementation in code
   - Design real implementation plan
   - Replace stub code with real implementation
   - Remove stub comments
   - Update TASKS.md: Mark as fully completed (no stub notation)
   - Update CHANGELOG.md: `[CHANGED] Task name - replaced stub with real implementation`

### Stub Detection Checklist

When starting implementation, verify:
- [ ] All stub tasks in TASKS.md are identified
- [ ] Stub implementations in code match stub tasks
- [ ] Stub dependencies are documented
- [ ] Stub code has clear comments
- [ ] Stub status is tracked in COMMENTS.md or CHANGELOG.md

### Preventing Stub Confusion

To avoid mistaking stubs for real implementations:
- Always check TASKS.md for `(stub)` notation
- Always check code for stub comments
- Always verify dependencies are available before assuming real implementation
- When in doubt, check COMMENTS.md for stub documentation

## Related Commands
- [/build](build.md) - Build after implementation
- [/test](test.md) - Test after implementation
- [/validate](validate.md) - Validate implementation against plan
- [/audit](audit.md) - Audit implementation
- [/debug](debug.md) - Debug during implementation
- [/planner](planner.md) - Update plans (use to mark/unmark stubs)

