import { PublicKey } from '@solana/web3.js';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

interface QueuedTask {
    taskId: PublicKey;
    modelType: string;
    computeRequired: number;
    reward: number;
    status: 'pending' | 'assigned' | 'processing' | 'completed' | 'failed';
    createdAt: Date;
    updatedAt: Date;
    assignedNode?: PublicKey;
}

export class QueueService {
    private taskQueue: Map<string, QueuedTask>;

    constructor() {
        this.taskQueue = new Map();
    }

    // Add task to queue
    async enqueueTask(
        taskId: PublicKey,
        modelType: string,
        computeRequired: number,
        reward: number
    ): Promise<void> {
        try {
            const task: QueuedTask = {
                taskId,
                modelType,
                computeRequired,
                reward,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            this.taskQueue.set(taskId.toBase58(), task);
            logger.info(`Task added to queue: ${taskId.toBase58()}`);
        } catch (error) {
            logger.error(`Error enqueueing task: ${error}`);
            throw new AppError(500, 'Failed to enqueue task');
        }
    }

    // Get next available task for a node
    async getNextTask(nodeId: PublicKey, capabilities: string[]): Promise<QueuedTask | null> {
        try {
            for (const [_, task] of this.taskQueue) {
                if (
                    task.status === 'pending' &&
                    capabilities.includes(task.modelType)
                ) {
                    task.status = 'assigned';
                    task.assignedNode = nodeId;
                    task.updatedAt = new Date();
                    return task;
                }
            }
            return null;
        } catch (error) {
            logger.error(`Error getting next task: ${error}`);
            throw new AppError(500, 'Failed to get next task');
        }
    }

    // Update task status
    async updateTaskStatus(
        taskId: PublicKey,
        status: QueuedTask['status']
    ): Promise<void> {
        try {
            const task = this.taskQueue.get(taskId.toBase58());
            if (!task) {
                throw new AppError(404, 'Task not found');
            }

            task.status = status;
            task.updatedAt = new Date();
            logger.info(`Task ${taskId.toBase58()} status updated to ${status}`);
        } catch (error) {
            logger.error(`Error updating task status: ${error}`);
            throw new AppError(500, 'Failed to update task status');
        }
    }

    // Get task status
    async getTaskStatus(taskId: PublicKey): Promise<QueuedTask['status']> {
        try {
            const task = this.taskQueue.get(taskId.toBase58());
            if (!task) {
                throw new AppError(404, 'Task not found');
            }
            return task.status;
        } catch (error) {
            logger.error(`Error getting task status: ${error}`);
            throw new AppError(500, 'Failed to get task status');
        }
    }

    // Clean up completed tasks
    async cleanupOldTasks(maxAge: number): Promise<void> {
        try {
            const now = Date.now();
            for (const [taskId, task] of this.taskQueue) {
                if (
                    (task.status === 'completed' || task.status === 'failed') &&
                    now - task.updatedAt.getTime() > maxAge
                ) {
                    this.taskQueue.delete(taskId);
                    logger.info(`Cleaned up old task: ${taskId}`);
                }
            }
        } catch (error) {
            logger.error(`Error cleaning up old tasks: ${error}`);
            throw new AppError(500, 'Failed to clean up old tasks');
        }
    }
} 