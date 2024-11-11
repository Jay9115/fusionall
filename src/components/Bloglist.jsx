import React from 'react';

function BlogList({ blogs }) {
  return (
    <div className="blog-list">
      <h2>Posted Blogs</h2>
      {blogs.length === 0 ? (
        <p>No blogs posted yet.</p>
      ) : (
        blogs.map((blog, index) => (
          <div key={index} className="blog-post">
            <h3>{blog.title}</h3>
            <p>{blog.content}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default BlogList;
