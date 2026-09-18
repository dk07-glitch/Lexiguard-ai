# 📄 LexiGuard AI — Sample Contracts for Upload Testing

This directory contains ready-to-use sample agreements formatted for testing the **"Upload File"** feature in LexiGuard AI.

---

## 📥 Available Sample Files

| Filename | Legal Category | Primary Vulnerability / Risk Tested | Format |
|:---|:---|:---|:---:|
| [`residential_lease.txt`](./residential_lease.txt) | Real Estate / Rental | Predatory deposit forfeiture, 90-day certified mail renewal trap | `.txt` |
| [`executive_employment_agreement.txt`](./executive_employment_agreement.txt) | Employment & HR | 2-year nationwide non-compete, off-hours IP seizure | `.txt` |
| [`freelance_service_agreement.md`](./freelance_service_agreement.md) | Freelance & Consulting | Milestone payments, conditional copyright assignment | `.md` |
| [`saas_terms_of_service.txt`](./saas_terms_of_service.txt) | SaaS & Digital Services | Unilateral ToS modification, $100 total liability limit | `.txt` |
| [`mutual_nda.txt`](./mutual_nda.txt) | Corporate Confidentiality | Balanced 3-year term, standard public domain exclusions | `.txt` |

---

## 🛠️ How to Test File Uploads in LexiGuard AI

1. Download any of the sample files above to your local device.
2. Open the **[LexiGuard AI Live App](https://dk07-glitch.github.io/Lexiguard-ai/)**.
3. In the contract editor panel, click **"Upload File"**.
4. Select the downloaded sample file.
5. The application will instantly:
   - Validate file extension and size (Max 2MB).
   - Sanitize filename and disarm Windows reserved device names (`CON`, `PRN`, `AUX`, etc.).
   - Scrub any client-side PII, credentials, or API keys in browser memory.
   - Run AI legal risk assessment and render the interactive clause breakdown.

---

## 🔒 Supported Upload Formats & Limits

- **Accepted Extensions**: `.txt`, `.md`, `.doc`, `.docx`, `.json`
- **Maximum File Size**: `2 MB`
- **Security Protections**:
  - Whitelist/blacklist extension validation
  - Unicode Right-to-Left Override (RTLO) defense
  - Path traversal and null byte sanitization
  - Client-side zero-retention memory guarantee
