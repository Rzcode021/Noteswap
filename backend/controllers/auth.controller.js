const User  = require('../models/User')
const admin = require('../config/firebase')

// POST /api/auth/sync
const syncUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const idToken      = authHeader.split('Bearer ')[1]
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    const { uid, email, name, picture, phone_number } = decodedToken
    const firebaseUser = await admin.auth().getUser(uid)

    // ✅ Get extra data from signup form (sent via body)
    const { phone, college, semester, year } = req.body

    // Step 1 — find by firebaseUid
    let user = await User.findOne({ firebaseUid: uid })

    // Step 2 — find by email (Google login after email signup)
    if (!user && email) {
      user = await User.findOne({ email: email.toLowerCase() })
      if (user) {
        user.firebaseUid  = uid
        user.lastLoginAt  = new Date()
        user.lastActiveAt = new Date()
        if (phone    && !user.phone)    user.phone    = phone
        if (college  && !user.college)  user.college  = college
        if (semester && !user.semester) user.semester = semester
        if (year     && !user.year)     user.year     = year
        if (firebaseUser.photoURL && !user.profilePicture) {
          user.profilePicture = firebaseUser.photoURL
        }
        await user.save()
        console.log('✅ Existing user linked:', user.email)
        return res.status(200).json({ success: true, message: 'User linked', data: user })
      }
    }

    // Step 3 — update existing user
    if (user) {
      user.lastLoginAt  = new Date()
      user.lastActiveAt = new Date()
      if (phone    && !user.phone)    user.phone    = phone
      if (college  && !user.college)  user.college  = college
      if (semester && !user.semester) user.semester = semester
      if (year     && !user.year)     user.year     = year
      if (firebaseUser.photoURL && !user.profilePicture) {
        user.profilePicture = firebaseUser.photoURL
      }
      if (firebaseUser.phoneNumber && !user.phone) {
        user.phone = firebaseUser.phoneNumber
      }
      await user.save()
      console.log('✅ User synced:', user.email)
      return res.status(200).json({ success: true, message: 'User logged in', data: user })
    }

    // Step 4 — create new user
    const isAdmin       = email === process.env.ADMIN_EMAIL
    const isGoogleLogin = decodedToken.firebase?.sign_in_provider === 'google.com'
    const isOTPLogin    = decodedToken.firebase?.sign_in_provider === 'phone'

    let userName = 'Student'
    if (firebaseUser.displayName)      userName = firebaseUser.displayName
    else if (name)                     userName = name
    else if (email)                    userName = email.split('@')[0]
    else if (firebaseUser.phoneNumber) userName = `User_${firebaseUser.phoneNumber.slice(-4)}`

    user = await User.create({
      firebaseUid:    uid,
      name:           userName,
      email:          email?.toLowerCase() || null,
      phone:          phone || firebaseUser.phoneNumber || phone_number || null,  // ✅ form phone
      college:        college  || null,   // ✅ from signup form
      semester:       semester || null,   // ✅ from signup form
      year:           year     || null,   // ✅ from signup form
      profilePicture: firebaseUser.photoURL || picture || null,
      role:           isAdmin ? 'admin' : 'user',
      isVerified:     true,
      loginProvider:  isGoogleLogin ? 'google' : isOTPLogin ? 'phone' : 'email',
      lastLoginAt:    new Date(),
      lastActiveAt:   new Date(),
    })

    console.log('✅ New user created:', user.email)
    return res.status(201).json({ success: true, message: 'User created', data: user })

  } catch (error) {
    console.error('❌ Sync error:', error.message)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0]
      return res.status(409).json({
        message: `Account already exists with this ${field}`,
        code: 'DUPLICATE_USER',
      })
    }
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-__v')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    return res.status(200).json({ success: true, data: user })
  } catch (error) {
    return res.status(500).json({ message: 'Server error' })
  }
}

// POST /api/auth/logout
const logoutUser = async (req, res) => {
  try {
    await admin.auth().revokeRefreshTokens(req.user.firebaseUid)
    await User.findByIdAndUpdate(req.user._id, { lastActiveAt: new Date() })
    return res.status(200).json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    return res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { syncUser, getMe, logoutUser }