# Documentation Procedures — client_web2

Verification that commands and workflows document work in the correct locations. Adapted from maroela_web2.

## Standard documentation structure

Each mechanism folder contains **four required files**:

| File | Role |
|------|------|
| `README.md` | Overview, design, dependencies, Technical Specification, File Structure |
| `TASKS.md` | Task list; optional `(T-id)` for changelog linkage |
| `CHANGELOG.md` | Chronological log; rollback capability |
| `COMMENTS.md` | Session notes, issues, decisions |

README format: **[MECHANISM_README_STANDARD.md](MECHANISM_README_STANDARD.md)** — mandatory.

### File structure in READMEs

All `## File Structure` sections use ASCII box-drawing in a fenced code block:

```
client_web2/src/mechanisms/example/
├── index.ts
├── hooks/
│   └── useExample.ts
└── components/
    └── ExamplePanel.tsx
```

## Documentation requirements by command

| Command | Updates |
|---------|---------|
| `/planner` | Mechanism CHANGELOG, COMMENTS, README index; creates four files for new mechanisms |
| `/implement` | TASKS, CHANGELOG, COMMENTS, README (implementation notes) |
| `/test` | `plans/reports/tests/[mechanism]/[timestamp]/` |
| `/validate` | `plans/reports/validation-[target]-[date].md`, mechanism COMMENTS + CHANGELOG |
| `/troubleshoot` | CHANGELOG, COMMENTS, `plans/reports/troubleshooting/[problem]/` |
| `/fix` | CHANGELOG, COMMENTS |
| `/debug` | COMMENTS |
| `/analyze` | `plans/reports/analysis/` |
| `/audit` | `plans/reports/audits/` |

## CHANGELOG.md format

```markdown
## YYYY-MM-DD - Type

[ADDED] - New feature
[CHANGED] - Modification
[FIXED] - Bug fix
[REMOVED] - Deleted
[COMPLETED] - Phase/task done
[MILESTONE] - 50% / 75% / 100%
```

Reference tasks: `tasks: T-id1, T-id2` — see [CHANGELOG_TASK_MILESTONE_PLAN.md](CHANGELOG_TASK_MILESTONE_PLAN.md).

## TASKS.md format

```markdown
- [x] (T-auth-1) Implement LoginPage
- [ ] (T-auth-2) Session persistence
- [x] Stub task (stub) - placeholder only
```

## COMMENTS.md format

Session notes, known issues, design arguments, AI struggles, user feedback.

## Report locations

| Type | Path |
|------|------|
| Tests | `plans/reports/tests/[mechanism]/[timestamp]/` |
| Troubleshooting | `plans/reports/troubleshooting/[problem-title]/` |
| Analysis | `plans/reports/analysis/[timestamp]/` |
| Audits | `plans/reports/audits/[timestamp]/` |
| Validation | `plans/reports/validation-[target]-[date].md` |

## Global documentation

| Path | Role |
|------|------|
| `plans/README.md` | Mechanism index |
| `plans/commands/README.md` | Command registry |
| `plans/KNOWLEDGE_GRAPH.md` | Architecture graph |
| `plans/meetings/` | Cross-cutting decisions |
| `plans/directives/` | Project directives |
| `AGENT_INSTRUCTIONS.md` | Agent scope (parent folder) |

## Checklist for any change

- [ ] Mechanism CHANGELOG entry
- [ ] TASKS checkboxes if applicable
- [ ] COMMENTS if insights/issues
- [ ] README if design/deps/spec changed
- [ ] KNOWLEDGE_GRAPH if architecture changed

## Best practices

1. Always update CHANGELOG.md
2. Document root causes in COMMENTS.md, not just fixes
3. README is source of truth for Technical Specification
4. Use `/test` for all test creation (Level 3 = real API on :5000, UI on :9001)
5. Never edit mechanism plans without `/planner` workflow
