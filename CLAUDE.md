# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (backend + frontend concurrent)
npm run dev

# Build all (shared → backend → frontend, order matters)
npm run build

# Test (shared + backend)
npm run test

# Single package test with watch
npm run test:watch -w @wip/backend
npm run test:watch -w @wip/shared

# Lint
npm run lint
```

## Architecture

npm workspaces monorepo with 3 packages under `packages/`:

- **@wip/shared** — Domain types, game constants, word lists (Japanese themes), word-detector (katakana normalization), input-validator. Pure TypeScript, no external deps.
- **@wip/backend** — GameRoom entity (state machine: waiting→playing→finished), GraphQL resolver, repository pattern (MemoryRepository for dev, DynamoRepository for prod). Express dev-server on port 3001.
- **@wip/frontend** — React 19 SPA with Vite. Tailwind CSS 4. `useGameApi` hook manages all state + 1.5s polling. No state library. Vite proxies `/graphql` → localhost:3001 in dev.

Infrastructure: SST (ap-northeast-1) — DynamoDB (24h TTL), AppSync GraphQL (API_KEY auth), Lambda (nodejs22.x), S3+CloudFront.

### Layer Rules

- shared has zero dependencies on backend/frontend
- Backend domain logic (`src/game/`) has no infrastructure imports
- Repository interface in domain layer, implementations in `src/repository/`
- Domain functions return Result type (`{ ok: true } | { ok: false; error: string }`), never throw
- Frontend uses vanilla `fetch` for GraphQL (no Apollo/urql)

### Data Flow

```
Frontend action → GraphQL mutation → resolver → GameRoom method → repository.saveRoom()
Frontend polls GET_GAME_STATE every 1.5s for state updates
```

### GraphQL Schema

Defined in `schema.graphql` (root). Query: `getGameState`. Mutations: `createRoom`, `joinRoom`, `selectTheme`, `startGame`, `sendMessage`, `challenge`, `restartGame`. Subscription defined but currently unused (polling-based).

## Key Entry Points

- Game state machine: `packages/backend/src/game/GameRoom.ts`
- Word matching algorithm: `packages/shared/src/word-detector.ts`
- API resolver: `packages/backend/src/resolver.ts`
- Main game UI: `packages/frontend/src/pages/GamePage.tsx`
- State hook: `packages/frontend/src/hooks/useGameApi.ts`
- Types: `packages/shared/src/types.ts`
