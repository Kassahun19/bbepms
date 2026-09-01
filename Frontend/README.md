# Bunna Bank S.C. - EPMS Frontend

Enterprise Daily KPI Performance Management System React Web Application.

## Architecture
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State & Context**: Modular AuthContext, custom hooks for KPIs, Daily Reports, and Analytics
- **API Client**: Strongly typed Fetch client with automatic JWT token attachment

## Folder Structure
```
Frontend/
├── src/
│   ├── config/
│   │   └── constants.ts          # App configuration, currency, storage keys
│   ├── types/
│   │   └── index.ts              # Shared TypeScript data models
│   ├── utils/
│   │   ├── formatters.ts         # ETB, percentages, dates, numbers
│   │   └── storage.ts            # LocalStorage auth management
│   ├── services/
│   │   ├── apiClient.ts          # Base HTTP client with JWT interceptor
│   │   ├── authService.ts        # Login & user profile endpoints
│   │   ├── kpiMetricService.ts   # KPI metrics endpoints (1:1 with backend routes)
│   │   ├── dailyReportService.ts # Daily performance report submission & review
│   │   ├── targetService.ts      # Target allocation endpoints
│   │   └── organizationService.ts# Branches & districts endpoints
│   ├── context/
│   │   └── AuthContext.tsx       # Global session & authentication state
│   ├── hooks/
│   │   ├── useAuth.ts            # Authentication hook
│   │   ├── useKpis.ts            # KPI retrieval hook
│   │   └── useDailyReports.ts    # Daily reports retrieval hook
├── .env.example
├── package.json
└── README.md
```

## Running the Frontend
```bash
npm install
npm run dev
```
