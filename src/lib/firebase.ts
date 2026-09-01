import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore,
  getFirestore,
  setLogLevel,
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  query, 
  where,
  orderBy,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Suppress Firestore verbose connection/offline warnings
try {
  setLogLevel('error');
} catch (e) {
  // Ignore
}

// Initialize Firestore with robust force long polling for iframe & sandbox compatibility
let dbInstance;
try {
  const dbId = firebaseConfig.firestoreDatabaseId;
  const settings = {
    experimentalForceLongPolling: true,
    useFetchStreams: false,
  };
  dbInstance = dbId ? initializeFirestore(app, settings, dbId) : initializeFirestore(app, settings);
} catch (e) {
  dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
}

export const db = dbInstance;

// Test connection early as per skill guidelines
async function testConnection() {
  try {
    // Attempting to read a non-existent doc from server to force connection check
    await getDocFromServer(doc(db, '_internal_health_', 'connectivity'));
    console.log("Firestore connection verified.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Firestore connectivity issue: Please check your Firebase configuration or network.");
    } else {
      console.warn("Firestore connectivity test (expected miss):", error);
    }
  }
}
testConnection();

export { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  getDocFromServer,
  setLogLevel
};


