const adminMiddleware = (req, res, next) => {
  try {
    // req.user is already set by verifyFirebaseToken
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied — admins only' });
    }

    next();

  } catch (error) {
    return res.status(500).json({ message: 'Server error in admin check' });
  }
};

module.exports = adminMiddleware;