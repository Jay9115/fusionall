import React from 'react';

function GroupList({ groups, setSelectedGroup }) {
    return (
        <div className="group-list">
            <h3>Your Groups</h3>
            {groups.length > 0 ? (
                groups.map(group => (
                    <div key={group.id} onClick={() => setSelectedGroup(group)}>
                        <img src={group.avatarURL || 'https://via.placeholder.com/35'} alt="Group Avatar" />
                        <p>{group.groupName}</p>
                    </div>
                ))
            ) : (
                <p>No groups available.Create one using the + button.</p>
            )}
        </div>
    );
}

export default GroupList;