const express = require('express');
const router = express.Router();
const { db, auth } = require('../firebaseAdmin');
router.get('/search', async (req, res) => {
    const { username, excludeUid } = req.query;
    if (!username) return res.status(400).json({ error: 'Missing username' });
  
    try {
      const usersRef = db.collection('users');
      // Firestore doesn't support case-insensitive search, so fetch a range
      const snapshot = await usersRef
        .where('username', '>=', username)
        .where('username', '<=', username + '\uf8ff')
        .get();
  
      const users = snapshot.docs
        .map(doc => doc.data())
        .filter(user => user.uid !== excludeUid); // Exclude current user
  
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
// Register or login user (after Google sign-in on frontend)
router.post('/register', async (req, res) => {
  const { uid, email, username } = req.body;
  if (!uid || !email || !username) return res.status(400).json({ error: 'Missing fields' });

  const userRef = db.collection('users').doc(uid);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    // Check if username is unique
    const usersSnapshot = await db.collection('users').where('username', '==', username).get();
    if (!usersSnapshot.empty) {
      return res.status(409).json({ error: 'Username already taken' });
    }
    await userRef.set({ uid, email, username, friends: [] });
    return res.status(201).json({ message: 'User created' });
  } else {
    return res.status(200).json({ message: 'User exists' });
  }
});

// Get user info
router.get('/:uid', async (req, res) => {
  const userRef = db.collection('users').doc(req.params.uid);
  const userDoc = await userRef.get();
  if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });
  res.json(userDoc.data());
});

// Get all usernames (for uniqueness check)
router.get('/', async (req, res) => {
  const usersSnapshot = await db.collection('users').get();
  const usernames = usersSnapshot.docs.map(doc => doc.data().username);
  res.json(usernames);
});

module.exports = router;