import { Request, Response } from 'express';
import { performanceTargetModel } from '../models/performanceTargetModel';
import { successResponse, errorResponse } from '../utils/responseWrapper';
import { logAuditEvent } from '../services/auditService';

export const targetController = {
  async getAll(req: Request, res: Response) {
    try {
      const { employeeId, branchId, districtId, kpiId, year } = req.query;
      const targets = await performanceTargetModel.findAll({
        employeeId: employeeId as string,
        branchId: branchId as string,
        districtId: districtId as string,
        kpiId: kpiId as string,
        year: year ? Number(year) : undefined
      });
      return successResponse(res, targets);
    } catch (err: any) {
      return errorResponse(res, err.message);
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const target = await performanceTargetModel.findById(req.params.id);
      if (!target) return errorResponse(res, 'Performance target not found', 404);
      return successResponse(res, target);
    } catch (err: any) {
      return errorResponse(res, err.message);
    }
  },

  async create(req: any, res: Response) {
    try {
      const body = req.body;
      if (!body.kpi_id && !body.kpiId) {
        return errorResponse(res, 'KPI ID is required', 400);
      }

      const created = await performanceTargetModel.create({
        ...body,
        kpi_id: body.kpi_id || body.kpiId,
        employee_id: body.employee_id || body.employeeId,
        branch_id: body.branch_id || body.branchId,
        district_id: body.district_id || body.districtId,
        fiscal_year_id: body.fiscal_year_id || body.fiscalYearId || 'FY-2026-27',
        target_value: Number(body.target_value ?? body.targetValue ?? 0),
        annual_target: Number(body.annual_target ?? body.annualTarget ?? body.target_value ?? 0),
        assigned_by: req.user?.name || 'Supervisor'
      });

      await logAuditEvent({
        userId: req.user?.userId || 'SUPERVISOR',
        action: 'CREATE_TARGET',
        entityType: 'PerformanceTarget',
        entityId: created.target_id,
        details: `Assigned KPI target for KPI ${created.kpi_id}`
      });

      return successResponse(res, created, 'Performance target created successfully', 201);
    } catch (err: any) {
      return errorResponse(res, err.message);
    }
  }
};
