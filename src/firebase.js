// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection } from "firebase/firestore";
import { FirebaseConfig } from "./env.js"

const firebaseConfig = {
  apiKey: FirebaseConfig.FIREBASE_API_KEY,
  authDomain: FirebaseConfig.FIREBASE_AUTH_DOMAIN,
  projectId: FirebaseConfig.FIREBASE_PROJECT_ID,
  storageBucket: FirebaseConfig.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FirebaseConfig.FIREBASE_MESSAGING_SENDER_ID,
  appId: FirebaseConfig.FIREBASE_APP_ID,
  measurementId: FirebaseConfig.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const fireapp = initializeApp(firebaseConfig);
const auth = getAuth(fireapp);
const db = getFirestore(fireapp);

// Example: Accessing a Firestore collection
const formCollection = collection(db, FirebaseConfig.FIREBASE_COLLECTION_FORM);
const responseCollection = collection(db, FirebaseConfig.FIREBASE_COLLECTION_RESPONSES)

export { fireapp, auth, formCollection, responseCollection };
