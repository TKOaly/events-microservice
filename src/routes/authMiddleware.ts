export const authorizeRequest = (req, res, next) => {
  if (req.get('X-Token') === process.env.SERVICE_AUTH_TOKEN) {
    return next()
  }
  return res.status(401).json({ error: 'unauthorized' })
}
