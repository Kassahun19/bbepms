// scripts/doc_parts/part5_kpi_performance.mjs
export function getPart5() {
  return `
## 19. KPI MANAGEMENT SYSTEM & END-TO-END LIFECYCLE

The Bunna Bank EPMS KPI engine operates across a rigorous 19-step lifecycle, from strategic corporate definition to historical archiving:

\`\`\`
[1. KPI Creation] ──> [2. Metric Configuration] ──> [3. Annual Target Setting]
        │
        ▼
[4. District Cascading] ──> [5. Branch Allocation] ──> [6. Recipient Assignment]
        │
        ▼
[7. DB Storage] ──> [8. Target Notification] ──> [9. Frontline Review]
        │
        ▼
[10. Acceptance/Rejection] ──> [11. Daily Actuals Entry] ──> [12. Daily Submission]
        │
        ▼
[13. Manager Review Queue] ──> [14. Mathematical Verification] ──> [15. Approval / Rejection]
        │
        ▼
[16. Employee Scorecard Recalculation] ──> [17. Upward Aggregation (Branch -> District -> Bank)]
        │
        ▼
[18. Executive Scorecard Presentation] ──> [19. Historical Archiving & Audit Sealing]
\`\`\`

1. **KPI Creation:** Metric created in \`kpi_metrics\` table with unique alphanumeric code (e.g., \`DEP_ETB\`).
2. **Metric Configuration:** System assigns BSC category, measurement unit, currency flag, and composite weight.
3. **Annual Target Setting:** Board and CEO establish multi-billion ETB corporate targets.
4. **District Cascading:** CEO and Retail Banking Division allocate regional quotas across the 33 districts.
5. **Branch Allocation:** District Director decomposes regional quota across branches based on branch grade (I to IV).
6. **Recipient Assignment:** Branch Manager assigns specific annual targets to individual frontline staff.
7. **Database Storage:** Target record stored in \`performance_targets\` with status \`'PENDING_ACCEPTANCE'\`.
8. **Target Notification:** Employee dashboard displays an alert prompting formal target agreement review.
9. **Frontline Review:** Employee opens \`EmployeeKpiAgreementPanel.tsx\` to inspect decomposed daily, weekly, and annual benchmarks.
10. **Formal Acceptance / Rejection:** Employee clicks “Accept” (transitions status to \`'ACCEPTED'\`) or “Reject” (requires documented mandatory text).
11. **Daily Actuals Entry:** At close of business, frontline staff enters daily operational metrics in \`SubmitReportSection.tsx\`.
12. **Daily Report Submission:** Report is validated and written to \`daily_performance_reports\` with status \`'Pending'\`.
13. **Manager Review Queue:** Report appears in the Branch Manager’s verification table.
14. **Managerial Verification:** Manager audits slips against Core Banking Finacle batch totals.
15. **One-Click Approval / Rejection:** Manager clicks “Approve” (records reviewer ID and timestamp) or “Reject with Feedback”.
16. **Employee Scorecard Recalculation:** System recalculates achievement %, letter grade (A+ to D), and RAG status.
17. **Upward Aggregation:** Approved actuals are aggregated across the branch, then across the district, and finally bank-wide.
18. **Executive Scorecard Presentation:** Updated rankings appear on District, CEO, and Board dashboards.
19. **Historical Archiving & Audit Sealing:** End-of-fiscal-year actuals are sealed and written to immutable compliance tables.

---

## 20. KPI CALCULATION FORMULAS & TARGET DECOMPOSITION

The calculation engine is implemented in \`/src/utils/performanceCalculations.ts\` and enforced at both client and server tiers.

### 20.1 The 300 Banking Days Calendar Rule
In Ethiopian commercial banking, operational branches operate Monday through Saturday (6 working days per week), excluding national and religious holidays.
$$\\text{Total Banking Working Days per Fiscal Year} = 300 \\text{ Days}$$
$$\\text{Standard Working Days per Month} = 25 \\text{ Days}$$
$$\\text{Standard Working Days per Week} = 6 \\text{ Days}$$

### 20.2 Target Decomposition Formulas
When an annual target ($T_{\\text{annual}}$) is assigned to a branch or staff member, the engine mathematically decomposes it into operational milestones:
$$\\text{Daily Target } (T_{\\text{daily}}) = \\frac{T_{\\text{annual}}}{300}$$
$$\\text{Weekly Target } (T_{\\text{weekly}}) = \\frac{T_{\\text{annual}}}{52}$$
$$\\text{Monthly Target } (T_{\\text{monthly}}) = \\frac{T_{\\text{annual}}}{12}$$
$$\\text{Quarterly Target } (T_{\\text{quarterly}}) = \\frac{T_{\\text{annual}}}{4}$$
$$\\text{Semi-Annual Target } (T_{\\text{semi}}) = \\frac{T_{\\text{annual}}}{2}$$

### 20.3 Achievement Percentage Calculation
For any given metric, raw performance is computed as:
$$P_{\\text{raw}} = \\left( \\frac{\\text{Actual Achievement}}{\\text{Target Baseline}} \\right) \\times 100$$

### 20.4 The 100% Capping & Negative Outflow Preservation Rule
Commercial performance systems often suffer from metric distortion where an anomalous single-day deposit generates an artificial 800% score, masking failure across all other products.
1. **Upper Cap at 100%:**
   $$\\text{If } P_{\\text{raw}} > 100\\%, \\quad P_{\\text{capped}} = 100.0\\%$$
2. **Preservation of Negative Outflows:** In banking, net deposits can be negative (deposit flight or large corporate withdrawals). Converting negative numbers to 0% creates false compliance and hides liquidity risk:
   $$\\text{If } P_{\\text{raw}} < 0\\%, \\quad P_{\\text{capped}} = P_{\\text{raw}} \\quad (\\text{Negative sign and magnitude strictly preserved})$$
3. **TypeScript Implementation (\`performanceClassification.ts\`):**
\`\`\`typescript
export function capPerformancePercentage(rawPercentage: number | null | undefined): number {
  if (rawPercentage === null || rawPercentage === undefined || isNaN(Number(rawPercentage))) {
    return 0;
  }
  const num = Number(rawPercentage);
  if (num > 100) return 100;
  return Number(num.toFixed(1));
}
\`\`\`

### 20.5 Composite Score & Category Weighting
Performance across the 8 core banking KPIs is aggregated using a Balanced Scorecard (BSC) weighted average:
$$S_{\\text{composite}} = \\sum_{i=1}^{8} \\left( P_{\\text{capped}, i} \\times W_{i} \\right)$$
Where the canonical weights are:
* **Deposits Mobilized (\`DEP_ETB\`):** $20\\%$ ($0.20$)
* **Foreign Currency Inflow (\`FCY_USD\`):** $15\\%$ ($0.15$)
* **Digital Financial Services (\`DFS_ETB\`):** $20\\%$ ($0.20$)
* **Customer Account Openings (\`ACC_OPEN\`):** $20\\%$ ($0.20$)
* **Mobile Banking Activations (\`MB_ACT\`):** $6.25\\%$ ($0.0625$)
* **Internet Banking Registrations (\`IB_ACT\`):** $6.25\\%$ ($0.0625$)
* **ATM Debit Cards Issued (\`ATM_CARD\`):** $6.25\\%$ ($0.0625$)
* **Merchant QR / POS Solutions (\`MERCH_POS\`):** $6.25\\%$ ($0.0625$)
$$\\sum W_i = 20 + 15 + 20 + 20 + 6.25 + 6.25 + 6.25 + 6.25 = 100.0\\%$$

---

## 21. PERFORMANCE CLASSIFICATION, STATUS & REMARKS ENGINE

The Bunna Bank EPMS implements a centralized, 5-tier performance classification engine defined in \`/src/utils/performanceClassification.ts\`. Every employee, branch, and district is mapped to an official status tier.

| Tier Key | Score Range | Letter Grade | Official Status | Color & Hex | Badge & Pill | Canonical Meaning & Managerial Remark |
| :--- | :---: | :---: | :--- | :--- | :--- | :--- |
| **\`CRITICAL\`** | $< 0.0\\%$ | **D** | **Critical** | Red (\`#EF4444\`) | 🔴 Critical | **Severe Underperformance / Net Outflow.** Outflows exceed inflows. Immediate managerial intervention and root cause analysis required. |
| **\`UNSATISFACTORY\`**| $0.0\\% - 49.99\\%$| **C** | **Unsatisfactory** | Pink / Rose (\`#F43F5E\`) | 🩷 Unsatisfactory | **Below Standard Expectations.** Significant shortfall against daily benchmark. Action plan needed to avoid escalation. |
| **\`SATISFACTORY\`** | $50.0\\% - 74.99\\%$| **B** | **Satisfactory** | Amber (\`#F59E0B\`) | 🟡 Satisfactory | **Meets Minimum Standards.** Solid operational progress, but improvement is encouraged to achieve strategic targets. |
| **\`EXCELLENT\`** | $75.0\\% - 89.99\\%$| **A** | **Excellent** | Green (\`#10B981\`) | 🟢 Excellent | **Meets or Exceeds Expectations.** Strong mobilization across core banking channels. Good progress toward annual target. |
| **\`OUTSTANDING\`** | $90.0\\% - 100.0\\%$| **A+** | **Outstanding** | Emerald (\`#059669\`) | 🟢✨ Outstanding | **Exceptional Operational Performance.** Consistently surpasses daily quotas. Benchmark candidate for recognition. |

---

## 22. PERFORMANCE AGGREGATION ENGINE

Performance metrics aggregate hierarchically from frontline staff up to the Board of Directors:

### 22.1 Employee to Branch Rollup
* **Condition:** A report is included in the branch actual total **ONLY if \`status = 'Approved'\`**.
* **Formula:**
$$\\text{Branch Actual} = \\sum_{\\text{Approved Reports}} \\text{Employee Actual}$$
$$\\text{Branch Target} = \\sum \\text{Employee Targets}$$
$$\\text{Branch Achievement } \\% = \\min\\left(100.0, \\left( \\frac{\\text{Branch Actual}}{\\text{Branch Target}} \\right) \\times 100\\right)$$

### 22.2 Branch to District Rollup
* **Formula:**
$$\\text{District Actual} = \\sum_{b=1}^{N} \\text{Branch Actual}_{b}$$
$$\\text{District Target} = \\sum_{b=1}^{N} \\text{Branch Target}_{b}$$
$$\\text{District Achievement } \\% = \\min\\left(100.0, \\left( \\frac{\\text{District Actual}}{\\text{District Target}} \\right) \\times 100\\right)$$

### 22.3 District to Bank-Wide Rollup (CEO & Board)
* **Formula:**
$$\\text{Bank-Wide Total Actual} = \\sum_{d=1}^{33} \\text{District Actual}_{d}$$
$$\\text{Bank-Wide Target} = \\sum_{d=1}^{33} \\text{District Target}_{d}$$
$$\\text{Bank-Wide National Achievement } \\% = \\min\\left(100.0, \\left( \\frac{\\text{Bank-Wide Total Actual}}{\\text{Bank-Wide Target}} \\right) \\times 100\\right)$$
`;
}
