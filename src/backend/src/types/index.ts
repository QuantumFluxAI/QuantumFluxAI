import { Request, Response, NextFunction } from 'express';

// Request types
export interface NodeRequest {
    owner: string;
    computePower: number;
}

export interface TaskRequest {
    modelType: string;
    computeRequired: number;
    reward: number;
}

export interface TaskAssignmentRequest {
    nodeId: string;
}

export interface TaskCompletionRequest {
    resultHash: string;
}

// Response types
export interface ApiResponse<T = any> {
    status: 'success' | 'error';
    data?: T;
    message?: string;
}

// Express types
export type ExpressRequest = Request;
export type ExpressResponse = Response;
export type ExpressNextFunction = NextFunction;

// Logger types
export interface LogMessage {
    timestamp: string;
    level: string;
    message: string;
} 