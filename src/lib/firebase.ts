import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId); 

// Connectivity check as per skill instructions
async function testConnection() {
  try {
    // Only try to connect if we are actually online
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    
    await getDocFromServer(doc(db, '_connection_test_', 'check'));
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      // This is actually a sign of life, just rules blocking us
      console.log("Firebase connection established (Rules active).");
    } else if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
      console.warn("Firebase is starting up or network is transiently offline.");
    } else {
      console.error("Firebase connection check failed:", error);
    }
  }
}

testConnection();
