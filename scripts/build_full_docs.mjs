// scripts/build_full_docs.mjs
import fs from 'fs';
import path from 'path';

import { getPart1 } from './doc_parts/part1_overview_hierarchy.mjs';
import { getPart2 } from './doc_parts/part2_database_sql.mjs';
import { getPart3 } from './doc_parts/part3_api_auth.mjs';
import { getPart4 } from './doc_parts/part4_frontend_dashboards.mjs';
import { getPart5 } from './doc_parts/part5_kpi_performance.mjs';
import { getPart6 } from './doc_parts/part6_management_tiers.mjs';
import { getPart7 } from './doc_parts/part7_config_business.mjs';
import { getPart8 } from './doc_parts/part8_maps_matrices.mjs';
import { getPart9 } from './doc_parts/part9_security_dev_test.mjs';
import { getPart10 } from './doc_parts/part10_system_maps_stats.mjs';

const titleAndToc = `# BUNNA BANK S.C.
# DAILY KPI PERFORMANCE MANAGEMENT SYSTEM (EPMS)
## Complete Technical Architecture, Database Reference, API Specification & Engineering Manual

> **Document Classification:** Internal Technical Documentation & Master Engineering Specification  
> **Target Audience:** Software Architects, Full-Stack Engineers, Database Administrators, Security Auditors & Executive Stakeholders  
> **System Name:** Bunna Bank Daily KPI Performance Management System (EPMS)  
> **Version:** 2.6.0-PROD  
> **Date of Audit:** September 10, 2026  
> **Source Repository:** \`ai-studio-bunnabankscepms\`  
> **Document Verification:** Codebase-inspected, zero-invention, fully referenced technical specification

---

## TABLE OF CONTENTS

1. [SYSTEM OVERVIEW](#1-system-overview)
2. [ORGANIZATIONAL HIERARCHY](#2-organizational-hierarchy)
3. [HIERARCHICAL DATA ACCESS](#3-hierarchical-data-access)
4. [ROLE & PERMISSION MATRIX](#4-role--permission-matrix)
5. [COMPLETE PROJECT STRUCTURE](#5-complete-project-structure)
6. [COMPLETE TECHNOLOGY STACK](#6-complete-technology-stack)
7. [COMPLETE DATABASE DOCUMENTATION](#7-complete-database-documentation)
8. [ORGANIZATIONAL DATABASE STRUCTURE](#8-organizational-database-structure)
9. [COMPLETE DATABASE RELATIONSHIPS / ERD](#9-complete-database-relationships--erd)
10. [ALL SQL QUERIES](#10-all-sql-queries-inventory)
11. [COMPLETE API DOCUMENTATION](#11-complete-master-api-documentation)
12. [DETAILED API DOCUMENTATION](#12-detailed-api-endpoint-specifications)
13. [API AUTHORIZATION BY ORGANIZATIONAL LEVEL](#13-api-authorization-by-organizational-level)
14. [HTTP METHODS](#14-http-methods-usage-reference)
15. [AUTHENTICATION](#15-authentication-architecture)
16. [AUTHORIZATION](#16-authorization-architecture)
17. [FRONTEND DOCUMENTATION](#17-frontend-architecture--component-reference)
18. [DASHBOARD DOCUMENTATION](#18-role-specific-dashboard-architecture)
19. [KPI MANAGEMENT SYSTEM](#19-kpi-management-system--end-to-end-lifecycle)
20. [KPI CALCULATION FORMULAS](#20-kpi-calculation-formulas--target-decomposition)
21. [PERFORMANCE REMARKS](#21-performance-classification-status--remarks-engine)
22. [PERFORMANCE AGGREGATION](#22-performance-aggregation-engine)
23. [EMPLOYEE MANAGEMENT](#23-employee-management-subsystem)
24. [BRANCH MANAGEMENT](#24-branch-management-subsystem)
25. [DISTRICT MANAGEMENT](#25-district-management-subsystem)
26. [CHIEF-LEVEL MANAGEMENT](#26-chief-level-management-subsystem)
27. [CEO-LEVEL MANAGEMENT](#27-ceo-level-management-subsystem)
28. [BOARD-LEVEL MANAGEMENT](#28-board-level-management-subsystem)
29. [SUPER ADMIN MANAGEMENT](#29-super-admin-management-subsystem)
30. [CRUD OPERATIONS](#30-master-crud-operations-matrix)
31. [FRONTEND → BACKEND → DATABASE FLOW](#31-frontend--backend--database-end-to-end-flow)
32. [ORGANIZATIONAL REPORTING FLOW](#32-organizational-reporting-flow)
33. [ENVIRONMENT VARIABLES](#33-environment-variables-specification)
34. [CONFIGURATION FILES](#34-configuration-files-reference)
35. [DEPENDENCIES](#35-dependencies--package-inventory)
36. [BUSINESS RULES](#36-canonical-business-rules)
37. [STATUS VALUES](#37-canonical-status-values--enums)
38. [IMPORTANT FUNCTIONS](#38-important-functions-algorithms--logic)
39. [COMPLETE ROUTE MAP](#39-complete-route-map)
40. [COMPLETE API SUMMARY](#40-complete-api-summary-table)
41. [COMPLETE DATABASE SUMMARY](#41-consolidated-database-summary-table)
42. [COMPLETE SQL SUMMARY](#42-complete-sql-queries-summary)
43. [FRONTEND → API MAPPING](#43-frontend--api-mapping-matrix)
44. [FEATURE INVENTORY](#44-feature-inventory--implementation-status)
45. [KNOWN ISSUES AND POTENTIAL PROBLEMS](#45-known-issues-technical-debt--suggested-fixes)
46. [SECURITY DOCUMENTATION](#46-security-architecture--vulnerability-mitigation)
47. [DEPLOYMENT DOCUMENTATION](#47-production-deployment-architecture)
48. [LOCAL DEVELOPMENT SETUP](#48-local-development-setup-guide-vs-code--xampp)
49. [TESTING](#49-automated--manual-testing-status)
50. [DEBUGGING GUIDE](#50-comprehensive-practical-debugging-guide)
51. [IMPORTANT FILE REFERENCE](#51-critical-files-reference)
52. [LEARNING NOTES](#52-core-engineering-concepts--learning-notes)
53. [COMPLETE SYSTEM DATA FLOW](#53-complete-system-data-flow)
54. [COMPLETE SYSTEM ARCHITECTURE DIAGRAM](#54-complete-system-architecture-diagram)
55. [GLOSSARY](#55-comprehensive-system-glossary)
56. [FINAL MASTER SYSTEM MAP](#56-final-master-system-map)
57. [FINAL ACCURACY AUDIT](#57-final-accuracy-audit--cross-check)
58. [DOCUMENTATION STATISTICS](#58-documentation-statistics)

---
`;

const fullDocument = [
  titleAndToc,
  getPart1(),
  getPart2(),
  getPart3(),
  getPart4(),
  getPart5(),
  getPart6(),
  getPart7(),
  getPart8(),
  getPart9(),
  getPart10()
].join('\n\n');

const outputPath = path.resolve('DAILY_KPI_PERFORMANCE_MANAGEMENT_SYSTEM_DOCUMENTATION.md');
fs.writeFileSync(outputPath, fullDocument, 'utf8');

console.log(`Master Documentation successfully compiled to: ${outputPath}`);
console.log(`Total Character Count: ${fullDocument.length}`);
console.log(`Total Line Count: ${fullDocument.split('\n').length}`);
