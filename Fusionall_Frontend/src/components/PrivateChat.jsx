import React, { useRef, useState, useEffect } from 'react';
import { auth } from './firebase';

function PrivateChat({ friend, setSelectedFriend }) {
    const currentUser = auth.currentUser;
    const dummy = useRef();
    const [formValue, setFormValue] = useState('');
    const [messages, setMessages] = useState([]);
    const [selectMode, setSelectMode] = useState(false);
    const [selectedMessages, setSelectedMessages] = useState([]);
    const chatId = [currentUser.uid, friend.uid].sort().join('_');

    // Fetch messages from backend
    useEffect(() => {
        const fetchMessages = async () => {
            const res = await fetch(`https://fusionall-bckend.onrender.com/api/chat/messages/${currentUser.uid}/${friend.uid}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
                setTimeout(() => {
                    if (dummy.current) dummy.current.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        };
        fetchMessages();
        // Optionally, set up polling or websockets for real-time updates
    }, [chatId]);

    const sendMessage = async (e) => {
        e.preventDefault();
        const { uid, photoURL } = currentUser;

        const res = await fetch('https://fusionall-bckend.onrender.com/api/chat/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                senderUid: uid,
                receiverUid: friend.uid,
                text: formValue,
                photoURL,
            }),
        });
        if (res.ok) {
            setFormValue('');
            // Re-fetch messages
            const updated = await fetch(`https://fusionall-bckend.onrender.com/api/chat/messages/${currentUser.uid}/${friend.uid}`);
            if (updated.ok) setMessages(await updated.json());
            setTimeout(() => {
                if (dummy.current) dummy.current.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
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
        await fetch('https://fusionall-bckend.onrender.com/api/chat/messages', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                uid1: currentUser.uid,
                uid2: friend.uid,
                messageIds: selectedMessages,
            }),
        });
        // Re-fetch messages
        const updated = await fetch(`https://fusionall-bckend.onrender.com/api/chat/messages/${currentUser.uid}/${friend.uid}`);
        if (updated.ok) setMessages(await updated.json());
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

export default PrivateChat;