import jwt from 'jsonwebtoken';

export const protect = (handler) => async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = userId;
    return handler(req, res);
  } catch (error) {
    return res.status(500).json({ message: 'Invalid token' });
  }
}