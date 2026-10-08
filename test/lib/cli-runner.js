import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const PROJECT_ROOT = path.resolve(__dirname, '../..');

export const CLI_ENTRY = path.resolve(PROJECT_ROOT, 'node_modules/gherkin-refine/dist/cli.js');

/**
 * Runs gherkin-refine CLI directly using current node process
 * @param {string[]} args
 * @param {import('node:child_process').SpawnSyncOptions} [options]
 */
export function runCli(args, options = {}) {
  const result = spawnSync(process.execPath, [CLI_ENTRY, ...args], {
    cwd: PROJECT_ROOT,
    encoding: 'utf8',
    ...options,
    env: {
      ...process.env,
      ...options.env
    }
  });

  return {
    status: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    error: result.error
  };
}

/**
 * Runs gherkin-refine CLI and parses JSON output
 * @param {string[]} args
 * @param {import('node:child_process').SpawnSyncOptions} [options]
 */
export function runCliJson(args, options = {}) {
  const fullArgs = args.includes('--format') ? args : [...args, '--format', 'json'];
  const res = runCli(fullArgs, options);
  let parsed = null;
  try {
    parsed = JSON.parse(res.stdout);
  } catch (err) {
    throw new Error(`Failed to parse CLI stdout as JSON: ${err.message}\nRaw stdout:\n${res.stdout}\nRaw stderr:\n${res.stderr}`);
  }
  return {
    ...res,
    json: parsed
  };
}
