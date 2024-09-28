import React, { useEffect, useState } from 'react';
import { collection, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { firestore, auth } from './firebase';

function FriendRequests() {
    const [requests, setRequests] = useState([]);
    const currentUser = auth.currentUser;

    useEffect(() => {
        const fetchRequests = async () => {
            if (currentUser) {
                const userDocRef = doc(firestore, 'users', currentUser.uid);
                const userSnapshot = await getDoc(userDocRef); // Use getDoc instead of getDocs

                if (userSnapshot.exists()) {
                    const userData = userSnapshot.data();
                    if (userData && userData.friendRequestsReceived) {
                        setRequests(userData.friendRequestsReceived);
                    }
                } else {
                    console.log('No such document!');
                }
            }
        };

        fetchRequests();
    }, [currentUser]);

    const acceptRequest = async (friendUid) => {
        const userRef = doc(firestore, 'users', currentUser.uid);
        const friendRef = doc(firestore, 'users', friendUid);

        // Update current user to add friend and remove the request
        await updateDoc(userRef, {
            friends: arrayUnion(friendUid),
            friendRequestsReceived: arrayRemove(friendUid),
        });

        // Update friend to add you as a friend
        await updateDoc(friendRef, {
            friends: arrayUnion(currentUser.uid),
            friendRequestsSent: arrayRemove(currentUser.uid),
        });

        // Optionally, remove the request from the state
        setRequests((prevRequests) => prevRequests.filter((uid) => uid !== friendUid));
    };

    return (
        <div>
            <h3>Friend Requests</h3>
            {requests.length > 0 ? (
                requests.map((friendUid) => (
                    <div key={friendUid} className="friend-request">
                        <span>{friendUid}</span> {/* Replace with actual username if needed */}
                        <button onClick={() => acceptRequest(friendUid)}>Accept</button>
                    </div>
                ))
            ) : (
                <p>No friend requests.</p>
            )}
        </div>
    );
}

export default FriendRequests;
