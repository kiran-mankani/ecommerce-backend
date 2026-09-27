import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
} from '../utils/tokenUtils.js';

/**
 * POST /api/v1/auth/refresh
 * Body: { refreshToken }
 * Returns: { accessToken, refreshToken }
 */
export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400);
    throw new Error('Refresh token required');
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (err) {
    res.status(401);
    throw new Error('Invalid or expired refresh token');
  }

  const user = await User.findById(payload.id);
  if (!user) {
    res.status(401);
    throw new Error('User no longer exists');
  }

  const meta = {
    userAgent: req.headers['user-agent'] || '',
    ip: req.ip || '',
  };

  try {
    const tokens = await rotateRefreshToken(refreshToken, user, meta);
    res.status(200).json({ success: true, ...tokens });
  } catch (err) {
    res.status(401);
    throw new Error(err.message || 'Refresh failed');
  }
});

/**
 * POST /api/v1/auth/logout-all
 * Requires auth (protect middleware).
 */
export const logoutAll = asyncHandler(async (req, res) => {
  await revokeAllUserTokens(req.user._id);
  res.status(200).json({ success: true, message: 'Logged out from all devices' });
});

/**
 * POST /api/v1/auth/logout-refresh
 * Body: { refreshToken }
 * Revokes a single refresh token server-side.
 */
export const logoutRefresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }
  res.status(200).json({ success: true, message: 'Refresh token revoked' });
});

/**
 * Helper — call this from your existing login/register controllers
 * to issue both tokens. It does NOT mutate your existing logic.
 */
export const issueTokenPair = async (user, req) => {
  const accessToken = signAccessToken(user);
  const refreshToken = await signRefreshToken(user, {
    userAgent: req.headers['user-agent'] || '',
    ip: req.ip || '',
  });
  return { accessToken, refreshToken };
};