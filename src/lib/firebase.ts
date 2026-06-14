import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs, getDocFromServer, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error: any) {
        if (error.code === 'auth/popup-closed-by-user') {
            console.warn("User closed the Google login popup.");
            return null;
        }
        console.error("Error signing in with Google", error);
        throw error;
    }
};

export const saveHighScore = async (userId: string, username: string, score: number) => {
    const scoreRef = doc(db, 'leaderboard', userId);
    const snap = await getDoc(scoreRef);
    
    if (!snap.exists() || snap.data().score < score) {
        await setDoc(scoreRef, {
            userId,
            username,
            score,
            updatedAt: serverTimestamp()
        });
    }
};

export const getLeaderboard = async (count = 10) => {
    const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(count));
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data());
};

// Test connection as required by constraints
async function testConnection() {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if(error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration.");
      }
    }
}
testConnection();
