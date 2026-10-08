@inventory
Feature: Global Inventory Control Service
  As a warehouse logistics supervisor
  I want to track stock levels in regional depot A
  So that customer fulfillment remains on track

  Scenario: Inbound pallet scan
    Given warehouse "Depot-A" receives pallet "PLT-100"
    When warehouse operator scans barcode
    Then inventory counter is incremented
