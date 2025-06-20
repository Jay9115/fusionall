import React, { useState, useEffect } from 'react';
import GroupList from './GroupList';
import GroupChat from './GroupChat';
import GroupCreation from './GroupCreation';
import { auth } from './firebase';
import './group.css';

function Group() {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [showGroupModal, setShowGroupModal] = useState(false);

    // Fetch the user's groups from backend
    useEffect(() => {
        const fetchGroups = async () => {
            const currentUser = auth.currentUser;
            if (currentUser) {
                const res = await fetch(`http://localhost:5000/api/groups/user/${currentUser.uid}`);
                if (res.ok) {
                    setGroups(await res.json());
                }
            }
        };
        fetchGroups();
    }, []);

    // Function to handle group creation
    const createGroup = async (groupName, selectedFriends) => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        const groupData = {
            groupName,
            groupMembers: [...selectedFriends, currentUser.uid],
            createdBy: currentUser.uid
        };
        const response = await fetch('http://localhost:5000/api/groups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(groupData)
        });
        if (response.ok) {
            const newGroup = await response.json();
            setGroups([...groups, newGroup]);
        }
    };

    return (
        <div className="main-page-container">
            {!selectedGroup && (
                <>
                    <GroupList groups={groups} setSelectedGroup={setSelectedGroup} />
                    <button className="add-group-btn" onClick={() => setShowGroupModal(true)}>
                        +
                    </button>
                    {showGroupModal && (
                        <GroupCreation
                            createGroup={createGroup}
                            closeModal={() => setShowGroupModal(false)}
                        />
                    )}
                </>
            )}
            {selectedGroup && (
                <>
                    <button className="back-button" onClick={() => setSelectedGroup(null)}>
                        ← Back to Groups
                    </button>
                    <GroupChat groupId={selectedGroup.id} />
                </>
            )}
        </div>
    );
}

export default Group;