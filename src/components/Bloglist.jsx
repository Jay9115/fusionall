import React, { useEffect, useState } from 'react';
import { auth, firestore } from './firebase'; // Import Firebase setup
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore';

function BlogList() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedBlogId, setExpandedBlogId] = useState(null); // State to track expanded blog

    useEffect(() => {
        const currentUser = auth.currentUser;

        if (!currentUser) {
            alert("Please log in to view your blogs.");
            return;
        }

        const userBlogsRef = collection(firestore, 'Blogs', currentUser.uid, 'BlogEntries');
        const q = query(userBlogsRef, orderBy('date', 'desc'));

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
        const currentUser = auth.currentUser;

        if (!currentUser) {
            alert("You must be logged in to delete blogs.");
            return;
        }

        const blogRef = doc(firestore, 'Blogs', currentUser.uid, 'BlogEntries', blogId);

        try {
            await deleteDoc(blogRef);
            alert("Blog deleted successfully.");
        } catch (error) {
            console.error("Error deleting blog: ", error);
            alert("Failed to delete the blog. Please try again.");
        }
    };

    return (
        <div className="blog-list">
            <h2>Posted Blogs</h2>
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
