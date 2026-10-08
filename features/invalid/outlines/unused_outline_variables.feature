@promotions
Feature: Promotion Discount Validation
  As a marketing operations analyst
  I want to define promotional discounts across tiers
  So that customer campaigns are targeted correctly

  # <redundant_memo> and <unused_channel> are defined in Examples but never referenced in any step or argument
  Scenario Outline: Applying promotional campaign voucher
    Given an eligible campaign code <campaign_code>
    When applying to shopping basket with total <basket_total>
    Then the final charged amount should be <discounted_total>

    Examples:
      | campaign_code | basket_total | discounted_total | redundant_memo    | unused_channel |
      | SPRING20      | 100.00       | 80.00            | spring promo test | direct-mail    |
      | VIP50         | 200.00       | 150.00           | vip discount rule | influencer     |
