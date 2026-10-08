@orders
Feature: Order Checkout Outline Variable Validation
  As an order calculation service
  I want to calculate order totals with line item discounts
  So that customer checkouts are accurate

  # <delivery_speed> and <coupon_code> are referenced in steps but never defined in Examples table
  Scenario Outline: Shipping cost estimation with missing variables
    Given an order containing <item_count> items weighing <total_weight> kg
    When the shipping method is selected as <delivery_speed>
    And the customer enters discount coupon <coupon_code>
    Then the estimated shipping cost should be <estimated_fee>

    Examples:
      | item_count | total_weight | estimated_fee |
      | 1          | 0.5          | 4.99          |
      | 3          | 2.1          | 8.50          |
