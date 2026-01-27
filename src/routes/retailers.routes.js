import express from 'express';
import * as retailersController from '../controllers/retailers.controller.js';

const router = express.Router();

router.get('/:uid', retailersController.getRetailers);
router.post('/', retailersController.createRetailer);

export default router;
