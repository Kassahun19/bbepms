// backend/controllers/analyticsController.js
import { District } from '../models/District.js';
import { Branch } from '../models/Branch.js';
import { User } from '../models/User.js';
import { DailyPerformanceReport } from '../models/DailyPerformanceReport.js';
import { calculateDistrictRankings, capPerformancePercentage, getPerformanceClassification } from '../services/performanceAnalytics.js';

export const analyticsController = {
  async getDistrictRankings(req, res) {
    try {
      const districts = await District.findAll();
      const branches = await Branch.findAll();
      const reports = await DailyPerformanceReport.findAll();
      const rankings = calculateDistrictRankings(districts, reports, branches);
      return res.status(200).json({ success: true, data: rankings });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async getExecutiveOverview(req, res) {
    try {
      const districts = await District.findAll();
      const branches = await Branch.findAll();
      const reports = await DailyPerformanceReport.findAll();
      const approvedReports = reports.filter(r => r.status === 'Approved' || r.status === 'approved');

      const totalDeposits = approvedReports.reduce((acc, r) => acc + (Number(r.deposits_etb || r.depositsETB) || 0), 0);
      const totalFcy = approvedReports.reduce((acc, r) => acc + (Number(r.foreign_currency_etb || r.foreignCurrencyETB) || 0), 0);
      const totalAccounts = approvedReports.reduce((acc, r) => acc + (Number(r.customer_onboarding || r.customerOnboarding) || 0), 0);
      const totalDigital = approvedReports.reduce((acc, r) => acc + (Number(r.digital_financial_services_etb || r.digitalFinancialServicesETB) || 0), 0);

      const targetDeposits = 50000000000; // 50 Billion ETB Bank Target
      const overallAchievement = capPerformancePercentage((totalDeposits / targetDeposits) * 100);

      return res.status(200).json({
        success: true,
        data: {
          totalDistricts: districts.length,
          totalBranches: branches.length,
          totalApprovedReports: approvedReports.length,
          metrics: {
            totalDeposits,
            totalFcy,
            totalAccounts,
            totalDigital
          },
          targetAchievement: {
            targetDeposits,
            actualDeposits: totalDeposits,
            achievementPercent: overallAchievement,
            classification: getPerformanceClassification(overallAchievement)
          }
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
};

export default analyticsController;
