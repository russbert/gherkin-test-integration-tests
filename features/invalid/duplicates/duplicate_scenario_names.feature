@identity
Feature: User Profile Management
  As a registered user
  I want to update my profile
  So that my information stays current

  Scenario: Update contact email address
    Given the user is logged in
    When updating email to "new@example.com"
    Then email verification should be sent

  # Duplicate scenario name in the same feature
  Scenario: Update contact email address
    Given the user is logged in with multi-factor authentication
    When updating email to "work@example.com"
    Then corporate security alert should be dispatched
