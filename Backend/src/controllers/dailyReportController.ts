import { Request, Response } from 'express';
import { dailyReportModel } from '../models/dailyReportModel';
import { successResponse, errorResponse } from '../utils/responseWrapper';
import { getFiscalYearForDate, getDayOfWeekFromDate } from '../utils/dateUtils';
import { logAuditEvent } from '../services/auditService';

export const dailyReportController = {
  async getAll(req: Request, res: Response) {
    try {
      const { employeeId, branchId, districtId, fiscalYearId, startDate, endDate, status } = req.query;
      const reports = await dailyReportModel.findAll({
        employeeId: employeeId as string,
        branchId: branchId as string,
        districtId: districtId as string,
        fiscalYearId: fiscalYearId as string,
        startDate: startDate as string,
        endDate: endDate as string,
        status: status as string
      });
      return successResponse(res, reports);
    } catch (err: any) {
      return errorResponse(res, err.message);
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const report = await dailyReportModel.findById(req.params.id);
      if (!report) return errorResponse(res, 'Daily performance report not found', 404);
      return successResponse(res, report);
    } catch (err: any) {
      return errorResponse(res, err.message);
    }
  },

  async submitReport(req: any, res: Response) {
    try {
      const body = req.body;
      const reportDate = body.report_date || body.reportDate || new Date().toISOString().split('T')[0];
      const fiscalYearId = body.fiscal_year_id || body.fiscalYearId || getFiscalYearForDate(reportDate);
      const dayOfWeek = body.day_of_week || body.dayOfWeek || getDayOfWeekFromDate(reportDate);

      const saved = await dailyReportModel.createOrUpdate({
        ...body,
        report_date: reportDate,
        fiscal_year_id: fiscalYearId,
        day_of_week: dayOfWeek,
        employee_id: body.employee_id || body.employeeId || req.user?.userId,
        employee_name: body.employee_name || body.employeeName || req.user?.name || 'Officer',
        branch_id: body.branch_id || body.branchId || req.user?.branchId || 'BR-360',
        branch_name: body.branch_name || body.branchName || 'Hamusit Branch',
        status: body.status || 'Pending'
      });

      await logAuditEvent({
        userId: req.user?.userId || saved.employee_id,
        action: 'SUBMIT_DAILY_REPORT',
        entityType: 'DailyReport',
        entityId: saved.report_id,
        details: `Submitted daily KPI report for date ${reportDate}`
      });

      return successResponse(res, saved, 'Daily performance report submitted successfully', 201);
    } catch (err: any) {
      return errorResponse(res, err.message);
    }
  },

  async reviewReport(req: any, res: Response) {
    try {
      const { status, managerComment } = req.body;
      const reviewerName = req.user?.name || 'Branch Manager';

      if (!['Approved', 'Rejected', 'Returned', 'Pending'].includes(status)) {
        return errorResponse(res, 'Invalid review status', 400);
      }

      const updated = await dailyReportModel.updateStatus(req.params.id, status, reviewerName, managerComment);
      if (!updated) return errorResponse(res, 'Report not found', 404);

      await logAuditEvent({
        userId: req.user?.userId || 'MANAGER',
        action: `REVIEW_REPORT_${status.toUpperCase()}`,
        entityType: 'DailyReport',
        entityId: req.params.id,
        details: `Report ${req.params.id} marked as ${status} by ${reviewerName}`
      });

      return successResponse(res, updated, `Report marked as ${status}`);
    } catch (err: any) {
      return errorResponse(res, err.message);
    }
  }
};
