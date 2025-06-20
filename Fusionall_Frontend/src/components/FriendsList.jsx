import React, { useEffect, useState } from 'react';
import { auth } from './firebase';

function FriendsList({ selectedFriends = [], setSelectedFriends }) {
    const [friends, setFriends] = useState([]);

    useEffect(() => {
        const fetchFriends = async () => {
            const currentUser = auth.currentUser;
            if (currentUser) {
                const res = await fetch(`https://fusionall-bckend.onrender.com/api/friends/${currentUser.uid}`);
                if (res.ok) {
                    const friendUids = await res.json();
                    // Fetch friend details
                    const friendDetails = await Promise.all(
                        friendUids.map(async (uid) => {
                            const userRes = await fetch(`https://fusionall-bckend.onrender.com/api/auth/${uid}`);
                            if (userRes.ok) return await userRes.json();
                            return { uid, username: 'Unknown' };
                        })
                    );
                    setFriends(friendDetails);
                }
            }
        };
        fetchFriends();
    }, []);

    const toggleFriendSelection = (friendUid) => {
        if (!setSelectedFriends) return;
        if (selectedFriends.includes(friendUid)) {
            setSelectedFriends(selectedFriends.filter((uid) => uid !== friendUid));
        } else {
            setSelectedFriends([...selectedFriends, friendUid]);
        }
    };

    return (
        <div className="friends-list">
            <h3>Select Friends for Group</h3>
            {friends.length > 0 ? (
                friends.map((friend) => (
                    <FriendItem
                        key={friend.uid}
                        friend={friend}
                        isSelected={selectedFriends.includes(friend.uid)}
                        toggleFriendSelection={toggleFriendSelection}
                    />
                ))
            ) : (
                <p>No friends yet. Add some!</p>
            )}
        </div>
    );
}

function FriendItem({ friend, isSelected, toggleFriendSelection }) {
    return (
        <div
            className={`friend-item ${isSelected ? 'selected' : ''}`}
            onClick={() => toggleFriendSelection(friend.uid)}
        >
            <p>{friend.username || 'Loading...'}</p>
        </div>
    );
}

export default FriendsList;