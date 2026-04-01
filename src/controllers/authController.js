import { getDb } from '../services/db.js';
import { comparePassword } from '../services/password.js';
import { signToken } from '../middlewares/auth.js';

export function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = getDb()
      .prepare('SELECT id, email, password_hash, role, status FROM users WHERE email = ?')
      .get(email);

    if (!user || user.status !== 'active' || !comparePassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken(user.id);
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
}
