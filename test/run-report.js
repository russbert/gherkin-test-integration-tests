import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const resultsDir = path.join(projectRoot, 'test-results');
fs.mkdirSync(resultsDir, { recursive: true });

const junitXmlPath = path.join(resultsDir, 'junit.xml');

const args = [
  '--test',
  '--test-reporter=spec',
  '--test-reporter=junit',
  '--test-reporter-destination=stdout',
  `--test-reporter-destination=${junitXmlPath}`,
  'test/specs/*.test.js'
];

const res = spawnSync(process.execPath, args, {
  cwd: projectRoot,
  stdio: 'inherit'
});

process.exit(res.status ?? 0);
