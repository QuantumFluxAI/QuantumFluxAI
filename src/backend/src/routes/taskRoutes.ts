import { Router } from 'express';
import { connection } from '../server';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { ContractService } from '../services/contractService';
import { TaskRequest, ExpressRequest, ExpressResponse, ExpressNextFunction } from '../types';
import { PublicKey } from '@solana/web3.js';

const router = Router();
const contractService = new ContractService(
    connection,
    process.env.PROGRAM_ID || ''
);

// Create a new task
router.post('/', async (req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) => {
    try {
        const { modelType, computeRequired, reward } = req.body as TaskRequest;

        if (!modelType || !computeRequired || !reward) {
            throw new AppError(400, 'Missing required fields');
        }

        const requesterPubkey = new PublicKey(req.user?.id || '');
        const signature = await contractService.createTask(
            requesterPubkey,
            modelType,
            computeRequired,
            reward
        );

        logger.info(`New task created: ${signature}`);
        res.status(201).json({
            status: 'success',
            data: { signature }
        });
    } catch (err) {
        next(err);
    }
});

// Get task information
router.get('/:taskId', async (req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) => {
    try {
        const { taskId } = req.params;
        const taskPubkey = new PublicKey(taskId);

        const taskInfo = await contractService.getTaskInfo(taskPubkey);

        res.json({
            status: 'success',
            data: taskInfo
        });
    } catch (err) {
        next(err);
    }
});

// Assign task to a node
router.post('/:taskId/assign', async (req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) => {
    try {
        const { taskId } = req.params;
        const { nodeId } = req.body;

        if (!nodeId) {
            throw new AppError(400, 'Missing node ID');
        }

        const taskPubkey = new PublicKey(taskId);
        const nodePubkey = new PublicKey(nodeId);

        const signature = await contractService.assignTask(taskPubkey, nodePubkey);

        logger.info(`Task ${taskId} assigned to node ${nodeId}`);
        res.json({
            status: 'success',
            data: { signature }
        });
    } catch (err) {
        next(err);
    }
});

// Complete a task
router.post('/:taskId/complete', async (req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) => {
    try {
        const { taskId } = req.params;
        const { resultHash } = req.body;

        if (!resultHash) {
            throw new AppError(400, 'Missing result hash');
        }

        const taskPubkey = new PublicKey(taskId);
        const signature = await contractService.completeTask(taskPubkey, resultHash);

        logger.info(`Task ${taskId} completed with result hash ${resultHash}`);
        res.json({
            status: 'success',
            data: { signature }
        });
    } catch (err) {
        next(err);
    }
});

export { router as taskRoutes }; 