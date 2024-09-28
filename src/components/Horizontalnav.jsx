import React, { useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { firestore, auth } from './firebase'; // Ensure firebase config is properly imported
import FriendRequests from './FriendRequests';

const HorizontalNav = () => {
    const [searchTerm, setSearchTerm] = useState(''); // State for search term
    const [searchResults, setSearchResults] = useState([]); // State for search results
    const currentUser = auth.currentUser; // Get current logged-in user
    const [showRequests, setShowRequests] = useState(false); // State to toggle friend requests

    // Handle search input change
    const handleSearchChange = async (e) => {
        const searchValue = e.target.value;
        setSearchTerm(searchValue);

        if (searchValue) {
            // Query Firestore to find users by username
            const usersRef = collection(firestore, 'users');
            const q = query(usersRef, where('username', '>=', searchValue), where('username', '<=', searchValue + '\uf8ff'));
            const querySnapshot = await getDocs(q);

            const results = [];
            querySnapshot.forEach((doc) => {
                if (doc.data().uid !== currentUser.uid) { // Exclude the current user from results
                    results.push(doc.data());
                }
            });

            setSearchResults(results);
        } else {
            setSearchResults([]); // Clear results when search is empty
        }
    };

    // Handle sending a friend request
    const sendFriendRequest = async (friendUid) => {
        const userRef = doc(firestore, 'users', currentUser.uid);

        // Add the friend's UID to the current user's "friendRequestsSent" array
        await updateDoc(userRef, {
            friendRequestsSent: arrayUnion(friendUid)
        });

        // You could also update the other user's "friendRequestsReceived" array similarly
        const friendRef = doc(firestore, 'users', friendUid);
        await updateDoc(friendRef, {
            friendRequestsReceived: arrayUnion(currentUser.uid)
        });

        alert('Friend request sent!');
    };

    return (
        <nav className="horizontal-nav" id="horizontal-nav">
            <div className="logo"></div>
            <div className="brand-name">
                <h3><b>Fusion All</b></h3>
            </div>
            <div className="search-container">
                <input
                    type="text"
                    id="search"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <div className="search-results">
                    {searchResults.map((user) => (
                        <div key={user.uid} className="search-result-item">
                            <span>{user.username}</span>
                            <button onClick={() => sendFriendRequest(user.uid)}>Add Friend</button>
                        </div>
                    ))}
                </div>

               
                <button onClick={() => setShowRequests((prev) => !prev)}>
                {showRequests ? 'Hide Requests' : 'Show Friend Requests'}
            </button>
            {showRequests && <FriendRequests />} {/* Show friend requests when toggled */}

            </div>
            


        </nav>
    );
};

export default HorizontalNav;
