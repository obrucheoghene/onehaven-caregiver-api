import { Request, Response, NextFunction } from "express";
import caregiverService from "../services/caregiverService";
import { AuthRequest, SignupInput, LoginInput } from "../types";

export class CaregiverController {
  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: SignupInput = req.body;
      const result = await caregiverService.signup(input);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: LoginInput = req.body;
      const result = await caregiverService.login(input);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.caregiver) {
        res.status(401).json({
          success: false,
          error: {
            message: "Not authenticated",
            code: "UNAUTHORIZED",
          },
        });
        return;
      }

      const caregiver = await caregiverService.getProfile(req.caregiver.id);
      console.log("Caregiver profile:", caregiver); // Debugging line to check caregiver data structure
      res.status(200).json({
        success: true,
        data: caregiver,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CaregiverController();
