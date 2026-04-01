import { getDb } from '../services/db.js';

export function getSummary(req, res, next) {
  try {
    const db = getDb();
    const income = db.prepare("SELECT COALESCE(SUM(amount), 0) AS total FROM records WHERE type = 'income'").get();
    const expense = db.prepare("SELECT COALESCE(SUM(amount), 0) AS total FROM records WHERE type = 'expense'").get();

    res.json({
      totalIncome: Number(income.total),
      totalExpense: Number(expense.total),
      netBalance: Number(income.total) - Number(expense.total)
    });
  } catch (err) {
    next(err);
  }
}

export function getCategoryTotals(req, res, next) {
  try {
    const rows = getDb()
      .prepare('SELECT category, type, COALESCE(SUM(amount), 0) AS total FROM records GROUP BY category, type ORDER BY total DESC')
      .all();

    res.json({ categories: rows.map(r => ({ ...r, total: Number(r.total) })) });
  } catch (err) {
    next(err);
  }
}

export function getRecentActivity(req, res, next) {
  try {
    const rows = getDb()
      .prepare('SELECT id, user_id AS userId, amount, type, category, date, notes, created_at AS createdAt FROM records ORDER BY date DESC LIMIT 10')
      .all();

    res.json({ recent: rows });
  } catch (err) {
    next(err);
  }
}

export function getMonthlyTrends(req, res, next) {
  try {
    const rows = getDb()
      .prepare(`
        SELECT substr(date, 1, 7) AS period,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
        FROM records
        GROUP BY period
        ORDER BY period DESC
        LIMIT 12
      `)
      .all();

    res.json({
      trends: rows.map(r => ({
        period: r.period,
        income: Number(r.income),
        expense: Number(r.expense)
      }))
    });
  } catch (err) {
    next(err);
  }
}
