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
  apiKey: "AIzaSyC9z5TmK1aJUulrEIscwe9MZ5qcusJMOpc",
    authDomain: "blueflare-47c29.firebaseapp.com",
    projectId: "blueflare-47c29",
    storageBucket: "blueflare-47c29.firebasestorage.app",
    messagingSenderId: "348839866641",
    appId: "1:348839866641:web:64fb433419c80c15dddcb0"};

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
