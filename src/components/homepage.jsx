import React from 'react';
import { Link } from 'react-router-dom';
import './homepage.css'; // Import the specific CSS for the homepage

const Homepage = () => {
  return (
    <div className="welcome-container">
      <div className="welcome-message">Welcome to FusionAll!</div>
      <div className="welcome-subtext">Your hub for innovation and collaboration.</div>
    </div>
  );
};

export default Homepage;
