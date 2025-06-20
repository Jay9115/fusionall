const express = require('express');
const router = express.Router();
const { db } = require('../firebaseAdmin');

// Create a new blog post
router.post('/', async (req, res) => {
  const { title, content, authorId, authorName } = req.body;
  if (!title || !content || !authorId || !authorName) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    const userBlogsRef = db.collection('Blogs').doc(authorId).collection('BlogEntries');
    const docRef = await userBlogsRef.add({
      title,
      content,
      date: new Date(),
      authorId,
      authorName,
    });
    res.status(201).json({ id: docRef.id, message: 'Blog created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all blogs (across all users)
router.get('/', async (req, res) => {
  try {
    const blogsSnapshot = await db.collectionGroup('BlogEntries').orderBy('date', 'desc').get();
    const blogs = blogsSnapshot.docs.map(doc => ({
      id: doc.id,
      path: doc.ref.path,
      ...doc.data(),
    }));
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a blog post (by path)
router.delete('/', async (req, res) => {
  const { blogPath, authorId, blogId } = req.body;
  if (!blogPath || !authorId || !blogId) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    // Optionally, you can check if the blog belongs to the user (authorId)
    await db.doc(blogPath).delete();
    res.json({ message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;