const Subject = require('../models/Subject');
const Note = require('../models/Note')

// helper to generate slug from name
const generateSlug = (name) => {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

// GET /api/subjects
// Get all active subjects — public
const getSubjects = async (req, res) => {
  try {
    // Count only approved notes per subject
    const subjects = await Subject.find({})
      .sort({ name: 1 })

    // Get approved note counts for each subject
    const subjectsWithCount = await Promise.all(
      subjects.map(async (subject) => {
        const count = await Note.countDocuments({
          subject: subject._id,
          status: 'approved'
        })
        return {
          ...subject.toObject(),
          notesCount: count
        }
      })
    )

    return res.status(200).json({
      success: true,
      count: subjectsWithCount.length,
      data: subjectsWithCount,
    })
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/subjects/:slug
// Get single subject by slug — public
const getSubjectBySlug = async (req, res) => {
  try {
    const subject = await Subject.findOne({ slug: req.params.slug, isActive: true });
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    return res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/subjects
// Create a new subject — admin only
const createSubject = async (req, res) => {
  try {
    const { name, description, color, icon, units } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Subject name is required' });
    }

    const slug = generateSlug(name);

    // check if subject already exists
    const existing = await Subject.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: 'Subject already exists' });
    }

    const subject = await Subject.create({
      name,
      slug,
      description: description || null,
      color: color || '#7F77DD',
      icon: icon || '📚',
      units: units || [],
    });

    return res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: subject,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/subjects/:id
// Update a subject — admin only
const updateSubject = async (req, res) => {
  try {
    const { name, description, color, icon, units, isActive } = req.body;

    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // update slug if name changed
    if (name && name !== subject.name) {
      subject.slug = generateSlug(name);
      subject.name = name;
    }

    if (description !== undefined) subject.description = description;
    if (color)                     subject.color       = color;
    if (icon)                      subject.icon        = icon;
    if (units)                     subject.units       = units;
    if (isActive !== undefined)    subject.isActive    = isActive;

    await subject.save();

    return res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: subject,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/subjects/:id
// Soft delete — just sets isActive to false — admin only
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    subject.isActive = false;
    await subject.save();

    return res.status(200).json({
      success: true,
      message: 'Subject deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/subjects/:id/units
// Add a unit to a subject — admin only
const addUnit = async (req, res) => {
  try {
    const { unit } = req.body;

    if (!unit) {
      return res.status(400).json({ message: 'Unit name is required' });
    }

    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // check if unit already exists
    if (subject.units.includes(unit)) {
      return res.status(400).json({ message: 'Unit already exists' });
    }

    subject.units.push(unit);
    await subject.save();

    return res.status(200).json({
      success: true,
      message: 'Unit added successfully',
      data: subject,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getSubjects,
  getSubjectBySlug,
  createSubject,
  updateSubject,
  deleteSubject,
  addUnit,
};