@suppression-test
Feature: Legacy System Migration with Inline Directives
  As a migration engineer
  I want to suppress specific linting rules on legacy migration scenarios
  So that valid legacy definitions do not fail the build while pending modernization

  # gherkin-refine-disable-next-line no-duplicate-tags -- legacy external system tagging contract
  @legacy-tag @legacy-tag
  Scenario: Legacy third-party payload compatibility
    Given the legacy SOAP gateway is running
    When receiving an inbound XML envelope
    Then the response status is 200

  # gherkin-refine-disable no-unused-outline-variables
  Scenario Outline: Ingesting legacy batch file feeds
    Given an inbound file named <filename>
    When the ingestion batch processor triggers
    Then the status should be recorded as <result_status>

    Examples:
      | filename    | result_status | archive_mode |
      | feed_01.csv | SUCCESS       | compress_zip |
      | feed_02.csv | PARTIAL       | none         |
  # gherkin-refine-enable no-unused-outline-variables
