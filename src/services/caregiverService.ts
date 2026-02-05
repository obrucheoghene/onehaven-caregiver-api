import { getSupabase } from "../config/supabase";
import Caregiver from "../models/Caregiver";
import { ICaregiver, SignupInput, LoginInput, AuthResponse } from "../types";
import { ApiError } from "../middleware/errorHandler";
import logger from "../utils/logger";

export class CaregiverService {
  async signup(input: SignupInput): Promise<AuthResponse> {
    const { name, email, password } = input;

    // Check if caregiver already exists in MongoDB
    const existingCaregiver = await Caregiver.findOne({
      email: email.toLowerCase(),
    });
    if (existingCaregiver) {
      throw ApiError.conflict("A caregiver with this email already exists");
    }

    const supabase = getSupabase();

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      logger.error(`Supabase signup error: ${authError.message}`);
      throw ApiError.badRequest(authError.message);
    }

    if (!authData.user) {
      throw ApiError.internal("Failed to create user account");
    }

    // Create caregiver profile in MongoDB
    const caregiver = new Caregiver({
      supabaseUserId: authData.user.id,
      name,
      email: email.toLowerCase(),
    });

    await caregiver.save();
    logger.info(`Caregiver created: ${caregiver.id}`);

    // Return the session token
    const token = authData.session?.access_token;
    if (!token) {
      throw ApiError.internal("Failed to generate access token");
    }

    return {
      token,
      caregiver: {
        id: caregiver.id,
        name: caregiver.name,
        email: caregiver.email,
        createdAt: caregiver.createdAt,
      },
    };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;

    const supabase = getSupabase();

    // Authenticate with Supabase
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      logger.warn(`Login failed for ${email}: ${authError.message}`);
      throw ApiError.unauthorized("Invalid email or password");
    }

    if (!authData.user || !authData.session) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    // Get caregiver from MongoDB
    const caregiver = await Caregiver.findOne({
      supabaseUserId: authData.user.id,
    });

    if (!caregiver) {
      logger.error(
        `Caregiver not found in MongoDB for Supabase user: ${authData.user.id}`,
      );
      throw ApiError.notFound("Caregiver profile not found");
    }

    logger.info(`Caregiver logged in: ${caregiver.id}`);

    return {
      token: authData.session.access_token,
      caregiver: {
        id: caregiver.id,
        name: caregiver.name,
        email: caregiver.email,
        createdAt: caregiver.createdAt,
      },
    };
  }

  async getProfile(
    caregiverId: string,
  ): Promise<Omit<ICaregiver, "supabaseUserId">> {
    const caregiver = await Caregiver.findOne({ id: caregiverId });

    if (!caregiver) {
      throw ApiError.notFound("Caregiver not found");
    }

    return {
      id: caregiver.id,
      name: caregiver.name,
      email: caregiver.email,
      createdAt: caregiver.createdAt,
    };
  }
}

export default new CaregiverService();
