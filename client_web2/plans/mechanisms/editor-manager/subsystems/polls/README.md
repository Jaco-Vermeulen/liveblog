# Polls (editor subsystem)

Poll block in the post composer and vote-percentage helpers. For change history, see [../../CHANGELOG.md](../../CHANGELOG.md).

## Overview

Ports legacy `liveblog-edit/components/polls/*` for creating polls attached to posts via the Liveblog `polls` REST resource.

## Status

**Implemented (2026-05-26)** — `PollBlockEditor`, `pollCalculations`, save via **liveblog-api** `savePollForPost`.

## Purpose

- Compose poll question, answers, and duration (days/hours/minutes)
- Emit `PollBody` into Sir Trevor Poll block → `blockTransform` → `item_type: 'poll'`
- Preserve vote counts on poll update (legacy `posts.service.ts` behaviour)

## Dependencies

- **liveblog-api** — `endpoints/polls.ts`, `savePostWithItems` poll branch
- **style-guide** — form controls in composer

## File Structure

```
mechanisms/editor-manager/subsystems/polls/
├── index.ts
├── PollBlockEditor.tsx          # Composer UI
├── pollCalculations.ts          # Percentages, time-left (no moment.js)
└── pollCalculations.test.ts
```

## Data Flow

1. User fills `PollBlockEditor` → valid `PollBody` on block `data.pollBody`
2. Publish → `blocksToPostItems` → `{ item_type: 'poll', poll_body, id_to_update? }`
3. `savePostWithItems` → `savePollForPost` → POST/PATCH `/polls`
4. Post `groups[main].refs` includes `{ residRef, location: 'polls', type: 'poll' }`

## Legacy reference

- `client/app/scripts/liveblog-edit/components/polls/poll-component-create.tsx`
- `client/app/scripts/liveblog-edit/posts.service.ts` — `case 'poll'`

## Tasks

Parent: [../../TASKS.md](../../TASKS.md) — (T-edit-9)
