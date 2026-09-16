/**
 * LexiGuard AI - Pre-loaded Realistic Sample Legal Agreements
 */

export const SAMPLE_DOCUMENTS = {
  lease: {
    id: "lease",
    title: "Residential Lease Agreement (Landlord Favorable)",
    category: "Real Estate / Rental",
    description: "Contains strict security deposit forfeiture, auto-renewal, and 60-day termination notice.",
    riskScore: 78,
    text: `RESIDENTIAL LEASE AGREEMENT

PARTIES:
Landlord: Apex Properties LLC ("Landlord")
Tenant: John Doe ("Tenant")
Property Address: 452 Skyline Blvd, Apt 4B, New York, NY 10001

1. TERM & RENT
The Lease term begins on October 1, 2026 and ends on September 30, 2027. Monthly rent shall be $3,400 payable on the 1st of each month. Late payments received after the 3rd day shall incur a mandatory late fee of $250 plus $25 per day.

2. SECURITY DEPOSIT & FORFEITURE
Tenant shall deposit $6,800 as security deposit. Landlord reserves the unconditional right to retain the entire security deposit as liquidated damages if Tenant vacates prior to Lease end, regardless of whether Landlord re-rents the unit immediately.

3. AUTOMATIC RENEWAL & NOTICE
This Lease shall AUTOMATICALLY RENEW for an additional 12-month period at a rent increase of 15% unless Tenant provides WRITTEN NOTICE of non-renewal via certified mail AT LEAST 90 DAYS prior to Lease expiration. Email or oral notification is strictly void.

4. SUBLETTING & GUESTS
Subletting, assignment, or Airbnb hosting is strictly prohibited under penalty of immediate eviction and a $5,000 breach fine. Overnight guests remaining longer than 3 consecutive nights require prior written consent from Landlord.

5. REPAIRS & MAINTENANCE
Tenant is responsible for the first $350 of any repair or maintenance cost per occurrence, including plumbing, HVAC, or appliance failures, regardless of cause.

6. GOVERNING LAW & LEGAL FEES
Tenant agrees to reimburse Landlord for all legal costs, attorney fees, and court expenses incurred by Landlord in enforcing any provision of this agreement.`,
    clauses: [
      {
        id: "c1",
        line: "Section 2: Security Deposit",
        type: "high",
        title: "Total Security Deposit Forfeiture",
        originalText: "Landlord reserves the unconditional right to retain the entire security deposit as liquidated damages if Tenant vacates prior to Lease end...",
        plainText: "If you move out early, the landlord will keep your entire $6,800 deposit automatically, even if they find a new tenant the next day. Under state law, landlords are typically only allowed to deduct actual lost rent.",
        recommendation: "Request changing this to state that security deposit will only cover actual unpaid rent or documented damages, subject to standard accounting within 30 days."
      },
      {
        id: "c2",
        line: "Section 3: Notice Period",
        type: "high",
        title: "90-Day Certified Mail Non-Renewal Trap & 15% Rent Hike",
        originalText: "AUTOMATICALLY RENEW for an additional 12-month period at a rent increase of 15% unless Tenant provides WRITTEN NOTICE of non-renewal via certified mail AT LEAST 90 DAYS prior...",
        plainText: "You must give notice 3 full months in advance by certified mail (email doesn't count!). If you miss the deadline by even one day, you are locked into another full year at 15% higher rent ($3,910/mo).",
        recommendation: "Negotiate notice period down to 30 or 60 days, allow written email notice, and cap rent increases at 5%."
      },
      {
        id: "c3",
        line: "Section 5: Repairs & Maintenance",
        type: "medium",
        title: "Tenant Pays $350 Maintenance Deductible",
        originalText: "Tenant is responsible for the first $350 of any repair or maintenance cost per occurrence, including plumbing, HVAC, or appliance failures, regardless of cause.",
        plainText: "You must pay $350 out of pocket every time an appliance or plumbing breaks, even if caused by old building infrastructure.",
        recommendation: "Strike out repair fee obligations for building systems (HVAC/plumbing) unless damaged directly by tenant misuse."
      },
      {
        id: "c4",
        line: "Section 6: Legal Fees",
        type: "medium",
        title: "One-Sided Attorney Fee Clause",
        originalText: "Tenant agrees to reimburse Landlord for all legal costs, attorney fees, and court expenses incurred by Landlord...",
        plainText: "You pay the landlord's legal bills if they sue you, but they do not pay yours if you win.",
        recommendation: "Make attorney fee reimbursement mutual so whichever party wins in court gets reimbursed."
      }
    ],
    timeline: [
      { date: "Monthly (1st)", title: "Rent Due ($3,400)", type: "payment" },
      { date: "Monthly (3rd)", title: "Grace Period Ends ($250 Late Fee)", type: "warning" },
      { date: "June 30, 2027", title: "CRITICAL: 90-Day Non-Renewal Notice Deadline", type: "deadline" },
      { date: "Sept 30, 2027", title: "Lease Expiration Date", type: "info" }
    ]
  },

  employment: {
    id: "employment",
    title: "Executive Employment & Non-Compete Agreement",
    category: "Employment & HR",
    description: "Features broad 2-year nationwide non-compete, IP seizure, and mandatory binding arbitration.",
    riskScore: 85,
    text: `EMPLOYMENT & PROPRIETARY RIGHTS AGREEMENT

PARTIES:
Employer: Nexus CyberTech Inc. ("Company")
Employee: Jane Smith ("Employee")
Position: Senior Software Architect

1. INTELLECTUAL PROPERTY ASSIGNMENT
Employee agrees that ALL inventions, code, designs, documentation, and ideas created, conceived, or reduced to practice by Employee during the term of employment—WHETHER OR NOT created during working hours, on Company equipment, or related to Company's business—shall be the sole and exclusive property of Company.

2. NON-COMPETITION RESTRICTION
For a period of TWO (2) YEARS following the termination of employment for ANY reason, Employee shall not directly or indirectly engage in, perform services for, consult with, or hold financial interest in any business entity competing with Company anywhere within the UNITED STATES.

3. NON-SOLICITATION
For two (2) years post-employment, Employee shall not solicit, recruit, or hire any employee, contractor, or customer of Company. Breach of this section triggers liquidated damages of $100,000 per violation.

4. MANDATORY BINDING ARBITRATION
Any dispute, claim, or controversy arising out of or relating to this Agreement or employment shall be settled exclusively by confidential binding arbitration in Delaware. Employee WAIVES ALL RIGHTS TO A TRIAL BY JURY or participation in class actions.`,
    clauses: [
      {
        id: "c1",
        line: "Section 1: IP Assignment",
        type: "high",
        title: "Total IP Seizure (Off-Hours Personal Projects)",
        originalText: "WHETHER OR NOT created during working hours, on Company equipment, or related to Company's business—shall be the sole property of Company.",
        plainText: "The company claims ownership of ANYTHING you invent or code, even if done on your personal laptop at home on weekends for personal side projects unrelated to work.",
        recommendation: "Carve out personal projects created on personal time/equipment that do not utilize company trade secrets or compete with company core products."
      },
      {
        id: "c2",
        line: "Section 2: Non-Compete",
        type: "high",
        title: "2-Year Nationwide Non-Compete Ban",
        originalText: "For a period of TWO (2) YEARS... Employee shall not directly or indirectly engage in... any business entity competing... anywhere within the UNITED STATES.",
        plainText: "You cannot work in your field anywhere in the US for 2 full years after leaving, making it virtually impossible to earn a living without changing careers.",
        recommendation: "Limit non-compete scope to direct competitors within a 25-mile radius for 6 months max, or request garden leave compensation."
      },
      {
        id: "c3",
        line: "Section 3: Liquidated Damages",
        type: "high",
        title: "$100,000 Non-Solicitation Penalty",
        originalText: "Breach of this section triggers liquidated damages of $100,000 per violation.",
        plainText: "If a former coworker asks you about job openings at your new company, you could be sued for $100,000 automatically.",
        recommendation: "Remove fixed $100,000 liquidated damages clause and restrict prohibition only to active intentional recruitment."
      }
    ],
    timeline: [
      { date: "Employment Start", title: "All IP Rights Assigned to Company", type: "info" },
      { date: "Post-Termination Day 1", title: "2-Year Non-Compete Clock Begins", type: "deadline" },
      { date: "Post-Termination Yr 2", title: "Non-Compete & Non-Solicit Restrictions Expire", type: "info" }
    ]
  },

  nda: {
    id: "nda",
    title: "Mutual Non-Disclosure Agreement (Standard Fair)",
    category: "Corporate / Business",
    description: "Balanced confidentiality agreement with standard 3-year term and reciprocal protection.",
    riskScore: 22,
    text: `MUTUAL NON-DISCLOSURE AGREEMENT

PARTIES:
Party A: Alpha Ventures Inc.
Party B: Beta Labs LLC

1. PURPOSE & CONFIDENTIAL INFORMATION
The parties intend to disclose confidential information solely for evaluating a potential commercial partnership ("Purpose"). Confidential Information includes trade secrets, technical data, financial figures, customer lists, and software code marked "Confidential".

2. OBLIGATIONS OF CONFIDENTIALITY
Each Receiving Party agrees to maintain the Confidential Information in strict confidence using at least reasonable care, and shall not disclose it to third parties except to employees and advisors with a need to know.

3. EXCLUSIONS
Confidential Information does not include information that: (a) is or becomes publicly known through no breach; (b) was already known prior to disclosure; (c) is independently developed without reference to Confidential Information; or (d) is disclosed pursuant to valid court order.

4. TERM & RETURN
This Agreement remains in effect for three (3) years from the Effective Date. Upon written request, Receiving Party shall return or destroy all materials containing Confidential Information within 30 days.`,
    clauses: [
      {
        id: "c1",
        line: "Section 3: Exclusions",
        type: "low",
        title: "Standard Public Domain Exclusions Included",
        originalText: "Confidential Information does not include information that is or becomes publicly known...",
        plainText: "Protects you from being liable if information becomes public naturally or was already known prior to signing.",
        recommendation: "Clause is standard and fair."
      },
      {
        id: "c2",
        line: "Section 4: Term",
        type: "low",
        title: "Reasonable 3-Year Expiration",
        originalText: "This Agreement remains in effect for three (3) years from the Effective Date.",
        plainText: "Confidentiality obligations naturally expire after 3 years, which is industry standard for commercial discussions.",
        recommendation: "Clause is standard and balanced."
      }
    ],
    timeline: [
      { date: "Effective Date", title: "NDA Confidentiality Begins", type: "info" },
      { date: "3 Years Post-Signing", title: "Confidentiality Term Expires", type: "info" }
    ]
  },

  saas: {
    id: "saas",
    title: "SaaS Terms of Service & Privacy Policy",
    category: "Software & Digital",
    description: "Features unilateral policy modification, automatic recurring credit card charges, and $100 total liability cap.",
    riskScore: 65,
    text: `CLOUDIFY SERVICES TERMS OF USE

1. AUTOMATIC RENEWAL & BILLING
Subscriptions auto-renew monthly on your credit card. You authorize Cloudify to store payment details and charge recurring fees until cancelled. Cancellations must be completed 14 days prior to billing date; no refunds for partial months.

2. UNILATERAL AMENDMENTS
Cloudify reserves the right to modify these Terms, pricing, or features at any time without prior notice. Continued use of the platform constitutes binding acceptance of modified terms.

3. LIMITATION OF LIABILITY
TO THE MAXIMUM EXTENT PERMITTED BY LAW, CLOUDIFY'S TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS OF ANY KIND SHALL BE LIMITED TO THE GREATER OF $100 OR THE FEES PAID BY YOU IN THE LAST 30 DAYS. CLOUDIFY SHALL NOT BE LIABLE FOR LOST DATA, BUSINESS INTERRUPTION, OR INDIRECT DAMAGES.`,
    clauses: [
      {
        id: "c1",
        line: "Section 2: Amendments",
        type: "high",
        title: "Unilateral Contract Changes Without Notice",
        originalText: "Cloudify reserves the right to modify these Terms, pricing, or features at any time without prior notice.",
        plainText: "The company can double prices or remove major features tomorrow without emailing you. By continuing to log in, you automatically agree.",
        recommendation: "Look for services that guarantee 30-day advance notice for price hikes and fee changes."
      },
      {
        id: "c2",
        line: "Section 3: Liability",
        type: "medium",
        title: "Extreme Liability Cap ($100 Max)",
        originalText: "TOTAL AGGREGATE LIABILITY... SHALL BE LIMITED TO THE GREATER OF $100 OR THE FEES PAID...",
        plainText: "If the platform loses your critical database causing $50,000 in damages, their maximum compensation to you is $100.",
        recommendation: "For enterprise use, request a liability limit equal to 12 months of paid subscription fees."
      }
    ],
    timeline: [
      { date: "Monthly", title: "Auto-Renewal Billing", type: "payment" },
      { date: "14 Days Pre-Billing", title: "Cancellation Deadline for Next Month", type: "deadline" }
    ]
  },

  freelance: {
    id: "freelance",
    title: "Freelance Client Service Agreement",
    category: "Services & Contracting",
    description: "Clear milestone payments, 1.5% late payment fee, and conditional IP transfer.",
    riskScore: 30,
    text: `FREELANCE DESIGN & DEVELOPMENT AGREEMENT

PARTIES:
Client: Enterprise Growth LLC
Contractor: DesignWorks Studio

1. SERVICES & DELIVERABLES
Contractor agrees to perform website redesign services specified in Exhibit A. Target completion date: November 15, 2026.

2. COMPENSATION & MILESTONES
Total Fee: $12,000. Payment Schedule:
- 30% ($3,600) upon signing deposit.
- 40% ($4,800) upon Design Prototype Approval.
- 30% ($3,600) upon final project delivery.

3. LATE PAYMENTS
Invoices unpaid after 15 calendar days shall incur interest at 1.5% per month (18% per annum) plus reasonable collection expenses.

4. INTELLECTUAL PROPERTY TRANSFER
All work product and copyright ownership shall transfer to Client ONLY UPON RECEIPT OF FULL FINAL PAYMENT.`,
    clauses: [
      {
        id: "c1",
        line: "Section 4: IP Transfer",
        type: "low",
        title: "IP Transferred Only Upon Full Payment",
        originalText: "All work product and copyright ownership shall transfer to Client ONLY UPON RECEIPT OF FULL FINAL PAYMENT.",
        plainText: "Protects the freelancer by retaining copyright ownership of code and designs until the client pays the final bill in full.",
        recommendation: "Standard protective clause for contractors."
      },
      {
        id: "c2",
        line: "Section 3: Late Fees",
        type: "info",
        title: "1.5% Monthly Late Payment Interest",
        originalText: "Invoices unpaid after 15 calendar days shall incur interest at 1.5% per month...",
        plainText: "If the client delays payment beyond 15 days, late interest accumulates at 18% annually.",
        recommendation: "Fair standard enforcement clause for invoice payment timeliness."
      }
    ],
    timeline: [
      { date: "Project Start", title: "30% Deposit Due ($3,600)", type: "payment" },
      { date: "Prototype Milestone", title: "40% Phase Payment ($4,800)", type: "payment" },
      { date: "Nov 15, 2026", title: "Final Delivery & 30% Balance ($3,600)", type: "deadline" }
    ]
  }
};
