import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { runCli, runCliJson, PROJECT_ROOT } from '../lib/cli-runner.js';
import { assertResultSchema } from '../lib/schema-validator.js';

test('Autofix and dry-run suite', async (t) => {
  const fixturePath = path.resolve(PROJECT_ROOT, 'features/fixable/whitespace/trailing_spaces.feature');
  const blankLinesFixturePath = path.resolve(PROJECT_ROOT, 'features/fixable/blank-lines/extra_blank_lines.feature');
  const configPath = path.resolve(PROJECT_ROOT, 'config/whitespace.config.json');

  await t.test('--fix-dry-run reports fixable violations without modifying source file', () => {
    const originalContent = fs.readFileSync(fixturePath, 'utf8');

    const res = runCliJson([
      fixturePath,
      '--fix-dry-run',
      '-c', configPath
    ]);

    assert.equal(res.status, 1, 'Dry run should report violations and exit with code 1');
    assertResultSchema(res.json);
    assert.ok(res.json.summary.fixable > 0, 'Summary fixable count should be greater than 0');

    // Verify source file was NOT altered
    const contentAfterDryRun = fs.readFileSync(fixturePath, 'utf8');
    assert.equal(contentAfterDryRun, originalContent, 'Source file must remain unchanged during dry run');
  });

  await t.test('--fix corrects trailing whitespace without altering unrelated content', () => {
    // Create temporary copy of fixture in a temp dir to test real in-place --fix
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gherkin-test-fix-'));
    const tmpFile = path.join(tmpDir, 'test_trailing.feature');

    try {
      const originalContent = fs.readFileSync(fixturePath, 'utf8');
      fs.writeFileSync(tmpFile, originalContent, 'utf8');

      // Verify the file originally contains trailing spaces
      assert.ok(/[ \t]+$/m.test(originalContent), 'Original file must have trailing spaces');

      // Run with --fix
      const fixRes = runCli([
        tmpFile,
        '--fix',
        '-c', configPath
      ]);

      assert.equal(fixRes.status, 0, 'Cleaned file should exit with code 0 after autofix');

      const fixedContent = fs.readFileSync(tmpFile, 'utf8');
      // Assert no lines have trailing whitespace
      assert.ok(!/[ \t]+$/m.test(fixedContent), 'Fixed content must have no trailing whitespace');

      // Assert keywords and scenario texts are preserved accurately
      assert.ok(fixedContent.includes('Feature: Trailing Whitespace Cleanup Verification'));
      assert.ok(fixedContent.includes('Scenario: Formatting code and feature files'));
      assert.ok(fixedContent.includes('Then trailing whitespace is safely stripped'));

      // Re-running linter on the fixed file should return code 0 and zero errors
      const verifyRes = runCliJson([
        tmpFile,
        '-c', configPath
      ]);
      assert.equal(verifyRes.status, 0);
      assert.equal(verifyRes.json.summary.errors, 0);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  await t.test('--fix corrects multiple consecutive blank lines', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gherkin-test-blanks-'));
    const tmpFile = path.join(tmpDir, 'test_blank_lines.feature');

    try {
      const originalContent = fs.readFileSync(blankLinesFixturePath, 'utf8');
      fs.writeFileSync(tmpFile, originalContent, 'utf8');

      // Verify original content has 3 or more newlines consecutively
      assert.ok(/\n{3,}/.test(originalContent), 'Original file must have multiple consecutive blank lines');

      const fixRes = runCli([
        tmpFile,
        '--fix',
        '-c', configPath
      ]);

      assert.equal(fixRes.status, 0);

      const fixedContent = fs.readFileSync(tmpFile, 'utf8');
      // Must not contain 3 consecutive newlines
      assert.ok(!/\n{3,}/.test(fixedContent), 'Fixed content must not contain redundant consecutive blank lines');
      assert.ok(fixedContent.includes('Feature: Multiple Blank Lines Cleanup'));
      assert.ok(fixedContent.includes('Scenario: Removing excessive blank lines'));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
