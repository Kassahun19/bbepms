import { Request, Response } from 'express';
import { kpiMetricModel } from '../models/kpiMetricModel';
import { successResponse, errorResponse } from '../utils/responseWrapper';
import { logAuditEvent } from '../services/auditService';

export const kpiMetricController = {
  async getAll(req: Request, res: Response) {
    try {
      const { category, status } = req.query;
      const metrics = await kpiMetricModel.findAll({
        category: category as string,
        status: status as string
      });
      return successResponse(res, metrics);
    } catch (err: any) {
      return errorResponse(res, err.message);
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const metric = await kpiMetricModel.findById(req.params.id);
      if (!metric) return errorResponse(res, 'KPI metric not found', 404);
      return successResponse(res, metric);
    } catch (err: any) {
      return errorResponse(res, err.message);
    }
  },

  async create(req: any, res: Response) {
    try {
      const { code, name, category, unit, weight, description } = req.body;
      if (!code || !name || !category || !unit) {
        return errorResponse(res, 'Code, name, category, and unit are required', 400);
      }

      const created = await kpiMetricModel.create({
        code,
        name,
        category,
        unit,
        weight: weight ? Number(weight) : 10,
        description
      });

      await logAuditEvent({
        userId: req.user?.userId || 'SYSTEM',
        action: 'CREATE_KPI_METRIC',
        entityType: 'KPI_Metric',
        entityId: created.kpi_id,
        details: `Created KPI metric: ${created.name} (${created.code})`
      });

      return successResponse(res, created, 'KPI metric created', 201);
    } catch (err: any) {
      return errorResponse(res, err.message);
    }
  },

  async update(req: any, res: Response) {
    try {
      const updated = await kpiMetricModel.update(req.params.id, req.body);
      if (!updated) return errorResponse(res, 'KPI metric not found', 404);

      await logAuditEvent({
        userId: req.user?.userId || 'SYSTEM',
        action: 'UPDATE_KPI_METRIC',
        entityType: 'KPI_Metric',
        entityId: req.params.id,
        details: `Updated KPI metric ID: ${req.params.id}`
      });

      return successResponse(res, updated, 'KPI metric updated');
    } catch (err: any) {
      return errorResponse(res, err.message);
    }
  },

  async delete(req: any, res: Response) {
    try {
      const success = await kpiMetricModel.delete(req.params.id);
      if (!success) return errorResponse(res, 'KPI metric not found or already deleted', 404);

      await logAuditEvent({
        userId: req.user?.userId || 'SYSTEM',
        action: 'DELETE_KPI_METRIC',
        entityType: 'KPI_Metric',
        entityId: req.params.id,
        details: `Deleted KPI metric ID: ${req.params.id}`
      });

      return successResponse(res, { deleted: true }, 'KPI metric deleted');
    } catch (err: any) {
      return errorResponse(res, err.message);
    }
  }
};
