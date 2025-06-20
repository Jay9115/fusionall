const express = require('express');
const router = express.Router();
const { db } = require('../firebaseAdmin');

// Helper to get chatId (sorted UIDs)
function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join('_');
}

// Get all messages between two users
router.get('/messages/:uid1/:uid2', async (req, res) => {
  const { uid1, uid2 } = req.params;
  const chatId = getChatId(uid1, uid2);
  try {
    const messagesRef = db.collection('chats').doc(chatId).collection('messages');
    const snapshot = await messagesRef.orderBy('timestamp').get();
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send a message
router.post('/messages', async (req, res) => {
  const { senderUid, receiverUid, text, photoURL } = req.body;
  if (!senderUid || !receiverUid || !text) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const chatId = getChatId(senderUid, receiverUid);
  try {
    const messagesRef = db.collection('chats').doc(chatId).collection('messages');
    const docRef = await messagesRef.add({
      text,
      timestamp: new Date(),
      sender: senderUid,
      photoURL: photoURL || null,
    });
    res.status(201).json({ id: docRef.id, message: 'Message sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete one or more messages
router.delete('/messages', async (req, res) => {
  const { uid1, uid2, messageIds } = req.body;
  if (!uid1 || !uid2 || !Array.isArray(messageIds)) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const chatId = getChatId(uid1, uid2);
  try {
    const batch = db.batch();
    messageIds.forEach(id => {
      const msgRef = db.collection('chats').doc(chatId).collection('messages').doc(id);
      batch.delete(msgRef);
    });
    await batch.commit();
    res.json({ message: 'Messages deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;