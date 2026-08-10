import React, { useState } from 'react';
import { Code, Database, X, Copy, Check } from 'lucide-react';

interface ApiDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiDocsModal: React.FC<ApiDocsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'api' | 'sql'>('api');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlSchema = `
-- ========================================================
-- BUNNA BANK S.C. EPMS NORMALIZED MYSQL DATABASE SCHEMA
-- ========================================================

CREATE DATABASE IF NOT EXISTS bunna_epms_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bunna_epms_db;

-- 1. DISTRICTS
CREATE TABLE districts (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  region VARCHAR(100) NOT NULL,
  manager_name VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. BRANCHES
CREATE TABLE branches (
  id VARCHAR(64) PRIMARY KEY,
  district_id VARCHAR(64) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  type ENUM('Grade I', 'Grade II', 'Grade III', 'Grade IV', 'Special') NOT NULL,
  location VARCHAR(150),
  manager_name VARCHAR(150),
  FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. USERS
CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  role ENUM('ADMINISTRATOR', 'MANAGER', 'EMPLOYEE') NOT NULL,
  role_type ENUM('Managerial', 'Non-Managerial') NOT NULL,
  district_id VARCHAR(64),
  branch_id VARCHAR(64),
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(30) UNIQUE NOT NULL,
  status ENUM('Active', 'Suspended', 'Inactive') DEFAULT 'Active',
  FOREIGN KEY (district_id) REFERENCES districts(id),
  FOREIGN KEY (branch_id) REFERENCES branches(id)
) ENGINE=InnoDB;

-- 4. DAILY PERFORMANCE REPORTS
CREATE TABLE daily_performance_reports (
  id VARCHAR(64) PRIMARY KEY,
  employee_id VARCHAR(64) NOT NULL,
  branch_id VARCHAR(64) NOT NULL,
  report_date DATE NOT NULL,
  day_of_week VARCHAR(15) NOT NULL,
  deposits_etb DECIMAL(18,2) DEFAULT 0.00,
  fcy_etb DECIMAL(18,2) DEFAULT 0.00,
  dfs_etb DECIMAL(18,2) DEFAULT 0.00,
  account_openings INT DEFAULT 0,
  mobile_activations INT DEFAULT 0,
  internet_activations INT DEFAULT 0,
  merchant_activations INT DEFAULT 0,
  atm_cards_issued INT DEFAULT 0,
  status ENUM('Draft', 'Pending', 'Approved', 'Returned', 'Rejected', 'Suspended') DEFAULT 'Pending',
  manager_comment TEXT,
  reviewed_by VARCHAR(150),
  reviewed_at TIMESTAMP NULL,
  UNIQUE KEY unique_employee_date (employee_id, report_date),
  FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
) ENGINE=InnoDB;
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#6B3F1D] border border-[#C89A2B]/40 rounded-3xl shadow-2xl text-white overflow-hidden p-6 relative">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <Code className="w-6 h-6 text-[#C89A2B]" />
          <div>
            <h3 className="font-extrabold text-xl text-white">Developer API & MySQL Schema Docs</h3>
            <p className="text-xs text-[#C89A2B]">Bunna Bank EPMS Technical Specifications</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex space-x-2 border-b border-white/10 pb-3 mb-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('api')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'api' ? 'bg-[#C89A2B] text-[#6B3F1D]' : 'bg-white/10 text-gray-200 hover:bg-white/20'
            }`}
          >
            REST API Endpoints
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'sql' ? 'bg-[#C89A2B] text-[#6B3F1D]' : 'bg-white/10 text-gray-200 hover:bg-white/20'
            }`}
          >
            MySQL Database DDL Schema
          </button>
        </div>

        {activeTab === 'api' ? (
          <div className="space-y-3 text-xs max-h-[60vh] overflow-y-auto pr-2">
            <div className="p-3 bg-[#4A2C17] rounded-xl border border-white/10">
              <p className="font-mono font-bold text-[#C89A2B]">POST /api/auth/login</p>
              <p className="text-gray-200 mt-1">Authenticates staff credentials and returns JWT bearer token + user profile.</p>
            </div>
            <div className="p-3 bg-[#4A2C17] rounded-xl border border-white/10">
              <p className="font-mono font-bold text-[#C89A2B]">POST /api/auth/register</p>
              <p className="text-gray-200 mt-1">5-Step user account registration wizard with District/Branch validation.</p>
            </div>
            <div className="p-3 bg-[#4A2C17] rounded-xl border border-white/10">
              <p className="font-mono font-bold text-[#C89A2B]">POST /api/reports/submit</p>
              <p className="text-gray-200 mt-1">Submits daily financial & digital metrics. Enforces working day & holiday rules.</p>
            </div>
            <div className="p-3 bg-[#4A2C17] rounded-xl border border-white/10">
              <p className="font-mono font-bold text-[#C89A2B]">POST /api/reports/manager-action</p>
              <p className="text-gray-200 mt-1">Executes bulk report approvals, returns, rejections, suspensions, and deletions.</p>
            </div>
            <div className="p-3 bg-[#4A2C17] rounded-xl border border-white/10">
              <p className="font-mono font-bold text-[#C89A2B]">POST /api/ai/assistant</p>
              <p className="text-gray-200 mt-1">Queries Gemini LLM with system RAG context for performance insight generation.</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={copyToClipboard}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-[#C89A2B] text-[#6B3F1D] font-bold text-[10px] flex items-center space-x-1"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied SQL' : 'Copy DDL'}</span>
            </button>
            <pre className="p-4 bg-black/60 rounded-2xl border border-white/10 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-[55vh]">
              {sqlSchema}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
};
