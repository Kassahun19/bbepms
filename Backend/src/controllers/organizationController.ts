import { Request, Response } from 'express';
import { branchModel } from '../models/branchModel';
import { districtModel } from '../models/districtModel';
import { successResponse, errorResponse } from '../utils/responseWrapper';

export const organizationController = {
  async getBranches(req: Request, res: Response) {
    try {
      const { districtId, status } = req.query;
      const branches = await branchModel.findAll({
        districtId: districtId as string,
        status: status as string
      });
      return successResponse(res, branches);
    } catch (err: any) {
      return errorResponse(res, err.message);
    }
  },

  async getBranchById(req: Request, res: Response) {
    try {
      const branch = await branchModel.findById(req.params.id);
      if (!branch) return errorResponse(res, 'Branch not found', 404);
      return successResponse(res, branch);
    } catch (err: any) {
      return errorResponse(res, err.message);
    }
  },

  async getDistricts(req: Request, res: Response) {
    try {
      const districts = await districtModel.findAll();
      return successResponse(res, districts);
    } catch (err: any) {
      return errorResponse(res, err.message);
    }
  },

  async getDistrictById(req: Request, res: Response) {
    try {
      const district = await districtModel.findById(req.params.id);
      if (!district) return errorResponse(res, 'District not found', 404);
      return successResponse(res, district);
    } catch (err: any) {
      return errorResponse(res, err.message);
    }
  }
};
