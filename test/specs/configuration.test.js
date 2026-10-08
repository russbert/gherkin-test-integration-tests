import test from 'node:test';
import assert from 'node:assert/strict';
import { runCliJson } from '../lib/cli-runner.js';
import { assertResultSchema } from '../lib/schema-validator.js';

test('Configuration and overrides suite', async (t) => {
  await t.test('applies custom rule configuration thresholds and overrides', () => {
    // overrides.config.json sets scenario-size: [error, { maxSteps: 4 }]
    // but features/overrides/relaxed/**/*.feature has overrides: { scenario-size: off }
    const res = runCliJson([
      'features/overrides/standard/long_scenario.feature',
      'features/overrides/relaxed/long_scenario_allowed.feature',
      '-c', 'config/overrides.config.json'
    ]);

    assert.equal(res.status, 1, 'Standard file exceeds maxSteps and should trigger error');
    assertResultSchema(res.json);

    // standard file should have scenario-size violation
    const standardFile = res.json.results.find(r => r.filePath.includes('standard'));
    assert.ok(standardFile, 'Standard file must be in results');
    const standardErrors = standardFile.diagnostics.filter(d => d.ruleId === 'scenario-size');
    assert.equal(standardErrors.length, 1, 'Standard file should violate scenario-size');
    assert.match(standardErrors[0].message, /configured maximum is 4/i);

    // relaxed file should have scenario-size disabled via override
    const relaxedFile = res.json.results.find(r => r.filePath.includes('relaxed'));
    assert.ok(relaxedFile, 'Relaxed file must be in results');
    const relaxedErrors = relaxedFile.diagnostics.filter(d => d.ruleId === 'scenario-size');
    assert.equal(relaxedErrors.length, 0, 'Relaxed file should not report scenario-size');
  });

  await t.test('enables additional opt-in rules via config file', () => {
    const res = runCliJson([
      'features/fixable/whitespace/trailing_spaces.feature',
      '-c', 'config/whitespace.config.json'
    ]);

    assert.equal(res.status, 1, 'Opt-in whitespace rule should fail unformatted file');
    assertResultSchema(res.json);
    const whitespaceErrors = res.json.results[0].diagnostics.filter(d => d.ruleId === 'no-trailing-whitespace');
    assert.ok(whitespaceErrors.length > 0, 'Should detect trailing whitespace violations');
  });
});
