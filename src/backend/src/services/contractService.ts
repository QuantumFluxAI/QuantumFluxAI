import { Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction } from '@solana/web3.js';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

export class ContractService {
    private connection: Connection;
    private programId: PublicKey;

    constructor(connection: Connection, programId: string) {
        this.connection = connection;
        this.programId = new PublicKey(programId);
    }

    // Register a new node
    async registerNode(owner: PublicKey, computePower: number): Promise<string> {
        try {
            // Create node account
            const nodeAccount = new PublicKey();
            const lamports = await this.connection.getMinimumBalanceForRentExemption(0);

            // Create transaction
            const transaction = new Transaction().add(
                SystemProgram.createAccount({
                    fromPubkey: owner,
                    newAccountPubkey: nodeAccount,
                    lamports,
                    space: 0,
                    programId: this.programId,
                })
            );

            // Send transaction
            const signature = await sendAndConfirmTransaction(
                this.connection,
                transaction,
                [owner]
            );

            logger.info(`Node registered: ${nodeAccount.toBase58()}`);
            return signature;
        } catch (error) {
            logger.error(`Error registering node: ${error}`);
            throw new AppError(500, 'Failed to register node');
        }
    }

    // Create a new task
    async createTask(
        requester: PublicKey,
        modelType: string,
        computeRequired: number,
        reward: number
    ): Promise<string> {
        try {
            // Create task account
            const taskAccount = new PublicKey();
            const lamports = await this.connection.getMinimumBalanceForRentExemption(0);

            // Create transaction
            const transaction = new Transaction().add(
                SystemProgram.createAccount({
                    fromPubkey: requester,
                    newAccountPubkey: taskAccount,
                    lamports,
                    space: 0,
                    programId: this.programId,
                })
            );

            // Send transaction
            const signature = await sendAndConfirmTransaction(
                this.connection,
                transaction,
                [requester]
            );

            logger.info(`Task created: ${taskAccount.toBase58()}`);
            return signature;
        } catch (error) {
            logger.error(`Error creating task: ${error}`);
            throw new AppError(500, 'Failed to create task');
        }
    }

    // Assign task to node
    async assignTask(taskId: PublicKey, nodeId: PublicKey): Promise<string> {
        try {
            // Create transaction
            const transaction = new Transaction().add(
                // TODO: Add instruction for task assignment
            );

            // Send transaction
            const signature = await sendAndConfirmTransaction(
                this.connection,
                transaction,
                [taskId, nodeId]
            );

            logger.info(`Task assigned: ${taskId.toBase58()} -> ${nodeId.toBase58()}`);
            return signature;
        } catch (error) {
            logger.error(`Error assigning task: ${error}`);
            throw new AppError(500, 'Failed to assign task');
        }
    }

    // Complete task
    async completeTask(taskId: PublicKey, resultHash: string): Promise<string> {
        try {
            // Create transaction
            const transaction = new Transaction().add(
                // TODO: Add instruction for task completion
            );

            // Send transaction
            const signature = await sendAndConfirmTransaction(
                this.connection,
                transaction,
                [taskId]
            );

            logger.info(`Task completed: ${taskId.toBase58()}`);
            return signature;
        } catch (error) {
            logger.error(`Error completing task: ${error}`);
            throw new AppError(500, 'Failed to complete task');
        }
    }

    // Get node information
    async getNodeInfo(nodeId: PublicKey): Promise<any> {
        try {
            const accountInfo = await this.connection.getAccountInfo(nodeId);
            if (!accountInfo) {
                throw new AppError(404, 'Node not found');
            }

            // TODO: Parse node data
            return {
                nodeId: nodeId.toBase58(),
                // Add parsed node information
            };
        } catch (error) {
            logger.error(`Error getting node info: ${error}`);
            throw new AppError(500, 'Failed to get node information');
        }
    }

    // Get task information
    async getTaskInfo(taskId: PublicKey): Promise<any> {
        try {
            const accountInfo = await this.connection.getAccountInfo(taskId);
            if (!accountInfo) {
                throw new AppError(404, 'Task not found');
            }

            // TODO: Parse task data
            return {
                taskId: taskId.toBase58(),
                // Add parsed task information
            };
        } catch (error) {
            logger.error(`Error getting task info: ${error}`);
            throw new AppError(500, 'Failed to get task information');
        }
    }
} 