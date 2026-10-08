@whitespace @cleanup
Feature: Trailing Whitespace Cleanup Verification   
  As a software engineer   
  I want clean formatting without trailing whitespace   
  So that git diffs remain pristine and uncluttered   

  Background:   
    Given developer environment is configured   

  Scenario: Formatting code and feature files   
    Given a feature file with trailing spaces on every line   
    When the linter runs with autofix enabled   
    Then trailing whitespace is safely stripped   
