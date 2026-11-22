import { Request } from 'express';
import { Types } from 'mongoose';

export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'AGENT';

export interface AuthUserPayload {
  userId: string;
  organizationId: string;
  role: UserRole;
  email: string;
  name?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}
