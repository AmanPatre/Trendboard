import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            await setDoc(userRef, {
                email: user.email,
                preferences: {
                    theme: 'dark',
                    emailNotifications: true,
                },
                createdAt: new Date(),
            });
        }

        return user;
    } catch (error) {
        console.error('Error signing in with Google', error);
        throw error;
    }
};

export const signUpWithEmail = async (email: string, pass: string) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, pass);
        const user = result.user;

        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
            email: user.email,
            preferences: {
                theme: 'dark',
                emailNotifications: true,
            },
            createdAt: new Date(),
        });

        return user;
    } catch (error) {
        console.error('Error signing up with email', error);
        throw error;
    }
};

export const signInWithEmail = async (email: string, pass: string) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, pass);
        return result.user;
    } catch (error) {
        console.error('Error signing in with email', error);
        throw error;
    }
};

export const signOut = async () => {
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error('Error signing out', error);
        throw error;
    }
};

