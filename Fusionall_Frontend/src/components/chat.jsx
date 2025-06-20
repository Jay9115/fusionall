import React, { useRef, useState, useEffect } from 'react';
import './chat.css';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import AuthButtons from "./AuthButtons";
import PrivateChat from "./PrivateChat";

function Chat() {
  const [user] = useAuthState(auth);
  const [selectedFriend, setSelectedFriend] = useState(null);

  return (
    <div className="App">
      <section>
        {user ? (
          selectedFriend ? (
            <PrivateChat friend={selectedFriend} setSelectedFriend={setSelectedFriend} />
          ) : (
            <FriendsList setSelectedFriend={setSelectedFriend} />
          )
        ) : (
          <AuthButtons />
        )}
      </section>
    </div>
  );
}

function FriendsList({ setSelectedFriend }) {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const fetchFriends = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const res = await fetch(`http://localhost:5000/api/friends/${currentUser.uid}`);
        if (res.ok) {
          const friendUids = await res.json();
          // Fetch friend details
          const friendDetails = await Promise.all(
            friendUids.map(async (uid) => {
              const userRes = await fetch(`http://localhost:5000/api/auth/${uid}`);
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

  return (
    <div className="friends-list">
      <h3>Your Friends</h3>
      {friends.length > 0 ? (
        friends.map((friend) => (
          <FriendItem key={friend.uid} friend={friend} setSelectedFriend={setSelectedFriend} />
        ))
      ) : (
        <p>No friends yet. Add some!</p>
      )}
    </div>
  );
}

function FriendItem({ friend, setSelectedFriend }) {
  return (
    <div className="friend-item" onClick={() => setSelectedFriend(friend)}>
      <img
        src={friend.photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'}
        alt={`${friend.username}'s avatar`}
        className="friend-avatar"
      />
      <p>{friend.username || 'Loading...'}</p>
    </div>
  );
}

export default Chat;