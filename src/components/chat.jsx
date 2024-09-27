import React, { useRef, useState } from 'react';
import './chat.css';

import { limit } from 'firebase/firestore'; // Add this import
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyB74vfpig6_klue_2fXCk_lCeG4ftn-XFc",
    authDomain: "fusionall360.firebaseapp.com",
    projectId: "fusionall360",
    storageBucket: "fusionall360.appspot.com",
    messagingSenderId: "17521252253",
    appId: "1:17521252253:web:c2f2f42eedace970dc4174",
    measurementId: "G-T7E810GBD7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

function Chat() {
    const [user] = useAuthState(auth);

    return (
        <div className="App">
            <header>
                <h1>⚛️🔥💬</h1>
                <SignOut />
            </header>

            <section>
                {user ? <ChatRoom /> : <SignIn />}
            </section>
        </div>
    );
}

function SignIn() {
    const signInWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider);
    };

    return (
        <>
            <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
            <p>Do not violate the community guidelines or you will be banned for life!</p>
        </>
    );
}

function SignOut() {
    return auth.currentUser && (
        <button className="sign-out" onClick={() => signOut(auth)}>Sign Out</button>
    );
}

function ChatRoom() {
    const dummy = useRef();
    const messagesRef = collection(firestore, 'messages');
    const q = query(messagesRef, orderBy('createdAt'), limit(25));

    const [messages] = useCollectionData(q, { idField: 'id' });
    const [formValue, setFormValue] = useState('');

    const sendMessage = async (e) => {
        e.preventDefault();

        const { uid, photoURL } = auth.currentUser;

        await addDoc(messagesRef, {
            text: formValue,
            createdAt: serverTimestamp(),
            uid,
            photoURL
        });

        setFormValue('');
        dummy.current.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <>
            <main>
                {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
                <span ref={dummy}></span>
            </main>

            <form onSubmit={sendMessage}>
                <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />
                <button type="submit" disabled={!formValue}>🕊️</button>
            </form>
        </>
    );
}

function ChatMessage(props) {
    const { text, uid, photoURL } = props.message;
    const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

    return (
        <div className={`message ${messageClass}`}>
            <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="Avatar" />
            <p>{text}</p>
        </div>
    );
}

export default Chat;
