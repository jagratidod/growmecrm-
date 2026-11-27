import { User } from '../models/User';
import { Organization } from '../models/Organization';
import { getPlatformState } from '../utils/platformState';
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, AuthUserPayload, UserRole } from '../types';

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.user) return next();
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Access denied. No authorization token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as AuthUserPayload & { aud?: string };
    if (decoded.aud) {
      res.status(401).json({ error: 'This credential is restricted to its original purpose.' });
      return;
    }
    const user = await User.findById(decoded.userId).select('name email role status organizationId passwordChangedAt').lean();
    if (!user || user.status !== 'Active' || String(user.organizationId || '') !== (decoded.organizationId || '')) {
      res.status(401).json({ error: 'This session is no longer active.' });
      return;
    }
    const issuedAt = (decoded as { iat?: number }).iat ?? 0;
    if (user.passwordChangedAt && issuedAt < Math.floor(user.passwordChangedAt.getTime() / 1000)) {
      res.status(401).json({ error: 'Your password changed. Please sign in again.' });
      return;
    }
    if (user.role !== 'SUPER_ADMIN' && !(decoded as { isImpersonated?: boolean }).isImpersonated) {
      const platform = await getPlatformState();
      if (platform.maintenanceMode) {
        res.status(503).json({ error: platform.maintenanceMessage, maintenance: true });
        return;
      }
    }
    if (user.role !== 'SUPER_ADMIN' && user.organizationId) {
      const organization = await Organization.findById(user.organizationId).select('status').lean();
      if (!organization || organization.status === 'SUSPENDED') {
        res.status(403).json({ error: 'This workspace is suspended. Please contact support.' });
        return;
      }
    }
    req.user = { ...decoded, role: user.role, email: user.email, name: user.name };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid, malformed, or expired token.' });
  }
};

// Role-Based Authorization Guard
export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Forbidden: Role '${req.user.role}' is not authorized to perform this action.`,
      });
      return;
    }

    next();
  };
};
