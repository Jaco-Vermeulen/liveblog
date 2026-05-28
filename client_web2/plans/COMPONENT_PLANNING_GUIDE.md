# Component Planning Guide — client_web2

How React UI components fit into mechanism planning. Adapted from maroela_web2.

## Components vs mechanisms

**Mechanisms** — business logic, data flow, API integration (`src/mechanisms/`).

**Components** — React UI; render data and handle interaction.

| Mechanism | Example components |
|-----------|-------------------|
| style-guide | `LbButton`, `LbCard`, `LbInput` |
| auth-manager | `LoginPage` |
| navigation-manager | `AppShell`, `SideNav` |
| blog-list-manager | `BlogGrid`, `CreateBlogModal` |
| editor-manager | `Timeline`, `PostComposer`, `PostCard` |

## Ownership rules

1. Each component belongs to **one parent mechanism**
2. Shared primitives live in **style-guide** (`src/components/ui/Lb*.tsx`)
3. Feature components live under `src/mechanisms/[mechanism]/components/`
4. Cross-mechanism **use** is allowed; **ownership** is not shared

## Documentation format (README.md)

```markdown
## Components

### ComponentName
- **Purpose**: What it does
- **Props**: Key interface
- **Dependencies**: Hooks/services used
- **Used By**: Other mechanisms or routes
- **Location**: `src/mechanisms/[mechanism]/components/ComponentName.tsx`
- **Styling**: style-guide REQUIRED — tokens only
```

## TASKS.md format

```markdown
## Phase 2 — Blog grid
- [ ] (T-blog-3) Component: BlogGrid — card layout with Maroela tokens
- [ ] (T-blog-4) Component: CreateBlogModal — form + theme picker
```

Reference tasks in CHANGELOG: `tasks: T-blog-3` — see [CHANGELOG_TASK_MILESTONE_PLAN.md](CHANGELOG_TASK_MILESTONE_PLAN.md).

## File layout

```
client_web2/src/
├── components/ui/           # style-guide owned (Lb*)
└── mechanisms/
    └── blog-list-manager/
        ├── components/
        │   ├── BlogGrid.tsx
        │   └── CreateBlogModal.tsx
        └── hooks/
            └── useBlogList.ts
```

## App-level components (not mechanism-owned)

| File | Role |
|------|------|
| `App.tsx` | Router root |
| `main.tsx` | React bootstrap |
| `app/pages/SetupPage.tsx` | Phase 0 placeholder (remove when shell ships) |

Document in code; not assigned to a feature mechanism.

## Planning workflow

1. Add component to mechanism README **Components** section (`/planner`)
2. Add tasks to mechanism TASKS.md with `(T-id)` and `Component:` prefix
3. Implement via `/implement [mechanism]`
4. Test via `/test [mechanism]` Level 3 on port **9001**
