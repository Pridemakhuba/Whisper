// ============================================================
// WhisperNet — Firebase + Firestore
//
// SETUP STEPS:
//   1. Go to https://console.firebase.google.com
//   2. Create a project (or use existing)
//   3. Add a Web app → copy the firebaseConfig object below
//   4. In Firebase console → Build → Firestore Database
//      → Create database → Start in TEST MODE → choose region
//   5. Paste your config values below
// ============================================================

import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  where,
  increment,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore'

// 🔧 REPLACE with your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyBEibQYOT6xtgQmoTmM0ejkXhGnxiD4gKU",
  authDomain: "whispernet-a36c7.firebaseapp.com",
  projectId: "whispernet-a36c7",
  storageBucket: "whispernet-a36c7.firebasestorage.app",
  messagingSenderId: "275222769224",
  appId: "1:275222769224:web:a1283e6e331e903a33327d"
};

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// ── Collection references ───────────────────────────────────
export const postsCol    = () => collection(db, 'posts')
export const commentsCol = () => collection(db, 'comments')
export const chatCol     = () => collection(db, 'chat_messages')
export const usersCol    = () => collection(db, 'users')

// Re-export Firestore helpers so other files don't need to import firebase directly
export {
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  where,
  increment,
  serverTimestamp,
  onSnapshot,
}
