import { Response } from 'express';
import { AuthenticatedRequest, UserRole } from '../types';
import { User } from '../models/User';
import { TeamInvite } from '../models/TeamInvite';
import { Organization } from '../models/Organization';

// Helper to format relative time
const formatLastActive = (date?: Date): string => {
  if (!date) return 'Recently';
  const diffMinutes = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60));
  if (diffMinutes < 5) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} mins ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

// 1. GET ALL TEAM MEMBERS & PENDING INVITES
export const getTeam = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Tenant context missing' });
      return;
    }

    const { organizationId, userId: currentUserId } = req.user;

    const [users, invites] = await Promise.all([
      User.find({ organizationId }).select('-password').sort({ createdAt: 1 }),
      TeamInvite.find({ organizationId, status: 'Invited' }).sort({ createdAt: -1 }),
    ]);

    const formattedMembers = users.map((u) => {
      // Map OWNER or ADMIN to 'Admin' for frontend compatibility
      const displayRole = u.role === 'OWNER' || u.role === 'ADMIN' ? 'Admin' : u.role === 'MANAGER' ? 'Manager' : 'Agent';
      return {
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: displayRole,
        status: u.status,
        lastActive: formatLastActive(u.lastActive),
        avatarUrl: u.avatarUrl,
        isCurrentUser: u._id.toString() === currentUserId,
      };
    });

    const formattedInvites = invites.map((inv) => {
      const displayRole = inv.role === 'ADMIN' ? 'Admin' : inv.role === 'MANAGER' ? 'Manager' : 'Agent';
      const formattedExpiry = new Date(inv.expiresAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const inviteLink = `${frontendUrl}/accept-invite?token=${inv.token}`;

      return {
        id: inv._id.toString(),
        email: inv.email,
        role: displayRole,
        token: inv.token,
        inviteLink,
        expiresAt: formattedExpiry,
        invitedAt: inv.createdAt.toISOString(),
        status: inv.status,
      };
    });

    const adminCount = formattedMembers.filter((m) => m.role === 'Admin').length;

    res.status(200).json({
      members: formattedMembers,
      pendingInvites: formattedInvites,
      stats: {
        members: formattedMembers.length,
        admins: adminCount,
        pendingInvites: formattedInvites.length,
      },
    });
  } catch (error: any) {
    console.error('getTeam error:', error);
    res.status(500).json({ error: error.message || 'Error fetching team data' });
  }
};

// 2. CREATE TEAM INVITE (Admin/Owner only)
export const createTeamInvite = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    const { email, role } = req.body;

    if (!email?.trim()) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(400).json({ error: 'A team member with this email address already exists.' });
      return;
    }

    // Check Organization seat limit
    const organization = await Organization.findById(organizationId);
    if (organization) {
      const currentCount = await User.countDocuments({ organizationId });
      if (currentCount >= organization.maxSeats) {
        res.status(403).json({
          error: `Seat limit reached (${organization.maxSeats} seats on ${organization.plan} plan). Please upgrade your plan.`,
        });
        return;
      }
    }

    // Check for existing pending invite
    const existingInvite = await TeamInvite.findOne({
      organizationId,
      email: normalizedEmail,
      status: 'Invited',
    });

    if (existingInvite) {
      res.status(400).json({ error: 'An active invitation for this email has already been sent.' });
      return;
    }

    // Map role
    const internalRole: UserRole = role === 'Admin' ? 'ADMIN' : role === 'Manager' ? 'MANAGER' : 'AGENT';

    // Generate secure randomized token
    const token = 'VZxV' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = await TeamInvite.create({
      organizationId,
      email: normalizedEmail,
      role: internalRole,
      token,
      expiresAt,
      status: 'Invited',
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const inviteLink = `${frontendUrl}/accept-invite?token=${token}`;
    const formattedExpiry = expiresAt.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    res.status(201).json({
      id: invite._id.toString(),
      email: invite.email,
      role: role || 'Agent',
      token: invite.token,
      inviteLink,
      expiresAt: formattedExpiry,
      invitedAt: invite.createdAt.toISOString(),
      status: invite.status,
    });
  } catch (error: any) {
    console.error('createTeamInvite error:', error);
    res.status(500).json({ error: error.message || 'Error creating team invite' });
  }
};

// 3. REVOKE / CANCEL INVITE
export const revokeInvite = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    const result = await TeamInvite.deleteOne({
      _id: req.params.id,
      organizationId,
    });

    if (result.deletedCount === 0) {
      res.status(404).json({ error: 'Invite not found or already deleted' });
      return;
    }

    res.status(200).json({ message: 'Invite revoked successfully', id: req.params.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error revoking invite' });
  }
};

// 4. UPDATE TEAM MEMBER ROLE (Promote to Admin / Manager)
export const updateMemberRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    const { role } = req.body;

    const userToUpdate = await User.findOne({
      _id: req.params.id,
      organizationId,
    });

    if (!userToUpdate) {
      res.status(404).json({ error: 'Team member not found' });
      return;
    }

    // Protect the primary Owner
    if (userToUpdate.role === 'OWNER') {
      res.status(403).json({ error: 'The primary workspace Owner role cannot be changed.' });
      return;
    }

    const internalRole: UserRole = role === 'Admin' ? 'ADMIN' : role === 'Manager' ? 'MANAGER' : 'AGENT';
    userToUpdate.role = internalRole;
    await userToUpdate.save();

    res.status(200).json({
      message: 'Member role updated successfully',
      id: userToUpdate._id.toString(),
      role,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error updating member role' });
  }
};

// 5. DELETE TEAM MEMBER
export const deleteMember = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizationId = req.user?.organizationId;
    const currentUserId = req.user?.userId;

    if (req.params.id === currentUserId) {
      res.status(400).json({ error: 'You cannot remove yourself from the workspace.' });
      return;
    }

    const userToDelete = await User.findOne({
      _id: req.params.id,
      organizationId,
    });

    if (!userToDelete) {
      res.status(404).json({ error: 'Team member not found' });
      return;
    }

    if (userToDelete.role === 'OWNER') {
      res.status(403).json({ error: 'The workspace Owner cannot be removed.' });
      return;
    }

    await User.deleteOne({ _id: userToDelete._id });
    res.status(200).json({ message: 'Team member removed', id: req.params.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error removing team member' });
  }
};
