import { Router } from 'express';
import caregiverRoutes from './caregiverRoutes';
import protectedMemberRoutes from './protectedMemberRoutes';

const router = Router();

router.use('/caregivers', caregiverRoutes);
router.use('/protected-members', protectedMemberRoutes);

export default router;
