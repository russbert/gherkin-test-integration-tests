@billing @subscriptions
Feature: Customer Subscription Billing
  As a SaaS subscription manager
  I want to process recurring billing cycles
  So that customers are billed accurately according to their subscription tier

  Background:
    Given the billing engine is initialized for currency "USD"
    And payment gateways "stripe" and "paypal" are healthy

  Scenario: Basic monthly tier charge
    Given an active customer account "cust-10293" with plan "Starter"
    And a valid credit card on file expiring in "12/2028"
    When the scheduled monthly billing cycle executes on "2026-11-01"
    Then the invoice should be created with status "PAID"
    And a receipt email should be queued for "billing@customer.org"

  Scenario Outline: Volume tier pricing calculation
    Given a customer with usage count <seat_count>
    When calculating monthly invoice subtotal
    Then the calculated amount should be <expected_amount>
    And discount rate applied should be <discount_pct>

    Examples:
      | seat_count | expected_amount | discount_pct |
      | 5          | 50.00           | 0            |
      | 25         | 225.00          | 10           |
      | 100        | 800.00          | 20           |
