# gherkin-refine-integration-tests

Independent, automated daily integration and regression test project for the published npm package [`gherkin-refine`](https://www.npmjs.com/package/gherkin-refine) ([GitHub repository](https://github.com/hamzahamidi/gherkin-refine)).

This project tests `gherkin-refine` strictly as an external consumer by installing it from npm and exercising its CLI against realistic Gherkin feature files, validating exit codes, diagnostic schemas, rule behaviors, autofixes, and localized syntax.

---

## Architecture and Design Principles

1. **Standalone consumer repository**: Completely decoupled from `gherkin-refine`'s internal development scripts, unit tests, and source code.
2. **Real-world BDD fixtures**: Fixtures represent realistic domain features (e.g. SaaS subscription billing, cybersecurity incidents, e-commerce order fulfillment) with Backgrounds, Rules, Scenarios, Scenario Outlines, Data Tables, and Doc Strings.
3. **Behavioral outcome assertion**: Tests do not merely check that the process executed. They assert observable behaviors:
   - Exit code `0` for clean files.
   - Exit code `1` for lint or syntax errors.
   - Exit code `2` for configuration or CLI command usage errors.
   - JSON output conforming to the official schema (`schemaVersion: 1`, diagnostic positions, rule IDs, severities).
   - SARIF 2.1.0 output valid for static analysis consumers.
   - Deterministic output across repeated runs.
   - In-place autofix (`--fix`) safe replacement and `--fix-dry-run` non-destructive checks.
4. **Native Node.js test runner**: Uses Node 22.18+ built-in test runner (`node:test` and `node:assert/strict`) without extraneous testing framework dependencies.

---

## Directory Structure

```text
gherkin-refine-integration-tests/
├── .github/
│   └── workflows/
│       └── integration-tests.yml        # Daily CI (06:17 UTC), push, PR, and manual dispatch
├── config/
│   ├── overrides.config.json            # Configuration file testing path-based overrides
│   └── whitespace.config.json           # Configuration file testing whitespace rules & autofix
├── features/
│   ├── valid/                           # Positive fixtures that must pass with exit code 0
│   │   ├── core/
│   │   │   ├── subscription_billing.feature   # Scenarios, outlines, backgrounds
│   │   │   └── incident_reporting.feature     # Data tables, multiline doc strings
│   │   ├── localized/
│   │   │   ├── panier_achats_fr.feature       # French Gherkin keywords (# language: fr)
│   │   │   └── benutzerverwaltung_de.feature  # German Gherkin keywords (# language: de)
│   │   ├── rules/
│   │   │   └── order_fulfillment.feature      # Feature and Rule-scoped Backgrounds
│   │   └── suppression/
│   │       └── inline_suppression.feature     # Inline disable comments & block suppression
│   ├── invalid/                         # Negative fixtures expected to fail with exit code 1
│   │   ├── duplicates/
│   │   │   └── duplicate_scenario_names.feature  # Duplicate scenario names within feature
│   │   ├── outlines/
│   │   │   ├── undefined_outline_variables.feature # Placeholders without Examples column
│   │   │   └── unused_outline_variables.feature    # Examples columns unused in steps
│   │   ├── syntax/
│   │   │   └── unparseable_syntax.feature          # Malformed Gherkin causing parsing-error
│   │   └── tags/
│   │       └── duplicate_tags.feature              # Duplicate tags on feature/scenario/examples
│   ├── fixable/                         # Safe autofix verification fixtures
│   │   ├── blank-lines/
│   │   │   └── extra_blank_lines.feature           # Redundant consecutive blank lines
│   │   └── whitespace/
│   │       └── trailing_spaces.feature             # Trailing spaces and tabs
│   ├── overrides/                       # Rule override test fixtures
│   │   ├── relaxed/
│   │   │   └── long_scenario_allowed.feature       # Allowed by override
│   │   └── standard/
│   │       └── long_scenario.feature               # Blocked by scenario-size limit
│   └── project-rules/                   # Cross-file project-wide rule verification
│       ├── feature-set-a/
│       │   └── inventory_alpha.feature             # Base feature
│       └── feature-set-b/
│           └── inventory_beta.feature              # Duplicate feature name across files
├── test/
│   ├── lib/
│   │   ├── cli-runner.js                # Helper to invoke gherkin-refine CLI
│   │   └── schema-validator.js          # JSON and SARIF schema validators
│   ├── specs/
│   │   ├── autofix.test.js              # --fix and --fix-dry-run tests
│   │   ├── cli-behavior.test.js         # Exit codes, SARIF, JSON, determinism
│   │   ├── configuration.test.js        # Config files and overrides
│   │   ├── invalid-features.test.js     # Regression checks for invalid fixtures
│   │   └── valid-features.test.js       # Regression checks for valid fixtures
│   └── run-report.js                    # Test runner producing JUnit & spec reports
├── package.json
└── README.md
```

---

## Local Setup and Running Tests

### Prerequisites
- Node.js `22.18.0` or higher
- npm

### Installation
```bash
npm ci
# or
npm install
```

### Running Tests
Execute the full regression test suite:
```bash
npm test
```

Generate both terminal spec output and JUnit XML report (`test-results/junit.xml`):
```bash
npm run test:report
```

Lint all valid feature fixtures directly:
```bash
npm run lint:features
```

---

## Adding Fixtures and Expected Diagnostics

### Adding a Valid Fixture
1. Create a `.feature` file under `features/valid/<category>/` using realistic BDD scenario descriptions.
2. Run `npm run lint:features` to verify it passes with exit code 0.
3. The test suite automatically verifies the entire `features/valid` tree during `npm test`.

### Adding an Invalid Fixture
1. Create a `.feature` file under `features/invalid/<category>/`.
2. Add a test in `test/specs/invalid-features.test.js` asserting:
   - CLI status code is `1`.
   - Result matches `assertResultSchema(res.json)`.
   - The specific `ruleId` and message are emitted on the expected file and line.

---

## Daily CI Workflow

The GitHub Actions workflow is located at `.github/workflows/integration-tests.yml`.

### Triggers
- **Daily scheduled run**: Every day at **06:17 UTC** (`cron: '17 6 * * *'`).
- **Push**: On pushes to `main`.
- **Pull Request**: On pull requests targeting `main`.
- **Manual Dispatch**: Via `workflow_dispatch` with an optional `package_version` parameter.

### Dependency Strategy
- **Pushes & PRs**: Run `npm ci` to test against the lockfile-pinned dependency version.
- **Scheduled Runs**: Run `npm install --no-save gherkin-refine@latest` to immediately detect upstream releases or regressions on npm, even without code changes to this repository.
- **Manual Runs**: Can test any specific version (e.g. `1.0.6` or `@canary`) on demand.

### Failure Separation & Artifacts
- Distinguishes dependency installation failures from behavioral regressions.
- Always publishes JUnit XML test reports as GitHub Actions artifacts (`actions/upload-artifact@v4`).
- Outputs an actionable job summary in `$GITHUB_STEP_SUMMARY` detailing trigger type, OS, Node version, and installed `gherkin-refine` package version.
