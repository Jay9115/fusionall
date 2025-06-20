const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getStorage } = require('firebase-admin/storage');
const { db } = require('../firebaseAdmin');
const admin = require('firebase-admin');

// Multer setup for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Upload a file to a group
router.post('/upload/:groupId', upload.single('file'), async (req, res) => {
  const { groupId } = req.params;
  const { uploaderUid } = req.body;
  if (!req.file || !uploaderUid) return res.status(400).json({ error: 'Missing file or uploaderUid' });

  try {
    const storage = getStorage();
    const bucket = storage.bucket();
    const fileName = `groups/${groupId}/files/${uploaderUid}_${req.file.originalname}`;
    const file = bucket.file(fileName);

    await file.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype }
    });

    // Optionally, you can store file metadata in Firestore for easier listing
    await db.collection('groups').doc(groupId).collection('files').add({
      fileName: req.file.originalname,
      storagePath: fileName,
      uploaderUid,
      uploadedAt: new Date()
    });

    res.status(201).json({ message: 'File uploaded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all files for a group
router.get('/list/:groupId', async (req, res) => {
  const { groupId } = req.params;
  try {
    // If you store metadata in Firestore, use this:
    const filesSnapshot = await db.collection('groups').doc(groupId).collection('files').get();
    const files = await Promise.all(filesSnapshot.docs.map(async docSnap => {
      const data = docSnap.data();
      // Get download URL
      const storage = getStorage();
      const bucket = storage.bucket();
      const file = bucket.file(data.storagePath);
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 60 * 60 * 1000 // 1 hour
      });
      // Get uploader name
      const userDoc = await db.collection('users').doc(data.uploaderUid).get();
      const uploader = userDoc.exists ? userDoc.data().username : 'Unknown';
      return {
        name: data.fileName,
        url,
        uploader
      };
    }));
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;