'use strict';
const jwt = require('jsonwebtoken');
const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_ACCESS_EXPIRES = '15m', JWT_REFRESH_EXPIRES = '7d', NODE_ENV } = process.env;

function signAccessToken(payload)   { return jwt.sign(payload, JWT_ACCESS_SECRET,  { expiresIn: JWT_ACCESS_EXPIRES,  algorithm: 'HS256' }); }
function signRefreshToken(payload)  { return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES, algorithm: 'HS256' }); }
function verifyAccessToken(token)   { return jwt.verify(token, JWT_ACCESS_SECRET); }
function verifyRefreshToken(token)  { return jwt.verify(token, JWT_REFRESH_SECRET); }

const ACCESS_COOKIE  = { httpOnly: true, secure: NODE_ENV==='production', sameSite: 'strict', maxAge: 15*60*1000 };
const REFRESH_COOKIE = { httpOnly: true, secure: NODE_ENV==='production', sameSite: 'strict', maxAge: 7*24*60*60*1000, path: '/api/auth/refresh-token' };

function sendTokens(res, user) {
  const payload = { id: user._id, role: user.role };
  const accessToken  = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  res.cookie('accessToken', accessToken, ACCESS_COOKIE);
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE);
  return { accessToken, refreshToken };
}
function clearTokens(res) {
  res.clearCookie('accessToken',  { httpOnly: true, sameSite: 'strict' });
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict', path: '/api/auth/refresh-token' });
}
module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken, sendTokens, clearTokens };
