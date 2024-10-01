import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore, auth } from './firebase'; // Import your firebase setup
import FriendsList from './FriendsList'; // Import the FriendsList component

function GroupCreation() {
    const [groupName, setGroupName] = useState('');
    const [selectedFriends, setSelectedFriends] = useState([]);

    const createGroup = async () => {
        if (!groupName || selectedFriends.length === 0) {
            alert("Group name and at least one friend are required.");
            return;
        }

        const currentUser = auth.currentUser;
        const groupMembers = [currentUser.uid, ...selectedFriends]; // Include the creator in the group

        try {
            const groupRef = await addDoc(collection(firestore, 'groups'), {
                groupName,
                groupMembers,
                createdAt: serverTimestamp(),
                createdBy: currentUser.uid,
            });

            console.log('Group created with ID:', groupRef.id);
            setGroupName('');
            setSelectedFriends([]);
        } catch (error) {
            console.error('Error creating group:', error);
        }
    };

    return (
        <div className="group-creation">
            <h2>Create a New Group</h2>
            <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
            />
            <FriendsList selectedFriends={selectedFriends} setSelectedFriends={setSelectedFriends} />

            <button onClick={createGroup} disabled={!groupName || selectedFriends.length === 0}>
                Create Group
            </button>
        </div>
    );
}

export default GroupCreation;
