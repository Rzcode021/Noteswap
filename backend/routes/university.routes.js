const express         = require('express')
const router          = express.Router()
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken')
const adminMiddleware     = require('../middleware/admin.middleware')
const {
  getUniversities,
  getUniversityBySlug,
  getUniversityNotes,
  createUniversity,
  updateUniversity,
  deleteUniversity,
} = require('../controllers/university.controller')

router.get('/',            getUniversities)
router.get('/:slug',       getUniversityBySlug)
router.get('/:slug/notes', getUniversityNotes)
router.post('/',           verifyFirebaseToken, adminMiddleware, createUniversity)
router.put('/:id',         verifyFirebaseToken, adminMiddleware, updateUniversity)
router.delete('/:id',      verifyFirebaseToken, adminMiddleware, deleteUniversity)

module.exports = router;