import React, { useEffect, useState } from 'react';
import { auth, firestore } from './firebase'; // Import Firebase setup
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

function BlogList() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="blog-list">
            <h2>Posted Blogs</h2>
            {loading ? (
                <p>Loading blogs...</p>
            ) : blogs.length === 0 ? (
                <p>No blogs posted yet.</p>
            ) : (
                blogs.map((blog) => (
                    <div key={blog.id} className="blog-post">
                        <h3>{blog.title}</h3>
                        <p>{blog.content}</p>
                        <p className="blog-date">Posted on: {new Date(blog.date?.seconds * 1000).toLocaleString()}</p>
                    </div>
                ))
            )}
        </div>
    );
}

export default BlogList;
