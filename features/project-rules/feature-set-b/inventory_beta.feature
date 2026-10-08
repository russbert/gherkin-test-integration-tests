@inventory
Feature: global inventory control service
  As a warehouse logistics supervisor
  I want to track stock levels in regional depot B
  So that customer fulfillment remains on track

  Scenario: Outbound pallet dispatch
    Given warehouse "Depot-B" stages pallet "PLT-200"
    When logistics team dispatches delivery truck
    Then inventory counter is decremented
