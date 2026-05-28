# Changelog–Task–Milestone Plan — client_web2

Connects mechanism CHANGELOG entries to TASKS.md for accurate completion dates and milestones.

## Conventions

### 1. Optional task IDs in TASKS.md

```markdown
- [x] (T-blog-1) Implement BlogGrid component
- [ ] (T-blog-2) Create blog modal
```

Use kebab-case IDs unique within the mechanism.

### 2. Changelog references tasks

```markdown
## 2026-05-25 - Implementation

[ADDED] BlogGrid with card layout. tasks: T-blog-1
[COMPLETED] Phase 2 scaffold. tasks: T-blog-1, T-blog-2
```

Parsing: `tasks:\s*T-[^\s,]+(?:,\s*T-[^\s,]+)*` — section date applies to listed tasks.

### 3. Explicit milestones

```markdown
- [MILESTONE] 50%
- [MILESTONE] 75%
- [MILESTONE] 100%
```

Under a dated section; that date is the milestone date.

### 4. Backward compatibility

Entries without task refs still valid; add IDs going forward.

## Summary

| Item | Convention |
|------|------------|
| Task ID | `- [x] (T-<id>) Description` in TASKS.md |
| Changelog ref | `tasks: T-id1, T-id2` on changelog line |
| Milestone | `- [MILESTONE] 50%` under dated section |

Used by `/implement` and `/planner` when marking work complete.
