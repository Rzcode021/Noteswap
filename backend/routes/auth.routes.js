const express = require('express');
const router = express.Router();
const { syncUser, getMe, logoutUser } = require('../controllers/auth.controller');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');

// POST /api/auth/sync — no middleware needed, verifies token internally
router.post('/sync', syncUser);

// GET /api/auth/me — protected route
router.get('/me', verifyFirebaseToken, getMe);

router.post('/logout', verifyFirebaseToken, logoutUser);

module.exports = router;
// ```

// ---

// ### How to test in Postman

// You need a real Firebase `idToken` first. Here's the quickest way to get one:

// **Step 1** — Go to your Firebase Console → Authentication → Sign-in method → Enable **Email/Password**

// **Step 2** — Create a test user in Firebase Console → Authentication → Users → Add user:
// ```
// Email:    test@noteswap.com
// Password: test1234