@audit
Feature: Relaxed High Volume Processing
  As a transaction worker
  I want to process large transaction blocks under relaxed overrides
  So that legacy deep scenarios are allowed without errors

  Scenario: Relaxed scenario with many steps
    Given step 1 has completed
    And step 2 has completed
    And step 3 has completed
    And step 4 has completed
    And step 5 has completed
    When step 6 executes
    Then step 7 validates successfully
