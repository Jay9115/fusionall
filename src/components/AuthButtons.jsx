import React from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from './firebase'; // Import from your firebase setup
import { doc, setDoc, getDoc, getDocs, collection } from 'firebase/firestore'; // Firestore functions

function AuthButtons() {
    const [user] = useAuthState(auth);

    // Function to prompt user for a unique username after signing in
    const promptForUniqueUsername = async () => {
        const user = auth.currentUser;
        const userRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            // Ask for a username if it's a new user
            let username = prompt("Please enter a unique username:");

            // Check if the username already exists
            const usersRef = collection(firestore, "users");
            const querySnapshot = await getDocs(usersRef);
            const usernames = querySnapshot.docs.map(doc => doc.data().username);

            while (usernames.includes(username)) {
                username = prompt("Username already taken. Please choose another:");
            }

            // Save the new user's data with the unique username
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                username: username,
                friends: [] // Initialize empty friends list
            });
        }
    };

    // Function to handle sign-in with Google
    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);

        // After signing in, prompt the user for a unique username
        promptForUniqueUsername();
    };

    // Function to handle sign-out
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
