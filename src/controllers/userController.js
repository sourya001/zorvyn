import { getDb } from '../services/db.js';
import { hashPassword } from '../services/password.js';

export function createUser(req, res, next) {
  try {
    const { name, email, password, role, status = 'active' } = req.body;
    const passwordHash = hashPassword(password);
    const createdAt = new Date().toISOString();

    const result = getDb()
      .prepare(
        'INSERT INTO users (name, email, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .run(name, email, passwordHash, role, status, createdAt);

    res.status(201).json({
      user: { id: result.lastInsertRowid, name, email, role, status, createdAt }
    });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    next(err);
  }
}

export function listUsers(req, res, next) {
  try {
    const users = getDb()
      .prepare('SELECT id, name, email, role, status, created_at AS createdAt FROM users')
      .all();
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

export function getUserById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const user = getDb()
      .prepare('SELECT id, name, email, role, status, created_at AS createdAt FROM users WHERE id = ?')
      .get(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export function updateUser(req, res, next) {
  try {
    const id = Number(req.params.id);
    const existing = getDb().prepare('SELECT id FROM users WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates = [];
    const values = [];

    ['name', 'role', 'status'].forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    });

    if (!updates.length) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const stmt = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    getDb().prepare(stmt).run(...values);

    const updated = getDb()
      .prepare('SELECT id, name, email, role, status, created_at AS createdAt FROM users WHERE id = ?')
      .get(id);

    res.json({ user: updated });
  } catch (err) {
    next(err);
  }
}

export function deactivateUser(req, res, next) {
  try {
    const id = Number(req.params.id);
    const result = getDb().prepare('UPDATE users SET status = ? WHERE id = ?').run('inactive', id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
