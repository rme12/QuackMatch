// routes/characters.js
import { Router } from 'express';
import { connectToDb } from '../config/mongoConnection.js';
import bcrypt from 'bcrypt';
import { onboardingQuestions, saveUserOnboardingData } from '../helpers/onboarding.js';
import { ObjectId } from 'mongodb';
import {findAndUpdateMatches} from '../data/roommateMatcher.js';
import multer from 'multer';
const upload = multer({ dest: 'public/uploads/' }); // or use cloud storage



const router = Router();

router.get('/', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    const db = await connectToDb();
    const user = await db.collection('Users').findOne({ _id: new ObjectId(req.session.userId) });

    if (!user) {
        req.session.destroy(() => res.redirect('/login'));
    } else if (!user.preferences) {
        return res.redirect('/onboarding');
    } else {
        res.render('/home', { title: 'Home', user });
    }
});

// GET - Login Page
router.get('/login', async (req, res) => {
    try {
        res.render('login', { title: 'Login to QuackMatch' });
    } catch (e) {
        res.status(500).render('error', { error: e.message });
    }
});

// POST - Login Page
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const db = await connectToDb();

    if (!email || !password) {
        return res.status(400).render('login', { error: 'Please enter both email and password.' });
    }

    const user = await db.collection('Users').findOne({ email });

    if (!user) {
        return res.status(401).render('login', { error: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.hashedPassword);

    if (!match) {
        return res.status(401).render('login', { error: 'Invalid email or password.' });
    }

    // Success: create session
    req.session.userId = user._id;

    // Redirect based on preferences
    if (!user.preferences) {
        return res.redirect('/onboarding');
    } else {
        const updateMatches = await findAndUpdateMatches(user._id);
        return res.redirect('/home');
    }
});


// GET - Register Page
router.get('/register', async (req, res) => {
    try {
        res.render('register', { title: 'Register with QuackMatch' });
    } catch (e) {
        res.status(500).render('error', { error: e.message });
    }
});

// POST - Register Page
router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password, confirm } = req.body;
    const db = await connectToDb();

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).render('register', { error: 'All fields are required' });
    }

    if (password !== confirm) {
        return res.status(400).render('register', { error: 'Passwords do not match.' });
    }

    const existing = await db.collection('Users').findOne({ email });
    if (existing) {
        return res.status(400).render('register', { error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.collection('Users').insertOne({
        firstName,
        lastName,
        email,
        hashedPassword,
        matchedUsers: [],
        chatHistoryIds: [],
        preferences: null
    });

    req.session.userId = result.insertedId;
    res.redirect('/onboarding');
});


router.get('/home', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    const db = await connectToDb();
    const user = await db.collection('Users').findOne({ _id: new ObjectId(req.session.userId) });
    console.log(user);
    if (!user) {
        req.session.destroy(() => res.redirect('/login'));
    } else if (!user.preferences) {
        return res.redirect('/onboarding');
    } else {
        const notificationCount = 0;
        /*
        Once Messages is created make notifificationCount something like this
        const notificationCount = await db.collection('Messages').countDocuments({recipientId: user._id, read: false});
        */
        res.render('home', { title: 'Home', user, notificationCount });
    }
});

// GET - Onboarding Question
router.get('/onboarding', (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    const index = parseInt(req.query.q) || 0;
    const question = onboardingQuestions[index];

    if (!question) return res.redirect('/home');

    res.render('onboarding', {
        title: 'Onboarding',
        question,
        questionIndex: index,
        totalQuestions: onboardingQuestions.length
    });
});

// POST - Onboarding Answer
router.post('/onboarding', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    const { field, value, index } = req.body;
    const currentIndex = parseInt(index);
    req.session.onboardingData = req.session.onboardingData || {};
    req.session.onboardingData[field] = value;

    const nextIndex = currentIndex + 1;

    if (nextIndex >= onboardingQuestions.length) {
        // Save to DB using helper
        await saveUserOnboardingData(req.session.userId, req.session.onboardingData);
        delete req.session.onboardingData;
        return res.redirect('/upload-profile-pic');
    }

    res.redirect(`/onboarding?q=${nextIndex}`);
});

// GET - Upload Profile Picture Page
router.get('/upload-profile-pic', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }

    res.render('profile_picture', {
        title: 'Upload your profile picture'
    });
});

// POST - Upload Profile Picture Page
router.post('/upload-profile-pic', upload.single('profilePic'), async (req, res) => {
    const db = await connectToDb();
    const userId = req.session.userId;

    const picPath = req.file.path.replace(/^public[\\/]/, '') // strip "public/" or "public\"
    .replace(/\\/g, '/'); 

    await db.collection('Users').updateOne(
        { _id: new ObjectId(userId) },
        { $set: { profilePicPath: picPath } }
    );

    res.redirect('/loading');
});

// GET - Loading page
router.get('/loading', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }

    res.render('loading', {
        title: 'Matching in progress'
    });
});

router.get('/profile', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }

    const db = await connectToDb();
    const user = await db.collection('Users').findOne({ _id: new ObjectId(req.session.userId) });

    const excludedFields = ['studentID', 'age', 'gender'];
    const userPreferences = user.preferences;
    const filteredQuestions = onboardingQuestions.filter(q => !excludedFields.includes(q.field));
    
    res.render('profile', { user: userPreferences, onboardingQuestions : filteredQuestions});
});

router.post('/profile/update', async (req, res) => {
    const db = await connectToDb();
    const userId = new ObjectId(req.session.userId);
    const excludedFields = ['studentID', 'age', 'gender'];
  
    // Build the update object by excluding certain fields
    
    const updates = {};
    for (const [key, value] of Object.entries(req.body)) {
      if (!excludedFields.includes(key)) {
        // Handle multi-selects properly (arrays come in as strings if only one item)
        if (Array.isArray(value)) {
          updates[key] = value;
        } else if (value === 'true' || value === 'false') {
          updates[key] = value === 'true'; // convert strings to actual booleans
        } else {
          updates[key] = value;
        }
      }
    }
  
    await db.collection('Users').updateOne(
      { _id: userId },
      { $set: {preferences: req.body}}
    );
  
    res.redirect('/profile');
  });


export default router;