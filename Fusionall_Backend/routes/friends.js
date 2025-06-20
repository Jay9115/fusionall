const express = require('express');
const router = express.Router();
const { db } = require('../firebaseAdmin');
const admin = require('firebase-admin');

// Get received friend requests for a user
router.get('/requests/:uid', async (req, res) => {
  const { uid } = req.params;
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });

    const data = userDoc.data();
    const friendRequestsReceived = data.friendRequestsReceived || [];

    // Fetch usernames for each request
    const requestsWithNames = await Promise.all(
      friendRequestsReceived.map(async (friendUid) => {
        const friendDoc = await db.collection('users').doc(friendUid).get();
        return {
          uid: friendUid,
          username: friendDoc.exists ? friendDoc.data().username : 'Unknown'
        };
      })
    );

    res.json(requestsWithNames);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Accept a friend request
router.post('/requests/accept', async (req, res) => {
  const { currentUid, friendUid } = req.body;
  if (!currentUid || !friendUid) return res.status(400).json({ error: 'Missing fields' });

  try {
    const userRef = db.collection('users').doc(currentUid);
    const friendRef = db.collection('users').doc(friendUid);

    // Atomically update both users
    await userRef.update({
      friends: admin.firestore.FieldValue.arrayUnion(friendUid),
      friendRequestsReceived: admin.firestore.FieldValue.arrayRemove(friendUid),
    });

    await friendRef.update({
      friends: admin.firestore.FieldValue.arrayUnion(currentUid),
      friendRequestsSent: admin.firestore.FieldValue.arrayRemove(currentUid),
    });

    res.json({ message: 'Friend request accepted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get friends list for a user
router.get('/:uid', async (req, res) => {
  const { uid } = req.params;
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });

    const data = userDoc.data();
    res.json(data.friends || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Send a friend request
router.post('/requests/send', async (req, res) => {
    const { fromUid, toUid } = req.body;
    if (!fromUid || !toUid) return res.status(400).json({ error: 'Missing fields' });
  
    try {
      const fromRef = db.collection('users').doc(fromUid);
      const toRef = db.collection('users').doc(toUid);
  
      await fromRef.update({
        friendRequestsSent: admin.firestore.FieldValue.arrayUnion(toUid)
      });
      await toRef.update({
        friendRequestsReceived: admin.firestore.FieldValue.arrayUnion(fromUid)
      });
  
      res.json({ message: 'Friend request sent' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

module.exports = router;