import test from 'node:test';
import assert from 'node:assert/strict';
import { runCli, runCliJson } from '../lib/cli-runner.js';
import { assertResultSchema } from '../lib/schema-validator.js';

test('Valid features suite', async (t) => {
  await t.test('lints valid core feature files with exit code 0 and zero diagnostics', () => {
    const res = runCliJson(['features/valid/core/subscription_billing.feature']);
    assert.equal(res.status, 0, `Expected exit code 0, got ${res.status}`);
    assertResultSchema(res.json);
    assert.equal(res.json.summary.errors, 0);
    assert.equal(res.json.summary.warnings, 0);
    assert.equal(res.json.results[0].diagnostics.length, 0);
  });

  await t.test('validates data tables and multiline doc strings without parsing errors', () => {
    const res = runCliJson(['features/valid/core/incident_reporting.feature']);
    assert.equal(res.status, 0);
    assertResultSchema(res.json);
    assert.equal(res.json.summary.errors, 0);
    assert.equal(res.json.results[0].diagnostics.length, 0);
  });

  await t.test('validates Backgrounds scoped under Rules and Feature levels', () => {
    const res = runCliJson(['features/valid/rules/order_fulfillment.feature']);
    assert.equal(res.status, 0);
    assertResultSchema(res.json);
    assert.equal(res.json.summary.errors, 0);
    assert.equal(res.json.results[0].diagnostics.length, 0);
  });

  await t.test('supports French localized Gherkin keywords (#language: fr)', () => {
    const res = runCliJson(['features/valid/localized/panier_achats_fr.feature']);
    assert.equal(res.status, 0);
    assertResultSchema(res.json);
    assert.equal(res.json.summary.errors, 0);
    assert.equal(res.json.results[0].diagnostics.length, 0);
  });

  await t.test('supports German localized Gherkin keywords (#language: de)', () => {
    const res = runCliJson(['features/valid/localized/benutzerverwaltung_de.feature']);
    assert.equal(res.status, 0);
    assertResultSchema(res.json);
    assert.equal(res.json.summary.errors, 0);
    assert.equal(res.json.results[0].diagnostics.length, 0);
  });

  await t.test('honors inline rule suppression comments (disable-next-line and block disable/enable)', () => {
    const res = runCliJson(['features/valid/suppression/inline_suppression.feature']);
    assert.equal(res.status, 0, 'Suppressed violations should result in exit code 0');
    assertResultSchema(res.json);
    assert.equal(res.json.summary.errors, 0);
    assert.equal(res.json.results[0].diagnostics.length, 0);
  });

  await t.test('lints entire features/valid tree in a single invocation with zero errors', () => {
    const res = runCliJson(['features/valid']);
    assert.equal(res.status, 0);
    assertResultSchema(res.json);
    assert.ok(res.json.summary.files >= 5, `Expected at least 5 files linted, got ${res.json.summary.files}`);
    assert.equal(res.json.summary.errors, 0);
    assert.equal(res.json.summary.warnings, 0);
  });
});
