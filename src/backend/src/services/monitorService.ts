import { PublicKey } from '@solana/web3.js';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

interface NodeStatus {
    nodeId: PublicKey;
    lastHeartbeat: Date;
    isActive: boolean;
    currentTask?: PublicKey;
    computePower: number;
    totalTasksCompleted: number;
    successRate: number;
    metrics: {
        cpuUsage: number;
        memoryUsage: number;
        networkLatency: number;
    };
}

export class MonitorService {
    private nodeStatuses: Map<string, NodeStatus>;
    private readonly HEARTBEAT_TIMEOUT = 60000; // 1 minute

    constructor() {
        this.nodeStatuses = new Map();
    }

    // Register node for monitoring
    async registerNode(
        nodeId: PublicKey,
        computePower: number
    ): Promise<void> {
        try {
            const status: NodeStatus = {
                nodeId,
                lastHeartbeat: new Date(),
                isActive: true,
                computePower,
                totalTasksCompleted: 0,
                successRate: 100,
                metrics: {
                    cpuUsage: 0,
                    memoryUsage: 0,
                    networkLatency: 0
                }
            };

            this.nodeStatuses.set(nodeId.toBase58(), status);
            logger.info(`Node registered for monitoring: ${nodeId.toBase58()}`);
        } catch (error) {
            logger.error(`Error registering node: ${error}`);
            throw new AppError(500, 'Failed to register node');
        }
    }

    // Update node heartbeat
    async updateHeartbeat(
        nodeId: PublicKey,
        metrics: NodeStatus['metrics']
    ): Promise<void> {
        try {
            const status = this.nodeStatuses.get(nodeId.toBase58());
            if (!status) {
                throw new AppError(404, 'Node not found');
            }

            status.lastHeartbeat = new Date();
            status.metrics = metrics;
            logger.debug(`Node heartbeat updated: ${nodeId.toBase58()}`);
        } catch (error) {
            logger.error(`Error updating heartbeat: ${error}`);
            throw new AppError(500, 'Failed to update heartbeat');
        }
    }

    // Check node health
    async checkNodeHealth(nodeId: PublicKey): Promise<boolean> {
        try {
            const status = this.nodeStatuses.get(nodeId.toBase58());
            if (!status) {
                throw new AppError(404, 'Node not found');
            }

            const timeSinceLastHeartbeat = Date.now() - status.lastHeartbeat.getTime();
            const isHealthy = timeSinceLastHeartbeat < this.HEARTBEAT_TIMEOUT;

            if (!isHealthy && status.isActive) {
                status.isActive = false;
                logger.warn(`Node ${nodeId.toBase58()} marked as inactive`);
            }

            return isHealthy;
        } catch (error) {
            logger.error(`Error checking node health: ${error}`);
            throw new AppError(500, 'Failed to check node health');
        }
    }

    // Update task completion status
    async updateTaskCompletion(
        nodeId: PublicKey,
        success: boolean
    ): Promise<void> {
        try {
            const status = this.nodeStatuses.get(nodeId.toBase58());
            if (!status) {
                throw new AppError(404, 'Node not found');
            }

            status.totalTasksCompleted++;
            const totalTasks = status.totalTasksCompleted;
            if (success) {
                status.successRate = ((status.successRate * (totalTasks - 1) + 100) / totalTasks);
            } else {
                status.successRate = ((status.successRate * (totalTasks - 1)) / totalTasks);
            }

            status.currentTask = undefined;
            logger.info(`Task completion updated for node ${nodeId.toBase58()}`);
        } catch (error) {
            logger.error(`Error updating task completion: ${error}`);
            throw new AppError(500, 'Failed to update task completion');
        }
    }

    // Get active nodes
    async getActiveNodes(): Promise<NodeStatus[]> {
        try {
            const activeNodes: NodeStatus[] = [];
            for (const [_, status] of this.nodeStatuses) {
                if (status.isActive) {
                    activeNodes.push(status);
                }
            }
            return activeNodes;
        } catch (error) {
            logger.error(`Error getting active nodes: ${error}`);
            throw new AppError(500, 'Failed to get active nodes');
        }
    }

    // Get node performance metrics
    async getNodeMetrics(nodeId: PublicKey): Promise<NodeStatus['metrics']> {
        try {
            const status = this.nodeStatuses.get(nodeId.toBase58());
            if (!status) {
                throw new AppError(404, 'Node not found');
            }
            return status.metrics;
        } catch (error) {
            logger.error(`Error getting node metrics: ${error}`);
            throw new AppError(500, 'Failed to get node metrics');
        }
    }
} 