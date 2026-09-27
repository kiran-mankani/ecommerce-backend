import User from "../models/User.js";
import {
  verifyRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
} from "../utils/tokenUtils.js";

export const refreshTokens = async ({ refreshToken }, req) => {
  if (!refreshToken) throw new Error("Refresh token required");

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    const err = new Error("Invalid or expired refresh token");
    err.status = 401;
    throw err;
  }

  const user = await User.findById(payload.id);
  if (!user) {
    const err = new Error("User no longer exists");
    err.status = 401;
    throw err;
  }

  const meta = {
    userAgent: req.headers["user-agent"] || "",
    ip: req.ip || "",
  };

  const tokens = await rotateRefreshToken(refreshToken, user, meta);
  return tokens; // { accessToken, refreshToken }
};

export const logoutRefresh = async ({ refreshToken }) => {
  if (refreshToken) await revokeRefreshToken(refreshToken);
  return { message: "Refresh token revoked" };
};

export const logoutAll = async (userId) => {
  await revokeAllUserTokens(userId);
  return { message: "Logged out from all devices" };
};

/**
 * Helper to call from your existing loginUser / signupUser.
 * Does NOT change their return shape — you merge the fields in.
 */
export const issueTokenPair = async (user, req) => {
  const { signAccessToken, signRefreshToken } = await import("../utils/tokenUtils.js");
  const accessToken = signAccessToken(user);
  const refreshToken = await signRefreshToken(user, {
    userAgent: req?.headers?.["user-agent"] || "",
    ip: req?.ip || "",
  });
  return { accessToken, refreshToken };
};