import React, { useState, useEffect, useRef } from 'react';
import { auth } from './firebase';

function GroupChat({ groupId }) {
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const dummy = useRef();

    useEffect(() => {
        const fetchMessages = async () => {
            const res = await fetch(`https://fusionall-bckend.onrender.com/api/groups/${groupId}/messages`);
            if (res.ok) {
                setMessages(await res.json());
            }
        };
        fetchMessages();
        // Optionally, set up polling or websockets for real-time updates
    }, [groupId]);

    const sendMessage = async (e) => {
        e.preventDefault();
        const { uid, photoURL } = auth.currentUser;
        const response = await fetch(`https://fusionall-bckend.onrender.com/api/groups/${groupId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: messageInput,
                sender: uid,
                photoURL
            })
        });
        if (response.ok) {
            setMessageInput('');
            // Re-fetch messages
            const res = await fetch(`https://fusionall-bckend.onrender.com/api/groups/${groupId}/messages`);
            if (res.ok) setMessages(await res.json());
        }
        if (dummy.current) dummy.current.scrollIntoView({ behavior: 'smooth' });
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