#!/usr/bin/env node
/**
 * Launch readiness: build, unit tests, API smoke (requires Docker API on :5000).
 * E2E: run separately with `npm run test:e2e` (starts dev server on :9001).
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function run(cmd, args, label) {
  console.log(`\n[launch-verify] ${label}`);
  const r = spawnSync(cmd, args, { cwd: root, stdio: 'inherit', shell: true });
  if (r.status !== 0) {
    console.error(`[launch-verify] FAILED: ${label}`);
    process.exit(r.status ?? 1);
  }
}

console.log('[launch-verify] client_web2 launch checks');

run('npm', ['run', 'build'], 'TypeScript + Vite build');
run('npm', ['run', 'test'], 'Vitest unit tests');

const smokes = [
  'smoke-auth-no-password.mjs',
  'smoke-blogs.mjs',
  'smoke-editor.mjs',
  'smoke-phase5.mjs',
  'smoke-websocket.mjs',
];

let apiOk = true;
for (const script of smokes) {
  console.log(`\n[launch-verify] API smoke: ${script}`);
  const r = spawnSync('node', [`scripts/${script}`], { cwd: root, stdio: 'inherit', shell: true });
  if (r.status !== 0) {
    apiOk = false;
    console.warn(`[launch-verify] WARN: ${script} failed (is Docker API on :5000?)`);
  }
}
if (!apiOk) {
  console.warn('[launch-verify] Some API smokes failed — start stack before production cutover.');
}

console.log(`
[launch-verify] Core checks passed.

Next for production cutover (Phase 7):
  1. npm run build  → serve dist/ on admin port (replace legacy :9000)
  2. npm run test:e2e  (Playwright against :9001 + API :5000)
  3. Update deploy UI_PORT / nginx root to client_web2/dist

Syndication / marketplace deep parity: post-launch expansion.
`);
