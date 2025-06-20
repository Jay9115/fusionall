import React, { useState } from 'react';
import './Content.css';

const Content = ({ activePage }) => {
  return (
    <div className="content">
      <div id="Home" className="page-section" style={{ display: activePage === 'Home' ? 'block' : 'none' }}>
        <h2>Home Page</h2>
        <p>Welcome to the Home page of Fusion All.</p>
      </div>

      <div id="Chat" className="page-section" style={{ display: activePage === 'Chat' ? 'block' : 'none' }}>
        <h2>Chat Feature</h2>
        <p>This section could display recent chats, messages, or chat-related options. Customize this area to fit your needs.</p>
      </div>

      <div id="Groups" className="page-section" style={{ display: activePage === 'Groups' ? 'block' : 'none' }}>
        <h2>Groups Page</h2>
        <p>Manage and interact with your groups here.</p>
      </div>
    </div>
  );
};

export default Content;
