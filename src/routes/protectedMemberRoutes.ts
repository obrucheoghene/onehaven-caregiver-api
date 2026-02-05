import { Router } from 'express';
import protectedMemberController from '../controllers/protectedMemberController';
import { authenticate } from '../middleware/auth';
import validate from '../middleware/validate';
import {
  createProtectedMemberSchema,
  updateProtectedMemberSchema,
  memberIdParamSchema,
} from '../validations/protectedMemberSchema';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/protected-members:
 *   post:
 *     summary: Create a new protected member
 *     tags: [Protected Members]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProtectedMemberInput'
 *     responses:
 *       201:
 *         description: Protected member created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ProtectedMember'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', validate(createProtectedMemberSchema), protectedMemberController.create);

/**
 * @swagger
 * /api/protected-members:
 *   get:
 *     summary: List all protected members for the authenticated caregiver
 *     tags: [Protected Members]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of protected members
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProtectedMember'
 *       401:
 *         description: Unauthorized
 */
router.get('/', protectedMemberController.findAll);

/**
 * @swagger
 * /api/protected-members/{id}:
 *   patch:
 *     summary: Update a protected member
 *     tags: [Protected Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Protected member ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProtectedMemberInput'
 *     responses:
 *       200:
 *         description: Protected member updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ProtectedMember'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not your member
 *       404:
 *         description: Member not found
 */
router.patch('/:id', validate(updateProtectedMemberSchema), protectedMemberController.update);

/**
 * @swagger
 * /api/protected-members/{id}:
 *   delete:
 *     summary: Delete a protected member
 *     tags: [Protected Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Protected member ID
 *     responses:
 *       200:
 *         description: Protected member deleted successfully
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
 *                     message:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not your member
 *       404:
 *         description: Member not found
 */
router.delete('/:id', validate(memberIdParamSchema), protectedMemberController.delete);

export default router;
