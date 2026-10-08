import test from 'node:test';
import assert from 'node:assert/strict';
import { runCli, runCliJson } from '../lib/cli-runner.js';
import { assertResultSchema, assertSarifSchema } from '../lib/schema-validator.js';

test('CLI exit codes and output formats suite', async (t) => {
  await t.test('exit code 0 for completely valid feature files', () => {
    const res = runCli(['features/valid/core/subscription_billing.feature']);
    assert.equal(res.status, 0);
  });

  await t.test('exit code 1 when linting detects rule errors', () => {
    const res = runCli(['features/invalid/tags/duplicate_tags.feature']);
    assert.equal(res.status, 1);
  });

  await t.test('exit code 2 on tool or command line arguments error (unknown flag)', () => {
    const res = runCli(['--unknown-unsupported-option-flag']);
    assert.equal(res.status, 2);
    assert.match(res.stderr, /error: unknown option/i);
  });

  await t.test('exit code 2 when specified feature target path does not exist', () => {
    const res = runCli(['features/non-existent-target.feature']);
    assert.equal(res.status, 2);
    assert.match(res.stderr, /does not exist/i);
  });

  await t.test('produces valid and parseable JSON conforming to schema', () => {
    const res = runCliJson(['features/invalid/outlines/undefined_outline_variables.feature']);
    assert.equal(res.status, 1);
    assertResultSchema(res.json);
    assert.equal(res.json.schemaVersion, 1);
    assert.equal(res.json.tool.name, 'gherkin-refine');
    assert.equal(res.json.summary.errors, 2);
  });

  await t.test('produces valid SARIF 2.1.0 output with runs and results', () => {
    const res = runCli(['features/invalid/tags/duplicate_tags.feature', '--format', 'sarif']);
    assert.equal(res.status, 1);
    const sarif = JSON.parse(res.stdout);
    assertSarifSchema(sarif);
    
    // Check that SARIF results contain findings for no-duplicate-tags
    const results = sarif.runs[0].results;
    assert.equal(results.length, 3);
    for (const item of results) {
      assert.equal(item.ruleId, 'no-duplicate-tags');
      assert.equal(item.level, 'error');
    }
  });

  await t.test('repeated runs produce deterministic and byte-identical results', () => {
    const run1 = runCliJson(['features/invalid/outlines/unused_outline_variables.feature']);
    const run2 = runCliJson(['features/invalid/outlines/unused_outline_variables.feature']);
    assert.equal(run1.status, run2.status);
    assert.deepEqual(run1.json, run2.json);
    assert.equal(run1.stdout, run2.stdout);
  });
});
