# Command: /planner

## Trigger
The command is triggered when user says: `/planner`, `planner`, `/planner [action]`, or variations like "update the plan" or "create a new mechanism"

## Purpose
**THE ONLY WAY** to update, delete, change, or create mechanism plans. This command ensures plan integrity by validating dependencies, preventing overlaps, checking references, and maintaining consistency across all mechanism documentation.

## Context
Use this command when:
- User wants to create a new mechanism
- User wants to modify an existing mechanism plan
- User wants to delete a mechanism
- User wants to update mechanism documentation
- User wants to change mechanism relationships
- User wants to plan or update components within a mechanism
- **NEVER** modify mechanism plans directly - always use this command

## Critical Rules

### Rule 1: Only Way to Modify Plans
- **NEVER** modify mechanism plans (README.md, TASKS.md, CHANGELOG.md, COMMENTS.md) directly
- **ALWAYS** use `/planner` command for any plan changes
- Direct modifications bypass validation and can break plan integrity

### Rule 2: README standard
- When creating or updating mechanism/subsystem README.md, **MUST** follow [plans/MECHANISM_README_STANDARD.md](../MECHANISM_README_STANDARD.md): canonical section order (index) and File Structure format (ASCII tree: `├` `└` `│` `─`). No reordering; no indentation-only trees.

### Rule 3: Full Validation Required
- Every change must be validated before finalization
- Check dependencies, overlaps, references
- Ensure consistency across all mechanisms

### Rule 4: Discussion First
- Always discuss changes before implementing
- Understand implications
- Get user confirmation

### Rule 5: Stub Handling
- **Stub Notation**: Tasks that are stub implementations should be marked with `(stub)` notation: `- [x] Task name (stub)`
- **Stub vs Real**: Distinguish between stub implementations (placeholder code) and real implementations (fully functional)
- **Stub Tracking**: When marking a task complete as stub, document:
  - What dependencies are missing
  - What the stub does vs what it should do
  - When the stub should be replaced with real implementation
- **Stub Validation**: During validation, check that stubs are clearly marked and documented

## Execution Steps

### Step 1: Parse User Request
- **Action**: Understand what user wants to do
  - Parse user input for action type:
    - **create**: Create new mechanism
    - **update**: Update existing mechanism
    - **delete**: Delete mechanism
    - **modify**: Modify mechanism (subset of update)
    - **rename**: Rename mechanism
    - **split**: Split mechanism into multiple
    - **merge**: Merge mechanisms
    - **component**: Plan or update components within a mechanism
  - Parse target mechanism name(s) or component name(s)
  - Extract change details from user input
  - If unclear: Ask for clarification
- **Verification**: Request is understood
- **On Success**: Proceed to Step 2
- **On Failure**: Ask for clarification

### Step 2: Load Current Plan State
- **Action**: Gather complete plan information
  - Read `plans/README.md` for mechanism index
  - Load target mechanism(s) documentation:
    - README.md (requirements, design, dependencies)
    - TASKS.md (current tasks)
    - CHANGELOG.md (history)
    - COMMENTS.md (notes, issues)
  - Load all other mechanisms' README.md files
  - Build dependency graph from all mechanisms
  - Build reference map (what references what)
  - Identify mechanism relationships
  - **Identify stub tasks**: Check TASKS.md for tasks marked with `(stub)` notation
  - **Check stub implementations**: If mechanism is implemented, verify which tasks are stubs vs real implementations
- **Verification**: Complete plan state loaded
- **On Success**: Proceed to Step 3
- **On Failure**: Report missing files or access issues

### Step 3: Discussion Phase
- **Action**: Discuss the proposed change
  - Present current state of target mechanism(s)
  - Clarify user's intent
  - Ask questions if needed:
    - Why this change?
    - What problem does it solve?
    - What are the goals?
  - Document discussion in COMMENTS.md
  - Ensure clear understanding before proceeding
- **Verification**: Discussion complete, intent clear
- **On Success**: Proceed to Step 4
- **On Failure**: Continue discussion until clear

### Step 4: Analyze Implications
- **Action**: Comprehensive impact analysis
  - **Dependency Analysis**:
    - Identify all mechanisms that depend on target
    - Identify all mechanisms target depends on
    - Check if change breaks dependencies
    - Check if change creates circular dependencies
    - Verify all referenced mechanisms exist
  - **Overlap Analysis**:
    - Check for overlapping responsibilities with other mechanisms
    - Identify potential conflicts
    - Check for duplicate functionality
    - Verify no mechanism boundaries violated
  - **Reference Analysis**:
    - Find all references to target mechanism
    - Check if references will break
    - Verify all referenced items exist
    - Check for broken links
  - **Consistency Analysis**:
    - Check naming conventions
    - Check documentation structure
    - Check task format consistency
    - Verify changelog format
  - **Impact Summary**:
    - List affected mechanisms
    - List required updates
    - Identify risks
    - Estimate effort
- **Verification**: Implications analyzed comprehensively
- **On Success**: Proceed to Step 5
- **On Failure**: Report analysis issues

### Step 5: Present Implications Report
- **Action**: Show user what will be affected
  - Format comprehensive implications report
  - Include:
    - **Change Summary**: What will change
    - **Dependencies**: What depends on this, what this depends on
    - **Affected Mechanisms**: List of mechanisms that need updates
    - **Overlaps**: Potential conflicts or overlaps
    - **References**: What references this mechanism
    - **Risks**: Potential problems
    - **Required Updates**: What else needs to change
  - Present report to user
  - Wait for user confirmation before proceeding
  - If user wants changes: Return to Step 3 (Discussion)
- **Verification**: User reviewed and approved implications
- **On Success**: Proceed to Step 6
- **On Failure**: Revise based on feedback

### Step 6: Create Change Plan
- **Action**: Plan the actual changes
  - Create detailed change plan:
    - Files to create/modify/delete
    - Specific changes to make
    - Order of changes (dependencies first)
    - Validation checkpoints
  - Plan updates to affected mechanisms
  - Plan updates to mechanism index
  - Plan updates to global documentation
  - Document change plan in COMMENTS.md
- **Verification**: Change plan is complete
- **On Success**: Proceed to Step 7
- **On Failure**: Report planning issues

### Step 7: Execute Changes
- **Action**: Make the planned changes
  - Execute changes in dependency order:
    1. Update dependencies first (if needed)
    2. Create/modify/delete mechanism files
    3. Update mechanism index in plans/README.md
    4. Update affected mechanisms' documentation
    5. Update global documentation if needed
  - For each change:
    - Make the change
    - Update CHANGELOG.md immediately
    - Note change in COMMENTS.md
  - Follow proper file structure
  - Maintain consistent formatting
- **Verification**: Changes executed
- **On Success**: Proceed to Step 8
- **On Failure**: Report execution issues, rollback if needed

### Step 8: Validate Plan Integrity
- **Action**: Comprehensive validation
  - **Dependency Validation**:
    - Verify all dependencies exist
    - Verify no circular dependencies
    - Verify dependency references are correct
    - Check dependency documentation is updated
  - **Reference Validation**:
    - Verify all references resolve correctly
    - Check for broken links
    - Verify referenced mechanisms exist
    - Verify referenced files exist
  - **Overlap Validation**:
    - Verify no duplicate mechanisms
    - Verify no overlapping responsibilities
    - Check mechanism boundaries are clear
  - **Consistency Validation**:
    - Verify naming conventions
    - Verify file structure consistency
    - Verify documentation format consistency
    - Check all mechanisms have required files
  - **Completeness Validation**:
    - Verify mechanism index is complete
    - Verify all mechanisms documented
    - Check no orphaned references
    - Verify all tasks are valid
  - **Stub Validation**:
    - Verify stub tasks are clearly marked with `(stub)` notation
    - Verify stub tasks have documentation explaining what's missing
    - Check that stub status is documented in COMMENTS.md or CHANGELOG.md
    - Verify stub dependencies are listed in README.md
- **Verification**: Validation passes
- **On Success**: Proceed to Step 9
- **On Failure**: Report validation failures, fix issues

### Step 9: Fix Validation Issues
- **Action**: Resolve any validation problems
  - If validation fails:
    - List all validation errors
    - Fix each error:
      - Update broken references
      - Fix missing dependencies
      - Resolve overlaps
      - Fix consistency issues
    - Re-run validation (Step 8)
    - Repeat until all issues resolved
  - Document fixes in CHANGELOG.md
- **Verification**: All validation issues fixed
- **On Success**: Proceed to Step 10
- **On Failure**: Report unfixable issues, escalate

### Step 10: Update Mechanism Index
- **Action**: Update global mechanism index
  - Update `plans/README.md` mechanism index:
    - Add new mechanisms
    - Remove deleted mechanisms
    - Update mechanism names/descriptions
    - Update mechanism links
  - Verify index is accurate
  - Verify all links work
- **Verification**: Index updated correctly
- **On Success**: Proceed to Step 11
- **On Failure**: Report index update issues

### Step 11: Final Documentation Update
- **Action**: Complete documentation
  - Update mechanism CHANGELOG.md with final entry
  - Update mechanism COMMENTS.md with summary
  - Update affected mechanisms' COMMENTS.md (if needed)
  - Verify all documentation is complete
- **Verification**: Documentation complete
- **On Success**: Proceed to Step 12
- **On Failure**: Report documentation issues

### Step 12: Report Completion
- **Action**: Present final report
  - Format completion report
  - Include:
    - Summary of changes made
    - Files created/modified/deleted
    - Mechanisms affected
    - Validation results
    - Next steps (if any)
  - Present report using standard format
- **Verification**: Report complete
- **On Success**: Command complete
- **On Failure**: Report completion issues

## Action-Specific Guidelines

### Creating New Mechanism
- **Check**: Name doesn't conflict with existing mechanisms
- **Check**: No overlapping responsibilities
- **Check**: Dependencies exist
- **Create**: README.md, TASKS.md, CHANGELOG.md, COMMENTS.md
- **Update**: Mechanism index in plans/README.md
- **Validate**: All references resolve
- **Stub Handling**: If creating tasks that will be stubs, mark them with `(stub)` notation and document missing dependencies

### Updating Mechanism
- **Check**: Changes don't break dependencies
- **Check**: Changes don't create overlaps
- **Check**: All references still valid
- **Update**: Relevant documentation files
- **Update**: Affected mechanisms' documentation
- **Validate**: Consistency maintained

### Deleting Mechanism
- **Check**: No other mechanisms depend on it
- **Check**: All references removed
- **Update**: Remove from mechanism index
- **Update**: Remove references from other mechanisms
- **Delete**: Mechanism folder and files
- **Validate**: No orphaned references

### Renaming Mechanism
- **Check**: New name doesn't conflict
- **Update**: Mechanism folder name
- **Update**: All references in other mechanisms
- **Update**: Mechanism index
- **Validate**: All references updated

### Splitting Mechanism
- **Check**: Split makes sense (clear boundaries)
- **Check**: No dependencies broken
- **Create**: New mechanism(s)
- **Update**: Original mechanism (reduce scope)
- **Update**: All references
- **Validate**: All parts complete

### Merging Mechanisms
- **Check**: Merge makes sense
- **Check**: No conflicts
- **Update**: Combined mechanism
- **Delete**: Original mechanisms
- **Update**: All references
- **Validate**: Combined mechanism complete

### Planning Components
- **Context**: Components are planned within their parent mechanism
- **Check**: Component belongs to correct mechanism
- **Check**: Component name doesn't conflict with existing components
- **Update**: Add component documentation to mechanism's README.md
- **Update**: Add component tasks to mechanism's TASKS.md
- **Update**: Document component in CHANGELOG.md
- **Validate**: Component references are correct
- **Component Structure**: 
  - Components are documented in parent mechanism's README.md under "Components" section
  - Component tasks in TASKS.md should be clearly identified (e.g., "Component: Card")
  - Components can be referenced across mechanisms but belong to one parent
  - Implementation location: `src/mechanisms/[mechanism]/components/[ComponentName].tsx`

## Validation Checklist

### Dependency Validation
- [ ] All dependencies listed in README.md exist
- [ ] No circular dependencies
- [ ] Dependency documentation is accurate
- [ ] Dependent mechanisms are aware of dependency

### Reference Validation
- [ ] All mechanism references resolve
- [ ] All file references exist
- [ ] All links work
- [ ] No broken references

### Overlap Validation
- [ ] No duplicate mechanisms
- [ ] No overlapping responsibilities
- [ ] Mechanism boundaries are clear
- [ ] Each mechanism has unique purpose

### Consistency Validation
- [ ] Naming conventions followed
- [ ] File structure consistent
- [ ] Documentation format consistent
- [ ] Task format consistent
- [ ] Changelog format consistent

### Completeness Validation
- [ ] Mechanism index complete
- [ ] All mechanisms documented
- [ ] All required files present
- [ ] No orphaned references
- [ ] All tasks valid

### Stub Validation
- [ ] Stub tasks clearly marked with `(stub)` notation
- [ ] Stub tasks documented with missing dependencies
- [ ] Stub status tracked in COMMENTS.md or CHANGELOG.md
- [ ] Stub dependencies listed in README.md

## Pre-requisites
- [ ] User request is clear
- [ ] Access to plans directory
- [ ] Can read all mechanism documentation
- [ ] Can modify mechanism files
- [ ] User approval obtained

## Verification Steps
1. Request parsed correctly
2. Current plan state loaded
3. Discussion complete
4. Implications analyzed
5. Implications approved
6. Change plan created
7. Changes executed
8. Plan integrity validated
9. Validation issues fixed
10. Mechanism index updated
11. Documentation complete
12. Completion reported

## Success Criteria
- [ ] Request understood
- [ ] Implications analyzed comprehensively
- [ ] User approved changes
- [ ] Changes executed correctly
- [ ] Plan integrity validated
- [ ] All validation checks pass
- [ ] Documentation updated
- [ ] Mechanism index accurate

## Status Reporting Format
```
[COMMAND] /planner [action] [target]
[STATUS] Discussion/Planning/Executing/Validating/Completed
[STEPS] X/12 completed
[VERIFICATION] Passed/Failed
[DETAILS]
  - Action: [create/update/delete/etc.]
  - Target: [mechanism name]
  - Current phase: [phase name]
  - Implications:
    - Dependencies: [count affected]
    - References: [count affected]
    - Overlaps: [count found]
  - Validation: [passed/failed with issues]
  - Changes made: [summary]
  - Next steps: [list]
```

## Implications Report Format

When presenting implications (Step 5), use this format:

```markdown
# Plan Change Implications: [Action] [Mechanism]

## Change Summary
[What will change]

## Dependencies

### Mechanisms That Depend On This
- [Mechanism 1]: [How it depends]
- [Mechanism 2]: [How it depends]

### Mechanisms This Depends On
- [Mechanism 1]: [How we depend]
- [Mechanism 2]: [How we depend]

### Dependency Impact
- [ ] Breaking changes: [list]
- [ ] New dependencies needed: [list]
- [ ] Dependencies to remove: [list]

## Affected Mechanisms
- [Mechanism 1]: [What needs updating]
- [Mechanism 2]: [What needs updating]

## Overlaps and Conflicts
- [Overlap 1]: [Description and resolution]
- [Conflict 1]: [Description and resolution]

## References
- [Reference 1]: [Location and impact]
- [Reference 2]: [Location and impact]

## Risks
- [Risk 1]: [Description] - Mitigation: [strategy]
- [Risk 2]: [Description] - Mitigation: [strategy]

## Required Updates
- [ ] Update mechanism index
- [ ] Update [Mechanism X] documentation
- [ ] Update [Mechanism Y] dependencies
- [ ] Fix [Reference Z]

## Approval Required
Please review these implications. Type "approve" to proceed, or provide feedback for revisions.
```

## Error Handling

### Unclear Request
- **Error**: Cannot parse user request
- **Handling**: Ask clarifying questions
- **Action**: Return to Step 1

### Mechanism Not Found
- **Error**: Target mechanism doesn't exist
- **Handling**: List available mechanisms
- **Action**: User specifies correct mechanism or creates new

### Dependency Missing
- **Error**: Referenced dependency doesn't exist
- **Handling**: Report missing dependency
- **Action**: Create dependency first or remove reference

### Circular Dependency
- **Error**: Change creates circular dependency
- **Handling**: Report circular dependency
- **Action**: Redesign to break cycle

### Overlap Detected
- **Error**: Change creates overlap with another mechanism
- **Handling**: Report overlap
- **Action**: Resolve overlap or merge mechanisms

### Validation Failure
- **Error**: Plan validation fails
- **Handling**: List all validation errors
- **Action**: Fix errors, re-validate

### Broken Reference
- **Error**: Reference points to non-existent item
- **Handling**: Report broken reference
- **Action**: Fix reference or remove

## Examples

### Example 1: Creating New Mechanism
```
User: /planner create new mechanism called "image-loader"
AI:
[COMMAND] /planner create image-loader
[STATUS] Discussion
[STEPS] 3/12 completed
[DETAILS]
  - Action: create
  - Target: image-loader
  - Current phase: Discussion

[DISCUSSION PHASE]
- Current state: No image-loader mechanism exists
- Proposed: Create new mechanism for loading and optimizing images

Questions:
1. What will image-loader handle? (loading, optimization, caching?)
2. How does it relate to existing mechanisms?
3. What dependencies does it need?

[ANALYZING IMPLICATIONS...]
- Checking for overlaps with existing mechanisms...
- Checking dependencies...
- Checking references...

# Plan Change Implications: Create image-loader

## Change Summary
Create new mechanism "image-loader" for handling image loading, optimization, and caching.

## Dependencies

### Mechanisms That Depend On This
- None (new mechanism)

### Mechanisms This Depends On
- database-manager: For caching images
- image-retry-strategies: For retry logic

### Dependency Impact
- [ ] Breaking changes: None
- [x] New dependencies needed: database-manager, image-retry-strategies
- [ ] Dependencies to remove: None

## Affected Mechanisms
- card-composer: May use image-loader (optional update)
- carousel-composer: May use image-loader (optional update)

## Overlaps and Conflicts
- No overlaps detected
- image-retry-strategies: Related but different scope (retry vs loading)

## References
- None (new mechanism)

## Risks
- Risk 1: May duplicate some image-retry-strategies functionality
  Mitigation: Clear boundary - image-loader handles loading, image-retry-strategies handles failures

## Required Updates
- [x] Create image-loader mechanism folder and files
- [x] Update mechanism index
- [ ] Update card-composer to reference image-loader (optional)

## Approval Required
Please review these implications. Type "approve" to proceed, or provide feedback for revisions.

User: approve

[EXECUTING CHANGES...]
- Creating image-loader folder...
- Creating README.md...
- Creating TASKS.md...
- Creating CHANGELOG.md...
- Creating COMMENTS.md...
- Updating mechanism index...

[VALIDATING PLAN INTEGRITY...]
- Dependency validation: ✓
- Reference validation: ✓
- Overlap validation: ✓
- Consistency validation: ✓
- Completeness validation: ✓

[COMMAND] /planner create image-loader
[STATUS] Completed
[STEPS] 12/12 completed
[VERIFICATION] Passed
[DETAILS]
  - Action: create
  - Target: image-loader
  - Changes made:
    - Created: plans/mechanisms/image-loader/ (4 files)
    - Updated: plans/README.md (added to index)
  - Validation: All checks passed
  - Next steps: Implement image-loader mechanism
```

### Example 2: Updating Mechanism
```
User: /planner update story-fetcher to add request deduplication
AI:
[COMMAND] /planner update story-fetcher
[STATUS] Discussion
[STEPS] 3/12 completed

[DISCUSSION PHASE]
- Current state: story-fetcher doesn't deduplicate requests
- Proposed: Add request deduplication to prevent duplicate API calls

[ANALYZING IMPLICATIONS...]

# Plan Change Implications: Update story-fetcher

## Change Summary
Add request deduplication feature to story-fetcher mechanism.

## Dependencies

### Mechanisms That Depend On This
- carousel-composer: Uses story-fetcher
- page-composer: Uses story-fetcher

### Mechanisms This Depends On
- query-builder: For building queries
- story-cache: For caching results

### Dependency Impact
- [ ] Breaking changes: None (additive change)
- [ ] New dependencies needed: None
- [ ] Dependencies to remove: None

## Affected Mechanisms
- carousel-composer: May benefit from deduplication (no changes needed)
- page-composer: May benefit from deduplication (no changes needed)

## Overlaps and Conflicts
- No overlaps detected

## References
- carousel-composer README.md: References story-fetcher
- page-composer README.md: References story-fetcher

## Risks
- Risk 1: Deduplication logic may be complex
  Mitigation: Keep it simple, document well

## Required Updates
- [x] Update story-fetcher README.md (add deduplication)
- [x] Update story-fetcher TASKS.md (add task)
- [x] Update story-fetcher CHANGELOG.md (log change)

## Approval Required
Please review these implications. Type "approve" to proceed.

User: approve

[EXECUTING CHANGES...]
- Updating story-fetcher README.md...
- Updating story-fetcher TASKS.md...
- Updating story-fetcher CHANGELOG.md...

[VALIDATING PLAN INTEGRITY...]
- All validations passed ✓

[COMMAND] /planner update story-fetcher
[STATUS] Completed
[STEPS] 12/12 completed
[VERIFICATION] Passed
```

## Stub Handling Guidelines

### When to Use Stubs
- When a task requires dependencies that aren't implemented yet
- When you want to establish the interface/structure but defer full implementation
- When implementing a placeholder allows other work to proceed

### Stub Notation Convention
- **In TASKS.md**: Mark completed stub tasks as `- [x] Task name (stub)`
- **In Code**: Add comments indicating it's a stub: `// Note: This is a stub implementation`
- **In COMMENTS.md**: Document what dependencies are missing and what the stub does
- **In CHANGELOG.md**: Note when stubs are created: `[ADDED] Task name (stub implementation)`

### Stub Detection
When reviewing plans or implementations:
1. Check TASKS.md for `(stub)` notation
2. Check code files for stub comments (`// stub`, `// TODO`, `// placeholder`)
3. Check COMMENTS.md for stub documentation
4. Verify stub dependencies are listed in README.md

### Transitioning from Stub to Real Implementation
When dependencies become available:
1. Use `/planner` to update the task: Remove `(stub)` notation
2. Use `/implement` to replace stub with real implementation
3. Update CHANGELOG.md: `[CHANGED] Task name - replaced stub with real implementation`
4. Update COMMENTS.md: Document what changed and why

## Component Planning Guidelines

### Components vs Mechanisms
- **Mechanisms**: Core system logic (data fetching, caching, composition logic)
- **Components**: React UI components that render user interfaces
- **Relationship**: Components are documented within their parent mechanism

### Component Planning Workflow
1. **Identify Parent Mechanism**: Determine which mechanism owns the component
2. **Document Component**: Add component to mechanism's README.md under "Components" section
3. **Plan Tasks**: Add component tasks to mechanism's TASKS.md with clear identification
4. **Track Changes**: Document component changes in mechanism's CHANGELOG.md
5. **Reference Across Mechanisms**: Components can be referenced but belong to one parent

### Component Documentation Format
When adding components to a mechanism's README.md:

```markdown
## Components

### [ComponentName]
- **Purpose**: [What the component does]
- **Props**: [Key props interface]
- **Dependencies**: [What it depends on]
- **Used By**: [Which mechanisms/components use it]
- **Location**: `src/mechanisms/[mechanism]/components/[ComponentName].tsx`
```

### Component Task Format
When adding component tasks to TASKS.md:

```markdown
## Phase X: [ComponentName] Component
- [ ] Component: [ComponentName] - [Task description]
- [ ] Component: [ComponentName] - [Another task]
```

Optional: prefix with `(T-<id>)` for changelog–task linkage and accurate completion dates (see plans/CHANGELOG_TASK_MILESTONE_PLAN.md).

### Component Examples
- **Card Components** → `card-composer` mechanism
- **Carousel Components** → `carousel-composer` mechanism
- **Page Components** → `page-manager` mechanism
- **Widget Components** → `site-widgets` mechanism

## Related Commands
- [/implement](implement.md) - Implement mechanism (uses plans created by /planner, includes stub detection)
- [/validate](validate.md) - Validate implementation against plan
- [/audit](audit.md) - Audit plan quality

