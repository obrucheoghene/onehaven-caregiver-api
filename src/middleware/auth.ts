import { Response, NextFunction } from 'express';
import { getSupabase } from '../config/supabase';
import Caregiver from '../models/Caregiver';
import { AuthRequest } from '../types';
import logger from '../utils/logger';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Authorization header missing or invalid',
          code: 'UNAUTHORIZED',
        },
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Token not provided',
          code: 'UNAUTHORIZED',
        },
      });
      return;
    }

    // Verify token with Supabase
    const supabase = getSupabase();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      logger.warn(`Auth failed: ${error?.message || 'User not found'}`);
      res.status(401).json({
        success: false,
        error: {
          message: 'Invalid or expired token',
          code: 'UNAUTHORIZED',
        },
      });
      return;
    }

    // Get caregiver from MongoDB
    const caregiver = await Caregiver.findOne({ supabaseUserId: user.id });

    if (!caregiver) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Caregiver not found',
          code: 'UNAUTHORIZED',
        },
      });
      return;
    }

    // Attach caregiver to request
    req.caregiver = {
      id: caregiver.id,
      supabaseUserId: caregiver.supabaseUserId,
      name: caregiver.name,
      email: caregiver.email,
      createdAt: caregiver.createdAt,
    };

    next();
  } catch (error) {
    logger.error(`Auth middleware error: ${error}`);
    res.status(500).json({
      success: false,
      error: {
        message: 'Authentication failed',
        code: 'INTERNAL_ERROR',
      },
    });
  }
};

export default authenticate;
