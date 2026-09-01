# Bunna Bank S.C. - EPMS Backend

Enterprise Daily KPI Performance Management System (EPMS) REST API & Database Services.

## Architecture
- **Runtime**: Node.js 20+ with TypeScript and Express
- **Database**: MySQL 8.0+ / PostgreSQL (Supabase) with parameterized connection pooling
- **Security**: JWT Authentication (RBAC), Helmet, Bcrypt password hashing, and Audit Trail logging

## Folder Structure
```
Backend/
├── sql/
│   ├── 01_schema.sql         # Relational database table definitions
│   └── 02_seed.sql           # Initial branches, districts, and KPI seed data
├── src/
│   ├── config/
│   │   ├── env.ts            # Environment variables & constants
│   │   ├── db.ts             # Prisma / Supabase database client
│   │   └── mysqlDb.ts        # MySQL connection pool & health checks
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── kpiMetricController.ts
│   │   ├── dailyReportController.ts
│   │   ├── targetController.ts
│   │   ├── organizationController.ts
│   │   └── analyticsController.ts
│   ├── middleware/
│   │   ├── auth.ts           # JWT token verification & role enforcement
│   │   ├── errorHandler.ts   # Centralized error handler
│   │   └── validator.ts      # Request body & param validation
│   ├── models/
│   │   ├── userModel.ts
│   │   ├── kpiMetricModel.ts
│   │   ├── performanceTargetModel.ts
│   │   ├── dailyReportModel.ts
│   │   ├── branchModel.ts
│   │   └── districtModel.ts
│   ├── routes/
│   │   ├── index.ts          # Central router
│   │   ├── authRoutes.ts
│   │   ├── kpiMetricRoutes.ts
│   │   ├── dailyReportRoutes.ts
│   │   ├── targetRoutes.ts
│   │   ├── branchRoutes.ts
│   │   ├── districtRoutes.ts
│   │   └── analyticsRoutes.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── auditService.ts
│   │   └── performanceAnalytics.ts
│   ├── utils/
│   │   ├── responseWrapper.ts
│   │   └── dateUtils.ts
│   ├── app.ts                # Express application assembly
│   └── server.ts             # Server entrypoint
├── .env.example
├── package.json
└── README.md
```

## Running the Server
```bash
npm install
npm run dev
```
