import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import type { AdminModulePermission, DbUser, UserRole } from './types.ts';
import { getDatabase } from './store.ts';

export const SESSION_COOKIE_NAME = 'velora_session';

export interface AuthenticatedRequest extends Request {
  authUser?: DbUser;
}

export function hashPassword(password: string, existingSalt?: string): { hash: string; salt: string } {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash: derived, salt };
}

export function verifyPassword(password: string, storedHash: string, storedSalt: string): boolean {
  if (!storedHash || !storedSalt) return false;
  const derived = crypto.scryptSync(password, storedSalt, 64);
  const storedBuf = Buffer.from(storedHash, 'hex');
  if (derived.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(derived, storedBuf);
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

interface SessionPayload {
  uid: string;
  role: UserRole;
  exp: number;
}

export function signSessionToken(user: DbUser, rememberMe: boolean): string {
  const db = getDatabase();
  const ttlMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 12 * 60 * 60 * 1000;
  const payload: SessionPayload = {
    uid: user.id,
    role: user.role,
    exp: Date.now() + ttlMs,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', db.sessionSecret)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || !token.includes('.')) return null;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;
  const db = getDatabase();
  const expected = crypto
    .createHmac('sha256', db.sessionSecret)
    .update(encoded)
    .digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload;
    if (!parsed.uid || !parsed.exp || parsed.exp < Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.cookie;
  const cookies: Record<string, string> = {};
  if (!header) return cookies;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = decodeURIComponent(part.slice(idx + 1).trim());
    cookies[key] = val;
  }
  return cookies;
}

export function setSessionCookie(res: Response, token: string, rememberMe: boolean): void {
  const maxAgeSeconds = rememberMe ? 30 * 24 * 60 * 60 : 12 * 60 * 60;
  const isProd = process.env.NODE_ENV === 'production';
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (isProd) {
    parts.push('Secure');
  }
  res.setHeader('Set-Cookie', parts.join('; '));
}

export function clearSessionCookie(res: Response): void {
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
}

export function sanitizeUser(user: DbUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    employeeId: user.employeeId,
    permissions: user.permissions,
    active: user.active,
    lastLoginAt: user.lastLoginAt,
  };
}

export function getRequestAuthUser(req: Request): DbUser | null {
  const cookies = parseCookies(req);
  const rawToken = cookies[SESSION_COOKIE_NAME];
  if (!rawToken) return null;
  const payload = verifySessionToken(rawToken);
  if (!payload) return null;
  const db = getDatabase();
  const user = db.users.find((u) => u.id === payload.uid && u.active);
  if (!user) return null;
  if (user.employeeId) {
    const emp = db.employees.find((e) => e.id === user.employeeId);
    if (emp && emp.status === 'Inactive') return null;
  }
  return user;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const user = getRequestAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  req.authUser = user;
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const user = getRequestAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Admin authentication required.' });
  }
  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN_MANAGER') {
    return res.status(403).json({ error: 'Forbidden: Admin privileges required.' });
  }
  req.authUser = user;
  next();
}

export function requireAdminPermission(permission: AdminModulePermission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.authUser || getRequestAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Admin authentication required.' });
    }
    if (user.role === 'SUPER_ADMIN') {
      req.authUser = user;
      return next();
    }
    if (user.role === 'ADMIN_MANAGER' && user.permissions.includes(permission)) {
      req.authUser = user;
      return next();
    }
    return res.status(403).json({
      error: `Forbidden: Missing '${permission}' module permission.`,
    });
  };
}

export function requireEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const user = getRequestAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Employee authentication required.' });
  }
  if (
    user.role !== 'EMPLOYEE' &&
    user.role !== 'ADMIN_MANAGER' &&
    user.role !== 'SUPER_ADMIN'
  ) {
    return res.status(403).json({ error: 'Forbidden: Staff privileges required.' });
  }
  req.authUser = user;
  next();
}
