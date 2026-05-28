# Command: /validate

## Trigger
The command is triggered when user says: `/validate`, `validate`, `/validate [target]`, or variations like "validate the implementation"

## Purpose
Validate implementation against requirements. This command loads requirements, checks implementation, compares against spec, reports discrepancies, and suggests fixes.

## Context
Use this command when:
- User wants to verify implementation matches requirements
- User wants to check compliance with specifications
- User wants to validate before deployment
- User wants to ensure completeness
- User wants to check against design documents

## Execution Steps

### Step 1: Load Requirements
- **Action**: Gather requirement specifications
  - Load mechanism README.md for requirements
  - Load mechanism TASKS.md for completion criteria
  - Load design documents if available
  - Load API specifications if applicable
  - Check for requirement changes in CHANGELOG.md
  - Identify validation criteria
- **Verification**: Requirements are loaded
- **On Success**: Proceed to Step 2
- **On Failure**: Report missing requirements

### Step 2: Check Implementation
- **Action**: Examine actual implementation
  - Review code files
  - Check if required functions/components exist
  - Verify interfaces match specifications
  - Check if tests exist and pass
  - Verify configuration matches requirements
  - Check mechanism implementation files
- **Verification**: Implementation is examined
- **On Success**: Proceed to Step 3
- **On Failure**: Report examination issues

### Step 3: Compare Against Spec
- **Action**: Compare implementation with requirements
  - Match features to requirements
  - Check if all required features are implemented
  - Verify feature behavior matches spec
  - Check if interfaces match exactly
  - Verify performance meets requirements
  - Check if edge cases are handled
- **Verification**: Comparison is complete
- **On Success**: Proceed to Step 4
- **On Failure**: Report comparison issues

### Step 4: Report Discrepancies
- **Action**: Document differences
  - List missing features
  - List incorrect implementations
  - List deviations from spec
  - List performance issues
  - Prioritize discrepancies by severity
  - Include specific file/line references
- **Verification**: Discrepancies are documented
- **On Success**: Proceed to Step 5
- **On Failure**: Report documentation issues

### Step 5: Suggest Fixes
- **Action**: Provide remediation guidance
  - Suggest how to implement missing features
  - Suggest how to fix incorrect implementations
  - Suggest how to meet performance requirements
  - Link to relevant documentation
  - Check mechanism COMMENTS.md for known issues
  - Update mechanism COMMENTS.md if new discrepancy found
- **Verification**: Fixes are suggested
- **On Success**: Command complete
- **On Failure**: Report suggestion issues

## Documentation (per DOCUMENTATION_PROCEDURES.md)

After running validation:
1. **Create report**: `plans/reports/validation-[target]-[date].md` with full status, details, discrepancies, and recommendations.
2. **Update mechanism COMMENTS.md**: Add section "Validation - [date]" with status, findings, and report path.
3. **Update mechanism CHANGELOG.md**: Add entry for validation documentation (e.g. `[ADDED] Validation report: /validate [target] ([status])`).

## Pre-requisites
- [ ] Requirements documented (README.md, TASKS.md)
- [ ] Implementation exists
- [ ] Access to implementation files
- [ ] Access to requirement documents

## Verification Steps
1. Requirements loaded successfully
2. Implementation examined thoroughly
3. Comparison performed accurately
4. Discrepancies documented clearly
5. Fixes suggested appropriately

## Success Criteria
- [ ] Requirements loaded
- [ ] Implementation checked
- [ ] Comparison completed
- [ ] Discrepancies reported
- [ ] Fixes suggested

## Status Reporting Format
```
[COMMAND] /validate [target]
[STATUS] Valid/Invalid/Partial
[STEPS] X/5 completed
[VERIFICATION] Passed/Failed
[DETAILS]
  - Target: [target name]
  - Validation status: [Valid/Invalid/Partial]
  - Requirements checked: [count]
  - Passed: [count]
  - Failed: [count]
  - Missing: [count]
  - Discrepancies: [list]
  - Recommendations: [list]
```

## Error Handling

### Requirements Not Found
- **Error**: Cannot find requirement documents
- **Handling**: Check for README.md, TASKS.md
- **Action**: Create requirement documents or specify location

### Implementation Not Found
- **Error**: Implementation files don't exist
- **Handling**: Check for implementation files
- **Action**: Create implementation or specify location

### Comparison Failure
- **Error**: Cannot compare implementation with requirements
- **Handling**: Report comparison issues
- **Action**: Check requirement format, verify implementation structure

## Examples

### Example 1: Valid Implementation
```
User: /validate story-fetcher
AI:
[COMMAND] /validate story-fetcher
[STATUS] Valid
[STEPS] 5/5 completed
[VERIFICATION] Passed
[DETAILS]
  - Target: story-fetcher
  - Validation status: ✅ Valid
  - Requirements checked: 12
  - Passed: 12
  - Failed: 0
  - Missing: 0
  - Discrepancies: None
  - Recommendations: Implementation matches all requirements
```

### Example 2: Invalid Implementation
```
User: /validate card-composer
AI:
[COMMAND] /validate card-composer
[STATUS] Invalid
[STEPS] 5/5 completed
[VERIFICATION] Failed
[DETAILS]
  - Target: card-composer
  - Validation status: ❌ Invalid
  - Requirements checked: 15
  - Passed: 10
  - Failed: 3
  - Missing: 2
  - Discrepancies:
    1. Missing: Responsive layout for mobile devices (required)
    2. Missing: Dark mode support (required)
    3. Failed: Card skeleton loading doesn't match spec (incorrect animation)
    4. Failed: Image lazy loading not implemented (required)
    5. Failed: Card variants don't match specified variants
  - Recommendations:
    1. Implement responsive layout using breakpoints
    2. Add dark mode classes and theme support
    3. Fix skeleton animation to match spec
    4. Implement IntersectionObserver for lazy loading
    5. Review card variant specifications and update implementation
```

### Example 3: Partial Validation
```
User: /validate carousel-composer
AI:
[COMMAND] /validate carousel-composer
[STATUS] Partial
[STEPS] 5/5 completed
[VERIFICATION] Passed (with warnings)
[DETAILS]
  - Target: carousel-composer
  - Validation status: ⚠️ Partial
  - Requirements checked: 20
  - Passed: 17
  - Failed: 2
  - Missing: 1
  - Discrepancies:
    1. Missing: Vertical pagination controls (optional but recommended)
    2. Failed: Ad spacing doesn't match spec (should be configurable per carousel)
    3. Failed: Performance optimization not meeting target (target: <100ms render, actual: 145ms)
  - Recommendations:
    1. Implement vertical pagination controls for better UX
    2. Make ad spacing configurable per carousel instance
    3. Optimize rendering performance (consider virtual scrolling)
```

## Related Commands
- [/test](test.md) - Run tests as part of validation
- [/analyze](analyze.md) - Analyze implementation
- [/fix](fix.md) - Fix validation failures
- [/build](build.md) - Build before validation

