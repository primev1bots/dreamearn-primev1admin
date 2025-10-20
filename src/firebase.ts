// src/firebase.ts
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref as dbRef,
  onValue as dbOnValue,
  get as dbGet,
  set as dbSet,
} from "firebase/database";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQViyyJ2YGWRHwvaeP-2wwss505P9yWpo",
  authDomain: "dreamearn-bc61d.firebaseapp.com",
  databaseURL: "https://dreamearn-bc61d-default-rtdb.firebaseio.com",
  projectId: "dreamearn-bc61d",
  storageBucket: "dreamearn-bc61d.firebasestorage.app",
  messagingSenderId: "1017473190493",
  appId: "1:1017473190493:web:9b4d1bf15d3eba50875bb4",
  measurementId: "G-S06WMZWTDX"
};

// Initialize Firebase (ensure it's only initialized once)
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database & Storage
const database = getDatabase(app);
const storage = getStorage(app);

// Export everything you need
export {
  app,
  database,
  storage,
  dbRef as ref,
  dbOnValue as onValue,
  dbGet as get,
  dbSet as set,
};

export default app;
