import React, { useRef, useState, useEffect } from 'react';
import './chat.css';
import { collection, addDoc, orderBy, query, onSnapshot, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from './firebase';
import AuthButtons from "./AuthButtons";


function Chat() {
     // Selected friend's private chat
     const [user] = useAuthState(auth);
     const [selectedFriend, setSelectedFriend] = useState(null);
    return (
        <div className="App">
        
            <section>
            
                {user ? (
                    selectedFriend ? (
                        <PrivateChat friend={selectedFriend} />
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

// Component to display the user's friends
function FriendsList({ setSelectedFriend }) {
    const [friends, setFriends] = useState([]);

    useEffect(() => {
        const fetchFriends = async () => {
            const currentUser = auth.currentUser;
            if (currentUser) {
                const userDocRef = doc(firestore, 'users', currentUser.uid);
                const userSnapshot = await getDoc(userDocRef); // Use `getDoc` for a single document

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

// Component to display each friend's name
// Updated FriendItem component to display avatar photo
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
            {/* Display avatar photo */}
            <img

                src={friendData?.photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} // Use a placeholder if photoURL is not available
                alt={`${friendData?.username}'s avatar`}
                className="friend-avatar"
            />
            <p>{friendData?.username || 'Loading...'}</p>
        </div>
    );
}


// Private chat component between the current user and a friend
function PrivateChat({ friend }) {
    const currentUser = auth.currentUser;
    const dummy = useRef();
    const [formValue, setFormValue] = useState('');
    const [messages, setMessages] = useState([]);

    // Create a consistent chatId using both users' UIDs
    const chatId = [currentUser.uid, friend.uid].sort().join('_'); // Sorting ensures both user UIDs form the same chatId

    // Fetch chat messages between the current user and the selected friend
    useEffect(() => {
        const messagesRef = collection(firestore, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('timestamp'));

        // Real-time listener for chat messages
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const messagesData = [];
            querySnapshot.forEach((doc) => {
                messagesData.push(doc.data());
            });
            setMessages(messagesData); // Set the fetched messages to state
            dummy.current.scrollIntoView({ behavior: 'smooth' }); // Scroll to the bottom when new messages are received
        });

        // Clean up the listener when the component is unmounted
        return () => unsubscribe();
    }, [chatId]);

    const sendMessage = async (e) => {
        e.preventDefault();

        const { uid, photoURL } = currentUser;

        // Add the new message to Firestore
        await addDoc(collection(firestore, 'chats', chatId, 'messages'), {
            text: formValue,
            timestamp: serverTimestamp(),
            sender: uid,
            photoURL,
        });

        setFormValue(''); // Clear the message input field
        dummy.current.scrollIntoView({ behavior: 'smooth' }); // Scroll to the bottom after sending a message
    };

    return (
        <>
            <main>
                <h3>Chat with {friend.username}</h3>
                {messages && messages.map((msg, idx) => <ChatMessage key={idx} message={msg} />)}
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

// Component to render each chat message
function ChatMessage({ message }) {
    const { text, sender, photoURL } = message;
    const messageClass = sender === auth.currentUser.uid ? 'sent' : 'received';

    return (
        <div className={`message ${messageClass}`}>
            <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="Avatar" />
            <p>{text}</p>
            
        </div>
    );
}

export default Chat;
