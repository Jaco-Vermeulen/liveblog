# Meeting — client_web2 kickoff

**Date:** 2026-05-25  
**Type:** Project kickoff directive  
**Directive:** [../directives/client-web2-kickoff.md](../directives/client-web2-kickoff.md)

## Decision

Build **client_web2** as a greenfield React admin, mirroring the **maroela_web2** planning approach:

- Full `client_web2/plans/` with 15 mechanisms
- Parallel run on port 9001 during migration
- Maroela design tokens from legacy portal.css
- Strangler cutover when feature parity reached

## Affected mechanisms

All 15 mechanisms (see [../README.md](../README.md#mechanism-index)).

## Action items

1. Complete Phase 0 plans structure — **done**
2. Phase 1: auth-manager, liveblog-api, request-logger, navigation-manager
3. Phase 2: blog-list-manager

## Notes

Legacy reference: `client/app/scripts/liveblog-*`. Do not modify legacy client for web2 work.
