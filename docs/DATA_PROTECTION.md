# Data Protection Guidelines (PII / GDPR / CCPA)

These are binding engineering guidelines for any code that touches **personal
data** in this service. They translate GDPR and CCPA/CPRA obligations into
concrete, reviewable rules. CodeRabbit enforces them on every pull request (see
`.coderabbit.yaml`); several are also gated deterministically by
`scripts/pii_check.sh`.

Each rule has a stable ID (e.g. `DP-02`). When a review flags a violation it
should cite the rule ID so authors can trace it back here.

## Scope: what counts as personal data

- **Direct identifiers:** name, email, phone, postal address, IP address,
  device ID, government ID (SSN / national ID), date of birth.
- **Sensitive / special-category:** full card number (PAN), CVV, bank account,
  passwords, auth tokens, precise geolocation, health data.
- **Derived:** any field that, alone or combined, can single out a person.

Treat anything above as **PII** for the purposes of these rules.

---

## Rules

### DP-01 — Data minimization *(GDPR Art. 5(1)(c))*
Collect and persist only the personal data a feature actually needs. Do not add
model fields or request parameters "just in case." New PII columns require a
documented purpose in the PR description.

### DP-02 — Never log PII
Do not write PII to logs, stdout/stderr, or error messages. This includes
`console.*`, request loggers, and thrown/returned error strings. Log opaque
identifiers (a user ID, a request ID), never the personal data itself.
- Request-logging middleware must not capture request bodies or query strings
  containing PII.

### DP-03 — Encrypt / hash sensitive data at rest
- Passwords: hash with a memory-hard algorithm (Argon2id / bcrypt / scrypt).
  Never store or compare plaintext passwords.
- Other sensitive PII stored at rest must be encrypted (AES-GCM or DB-level
  encryption). Plaintext `String` columns for sensitive PII are prohibited.

### DP-04 — Do not store prohibited data
Never persist card CVV/CVC, full magnetic-stripe/track data, or PINs. Store only
a payment-provider token and, at most, the PAN last four. (Overlaps with PCI-DSS.)

### DP-05 — Right to erasure *(GDPR Art. 17 / CCPA §1798.105)*
Any model holding PII must have a deletion path. A feature that creates a
personal-data record must ship a corresponding delete endpoint/service, and
related records must cascade or be anonymized. No "orphaned" PII.

### DP-06 — Right of access & portability *(GDPR Art. 15/20 / CCPA §1798.110)*
Users must be able to retrieve their own personal data in a structured format.
New PII-bearing resources should expose a self-service read/export path.

### DP-07 — Consent & lawful basis *(GDPR Art. 6/7)*
Marketing/tracking use of PII requires a stored, explicit consent flag (opt-in,
default false). Do not enable marketing communications by default.

### DP-08 — Response minimization & masking
API responses must not expose more PII than the caller needs. Mask sensitive
fields (e.g. card `**** 1234`), and never return password hashes, tokens, CVV,
or full government IDs in a response body.

### DP-09 — Access control on personal data *(GDPR Art. 5(1)(f) / 32)*
Personal data must be scoped to its owner. Endpoints must derive the subject
from the authenticated principal — never from a client-supplied ID without an
ownership check, and never from a hardcoded placeholder (e.g. `userId = 1`).
Broken object-level authorization on PII is a reportable data breach.

### DP-10 — Data retention
PII must have a defined retention period and a mechanism to purge/anonymize
expired records. Don't retain personal data indefinitely by default.

### DP-11 — Secure transport
Personal data must only be transmitted over TLS. Outbound calls carrying PII to
third parties must verify certificates and must not disable TLS validation.

### DP-12 — No PII to unvetted third parties
Do not send personal data to third-party services (analytics, logging, LLM
APIs) without a documented data-processing basis. Redact PII before it leaves
the service boundary.

---

## Author checklist (put in the PR description when touching PII)

- [ ] Purpose documented for every new PII field (DP-01)
- [ ] No PII in logs or error messages (DP-02)
- [ ] Sensitive data hashed/encrypted at rest; nothing prohibited stored (DP-03, DP-04)
- [ ] Deletion path exists and cascades (DP-05)
- [ ] Access/export path exists (DP-06)
- [ ] Consent stored where required, opt-in only (DP-07)
- [ ] Responses masked/minimized (DP-08)
- [ ] Ownership enforced from the authenticated user, no placeholders (DP-09)
- [ ] Retention/purge considered (DP-10)
- [ ] TLS enforced; no PII to unvetted third parties (DP-11, DP-12)
