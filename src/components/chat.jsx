import React, { useRef, useState, useEffect } from 'react';
import './chat.css';
import { collection, addDoc, orderBy, query, onSnapshot, serverTimestamp, doc, getDoc } from 'firebase/firestore';
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFriends = async () => {
            const currentUser = auth.currentUser;
            if (currentUser) {
                const userDocRef = doc(firestore, 'users', currentUser.uid);
                const userSnapshot = await getDoc(userDocRef);

                if (userSnapshot.exists()) {
                    const userData = userSnapshot.data();
                    setFriends(userData.friends || []);
                }
            }
            setLoading(false);
        };

        fetchFriends();
    }, []);

    return (
        <div className="friends-list">
            <h3>Your Friends</h3>
            {loading ? (
                <p>Loading friends...</p>
            ) : friends.length > 0 ? (
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
            if (friendSnapshot.exists()) {
                setFriendData(friendSnapshot.data());
            }
        };

        fetchFriendData();
    }, [friendUid]);

    if (!friendData) return <p>Loading...</p>;

    return (
        <div className="friend-item" onClick={() => setSelectedFriend(friendData)}>
            <img
                src={friendData.photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'}
                alt={`${friendData.username}'s avatar`}
                className="friend-avatar"
            />
            <p>{friendData.username}</p>
        </div>
    );
}

function PrivateChat({ friend, setSelectedFriend }) {
    const currentUser = auth.currentUser;
    const dummy = useRef();
    const [formValue, setFormValue] = useState('');
    const [messages, setMessages] = useState([]);
    const chatId = [currentUser.uid, friend.uid].sort().join('_');

    useEffect(() => {
        const messagesRef = collection(firestore, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('timestamp'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const messagesData = [];
            querySnapshot.forEach((doc) => {
                messagesData.push(doc.data());
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

    return (
        <div className="chat-page">
            {/* Header */}
            <header>
                <div className="header-container">
                    {/* Back Button */}
                    <h3>{friend.username}</h3>
                </div>
            </header>

            {/* Main Chat Content */}
            <main>
                {messages.length > 0 ? (
                    messages.map((msg, idx) => <ChatMessage key={idx} message={msg} />)
                ) : (
                    <p>No messages yet. Start the conversation!</p>
                )}
                <span ref={dummy}></span>
            </main>

            {/* Message Input */}
            <form onSubmit={sendMessage}>
                <input
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder="Type a message"
                />
                <button type="submit" disabled={!formValue.trim()}>
                    Send
                </button>
                
                <button className="back-button" onClick={() => setSelectedFriend(null)}>
                        ←
                    </button>
            </form>
        </div>
    );
}

function ChatMessage({ message }) {
    const { text, sender, photoURL } = message;
    const messageClass = sender === auth.currentUser.uid ? 'sent' : 'received';

    return (
        <div className={`message ${messageClass}`}>
            <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="User Avatar" />
            <p>{text}</p>
        </div>
    );
}

export default Chat;
