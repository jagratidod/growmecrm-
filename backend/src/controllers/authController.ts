import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Organization } from '../models/Organization';
import { User } from '../models/User';
import { TeamInvite } from '../models/TeamInvite';
import { PasswordResetOtp } from '../models/PasswordResetOtp';
import { sendPasswordResetOtpEmail } from '../utils/emailService';
import { AuthenticatedRequest } from '../types';

const generateToken = (payload: {
  userId: string;
  organizationId: string;
  role: string;
  email: string;
}): string => {
  const secret = process.env.JWT_SECRET || 'fallback_secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn: expiresIn as any });
};

// 1. REGISTER A NEW AGENCY & OWNER (SaaS Onboarding)
export const registerAgency = async (req: Request, res: Response): Promise<void> => {
  try {
    const { agencyName, name, email, phone, password } = req.body;

    if (!agencyName?.trim() || !name?.trim() || !email?.trim() || !password) {
      res.status(400).json({ error: 'Agency name, your name, email, and password are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(409).json({ error: 'An account with this email address already exists.' });
      return;
    }

    // Generate unique slug for agency workspace
    const baseSlug = agencyName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const slug = `${baseSlug || 'agency'}-${randomSuffix}`;

    // 1. Create Organization (Tenant)
    const organization = await Organization.create({
      name: agencyName.trim(),
      slug,
      plan: 'STARTER',
      maxSeats: 2,
      maxLeads: 500,
      status: 'ACTIVE',
    });

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create Owner User
    const user = await User.create({
      organizationId: organization._id,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || '',
      password: hashedPassword,
      role: 'OWNER',
      status: 'Active',
    });

    // 4. Issue JWT
    const token = generateToken({
      userId: user._id.toString(),
      organizationId: organization._id.toString(),
      role: user.role,
      email: user.email,
    });

    res.status(201).json({
      message: 'Agency workspace created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(),
        avatarUrl: user.avatarUrl,
        organizationId: organization._id,
        organizationName: organization.name,
      },
      organization: {
        id: organization._id,
        name: organization.name,
        slug: organization.slug,
        logoUrl: organization.logoUrl,
        primaryColor: organization.primaryColor,
        secondaryColor: organization.secondaryColor,
        plan: organization.plan,
      },
    });
  } catch (error: any) {
    console.error('Register Agency Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error while registering agency.' });
  }
};

// 2. SIGN IN / LOGIN (Existing Users)
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    const identifier = (email || username || '').toLowerCase().trim();

    if (!identifier || !password) {
      res.status(400).json({ error: 'Please enter both your email/username and password.' });
      return;
    }

    // Match by email or name
    const user = await User.findOne({
      $or: [{ email: identifier }, { name: new RegExp(`^${identifier}$`, 'i') }],
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid username/email or password.' });
      return;
    }

    if (user.status !== 'Active') {
      res.status(403).json({ error: 'Your account is inactive. Please contact your workspace administrator.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid username/email or password.' });
      return;
    }

    // Fetch tenant organization
    const organization = await Organization.findById(user.organizationId);
    if (!organization) {
      res.status(404).json({ error: 'Associated agency workspace not found.' });
      return;
    }

    if (organization.status === 'SUSPENDED') {
      res.status(403).json({ error: 'This workspace is suspended. Please contact support.' });
      return;
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Issue JWT
    const token = generateToken({
      userId: user._id.toString(),
      organizationId: organization._id.toString(),
      role: user.role,
      email: user.email,
    });

    res.status(200).json({
      message: 'Signed in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(),
        avatarUrl: user.avatarUrl,
        organizationId: organization._id,
        organizationName: organization.name,
      },
      organization: {
        id: organization._id,
        name: organization.name,
        slug: organization.slug,
        logoUrl: organization.logoUrl,
        primaryColor: organization.primaryColor,
        secondaryColor: organization.secondaryColor,
        plan: organization.plan,
      },
    });
  } catch (error: any) {
    console.error('Login Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error during login.' });
  }
};

// 3. GET CURRENT LOGGED IN USER & TENANT (Me)
export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const organization = await Organization.findById(user.organizationId);

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(),
        avatarUrl: user.avatarUrl,
        organizationId: organization?._id,
        organizationName: organization?.name || 'GrowMe CRM',
      },
      organization: organization
        ? {
            id: organization._id,
            name: organization.name,
            slug: organization.slug,
            logoUrl: organization.logoUrl,
            primaryColor: organization.primaryColor,
            secondaryColor: organization.secondaryColor,
            plan: organization.plan,
          }
        : null,
    });
  } catch (error: any) {
    console.error('GetMe Error:', error);
    res.status(500).json({ error: error.message || 'Error fetching user session' });
  }
};

// 4. GET FULL USER PROFILE (for ProfilePage)
export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const organization = await Organization.findById(user.organizationId);

    const memberSince = new Date(user.createdAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const lastSignIn = user.lastActive
      ? new Date(user.lastActive).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Just now';

    const displayRole = user.role === 'OWNER' ? 'Owner' : user.role === 'ADMIN' ? 'Admin' : user.role === 'MANAGER' ? 'Manager' : 'Agent';

    res.status(200).json({
      fullName: user.name,
      email: user.email,
      role: displayRole,
      organization: organization ? organization.name : 'GrowMe CRM',
      memberSince,
      lastSignIn,
      avatarUrl: user.avatarUrl || '',
    });
  } catch (error: any) {
    console.error('getProfile Error:', error);
    res.status(500).json({ error: error.message || 'Error fetching profile' });
  }
};

// 5. UPDATE USER PERSONAL DETAILS (for ProfilePage)
export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { fullName, email } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (fullName?.trim()) {
      user.name = fullName.trim();
    }

    if (email?.trim()) {
      const normalizedEmail = email.toLowerCase().trim();
      if (normalizedEmail !== user.email) {
        // Check if new email is taken
        const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
        if (existing) {
          res.status(400).json({ error: 'This email is already in use by another account.' });
          return;
        }
        user.email = normalizedEmail;
      }
    }

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      fullName: user.name,
      email: user.email,
    });
  } catch (error: any) {
    console.error('updateProfile Error:', error);
    res.status(500).json({ error: error.message || 'Error updating profile' });
  }
};

// 6. CHANGE USER PASSWORD (for ProfilePage)
export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current password and new password are required.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(400).json({ error: 'Your current password is incorrect.' });
      return;
    }

    // Hash and set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error: any) {
    console.error('changePassword Error:', error);
    res.status(500).json({ error: error.message || 'Error changing password' });
  }
};

// 7. ACCEPT INVITATION & JOIN TENANT
export const acceptInvite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, name, password } = req.body;

    if (!token || !name?.trim() || !password) {
      res.status(400).json({ error: 'Invite token, name, and password are required.' });
      return;
    }

    const invite = await TeamInvite.findOne({ token, status: 'Invited' });
    if (!invite) {
      res.status(400).json({ error: 'Invalid or already used invitation token.' });
      return;
    }

    if (new Date() > invite.expiresAt) {
      invite.status = 'Expired';
      await invite.save();
      res.status(400).json({ error: 'This invitation has expired. Ask your admin for a new invite.' });
      return;
    }

    const existingUser = await User.findOne({ email: invite.email });
    if (existingUser) {
      res.status(400).json({ error: 'A user with this email is already registered.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      organizationId: invite.organizationId,
      name: name.trim(),
      email: invite.email,
      password: hashedPassword,
      role: invite.role,
      status: 'Active',
    });

    invite.status = 'Accepted';
    await invite.save();

    const organization = await Organization.findById(invite.organizationId);

    const authToken = generateToken({
      userId: user._id.toString(),
      organizationId: invite.organizationId.toString(),
      role: user.role,
      email: user.email,
    });

    res.status(201).json({
      message: 'Invitation accepted and account created successfully',
      token: authToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(),
      },
      organization: organization
        ? {
            id: organization._id,
            name: organization.name,
            slug: organization.slug,
          }
        : null,
    });
  } catch (error: any) {
    console.error('Accept Invite Error:', error);
    res.status(500).json({ error: error.message || 'Error accepting invitation' });
  }
};

// 8. FORGOT PASSWORD - SEND 6-DIGIT OTP VIA GMAIL SMTP
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      res.status(400).json({ error: 'Email address is required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify user exists in the database
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      res.status(404).json({ error: 'No user account found with this email address.' });
      return;
    }

    // Generate secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // OTP expires in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save or update OTP in the database
    await PasswordResetOtp.findOneAndUpdate(
      { email: normalizedEmail },
      { otp, expiresAt, attempts: 0 },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Send email using Gmail SMTP
    const emailResult = await sendPasswordResetOtpEmail(normalizedEmail, otp, user.name);

    if (!emailResult.success) {
      console.warn(`[Forgot Password] SMTP failed for ${normalizedEmail}: ${emailResult.error}`);
      res.status(500).json({
        error: 'Failed to send OTP email. Please ensure your email configuration is valid and try again.',
      });
      return;
    }

    res.status(200).json({
      message: 'A 6-digit verification code has been sent to your email address.',
    });
  } catch (error: any) {
    console.error('[Forgot Password Error]:', error);
    res.status(500).json({ error: error.message || 'Failed to process forgot password request.' });
  }
};

// 9. RESET PASSWORD - VERIFY OTP & UPDATE PASSWORD
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email?.trim() || !otp?.trim() || !newPassword) {
      res.status(400).json({ error: 'Email, verification code, and new password are required.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    // Find the stored OTP record
    const otpRecord = await PasswordResetOtp.findOne({ email: normalizedEmail });

    if (!otpRecord) {
      res.status(400).json({
        error: 'Verification code not found or expired. Please request a new code.',
      });
      return;
    }

    // Check expiration
    if (new Date() > otpRecord.expiresAt) {
      await PasswordResetOtp.deleteOne({ _id: otpRecord._id });
      res.status(400).json({
        error: 'Verification code has expired. Please request a new one.',
      });
      return;
    }

    // Rate limiting brute-force attempts
    if (otpRecord.attempts >= 5) {
      await PasswordResetOtp.deleteOne({ _id: otpRecord._id });
      res.status(429).json({
        error: 'Too many incorrect attempts. Please request a new verification code.',
      });
      return;
    }

    // Verify OTP code
    if (otpRecord.otp !== cleanOtp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      res.status(400).json({
        error: `Invalid verification code. ${5 - otpRecord.attempts} attempt(s) remaining.`,
      });
      return;
    }

    // Find the user to update password
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      res.status(404).json({ error: 'User account not found.' });
      return;
    }

    // Hash the new password with bcrypt
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Remove the OTP record so it cannot be reused
    await PasswordResetOtp.deleteOne({ _id: otpRecord._id });

    console.log(`[Reset Password] Successfully reset password for user: ${normalizedEmail}`);

    res.status(200).json({
      message: 'Your password has been reset successfully. You can now sign in with your new password.',
    });
  } catch (error: any) {
    console.error('[Reset Password Error]:', error);
    res.status(500).json({ error: error.message || 'Failed to reset password.' });
  }
};
