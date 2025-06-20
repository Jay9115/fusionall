import React, { useEffect, useState } from 'react';
import { auth } from './firebase';


function BlogList() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedBlogId, setExpandedBlogId] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            try {
                const res = await fetch('https://fusionall-bckend.onrender.com/api/blogs');
                const data = await res.json();
                setBlogs(data);
            } catch (error) {
                setBlogs([]);
            }
            setLoading(false);
        };

        const user = auth.currentUser;
        if (user) setCurrentUserId(user.uid);

        fetchBlogs();
    }, []);

    const handleToggle = (blogId) => {
        setExpandedBlogId((prevId) => (prevId === blogId ? null : blogId));
    };

    const handleDelete = async (blogId, blogPath) => {
        try {
            const response = await fetch('https://fusionall-bckend.onrender.com/api/blogs', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    blogPath,
                    authorId: currentUserId,
                    blogId
                }),
            });
            if (response.ok) {
                setBlogs(blogs.filter(blog => blog.id !== blogId));
                alert('Blog deleted successfully.');
            } else {
                alert('Failed to delete the blog. Please try again.');
            }
        } catch (error) {
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
                                fontSize: '1.2em',
                            }}
                            onClick={() => handleToggle(blog.id)}
                        >
                            {blog.title}
                        </h3>
                        {expandedBlogId === blog.id && (
                            <div>
                                <p
                                    className="blog-author"
                                    style={{
                                        margin: '5px 0',
                                        fontWeight: 'bold',
                                        fontSize: '0.8em',
                                    }}
                                >
                                    Author: {blog.authorName || 'Unknown'}
                                </p>
                                <p>{blog.content}</p>
                                <p
                                    className="blog-date"
                                    style={{ fontSize: '0.8em', color: '#555', marginTop: '10px' }}
                                >
                                    Posted on: {blog.date ? new Date(blog.date.seconds ? blog.date.seconds * 1000 : blog.date).toLocaleString() : ''}
                                </p>
                                {currentUserId === blog.authorId && (
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