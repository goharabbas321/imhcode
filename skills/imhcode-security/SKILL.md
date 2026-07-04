---
name: imhcode-security
description: "Checks codebases against OWASP Agentic Security Initiative (ASI) Top 10 risks. Used by security-auditor to run compliance checks and penetration auditing."
---

# Agent OWASP ASI Compliance Check

Evaluate AI agent systems against the OWASP Agentic Security Initiative (ASI) Top 10 — the industry standard for agent security posture.

## Overview

The OWASP ASI Top 10 defines the critical security risks specific to autonomous AI agents — not LLMs, not chatbots, but agents that call tools, access systems, and act on behalf of users. This skill checks whether your agent implementation addresses each risk.

```
Codebase → Scan for each ASI control:
  ASI-01: Prompt Injection Protection
  ASI-02: Tool Use Governance
  ASI-03: Agency Boundaries
  ASI-04: Escalation Controls
  ASI-05: Trust Boundary Enforcement
  ASI-06: Logging & Audit
  ASI-07: Identity Management
  ASI-08: Policy Integrity
  ASI-09: Supply Chain Verification
  ASI-10: Behavioral Monitoring
→ Generate Compliance Report (X/10 covered)
```

## The 10 Risks

| Risk | Name | What to Look For |
|------|------|-----------------|
| ASI-01 | Prompt Injection | Input validation before tool calls, not just LLM output filtering |
| ASI-02 | Insecure Tool Use | Tool allowlists, argument validation, no raw shell execution |
| ASI-03 | Excessive Agency | Capability boundaries, scope limits, principle of least privilege |
| ASI-04 | Unauthorized Escalation | Privilege checks before sensitive operations, no self-promotion |
| ASI-05 | Trust Boundary Violation | Trust verification between agents, signed credentials, no blind trust |
| ASI-06 | Insufficient Logging | Structured audit trail for all tool calls, tamper-evident logs |
| ASI-07 | Insecure Identity | Cryptographic agent identity, not just string names |
| ASI-08 | Policy Bypass | Deterministic policy enforcement, no LLM-based permission checks |
| ASI-09 | Supply Chain Integrity | Signed plugins/tools, integrity verification, dependency auditing |
| ASI-10 | Behavioral Anomaly | Drift detection, circuit breakers, kill switch capability |
