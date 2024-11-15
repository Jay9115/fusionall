import React, { useEffect, useState } from 'react';
import { firestore } from './firebase';
import { collectionGroup, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

function BlogList() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedBlogId, setExpandedBlogId] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        // Get current user ID
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
            console.log('Current User ID:', user.uid); // Debugging user ID
            setCurrentUserId(user.uid);
        } else {
            console.warn('No user is logged in.');
        }

        // Fetch all blogs
        const allBlogsRef = collectionGroup(firestore, 'BlogEntries');
        const q = query(allBlogsRef, orderBy('date', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const blogsData = snapshot.docs.map((doc) => {
                const data = doc.data();
                console.log('Fetched Blog Data:', data); // Debugging fetched blog data
                return {
                    id: doc.id,
                    path: doc.ref.path, // Include full path
                    ...data,
                };
            });
            setBlogs(blogsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleToggle = (blogId) => {
        setExpandedBlogId((prevId) => (prevId === blogId ? null : blogId));
    };

    const handleDelete = async (blogId, blogPath) => {
        try {
            const blogRef = doc(firestore, blogPath); // Use the provided path
            await deleteDoc(blogRef);
            alert('Blog deleted successfully.');
        } catch (error) {
            console.error('Error deleting blog: ', error);
            alert('Failed to delete the blog. Please try again.');
        }
    };

    return (
        <div className="blog-list">
            <h2>All Blogs</h2>
            {loading ? (
                <p>Loading blogs...</p>
            ) : blogs.length === 0 ? (
                <p>No blogs posted yet.</p>
            ) : (
                blogs.map((blog) => (
                    <div
                        key={blog.id}
                        className="blog-container"
                        style={{
                            width: '100%',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            padding: '10px',
                            margin: '10px 0',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            cursor: 'pointer',
                        }}
                    >
                        <h3
                            style={{
                                margin: '0 0 5px 0',
                                color: expandedBlogId === blog.id ? '#333' : '#007BFF',
                                textDecoration: expandedBlogId === blog.id ? 'none' : 'underline',
                            }}
                            onClick={() => handleToggle(blog.id)}
                        >
                            {blog.title}
                        </h3>
                        {expandedBlogId === blog.id && (
                            <div>
                                <p>{blog.content}</p>
                                <p className="blog-author">
                                    Author: {blog.authorName || 'Unknown'}
                                </p>
                                <p className="blog-date">
                                    Posted on: {new Date(blog.date?.seconds * 1000).toLocaleString()}
                                </p>
                                {currentUserId === blog.authorId ? (
                                    <>
                                        <p>Debug: Delete button should appear for blog ID {blog.id}</p>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(blog.id, blog.path);
                                            }}
                                            style={{
                                                marginTop: '10px',
                                                padding: '5px 10px',
                                                backgroundColor: '#ff4d4d',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '5px',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </>
                                ) : (
                                    <p>Debug: Delete button hidden for user ID {currentUserId}</p>
                                )}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}

export default BlogList;
