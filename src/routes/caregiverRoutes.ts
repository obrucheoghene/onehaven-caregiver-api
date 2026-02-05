import { Router } from 'express';
import caregiverController from '../controllers/caregiverController';
import { authenticate } from '../middleware/auth';
import validate from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';
import { signupSchema, loginSchema } from '../validations/caregiverSchema';

const router = Router();

/**
 * @swagger
 * /api/caregivers/signup:
 *   post:
 *     summary: Create a new caregiver account
 *     tags: [Caregivers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupInput'
 *     responses:
 *       201:
 *         description: Caregiver created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     caregiver:
 *                       $ref: '#/components/schemas/Caregiver'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email already exists
 */
router.post('/signup', authLimiter, validate(signupSchema), caregiverController.signup);

/**
 * @swagger
 * /api/caregivers/login:
 *   post:
 *     summary: Authenticate caregiver and get JWT token
 *     tags: [Caregivers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     caregiver:
 *                       $ref: '#/components/schemas/Caregiver'
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authLimiter, validate(loginSchema), caregiverController.login);

/**
 * @swagger
 * /api/caregivers/me:
 *   get:
 *     summary: Get current caregiver profile
 *     tags: [Caregivers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Caregiver profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Caregiver'
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, caregiverController.getMe);

export default router;
