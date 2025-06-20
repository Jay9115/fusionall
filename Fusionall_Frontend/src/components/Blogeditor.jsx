import React, { useState, useEffect } from 'react';
import './Blogeditor.css';
import { auth } from './firebase';

const BlogEditor = ({ onCancel }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        const fetchUsername = async () => {
            const currentUser = auth.currentUser;
            if (currentUser) {
                try {
                    const res = await fetch(`https://fusionall-bckend.onrender.com/api/auth/${currentUser.uid}`);
                    if (res.ok) {
                        const userData = await res.json();
                        setUsername(userData.username);
                    }
                } catch (error) {
                    console.error("Error fetching username:", error);
                }
            }
        };
        fetchUsername();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const currentUser = auth.currentUser;

        if (!currentUser) {
            alert("Please log in to save your blog.");
            return;
        }

        if (title && content) {
            try {
                const response = await fetch('https://fusionall-bckend.onrender.com/api/blogs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title,
                        content,
                        authorId: currentUser.uid,
                        authorName: username,
                    }),
                });
                if (response.ok) {
                    alert("Blog saved successfully!");
                    setTitle('');
                    setContent('');
                } else {
                    alert("Failed to save the blog. Please try again.");
                }
            } catch (error) {
                console.error("Error saving blog:", error);
                alert("Failed to save the blog. Please try again.");
            }
        } else {
            alert("Both title and content are required.");
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