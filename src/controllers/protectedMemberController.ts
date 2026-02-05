import { Response, NextFunction } from 'express';
import protectedMemberService from '../services/protectedMemberService';
import { AuthRequest, CreateProtectedMemberInput, UpdateProtectedMemberInput } from '../types';

export class ProtectedMemberController {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.caregiver) {
        res.status(401).json({
          success: false,
          error: {
            message: 'Not authenticated',
            code: 'UNAUTHORIZED',
          },
        });
        return;
      }

      const input: CreateProtectedMemberInput = req.body;
      const member = await protectedMemberService.create(req.caregiver.id, input);

      res.status(201).json({
        success: true,
        data: member,
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.caregiver) {
        res.status(401).json({
          success: false,
          error: {
            message: 'Not authenticated',
            code: 'UNAUTHORIZED',
          },
        });
        return;
      }

      const members = await protectedMemberService.findAllByCaregiverId(req.caregiver.id);

      res.status(200).json({
        success: true,
        data: members,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.caregiver) {
        res.status(401).json({
          success: false,
          error: {
            message: 'Not authenticated',
            code: 'UNAUTHORIZED',
          },
        });
        return;
      }

      const memberId = req.params.id;
      const input: UpdateProtectedMemberInput = req.body;
      const member = await protectedMemberService.update(memberId, req.caregiver.id, input);

      res.status(200).json({
        success: true,
        data: member,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.caregiver) {
        res.status(401).json({
          success: false,
          error: {
            message: 'Not authenticated',
            code: 'UNAUTHORIZED',
          },
        });
        return;
      }

      const memberId = req.params.id;
      await protectedMemberService.delete(memberId, req.caregiver.id);

      res.status(200).json({
        success: true,
        data: {
          message: 'Protected member deleted successfully',
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProtectedMemberController();
