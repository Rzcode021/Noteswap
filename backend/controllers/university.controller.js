const University = require('../models/University')
const Note       = require('../models/Note')

// GET /api/universities
const getUniversities = async (req, res) => {
  try {
    const universities = await University.find({ isActive: true }).sort({ name: 1 })

    const withCounts = await Promise.all(
      universities.map(async (u) => {
        const count = await Note.countDocuments({
          university: u._id,
          status: 'approved',
        })
        return { ...u.toObject(), notesCount: count }
      })
    )

    return res.status(200).json({ success: true, data: withCounts })
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/universities/:slug
const getUniversityBySlug = async (req, res) => {
  try {
    const university = await University.findOne({
      slug: req.params.slug,
      isActive: true,
    })
    if (!university) {
      return res.status(404).json({ message: 'University not found' })
    }

    const courseStats = await Promise.all(
      university.courses.map(async (course) => {
        const count = await Note.countDocuments({
          university: university._id,
          course,
          status: 'approved',
        })
        return { course, notesCount: count }
      })
    )

    const categoryStats = await Promise.all(
      ['notes', 'pyq', 'important-questions', 'lab', 'reference'].map(async (category) => {
        const count = await Note.countDocuments({
          university: university._id,
          category,
          status: 'approved',
        })
        return { category, notesCount: count }
      })
    )

    const totalNotes = await Note.countDocuments({
      university: university._id,
      status: 'approved',
    })

    return res.status(200).json({
      success: true,
      data: {
        ...university.toObject(),
        courseStats,
        categoryStats,
        totalNotes,
      },
    })
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/universities/:slug/notes
const getUniversityNotes = async (req, res) => {
  try {
    const university = await University.findOne({
      slug: req.params.slug,
      isActive: true,
    })
    if (!university) {
      return res.status(404).json({ message: 'University not found' })
    }

    const { course, year, subject, category, branch, page = 1, limit = 12 } = req.query

    const filter = { university: university._id, status: 'approved' }
    if (course)   filter.course   = course
    if (year)     filter.year     = year
    if (subject)  filter.subject  = subject
    if (category) filter.category = category
    if (branch)   filter.branch   = branch

    const skip  = (page - 1) * limit
    const notes = await Note.find(filter)
      .populate('subject', 'name slug color icon')
      .populate('uploadedBy', 'name profilePicture college')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    const total = await Note.countDocuments(filter)

    return res.status(200).json({
      success: true,
      count: notes.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: notes,
    })
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// POST /api/universities — admin only
const createUniversity = async (req, res) => {
  try {
    const { name, shortName, location, website, courses } = req.body

    if (!name || !shortName) {
      return res.status(400).json({ message: 'Name and short name are required' })
    }

    const slug = shortName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    const exists = await University.findOne({ slug })
    if (exists) {
      return res.status(400).json({ message: 'University with this short name already exists' })
    }

    const university = await University.create({
      name,
      shortName,
      slug,
      location:  location || null,
      website:   website  || null,
      courses:   courses  || ['B.Tech', 'MCA', 'MBA', 'B.Sc', 'BCA', 'B.Com'],
    })

    return res.status(201).json({ success: true, data: university })
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// PUT /api/universities/:id — admin only
const updateUniversity = async (req, res) => {
  try {
    const university = await University.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    if (!university) {
      return res.status(404).json({ message: 'University not found' })
    }
    return res.status(200).json({ success: true, data: university })
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// DELETE /api/universities/:id — admin only (soft delete)
const deleteUniversity = async (req, res) => {
  try {
    await University.findByIdAndUpdate(req.params.id, { isActive: false })
    return res.status(200).json({ success: true, message: 'University deactivated' })
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = {
  getUniversities,
  getUniversityBySlug,
  getUniversityNotes,
  createUniversity,
  updateUniversity,
  deleteUniversity,
}