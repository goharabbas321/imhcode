---
name: claude-red
description: "Offensive security and penetration testing skill. Covers automated vulnerability scanning, secure-coding bypass detection, sanitization reviews, and exploit drafting."
---

# /claude-red — Offensive Security & Penetration Testing

**Claude-Red** equips agents with offensive cybersecurity capabilities to perform penetration testing, threat modeling, and red teaming audits on SaaS architectures.

---

## 🛠️ Security Audit Protocols

### 1. OWASP Top 10 Auditing
- **Injection Protection**: Audit database interaction patterns for raw SQL concats. Enforce strict parameterization.
- **Broken Authentication**: Verify token expiries, session revocation logic, and CSRF token propagation.
- **Sensitive Data Exposure**: Check transit encryption (`HTTPS`), password hashing (`bcrypt`/`argon2`), and PII encryption.

### 2. Penetration Testing Checklist
- Run automated vulnerability mapping on codebase boundaries.
- Attempt secure-coding logic bypasses to detect authorization flaws (e.g., IDOR in controllers).
- Verify sanitization libraries (e.g., DOMPurify for HTML, htmlspecialchars for blade).

### 3. Exploitation Threat Modeling
- Write attack trees demonstrating how a compromised microservice can escalate privileges.
- Document exact CVSS scores for discovered vulnerabilities.
- Provide step-by-step remediation plans.

---

## 🚫 Safe Play Guidelines

- **Never**: Develop weaponized exploits for remote targets.
- **Never**: Store unencrypted API keys or production database credentials in codebase logs.
- **Always**: Perform vulnerability checks against mock controllers or isolated staging stubs.
