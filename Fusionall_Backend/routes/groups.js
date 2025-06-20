const express = require('express');
const router = express.Router();
const { db } = require('../firebaseAdmin');

// Get all groups for a user
router.get('/user/:uid', async (req, res) => {
  const { uid } = req.params;
  try {
    const groupQuery = db.collection('groups').where('groupMembers', 'array-contains', uid);
    const groupSnapshot = await groupQuery.get();
    const groups = groupSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new group
router.post('/', async (req, res) => {
  const { groupName, groupMembers, createdBy } = req.body;
  if (!groupName || !Array.isArray(groupMembers) || !createdBy) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    const groupData = {
      groupName,
      groupMembers,
      createdAt: new Date(),
      createdBy,
    };
    const groupRef = await db.collection('groups').add(groupData);
    res.status(201).json({ id: groupRef.id, ...groupData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all messages for a group
router.get('/:groupId/messages', async (req, res) => {
  const { groupId } = req.params;
  try {
    const messagesRef = db.collection('groups').doc(groupId).collection('messages');
    const snapshot = await messagesRef.orderBy('timestamp').get();
    const messages = snapshot.docs.map(doc => doc.data());
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send a message to a group
router.post('/:groupId/messages', async (req, res) => {
  const { groupId } = req.params;
  const { text, sender, photoURL } = req.body;
  if (!text || !sender) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    const messagesRef = db.collection('groups').doc(groupId).collection('messages');
    await messagesRef.add({
      text,
      timestamp: new Date(),
      sender,
      photoURL: photoURL || null,
    });
    res.status(201).json({ message: 'Message sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;