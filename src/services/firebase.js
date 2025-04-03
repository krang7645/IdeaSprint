// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// Firebaseプロジェクト設定
// 実際のプロジェクトでは.envファイルに保存することを推奨
const firebaseConfig = {
  apiKey: "AIzaSyBZF9V3lLaphhgMPbOKhPYY2lPaA_RJMrc",
  authDomain: "ideasprint-6cd60.firebaseapp.com",
  projectId: "ideasprint-6cd60",
  storageBucket: "ideasprint-6cd60.firebasestorage.app",
  messagingSenderId: "373203500108",
  appId: "1:373203500108:web:c421cea6d47314e56908e9",
  measurementId: "G-N6CY7LJZ7X"
};

// Firebaseの初期化
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

export default app;
