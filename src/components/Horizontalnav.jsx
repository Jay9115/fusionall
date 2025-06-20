import React, { useState } from 'react';
import { auth } from './firebase';
import FriendRequests from './FriendRequests';
import './Horizontalnav.css';
import logox from "./logo.svg";

const HorizontalNav = () => {
    const [dark, setDark] = useState(() => {
        // Persist theme in localStorage
        return localStorage.getItem('theme') === 'dark';
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const currentUser = auth.currentUser;
    const toggleDarkMode = () => {
        setDark((prev) => {
            const newTheme = !prev;
            document.body.classList.toggle('dark', newTheme);
            document.documentElement.classList.toggle('dark', newTheme);
            localStorage.setItem('theme', newTheme ? 'dark' : 'light');
            return newTheme;
        });
    };
    const handleSearchChange = async (e) => {
        const searchValue = e.target.value;
        setSearchTerm(searchValue);

        if (searchValue && currentUser) {
            const res = await fetch(
                `http://localhost:5000/api/auth/search?username=${encodeURIComponent(searchValue)}&excludeUid=${currentUser.uid}`
            );
            if (res.ok) {
                const results = await res.json();
                setSearchResults(results);
            }
        } else {
            setSearchResults([]);
        }
    };

    const sendFriendRequest = async (friendUid) => {
        if (!currentUser) return;
        const response = await fetch('http://localhost:5000/api/friends/requests/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fromUid: currentUser.uid,
                toUid: friendUid
            })
        });
        if (response.ok) {
            alert('Friend request sent!');
        } else {
            alert('Failed to send friend request.');
        }
    };

    return (
        <nav className="horizontal-nav" id="horizontal-nav">
            {/* Left side: Brand Name with Logo */}
            <div className="brand-name" onClick={() => window.location.href = '/'}>
                <h3><b>FusionAll</b></h3>
                <img src={logox} alt="icon" className="logo-after-name" />
            </div>

            {/* Center section: Search and Notification */}
            <div className="center-section">
                <div className="search-container">
                    <input
                        type="text"
                        id="search"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    {searchTerm && (
                        <div className="search-results">
                            {searchResults.map((result, index) => (
                                <div key={index} className="search-result-item">
                                    <span>{result.username}</span>
                                    <button onClick={() => sendFriendRequest(result.uid)}>Add Friend</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <button
                    className="dark-toggle-btn"
                    onClick={toggleDarkMode}
                    title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    style={{
                        marginLeft: 16,
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5em',
                        cursor: 'pointer',
                        color: 'var(--color-nav-text)'
                    }}
                >
                    {dark ? '🌙' : '☀️'}
                </button>
                <div className="notification-containr">
                    <FriendRequests />
                </div>
            </div>
        </nav>
    );
};

export default HorizontalNav;