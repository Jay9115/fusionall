import React, { useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { firestore, auth } from './firebase';
import FriendRequests from './FriendRequests';
import './Horizontalnav.css';
import logox from "./logo.svg";

const HorizontalNav = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const currentUser = auth.currentUser;

    const handleSearchChange = async (e) => {
        const searchValue = e.target.value;
        setSearchTerm(searchValue);

        if (searchValue) {
            const usersRef = collection(firestore, 'users');
            const q = query(usersRef, where('username', '>=', searchValue), where('username', '<=', searchValue + '\uf8ff'));
            const querySnapshot = await getDocs(q);

            const results = [];
            querySnapshot.forEach((doc) => {
                if (doc.data().uid !== currentUser.uid) {
                    results.push(doc.data());
                }
            });

            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    };

    const sendFriendRequest = async (friendUid) => {
        const userRef = doc(firestore, 'users', currentUser.uid);

        await updateDoc(userRef, {
            friendRequestsSent: arrayUnion(friendUid)
        });

        const friendRef = doc(firestore, 'users', friendUid);
        await updateDoc(friendRef, {
            friendRequestsReceived: arrayUnion(currentUser.uid)
        });

        alert('Friend request sent!');
    };

    return (
        <nav className="horizontal-nav" id="horizontal-nav">
            {/* Left side: Brand Name with Logo */}
            <div className="brand-name" onClick={() => window.location.href = '/'}>
                <h3><b>FusionAll</b></h3>
                <img src={logox} alt="icon" className="logo-after-name" /> {/* Logo positioned after the brand name */}
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
                <div className="notification-containr">
                    <FriendRequests />
                </div>
                
            </div>
        </nav>
    );
};

export default HorizontalNav;
