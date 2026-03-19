const express = require('express');
const router = express.Router();
const {
  getSubjects,
  getSubjectBySlug,
  createSubject,
  updateSubject,
  deleteSubject,
  addUnit,
} = require('../controllers/subject.controller');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const adminMiddleware     = require('../middleware/admin.middleware');

// public routes — no auth needed
router.get('/',         getSubjects);
router.get('/:slug',    getSubjectBySlug);

// admin only routes
router.post('/',            verifyFirebaseToken, adminMiddleware, createSubject);
router.put('/:id',          verifyFirebaseToken, adminMiddleware, updateSubject);
router.delete('/:id',       verifyFirebaseToken, adminMiddleware, deleteSubject);
router.post('/:id/units',   verifyFirebaseToken, adminMiddleware, addUnit);

module.exports = router;


// ```

// ---

// ### How to test in Postman

// **Test 1 — Create a subject (admin only)**

// First make sure your test user has `role: "admin"` in MongoDB. You can update it directly in MongoDB Atlas → Collections → users → find your user → edit `role` to `"admin"`.
// ```
// Method  → POST
// URL     → http://localhost:5000/api/subjects
// Headers → Authorization: Bearer <your token>
// Body    → raw → JSON

// {
//   "name": "Software Engineering",
//   "description": "Study of software development processes",
//   "color": "#7F77DD",
//   "icon": "📚",
//   "units": [
//     "Unit 1 — Introduction to SE",
//     "Unit 2 — SDLC Models",
//     "Unit 3 — Requirements Engineering",
//     "Unit 4 — Software Design",
//     "Unit 5 — Testing & Maintenance"
//   ]
// }