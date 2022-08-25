const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, 'secret', (err, user) => {
    if (err) return res.status(403).send({ message: 'Unauthorized' })
    req.user = user._id
    next()
  })
}

module.exports = authenticateToken