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
    experimentalForceLongPolling: true, // Use long polling for sandbox stability
    useFetchStreams: false,
  };
  dbInstance = dbId ? initializeFirestore(app, settings, dbId) : initializeFirestore(app, settings);
} catch (e) {
  dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
}

export const db = dbInstance;

/**
 * Robust connection test that fails gracefully without blocking the UI
 */
async function testConnection() {
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Firestore connection timed out')), 5000)
  );

  try {
    // Attempting to read a non-existent doc from server to force connection check
    await Promise.race([
      getDocFromServer(doc(db, '_internal_health_', 'connectivity')),
      timeoutPromise
    ]);
    console.log("✓ Firestore connection verified.");
  } catch (error: any) {
    if (error.message === 'Firestore connection timed out' || error.message?.includes('the client is offline')) {
      console.warn("⚠️ Firestore is in offline mode. Changes will sync once connection is restored.");
    } else {
      // Common warning for the expected 404 miss on health check
      console.debug("Firestore connectivity heartbeat:", error.message);
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


