import React, { useEffect, useState } from 'react';
import { firestore } from './firebase'; // Import Firebase setup
import { collectionGroup, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore';

function BlogList() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedBlogId, setExpandedBlogId] = useState(null);

    useEffect(() => {
        // Fetch all blogs
        const allBlogsRef = collectionGroup(firestore, 'BlogEntries');
        const q = query(allBlogsRef, orderBy('date', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const blogsData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setBlogs(blogsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleToggle = (blogId) => {
        // Toggle blog expansion
        setExpandedBlogId((prevId) => (prevId === blogId ? null : blogId));
    };

    const handleDelete = async (blogId) => {
        const blogRef = doc(firestore, 'BlogEntries', blogId);

        try {
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
                                    Author: {blog.authorId}
                                </p>
                                <p className="blog-date">
                                    Posted on: {new Date(blog.date?.seconds * 1000).toLocaleString()}
                                </p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent toggling when clicking delete
                                        handleDelete(blog.id);
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
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}

export default BlogList;
