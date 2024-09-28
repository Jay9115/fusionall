import React from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';  // Import from the new file

function AuthButtons() {
    const [user] = useAuthState(auth);

    const signInWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider);
    };

    const signOutUser = () => {
        signOut(auth);
    };

    return (
        <div>
            {user ? (
                <button className="sign-out" onClick={signOutUser}>Sign Out</button>
            ) : (
                <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
            )}
        </div>
    );
}

export default AuthButtons;
