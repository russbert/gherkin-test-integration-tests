import assert from 'node:assert/strict';

/**
 * Validates gherkin-refine result output matches schema structure
 * @param {any} result
 */
export function assertResultSchema(result) {
  assert.equal(result.schemaVersion, 1, 'schemaVersion must be 1');
  assert.ok(result.tool, 'tool object must be present');
  assert.equal(result.tool.name, 'gherkin-refine', 'tool.name must be gherkin-refine');
  assert.match(result.tool.version, /^\d+\.\d+\.\d+/, 'tool.version must be semver');

  assert.ok(result.summary, 'summary object must be present');
  assert.equal(typeof result.summary.files, 'number', 'summary.files must be number');
  assert.equal(typeof result.summary.errors, 'number', 'summary.errors must be number');
  assert.equal(typeof result.summary.warnings, 'number', 'summary.warnings must be number');
  assert.equal(typeof result.summary.fixable, 'number', 'summary.fixable must be number');
  assert.equal(typeof result.summary.truncated, 'boolean', 'summary.truncated must be boolean');

  assert.ok(Array.isArray(result.results), 'results must be an array');
  for (const fileResult of result.results) {
    assert.equal(typeof fileResult.filePath, 'string', 'fileResult.filePath must be string');
    assert.ok(Array.isArray(fileResult.diagnostics), 'fileResult.diagnostics must be array');
    for (const diag of fileResult.diagnostics) {
      assert.equal(typeof diag.ruleId, 'string', 'diagnostic.ruleId must be string');
      assert.ok(['warn', 'error'].includes(diag.severity), `diagnostic.severity must be warn or error, got ${diag.severity}`);
      assert.equal(typeof diag.message, 'string', 'diagnostic.message must be string');
      assert.ok(diag.start, 'diagnostic.start must exist');
      assert.ok(diag.start.line >= 1, 'diagnostic.start.line must be >= 1');
      assert.ok(diag.start.column >= 1, 'diagnostic.start.column must be >= 1');
    }
  }
}

/**
 * Validates SARIF output structure according to SARIF 2.1.0 standard
 * @param {any} sarif
 */
export function assertSarifSchema(sarif) {
  assert.equal(sarif.version, '2.1.0', 'SARIF version must be 2.1.0');
  assert.ok(sarif.$schema.includes('sarif'), 'SARIF $schema must mention sarif');
  assert.ok(Array.isArray(sarif.runs), 'runs must be an array');
  assert.ok(sarif.runs.length > 0, 'at least one run must be present');

  const run = sarif.runs[0];
  assert.equal(run.tool.driver.name, 'gherkin-refine');
  assert.ok(run.tool.driver.version, 'SARIF tool driver version must exist');
  assert.ok(Array.isArray(run.results), 'SARIF results must be an array');
}
