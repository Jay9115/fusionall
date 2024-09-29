import React, { useEffect, useState } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { firestore, auth } from './firebase';

function FriendRequests() {
    const [requests, setRequests] = useState([]);
    const currentUser = auth.currentUser;

    useEffect(() => {
        const fetchRequests = async () => {
            if (currentUser) {
                const userDocRef = doc(firestore, 'users', currentUser.uid);
                const userSnapshot = await getDoc(userDocRef);

                if (userSnapshot.exists()) {
                    const userData = userSnapshot.data();
                    if (userData && userData.friendRequestsReceived) {
                        // Fetch usernames for each UID
                        const friendRequestsWithNames = await Promise.all(
                            userData.friendRequestsReceived.map(async (friendUid) => {
                                const friendDocRef = doc(firestore, 'users', friendUid);
                                const friendSnapshot = await getDoc(friendDocRef);
                                if (friendSnapshot.exists()) {
                                    const friendData = friendSnapshot.data();
                                    return { uid: friendUid, username: friendData.username }; // Assuming 'username' is a field in the 'users' collection
                                }
                                return { uid: friendUid, username: 'Unknown' };
                            })
                        );
                        setRequests(friendRequestsWithNames);
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
        setRequests((prevRequests) => prevRequests.filter((request) => request.uid !== friendUid));
    };

    return (
        <div>
            <h3>Friend Requests</h3>
            {requests.length > 0 ? (
                requests.map((request) => (
                    <div key={request.uid} className="friend-request">
                        <span>{request.username}</span> {/* Display username instead of UID */}
                        <button onClick={() => acceptRequest(request.uid)}>Accept</button>
                    </div>
                ))
            ) : (
                <p>No friend requests.</p>
            )}
        </div>
    );
}

export default FriendRequests;
