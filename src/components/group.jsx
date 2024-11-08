import React, { useState, useEffect } from 'react';
import GroupList from './GroupList'; // List of groups component
import GroupChat from './GroupChat'; // Group chat component
import GroupCreation from './GroupCreation'; // Group creation modal
import { auth, firestore } from './firebase';
import './group.css';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'; // Firebase v9 functions

function Group() {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [showGroupModal, setShowGroupModal] = useState(false);

    // Fetch the user's groups from Firestore
    useEffect(() => {
        const fetchGroups = async () => {
            const currentUser = auth.currentUser;
            const groupRef = collection(firestore, 'groups');
            const groupQuery = query(groupRef, where('groupMembers', 'array-contains', currentUser.uid));
            const groupSnapshot = await getDocs(groupQuery);
            const userGroups = groupSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setGroups(userGroups);
        };

        fetchGroups();
    }, []);

    // Function to handle group creation
    const createGroup = async (groupName, selectedFriends) => {
        const currentUser = auth.currentUser;
        const groupData = {
            groupName,
            groupMembers: [...selectedFriends, currentUser.uid],
            createdAt: serverTimestamp(),
            createdBy: currentUser.uid
        };

        // Add group to Firestore
        const groupRef = collection(firestore, 'groups');
        const newGroupRef = await addDoc(groupRef, groupData);
        setGroups([...groups, { id: newGroupRef.id, ...groupData }]); // Update the group list
    };

    return (
        
        <div className="main-page-container">
            {/* Display list of groups if no group is selected */}
            {!selectedGroup && (
                <>
                    <GroupList groups={groups} setSelectedGroup={setSelectedGroup} />

                    {/* Plus symbol for opening the group creation modal */}
                    <button className="add-group-btn" onClick={() => setShowGroupModal(true)}>
                        +
                    </button>

                    {/* Group creation modal */}
                    {showGroupModal && (
                        <GroupCreation
                            friends={[]} // Pass friends list here
                            createGroup={createGroup}
                            closeModal={() => setShowGroupModal(false)}
                        />
                    )}
                </>
            )}

            {/* Display group chat if a group is selected */}
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
