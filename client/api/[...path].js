import app from './_lib/app.js';

export default async function handler(req, res) {
  if (!req.url.startsWith('/api/')) req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  return app(req, res);
}
