// src/BlogEditor.js
import React, { useState } from 'react';
import './Blogeditor.css'; // Optional: for styling the editor

const BlogEditor = ({ onSave, onCancel }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (title && content) {
            onSave({ title, content, date: new Date().toLocaleString() });
            setTitle('');
            setContent('');
        }
    };

    return (
        <div className="blog-editor">
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
                    placeholder="Write your blog content here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                />
                <div className="editor-buttons">
                    <button type="submit">Save Blog</button>
                    <button type="button" onClick={onCancel}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default BlogEditor;
