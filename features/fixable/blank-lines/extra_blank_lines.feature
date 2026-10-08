@formatting @blanklines
Feature: Multiple Blank Lines Cleanup
  As a code quality gate
  I want single empty lines between logical blocks
  So that feature documents remain readable and compact



  Background:
    Given a linting rule restricting consecutive empty lines



  Scenario: Removing excessive blank lines
    Given multiple consecutive blank lines separating steps
    When safe autofix runs
    Then at most one consecutive blank line remains
