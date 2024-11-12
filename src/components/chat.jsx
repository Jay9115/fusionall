import React, { useRef, useState, useEffect } from 'react';
import './chat.css';
import { collection, addDoc, orderBy, query, onSnapshot, serverTimestamp, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from './firebase';
import AuthButtons from "./AuthButtons";

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

  return (
    <div className="friends-list">
      <h3>Your Friends</h3>
      {friends.length > 0 ? (
        friends.map((friendUid) => (
          <FriendItem key={friendUid} friendUid={friendUid} setSelectedFriend={setSelectedFriend} />
        ))
      ) : (
        <p>No friends yet. Add some!</p>
      )}
    </div>
  );
}

function FriendItem({ friendUid, setSelectedFriend }) {
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
    <div className="friend-item" onClick={() => setSelectedFriend(friendData)}>
      <img
        src={friendData?.photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'}
        alt={`${friendData?.username}'s avatar`}
        className="friend-avatar"
      />
      <p>{friendData?.username || 'Loading...'}</p>
    </div>
  );
}

function PrivateChat({ friend, setSelectedFriend }) {
  const currentUser = auth.currentUser;
  const dummy = useRef();
  const [formValue, setFormValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const chatId = [currentUser.uid, friend.uid].sort().join('_');

  useEffect(() => {
    const messagesRef = collection(firestore, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesData = [];
      querySnapshot.forEach((doc) => {
        messagesData.push({ id: doc.id, ...doc.data() });
      });
      setMessages(messagesData);
      dummy.current.scrollIntoView({ behavior: 'smooth' });
    });

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = currentUser;

    await addDoc(collection(firestore, 'chats', chatId, 'messages'), {
      text: formValue,
      timestamp: serverTimestamp(),
      sender: uid,
      photoURL,
    });

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    setSelectedMessages([]);
  };

  const toggleSelectMessage = (id) => {
    setSelectedMessages((prev) =>
      prev.includes(id) ? prev.filter((msgId) => msgId !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    for (const messageId of selectedMessages) {
      await deleteDoc(doc(firestore, 'chats', chatId, 'messages', messageId));
    }
    setSelectedMessages([]);
    setSelectMode(false);
  };

  return (
    <>
      <header>
        <h3>Chat with {friend.username}</h3>
        
        <div className="options">
        <button className="back-buttons" onClick={() => setSelectedFriend(null)}>Back</button>
          <button className="back-buttons" onClick={toggleSelectMode}>⋮</button>
          {selectMode && (
            <div className="dropdown">
              <button onClick={handleDeleteSelected} disabled={selectedMessages.length === 0}>
                Delete 
              </button>
              <button onClick={toggleSelectMode}>Cancel</button>
            </div>
          )}
        </div>
      </header>
      
      <main>
       
      
        
        {messages && messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            chatId={chatId}
            selectMode={selectMode}
            selected={selectedMessages.includes(msg.id)}
            onSelect={() => toggleSelectMessage(msg.id)}
          />
        ))}
        
        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Type a message"
        />
        <button type="submit" disabled={!formValue}>
          Send
        </button>
      </form>
    </>
  );
}

function ChatMessage({ message, selectMode, selected, onSelect }) {
  const { text, sender, photoURL } = message;
  const messageClass = sender === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass} ${selected ? 'selected' : ''}`} onClick={selectMode ? onSelect : null}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="Avatar" />
      <p>{text}</p>
      {selectMode && (
        <input type="checkbox" checked={selected} readOnly />
      )}
    </div>
  );
}

export default Chat;
