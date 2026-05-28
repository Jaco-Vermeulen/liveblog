# Mechanism and Subsystem README Standard — client_web2

**All mechanism and subsystem READMEs MUST follow this standard.** Canonical section order and required File Structure format.

## Canonical section order (index)

Use this order. Omit optional sections if not applicable; **do not reorder**.

| # | Section | Required | Notes |
|---|---------|----------|--------|
| — | **Title (H1)** + one-line description | Yes | End with: "For change history and file lists, see [CHANGELOG.md](CHANGELOG.md)." |
| 1 | **Overview** | Yes | Short summary |
| 2 | **Status** | Yes | e.g. "Not yet implemented", "Partially implemented" |
| 3 | **Purpose** | Yes | Bullet list of responsibilities |
| 4 | **Current Implementation** | Yes | **Legacy** (`client/`) and **Web2** (`client_web2/`) |
| 5 | **Liveblog server / API** | When applicable | REST resources, WS events — not WordPress |
| 6 | **Dependencies** | Yes | Mechanisms + external systems |
| 7 | **Dependents** | Recommended | Who consumes this mechanism |
| 8 | **Technical Specification** | Yes | Types, hooks, components, behaviour — definitive tense |
| 9 | **File Structure** | Yes | ASCII tree (see below) |
| 10 | **Design Decisions** | Yes | Rationale and constraints |
| 11 | **Implementation Approach** | Yes | Phases, migration from legacy |
| 12 | **Subsystems** | Optional | For large mechanisms (e.g. editor-manager) |
| 13 | **Components** | If UI | Purpose, props, location, styling (style-guide REQUIRED) |
| 14 | **Usage Examples** | Recommended | Code snippets |
| 15 | **Data Flow** | Optional | Diagram or steps |
| 16 | **Error Handling Strategy** | Recommended | How failures surface |
| 17 | **Related Mechanisms** | Recommended | Links |
| 18 | **Testing Requirements** | Recommended | Level 1/2/3 expectations |
| 19 | **Legacy reference** | Yes | Path in `client/app/scripts/` |
| 20 | **Tasks** | Yes | "See [TASKS.md](TASKS.md) for implementation tasks." |

**Rule:** File Structure (§9) comes **immediately after** Technical Specification. Usage Examples, Data Flow, and Error Handling come **after** Components.

## Liveblog-specific rules

| Rule | Detail |
|------|--------|
| **No raw fetch** | All HTTP via **liveblog-api** + **request-logger** |
| **No raw WebSocket** | All real-time via **websocket-manager** + logger |
| **Styling** | UI mechanisms list **style-guide** as REQUIRED |
| **Legacy parity** | Document legacy module path and routes |
| **No WordPress section** | Admin client uses Liveblog REST + WAMP only |
| **Routes** | Document React Router paths matching legacy Superdesk activities |

## File Structure section — required format

### Heading and intro

- **Heading:** exactly `## File Structure`
- **Mechanism:** `The mechanism is implemented by the following paths (under \`client_web2/src/\`):`
- **Subsystem:** `The subsystem is implemented by the following paths (under \`client_web2/src/\`):`
- If root is not `src/` (e.g. style-guide uses `src/index.css`), state correct root in intro.

### Tree: ASCII box-drawing (required)

| Character | Use |
|-----------|-----|
| `├` | Branch with siblings below |
| `└` | Last branch at level |
| `│` | Vertical continuation |
| `─` | Horizontal (part of ├ or └) |

Each line: `├` or `└`, then `── `, path, spaces, `# one-line role`.

### Example

````markdown
## File Structure

The mechanism is implemented by the following paths (under `client_web2/src/`):

```
mechanisms/auth-manager/
├── index.ts                      # Public exports
├── types.ts                      # AuthState, LiveblogUser
├── context/
│   └── AuthProvider.tsx          # Session provider
├── hooks/
│   └── useAuth.ts                # Auth hook
└── components/
    └── LoginPage.tsx             # Login UI (style-guide)
```
````

### What NOT to do

- No indentation-only trees
- No "(Planned)" in heading or tree
- No "planned" in role comments — write as source of truth

## Enforcement

- **/planner** and **/implement** MUST follow this standard
- Verify section order and File Structure on every README create/update
- Existing READMEs updated to this standard when touched (this pass: all 15 mechanisms)

## Checklist before marking README complete

- [ ] All required sections present in order
- [ ] Technical Specification has TypeScript interfaces
- [ ] File Structure uses ├ └ │ ─
- [ ] Legacy reference path documented
- [ ] Dependencies and dependents listed
- [ ] style-guide listed for UI mechanisms
- [ ] Testing Requirements section present
- [ ] Link to TASKS.md at end
