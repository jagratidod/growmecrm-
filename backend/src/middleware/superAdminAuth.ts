import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';

export const requireSuperAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }

  if (req.user.role !== 'SUPER_ADMIN') {
    res.status(403).json({
      error: 'Access restricted: Only platform Super Administrators can access this resource.',
    });
    return;
  }

  next();
};
