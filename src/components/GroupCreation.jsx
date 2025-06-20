import React, { useState } from 'react';
import FriendsList from './FriendsList';

function GroupCreation({ createGroup, closeModal }) {
    const [groupName, setGroupName] = useState('');
    const [selectedFriends, setSelectedFriends] = useState([]);

    const handleCreate = () => {
        if (!groupName || selectedFriends.length === 0) {
            alert("Group name and at least one friend are required.");
            return;
        }
        createGroup(groupName, selectedFriends);
        setGroupName('');
        setSelectedFriends([]);
        closeModal();
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
            <button onClick={handleCreate} disabled={!groupName || selectedFriends.length === 0}>
                Create Group
            </button>
        </div>
    );
}

export default GroupCreation;