// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

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

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export default app;
