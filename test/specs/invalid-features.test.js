import test from 'node:test';
import assert from 'node:assert/strict';
import { runCli, runCliJson } from '../lib/cli-runner.js';
import { assertResultSchema } from '../lib/schema-validator.js';

test('Invalid features and rule diagnostic regression suite', async (t) => {
  await t.test('detects syntax and unparseable Gherkin errors as parsing-error (exit code 1)', () => {
    const res = runCliJson(['features/invalid/syntax/unparseable_syntax.feature']);
    assert.equal(res.status, 1, 'Syntax error must exit with code 1');
    assertResultSchema(res.json);
    assert.ok(res.json.summary.errors >= 1);
    
    const parsingErrors = res.json.results[0].diagnostics.filter(d => d.ruleId === 'parsing-error');
    assert.ok(parsingErrors.length > 0, 'Expected at least one parsing-error diagnostic');
    assert.equal(parsingErrors[0].severity, 'error');
  });

  await t.test('detects duplicate tags across feature, scenario, and examples levels (no-duplicate-tags)', () => {
    const res = runCliJson(['features/invalid/tags/duplicate_tags.feature']);
    assert.equal(res.status, 1, 'Duplicate tags must fail linting with code 1');
    assertResultSchema(res.json);
    
    const tagErrors = res.json.results[0].diagnostics.filter(d => d.ruleId === 'no-duplicate-tags');
    // Expect 3 duplicate tag diagnostics: @payments on feature, @priority on scenario, @tier-bronze on examples
    assert.equal(tagErrors.length, 3, `Expected 3 duplicate tag violations, got ${tagErrors.length}`);
    for (const diag of tagErrors) {
      assert.equal(diag.severity, 'error');
      assert.match(diag.message, /Duplicate tag/i);
    }
  });

  await t.test('detects duplicate scenario names within the same feature (no-duplicate-scenario-names)', () => {
    const res = runCliJson(['features/invalid/duplicates/duplicate_scenario_names.feature']);
    assert.equal(res.status, 1, 'Duplicate scenario names must exit with code 1');
    assertResultSchema(res.json);

    const dupErrors = res.json.results[0].diagnostics.filter(d => d.ruleId === 'no-duplicate-scenario-names');
    assert.equal(dupErrors.length, 1, `Expected 1 duplicate scenario name violation, got ${dupErrors.length}`);
    assert.equal(dupErrors[0].severity, 'error');
    assert.match(dupErrors[0].message, /Scenario name duplicates another Scenario/i);
    assert.equal(dupErrors[0].start.line, 13);
  });

  await t.test('detects undefined Scenario Outline variables (no-undefined-outline-variables)', () => {
    const res = runCliJson(['features/invalid/outlines/undefined_outline_variables.feature']);
    assert.equal(res.status, 1, 'Undefined outline variables must exit with code 1');
    assertResultSchema(res.json);

    const undefinedErrors = res.json.results[0].diagnostics.filter(d => d.ruleId === 'no-undefined-outline-variables');
    // Expect 2 undefined variables: delivery_speed and coupon_code
    assert.equal(undefinedErrors.length, 2, `Expected 2 undefined outline variables, got ${undefinedErrors.length}`);
    const messages = undefinedErrors.map(e => e.message).join(' ');
    assert.ok(messages.includes('delivery_speed'), 'Must report delivery_speed');
    assert.ok(messages.includes('coupon_code'), 'Must report coupon_code');
  });

  await t.test('detects unused Scenario Outline variables (no-unused-outline-variables)', () => {
    const res = runCliJson(['features/invalid/outlines/unused_outline_variables.feature']);
    assert.equal(res.status, 1, 'Unused outline variables must exit with code 1');
    assertResultSchema(res.json);

    const unusedErrors = res.json.results[0].diagnostics.filter(d => d.ruleId === 'no-unused-outline-variables');
    // Expect 2 unused variables: redundant_memo and unused_channel
    assert.equal(unusedErrors.length, 2, `Expected 2 unused outline variables, got ${unusedErrors.length}`);
    const messages = unusedErrors.map(e => e.message).join(' ');
    assert.ok(messages.includes('redundant_memo'), 'Must report redundant_memo');
    assert.ok(messages.includes('unused_channel'), 'Must report unused_channel');
  });

  await t.test('detects duplicate feature names across multiple files in a project (no-duplicate-feature-names)', () => {
    const res = runCliJson([
      'features/project-rules/feature-set-a/inventory_alpha.feature',
      'features/project-rules/feature-set-b/inventory_beta.feature'
    ]);
    assert.equal(res.status, 1, 'Cross-file duplicate feature names must exit with code 1');
    assertResultSchema(res.json);

    const allDiags = res.json.results.flatMap(r => r.diagnostics);
    const dupFeatureErrors = allDiags.filter(d => d.ruleId === 'no-duplicate-feature-names');
    assert.equal(dupFeatureErrors.length, 1, `Expected 1 duplicate feature name violation, got ${dupFeatureErrors.length}`);
    assert.equal(dupFeatureErrors[0].severity, 'error');
    assert.match(dupFeatureErrors[0].message, /Feature name duplicates/i);
  });
});
