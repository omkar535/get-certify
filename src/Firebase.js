import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAvgW5US1l1bpOxfer6fUnnBRLQWLw_MsA",
  authDomain: "get-certify.firebaseapp.com",
  databaseURL: "https://get-certify-default-rtdb.firebaseio.com",
  projectId: "get-certify",
  storageBucket: "get-certify.firebasestorage.app",
  messagingSenderId: "981649877617",
  appId: "1:981649877617:web:56481f16cd9f55894649d0",
  measurementId: "G-QC7WXR4XH5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth, collection, getDocs, addDoc, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut };
