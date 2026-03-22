// lib/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ข้อมูลชุดนี้คุณจะได้มาจากหน้า Console ของ Firebase (Project Settings)
const firebaseConfig = {
  apiKey: "AIzaSyCSxPH0J-xTtg5w_qUPsvcxQM1yyzNiNvU",
  authDomain: "water-repair-5638a.firebaseapp.com",
  projectId: "water-repair-5638a",
  storageBucket: "water-repair-5638a.firebasestorage.app",
  messagingSenderId: "540947914242",
  appId: "1:540947914242:web:988469a2c49fd9d927d11b",
};

// ป้องกันการ Initialize ซ้ำซ้อน
let app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// ตัวแปร db นี้เราจะเอาไว้ใช้ "คุย" กับฐานข้อมูลเพื่อเก็บงานซ่อม
export const db = getFirestore(app);
