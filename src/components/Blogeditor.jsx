import React, { useState } from 'react';
import './Blogeditor.css'; // Optional: for styling the editor
import { auth, firestore } from './firebase'; // Import your Firebase setup
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const BlogEditor = ({ onCancel }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const currentUser = auth.currentUser;

        if (!currentUser) {
            alert("Please log in to save your blog.");
            return;
        }

        if (title && content) {
            try {
                const userBlogsRef = collection(firestore, 'Blogs', currentUser.uid, 'BlogEntries');
                await addDoc(userBlogsRef, {
                    title,
                    content,
                    date: serverTimestamp(),
                });
                alert("Blog saved successfully!");
                setTitle('');
                setContent('');
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
