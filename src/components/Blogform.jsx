import React, { useState } from 'react';

function BlogForm({ addBlog }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title && content) {
      addBlog({ title, content });
      setTitle('');
      setContent('');
    }
  };

  return (
    <div className="blog-form">
      <h2>Write a New Blog</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Blog Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Blog Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button type="submit">Post Blog</button>
      </form>
    </div>
  );
}

export default BlogForm;
