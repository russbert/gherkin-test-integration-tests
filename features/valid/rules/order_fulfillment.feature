@order-fulfillment
Feature: E-Commerce Order Lifecycle
  As an online retail platform
  I want to govern order checkout and fulfillment with strict business rules
  So that items are reserved, charged, and shipped according to store policies

  Background:
    Given the master product catalog is synchronized
    And warehouse location "WH-NORTH" has operating staff on shift

  Rule: Orders exceeding available stock cannot proceed to checkout

    Background:
      Given stock reservation TTL is configured to 15 minutes

    Scenario: Reject checkout when requested quantity exceeds inventory
      Given item SKU "ELEC-9921" has remaining stock of 2 units
      When a shopper attempts to checkout with 5 units of "ELEC-9921"
      Then the checkout attempt should be rejected with code "INSUFFICIENT_STOCK"
      And the shopping cart should retain the remaining 2 units

  Rule: Completed checkouts must trigger inventory deduction

    Scenario: Successful order deduction
      Given item SKU "BOOK-1044" has remaining stock of 20 units
      When a customer completes purchase of 3 units of "BOOK-1044"
      Then the remaining inventory for "BOOK-1044" should be 17 units
      And a warehouse pick task should be generated
