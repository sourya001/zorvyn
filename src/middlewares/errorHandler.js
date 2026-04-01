export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const msg = err.message || 'Server error';

  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  res.status(status).json({ error: msg });
}
