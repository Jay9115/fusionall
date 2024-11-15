import React, { useState, useEffect } from 'react';
import './Blogeditor.css'; // Optional: for styling the editor
import { auth, firestore } from './firebase'; // Import your Firebase setup
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';

const BlogEditor = ({ onCancel }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        const fetchUsername = async () => {
            const currentUser = auth.currentUser;
            if (currentUser) {
                try {
                    const userDocRef = doc(firestore, 'users', currentUser.uid);
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        setUsername(userDoc.data().username);
                    } else {
                        console.error("User document not found.");
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
                const userBlogsRef = collection(firestore, 'Blogs', currentUser.uid, 'BlogEntries');
                await addDoc(userBlogsRef, {
                    title,
                    content,
                    date: serverTimestamp(),
                    authorId: username, // Save the username as authorId
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
