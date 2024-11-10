// PrivateChat.js
import React, { useRef, useState, useEffect } from 'react';
import { collection, addDoc, orderBy, query, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, firestore } from './firebase';

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
        <>
            <header>
                <button className="back-button" onClick={() => setSelectedFriend(null)}>
                    ←
                </button>
                <h3>Chat with {friend.username}</h3>
            </header>
            
            <main>
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

export default PrivateChat;
