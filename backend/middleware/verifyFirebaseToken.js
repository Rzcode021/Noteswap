const admin = require('../config/firebase');
const User  = require('../models/User');

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    // verify token with Firebase — checkRevoked: true means
    // if admin revokes a user's session it takes effect immediately
    const decodedToken = await admin.auth().verifyIdToken(idToken, true);

    // check token age — if older than 7 days force re-login
    const SESSION_DURATION_DAYS = 7;
    const tokenAgeSeconds = Math.floor(Date.now() / 1000) - decodedToken.iat;
    const maxAgeSeconds   = SESSION_DURATION_DAYS * 24 * 60 * 60;

    if (tokenAgeSeconds > maxAgeSeconds) {
      return res.status(401).json({
        message: 'Session expired — please login again',
        code: 'SESSION_EXPIRED',
      });
    }

    // find user in MongoDB
    const user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!user) {
      return res.status(404).json({ message: 'User not found in database' });
    }

    // attach user and token info to request
    req.user       = user;
    req.tokenInfo  = {
      uid:       decodedToken.uid,
      email:     decodedToken.email,
      issuedAt:  decodedToken.iat,
      expiresAt: decodedToken.exp,
    };

    next();

  } catch (error) {
    // handle specific Firebase errors
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        message: 'Token expired — please refresh your session',
        code: 'TOKEN_EXPIRED',
      });
    }
    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        message: 'Session revoked — please login again',
        code: 'SESSION_REVOKED',
      });
    }
    if (error.code === 'auth/user-disabled') {
      return res.status(403).json({
        message: 'Your account has been disabled',
        code: 'USER_DISABLED',
      });
    }

    console.error('Token verification error:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = verifyFirebaseToken;