import { Router } from 'express';
import { connection } from '../server';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { ContractService } from '../services/contractService';
import { NodeRequest, ExpressRequest, ExpressResponse, ExpressNextFunction } from '../types';
import { PublicKey } from '@solana/web3.js';

const router = Router();
const contractService = new ContractService(
    connection,
    process.env.PROGRAM_ID || ''
);

// Register a new node
router.post('/register', async (req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) => {
    try {
        const { owner, computePower } = req.body as NodeRequest;

        if (!owner || !computePower) {
            throw new AppError(400, 'Missing required fields');
        }

        const ownerPubkey = new PublicKey(owner);
        const signature = await contractService.registerNode(ownerPubkey, computePower);

        logger.info(`New node registered: ${owner}`);
        res.status(201).json({
            status: 'success',
            data: { signature }
        });
    } catch (err) {
        next(err);
    }
});

// Get node information
router.get('/:nodeId', async (req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) => {
    try {
        const { nodeId } = req.params;
        const nodePubkey = new PublicKey(nodeId);

        const nodeInfo = await contractService.getNodeInfo(nodePubkey);

        res.json({
            status: 'success',
            data: nodeInfo
        });
    } catch (err) {
        next(err);
    }
});

// Update node status
router.patch('/:nodeId/status', async (req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) => {
    try {
        const { nodeId } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            throw new AppError(400, 'Invalid status value');
        }

        // TODO: Implement node status update in contract service
        res.json({
            status: 'success',
            message: 'Node status updated successfully'
        });
    } catch (err) {
        next(err);
    }
});

export { router as nodeRoutes }; 