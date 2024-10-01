import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from './firebase'; // Import your firebase setup

function FriendsList({ selectedFriends, setSelectedFriends }) {
    const [friends, setFriends] = useState([]);

    useEffect(() => {
        const fetchFriends = async () => {
            const currentUser = auth.currentUser;
            if (currentUser) {
                const userDocRef = doc(firestore, 'users', currentUser.uid);
                const userSnapshot = await getDoc(userDocRef);

                if (userSnapshot.exists()) {
                    const userData = userSnapshot.data();
                    if (userData.friends) {
                        setFriends(userData.friends);
                    }
                }
            }
        };

        fetchFriends();
    }, []);

    const toggleFriendSelection = (friendUid) => {
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
                friends.map((friendUid) => (
                    <FriendItem
                        key={friendUid}
                        friendUid={friendUid}
                        isSelected={selectedFriends.includes(friendUid)}
                        toggleFriendSelection={toggleFriendSelection}
                    />
                ))
            ) : (
                <p>No friends yet. Add some!</p>
            )}
        </div>
    );
}

function FriendItem({ friendUid, isSelected, toggleFriendSelection }) {
    const [friendData, setFriendData] = useState(null);

    useEffect(() => {
        const fetchFriendData = async () => {
            const friendDocRef = doc(firestore, 'users', friendUid);
            const friendSnapshot = await getDoc(friendDocRef);
            setFriendData(friendSnapshot.data());
        };

        fetchFriendData();
    }, [friendUid]);

    return (
        <div
            className={`friend-item ${isSelected ? 'selected' : ''}`}
            onClick={() => toggleFriendSelection(friendUid)}
        >
            <p>{friendData?.username || 'Loading...'}</p>
        </div>
    );
}

export default FriendsList;
