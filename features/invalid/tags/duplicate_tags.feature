@payments @payments
Feature: Redundant Tagged Payment Processing
  As a payment services engineer
  I want to process payments reliably
  So that customer charges are completed

  @priority @priority @audit
  Scenario: Duplicate scenario level tags
    Given a valid customer account "cust-881"
    When charging an amount of $50
    Then transaction state should be "CONFIRMED"

  Scenario Outline: Duplicate tags on examples block
    Given customer tier <tier>
    When calculating loyalty points for purchase amount <amount>
    Then loyalty points awarded should be <points>

    @tier-bronze @tier-bronze
    Examples:
      | tier   | amount | points |
      | BRONZE | 100    | 10     |
