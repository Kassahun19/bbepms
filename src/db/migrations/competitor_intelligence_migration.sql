-- =============================================================================
-- DATABASE MIGRATION SCRIPT: Banking Competitor Intelligence Module
-- Target: Bunna Bank S.C. EPMS Database / Cloud SQL / PostgreSQL / Firestore Schema
-- =============================================================================

-- 1. COMMERCIAL BANKS TABLE
CREATE TABLE IF NOT EXISTS commercial_banks (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    short_name VARCHAR(50) NOT NULL,
    established_year INT,
    logo_url TEXT,
    swift_code VARCHAR(20),
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    total_branches_nationwide INT DEFAULT 0,
    color VARCHAR(20) DEFAULT '#003399',
    is_bunna BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_commercial_banks_code ON commercial_banks(code);
CREATE INDEX IF NOT EXISTS idx_commercial_banks_status ON commercial_banks(status);

-- 2. COMPETITOR BRANCHES TABLE (Mapped to Districts, Area Offices, and Regions)
CREATE TABLE IF NOT EXISTS competitor_branches (
    id VARCHAR(50) PRIMARY KEY,
    bank_id VARCHAR(50) NOT NULL REFERENCES commercial_banks(id) ON DELETE CASCADE,
    bank_name VARCHAR(150) NOT NULL,
    bank_code VARCHAR(20) NOT NULL,
    branch_name VARCHAR(150) NOT NULL,
    sol_id VARCHAR(50),
    region VARCHAR(100) NOT NULL,
    zone VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    woreda VARCHAR(100),
    district_id VARCHAR(50), -- FK to internal districts table if applicable
    district_name VARCHAR(150) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    opening_date DATE,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_competitor_branches_city ON competitor_branches(city);
CREATE INDEX IF NOT EXISTS idx_competitor_branches_bank ON competitor_branches(bank_id);
CREATE INDEX IF NOT EXISTS idx_competitor_branches_district ON competitor_branches(district_name);

-- 3. COMPETITOR KPIS & BPI WEIGHT CONFIGURATION TABLE
CREATE TABLE IF NOT EXISTS competitor_kpis (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Financial', 'Customer & Growth', 'Digital Banking', 'Profitability & Operations')),
    unit VARCHAR(20) NOT NULL CHECK (unit IN ('ETB', 'Count', 'Percentage', 'Score')),
    bpi_weight DECIMAL(5, 2) NOT NULL DEFAULT 10.0, -- Default weight percentage in Banking Performance Index
    description TEXT,
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. COMPETITOR MONTHLY PERFORMANCE TABLE
CREATE TABLE IF NOT EXISTS competitor_monthly_performance (
    id VARCHAR(50) PRIMARY KEY,
    branch_id VARCHAR(50) NOT NULL REFERENCES competitor_branches(id) ON DELETE CASCADE,
    bank_id VARCHAR(50) NOT NULL REFERENCES commercial_banks(id) ON DELETE CASCADE,
    bank_name VARCHAR(150) NOT NULL,
    bank_code VARCHAR(20) NOT NULL,
    branch_name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    district_name VARCHAR(150) NOT NULL,
    year INT NOT NULL,
    month INT NOT NULL,
    period VARCHAR(10) NOT NULL, -- Format: YYYY-MM
    
    -- Performance Metrics
    total_customers INT DEFAULT 0,
    new_customers INT DEFAULT 0,
    deposits_etb DECIMAL(18, 2) DEFAULT 0.00,
    casa_etb DECIMAL(18, 2) DEFAULT 0.00,
    loan_portfolio_etb DECIMAL(18, 2) DEFAULT 0.00,
    mobile_banking_users INT DEFAULT 0,
    internet_banking_users INT DEFAULT 0,
    atm_users INT DEFAULT 0,
    pos_users INT DEFAULT 0,
    qr_users INT DEFAULT 0,
    revenue_etb DECIMAL(18, 2) DEFAULT 0.00,
    profit_etb DECIMAL(18, 2) DEFAULT 0.00,
    cost_to_income_ratio DECIMAL(5, 2) DEFAULT 0.00,
    customer_satisfaction_score DECIMAL(5, 2) DEFAULT 0.00,
    complaint_resolution_rate DECIMAL(5, 2) DEFAULT 0.00,
    employee_productivity_score DECIMAL(5, 2) DEFAULT 0.00,
    branch_growth_rate DECIMAL(5, 2) DEFAULT 0.00,
    market_share_percentage DECIMAL(5, 2) DEFAULT 0.00,
    
    -- Calculated BPI
    bpi_score DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_branch_period UNIQUE (branch_id, period)
);

CREATE INDEX IF NOT EXISTS idx_perf_period_city ON competitor_monthly_performance(period, city);
CREATE INDEX IF NOT EXISTS idx_perf_bpi_score ON competitor_monthly_performance(bpi_score DESC);

-- 5. AREA COMPARISON & BRANCH RANKINGS HISTORY TABLE
CREATE TABLE IF NOT EXISTS area_rankings_history (
    id VARCHAR(50) PRIMARY KEY,
    area_name VARCHAR(100) NOT NULL,
    district_name VARCHAR(150) NOT NULL,
    region VARCHAR(100) NOT NULL,
    period VARCHAR(10) NOT NULL,
    total_banks INT DEFAULT 0,
    total_branches INT DEFAULT 0,
    bunna_rank INT DEFAULT 0,
    bunna_bpi_score DECIMAL(5, 2) DEFAULT 0.00,
    rankings_json JSONB NOT NULL, -- Full detailed ranking array
    gap_analysis_json JSONB NOT NULL, -- Full gap analysis details
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. AI RECOMMENDATIONS & INSIGHTS CACHE TABLE
CREATE TABLE IF NOT EXISTS ai_competitor_insights (
    id VARCHAR(50) PRIMARY KEY,
    area_name VARCHAR(100) NOT NULL,
    bunna_rank INT NOT NULL,
    total_competitors INT NOT NULL,
    summary TEXT NOT NULL,
    key_weakness_kpi VARCHAR(150),
    fastest_growing_competitor VARCHAR(150),
    urgent_attention_branch VARCHAR(150),
    manager_first_step TEXT,
    recommendations_json JSONB NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. COMPETITOR ALERTS TABLE
CREATE TABLE IF NOT EXISTS competitor_alerts (
    id VARCHAR(50) PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('RANK_LOSS', 'COMPETITOR_OVERTAKE', 'DEPOSIT_DECLINE', 'CUSTOMER_SLOWDOWN', 'DIGITAL_DROP', 'KPI_MISSED')),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    area_name VARCHAR(100) NOT NULL,
    branch_name VARCHAR(150) NOT NULL,
    severity VARCHAR(20) DEFAULT 'MEDIUM' CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM')),
    is_read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Ethiopian Commercial Banks
INSERT INTO commercial_banks (id, code, name, short_name, established_year, swift_code, total_branches_nationwide, color, is_bunna)
VALUES 
('BNK-BUNNA', 'BUNNA', 'Bunna Bank S.C.', 'Bunna Bank', 2009, 'BUNAETAA', 542, '#C89A2B', TRUE),
('BNK-CBE', 'CBE', 'Commercial Bank of Ethiopia', 'CBE', 1942, 'CBETETAA', 1920, '#800080', FALSE),
('BNK-DASHEN', 'DASHEN', 'Dashen Bank S.C.', 'Dashen Bank', 1995, 'DASHETAA', 850, '#003399', FALSE),
('BNK-AWASH', 'AWASH', 'Awash Bank S.C.', 'Awash Bank', 1994, 'AWASHTAA', 910, '#008000', FALSE),
('BNK-BOA', 'BOA', 'Bank of Abyssinia S.C.', 'Abyssinia Bank', 1996, 'ABYSETAA', 820, '#CC0000', FALSE),
('BNK-COOP', 'COOP', 'Cooperative Bank of Oromia S.C.', 'Coop Bank', 2004, 'CBORETAA', 740, '#00BFFF', FALSE)
ON CONFLICT (id) DO NOTHING;
