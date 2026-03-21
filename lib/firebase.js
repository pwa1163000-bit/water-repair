import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCSxPH0J-xTtg5w_qUPsvcxQM1yyzNiNvU",
  authDomain: "water-repair-5638a.firebaseapp.com",
  projectId: "water-repair-5638a",
  storageBucket: "water-repair-5638a.firebasestorage.app",
  messagingSenderId: "540947914242",
  appId: "1:540947914242:web:988469a2c49fd9d927d11b",
  measurementId: "G-47JTL7C6X0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
