import React from 'react';
import './AuthButtons.css';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';

function AuthButtons() {
    const [user] = useAuthState(auth);

    // Function to handle sign-in with Google
    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Send user info to backend
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                uid: user.uid,
                email: user.email,
                username: user.displayName // or prompt for a username if needed
            })
        });

        if (!response.ok) {
            const data = await response.json();
            alert(data.error || 'Registration failed');
        }
    };

    // Function to handle sign-out
    const signOutUser = () => {
        signOut(auth);
    };

    return (
        <div className="auth-buttons-container">
            {user ? (
                <button className="auth-btn auth-sign-out" onClick={signOutUser}>Sign Out</button>
            ) : (
                <button className="auth-btn auth-sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
            )}
        </div>
    );
}

export default AuthButtons;
