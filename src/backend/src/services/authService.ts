import { PublicKey } from '@solana/web3.js';
import { sign } from 'tweetnacl';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

export class AuthService {
    // Verify user signature
    async verifySignature(message: string, signature: string, publicKey: string): Promise<boolean> {
        try {
            const messageBytes = new TextEncoder().encode(message);
            const signatureBytes = Buffer.from(signature, 'base64');
            const publicKeyBytes = new PublicKey(publicKey).toBytes();

            return sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
        } catch (error) {
            logger.error(`Error verifying signature: ${error}`);
            throw new AppError(401, 'Invalid signature');
        }
    }

    // Generate authentication challenge
    generateChallenge(): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        return `Sign this message to authenticate: ${timestamp}-${random}`;
    }

    // Verify user permissions
    async verifyPermissions(userId: string, requiredRole: string): Promise<boolean> {
        try {
            // TODO: Implement role-based access control
            return true;
        } catch (error) {
            logger.error(`Error verifying permissions: ${error}`);
            throw new AppError(403, 'Insufficient permissions');
        }
    }
} 