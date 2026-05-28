# Command: /audit

## Trigger
The command is triggered when user says: `/audit`, `audit`, `/audit [mode]`, `/audit [target] [mode]`, or variations like "audit the system" or "run comprehensive audit"

## Purpose
Perform comprehensive audits of code, architecture, performance, or system health. Supports three audit modes: quick, comprehensive, and extreme, each with different depth and scope.

## Context
Use this command when:
- User wants to audit code quality
- User wants to audit architecture
- User wants to audit performance
- User wants to audit system health
- User wants to identify technical debt
- User wants to verify compliance with standards

## Audit Modes

### Quick Audit
- **Scope**: Surface-level checks
- **Duration**: Fast (< 1 minute)
- **Depth**: Basic checks only
- **Use when**: Need quick overview, initial assessment

### Comprehensive Audit
- **Scope**: Detailed analysis
- **Duration**: Moderate (5-15 minutes)
- **Depth**: Thorough examination
- **Use when**: Regular audits, before major changes

### Extreme Audit
- **Scope**: Deep analysis of everything
- **Duration**: Long (15-60+ minutes)
- **Depth**: Exhaustive examination
- **Use when**: Major refactoring, critical issues, pre-release

## Execution Steps

### Step 1: Identify Audit Target and Mode
- **Action**: Determine what to audit and how deeply
  - Parse user input for target (e.g., "story-fetcher", "entire system")
  - Parse user input for mode ("quick", "comprehensive", "extreme")
  - If mode not specified: Default to "comprehensive"
  - If target not specified: Audit entire system
  - Validate mode is valid
- **Verification**: Target and mode are identified
- **On Success**: Proceed to Step 2
- **On Failure**: Report error and suggest valid modes/targets

### Step 2: Prepare Audit Environment
- **Action**: Set up for audit
  - Load audit criteria based on mode
  - Prepare audit tools
  - Set audit scope based on mode
  - Check mechanism README.md for audit guidelines
  - Enable necessary logging/monitoring
- **Verification**: Environment is prepared
- **On Success**: Proceed to Step 3
- **On Failure**: Report preparation issues

### Step 3: Execute Audit Checks
- **Action**: Run audit checks based on mode

#### Quick Audit Checks:
- Code structure basics
- Obvious errors/warnings
- Basic performance metrics
- Simple dependency checks
- Quick security scan

#### Comprehensive Audit Checks:
- Code quality (ESLint, TypeScript)
- Architecture compliance
- Performance analysis
- Dependency audit
- Security vulnerabilities
- Test coverage
- Documentation completeness
- Design pattern compliance
- Error handling coverage

#### Extreme Audit Checks:
- Everything from comprehensive, plus:
- Deep code analysis (complexity, maintainability)
- Full dependency tree analysis
- Complete security audit
- Performance profiling
- Memory leak detection
- Full test suite execution
- Documentation audit
- Architecture review
- Design pattern analysis
- Technical debt assessment
- Compliance verification
- Best practices review

- **Verification**: Audit checks execute
- **On Success**: Proceed to Step 4
- **On Failure**: Report audit execution errors

### Step 4: Collect Audit Results
- **Action**: Gather all audit findings
  - Compile results from all checks
  - Categorize findings (critical, high, medium, low)
  - Prioritize issues
  - Calculate scores/metrics
  - Identify patterns
  - Check mechanism COMMENTS.md for context
- **Verification**: Results are collected
- **On Success**: Proceed to Step 5
- **On Failure**: Report collection issues

### Step 5: Generate Audit Report
- **Action**: Create comprehensive audit report
  - Format report based on mode
  - Include executive summary
  - Include detailed findings
  - Include recommendations
  - Include scores/metrics
  - Include prioritized action items
  - Save report to file (if extreme mode)
- **Verification**: Report is generated
- **On Success**: Proceed to Step 6
- **On Failure**: Report generation issues

### Step 6: Present Audit Results
- **Action**: Display audit findings
  - Format results using standard format
  - Highlight critical issues
  - Show scores/metrics
  - Provide recommendations
  - Update mechanism COMMENTS.md with findings
  - Create audit entry in CHANGELOG.md (if extreme mode)
- **Verification**: Results are presented
- **On Success**: Command complete
- **On Failure**: Report presentation issues

## Pre-requisites
- [ ] Target exists (if specified)
- [ ] Audit tools available
- [ ] Sufficient permissions
- [ ] Time available for audit (varies by mode)

## Verification Steps
1. Target and mode identified
2. Environment prepared
3. Audit checks executed
4. Results collected
5. Report generated
6. Results presented

## Success Criteria
- [ ] Target and mode identified
- [ ] Environment prepared
- [ ] Audit checks executed
- [ ] Results collected
- [ ] Report generated
- [ ] Results presented

## Status Reporting Format
```
[COMMAND] /audit [target] [mode]
[STATUS] Success/Failure/In Progress
[STEPS] X/6 completed
[VERIFICATION] Passed/Failed
[DETAILS]
  - Target: [target name]
  - Mode: [quick/comprehensive/extreme]
  - Duration: [time]
  - Checks performed: [count]
  - Issues found: [count]
    - Critical: [count]
    - High: [count]
    - Medium: [count]
    - Low: [count]
  - Scores:
    - Code Quality: [score]
    - Performance: [score]
    - Security: [score]
    - Maintainability: [score]
  - Top issues: [list]
  - Recommendations: [list]
  - Report: [location if saved]
```

## Error Handling

### Invalid Mode
- **Error**: Audit mode is invalid
- **Handling**: List valid modes (quick, comprehensive, extreme)
- **Action**: Use valid mode

### Target Not Found
- **Error**: Audit target doesn't exist
- **Handling**: List available targets
- **Action**: Specify correct target

### Audit Tool Failure
- **Error**: Audit tool fails to execute
- **Handling**: Report tool failure
- **Action**: Check tool installation/configuration

### Timeout (Extreme Mode)
- **Error**: Audit takes too long
- **Handling**: Report partial results
- **Action**: Consider using comprehensive mode or breaking into smaller audits

## Examples

### Example 1: Quick Audit
```
User: /audit quick
AI:
[COMMAND] /audit entire system quick
[STATUS] Success
[STEPS] 6/6 completed
[VERIFICATION] Passed
[DETAILS]
  - Target: entire system
  - Mode: quick
  - Duration: 45s
  - Checks performed: 8
  - Issues found: 5
    - Critical: 0
    - High: 1
    - Medium: 2
    - Low: 2
  - Scores:
    - Code Quality: 7/10
    - Performance: 6/10
    - Security: 8/10
    - Maintainability: 7/10
  - Top issues:
    1. High: carousel-composer has high complexity (952 lines)
    2. Medium: Missing tests for 3 mechanisms
    3. Medium: Documentation incomplete for 2 mechanisms
  - Recommendations:
    1. Refactor carousel-composer (high priority)
    2. Add missing tests
    3. Complete documentation
```

### Example 2: Comprehensive Audit
```
User: /audit comprehensive story-fetcher
AI:
[COMMAND] /audit story-fetcher comprehensive
[STATUS] Success
[STEPS] 6/6 completed
[VERIFICATION] Passed
[DETAILS]
  - Target: story-fetcher
  - Mode: comprehensive
  - Duration: 8m 32s
  - Checks performed: 25
  - Issues found: 12
    - Critical: 0
    - High: 2
    - Medium: 5
    - Low: 5
  - Scores:
    - Code Quality: 8/10
    - Performance: 7/10
    - Security: 9/10
    - Maintainability: 8/10
    - Test Coverage: 85%
  - Top issues:
    1. High: Error handling incomplete for network failures
    2. High: Missing retry logic for failed requests
    3. Medium: TypeScript types incomplete (6% any types)
    4. Medium: Performance: No request deduplication
    5. Medium: Documentation missing for 2 functions
  - Recommendations:
    1. Add comprehensive error handling
    2. Implement retry mechanism
    3. Complete TypeScript types
    4. Add request deduplication
    5. Complete documentation
  - Detailed report: See mechanism COMMENTS.md
```

### Example 3: Extreme Audit
```
User: /audit extreme
AI:
[COMMAND] /audit entire system extreme
[STATUS] Success
[STEPS] 6/6 completed
[VERIFICATION] Passed
[DETAILS]
  - Target: entire system
  - Mode: extreme
  - Duration: 42m 15s
  - Checks performed: 87
  - Issues found: 34
    - Critical: 2
    - High: 8
    - Medium: 12
    - Low: 12
  - Scores:
    - Code Quality: 7.2/10
    - Performance: 6.8/10
    - Security: 8.5/10
    - Maintainability: 7.0/10
    - Test Coverage: 78%
    - Documentation: 82%
    - Architecture Compliance: 7.5/10
  - Top issues:
    1. Critical: Memory leak in carousel-composer (card-tracker)
    2. Critical: Security: API keys exposed in client code
    3. High: Technical debt: 3 mechanisms exceed complexity thresholds
    4. High: Performance: Bundle size exceeds target (2.3MB vs 1.5MB)
    5. High: Missing error boundaries in 5 components
  - Recommendations:
    1. Fix memory leak immediately (critical)
    2. Move API keys to environment variables (critical)
    3. Refactor complex mechanisms (high priority)
    4. Code-split large components (high priority)
    5. Add error boundaries (high priority)
  - Full report saved to: client_web2/plans/audit-reports/audit-[timestamp].md
  - Action items: 34 items created in mechanism TASKS.md files
```

## Audit Checklist by Mode

### Quick Audit Checklist
- [ ] Code compiles without errors
- [ ] No critical linter errors
- [ ] Basic tests pass
- [ ] No obvious security issues
- [ ] Performance metrics within acceptable range
- [ ] Dependencies up-to-date (major versions)
- [ ] Basic documentation present

### Comprehensive Audit Checklist
- [ ] All Quick Audit items
- [ ] Code quality metrics (complexity, maintainability)
- [ ] Full linter/TypeScript check
- [ ] Test coverage analysis
- [ ] Security vulnerability scan
- [ ] Performance profiling
- [ ] Dependency audit (all versions)
- [ ] Documentation completeness
- [ ] Architecture compliance
- [ ] Error handling coverage
- [ ] Design pattern compliance
- [ ] Best practices adherence

### Extreme Audit Checklist
- [ ] All Comprehensive Audit items
- [ ] Deep code analysis (every file)
- [ ] Complete dependency tree analysis
- [ ] Full security audit (penetration testing)
- [ ] Performance profiling (all components)
- [ ] Memory leak detection
- [ ] Complete test suite execution
- [ ] Documentation audit (every function)
- [ ] Architecture review (full system)
- [ ] Design pattern analysis
- [ ] Technical debt assessment (quantified)
- [ ] Compliance verification (all standards)
- [ ] Best practices review (comprehensive)
- [ ] Code review (all recent changes)
- [ ] Integration testing
- [ ] Load testing
- [ ] Accessibility audit

## Related Commands
- [/debug](debug.md) - Debug specific issues
- [/analyze](analyze.md) - Analyze specific aspects
- [/validate](validate.md) - Validate against requirements
- [/check](check.md) - Quick health check


