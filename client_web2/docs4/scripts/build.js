/**
 * Build docs4 as a static, offline-ready package for distribution (no live server).
 * Usage: node scripts/build.js [--public]
 *   --public  only include content marked for "other users"
 *
 * Steps:
 *   1. Clean docs4/build
 *   2. Run export with --build (outputs to build/, system fonts; Data Flow stays ASCII, no Mermaid)
 *   3. Zip build contents to docs4/liveblog-docs4.zip (unzip → index.html at root)
 *
 * Deliverable: client_web2/docs4/liveblog-docs4.zip — unzip and open index.html. Fully offline.
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS4_ROOT = path.resolve(__dirname, '..');
const BUILD_DIR = path.join(DOCS4_ROOT, 'build');
const ZIP_PATH = path.join(DOCS4_ROOT, 'liveblog-docs4.zip');

function rmDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.rmSync(dir, { recursive: true, force: true });
}

function runExport() {
  return new Promise((resolve, reject) => {
    const exportScript = path.join(__dirname, 'export.js');
    const args = ['--build'];
    if (process.argv.includes('--public')) args.push('--public');
    const child = spawn(process.execPath, [exportScript, ...args], {
      cwd: DOCS4_ROOT,
      stdio: 'inherit',
    });
    child.on('close', code => (code === 0 ? resolve() : reject(new Error('Export exited with ' + code))));
    child.on('error', reject);
  });
}

function zipWithPowerShell() {
  // Zip contents of build/ so unzip gives index.html, assets/, mechanisms/, ... at root.
  const safePath = (p) => String(p).replace(/'/g, "''");
  const buildContents = path.join(BUILD_DIR, '*');
  const psCmd = 'Compress-Archive -Path \'' + safePath(buildContents) + '\' -DestinationPath \'' + safePath(ZIP_PATH) + '\' -Force';
  return new Promise((resolve, reject) => {
    const ps = spawn('powershell', ['-NoProfile', '-Command', psCmd], {
      stdio: 'inherit',
      shell: false,
    });
    ps.on('close', code => (code === 0 ? resolve() : reject(new Error('PowerShell zip exited with ' + code))));
    ps.on('error', reject);
  });
}

function zipWithZipCommand() {
  return new Promise((resolve, reject) => {
    const child = spawn('zip', ['-r', ZIP_PATH, '.'], { cwd: BUILD_DIR, stdio: 'inherit' });
    child.on('close', code => (code === 0 ? resolve() : reject(new Error('zip exited with ' + code))));
    child.on('error', reject);
  });
}

async function main() {
  console.log('Docs4 static build (distribution package, not live)...');
  console.log('Build dir:', BUILD_DIR);
  console.log('Zip:', ZIP_PATH);

  rmDir(BUILD_DIR);

  console.log('Step 1: Building static HTML...');
  await runExport();

  if (!fs.existsSync(BUILD_DIR)) {
    console.error('Build directory not found:', BUILD_DIR);
    process.exit(1);
  }

  if (fs.existsSync(ZIP_PATH)) fs.unlinkSync(ZIP_PATH);
  console.log('Step 2: Creating zip package...');
  const isWin = process.platform === 'win32';
  try {
    if (isWin) {
      await zipWithPowerShell();
    } else {
      await zipWithZipCommand();
    }
  } catch (e) {
    if (!isWin) {
      console.warn('zip failed. Install "zip" or zip the docs4/build folder manually.');
    }
    throw e;
  }

  console.log('Done. Distribution package: ' + ZIP_PATH);
  console.log('Unzip and open index.html in a browser. Works fully offline.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
