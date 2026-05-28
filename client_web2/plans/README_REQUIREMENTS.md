# README Requirements — client_web2

Quick reference for mechanism README completeness. Full rules: **[MECHANISM_README_STANDARD.md](MECHANISM_README_STANDARD.md)**.

## Mandatory sections (in order)

1. **H1 title** + one-liner + CHANGELOG link
2. **Overview**
3. **Status**
4. **Purpose** (bullets)
5. **Current Implementation** (Legacy + Web2)
6. **Liveblog server / API** (if mechanism calls API or WS)
7. **Dependencies**
8. **Dependents**
9. **Technical Specification** (TypeScript types, hooks, services — no "planned" wording)
10. **File Structure** (ASCII tree with ├ └ │ ─)
11. **Design Decisions**
12. **Implementation Approach**
13. **Components** (if UI — each lists style-guide REQUIRED)
14. **Usage Examples** (recommended)
15. **Data Flow** (optional)
16. **Error Handling Strategy** (recommended)
17. **Related Mechanisms**
18. **Testing Requirements**
19. **Legacy reference** (path + routes)
20. **Tasks** → link TASKS.md

## Technical Specification minimum content

Each mechanism README MUST include:

| Element | Required for |
|---------|--------------|
| TypeScript interfaces | All mechanisms |
| React hooks / context API | UI and state mechanisms |
| REST resource names | API-consuming mechanisms |
| WebSocket event names | Real-time mechanisms |
| React Router paths | Feature mechanisms with routes |
| Privilege / feature flags | Gated features |

## File Structure minimum content

- Root intro sentence with correct path (`client_web2/src/` or `client_web2/`)
- Every file that the mechanism owns
- One-line `# role` per leaf file
- Subsystems as nested directories when applicable

## UI mechanisms additional rules

- List **style-guide** under Dependencies as **REQUIRED**
- **Components** section: Purpose, key props, Location, Styling note
- Maroela tokens only — no ad-hoc colours

## Foundation mechanisms

| Mechanism | Special requirement |
|-----------|---------------------|
| style-guide | Design token table; list all dependents |
| request-logger | Log entry schema; ring buffer rules |
| liveblog-api | No fetch outside this module |
| websocket-manager | Event catalog from legacy Superdesk |
| auth-manager | Session storage keys matching legacy |

## Verification

Run mental checklist from MECHANISM_README_STANDARD before `/implement`. Use `/validate [mechanism]` after implementation.
