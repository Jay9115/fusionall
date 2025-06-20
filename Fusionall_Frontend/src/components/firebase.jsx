import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

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

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { auth };
