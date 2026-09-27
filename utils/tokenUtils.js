import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import RefreshToken from '../models/RefreshToken.js';

const ACCESS_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
const ACCESS_EXPIRES = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Sign a short-lived access token.
 */
export const signAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  );
};

/**
 * Sign a long-lived refresh token and persist it in DB.
 */
export const signRefreshToken = async (user, meta = {}) => {
  const jti = crypto.randomBytes(32).toString('hex');

  const token = jwt.sign(
    { id: user._id, jti },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES }
  );

  const decoded = jwt.decode(token);
  const expiresAt = new Date(decoded.exp * 1000);

  await RefreshToken.create({
    user: user._id,
    token,
    expiresAt,
    userAgent: meta.userAgent || '',
    ip: meta.ip || '',
  });

  return token;
};

/**
 * Verify a refresh token and return its payload. Throws if invalid.
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};

/**
 * Rotate: revoke old, issue new. Returns { accessToken, refreshToken }.
 */
export const rotateRefreshToken = async (oldToken, user, meta = {}) => {
  const stored = await RefreshToken.findOne({ token: oldToken });

  if (!stored) throw new Error('Refresh token not recognized');
  if (stored.revoked) throw new Error('Refresh token already revoked');

  const newRefresh = await signRefreshToken(user, meta);

  stored.revoked = true;
  stored.replacedBy = newRefresh;
  await stored.save();

  const accessToken = signAccessToken(user);

  return { accessToken, refreshToken: newRefresh };
};

/**
 * Revoke a single refresh token (logout).
 */
export const revokeRefreshToken = async (token) => {
  await RefreshToken.updateOne({ token }, { $set: { revoked: true } });
};

/**
 * Revoke all refresh tokens for a user (logout everywhere / password change).
 */
export const revokeAllUserTokens = async (userId) => {
  await RefreshToken.updateMany(
    { user: userId, revoked: false },
    { $set: { revoked: true } }
  );
};