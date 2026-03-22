// lib/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ข้อมูลชุดนี้คุณจะได้มาจากหน้า Console ของ Firebase (Project Settings)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// ป้องกันการ Initialize ซ้ำซ้อน
let app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// ตัวแปร db นี้เราจะเอาไว้ใช้ "คุย" กับฐานข้อมูลเพื่อเก็บงานซ่อม
export const db = getFirestore(app);
