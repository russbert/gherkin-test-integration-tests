@security @audit
Feature: Enterprise Security Incident Reporting
  As an information security officer
  I want to submit incident reports with structured evidence and audit logs
  So that the incident response team can triage and resolve security breaches

  Background:
    Given the SIEM ingestion pipeline is running in cluster "prod-eu-west-1"
    And alert notification webhook is configured for channel "#sec-ops"

  Scenario: Submitting an incident report with structured telemetry
    Given an authenticated security analyst "sarah.connor@cyber.security"
    When the analyst files a severity "CRITICAL" incident with data:
      | category     | origin_ip     | impacted_hosts |
      | unauthorized | 198.51.100.42 | srv-api-01     |
      | lateral_move | 198.51.100.43 | srv-db-primary |
    Then the incident ticket should be assigned priority "P1"
    And the quarantine action should execute within 15 seconds

  Scenario: Submitting forensic raw log evidence
    Given an isolated staging host "srv-db-primary"
    When the analyst attaches the kernel trace snippet:
      """text
      2026-10-09T00:15:32.102Z kern.alert [SYS_AUDIT]: unauthorized ptrace call from pid 40912
      2026-10-09T00:15:32.105Z kern.emerg [SYS_SEC]: memory region 0x7fff0000 violated W^X policy
      """
    Then the incident ticket status should update to "INVESTIGATING"
    And automated memory snapshot should be persisted to S3 bucket "sec-evidence-vault"
