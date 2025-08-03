import { Router } from 'express';
import {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
  searchClients,
  debugClients
} from '../controllers/clients';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authMiddleware, createClient);
router.get('/', authMiddleware, getAllClients);
router.get('/search', authMiddleware, searchClients);
router.get('/debug', authMiddleware, debugClients);
router.get('/:clientId', authMiddleware, getClientById);
router.put('/:clientId', authMiddleware, updateClient);
router.delete('/:clientId', authMiddleware, deleteClient);

export default router;