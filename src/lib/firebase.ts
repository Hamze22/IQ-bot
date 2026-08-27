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

// Initialize Firestore with robust auto-detect long polling for iframe & sandbox compatibility
let dbInstance;
try {
  const dbId = firebaseConfig.firestoreDatabaseId;
  const settings = {
    experimentalAutoDetectLongPolling: true,
  };
  dbInstance = dbId ? initializeFirestore(app, settings, dbId) : initializeFirestore(app, settings);
} catch (e) {
  dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
}

export const db = dbInstance;

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


