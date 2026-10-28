import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'hotelpro-local-development-secret-change-before-deploy';

export function createSession(user) {
  return jwt.sign({ sub: String(user._id), type: user.type }, secret, { expiresIn: '7d' });
}

export function optionalAuth(req, _res, next) {
  const value = req.headers.authorization;
  if (!value?.startsWith('Bearer ')) return next();
  try { req.user = jwt.verify(value.slice(7), secret); }
  catch { return next(Object.assign(new Error('Your session has expired. Please sign in again.'), { status: 401 })); }
  next();
}

export function requireAuth(req, res, next) {
  optionalAuth(req, res, error => {
    if (error) return next(error);
    if (!req.user) return res.status(401).json({ message: 'Please sign in to continue.' });
    next();
  });
}
