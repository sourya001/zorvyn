import { getDb } from '../services/db.js';

export function createRecord(req, res, next) {
  try {
    const { userId, amount, type, category, date, notes } = req.body;
    const now = new Date().toISOString();

    const result = getDb()
      .prepare(
        'INSERT INTO records (user_id, amount, type, category, date, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      )
      .run(userId, amount, type, category, date, notes || '', now, now);

    res.status(201).json({
      id: result.lastInsertRowid,
      userId,
      amount,
      type,
      category,
      date,
      notes: notes || '',
      createdAt: now,
      updatedAt: now
    });
  } catch (err) {
    next(err);
  }
}

export function listRecords(req, res, next) {
  try {
    const { type, category, startDate, endDate, userId } = req.query;
    const conditions = [];
    const params = [];

    if (type) {
      conditions.push('type = ?');
      params.push(type);
    }
    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }
    if (userId) {
      conditions.push('user_id = ?');
      params.push(Number(userId));
    }
    if (startDate) {
      conditions.push('date >= ?');
      params.push(startDate);
    }
    if (endDate) {
      conditions.push('date <= ?');
      params.push(endDate);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const records = getDb()
      .prepare(`SELECT * FROM records ${where} ORDER BY date DESC`)
      .all(...params);

    res.json({ records });
  } catch (err) {
    next(err);
  }
}

export function getRecord(req, res, next) {
  try {
    const id = Number(req.params.id);
    const record = getDb().prepare('SELECT * FROM records WHERE id = ?').get(id);

    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ record });
  } catch (err) {
    next(err);
  }
}

export function updateRecord(req, res, next) {
  try {
    const id = Number(req.params.id);
    const existing = getDb().prepare('SELECT id FROM records WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({ error: 'Record not found' });
    }

    const updates = [];
    const values = [];

    ['amount', 'type', 'category', 'date', 'notes'].forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    });

    if (!updates.length) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(new Date().toISOString());
    values.push(id);

    const stmt = `UPDATE records SET ${updates.join(', ')}, updated_at = ? WHERE id = ?`;
    getDb().prepare(stmt).run(...values);

    const record = getDb().prepare('SELECT * FROM records WHERE id = ?').get(id);
    res.json({ record });
  } catch (err) {
    next(err);
  }
}

export function deleteRecord(req, res, next) {
  try {
    const id = Number(req.params.id);
    const result = getDb().prepare('DELETE FROM records WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
