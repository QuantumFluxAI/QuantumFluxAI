import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Connection, PublicKey } from '@solana/web3.js';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { nodeRoutes } from './routes/nodeRoutes';
import { taskRoutes } from './routes/taskRoutes';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Initialize Solana connection
const connection = new Connection(
    process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    'confirmed'
);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Routes
app.use('/api/nodes', nodeRoutes);
app.use('/api/tasks', taskRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        network: connection.rpcEndpoint
    });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(port, () => {
    logger.info(`QuantumFluxAI backend server running on port ${port}`);
});

export { app, connection }; 