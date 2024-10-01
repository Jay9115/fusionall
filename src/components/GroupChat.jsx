import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore, auth } from './firebase';

function GroupChat({ groupId }) {
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const dummy = useRef();

    useEffect(() => {
        const messagesRef = collection(firestore, 'groups', groupId, 'messages');
        const q = query(messagesRef, orderBy('timestamp'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messagesData = snapshot.docs.map(doc => doc.data());
            setMessages(messagesData);
        });

        return () => unsubscribe();
    }, [groupId]);

    const sendMessage = async (e) => {
        e.preventDefault();

        const { uid, photoURL } = auth.currentUser;
        await addDoc(collection(firestore, 'groups', groupId, 'messages'), {
            text: messageInput,
            timestamp: serverTimestamp(),
            sender: uid,
            photoURL,
        });

        setMessageInput('');
        dummy.current.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <>
            <div className="message-container">
                {messages.map((msg, idx) => (
                    <div key={idx} className={msg.sender === auth.currentUser.uid ? 'sent' : 'received'}>
                        <img src={msg.photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="Avatar" />
                        <p>{msg.text}</p>
                    </div>
                ))}
                <span ref={dummy}></span>
            </div>

            <form onSubmit={sendMessage}>
                <input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type your message here..."
                />
                <button type="submit">Send</button>
            </form>
        </>
    );
}

export default GroupChat;
