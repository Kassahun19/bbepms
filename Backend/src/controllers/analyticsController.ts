import { Request, Response } from 'express';
import { dailyReportModel } from '../models/dailyReportModel';
import { successResponse, errorResponse } from '../utils/responseWrapper';
import { calculateBranchRankings, calculateDistrictRankings } from '../services/performanceAnalytics';

export const analyticsController = {
  async getDashboardSummary(req: Request, res: Response) {
    try {
      const { branchId, districtId, fiscalYearId } = req.query;
      const reports = await dailyReportModel.findAll({
        branchId: branchId as string,
        districtId: districtId as string,
        fiscalYearId: fiscalYearId as string
      });

      const approvedReports = reports.filter(r => r.status === 'Approved' || r.status === 'approved');
      const totalDeposits = approvedReports.reduce((sum, r) => sum + Number(r.deposits_etb || 0), 0);
      const totalFcy = approvedReports.reduce((sum, r) => sum + Number(r.foreign_currency_etb || 0), 0);
      const totalDfs = approvedReports.reduce((sum, r) => sum + Number(r.digital_financial_services_etb || 0), 0);
      const totalAccounts = approvedReports.reduce((sum, r) => sum + Number(r.customer_onboarding || 0), 0);
      const totalMobileBanking = approvedReports.reduce((sum, r) => sum + Number(r.mobile_banking || 0), 0);
      const totalAtmCards = approvedReports.reduce((sum, r) => sum + Number(r.atm_debit_cards || 0), 0);

      return successResponse(res, {
        summary: {
          totalDeposits,
          totalFcy,
          totalDfs,
          totalAccounts,
          totalMobileBanking,
          totalAtmCards,
          totalApprovedReports: approvedReports.length,
          totalPendingReports: reports.filter(r => r.status === 'Pending').length
        }
      });
    } catch (err: any) {
      return errorResponse(res, err.message);
    }
  },

  async getRankings(req: Request, res: Response) {
    try {
      const { type = 'branches' } = req.query;
      const reports = await dailyReportModel.findAll();
      
      let rankings: any[] = [];
      if (type === 'districts') {
        rankings = calculateDistrictRankings(reports as any, [], []);
      } else {
        rankings = calculateBranchRankings(reports as any, [], []);
      }

      return successResponse(res, rankings);
    } catch (err: any) {
      return errorResponse(res, err.message);
    }
  }
};
